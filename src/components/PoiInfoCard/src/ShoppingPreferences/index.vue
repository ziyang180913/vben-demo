<template>
  <div class="shopping-preferences">
    <!-- 使用 TemplateMap 组件 -->
    <TemplateMap :initMapEvent="initMap" />

    <!-- 左侧面板 - 可展开收起 -->
    <div class="side-panel" :class="{ collapsed: isCollapsed }">
      <!-- 面板内容 -->
      <div v-show="!isCollapsed" class="panel-content">
        <!-- 标题 -->
        <div class="panel-header">
          <span class="title">{{ title || '商场偏好' }}</span>
        </div>

        <!-- 简约列表 -->
        <div class="list-container">
          <div class="list-header">
            <span class="col-index">序号</span>
            <span class="col-name">名称</span>
            <span class="col-ratio">人数比例</span>
            <span class="col-action">操作</span>
          </div>
          <div class="list-body">
            <div
              v-for="(item, index) in list"
              :key="item.id || index"
              class="list-item"
              :class="{ active: activeName === item.name }"
              @click="handleItemClick(item)"
            >
              <span class="col-index">{{ index + 1 }}</span>
              <span class="col-name" :title="item.name">{{ item.name }}</span>
              <span class="col-ratio">{{ formatRatio(item.penetration) }}</span>
              <span class="col-action">
                <a @click.stop="handleMoreClick(item)">更多</a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 折叠按钮 - 放在面板内部 -->
      <div class="collapse-btn" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
        <LeftOutlined />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <PoiDetailModal
      :visible="showMoreInfo"
      :data="baseInfo"
      @close="baseInfo = {}"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import PoiDetailModal from '../PoiDetailModal/index.vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import PoiLayerManager from '@/utils/aMap/PoiLayerManager';
  import { getCircleIcon } from '@/utils/aMap/icons';

  interface Props {
    info?: {
      location?: [number, number] | number[];
    };
    data?: any[];
    title?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    info: () => ({}),
    data: () => [],
    title: '',
  });

  // 地图相关
  let mapInstance: any = null;
  let poiLayerManager: PoiLayerManager | null = null;

  // 响应式状态
  const list = ref<any[]>([]);
  const baseInfo = ref<Record<string, any>>({});
  const activeName = ref('');
  const isCollapsed = ref(false);

  const showMoreInfo = computed(() => Object.keys(baseInfo.value).length > 0);

  // Mock 数据
  const mockData = [
    {
      p_id: '24086851',
      p_name: '深圳大悦城购物中心',
      ratio: 0.3362,
      p_loc: '113.902959,22.568746',
      pb_boundary: JSON.stringify([
        [113.901, 22.567],
        [113.905, 22.567],
        [113.905, 22.57],
        [113.901, 22.57],
      ]),
    },
    {
      p_id: '24086852',
      p_name: '深圳宝安大仟里',
      ratio: 0.069,
      p_loc: '113.888,22.555',
      pb_boundary: JSON.stringify([
        [113.886, 22.553],
        [113.89, 22.553],
        [113.89, 22.557],
        [113.886, 22.557],
      ]),
    },
    {
      p_id: '24086853',
      p_name: '深圳天虹商场(宝安前进店)',
      ratio: 0.0517,
      p_loc: '113.910,22.580',
      pb_boundary: JSON.stringify([
        [113.908, 22.578],
        [113.912, 22.578],
        [113.912, 22.582],
        [113.908, 22.582],
      ]),
    },
    {
      p_id: '24086854',
      p_name: '深圳宝安勤诚达K+PLAZA',
      ratio: 0.0517,
      p_loc: '113.895,22.572',
      pb_boundary: JSON.stringify([
        [113.893, 22.57],
        [113.897, 22.57],
        [113.897, 22.574],
        [113.893, 22.574],
      ]),
    },
    {
      p_id: '24086855',
      p_name: '深圳上合优城购物中心',
      ratio: 0.0431,
      p_loc: '113.920,22.585',
      pb_boundary: JSON.stringify([
        [113.918, 22.583],
        [113.922, 22.583],
        [113.922, 22.587],
        [113.918, 22.587],
      ]),
    },
    {
      p_id: '24086856',
      p_name: '深圳宝立方',
      ratio: 0.0431,
      p_loc: '113.885,22.590',
      pb_boundary: JSON.stringify([
        [113.883, 22.588],
        [113.887, 22.588],
        [113.887, 22.592],
        [113.883, 22.592],
      ]),
    },
    {
      p_id: '24086857',
      p_name: '深圳壹方天地',
      ratio: 0.0345,
      p_loc: '113.930,22.600',
      pb_boundary: JSON.stringify([
        [113.928, 22.598],
        [113.932, 22.598],
        [113.932, 22.602],
        [113.928, 22.602],
      ]),
    },
    {
      p_id: '24086858',
      p_name: '深圳BREWTOWN啤酒小镇',
      ratio: 0.0345,
      p_loc: '113.870,22.565',
      pb_boundary: JSON.stringify([
        [113.868, 22.563],
        [113.872, 22.563],
        [113.872, 22.567],
        [113.868, 22.567],
      ]),
    },
    {
      p_id: '24086859',
      p_name: '深圳泰华商业城商铺',
      ratio: 0.0345,
      p_loc: '113.940,22.575',
      pb_boundary: JSON.stringify([
        [113.938, 22.573],
        [113.942, 22.573],
        [113.942, 22.577],
        [113.938, 22.577],
      ]),
    },
    {
      p_id: '24086860',
      p_name: '深圳坂田万科广场',
      ratio: 0.0345,
      p_loc: '113.950,22.620',
      pb_boundary: JSON.stringify([
        [113.948, 22.618],
        [113.952, 22.618],
        [113.952, 22.622],
        [113.948, 22.622],
      ]),
    },
    {
      p_id: '24086861',
      p_name: '深圳中洲πmall',
      ratio: 0.0259,
      p_loc: '113.860,22.550',
      pb_boundary: JSON.stringify([
        [113.858, 22.548],
        [113.862, 22.548],
        [113.862, 22.552],
        [113.858, 22.552],
      ]),
    },
    {
      p_id: '24086862',
      p_name: '深圳Bingo缤果空间',
      ratio: 0.0259,
      p_loc: '113.915,22.595',
      pb_boundary: JSON.stringify([
        [113.913, 22.593],
        [113.917, 22.593],
        [113.917, 22.597],
        [113.913, 22.597],
      ]),
    },
    {
      p_id: '24086863',
      p_name: '深圳宝安天虹购物中心',
      ratio: 0.0259,
      p_loc: '113.900,22.610',
      pb_boundary: JSON.stringify([
        [113.898, 22.608],
        [113.902, 22.608],
        [113.902, 22.612],
        [113.898, 22.612],
      ]),
    },
    {
      p_id: '24086864',
      p_name: '深圳DM港隆城',
      ratio: 0.0259,
      p_loc: '113.855,22.540',
      pb_boundary: JSON.stringify([
        [113.853, 22.538],
        [113.857, 22.538],
        [113.857, 22.542],
        [113.853, 22.542],
      ]),
    },
    {
      p_id: '24086865',
      p_name: '深圳时代城购物中心',
      ratio: 0.0259,
      p_loc: '113.925,22.630',
      pb_boundary: JSON.stringify([
        [113.923, 22.628],
        [113.927, 22.628],
        [113.927, 22.632],
        [113.923, 22.632],
      ]),
    },
  ];

  // 格式化比例
  const formatRatio = (val: number) => {
    if (val === undefined || val === null) return '-';
    return `${(val * 100).toFixed(2)}%`;
  };

  // 切换展开/收起
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  // 初始化地图
  const initMap = (map: any) => {
    mapInstance = map;

    // 设置地图中心 - 使用 mock 数据的中心位置
    const center = props.info?.location || [113.902959, 22.568746];
    map.setCenter(center);
    map.setZoom(13);

    // 初始化 POI 图层管理器
    poiLayerManager = new PoiLayerManager(mapInstance, {
      isClickable: true,
      isInfoStatus: false,
      collision: false,
      allowCollision: false,
    });
    poiLayerManager.init();

    // 使用 mock 数据渲染
    renderPois(mockData);

    // 更新列表数据
    const res = mockData.map((item) => {
      const fence = item.pb_boundary ? JSON.parse(item.pb_boundary) : [];
      const location = item.p_loc ? item.p_loc.split(',').map(Number) : [0, 0];
      return {
        ...item,
        name: item.p_name,
        penetration: item.ratio,
        fence,
        location,
        lng: location[0],
        lat: location[1],
        id: item.p_id,
      };
    });
    list.value = res;
  };

  // 渲染 POI
  const renderPois = (data: any[]) => {
    if (!poiLayerManager) return;

    const poiData = data.map((item, index) => {
      const fence = item.pb_boundary ? JSON.parse(item.pb_boundary) : [];
      const location = item.p_loc ? item.p_loc.split(',').map(Number) : [0, 0];
      return {
        ...item,
        id: item.p_id || item.competitor_p_id || index,
        name: item.p_name,
        location,
        lng: location[0],
        lat: location[1],
        path: Array.isArray(fence) ? fence : [fence],
        color: '#4E6AFF',
        image: getCircleIcon('#4E6AFF'),
        zIndex: index,
      };
    });

    poiLayerManager.createPoiLayer(poiData, (selectedData) => {
      activeName.value = selectedData.name;
    });
  };

  // 列表项点击
  const handleItemClick = (item: any) => {
    activeName.value = item.name;

    // 地图定位到该点位
    if (mapInstance && item.lng && item.lat) {
      const pixel = mapInstance.lngLatToPixel([item.lng, item.lat], 16);
      pixel.x -= 150;
      const lnglat = mapInstance.pixelToLngLat(pixel, 16);
      mapInstance.setZoomAndCenter(16, lnglat, true);
    }

    // 高亮对应的 POI
    if (poiLayerManager) {
      poiLayerManager.selectPosition([item.lng, item.lat], item);
    }
  };

  // 获取 POI 详情
  const getPoiBaseInfo = async (values: any) => {
    // 模拟详情数据
    const mockDetailInfo = {
      score_rank: 'A级',
      open_date: '2020-08-15',
      area: '250000平方米',
      floor: 'B2-L6',
      business_status: '营业中',
      open_hour: '10:00-22:00',
      investment_status: '已满租',
      add: '宝安区中心区25区创业二路与前进一路交汇处',
    };

    // 如果没有ID，使用已有数据展示
    baseInfo.value = {
      ...mockDetailInfo,
      name: values.name || values.p_name,
      id: values.p_id || values.competitor_p_id || values.id || '-',
      p_loc: values.p_loc || (values.lng && values.lat ? `${values.lng},${values.lat}` : '-'),
    };
  };

  // 更多按钮点击
  const handleMoreClick = (record: any) => {
    getPoiBaseInfo(record);
  };

  // 监听数据变化
  watch(
    () => props.data,
    (val) => {
      if (val && val.length > 0) {
        const res = val.map((item) => {
          const fence = item.pb_boundary ? JSON.parse(item.pb_boundary) : [];
          const location = item.p_loc ? item.p_loc.split(',').map(Number) : [0, 0];
          return {
            ...item,
            name: item.p_name,
            penetration: item.ratio || item.penetration,
            fence,
            location,
            lng: location[0],
            lat: location[1],
            id: item.p_id || item.competitor_p_id,
          };
        });
        list.value = res;
        if (mapInstance && poiLayerManager) {
          renderPois(val);
        }
      }
    },
    { deep: true, immediate: true },
  );

  // 监听位置变化
  watch(
    () => props.info?.location,
    (val) => {
      if (mapInstance && val) {
        mapInstance.setCenter(val, true);
      }
    },
  );
</script>

<style lang="less" scoped src="./index.less"></style>
