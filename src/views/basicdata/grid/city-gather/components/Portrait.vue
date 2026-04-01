<template>
  <ASpin :spinning="loading">
    <div class="do-page-hotel-portrait">
      <div class="portrait-label">基础画像</div>
      <div v-for="(col, i) in config" :key="`${i}-components-title`">
        <div class="components-title">{{ col.title }}</div>
        <div :style="{ height: (col.height || 222) + 'px' }">
          <ColumnPlot
            v-if="col.type === 'ColumnPlotStack'"
            :data="data?.[col.value] || []"
            v-bind="col?.fieldProps || {}"
          />
          <PieChart
            v-else-if="col.type === 'PieChart'"
            :data="data?.[col.value] || []"
            :height="col.height || 222"
            v-bind="col?.fieldProps || {}"
          />
        </div>
      </div>
    </div>
  </ASpin>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { Spin as ASpin } from 'ant-design-vue';
  import PieChart from './PieChart.vue';
  import ColumnPlot from './ColumnPlot.vue';

  interface Props {
    callback?: (params: { date: any; checked: number }) => Promise<Record<string, any>>;
  }

  const props = defineProps<Props>();

  const loading = ref(false);
  const data = ref<Record<string, any>>({});

  const config = [
    {
      title: '性别分布',
      type: 'PieChart',
      value: 'sex',
      fieldProps: { colors: ['#FF7A7D', '#4D6AFF'] },
    },
    {
      title: '职业分布',
      type: 'ColumnPlotStack',
      value: 'career',
      height: 200,
      fieldProps: { legend: false },
    },
    {
      title: '收入区间分布',
      type: 'ColumnPlotStack',
      value: 'income',
      height: 200,
      fieldProps: { legend: false },
    },
    {
      title: '消费区间分布',
      type: 'ColumnPlotStack',
      value: 'consumption',
      height: 200,
      fieldProps: { legend: false },
    },
    {
      title: '交通方式',
      type: 'PieChart',
      value: 'car',
      fieldProps: { colors: ['#FF7A7D', '#4D6AFF'] },
    },
    {
      title: '月餐饮消费额度',
      type: 'ColumnPlotStack',
      value: 'monthConsumption',
      height: 200,
      fieldProps: { legend: false },
    },
    {
      title: '餐饮单价分布',
      type: 'ColumnPlotStack',
      value: 'catering',
      height: 200,
      fieldProps: { legend: false },
    },
  ];

  const getData = async () => {
    if (props.callback) {
      loading.value = true;
      try {
        const res = await props.callback({ date: null, checked: 1 });
        data.value = res || {};
      } catch (error) {
        console.log('error', error);
      }
      loading.value = false;
    }
  };

  onMounted(() => getData());
</script>

<style scoped>
  .do-page-hotel-portrait {
    padding: 10px;
  }

  .portrait-label {
    height: 32px;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 2px solid #4d6aff;
    background: #f5f5f6;
    color: #4d6aff;
    font-size: 16px;
    line-height: 32px;
  }

  .components-title {
    margin: 20px 0 10px;
    color: rgb(0 11 54 / 65%);
    font-size: 14px;
    font-weight: 500;
  }
</style>
