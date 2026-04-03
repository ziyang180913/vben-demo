import { debounce } from 'lodash-es';
import utils from './icons';

/** --- 类型声明与接口 --- **/

export interface PoiData {
  id: string | number; // 建议必填，用于精准匹配围栏
  name: string;
  location: [number, number];
  color: string; // 默认颜色（点位背景及围栏填充）
  image: string; // 默认图标 Base64 或 URL
  path?: [number, number][] | [number, number][][]; // 围栏路径：单个[[lng, lat], ...] 或多个[[[lng, lat], ...], ...]
  zIndex?: number;
  [key: string]: any;
}

interface SelectedStyle {
  fontSize?: number;
  fontWeight?: string;
  fillColor?: string;
  padding?: [number, number];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface PoiMarkerOptions {
  iconSize?: [number, number];
  collision?: boolean;
  allowCollision?: boolean;
  isInfoStatus?: boolean; // 是否默认显示文字标签
  isClickable?: boolean; // 是否允许点击交互
  currentColor?: {
    image?: string; // 选中后的图标
    style?: SelectedStyle; // 选中后的文字/围栏样式
  };
}

/** --- POI 与 围栏管理类 --- **/

class PoiLayerManager {
  private map: AMap.Map;
  private labelsLayer: AMap.LabelsLayer | null = null;
  // 群组围栏
  private overlayGroup: AMap.OverlayGroup | null = null;
  private tooltipMarker: AMap.Marker;

  private data: PoiData[] = [];
  private backPosition: [number, number] | null = null;
  private selectedId: string | number | null = null;

  private options: Required<PoiMarkerOptions>;
  private isInfoStatus: boolean;
  private isLoadingPoi: boolean = false;

  private onSelectCallback: (data: any) => void = () => {};
  private debouncedMoveEnd: () => void;

  constructor(map: AMap.Map, options: PoiMarkerOptions = {}) {
    this.map = map;

    // 初始化配置
    this.options = {
      iconSize: options.iconSize || [18, 18],
      collision: options.collision ?? true,
      allowCollision: options.allowCollision ?? true,
      isInfoStatus: options.isInfoStatus ?? false,
      isClickable: options.isClickable ?? true,
      currentColor: {
        image: options.currentColor?.image || utils.getCircleIcon('#f45925'),
        style: {
          fontSize: 12,
          fontWeight: 'normal',
          fillColor: '#fff',
          padding: [5, 10],
          backgroundColor: '#f45925', // 选中后的主题色
          borderColor: '#fff',
          borderWidth: 1,
          ...options.currentColor?.style,
        },
      },
    };

    this.isInfoStatus = this.options.isInfoStatus;

    // 初始化 Tooltip 悬浮窗
    this.tooltipMarker = new AMap.Marker({
      zIndex: 9999,
      offset: new AMap.Pixel(0, -20),
      bubble: true,
    });

    this.debouncedMoveEnd = debounce(this.handleViewportUpdate.bind(this), 300);
  }

  /**
   * 初始化图层
   */
  public init(): void {
    // 初始化 LabelsLayer 用于渲染文字标签
    this.labelsLayer = new AMap.LabelsLayer({
      zIndex: 1000,
      collision: this.options.collision,
      allowCollision: this.options.allowCollision,
    });
    // labels 图层
    this.overlayGroup = new window.AMap.OverlayGroup(); // 群组围栏
    this.map.add(this.labelsLayer as any);
    this.map.add(this.overlayGroup);
    this.map.on('moveend', this.debouncedMoveEnd);
    this.map.on('zoomend', this.debouncedMoveEnd);
  }

  /**
   * 渲染入口：创建点位及围栏
   */
  public createPoiLayer(data: PoiData[], callback: (data: any) => void): void {
    this.data = data;
    this.onSelectCallback = callback;
    this.isLoadingPoi = true;
    this.renderAll();
  }

  /**
   * 视口更新处理
   */
  private handleViewportUpdate(): void {
    if (!this.isLoadingPoi) return;
    this.renderAll();
  }

  /**
   * 核心渲染逻辑 (包含点位与围栏)
   */
  private renderAll(): void {
    if (!this.labelsLayer || !this.overlayGroup) return;
    // 1. 清理现有图层
    this.labelsLayer.clear();
    this.clearPolygons();
    const bounds = this.map.getBounds();
    const labelMarkers: AMap.LabelMarker[] = [];
    const polygonMarkers: AMap.Polygon[] = [];
    this.data.forEach((item) => {
      // 性能优化：只渲染视口内的元素（围栏若大可适当放宽边界）
      if (!bounds.contains(item.location)) return;
      const isSelected = this.checkIsSelected(item);
      // 2. 渲染围栏 (Polygon)
      if (item.path && item.path.length > 0) {
        // 判断是否为单个围栏：第一个元素是数字（坐标对的第一位）
        const isSinglePath = typeof item.path[0][0] === 'number';
        // 统一转为数组的数组格式
        const paths = isSinglePath
          ? [item.path as [number, number][]]
          : (item.path as [number, number][][]);

        paths.forEach((path) => {
          const polygon = new AMap.Polygon({
            path,
            fillColor: isSelected ? this.options.currentColor.style.backgroundColor : item.color,
            fillOpacity: 0.35,
            strokeColor: isSelected ? this.options.currentColor.style.backgroundColor : item.color,
            strokeWeight: isSelected ? 3 : 2,
            strokeStyle: 'solid',
            zIndex: isSelected ? 150 : 100,
            bubble: true, // 允许事件穿透到下层或冒泡
            extData: item,
          });

          if (this.options.isClickable) {
            polygon.on('click', () => this.selectPosition(item.location, item));
          }
          polygonMarkers.push(polygon);
        });
      }

      // 3. 渲染点位 (LabelMarker)
      const marker = this.createLabelMarker(item, isSelected);
      labelMarkers.push(marker);
    });
    this.labelsLayer.add(labelMarkers);
    this.overlayGroup.addOverlays(polygonMarkers);
  }

  /**
   * 创建点位实例
   */
  private createLabelMarker(item: PoiData, isSelected: boolean): AMap.LabelMarker {
    const markerOptions: any = {
      position: item.location,
      zIndex: isSelected ? 999 : item.zIndex || 1,
      extData: item,
      rank: isSelected ? 999 : 1,
      icon: {
        type: 'image',
        image: (isSelected ? this.options.currentColor.image : item.image) as string,
        size: this.options.iconSize,
        anchor: 'center',
      },
    };

    if (this.isInfoStatus && item.name) {
      markerOptions.text = {
        content: ` ${item.name} `,
        direction: 'bottom',
        style: isSelected
          ? this.options.currentColor.style
          : {
              fontSize: 12,
              fontWeight: 'normal',
              fillColor: '#fff',
              padding: [5, 10],
              backgroundColor: item.color,
              borderColor: '#fff',
              borderWidth: 1,
            },
      };
    }

    const marker = new AMap.LabelMarker(markerOptions);

    // 事件绑定
    marker.on('mouseover', () => {
      this.tooltipMarker.setPosition(item.location);
      this.tooltipMarker.setContent(this.getTooltipHTML(item));
      this.map.add(this.tooltipMarker);
    });

    marker.on('mouseout', () => this.map.remove(this.tooltipMarker));

    marker.on('click', () => {
      if (this.options.isClickable) {
        this.selectPosition(item.location, item);
      }
    });

    return marker;
  }

  /**
   * 执行选中逻辑
   */
  public selectPosition(location: [number, number], rawData: PoiData): void {
    this.backPosition = location;
    this.selectedId = rawData.id;

    // 触发重绘以应用选中样式
    this.renderAll();

    if (this.onSelectCallback) {
      this.onSelectCallback({ ...rawData, backPosition: this.backPosition });
    }
  }

  /**
   * 状态判定：是否被选中
   */
  private checkIsSelected(item: PoiData): boolean {
    if (this.selectedId !== null && item.id !== undefined) {
      return item.id === this.selectedId;
    }
    if (!this.backPosition) return false;
    return item.location[0] === this.backPosition[0] && item.location[1] === this.backPosition[1];
  }

  /**
   * 显隐文字标签
   */
  public toggleText(visible: boolean): void {
    this.isInfoStatus = visible;
    this.renderAll();
  }

  private getTooltipHTML(props: PoiData): string {
    return `
     <div style="background: #fff; color: rgba(0,0,0,0.75); padding: 8px 12px; border-radius: 4px; font-size: 12px; line-height: 1.6; min-width: 120px;">
        <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid rgba(0,0,0,0.1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${props.name}
        </div>
        
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            场景ID：${props.id || '暂无'}
        </div>
        
        ${props.extraShow ? `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">备注：${props.extraShow}</div>` : ''}
    </div>
    `;
  }

  private clearPolygons(): void {
    try {
      if (this.overlayGroup) {
        this.overlayGroup.clearOverlays();
      }
    } catch (error) {
      console.error('清除围栏时出错:', error);
    }
  }

  public clearLayer(): void {
    this.isLoadingPoi = false;
    this.labelsLayer?.clear();
    this.clearPolygons();
    this.selectedId = null;
    this.backPosition = null;
  }

  public destroy(): void {
    this.clearLayer();
    this.map.off('moveend', this.debouncedMoveEnd);
    this.map.off('zoomend', this.debouncedMoveEnd);
    if (this.labelsLayer) {
      this.map.remove(this.labelsLayer as any);
      this.labelsLayer = null;
    }
    if (this.overlayGroup) {
      try {
        this.map.remove(this.overlayGroup as any);
        this.overlayGroup = null;
      } catch (error) {
        console.error('清除围栏群组时出错:', error);
      }
    }
    this.map.remove(this.tooltipMarker);
  }
}

export default PoiLayerManager;
