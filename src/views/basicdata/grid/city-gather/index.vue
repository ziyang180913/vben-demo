<template>
  <div class="do-page-hotel-city-gather">
    <Loading :loading="loading" absolute />
    <TemplateMap :init-map-event="onMapReady" />

    <div class="label-select">
      <div class="label-wrapper">
        <span class="label-text">聚客点类型</span>
        <ASelect
          v-model:value="param.type"
          :bordered="false"
          style="width: 190px"
          show-arrow
          allow-clear
          placeholder="请选择"
          :options="typeOptions"
          @change="handleTypeChange"
        />
      </div>
    </div>

    <LeftTable
      v-if="hotData"
      ref="leftTableRef"
      :info="{
        title: '聚客点信息列表',
        subtitle: `聚客点信息数量：${hotData?.length}`,
      }"
      :loading="false"
      :columns="config.columns"
      :data="hotData"
      @row-click="handleRowClick"
    />

    <RightCard
      v-if="showRightCard && actionHot"
      :config="config.rightCofig"
      :param="actionHot"
      @close="closeRightCard"
    />

    <AButton class="do-page-hotel-city-gather-btn" type="primary" @click="handleAnalyze">
      立即分析
    </AButton>
  </div>
</template>

<script setup lang="ts">
  import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { Select as ASelect, Button as AButton, message } from 'ant-design-vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import LeftTable from './components/LeftTable.vue';
  import RightCard from './components/RightCard.vue';
  import config from './config';
  import MapFn from './components/MapFn';
  import TipDom from './components/TipDom';
  import { mockGatheringPoint, mockHotelCircle } from './mock';
  import type { HotDataItem } from './mock';

  // 聚客点类型颜色
  const gatherTypeColor: { [key: string]: string } = {
    综合: '#3455ff',
    商务: '#B872E6',
    旅游: '#979143',
    就医: '#FF9900',
    商业: '#009933',
    展会: '#663399',
  };

  // 类型选项
  const typeOptions = ['不限', '综合', '商务', '旅游', '就医', '商业', '展会'].map((el) => ({
    value: el,
    label: el,
  }));

  // Refs
  const map = shallowRef<any>(null);
  const leftTableRef = shallowRef<any>(null);
  const mapConstorFn = shallowRef<MapFn | null>(null);
  const geocoder = shallowRef<any>(null);

  // 状态
  const loading = ref(true);
  const hotData = ref<HotDataItem[] | null>(null);
  const actionHot = ref<HotDataItem | null>(null);
  const showRightCard = ref(false);
  const openRelevan = ref(false);

  // 参数
  const param = ref<{ type: string }>({
    type: '不限',
  });

  // 地图准备就绪回调
  const onMapReady = (mapInstance: any) => {
    map.value = mapInstance;
    mapConstorFn.value = new MapFn(mapInstance);
    initGeocoder();
    loading.value = false;
    // 初始加载数据
    getSceneListData();
  };

  // 初始化地理编码器
  const initGeocoder = () => {
    if (window.AMap) {
      window.AMap.plugin('AMap.Geocoder', () => {
        geocoder.value = new window.AMap.Geocoder({ radius: 1000 });
      });
    }
  };

  // 获取邮编
  const getZipcode = (): Promise<number | null> => {
    return new Promise((resolve) => {
      if (!map.value || !geocoder.value) {
        resolve(null);
        return;
      }

      const location = map.value.getCenter();
      geocoder.value.getAddress(location, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // 模拟返回邮编
          resolve(518000);
        } else {
          resolve(null);
        }
      });
    });
  };

  // 获取场景列表数据
  const getSceneListData = async () => {
    loading.value = true;

    if (!map.value) {
      loading.value = false;
      return;
    }

    try {
      // 使用 mock 数据
      const res = mockGatheringPoint();
      if (res.code === 200) {
        hotData.value = res.data.map((item) => ({
          ...item,
          lat: item.lat,
          lng: item.lng,
          id: item.id,
          boundary: item.boundary,
          month_uv: item.month_uv,
          name: item.name,
        }));

        // 创建地图标记
        if (mapConstorFn.value && hotData.value) {
          createMassMarks(map.value, hotData.value);
        }
      } else {
        message.warning(res?.message || '请求失败');
      }
    } catch (error) {
      console.log('error+++++++++', error);
      message.error('请求异常');
    }

    loading.value = false;
  };

  // 创建地图标记
  const createMassMarks = (mapInstance: any, data: HotDataItem[]) => {
    if (!mapConstorFn.value || !data) return;

    const poiData: any[] = [];
    data.forEach((item: HotDataItem) => {
      const color = gatherTypeColor[item.fence_type || ''] || '#3455FF';
      const curPoi = {
        name: item.name,
        address: item.name,
        color: color,
        location: [item.marker?.lon || item.lng, item.marker?.lat || item.lat],
        fence: item.polygon,
        ...item,
      };
      poiData.push(curPoi);
    });

    mapConstorFn.value.createFencePolygonGroup(poiData, (item: HotDataItem) => {
      onActionPoi(item);
      leftTableRef.value?.setCurTableInfo(item);
    });
  };

  // 清理标记
  const clearMarker = async (checked: boolean, item: HotDataItem) => {
    openRelevan.value = checked;
    showRightCard.value = true;

    if (checked) {
      const res = mockHotelCircle(item.id);
      if (res.code === 200) {
        if (!res.data?.fence?.length) {
          message.warning('暂无数据');
        }

        if (mapConstorFn.value && res.data) {
          mapConstorFn.value.createRelevanGroup({
            fence: res.data.fence || [],
            poi: res.data.poi_data,
          });
        }
      } else {
        message.warning(res?.message || '请求失败');
      }
    } else {
      mapConstorFn.value?.cleanRelevanGroup();
    }
  };

  // 处理 POI 点击
  const onActionPoi = (item: HotDataItem) => {
    if (!item.boundary || !item.boundary.length) return;

    let latLng = {
      lat: { max: item.boundary[0][1], min: item.boundary[0][1] },
      lng: { max: item.boundary[0][0], min: item.boundary[0][0] },
    };

    item.boundary.forEach((col: number[]) => {
      latLng.lng.max = col[0] > latLng.lng.max ? col[0] : latLng.lng.max;
      latLng.lng.min = col[0] < latLng.lng.min ? col[0] : latLng.lng.min;
      latLng.lat.max = col[1] > latLng.lat.max ? col[1] : latLng.lat.max;
      latLng.lat.min = col[1] < latLng.lat.min ? col[1] : latLng.lat.min;
    });

    if (mapConstorFn.value) {
      mapConstorFn.value.createActionPoi(
        {
          ...item,
          ...item.marker,
          lat: latLng.lat.min + (latLng.lat.max - latLng.lat.min),
          color: '#FF0000',
        },
        'polygon',
        TipDom.getTipDom({
          poi: item,
          checked: openRelevan.value,
          callback: clearMarker,
          closeRightCard: () => {
            mapConstorFn.value?.cleanActionPoi();
          },
        }),
      );
    }

    if (openRelevan.value) {
      clearMarker(true, item);
    }

    actionHot.value = item;
    showRightCard.value = true;
  };

  // 关闭右侧卡片
  const closeRightCard = () => {
    leftTableRef.value?.setCurTableInfo(null);
    showRightCard.value = false;
    openRelevan.value = false;
    mapConstorFn.value?.cleanRelevanGroup();
    mapConstorFn.value?.cleanActionPoi();
  };

  // 清理画布
  const clearCanvas = () => {
    showRightCard.value = false;
    actionHot.value = null;
    openRelevan.value = false;
    mapConstorFn.value?.cleanRelevanGroup();
    mapConstorFn.value?.cleanActionPoi();
    mapConstorFn.value?.cleanHot();
  };

  // 处理表格行点击
  const handleRowClick = (item: HotDataItem) => {
    mapConstorFn.value?.cleanActionPoi();
    onActionPoi(item);
    map.value?.panTo([item.lng, item.lat]);
  };

  // 处理类型变化
  const handleTypeChange = () => {
    // 重新加载数据
    getSceneListData();
  };

  // 处理分析按钮点击
  const handleAnalyze = () => {
    clearCanvas();
    getSceneListData();
  };

  // 生命周期
  onMounted(() => {
    initGeocoder();
  });

  onUnmounted(() => {
    mapConstorFn.value?.destroy();
  });
</script>

<style scoped lang="less">
  @import './index.less';

  .label-select {
    position: absolute;
    z-index: 10;
    top: 20px;
    left: 130px;

    .label-wrapper {
      display: flex;
      align-items: center;
      width: 240px;
      height: 32px;
      padding: 4px 12px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

      .label-text {
        margin-right: 8px;
        color: rgb(0 0 0 / 85%);
        font-size: 14px;
        white-space: nowrap;
      }
    }
  }
</style>
