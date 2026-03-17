<template>
  <a-alert type="info" showIcon :class="[prefixCls]">
    <template #message>
      <span v-if="props.count > 0"> 已选择 {{ props.count }} 项 </span>
      <span v-else> 请选择数据 </span>
      <a-button type="link" @click="clearSelectedRowKeys" size="small" v-show="props.count > 0">
        清空
      </a-button>
    </template>
  </a-alert>
</template>

<script lang="ts" setup>
  import { useDesign } from '@/hooks/web/useDesign';

  import type { TableActionType } from '../types/table';
  import { Alert as AAlert } from 'ant-design-vue';

  const { prefixCls } = useDesign('table-select-bar');

  defineOptions({
    name: 'TableSelectBar',
  });

  const props = withDefaults(
    defineProps<{
      count?: number;
      //
      clearSelectedRowKeys: TableActionType['clearSelectedRowKeys'];
    }>(),
    {
      count: () => 0,
    },
  );
</script>
