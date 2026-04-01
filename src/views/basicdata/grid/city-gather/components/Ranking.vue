<template>
  <div class="do-page-hotel-ranking">
    <ASpin :spinning="loading">
      <div class="row">
        排名方式
        <ASelect v-model:value="value" placeholder="请选择" :options="[]" @change="getData" />
      </div>
      <CustomTable :columns="columns" :data="data" />
    </ASpin>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { Spin as ASpin, Select as ASelect } from 'ant-design-vue';
  import CustomTable from './CustomTable.vue';

  interface Props {
    callback?: (params: { value: any }) => Promise<any[]>;
  }

  const props = defineProps<Props>();

  const value = ref<any>();
  const data = ref<any[]>([]);
  const loading = ref(false);

  const columns = [
    { title: '排名', dataIndex: 'index', key: 'index', width: '60px', align: 'center' as const },
    { title: '酒店名称', dataIndex: 'name', key: 'name', width: '120px', isTooltip: true },
    { title: '酒店品牌', dataIndex: 'a', key: 'a', width: '80px', align: 'center' as const },
    { title: '酒店价格带', dataIndex: 'b', key: 'b', width: '80px', align: 'center' as const },
    { title: '酒店入住率', dataIndex: 'c', key: 'c', width: '80px', align: 'center' as const },
    { title: '房间数', dataIndex: 'd', key: 'd', width: '80px', align: 'center' as const },
    { title: '价格排名', dataIndex: 'e', key: 'e', width: '80px', align: 'center' as const },
    { title: '客户满意度', dataIndex: 'f', key: 'f', width: '80px', align: 'center' as const },
    { title: '开业年数', dataIndex: 'g', key: 'g', width: '80px', align: 'center' as const },
    { title: '得分', dataIndex: 'h', key: 'h', width: '80px', align: 'center' as const },
  ];

  const getData = async () => {
    if (props.callback) {
      loading.value = true;
      try {
        const res = await props.callback({ value: value.value });
        data.value = res || [];
      } catch (error) {
        console.log('error', error);
      }
      loading.value = false;
    }
  };

  onMounted(() => getData());
</script>

<style scoped>
  .do-page-hotel-ranking {
    height: 100%;
  }

  .row {
    display: flex;
    align-items: center;
    height: 32px;
    margin-bottom: 20px;
    color: rgb(0 11 54 / 85%);
    font-size: 14px;
  }

  .row :deep(.ant-select) {
    width: calc(100% - 68px);
    margin-left: 12px;
  }
</style>
