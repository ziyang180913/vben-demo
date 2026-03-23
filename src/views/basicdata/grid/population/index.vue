<template>
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
      :infoText="infoText"
      :formData="formData"
      @analyze="handleAnalyze"
    />
    <!-- 引入封装好的抽屉组件 -->
    <RightDrawers v-model:open="isPanelOpen" title="演示数据" @export="handleExport">
      <template #default>
        <div class="drawer-content">
          <!-- 这里可以展示分析结果 -->
        </div>
      </template>
    </RightDrawers>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, h } from 'vue';
  import { TemplateMap } from '@/components/Amap/TemplateMap';
  import { DataQueryPanel } from '@/components/DataQueryPanel';
  import { RightDrawers } from '@/components/RightDrawers';
  import { Button } from '@/components/Button';
  import dayjs from 'dayjs';

  const isPanelOpen = ref(false);
  // 地图实例
  const aMapRef = ref<any>(null);
  // 面板按钮 围栏信息
  const infoText = ref('暂无围栏信息');
  // 查询面板参数
  const formData = reactive({
    fences: [],
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
    },
  });

  // 地图控制工具属性
  const mapConstorProps = reactive({
    callback: (item: any, type: string) => {
      // 开启面板
      isPanelOpen.value = true;
      // 更新围栏信息
      infoText.value = type === 'polygon' ? '多边形围栏' : item?.name || '暂无围栏信息';
      formData.fences = item.path;
    },
    isOk: true,
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
    console.log('>>>>>>>>map', map);
    // aMapRef.value.initMapEvent();
  };

  // 围栏操作按钮
  const handleToolMapClear = (): void => {
    aMapRef.value.mapConstorRef.clearCover();
  };
  const handleAnalyze = (data: any) => {
    console.log('开始分析数据:', data);
    // 这里可以对接后续分析逻辑
  };
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
