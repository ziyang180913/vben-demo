<template>
  <Loading :loading="loading" absolute />
  <div class="population-map">
    <TemplateMap
      isMapConstor
      ref="aMapRef"
      :initMapEvent="initMap"
      :mapConstorProps="mapConstorProps"
    />
    <!-- 引入封装好的数据查询面板 -->
    <DataQueryPanel
      v-model:open="isPanelOpen"
      v-model:formData="formData"
      :infoText="infoText"
      @analyze="handleAnalyze"
    />
    <!-- 引入封装好的抽屉组件 -->
    <AreaInfoDrawer v-model:open="isPanelOpen" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, h, watch, onUnmounted } from 'vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import { DataQueryPanel } from '@/components/DataQueryPanel';
  import AreaInfoDrawer from './components/AreaInfoDrawer.vue';
  import { Button } from '@/components/Button';
  import { fetchGridPopulation } from '@/api/basicdata/grid';
  import { message } from 'ant-design-vue';
  import { MapVisualizationManager } from '@/utils/aMap/MapVisualizer';
  import MapConstorRender from '@/utils/aMap/MapConstorRender';
  import PoiLayerManager from '@/utils/aMap/PoiLayerManager';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { getSceneSearch } from '@/api/global';
  import dayjs from 'dayjs';
  import { mockFence, mockPoi } from './mock';
  import { getCircleIcon } from '@/utils/aMap/icons';
  import { isEqual } from 'lodash-es';

  const loading = ref(false);

  const isPanelOpen = ref(false);
  // 地图实例
  const aMapRef = ref<any>(null);
  // 面板按钮 围栏信息
  const infoText = ref('暂无围栏信息');
  // 地图可视化管理器
  const mapVisualizerRef = ref<any>(null);
  // 地图围栏管理器
  const mapConstorRef = ref<any>(null);
  // POI点位图层管理器
  const poiLayerManagerRef = ref<any>(null);
  // POI详情数据
  const poiDetailData = ref<any>({});
  // 查询面板参数
  const formData = ref({
    fenceParams: {} as any,
    population: {
      population_type: 3,
      size: 100,
      month: dayjs().subtract(3, 'month'),
      heatmap: true,
      grid: false,
      gridPopulation: false,
    },
    poi: {
      selectAll: false,
      baseInfo: false,
      otherPoiType: 'category',
      otherPoiValue: [],
      selectedTypes: [],
      otherCategoryDetails: [],
      otherBrandDetails: [],
    },
  });
  // 保存地图数据
  const mapData = ref<any>(null);
  // 地图控制工具属性
  const mapConstorProps = reactive({
    callback: (item: any, type: string) => {
      // 开启面板
      isPanelOpen.value = true;
      // 更新围栏信息
      infoText.value = type === 'polygon' ? '多边形围栏' : item?.name || '暂无围栏信息';
      formData.value.fenceParams = {
        ...item,
        type,
      };
      handleAnalyze(formData.value);
    },
    isOk: true,
    mapOperate: ['circle', 'polygon', 'position', 'rule', 'enter', 'hand'],
    selectingPointsProps: {
      okText: '开始分析',
      footer: ({ handelFooterClick, val, btnLoading }: any) => {
        return h('div', { class: 'footer' }, [
          h(
            Button,
            {
              style: { width: '130px' },
              onClick: () => {
                if (aMapRef.value?.mapConstorRef) {
                  aMapRef.value?.mapConstorRef?.clearAll();
                }
              },
            },
            '取消',
          ),
          h(
            Button,
            {
              style: { width: '130px' },
              type: 'primary',
              loading: btnLoading,
              onClick: handelFooterClick,
            },
            val === '0' ? '开始分析' : '生成可达圈',
          ),
        ]);
      },
    },
  });

  // 初始画地图
  const initMap = (map) => {
    // 地图实例
    aMapRef.value = map;
    // 注册热力图与网格图类
    mapVisualizerRef.value = new MapVisualizationManager(map);
    // 注册围栏类
    mapConstorRef.value = new MapConstorRender(map);
    // 渲染POI点位
    poiLayerManagerRef.value = new PoiLayerManager(map, {
      isClickable: false,
      isInfoStatus: formData.value.poi.baseInfo,
    });
    poiLayerManagerRef.value.init();
  };
  // 请求热力图/网格
  const handleAnalyze = async (queryParams: any) => {
    try {
      if (!queryParams.fenceParams || queryParams.fenceParams.path?.length === 0) {
        message.warning('请先绘制围栏');
        return;
      }
      loading.value = true;
      const { population, fenceParams } = queryParams;
      // 参数处理
      const params = {
        ...population,
        month: dayjs(population?.month).format('YYYY-[Q]Q'),
        query_type: 'polygon',
        population_type: String(population?.population_type),
        polygon: fenceParams?.path || [],
      };
      // 这里可以对接后续分析逻辑
      const res = await fetchGridPopulation(params);
      // 数据处理
      mapData.value = res?.map((item: any) => ({
        ...item,
        lng: item?.center_loc?.lng,
        lat: item?.center_loc?.lat,
        count: item?.cnt || 0,
      }));
      // 渲染围栏
      renderFence(queryParams);
      // 渲染热力图与网格
      renderHeatmapAndGrid(mapData.value, queryParams);
    } finally {
      loading.value = false;
    }
  };
  /**
   * 归类数据并保留颜色配置
   * @param {Array} dataSource 数据源配置
   * @param {Array} backendData 后端返回的 POI 列表
   */
  const managePoiDataWithStyle = (dataSource, backendData) => {
    // 1. 建立 ID 到 {label, color} 的快速索引
    const idToConfigMap = {};
    const result = {};

    dataSource.forEach((config) => {
      // 初始化结果容器
      result[config.label] = {
        label: config.label,
        color: config.color,
        sourceValues: config.values, // 保留原始定义的 ID 范围
        list: [], // 存放匹配到的后端数据
      };

      // 填充索引表
      config.values.forEach((id) => {
        idToConfigMap[id] = config.label;
      });
    });

    // 2. 遍历后端数据并分发
    backendData.forEach((poi) => {
      // 优先匹配 category_id，如果没有，可以遍历 category_list
      const targetLabel = idToConfigMap[poi.category_id];

      if (targetLabel) {
        result[targetLabel].list.push(poi);
      } else {
        // 可选：处理未匹配到的数据
        if (!result['其他']) {
          result['其他'] = { label: '其他', color: '#999', list: [] };
        }
        result['其他'].list.push(poi);
      }
    });

    return result;
  };
  // 请求POI点位
  const handlePoi = async (queryParams: any) => {
    try {
      if (!formData.value.fenceParams.path?.length) {
        message.warning('请先绘制围栏');
        return;
      }
      loading.value = true;
      // 业态数据，这是个二维数组，拍平成一维数组
      const categoryLists = (queryParams?.selectedTypes || [])
        .map((item: any) => item?.values)
        .flat();
      // 品牌数据
      const brandLists = [];

      if (queryParams?.otherPoiType === 'category') {
        const categorys = queryParams?.otherCategoryDetails.map((item: any) => item?.value);
        categoryLists.push(...categorys);
      } else {
        brandLists.push(...queryParams?.otherBrandDetails.map((item: any) => item?.value));
      }
      // 参数处理，去重
      const params = {
        brand_list: [...new Set(brandLists)].join(','),
        category_list: [...new Set(categoryLists)].join(','),
        // polygon: mockFence,
        polygon: formData.value.fenceParams.path || [],
      };
      // 这里可以对接后续分析逻辑,暂时使用模拟数据
      const res = await getSceneSearch(params);
      // const res = {
      //   items: mockPoi,
      // };
      // 数据源整合
      const typeDataSource = [
        ...queryParams.selectedTypes,
        ...(queryParams.otherCategoryDetails || []).map((item) => ({
          ...item,
          values: [item.value],
        })),
        ...(queryParams.otherBrandDetails || []).map((item) => ({ ...item, values: [item.value] })),
      ];

      const newPoiData = managePoiDataWithStyle(typeDataSource, res?.items || []);

      // 合并新增的数据
      poiDetailData.value = {
        ...poiDetailData.value,
        ...newPoiData,
      };

      // poi数据重组
      const poiData = Object.values(poiDetailData.value).reduce((pre: any, cur: any) => {
        // 数据处理
        const list = cur.list.map((item) => {
          return {
            ...item,
            location: [item.location.lng, item.location.lat],
            name: item.poi_name,
            id: item.poi_id,
            color: cur.color || '#4D6AFF',
            image: getCircleIcon(cur.color || '#4D6AFF'),
            path: item.fence || [],
          };
        });
        pre.push(...list);
        return pre;
      }, []);
      // 数据处理
      renderPoiLayer(poiData);
    } finally {
      loading.value = false;
    }
  };
  // 渲染围栏数据
  const renderFence = (queryParams: any) => {
    // 渲染围栏
    mapConstorRef.value.create(queryParams.fenceParams, queryParams.fenceParams.type);
  };
  // 渲染围栏与热力图/网格
  const renderHeatmapAndGrid = (data: any, queryParams: any) => {
    if (queryParams?.population?.heatmap) {
      // 渲染热力图
      mapVisualizerRef.value.createHeatMap(data, queryParams?.population?.size);
    }
    if (queryParams?.population?.grid) {
      // 渲染网格
      mapVisualizerRef.value.createGridMap(data, {
        gridRadius: queryParams?.population?.size,
        showText: queryParams?.population?.gridPopulation,
      });
    }
    // 如果都关闭了那么就销毁
    if (!queryParams?.population?.heatmap && !queryParams?.population?.grid) {
      mapVisualizerRef.value.clearVisualLayers();
    }
  };

  // 渲染POI点位图层
  const renderPoiLayer = (data: any) => {
    if (data) {
      // 渲染POI点位
      poiLayerManagerRef.value.createPoiLayer(data, () => {});
    }
  };
  // 监听数据变化
  watch(
    [
      () => formData.value.population.heatmap,
      () => formData.value.population.grid,
      () => formData.value.population.gridPopulation,
      () => formData.value.population.size,
      mapData.value,
    ],
    () => {
      // 没有数据不要渲染
      if (!mapData.value?.length) {
        return;
      }
      renderHeatmapAndGrid(mapData.value, formData.value);
    },
  );
  /**
   * 提取新数据相对于老数据的增量部分
   * @param newData 新的 POI 数据状态
   * @param oldData 旧的 POI 数据状态
   */
  const getPoiDifference = (newData: any, oldData: any) => {
    // 辅助函数：根据 key 剔除重复项，找出新增的
    const filterAdded = (newArr: any[] = [], oldArr: any[] = [], identityKey: string) => {
      const oldIds = new Set((oldArr || []).map((item) => item[identityKey]));
      return (newArr || []).filter((item) => !oldIds.has(item[identityKey]));
    };

    // 辅助函数：根据 key 找出删除的
    const filterRemoved = (newArr: any[] = [], oldArr: any[] = [], identityKey: string) => {
      const newIds = new Set((newArr || []).map((item) => item[identityKey]));
      return (oldArr || []).filter((item) => !newIds.has(item[identityKey]));
    };

    return {
      // 1. 对比常规分类 (唯一标识是 label)
      addedSelectedTypes: filterAdded(newData.selectedTypes, oldData?.selectedTypes, 'label'),
      removedSelectedTypes: filterRemoved(newData.selectedTypes, oldData?.selectedTypes, 'label'),

      // 2. 对比业态详情 (唯一标识通常是 id 或 value)
      addedCategoryDetails: filterAdded(
        newData.otherCategoryDetails,
        oldData?.otherCategoryDetails,
        'value',
      ),
      removedCategoryDetails: filterRemoved(
        newData.otherCategoryDetails,
        oldData?.otherCategoryDetails,
        'value',
      ),

      // 3. 对比品牌详情 (唯一标识是 value 或 key)
      addedBrandDetails: filterAdded(
        newData.otherBrandDetails,
        oldData?.otherBrandDetails,
        'value',
      ),
      removedBrandDetails: filterRemoved(
        newData.otherBrandDetails,
        oldData?.otherBrandDetails,
        'value',
      ),

      // 是否存在任何变动
      hasNewData: false,
    };
  };
  // 监听POI点位变化，对比出新增/删除的参数，只请求新增的查询条件，拆出来指定的更新参数
  watch(
    [
      () => formData.value.poi?.selectAll,
      () => formData.value.poi?.otherPoiType,
      () => formData.value.poi?.otherPoiValue,
      () => formData.value.poi?.selectedTypes,
      () => formData.value.poi?.otherCategoryDetails,
      () => formData.value.poi?.otherBrandDetails,
    ],
    (newVal, oldVal) => {
      if (isEqual(newVal, oldVal)) {
        return;
      }
      const newValues = {
        selectAll: newVal[0],
        otherPoiType: newVal[1],
        otherPoiValue: newVal[2],
        selectedTypes: newVal[3],
        otherCategoryDetails: newVal[4],
        otherBrandDetails: newVal[5],
      };

      const oldValues = {
        selectAll: oldVal[0],
        otherPoiType: oldVal[1],
        otherPoiValue: oldVal[2],
        selectedTypes: oldVal[3],
        otherCategoryDetails: oldVal[4],
        otherBrandDetails: oldVal[5],
      };
      const diff = getPoiDifference(newValues, oldValues);
      console.log('>>>>>>>>>>>diff', diff);

      // 处理删除的数据
      let hasRemoved = false;
      const removedLabels = new Set([
        ...(diff.removedSelectedTypes || []).map((item: any) => item.label),
        ...(diff.removedCategoryDetails || []).map((item: any) => item.label),
        ...(diff.removedBrandDetails || []).map((item: any) => item.label),
      ]);

      if (removedLabels.size > 0) {
        const newData = { ...poiDetailData.value };
        removedLabels.forEach((label) => {
          if (newData[label]) {
            delete newData[label];
            hasRemoved = true;
          }
        });
        if (hasRemoved) {
          poiDetailData.value = newData;
        }
      }

      // 检查是否有新增数据
      const hasAdded =
        diff.addedSelectedTypes.length > 0 ||
        diff.addedCategoryDetails.length > 0 ||
        diff.addedBrandDetails.length > 0;

      if (hasAdded) {
        const params = {
          ...newValues,
          selectedTypes: diff.addedSelectedTypes,
          otherCategoryDetails: diff.addedCategoryDetails,
          otherBrandDetails: diff.addedBrandDetails,
          otherPoiValue: [], // 通常增量对比时，原始的 ID 数组需要清空或重新计算
        };
        handlePoi(params);
      } else if (hasRemoved) {
        // 如果只有删除没有新增，我们需要重新渲染剩余的POI数据
        const poiData = Object.values(poiDetailData.value).reduce((pre: any, cur: any) => {
          const list = cur.list.map((item: any) => {
            return {
              ...item,
              location: [item.location.lng, item.location.lat],
              name: item.poi_name,
              id: item.poi_id,
              color: cur.color || '#4D6AFF',
              image: getCircleIcon(cur.color || '#4D6AFF'),
              path: item.fence || [],
            };
          });
          pre.push(...list);
          return pre;
        }, []);
        renderPoiLayer(poiData);
      }
    },
  );

  // 监听POI基本信息状态
  watch(
    () => formData.value.poi?.baseInfo,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        poiLayerManagerRef.value.toggleText(formData.value.poi?.baseInfo);
      }
    },
  );
  // 卸载地图
  onUnmounted(() => {
    mapVisualizerRef.value?.destroy();
    mapConstorRef.value?.destroy();
    poiLayerManagerRef.value?.destroy();
  });
</script>

<style scoped>
  .population-map {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .data-query-panel {
    top: 70px;
  }
</style>
