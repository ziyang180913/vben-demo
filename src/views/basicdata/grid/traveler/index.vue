<template>
  <div class="traveler-map">
    <Loading :loading="loading" absolute />
    <TemplateMap
      isMapConstor
      ref="aMapRef"
      :initMapEvent="initMap"
      :mapConstorProps="mapConstorProps"
    />
    <!-- 开关面板 -->
    <DataMapPanel
      ref="dataMapPanelRef"
      @poi-change="handlePoiChange"
      @poi-look-info="handlePoiLookInfo"
      @analysis-query="handleAnalysisQuery"
      @analysis-display="handleAnalysisDisplay"
    />
    <!-- 品牌智选列表 -->
    <FloatingGeneralTable :hotelList="hotelList" />
    <!-- 搜索筛选 -->
    <SearchFilter ref="searchFilterRef" @search="handleSearch" />
    <!-- 清除所有图层 -->
    <Button class="clear-btn" @click="clearAllLayers" type="primary">重新选点</Button>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted } from 'vue';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import DataMapPanel from './components/DataMapPanel/index.vue';
  import FloatingGeneralTable from './components/FloatingGeneralTable/index.vue';
  import { mockHotelList } from './mock';
  import SearchFilter, { SearchForm } from './components/SearchFilter/index.vue';
  import PoiLayerManager, { PoiData } from '@/utils/aMap/PoiLayerManager';
  import { getCircleIcon, getHotelIcon } from '@/utils/aMap/icons';
  import { MapVisualizationManager, MapDataItem } from '@/utils/aMap/MapVisualizer';
  import { Button } from '@/components/Button';
  // 开关面板实例
  const dataMapPanelRef = ref<typeof DataMapPanel>();
  const loading = ref(false);
  // 列表数据
  const hotelList = ref(mockHotelList);
  // 当前围栏信息
  const currentFence = ref<any>(null);
  // 引入POI图层管理器
  const poiLayerManagers = new Map<string, PoiLayerManager>();
  let mapInstance: any = null;
  let visualManager: MapVisualizationManager | null = null;
  const currentAnalysisData = ref<MapDataItem[]>([]);

  /** --- 地图组件交互逻辑 --- */
  const initMap = (map: any) => {
    mapInstance = map;
    visualManager = new MapVisualizationManager(map);
    // 引入POI图层
  };
  const mapConstorProps = reactive({
    notFit: true,
    mapOperate: ['circle', 'polygon', 'position', 'rule', 'enter', 'hand'],
    callback: (params: any) => {
      // 存储围栏信息
      currentFence.value = params;
    },
  });

  // 写一个逻辑，如果没有围栏信息，默认获取当前地图可视区域的四个角经纬度
  const getDefaultFence = () => {
    // 1. 获取当前地图的可视区域范围
    const bounds = mapInstance.getBounds();

    // 2. 获取西南角 (SouthWest) 和 东北角 (NorthEast)
    const sw = bounds.getSouthWest(); // [lng, lat] 最左下
    const ne = bounds.getNorthEast(); // [lng, lat] 最右上

    // 3. 组合成四个角的经纬度数组 (顺时针或逆时针)
    // 顺序：左下 -> 左上 -> 右上 -> 右下 -> 左下(闭合)
    const path = [
      [sw.lng, sw.lat], // 左下 (SouthWest)
      [sw.lng, ne.lat], // 左上
      [ne.lng, ne.lat], // 右上 (NorthEast)
      [ne.lng, sw.lat], // 右下
      [sw.lng, sw.lat], // 回到起点形成闭合回路
    ];
    return path;
  };

  // 生成酒店POI点位
  const generateHotelPoi = (data: PoiData[]) => {
    let manager = poiLayerManagers.get('hotel');
    if (!manager) {
      manager = new PoiLayerManager(mapInstance, {
        isClickable: false,
        isInfoStatus: dataMapPanelRef.value?.baseInfo,
        collision: false,
        allowCollision: false,
        iconSize: [25, 25],
      });
      manager.init();
      poiLayerManagers.set('hotel', manager);
    }
    manager.toggleText(dataMapPanelRef.value?.baseInfo);
    manager.createPoiLayer(data, () => {});
  };

  // 模拟请求不同类型的POI数据
  const mockFetchPoiData = (key: string, label: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const center = mapInstance ? mapInstance.getCenter() : { lng: 116.397428, lat: 39.90923 };
        // 基于当前中心点随机生成一些散落的点位作为模拟数据
        const randomData = mockHotelList.map((item, index) => {
          // 减小偏移量，让点位聚集在中心点周围
          const offsetLng = (Math.random() - 0.5) * 0.02;
          const offsetLat = (Math.random() - 0.5) * 0.02;
          return {
            ...item,
            p_name: `${item.p_name}-${label}${index}`,
            lnglat: [center.lng + offsetLng, center.lat + offsetLat] as [number, number],
          };
        });
        resolve(randomData);
      }, 500);
    });
  };

  // 开启基本信息
  const handlePoiLookInfo = (isShow: boolean) => {
    // 修改POI图层的可见性
    poiLayerManagers.forEach((manager) => {
      manager.toggleText(isShow);
    });
  };
  // 处理 POI 开关变更
  const handlePoiChange = async (poi: any) => {
    const { key, visible, color, label } = poi;
    if (visible) {
      loading.value = true;
      try {
        const res: any = await mockFetchPoiData(key, label);
        const poiData = res.map((item: any, index: number) => ({
          id: `${key}-${index}`,
          name: item.p_name,
          location: item.lnglat,
          color: color,
          image: getCircleIcon(color),
        }));

        let manager = poiLayerManagers.get(key);
        if (!manager) {
          manager = new PoiLayerManager(mapInstance, {
            isClickable: false,
            isInfoStatus: dataMapPanelRef.value?.baseInfo,
            allowCollision: false,
            collision: false,
            iconSize: [18, 18],
          });
          manager.init();
          poiLayerManagers.set(key, manager);
        }
        manager.toggleText(dataMapPanelRef.value?.baseInfo);
        manager.createPoiLayer(poiData, () => {});
      } finally {
        loading.value = false;
      }
    } else {
      // 关闭时销毁对应图层
      const manager = poiLayerManagers.get(key);
      if (manager) {
        manager.destroy();
        poiLayerManagers.delete(key);
      }
    }
  };

  // ---------------- 数据地图分析逻辑 ----------------
  // 模拟生成热力/网格数据
  const generateMockAnalysisData = (centerLngLat: [number, number], count: number) => {
    const data: MapDataItem[] = [];
    for (let i = 0; i < count; i++) {
      // 缩小偏移范围，让数据更集中
      const lng = centerLngLat[0] + (Math.random() - 0.5) * 0.02;
      const lat = centerLngLat[1] + (Math.random() - 0.5) * 0.02;
      data.push({
        lng,
        lat,
        count: Math.floor(Math.random() * 100) + 1,
      });
    }
    return data;
  };

  const renderAnalysisLayer = (type: string | null, config: any) => {
    if (!visualManager) return;

    if (!type) {
      visualManager.clearVisualLayers();
      return;
    }

    // 如果是热力图
    if (config.showHeat) {
      visualManager.createHeatMap(currentAnalysisData.value, 30, 100);
    }
    // 如果是网格图
    else if (config.showGrid) {
      visualManager.createGridMap(currentAnalysisData.value, {
        showText: config.showValue,
        gridRadius: parseInt(config.gridSize) || 100,
        minVisibleZoom: 2,
        opacity: 0.8,
      });
    } else {
      visualManager.clearVisualLayers();
    }
  };

  const handleAnalysisQuery = (payload: any) => {
    const { type, config } = payload;
    if (!type) {
      currentAnalysisData.value = [];
      renderAnalysisLayer(null, config);
      return;
    }

    loading.value = true;
    setTimeout(() => {
      // 假设基于当前可视区域中心生成
      const center = mapInstance ? mapInstance.getCenter() : { lng: 116.397428, lat: 39.90923 };
      // 数据过滤：如果有 minPeople，可以通过判断来过滤
      let mockData = generateMockAnalysisData([center.lng, center.lat], 800);
      if (config.minPeople) {
        const minVal = parseInt(config.minPeople);
        if (!isNaN(minVal)) {
          mockData = mockData.filter((d) => d.count >= minVal);
        }
      }
      currentAnalysisData.value = mockData;
      renderAnalysisLayer(type, config);
      loading.value = false;
    }, 500);
  };

  const handleAnalysisDisplay = (payload: any) => {
    const { type, config } = payload;
    renderAnalysisLayer(type, config);
  };

  // 搜索筛选酒店
  const handleSearch = (params: SearchForm) => {
    // 当前围栏
    const fences = currentFence.value?.path || getDefaultFence();

    loading.value = true;
    // 模拟请求数据
    setTimeout(() => {
      // 渲染POI数据
      loading.value = false;
      const center = mapInstance ? mapInstance.getCenter() : { lng: 116.397428, lat: 39.90923 };

      const poiData = hotelList.value.map((item, index) => {
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const offsetLat = (Math.random() - 0.5) * 0.02;
        const location = [center.lng + offsetLng, center.lat + offsetLat] as [number, number];

        // 更新原列表里的数据，保证地图点位和列表数据一致
        item.lnglat = location;

        return {
          id: item.pb_name + '_' + index,
          name: item.p_name,
          location: location,
          color: '#3455FF',
          image: getHotelIcon('#3455FF'),
        };
      });
      generateHotelPoi(poiData);
      // 移动地图到第一个酒店位置
      mapInstance.setCenter(poiData[0].location);
    }, 1000);
  };

  // 清除所有图层/包含热力图/网格图
  const clearAllLayers = () => {
    poiLayerManagers.forEach((manager) => {
      manager.destroy();
    });
    poiLayerManagers.clear();
    visualManager?.clearVisualLayers();
  };
  onUnmounted(() => {
    clearAllLayers();
  });
</script>

<style scoped lang="less" src="./index.less"></style>
