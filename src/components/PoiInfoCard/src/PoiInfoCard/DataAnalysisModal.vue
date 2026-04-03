<template>
  <BasicModal
    :open="open"
    v-bind="modalConfig"
    class="data-analysis-modal"
    @cancel="handleCancel"
    @register="register"
  >
    <div v-if="isLoading" class="modal-loading">
      <Spin size="large" tip="加载中..." />
    </div>

    <div v-else-if="error" class="modal-error">
      <div class="error-icon">
        <CloseCircleOutlined />
      </div>
      <div class="error-text">{{ error }}</div>
    </div>

    <component :is="currentComponent" v-else-if="currentComponent" v-bind="mergedComponentProps" />
  </BasicModal>
</template>

<script setup lang="ts">
  import { computed, watch, ref, type Component } from 'vue';
  import { Spin } from 'ant-design-vue';
  // 注意：确保从 Vben 的 components 目录引入，而不是原生的
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { CloseCircleOutlined } from '@ant-design/icons-vue';
  import type { TagItem, ModalConfig, PoiInfoCardData } from './types';

  interface Props {
    open?: boolean;
    currentTag: TagItem | null;
    currentComponent: Component | null;
    modalConfig?: ModalConfig;
    data: PoiInfoCardData;
    extraProps?: Record<string, any>;
    loading?: boolean;
  }

  interface Emits {
    (e: 'close'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    open: false,
    modalConfig: () => ({}),
    extraProps: () => ({}),
    loading: false,
  });

  const emit = defineEmits<Emits>();

  // 使用 Vben 推荐的内部注册方式（可选，但有助于解决渲染问题）
  const [register] = useModalInner();

  const error = ref<string>('');
  const isLoading = computed(() => props.loading);

  const mergedComponentProps = computed(() => {
    return {
      data: {},
      params: {},
      ...props.currentTag?.componentProps,
      ...props.extraProps,
      poiData: props.data,
    };
  });

  watch(
    () => props.currentTag,
    () => {
      error.value = '';
    },
  );

  const handleCancel = () => {
    emit('close');
  };
</script>
