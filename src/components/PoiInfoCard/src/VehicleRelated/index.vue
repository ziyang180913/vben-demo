<template>
  <div class="vehicle-related">
    <!-- 车辆属性 -->
    <OuterDiv title="车辆属性" :tips="tipsContentVNode" :style="{ marginTop: '20px' }">
      <div class="pie-chart-container">
        <div class="pie-chart-wrapper">
          <PieChart
            :data="vehicleAttrData"
            :height="255"
            :radius="0.7"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </div>
      </div>
    </OuterDiv>

    <!-- 车辆品牌表格 -->
    <div class="table-section">
      <Table :columns="columns" :data-source="vehicleBrandData" :pagination="false" size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, h } from 'vue';
  import { Table } from 'ant-design-vue';
  import type { TableColumnType } from 'ant-design-vue';
  import OuterDiv from '../OuterDiv/index.vue';
  import { PieChart } from '@/components/Echart/PieChart';
  import { TipsExplain } from '@/components/TipsExplain';
  import tipsContent from './tips-content';

  // 饼图颜色配置
  const pieColor = ['#4D6AFF', '#FF7A7D'];

  // 提示内容组件
  const tipsContentVNode = h(TipsExplain, { content: tipsContent });

  interface DataItem {
    type: string;
    city: string;
    percent: number;
    value: number;
  }

  interface TableItem {
    index: number;
    name: string;
    bl: string;
  }

  interface Props {
    /** 车辆相关数据 */
    data?: {
      车辆属性?: Record<string, number>;
      车辆品牌?: Record<string, number>;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  // 表格列定义
  const columns: TableColumnType<TableItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center',
    },
    {
      title: '车辆品牌',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
    },
    {
      title: '比例',
      dataIndex: 'bl',
      key: 'bl',
      width: 120,
      align: 'center',
    },
  ];

  /**
   * 处理饼图数据
   * @param obj - 原始数据对象
   * @returns 转换后的图表数据数组
   */
  const processPieData = (obj?: Record<string, number>): DataItem[] => {
    if (!obj) return [];
    return Object.entries(obj).map(([key, val]) => ({
      type: key,
      city: key,
      percent: val,
      value: Number((val * 100).toFixed(2)),
    }));
  };

  /**
   * 处理表格数据
   * @param obj - 原始数据对象
   * @returns 转换后的表格数据数组
   */
  const processTableData = (obj?: Record<string, number>): TableItem[] => {
    if (!obj) return [];
    return Object.entries(obj).map(([key, val], index) => ({
      name: key,
      bl: `${(val * 100).toFixed(2)}%`,
      index: index + 1,
    }));
  };

  // 车辆属性数据（饼图）
  const vehicleAttrData = computed(() => processPieData(props.data?.['车辆属性']));

  // 车辆品牌数据（表格）
  const vehicleBrandData = computed(() => processTableData(props.data?.['车辆品牌']));
</script>

<style lang="less" scoped>
  .vehicle-related {
    .pie-chart-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 255px;
    }

    .pie-chart-wrapper {
      width: 600px;
    }

    .table-section {
      margin-top: 20px;
    }
  }
</style>
