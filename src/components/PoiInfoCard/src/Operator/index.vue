<template>
  <div class="operator">
    <OuterDiv title="手机运营商">
      <div class="pie-chart-container">
        <div class="pie-chart-wrapper">
          <PieChart :data="pieData" :height="266" :radius="0.8" :colors="chartColor" />
        </div>
      </div>
    </OuterDiv>
    <OuterDiv v-if="brData.length" title="宽带运营商TOP10" :style="{ marginTop: '20px' }">
      <div class="column-chart-wrapper">
        <ColumnPlot
          :data="brData"
          :height="320"
          :legend="false"
          :meta="{
            value: {
              alias: '占比',
              formatter: (v: number) => `${v}%`,
            },
          }"
          :options="columnOptions"
        />
      </div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { EChartsOption } from 'echarts';
  import OuterDiv from '../OuterDiv/index.vue';
  import { PieChart } from '@/components/Echart/PieChart';
  import { ColumnPlot } from '@/components/Echart/ColumnPlot';

  interface DataItem {
    type: string;
    percent: number;
    value: number;
    city: string;
  }

  interface Props {
    data?: {
      手机运营商?: Record<string, number>;
      wifi?: Record<string, number>;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  /**
   * 将对象转换为图表数据数组
   * @param obj - 原始数据对象
   * @returns 转换后的数据数组
   */
  const operatorPieData = (obj?: Record<string, number>): DataItem[] => {
    if (!obj) return [];
    return Object.keys(obj).map((key) => {
      const percent = obj[key];
      return {
        type: key,
        percent,
        value: Number((percent * 100).toFixed(2)),
        city: key,
      };
    });
  };

  const pieData = computed(() => operatorPieData(props.data?.['手机运营商']));
  const brData = computed(() => operatorPieData(props.data?.wifi));

  // 柱状图额外配置：顶部标签
  const columnOptions: EChartsOption = {
    series: [
      {
        label: {
          show: true,
          position: 'top',
          color: '#595959',
          fontSize: 12,
        },
      },
    ],
  };
</script>

<style lang="less" scoped>
  .operator {
    .pie-chart-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 266px;
    }

    .pie-chart-wrapper {
      width: 400px;
    }

    .column-chart-wrapper {
      height: 320px;
    }
  }
</style>
