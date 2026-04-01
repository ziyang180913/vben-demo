<template>
  <div class="do-page-hotel-brand-recommend">
    <ASpin :spinning="loading">
      <div class="row">
        酒店品牌
        <ASelect v-model:value="value" :options="[]" placeholder="请选择" @change="getData" />
      </div>
      <div class="row">
        场景模型
        <ASelect
          :options="[{ value: '商务出差', label: '商务出差' }]"
          placeholder="请选择"
          @change="getData"
        />
      </div>
      <CustomTable :columns="columns" :data="data" />
    </ASpin>

    <AModal v-model:open="open" title="选址评论报告" :footer="null" @cancel="open = false">
      <div style="padding: 20px">
        <div style="margin-bottom: 16px; font-size: 20px; font-weight: bold">一、商圈评估</div>
        <div style="margin-bottom: 8px; font-size: 16px">1.1 酒店数量与分布</div>
        <div style="margin-bottom: 8px; color: #666; font-size: 12px"
          >统计目标区域内的酒店总数及其分布情况。</div
        >
        <div style="margin-bottom: 8px; color: #666; font-size: 12px"
          >分析不同类型酒店（经济型、中端、中高端、度假系列）的分布。</div
        >
        <div style="margin-bottom: 8px; font-size: 16px">1.2 房间数统计</div>
        <div style="color: #666; font-size: 12px">收集区域内各酒店的房间数量。</div>
      </div>
      <div class="modal-footer">
        <AButton @click="open = false">取消</AButton>
        <AButton type="primary" @click="open = false">确认</AButton>
        <AButton type="primary" @click="handleExport">导出</AButton>
      </div>
    </AModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, h } from 'vue';
  import {
    Spin as ASpin,
    Select as ASelect,
    Modal as AModal,
    Button as AButton,
    message,
  } from 'ant-design-vue';
  import CustomTable from './CustomTable.vue';

  interface Props {
    callback?: (params: { value: any }) => Promise<any[]>;
  }

  const props = defineProps<Props>();

  const open = ref(false);
  const value = ref<any>();
  const data = ref<any[]>([]);
  const loading = ref(false);

  const columns = ref([
    { title: '品牌', dataIndex: 'name', key: 'name', width: '100px', align: 'center' as const },
    { title: '综合打分', dataIndex: 'a', key: 'a', width: '80px', align: 'center' as const },
    { title: '场景模型', dataIndex: 'b', key: 'b', width: '80px', align: 'center' as const },
    {
      title: '商圈评价',
      dataIndex: 'c',
      key: 'c',
      width: '80px',
      align: 'center' as const,
      style: { color: '#3455FF', textDecoration: 'underline', cursor: 'pointer' },
      onClick: () => message.info('功能开发中'),
    },
    {
      title: '竞争力评分',
      dataIndex: 'd',
      key: 'd',
      width: '80px',
      align: 'center' as const,
      style: { color: '#3455FF', textDecoration: 'underline', cursor: 'pointer' },
      onClick: () => message.info('功能开发中'),
    },
    {
      title: '查看报告',
      dataIndex: 'logo',
      key: 'logo',
      width: '80px',
      align: 'center' as const,
      style: { color: '#3455FF', textDecoration: 'underline', cursor: 'pointer' },
      render: () => '查看',
      onClick: () => {
        open.value = true;
      },
    },
  ]);

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

  const handleExport = () => {
    message.info('导出功能开发中');
    open.value = false;
  };

  onMounted(() => getData());
</script>

<style scoped>
  .do-page-hotel-brand-recommend {
    height: 100%;
  }

  .row {
    display: flex;
    align-items: center;
    height: 32px;
    margin-bottom: 14px;
    color: rgb(0 11 54 / 85%);
    font-size: 14px;
  }

  .row :deep(.ant-select) {
    width: calc(100% - 68px);
    margin-left: 12px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 16px;
    border-top: 1px solid #f0f0f0;
  }
</style>
