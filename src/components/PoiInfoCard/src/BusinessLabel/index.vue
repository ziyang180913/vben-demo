<template>
  <div class="business-label">
    <OuterDiv
      v-for="item in labelList"
      :key="item"
      :title="item"
      :tips="tipsContentVNode"
      :other-title="`【有消费行为平均次数${processedData[item]?.num1 ?? 0}次/整体平均次数：${processedData[item]?.num ?? 0}次】`"
    >
      <div class="chart-container">
        <div class="chart-wrapper">
          <PieChart
            :data="getChartData(processedData[item]?.zb)"
            :height="280"
            :radius="0.7"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </div>
        <div class="chart-divider" />
        <div class="chart-wrapper">
          <PieChart
            :data="getChartData(processedData[item]?.bl)"
            :height="280"
            :radius="0.7"
            :inner-radius="0.5"
            :colors="pieColorBL"
          />
        </div>
      </div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import { computed, h } from 'vue';
  import OuterDiv from '../OuterDiv/index.vue';
  import { PieChart } from '@/components/Echart/PieChart';
  import { TipsExplain } from '@/components/TipsExplain';
  import tipsContent from './tips-content';

  // 饼图颜色配置
  const pieColor = ['#4D6AFF', '#FF7A7D'];
  const pieColorBL = ['#4D6AFF', '#FF7A7D', '#B57FEE', '#36CBCB', '#4DCB73'];

  // 消费标签列表
  const labelList = [
    '咖啡消费',
    '奶茶消费',
    '面包消费',
    '亲子玩乐消费',
    '亲子培训消费',
    '亲子购物消费',
    '医美消费',
    '美容院消费',
    '化妆品消费',
    '养生保健消费',
    '运动健身消费',
    '大超市消费',
    '服饰鞋靴消费',
    '电影院消费',
    'KTV消费',
    '酒吧消费',
    '休闲运动消费',
    '旅游景点消费',
    '药店消费',
    '宠物消费',
    '外国餐厅消费',
    '特色美食消费',
    '简餐快餐消费',
    '中餐消费',
  ];

  // 提示内容组件
  const tipsContentVNode = h(TipsExplain, { content: tipsContent });

  interface DataItem {
    type: string;
    city: string;
    percent: number;
    value: number;
  }

  interface RatioData {
    无消费行为人口占比?: number;
    有消费行为人口占比?: number;
    [key: string]: number | undefined;
  }

  interface PeopleData {
    整体平均次数?: number;
    有消费行为平均次数?: number;
  }

  interface CategoryData {
    比例: RatioData;
    人数: PeopleData;
  }

  interface Props {
    data?: Record<string, CategoryData>;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  /**
   * 处理原始数据为图表所需格式
   * @param obj - 原始数据对象
   * @returns 处理后的数据数组
   */
  const handleData = (obj: Record<string, number | undefined>): DataItem[] => {
    return Object.keys(obj).map((key) => {
      const val = obj[key] ?? 0;
      return {
        type: key,
        city: key,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  };

  /**
   * 获取图表数据，过滤无效数据
   * @param data - 图表数据数组
   * @returns 过滤后的数据数组
   */
  const getChartData = (data?: DataItem[]): DataItem[] => {
    if (!data || data.length === 0) return [];
    return data;
  };

  // 处理后的数据
  const processedData = computed(() => {
    const result: Record<
      string,
      {
        zb: DataItem[];
        bl: DataItem[];
        num: string;
        num1: string;
      }
    > = {};

    Object.keys(props.data).forEach((item) => {
      const categoryData = props.data[item];
      if (!categoryData) return;

      const { 无消费行为人口占比, 有消费行为人口占比, ...rest } = categoryData['比例'];

      // 获取占比数据（有无消费行为）
      const zb = handleData({ 有消费行为人口占比, 无消费行为人口占比 });
      // 获取次数比例数据
      const bl = handleData(rest);

      // 获取平均次数
      const ratio = categoryData['人数']?.整体平均次数;
      const ratio1 = categoryData['人数']?.有消费行为平均次数;
      const num = ratio ? ratio.toFixed(2) : '0';
      const num1 = ratio1 ? ratio1.toFixed(2) : '0';

      result[item] = {
        zb,
        bl,
        num,
        num1,
      };
    });

    return result;
  });
</script>

<style lang="less" scoped>
  .business-label {
    .chart-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 280px;
    }

    .chart-wrapper {
      flex: 1;
      max-width: 420px;
      margin: 0 auto;
    }

    .chart-divider {
      width: 1px;
      height: 100%;
      margin: 0 20px;
      background-color: @border-color-split;
    }
  }
</style>
