<template>
  <div class="poi-mall-map">
    <Loading :loading="loading" absolute />
    <TemplateMap :initMapEvent="initMap" />
    <Button class="poi-mall-btn" type="primary" @click="handleLoadCurrentAreaMall">
      加载当前区域商场
    </Button>
    <!-- POI信息卡片 -->
    <PoiInfoCard
      :visible="cardVisible"
      :data="cardData"
      @close="handleCardClose"
      @more="handleCardMore"
      @link-click="handleLinkClick"
    />
  </div>
</template>

<script setup lang="ts">
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import { ref, onUnmounted } from 'vue';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { Button, message } from 'ant-design-vue';
  import PoiLayerManager, { PoiData } from '@/utils/aMap/PoiLayerManager';
  import { getCircleIcon } from '@/utils/aMap/icons';
  import {
    PoiInfoCard,
    type PoiInfoCardData,
    type InfoLink,
    type InfoSection,
  } from '@/components/PoiInfoCard';
  import { fetchCustomerResearch } from '@/api/basicdata/guestResearch';

  // 页面loading
  const loading = ref<boolean>(false);
  let mapInstance: any = null;
  let poiLayerManager: PoiLayerManager | null = null;

  // 卡片相关状态
  const cardVisible = ref(false);
  const cardData = ref<PoiInfoCardData>({
    sceneId: '',
    title: '',
    tag: '关键看板',
    address: '',
    showMore: true,
    sections: [],
  });

  // 初始化
  const initMap = (map: any) => {
    mapInstance = map;
    // 初始化POI图层管理器
    poiLayerManager = new PoiLayerManager(mapInstance, {
      isClickable: true,
      isInfoStatus: true,
      collision: false,
      allowCollision: false,
      iconSize: [20, 20],
    });
    poiLayerManager.init();
  };

  // 处理接口返回数据，转换为 PoiData 格式
  const processMallData = (data: any[]): PoiData[] => {
    if (!data || !Array.isArray(data)) return [];

    // 数据处理，里面的围栏是字符串类型.
    return data
      .filter((v) => v?.aoi_loc)
      .map((v, index) => {
        const location = v.aoi_loc.split(',').map((item: string) => Number(item));
        const color = '#3455FF';
        const fences = v?.aoi_fence?.map((item) => JSON.parse(item));
        return {
          ...v,
          id: v.aoi_id,
          name: v.aoi_name,
          location,
          lng: location[0],
          lat: location[1],
          color,
          image: getCircleIcon(color),
          path: fences,
          zIndex: index,
        };
      });
  };

  // 生成卡片数据
  const generateCardData = (poiData: PoiData): PoiInfoCardData => {
    return {
      sceneId: poiData.id,
      title: poiData.name,
      tag: '关键看板',
      address: `深圳市宝安区${Math.floor(Math.random() * 100)}大道与${Math.floor(Math.random() * 100)}路交汇处`,
      showMore: true,
      sections: [
        {
          key: 'business',
          title: '经营指标',
          links: [
            { key: 'flow_trend', label: '客流趋势' },
            { key: 'behavior_analysis', label: '场内行为分析' },
            { key: 'competitor_analysis', label: '竞品到访分析' },
            { key: 'brand_distribution', label: '业态与品牌分布' },
            { key: 'customer_analysis', label: '新老客分析' },
            { key: 'lost_customer', label: '流失客分析' },
          ],
        },
        {
          key: 'geography',
          title: '地理属性',
          links: [
            { key: 'source_area', label: '客群来源地' },
            { key: 'consumption', label: '消费地统计' },
            { key: 'distance', label: '距离比例分布' },
            { key: 'province_city', label: '省市区分布' },
            { key: 'community', label: '小区分析' },
            { key: 'surrounding', label: '周边来客率（渗透率）' },
            { key: 'population', label: '周边人口' },
            { key: 'lost_destination', label: '流失客去向分析' },
          ],
        },
        {
          key: 'portrait',
          title: '客群画像',
          links: [
            { key: 'basic', label: '基础画像' },
            { key: 'income', label: '收入消费' },
            { key: 'transport', label: '交通方式' },
            { key: 'preference_detail', label: '业态偏好(细)' },
            { key: 'dining', label: '餐饮偏好' },
            { key: 'mall_preference', label: '商场偏好' },
            { key: 'brand', label: '品牌偏好' },
            { key: 'mobile', label: '手机终端' },
            { key: 'preference_rough', label: '业态偏好(粗)' },
            { key: 'carrier', label: '运营商偏好' },
          ],
        },
        {
          key: 'marketing',
          title: '精准营销',
          links: [
            { key: 'scene_sms', label: '场景化触达' },
            { key: 'competitor', label: '竞品营销' },
            { key: 'surrounding_mkt', label: '周边营销' },
            { key: 'member', label: '会员营销' },
          ],
        },
      ],
    };
  };

  // 加载当前区域商场
  const handleLoadCurrentAreaMall = async () => {
    if (!mapInstance || !poiLayerManager) {
      console.warn('地图尚未初始化');
      return;
    }

    loading.value = true;

    try {
      // 获取高德地图四个角的经纬度
      const bounds = mapInstance.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // 计算 top_left 和 bottom_right（格式：lat,lng）
      const top_left = [sw.lng, ne.lat].reverse().join();
      const bottom_right = [ne.lng, sw.lat].reverse().join();

      // 计算查询面积（用于校验范围是否过大）
      const leftButton = [sw.lng, sw.lat];
      const rightTop = [ne.lng, ne.lat];
      const rightButton = [ne.lng, sw.lat];
      const leftTop = [sw.lng, ne.lat];
      const polygon = [leftTop, rightTop, rightButton, leftButton, leftTop];
      const area = (window.AMap.GeometryUtil.ringArea(polygon) / 1000000).toFixed(3);

      if (Number(area) > 5024) {
        message.warning('当前查询范围过大，缩小范围后查询！');
        loading.value = false;
        return;
      }

      // 请求接口参数
      const params = {
        top_left,
        bottom_right,
        research_type: 2,
        model: 'mall',
      };

      const res = await fetchCustomerResearch(params);
      if (res.data) {
        const data = res.data;
        const mallData = processMallData(data);
        console.log('>>>>>>>>>>>>mallData', mallData);
        // 使用PoiLayerManager渲染围栏和POI
        poiLayerManager?.createPoiLayer(mallData, (selectedData) => {
          console.log('选中的商场:', selectedData);
          // 显示信息卡片
          cardData.value = generateCardData(selectedData);
          cardVisible.value = true;
        });
      }
    } catch (error) {
      console.error('加载商场数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 关闭卡片
  const handleCardClose = () => {
    cardVisible.value = false;
  };

  // 点击更多
  const handleCardMore = (data: PoiInfoCardData) => {
    console.log('点击更多:', data);
    // 这里可以处理更多逻辑，比如跳转到详情页
  };

  // 点击链接
  const handleLinkClick = (link: InfoLink, section: InfoSection) => {
    console.log('点击链接:', link, '所属板块:', section.title);
    // 这里可以处理链接点击逻辑，比如打开对应的分析页面
  };

  // 组件卸载时清理
  onUnmounted(() => {
    if (poiLayerManager) {
      poiLayerManager.destroy();
      poiLayerManager = null;
    }
  });
</script>

<style scoped lang="less" src="./index.less"></style>
