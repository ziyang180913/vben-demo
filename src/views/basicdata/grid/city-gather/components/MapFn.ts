import { getCircleIcon, getWaterDropIcon, getHotelIcon } from '@/utils/aMap/icons';

/** * 接口定义
 */
export interface Poi {
  poi_name: string;
  lng: number;
  lat: number;
  [key: string]: any;
}

export interface FenceData {
  boundary: [number, number][];
  color?: string;
  name: string;
  lng: number;
  lat: number;
  [key: string]: any;
}

export interface HotData {
  lng: number;
  lat: number;
  count: number;
}

export interface HotParam {
  max: number;
  level: number;
}

/**
 * AMap 逻辑封装类
 */
class MapFn {
  private map: any;
  private actionPoirLayer: any;
  private actionPoi: { poi: any | null; polygon?: any | null; type: string } | null = null;
  private locaContainer: any = null;
  private heatmapLayer: any = null;

  // 覆盖物群组管理
  private groups: { [key: string]: any } = {};
  private normalMarker: any;

  constructor(map: any) {
    this.map = map;

    // 1. 初始化 LabelsLayer (用于高性能标注)
    this.actionPoirLayer = new window.AMap.LabelsLayer({
      zooms: [3, 20],
      collision: false,
      zIndex: 9999,
    });
    this.map.add(this.actionPoirLayer);

    // 2. 初始化公共 Marker (用于 Hover 提示)
    this.normalMarker = new window.AMap.Marker({
      anchor: 'bottom-center',
      offset: [0, -10],
      zIndex: 9999,
    });

    // 3. 初始化并自动挂载所有 OverlayGroups
    const groupNames = ['poi', 'fence', 'fencePolygon', 'fencePoi', 'relevant'];
    groupNames.forEach((name) => {
      this.groups[name] = new window.AMap.OverlayGroup();
      this.map.add(this.groups[name]);
    });
  }

  /**
   * 创建基础 POI 点位
   */
  createPoi(poi: Poi[], callback?: (item: Poi) => void) {
    this.groups.poi.clearOverlays();

    const markers = poi.map((item) => {
      const marker = new window.AMap.Marker({
        position: [item.lng, item.lat],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(12, 12),
          image: getCircleIcon('#3455FF'),
          imageSize: new window.AMap.Size(12, 12),
        }),
        extData: item,
      });

      if (callback) {
        marker.on('click', () => callback(item));
      }
      return marker;
    });

    this.groups.poi.addOverlays(markers);
  }

  /**
   * 创建激活状态的 POI（带围栏或自定义 DOM）
   */
  createActionPoi(poi: any, type: string = 'circle', dom?: HTMLElement) {
    this.cleanActionPoi();

    const labelMarker = new window.AMap.Marker({
      zIndex: 999,
      extData: poi,
      content: dom,
      position: [poi.lng, poi.lat],
      anchor: 'bottom-center',
    });
    this.map.add(labelMarker);

    let polygon = null;
    if (type === 'polygon' && poi.boundary) {
      polygon = new window.AMap.Polygon({
        path: [...poi.boundary, poi.boundary[0]],
        fillColor: poi.color || '#5D95FF',
        strokeColor: poi.color || '#5D95FF',
        strokeOpacity: 1,
        fillOpacity: 0.25,
        strokeStyle: 'solid',
        strokeWeight: 1.2,
        geodesic: true,
        extData: poi,
      });
      this.map.add(polygon);
    }

    this.actionPoi = { poi: labelMarker, polygon, type };
  }

  cleanActionPoi() {
    if (this.actionPoi) {
      this.actionPoi.poi?.remove();
      this.actionPoi.polygon?.remove();
      this.actionPoi = null;
    }
  }

  /**
   * 围栏多边形群组
   */
  createFencePolygonGroup(data: FenceData[], callback?: (data: FenceData) => void) {
    this.groups.fencePolygon.clearOverlays();

    const polygons = data.map((item) => {
      const polygon = new window.AMap.Polygon({
        path: [...item.boundary, item.boundary[0]],
        fillColor: item.color || '#5D95FF',
        strokeColor: item.color || '#5D95FF',
        strokeOpacity: 1,
        fillOpacity: 0.25,
        strokeStyle: 'solid',
        strokeWeight: 1.2,
        geodesic: true,
        extData: item,
      });

      if (callback) {
        polygon.on('click', () => callback(item));
      }
      return polygon;
    });

    this.groups.fencePolygon.addOverlays(polygons);
  }

  /**
   * 围栏业务群组（点+线组合）
   */
  createFenceGroup(data: FenceData[], callback?: (item: FenceData) => void) {
    this.cleanFenceGroup();

    data.forEach((item) => {
      // 标记点
      const marker = new window.AMap.Marker({
        position: [item.lng, item.lat],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(24, 28),
          image: getWaterDropIcon('#3455FF'),
          imageSize: new window.AMap.Size(24, 28),
        }),
        extData: item,
      });

      if (callback) {
        marker.on('click', () => callback(item));
      }
      this.groups.fencePoi.addOverlay(marker);

      // 边界线
      const polyline = new window.AMap.Polyline({
        path: [...item.boundary, item.boundary[0]],
        strokeColor: item.color || '#5D95FF',
        strokeOpacity: 1,
        strokeStyle: 'solid',
        strokeWeight: 1.2,
        geodesic: true,
      });
      this.groups.fence.addOverlay(polyline);
    });
  }

  updateFencePoiVisibility(isShow: boolean) {
    isShow ? this.groups.fencePoi.show() : this.groups.fencePoi.hide();
  }

  cleanFenceGroup() {
    this.groups.fence.clearOverlays();
    this.groups.fencePoi.clearOverlays();
  }

  /**
   * 相关点位与区域渲染
   */
  createRelevantGroup(item: any) {
    this.groups.relevant.clearOverlays();

    // 渲染 POIs
    if (Array.isArray(item.poi)) {
      item.poi.forEach((poi: any) => {
        const coords = poi.location?.split(',');
        if (coords?.length === 2) {
          const marker = new window.AMap.Marker({
            position: [parseFloat(coords[0]), parseFloat(coords[1])],
            offset: new window.AMap.Pixel(-14, -22),
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(28, 30),
              image: getHotelIcon('#5D95FF'),
              imageSize: new window.AMap.Size(28, 30),
            }),
            extData: poi,
          });

          marker.on('mouseover', (e: any) => {
            this.normalMarker.setPosition(e.target.getPosition());
            this.normalMarker.setContent(
              `<div style="background: #fff; padding: 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid #eee;">${poi.poi_name}</div>`,
            );
            this.map.add(this.normalMarker);
          });

          marker.on('mouseout', () => this.map.remove(this.normalMarker));
          this.groups.relevant.addOverlay(marker);
        }
      });
    }

    // 渲染 围栏
    if (Array.isArray(item.fence) && item.fence.length > 0) {
      const polygon = new window.AMap.Polygon({
        path: item.fence,
        fillColor: item.color || '#5D95FF',
        strokeColor: item.color || '#5D95FF',
        fillOpacity: 0.25,
        strokeWeight: 1.2,
        zIndex: 1,
      });
      this.groups.relevant.addOverlay(polygon);
    }
  }

  /**
   * 自动缩放定位
   */
  setFitView(points: { lat: number; lng: number }[]) {
    if (!points?.length) return;

    const bounds = new window.AMap.Bounds();
    points.forEach((p) => bounds.extend([p.lng, p.lat]));

    // 使用 AMap 原生 setFitView 或 getFitZoomAndCenter
    const [zoom, center] = this.map.getFitZoomAndCenterByBounds(bounds, [40, 40, 40, 40]);
    this.map.setZoomAndCenter(zoom, center);
  }

  /**
   * 热力图渲染 (Loca 2.0)
   */
  async createHeatmap(list: HotData[], param?: HotParam) {
    this.cleanHeatmap();

    if (!this.locaContainer) {
      this.locaContainer = new window.Loca.Container({ map: this.map });
    }

    this.heatmapLayer = new window.Loca.HeatMapLayer({
      zIndex: 10,
      opacity: 1,
      visible: true,
      zooms: [2, 20],
    });

    const geoData = new window.Loca.GeoJSONSource({
      data: {
        type: 'FeatureCollection',
        features: list.map((item) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
          properties: { value: item.count },
        })),
      },
    });

    const maxVal = param ? param.max : Math.max(...list.map((d) => d.count), 0);

    this.heatmapLayer.setSource(geoData, {
      radius: param ? 40 : 140,
      unit: 'meter',
      gradient: {
        0.1: '#0000ff',
        0.5: '#00ff00',
        0.9: '#ffea00',
        1.0: '#ff0000',
      },
      value: (_: any, feature: any) => feature.properties.value,
      max: maxVal,
    });

    this.locaContainer.add(this.heatmapLayer);
  }

  cleanHeatmap() {
    if (this.heatmapLayer) {
      this.locaContainer?.remove(this.heatmapLayer);
      this.heatmapLayer.destroy();
      this.heatmapLayer = null;
    }
    if (this.locaContainer) {
      this.locaContainer.clear();
    }
  }

  /**
   * 彻底销毁：确保不占用内存，不残留 DOM
   */
  destroy() {
    // 1. 停止所有 Loca 动画或渲染（如果有）
    if (this.locaContainer) {
      try {
        this.cleanHeatmap();
        this.locaContainer.destroy();
      } catch (e) {
        console.warn('Loca container destroy failed', e);
      }
      this.locaContainer = null;
    }

    // 2. 清理业务覆盖物群组
    // 增加可选链和存在性检查，防止重复调用导致报错
    Object.keys(this.groups).forEach((key) => {
      const group = this.groups[key];
      try {
        if (group && typeof group.clearOverlays === 'function') {
          group.clearOverlays();
          if (this.map) {
            this.map.remove(group);
          }
        }
        delete this.groups[key];
      } catch (err) {
        console.log('>>>>>>>err', err);
      }
    });

    // 3. 清理特定的 Layer 和 Marker
    this.cleanActionPoi();

    if (this.actionPoirLayer) {
      if (this.map && typeof this.map.remove === 'function') {
        this.map.remove(this.actionPoirLayer);
      }
      // LabelsLayer 也有 clear 方法
      this.actionPoirLayer.clear?.();
      this.actionPoirLayer = null;
    }

    if (this.normalMarker) {
      // 使用 setMap(null) 是最稳妥的移除 Marker 方式
      this.normalMarker.setMap(null);
      this.normalMarker = null;
    }

    // 4. 最后销毁地图实例
    if (this.map) {
      try {
        // clearMap 会清除地图上所有非图层的覆盖物
        this.map.clearMap();
        this.map.destroy();
      } catch (e) {
        console.error('Error during AMap destroy:', e);
      }
      this.map = null;
    }
  }
}

export default MapFn;
