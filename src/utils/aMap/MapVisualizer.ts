/**
 * MapVisualizationManager.ts
 * 融合了 Loca GPU 加速渲染与 Canvas/LabelsLayer 高性能文字方案
 */
import { GRID_COLORS } from './mapColors';

// --- 类型定义 ---

export interface MapDataItem {
  lng: number;
  lat: number;
  count: number;
  id?: string | number;
  name?: string;
  color?: string;
  [key: string]: any;
}

export interface GridOptions {
  showText?: boolean;
  gridRadius?: number; // 单位：米
  minVisibleZoom?: number;
  opacity?: number;
  [key: string]: any;
}

const CACHED_GRID_COLORS = [...GRID_COLORS];

export class MapVisualizationManager {
  private map: AMap.Map | null;
  private loca: any; // Loca.Container
  private visualLayer: any | null = null; // 热力或网格图层 (Loca)
  private labelLayer: AMap.LabelsLayer | null = null; // 高性能文字图层

  private renderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(map: AMap.Map) {
    this.map = map;
    // 1. 初始化 Loca 容器 (GPU 加速核心)
    this.loca = new (window as any).Loca.Container({ map });

    this.initPlugins();
  }

  private initPlugins() {}

  // ==================== 热力图模块 (Loca 驱动) ====================

  /**
   * 渲染热力图 - 采用 Loca.HeatMapLayer 实现硬件加速
   */
  public async createHeatMap(data: MapDataItem[], radius = 20, maxThreshold?: number) {
    this.clearVisualLayers();
    if (!data.length) return;
    this.visualLayer = new (window as any).Loca.HeatMapLayer({
      zIndex: 10,
      opacity: 1,
      visible: true,
      zooms: [2, 22],
    });

    // 性能优化：单次循环获取最大值
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].count > max) max = data[i].count;
    }

    this.visualLayer.setSource(
      new (window as any).Loca.GeoJSONSource({ data: this.formatToGeoJson(data) }),
      {
        radius: radius * 2,
        unit: 'meter',
        gap: 0,
        gradient: {
          0.1: '#0000ff',
          0.5: '#00ff00',
          0.9: '#ffea00',
          1.0: '#ff0000',
        },
        value: (_: any, feat: any) => feat.properties.value,
        min: 0,
        max: maxThreshold || max || 100,
      },
    );

    this.loca.add(this.visualLayer);
  }

  // ==================== 网格图模块 (混合渲染) ====================

  /**
   * 渲染网格图
   * 视觉部分：Loca.GridLayer (GPU)
   * 文字部分：LabelsLayer (视口剔除 + 碰撞检测)
   */
  public createGridMap(data: MapDataItem[], options: GridOptions = {}) {
    this.clearVisualLayers();
    if (!data.length) return;

    const { showText = true, gridRadius = 1000, minVisibleZoom = 10, opacity = 0.8 } = options;

    this.visualLayer = new (window as any).Loca.GridLayer({
      zIndex: 10,
      opacity,
      visible: true,
      cullface: 'back',
    });

    const textBuffer: { center: number[]; count: number }[] = [];

    this.visualLayer.setSource(
      new (window as any).Loca.GeoJSONSource({
        data: this.formatToGeoJson(data),
      }),
    );

    this.visualLayer.setStyle({
      unit: 'meter',
      radius: gridRadius / 1.5,
      gap: 0,
      value: (_: any, feat: any) => {
        // 计算网格内聚合值
        const count = feat.coordinates.reduce(
          (sum: number, cur: any) => sum + (cur.properties?.value || 0),
          0,
        );
        if (showText && feat.center) {
          textBuffer.push({ center: feat.center, count });
        }
        return count;
      },
      topColor: (_: any, res: { max: number; value: number }) => {
        // 性能关键：移除 JSON.parse，直接通过索引映射颜色
        const ratio = res.value / (res.max || 1);
        const index = Math.min(Math.floor(ratio * 10), CACHED_GRID_COLORS.length - 1);
        return CACHED_GRID_COLORS[index];
      },
    });

    this.loca.add(this.visualLayer);

    // 如果需要显示文字，启动高性能 LabelsLayer 渲染
    if (showText) {
      this.renderGridLabels(textBuffer, minVisibleZoom);
    }
  }

  /**
   * 渲染高性能文字标签（带视口剔除逻辑）
   */
  private renderGridLabels(labels: any[], minZoom: number) {
    if (this.renderTimer) clearTimeout(this.renderTimer);

    this.renderTimer = setTimeout(() => {
      if (!this.map || this.map.getZoom() < minZoom) return;

      this.labelLayer = new AMap.LabelsLayer({
        zIndex: 120,
        collision: true, // 开启碰撞检测，防止文字重叠
        allowCollision: false,
      });
      const markers: AMap.LabelMarker[] = [];

      for (let i = 0; i < labels.length; i++) {
        const item = labels[i];
        // 【性能优化：视口剔除】只创建当前屏幕可见范围内的 Label
        markers.push(
          new AMap.LabelMarker({
            position: item.center,
            text: {
              content: String(item.count),
              direction: 'center',
              style: { fontSize: 11, fillColor: '#fff', strokeWidth: 0 },
            },
          }),
        );
      }

      this.labelLayer.add(markers);
      this.map.add(this.labelLayer);
    }, 150); // 150ms 防抖，避免地图缩放时频繁重绘
  }

  // ==================== 通用工具与清理 ====================

  /**
   * 格式化 GeoJSON (内部优化：减少闭包引用)
   */
  private formatToGeoJson(data: MapDataItem[]) {
    return {
      type: 'FeatureCollection',
      features: data.map((item) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
        properties: { value: item.count },
      })),
    };
  }

  /**
   * 仅清除可视化图层（切换模式用）
   */
  public clearVisualLayers() {
    if (this.visualLayer) {
      this.loca.remove(this.visualLayer);
      this.visualLayer.destroy();
      this.visualLayer = null;
    }
    if (this.labelLayer) {
      this.labelLayer.destroy();
      this.map?.remove(this.labelLayer);
      this.labelLayer = null;
    }
    if (this.renderTimer) clearTimeout(this.renderTimer);
  }

  /**
   * 销毁实例，彻底释放内存
   */
  public destroy() {
    this.clearVisualLayers();
    this.loca?.destroy();
  }
}
