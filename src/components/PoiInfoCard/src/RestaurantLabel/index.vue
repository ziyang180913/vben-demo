<template>
  <div class="restaurant-label">
    <OuterDiv
      v-for="item in labelList"
      :key="item.value"
      :title="item.label"
      :other-title="formatOtherTitle(item, processedData[item.label]?.count)"
      :tips="tipsContentVNode"
    >
      <div class="chart-wrapper">
        <ColumnPlot
          :data="processedData[item.label]?.data || []"
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

    <OuterDiv
      title="饮酒标签"
      :other-title="`【平均月次数: ${processedData['饮酒标签']?.count || 0}】`"
      :tips="tipsContentVNode"
    >
      <div class="drink-chart-container">
        <div class="drink-chart-wrapper">
          <PieChart
            :data="processedData['饮酒标签']?.data2 || []"
            :height="280"
            :radius="0.7"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </div>
        <div class="chart-divider"></div>
        <div class="drink-chart-wrapper">
          <PieChart
            :data="processedData['饮酒标签']?.data1 || []"
            :height="280"
            :radius="0.7"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </div>
      </div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import { computed, h } from 'vue';
  import type { EChartsOption } from 'echarts';
  import OuterDiv from '../OuterDiv/index.vue';
  import { ColumnPlot } from '@/components/Echart/ColumnPlot';
  import { PieChart } from '@/components/Echart/PieChart';
  import { TipsExplain } from '@/components/TipsExplain';
  import tipsContent from './tips-content';

  interface DataItem {
    type: string;
    city: string;
    percent: number;
    value: number;
  }

  interface LabelItem {
    label: string;
    value: string;
    otherTitle: string;
  }

  interface Props {
    data?: Record<string, any>;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  const pieColor = ['#4D6AFF', '#FF7A7D', '#4DCB73'];

  const labelList: LabelItem[] = [
    {
      label: '月餐饮消费额度',
      value: '1',
      otherTitle: '月均消费额',
    },
    {
      label: '餐饮单价分布',
      value: '2',
      otherTitle: '平均客单价',
    },
  ];

  const tipsContentVNode = h(TipsExplain, { content: tipsContent });

  /**
   * 格式化副标题
   * @param item - 标签配置
   * @param count - 数值
   * @returns 格式化后的副标题
   */
  const formatOtherTitle = (item: LabelItem, count?: string | number): string => {
    return `【${item.otherTitle}: ${count || 0}元】`;
  };

  /**
   * 处理原始数据为图表所需格式
   * @param obj - 原始数据对象
   * @returns 处理后的数据数组
   */
  const handleData = (obj?: Record<string, number>): DataItem[] => {
    if (!obj) return [];
    return Object.keys(obj).map((key) => {
      const val = obj[key];
      return {
        type: key,
        city: key,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  };

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

  // 处理后的数据
  const processedData = computed(() => {
    const result: Record<
      string,
      {
        data?: DataItem[];
        data1?: DataItem[];
        data2?: DataItem[];
        count: string;
      }
    > = {};

    Object.keys(props.data || {}).forEach((item) => {
      const itemData = props.data![item];
      if (!itemData) return;

      if (item === '饮酒标签') {
        const { 中频饮酒, 低频饮酒, 高频饮酒, ...rest } = itemData['比例'] || {};
        result[item] = {
          data1: handleData({ 中频饮酒, 低频饮酒, 高频饮酒 }),
          data2: handleData(rest),
          count: (itemData['平均月次数'] || 0).toFixed(1),
        };
      } else if (itemData['均值']?.['整体月均消费额'] !== undefined) {
        const { 整体月均消费额 = 0 } = itemData['均值'];
        result[item] = {
          data: handleData(itemData['比例']),
          count: 整体月均消费额.toFixed(1),
        };
      } else {
        result[item] = {
          data: handleData(itemData['比例']),
          count: (itemData['平均客单价'] || 0).toFixed(1),
        };
      }
    });

    return result;
  });
</script>

<style lang="less" scoped>
  .restaurant-label {
    .chart-wrapper {
      height: 320px;
    }

    .drink-chart-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 280px;
    }

    .drink-chart-wrapper {
      flex: 1;
      max-width: 420px;
      margin: 0 auto;
    }

    .chart-divider {
      width: 1px;
      height: 100%;
      background-color: @border-color-split;
    }
  }
</style>
