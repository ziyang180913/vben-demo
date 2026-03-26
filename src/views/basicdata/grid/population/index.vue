<template>
  <div class="population-map">
    <Loading :loading="loading" absolute />

    <div v-if="activeFences.length > 0" class="fence-manager-header">
      <div
        v-for="fence in activeFences"
        :key="fence.key"
        class="fence-tag"
        :class="{ 'is-active': currentActiveKey === fence.key }"
        @click="switchFence(fence.key)"
      >
        <CopyOutlined @click.stop="copyFenceToClipboard(fence.key)" />
        <span class="fence-name">{{ fence.name }}</span>
        <span class="fence-delete-icon" @click.stop="removeFence(fence.key)">
          <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
            <path
              d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
            />
          </svg>
        </span>
      </div>
    </div>

    <TemplateMap
      isMapConstor
      ref="aMapRef"
      :initMapEvent="initMap"
      :mapConstorProps="mapConstorProps"
    />

    <DataQueryPanel
      v-model:open="isPanelOpen"
      v-model:formData="formData"
      :infoText="infoText"
      @analyze="() => handleAnalyze(formData)"
    />

    <AreaInfoDrawer
      v-model:open="isPanelOpen"
      :populationData="allPopulationData"
      :facilityData="allFacilityData"
      v-model:currentActiveKey="currentActiveKey"
      @handle-edit-fence-name="handleEditFenceName"
      @switch-fence="switchFence"
      @edit-fence="handleEditFenceFromDrawer"
    />

    <div v-if="formData.population.grid && mapMax > 0" class="population-color-block">
      <div class="population-color-block-content">
        <div
          v-for="(color, index) in legendColors"
          :key="color"
          class="population-color-block-item"
        >
          <div class="population-color-block-item-color" :style="{ backgroundColor: color }"></div>
          <div>{{ calculateLegendRange(index) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, h, watch, onUnmounted, computed, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { cloneDeep } from 'lodash-es';
  import { CopyOutlined } from '@ant-design/icons-vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import { DataQueryPanel } from '@/components/DataQueryPanel';
  import AreaInfoDrawer from './components/AreaInfoDrawer.vue';
  import { Button } from '@/components/Button';
  import Loading from '@/components/Loading/src/Loading.vue';
  import { fetchGridPopulation } from '@/api/basicdata/grid';
  import { getSceneSearch } from '@/api/global';
  import { getCircleIcon } from '@/utils/aMap/icons';
  import { copyText } from '@/utils/copyTextToClipboard';
  import { INITIAL_POPULATION, INITIAL_POI, GRID_COLORS, DRAW_STYLE, legendColors } from './config';

  /** --- 状态管理 (数据实例分离) --- */
  const loading = ref(false);
  const isPanelOpen = ref(false);
  const aMapRef = ref<any>(null);
  const infoText = ref('暂无围栏信息');
  const mapMax = ref(0);
  const mapMin = ref(0);
  const currentActiveKey = ref<string>('');
  const isSwitching = ref(false);
  const activeFences = ref<{ key: string; name: string }[]>([]);

  // 1. 业务数据状态：全响应式，负责 UI 渲染和计算属性
  const fenceStates = reactive(
    new Map<
      string,
      {
        name: string;
        params: any;
        rawData: any[];
        poiRawData: any[];
        markerVisible: boolean;
      }
    >(),
  );

  // 2. 地图物理实例：非响应式，负责地图底层操作
  const mapResources = new Map<
    string,
    {
      fenceOverlays: any; // 主围栏 OverlayGroup
      poiFenceGroup?: any; // POI 围栏 OverlayGroup
      grid?: any; // Loca 网格图层
      heatmap?: any; // Loca 热力图层
      poi?: any; // Loca POI 点位图层
    }
  >();

  let mapInstance: any = null;
  let locaContainer: any = null;

  const formData = ref({
    fenceParams: {} as any,
    population: cloneDeep(INITIAL_POPULATION),
    poi: cloneDeep(INITIAL_POI),
  });

  /** --- 计算属性 (基于 fenceStates) --- */
  const allPopulationData = computed(() => {
    return Array.from(fenceStates.entries()).map(([key, state], index) => {
      const totalCount = state.rawData.reduce((sum, item) => sum + (item.count || 0), 0);
      const { type, path, value } = state.params.fenceParams;
      let area = 0;
      if ((window as any).AMap?.GeometryUtil) {
        area =
          type === 'circle'
            ? (Math.PI * Math.pow(value, 2)) / 1000000
            : (window as any).AMap.GeometryUtil.ringArea(path) / 1000000;
      }
      return {
        id: key,
        color: key === currentActiveKey.value ? '#ff4d4f' : legendColors[index],
        name: state.name,
        resident: totalCount,
        living: Math.floor(totalCount * 0.65),
        working: Math.floor(totalCount * 0.35),
        young: Math.floor(totalCount * 0.42),
        area: area || 0.001,
      };
    });
  });

  const allFacilityData = computed(() => {
    const allPois: any[] = [];
    fenceStates.forEach((state, key) => {
      if (state.poiRawData) {
        state.poiRawData.forEach((poi) => {
          allPois.push({ ...poi, fenceId: key });
        });
      }
    });
    return allPois;
  });

  const poiFingerprint = computed(() => {
    const p = formData.value.poi;
    return JSON.stringify([
      p.selectedTypes,
      p.otherCategoryDetails,
      p.otherBrandDetails,
      p.otherPoiType,
    ]);
  });

  /** --- 地图组件交互逻辑 --- */
  const initMap = (map: any) => {
    mapInstance = map;
    locaContainer = new (window as any).Loca.Container({ map });
  };

  const renderHeatmapAndGrid = (data: any[], queryParams: any, key: string) => {
    const res = mapResources.get(key);
    if (!res) return;

    // 清理旧 Loca 图层
    if (res.grid) locaContainer.remove(res.grid);
    if (res.heatmap) locaContainer.remove(res.heatmap);

    const { heatmap, grid, size, gridPopulation } = queryParams.population;
    if ((!heatmap && !grid) || !data.length) return;

    const source = new (window as any).Loca.GeoJSONSource({
      data: {
        type: 'FeatureCollection',
        features: data.map((item) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
          properties: { value: item.count },
        })),
      },
    });

    if (heatmap) {
      const hl = new (window as any).Loca.HeatMapLayer({ zIndex: 10 });
      hl.setSource(source, {
        radius: size === 40 ? 56 : Number(size) * 2,
        gradient: {
          0: '#0000ff',
          0.1: '#0000ff',
          0.5: '#75d3f8',
          0.7: '#00ff00',
          0.9: '#ffea00',
          1.0: '#ff0000',
        },
        unit: 'meter',
        value: (_: any, feat: any) => feat.properties.value,
        max: Math.max(...data.map((d) => d.count), 100) * 0.5,
      });
      locaContainer.add(hl);
      res.heatmap = hl;
    }

    if (grid) {
      const gl = new (window as any).Loca.GridLayer({ zIndex: 10 });
      gl.setSource(source);
      gl.setStyle({
        unit: 'meter',
        radius: size / 1.5,
        gap: 0,
        value: (_: any, feat: any) =>
          feat.coordinates.reduce((s: number, c: any) => s + c.properties.value, 0),
        topColor: (_: any, item: any) => {
          const idx = Math.floor((item.value / item.max) * 10);
          return GRID_COLORS[idx < 0 ? 0 : idx > 9 ? 9 : idx];
        },
        label: {
          text: {
            content: (_: any, feat: any) => (gridPopulation ? String(feat.value) : ''),
            offset: [0, 10],
            style: { fontSize: 12, fillColor: '#fff' },
          },
        },
      });
      locaContainer.add(gl);
      res.grid = gl;
      // 更新图例范围
      setTimeout(() => {
        const labels = gl.getLabelsLayer().getAllOverlays();
        if (labels.length > 0) {
          const ext = labels[0].getExtData();
          mapMax.value = ext?.max || 0;
          mapMin.value = ext?.min || 0;
        }
      }, 300);
    }
  };

  const renderFenceShape = (key: string) => {
    const state = fenceStates.get(key);
    const res = mapResources.get(key);
    if (!state || !res) return;

    res.fenceOverlays.clearOverlays();
    const { type, path, value, lng, lat } = state.params.fenceParams;
    const isActive = key === currentActiveKey.value;

    // 逻辑：激活时为红色高亮，非激活时使用其分配的专属颜色
    const displayColor = isActive ? '#ff0000' : state.color;

    const style = {
      ...DRAW_STYLE,
      fillColor: displayColor,
      strokeColor: displayColor,
      fillOpacity: 0,
      zIndex: isActive ? 10 : 8,
    };

    let shape: any;
    if (type === 'circle' && lng && lat) {
      shape = new (window as any).AMap.Circle({
        center: [lng, lat],
        extData: { isFinished: true },
        radius: value,
        ...style,
      });
    } else if (type === 'polygon' && path?.length) {
      shape = new (window as any).AMap.Polygon({ path, extData: { isFinished: true }, ...style });
    }

    if (shape) {
      shape.on('click', () => {
        if (state.markerVisible === false) state.markerVisible = true;
        switchFence(key);
      });
      res.fenceOverlays.addOverlay(shape);
    }

    // 绘制面积标签
    if (state.markerVisible !== false) {
      const area = (window as any).AMap.GeometryUtil.ringArea(
        type === 'circle' ? shape.getPath() : path,
      );
      const contentDom = document.createElement('div');
      contentDom.className = `fence-area-tag ${isActive ? 'active' : ''}`;
      contentDom.style.borderColor = displayColor;
      contentDom.innerHTML = `
        <span class="area-text">${state.name}: ${(area / 1000000).toFixed(3)}km²</span>
        <span class="close-btn" style="margin-left: 8px; cursor: pointer;">×</span>
      `;

      contentDom.querySelector('.close-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        state.markerVisible = false;
        renderFenceShape(key);
      });

      const marker = new (window as any).AMap.Marker({
        position: path[0] || [lng, lat],
        content: contentDom,
        anchor: 'bottom-center',
        zIndex: 100,
      });
      res.fenceOverlays.addOverlay(marker);
    }
  };

  const refreshPoiRender = (key: string) => {
    const state = fenceStates.get(key);
    const res = mapResources.get(key);
    if (!state || !res) return;

    if (res.poi) locaContainer.remove(res.poi);
    if (res.poiFenceGroup) {
      res.poiFenceGroup.clearOverlays();
      mapInstance.remove(res.poiFenceGroup);
    }

    // 1. 渲染 POI 围栏
    const validFences = state.poiRawData.filter((v) => v.fence?.length > 0);
    if (validFences.length > 0) {
      const overlayGroup = new (window as any).AMap.OverlayGroup();
      validFences.forEach((poi) => {
        const polygon = new (window as any).AMap.Polygon({
          path: poi.fence,
          fillColor: poi.color,
          fillOpacity: 0.2,
          strokeColor: poi.color,
          strokeWeight: 2,
          zIndex: 90,
          bubble: true,
        });
        overlayGroup.addOverlay(polygon);
      });
      mapInstance.add(overlayGroup);
      res.poiFenceGroup = overlayGroup;
    }

    // 2. 渲染 POI 点位
    const pl = new (window as any).Loca.LabelsLayer({ zIndex: 100 });
    pl.setSource(
      new (window as any).Loca.GeoJSONSource({
        data: {
          type: 'FeatureCollection',
          features: state.poiRawData.map((v) => ({
            type: 'Feature',
            properties: { ...v },
            geometry: { type: 'Point', coordinates: v.location },
          })),
        },
      }),
    );

    pl.setStyle({
      icon: { type: 'image', image: (_: any, f: any) => f.properties.image, size: [20, 20] },
      text: state.params.poi.baseInfo
        ? {
            content: (_: any, feat: any) => ` ${feat.properties.name} `,
            style: (_: any, feat: any) => ({
              fontSize: 12,
              fillColor: '#fff',
              padding: [5, 10],
              backgroundColor: feat.properties.color,
              borderColor: '#fff',
              borderWidth: 1,
            }),
            direction: 'bottom',
          }
        : undefined,
    });
    locaContainer.add(pl);
    res.poi = pl;
  };

  /** --- 核心业务逻辑 --- */
  const handleAnalyze = async (queryParams: any) => {
    const key = getFenceKey(queryParams);
    if (!key) return message.warning('请先绘制围栏');

    loading.value = true;
    try {
      const { population, fenceParams } = queryParams;
      const resData = await fetchGridPopulation({
        ...population,
        month: dayjs(population?.month).format('YYYY-[Q]Q'),
        query_type: fenceParams.type === 'circle' ? 'circle' : 'polygon',
        polygon: [...(fenceParams?.path || []), (fenceParams?.path || []).at(0)],
        location:
          fenceParams.lng && fenceParams.lat ? `${fenceParams.lng},${fenceParams.lat}` : undefined,
        radius: fenceParams.value,
      });

      const rawData = resData?.map((item: any) => ({
        lng: item?.center_loc?.lng,
        lat: item?.center_loc?.lat,
        count: item?.cnt || 0,
      }));

      // 如果是新围栏，初始化状态和实例
      if (!fenceStates.has(key)) {
        // B. 存入全响应式状态 (驱动 UI)
        fenceStates.set(key, {
          name: infoText.value,
          params: cloneDeep(queryParams),
          rawData,
          poiRawData: [],
          markerVisible: true,
        });

        // C. 存入非响应式实例 (管理地图)
        const fenceOverlays = new (window as any).AMap.OverlayGroup();
        mapInstance.add(fenceOverlays);
        mapResources.set(key, { fenceOverlays });

        activeFences.value.push({ key, name: infoText.value });
      } else {
        const state = fenceStates.get(key)!;
        state.rawData = rawData;
        state.params.population = cloneDeep(population);
      }

      currentActiveKey.value = key;
      renderHeatmapAndGrid(rawData, queryParams, key);
      // 重绘所有围栏以更新颜色状态
      fenceStates.forEach((_, k) => renderFenceShape(k));

      // 分析完清除绘图工具的蓝框
      aMapRef.value?.mapConstorRef?.clearAll();
    } finally {
      loading.value = false;
    }
  };

  const handlePoiRequest = async () => {
    const key = currentActiveKey.value;
    if (!key || !fenceStates.has(key) || isSwitching.value) return;

    const state = fenceStates.get(key)!;
    const config = formData.value.poi;
    const categoryLists = (config?.selectedTypes || []).map((i: any) => i?.values).flat();
    if (config?.otherPoiType === 'category')
      categoryLists.push(...config?.otherCategoryDetails.map((i: any) => i?.value));
    const brandLists =
      config?.otherPoiType === 'brand' ? config?.otherBrandDetails.map((i: any) => i?.value) : [];

    if (categoryLists.length === 0 && brandLists.length === 0) {
      state.poiRawData = [];
      refreshPoiRender(key);
      return;
    }

    loading.value = true;
    try {
      const res = await getSceneSearch({
        brand_list: brandLists.join(','),
        category_list: categoryLists.join(','),
        polygon: state.params.fenceParams.path || [],
      });

      const typeDataSource = [
        ...config.selectedTypes,
        ...config.otherCategoryDetails.map((i: any) => ({ ...i, values: [i.value] })),
        ...config.otherBrandDetails.map((i: any) => ({ ...i, values: [i.value] })),
      ];
      const idToLabel: any = {};
      const labelToColor: any = {};
      typeDataSource.forEach((c) => {
        labelToColor[c.label] = c.color || '#4B85FF';
        c.values.forEach((id: any) => {
          idToLabel[id] = c.label;
        });
      });

      state.poiRawData = res?.items?.map((poi: any) => {
        const label = idToLabel[poi.category_id] || '其他';
        const color = labelToColor[label] || '#4B85FF';
        return {
          label,
          addr: poi?.address,
          info: poi?.info,
          fence: poi?.fence || [],
          color,
          location: [poi.location.lng, poi.location.lat],
          name: poi.poi_name,
          image: getCircleIcon(color),
        };
      });
      state.params.poi = cloneDeep(config);
      refreshPoiRender(key);
    } finally {
      loading.value = false;
    }
  };

  const removeFence = (key: string) => {
    const res = mapResources.get(key);
    if (res) {
      // 1. 物理移除地图图层
      if (res.grid) locaContainer.remove(res.grid);
      if (res.heatmap) locaContainer.remove(res.heatmap);
      if (res.poi) locaContainer.remove(res.poi);
      if (res.poiFenceGroup) {
        res.poiFenceGroup.clearOverlays();
        mapInstance.remove(res.poiFenceGroup);
      }
      res.fenceOverlays.clearOverlays();
      res.fenceOverlays.setMap(null); // 断开地图引用
      mapInstance.remove(res.fenceOverlays);

      // 2. 清理 Map 管理器
      mapResources.delete(key);
      fenceStates.delete(key);
      activeFences.value = activeFences.value.filter((f) => f.key !== key);

      // 3. 处理焦点切换
      if (currentActiveKey.value === key) {
        if (activeFences.value.length > 0) {
          switchFence(activeFences.value[0].key);
        } else {
          currentActiveKey.value = '';
          aMapRef.value?.mapConstorRef?.clearAll();
        }
      }
    }
  };

  const switchFence = (key: string) => {
    if (currentActiveKey.value === key) return;
    isSwitching.value = true;
    currentActiveKey.value = key;
    const state = fenceStates.get(key);
    if (state) {
      formData.value = cloneDeep(state.params);
      infoText.value = state.name;
      // 重绘所有围栏以更新高亮状态
      fenceStates.forEach((_, k) => renderFenceShape(k));
    }
    nextTick(() => {
      isSwitching.value = false;
    });
  };

  /** --- 辅助函数 --- */
  const getFenceKey = (params: any) => {
    const p = params.fenceParams || params;
    if (!p?.type) return '';
    return p.type === 'circle'
      ? `circle_${p.lng}_${p.lat}_${p.radius}`
      : `poly_${JSON.stringify(p.path)}`;
  };

  const calculateLegendRange = (index: number) => {
    const step = mapMax.value / GRID_COLORS.length;
    return `${index === 0 ? mapMin.value : Math.floor(step * index) + 1} ~ ${Math.floor(step * (index + 1))}`;
  };

  const copyFenceToClipboard = (key: string) => {
    const state = fenceStates.get(key);
    if (state) copyText(state.params.fenceParams.path);
  };

  const handleEditFenceFromDrawer = (item: any) => {
    switchFence(item.id);
    isPanelOpen.value = true;
  };

  // 修改围栏名称
  const handleEditFenceName = (key: string, name: string) => {
    const state = fenceStates.get(key);
    if (state) state.name = name;
    infoText.value = name;
    activeFences.value.forEach((f) => {
      if (f.key === key) f.name = name;
    });
  };

  /** --- 监听与生命周期 --- */
  watch(
    [
      () => formData.value.population.heatmap,
      () => formData.value.population.grid,
      () => formData.value.population.gridPopulation,
    ],
    () => {
      const key = currentActiveKey.value;
      if (key && fenceStates.has(key) && !isSwitching.value) {
        fenceStates.get(key)!.params.population = cloneDeep(formData.value.population);
        renderHeatmapAndGrid(fenceStates.get(key)!.rawData, formData.value, key);
      }
    },
  );

  watch(
    () => formData.value.poi.baseInfo,
    () => {
      const key = currentActiveKey.value;
      if (key && fenceStates.has(key) && !isSwitching.value) {
        fenceStates.get(key)!.params.poi.baseInfo = formData.value.poi.baseInfo;
        refreshPoiRender(key);
      }
    },
  );

  watch(poiFingerprint, (newV, oldV) => {
    if (newV !== oldV) handlePoiRequest();
  });

  onUnmounted(() => {
    mapResources.forEach((res) => {
      if (res.grid) locaContainer.remove(res.grid);
      if (res.heatmap) locaContainer.remove(res.heatmap);
      if (res.poi) locaContainer.remove(res.poi);
      if (res.poiFenceGroup) res.poiFenceGroup.setMap(null);
      res.fenceOverlays.setMap(null);
    });
    if (locaContainer) locaContainer.destroy();
  });

  const mapConstorProps = reactive({
    isOk: true,
    mapOperate: ['circle', 'polygon', 'position', 'rule', 'enter', 'hand'],
    callback: (item: any, type: string) => {
      aMapRef.value?.mapConstorRef?.clearAll();
      const key = getFenceKey({ fenceParams: { ...item, type } });
      isSwitching.value = true;
      isPanelOpen.value = true;
      infoText.value = type === 'polygon' ? '自定义围栏' : item?.name || '圆形围栏';
      if (!fenceStates.has(key)) {
        formData.value = {
          fenceParams: { ...item, type },
          population: cloneDeep(INITIAL_POPULATION),
          poi: cloneDeep(INITIAL_POI),
        };
      } else {
        formData.value = cloneDeep(fenceStates.get(key)!.params);
      }
      nextTick(() => {
        isSwitching.value = false;
        handleAnalyze(formData.value);
      });
    },
    selectingPointsProps: {
      footer: ({ handelFooterClick, btnLoading }: any) =>
        h('div', { class: 'footer' }, [
          h(Button, { onClick: () => aMapRef.value?.mapConstorRef?.clearAll() }, '清除绘制'),
          h(
            Button,
            { type: 'primary', loading: btnLoading, onClick: handelFooterClick },
            '开始分析',
          ),
        ]),
    },
  });
</script>

<style scoped lang="less" src="./index.less"></style>
