// import AMap from 'AMap';
import centerPoint from '@/assets/icons/centerPoint.png';
import { MARKER_DEFAULT_COLOR } from './mapColors';

// 定义圆形参数接口
interface CircleItem {
  lng: number;
  lat: number;
  value: number;
}

// 定义多边形参数接口
interface PolygonItem {
  path: [number, number][];
  [key: string]: any;
}

// 定义回调函数类型
type Callback = (data: any) => void;

// 围栏扩展
class MapConstorRender {
  private map: AMap.Map;
  private overlayGroup: AMap.OverlayGroup;
  private options: any;

  constructor(map: AMap.Map, options: any = {}) {
    this.map = map;
    // labels 图层
    this.overlayGroup = new window.AMap.OverlayGroup(); // 群组围栏
    this.options = options;
    this.map.add(this.overlayGroup);
  }

  // 创建围栏
  create(item: CircleItem | PolygonItem, type: 'circle' | 'polygon', callback: Callback): void {
    if (type === 'circle') {
      const circleItem = item as CircleItem;
      const marker = new AMap.Marker({
        position: [circleItem.lng, circleItem.lat],
        size: new AMap.Size(28, 28),
        offset: new AMap.Pixel(2, 0),
        anchor: 'center',
        icon: centerPoint,
      });

      const circle = new AMap.Circle({
        center: [circleItem.lng, circleItem.lat],
        radius: circleItem.value, // 半径
        fillColor: MARKER_DEFAULT_COLOR,
        strokeColor: MARKER_DEFAULT_COLOR,
        strokeOpacity: 1,
        fillOpacity: 0.25, // 填充透明度
        strokeStyle: 'solid',
        zIndex: 100,
        ...this.options,
      });

      marker.on('click', () => {
        callback && callback(item);
      });
      this.overlayGroup.addOverlays([marker, circle]);
      return;
    } else if (type === 'polygon') {
      const polygonItem = item as PolygonItem;
      const polyline: AMap.PolygonOptions = {
        path: polygonItem.path,
        extData: polygonItem,
        fillColor: MARKER_DEFAULT_COLOR,
        strokeColor: MARKER_DEFAULT_COLOR,
        strokeOpacity: 1,
        fillOpacity: 0.25, // 填充透明度
        strokeStyle: 'solid',
        strokeWeight: 2,
        zIndex: 100,
        ...this.options,
      };
      const polylines = new window.AMap.Polygon(polyline);
      polylines.on('click', () => {
        callback && callback(polylines.getExtData());
      });
      this.overlayGroup.addOverlays([polylines]);
      return;
    }
  }

  // 清除围栏
  clear(): void {
    this.overlayGroup?.clearOverlays();
  }

  // 销毁画布
  destroy(): void {
    try {
      if (this.overlayGroup) {
        this.overlayGroup?.clearOverlays();
        this.overlayGroup = null as unknown as AMap.OverlayGroup;
      }
    } catch (error) {
      console.error('销毁地图围栏图层时出错:', error);
    }
  }
}

export default MapConstorRender;
