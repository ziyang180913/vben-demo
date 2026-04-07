<template>
  <div class="poi-card-number-of-people">
    <Spin :spinning="loading">
      <div class="header-row">
        <div class="quarter-section">
          <span class="quarter-label">季度选择：</span>
          <DatePicker
            v-model:value="quarterValue"
            picker="quarter"
            :disabled-date="disabledDate"
            style="width: 200px"
            @change="handleQuarterChange"
          />
        </div>
        <Button type="primary" @click="onExport">导出</Button>
      </div>

      <div class="traffic-label">
        <OuterDiv title="数量统计">
          <div class="chart-wrapper">
            <GroupColumnPlot
              :data="chartData"
              :height="320"
              :colors="chartColor"
              :legend="true"
              :label="true"
              :bar-max-width="100"
              bar-gap="10%"
              bar-category-gap="25%"
            />
          </div>
        </OuterDiv>
      </div>
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { DatePicker, Button, Spin } from 'ant-design-vue';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import OuterDiv from '../OuterDiv/index.vue';
  import GroupColumnPlot from '@/components/Echart/GroupColumnPlot/GroupColumnPlot.vue';
  import { jsonToSheetXlsx } from '@/components/Excel';

  interface ChartDataItem {
    group: string;
    series: string;
    value: number;
  }

  interface Props {
    params?: Record<string, any>;
    curLabel?: { label?: string };
  }

  const props = withDefaults(defineProps<Props>(), {
    params: () => ({}),
    curLabel: () => ({}),
  });

  // 图表颜色
  const chartColor = ['#4D6AFF', '#4DCB73', '#36CBCB', '#B57FEE', '#FF7A7D', '#5B8BEE', '#FAD337'];

  // 加载状态
  const loading = ref(false);

  // 当前选中的季度
  const curMonth = ref('2024-Q1');
  const quarterValue = ref<Dayjs>(dayjs('2024-03'));

  // 模拟数据 - 按季度组织
  const mockData: Record<string, Record<string, number>> = {
    '2024-Q4': {
      工作人口: 135000,
      居住人口: 180000,
      常驻人口: 218000,
    },
  };

  // 获取所有季度列表（用于展示）
  const allQuarters = computed(() => Object.keys(mockData).sort());

  // 当前选中的季度索引
  const currentIndex = computed(() => allQuarters.value.indexOf(curMonth.value));

  // 显示最近6个季度的数据（让图表更饱满）
  const displayQuarters = computed(() => {
    const quarters = allQuarters.value;
    const idx = currentIndex.value;

    // 显示当前季度及前5个季度（共6个季度）
    let start = Math.max(0, idx - 5);
    let end = idx + 1;

    // 如果后面还有数据，也显示一些
    if (end < quarters.length) {
      const remaining = 6 - (end - start);
      end = Math.min(quarters.length, end + remaining);
    }

    // 如果前面不够，从后面补
    if (end - start < 6 && start > 0) {
      start = Math.max(0, end - 6);
    }

    return quarters.slice(start, end);
  });

  // 图表数据 - 转换为 GroupColumnPlot 需要的格式
  const chartData = computed<ChartDataItem[]>(() => {
    const data: ChartDataItem[] = [];
    displayQuarters.value.forEach((quarter) => {
      const quarterData = mockData[quarter];
      Object.keys(quarterData).forEach((series) => {
        data.push({
          group: quarter,
          series,
          value: quarterData[series],
        });
      });
    });
    return data;
  });

  // 模拟异步请求获取数据
  const fetchMockData = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };

  // 获取数据
  const getData = async () => {
    loading.value = true;
    try {
      await fetchMockData();
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 处理季度选择变化
  const handleQuarterChange = (_date: Dayjs, dateString: string) => {
    curMonth.value = dateString;
    getData();
  };

  // 禁用日期
  const disabledDate = (current: Dayjs) => {
    const start = current && current < dayjs('2023-06').endOf('month');
    const end = current && current > dayjs().subtract(3, 'month').endOf('quarter');
    return start || end;
  };

  // 导出
  const onExport = () => {
    const quarters = displayQuarters.value;
    const exportData = quarters.map((q) => ({
      季度: q,
      工作人口: mockData[q]['工作人口'],
      居住人口: mockData[q]['居住人口'],
      常驻人口: mockData[q]['常驻人口'],
    }));

    const exeTitle = props?.curLabel?.label || '人群数量统计';
    const excelName = `${exeTitle}-${curMonth.value}.xlsx`;

    jsonToSheetXlsx({
      data: exportData,
      filename: excelName,
      sheetName: '人群数量统计',
    });
  };

  // 组件挂载时获取数据
  onMounted(() => {
    getData();
  });
</script>

<style lang="less" scoped>
  @import './index.less';
</style>
