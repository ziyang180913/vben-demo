<template>
  <div class="map-init-component" :id="containerId"></div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import AMapLoader from '@amap/amap-jsapi-loader';
  import { buildShortUUID } from '@/utils/uuid';

  // 定义 AMap.Map 实例的类型
  interface AMapMapInstance {
    on: (eventName: string, callback: () => void) => void;
    clearMap: () => void;
    destroy: () => void;
  }

  // 定义组件属性类型
  export interface MapProps {
    config?: {
      coord?: string;
      layers?: () => any;
      center?: any;
    };
    callback?: (map: AMapMapInstance) => void;
  }

  const props = withDefaults(defineProps<MapProps>(), {
    config: () => ({
      // 默认深圳市
      coord: '114.057939, 22.546387',
    }),
    callback: undefined,
  });

  const containerId = buildShortUUID();
  let mapInstance: any = null;

  /** 初始化地图 */
  const initMap = async () => {
    // 设置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: '3559f855ef4b618cf4701f1152ac982f',
    };
    try {
      // 加载地图 JSAPI
      AMapLoader.load({
        key: 'acf93d9468d84e5ab9092f3185457f50', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.Geocoder',
          'AMap.Scale',
          'AMap.ToolBar',
          'AMap.MouseTool',
          'AMap.RangingTool',
          'AMap.PlaceSearch',
        ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        Loca: {
          // 是否加载 Loca， 缺省不加载
          version: '2.0', // Loca 版本，缺省 1.3.2
        },
      }).then((AMap) => {
        const position = props.config?.coord?.split(',');
        const center = position && new AMap.LngLat(+position[0], +position[1]);
        const config = {
          zoom: 14,
          ...(props.config || {}),
          ...(center ? { center } : {}),
        };
        mapInstance = new AMap.Map(document.getElementById(containerId), config);
        mapInstance.on('complete', () => {
          props.callback?.(mapInstance!);
        });
      });
    } catch (error) {
      console.error('地图初始化失败:', error);
    }
  };

  // 加载地图实例
  onMounted(() => {
    initMap();
  });

  // 清理地图实例
  onUnmounted(() => {
    if (mapInstance) {
      mapInstance.clearMap();
      mapInstance.destroy();
      mapInstance = null;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    }
  });
</script>
<style scoped>
  @import url('./index.less');
</style>
