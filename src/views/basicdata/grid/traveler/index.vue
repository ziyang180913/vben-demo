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
    <DataMapPanel />
    <!-- 品牌智选列表 -->
    <FloatingGeneralTable :hotelList="hotelList" />
    <!-- 搜索筛选 -->
    <SearchFilter ref="searchFilterRef" @search="handleSearch" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, shallowRef } from 'vue';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import DataMapPanel from './components/DataMapPanel/index.vue';
  import FloatingGeneralTable from './components/FloatingGeneralTable/index.vue';
  import { mockHotelList } from './mock';
  import SearchFilter, { SearchForm } from './components/SearchFilter/index.vue';
  import PoiLayerManager, { PoiData } from '@/utils/aMap/PoiLayerManager';
  import { getHotelIcon } from '@/utils/aMap/icons';

  const searchFilterRef = ref<typeof SearchFilter>();

  const loading = ref(false);
  // 列表数据
  const hotelList = ref(mockHotelList);
  // 当前围栏信息
  const currentFence = ref<any>(null);
  // 引入POI图层
  let hotelPoiLayerManager = shallowRef<PoiLayerManager>();
  let mapInstance: any = null;
  /** --- 地图组件交互逻辑 --- */
  const initMap = (map: any) => {
    console.log('>>>>>>>map', map);
    mapInstance = map;
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
    if (!hotelPoiLayerManager.value) {
      hotelPoiLayerManager.value = new PoiLayerManager(mapInstance, {
        isClickable: false,
        isInfoStatus: false,
        iconSize: [25, 25],
      });
      hotelPoiLayerManager.value.init();
    }
    hotelPoiLayerManager.value.createPoiLayer(data, () => {});
  };

  // 搜索筛选酒店
  const handleSearch = (params: SearchForm) => {
    console.log(params, getDefaultFence());
    // 当前围栏
    const fences = currentFence.value?.path || getDefaultFence();

    loading.value = true;
    // 模拟请求数据
    setTimeout(() => {
      // 渲染POI数据
      loading.value = false;
      const poiData = hotelList.value.map((item) => ({
        id: item.pb_name,
        name: item.p_name,
        location: item.lnglat,
        color: '#3455FF',
        image: getHotelIcon('#3455FF'),
      }));
      generateHotelPoi(poiData);
      // 移动地图到第一个酒店位置
      mapInstance.setCenter(poiData[0].location);
    }, 1000);
  };
</script>

<style scoped lang="less" src="./index.less"></style>
