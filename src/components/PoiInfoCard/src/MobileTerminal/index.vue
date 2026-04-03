<template>
  <div class="mobile-terminal">
    <OuterDiv
      v-for="item in labelList"
      :key="item.value"
      :title="item.label"
      :other-title="formatOtherTitle(item, processedData[item.label]?.num)"
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
        />
      </div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import { computed, h } from 'vue';
  import OuterDiv from '../OuterDiv/index.vue';
  import { ColumnPlot } from '@/components/Echart/ColumnPlot';
  import { TipsExplain } from '@/components/TipsExplain';
  import tipsContent from './tips-content';

  // 标签配置列表
  const labelList = [
    {
      label: '手机价格',
      value: 'jg',
      otherLabel: '均价',
    },
  ];

  // 提示内容组件
  const tipsContentVNode = h(TipsExplain, { content: tipsContent });

  interface DataItem {
    type: string;
    value: number;
  }

  interface CategoryData {
    比例?: number;
    [key: string]: any;
  }

  interface Props {
    data?: Record<string, Record<string, CategoryData | number>>;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  /**
   * 格式化副标题
   * @param item - 标签配置
   * @param num - 数值
   * @returns 格式化后的副标题
   */
  const formatOtherTitle = (item: (typeof labelList)[0], num?: string | number): string => {
    const value = num || 0;
    const unit = item.label === '手机价格' ? '元' : '年';
    return `【${item.otherLabel}: ${value}${unit}】`;
  };

  /**
   * 处理原始数据为图表所需格式
   * @param obj - 原始数据对象
   * @returns 处理后的数据数组
   */
  const handleData = (obj?: Record<string, CategoryData>): DataItem[] => {
    if (!obj) return [];
    return Object.keys(obj).map((key) => {
      const val = obj[key]?.['比例'] || 0;
      return {
        type: key,
        value: Number((val * 100).toFixed(2)),
      };
    });
  };

  // 处理后的数据
  const processedData = computed(() => {
    const result: Record<
      string,
      {
        data: DataItem[];
        num: string;
      }
    > = {};

    Object.keys(props.data || {}).forEach((item) => {
      const itemData = props.data[item];
      if (!itemData) return;

      if (item === '手机价格') {
        const { 手机均价, ...rest } = itemData as Record<string, CategoryData>;
        result[item] = {
          data: handleData(rest),
          num: 手机均价 ? (手机均价 as number).toFixed(2) : '0',
        };
      } else {
        const { 平均年数, ...rest } = itemData as Record<string, CategoryData>;
        result[item] = {
          data: handleData(rest),
          num: 平均年数 ? (平均年数 as number).toFixed(2) : '0',
        };
      }
    });

    return result;
  });
</script>

<style lang="less" scoped>
  .mobile-terminal {
    .chart-wrapper {
      height: 320px;
    }
  }
</style>
