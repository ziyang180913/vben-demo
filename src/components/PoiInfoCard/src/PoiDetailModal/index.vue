<template>
  <div v-if="visible" class="detail-modal">
    <div class="detail-header">
      <div class="detail-title-wrapper">
        <div class="location-icon">
          <EnvironmentOutlined />
        </div>
        <div class="detail-title-info">
          <div class="detail-title">{{ data.name }}</div>
          <div class="detail-subtitle">场景ID: {{ data.id || '-' }}</div>
        </div>
      </div>
      <CloseOutlined class="close-btn" @click="handleClose" />
    </div>
    <div class="detail-body">
      <div v-for="item in labels" :key="item.value" class="detail-row">
        <span class="detail-label">{{ item.label }}：</span>
        <span class="detail-value">{{ data[item.value] || '-' }}</span>
      </div>
      <div v-if="data.add" class="detail-row address-row">
        <EnvironmentOutlined class="address-icon" />
        <span class="detail-value">{{ data.add }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CloseOutlined, EnvironmentOutlined } from '@ant-design/icons-vue';
  import { defaultInfoLabels, type InfoLabelItem, DetailData } from './config';
  import { computed } from 'vue';

  interface Props {
    /** 是否显示 */
    visible: boolean;
    /** 详情数据 */
    data: DetailData;
    /** 标签配置，不传则使用默认配置 */
    infoLabels?: InfoLabelItem[];
  }

  const props = withDefaults(defineProps<Props>(), {
    infoLabels: () => defaultInfoLabels,
  });

  interface Emits {
    (e: 'close'): void;
  }

  const emit = defineEmits<Emits>();

  // 使用传入的 labels 或默认 labels
  const labels = computed(() => props.infoLabels);

  const handleClose = () => {
    emit('close');
  };
</script>

<style lang="less" scoped>
  .detail-modal {
    @keyframes slideIn {
      from {
        transform: translateX(-10px);
        opacity: 0;
      }

      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    position: absolute;
    z-index: 101;
    top: 20px;
    left: 430px;
    width: 320px;
    animation: slideIn 0.25s ease;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 20px rgb(0 0 0 / 15%);
  }

  .detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #e8eaff;
    border-radius: 8px 8px 0 0;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);

    .detail-title-wrapper {
      display: flex;
      flex: 1;
      align-items: flex-start;
      gap: 10px;
    }

    .location-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: @primary-color;
      color: #fff;
      font-size: 14px;
    }

    .detail-title-info {
      flex: 1;
      min-width: 0;
    }

    .detail-title {
      color: #333;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
    }

    .detail-subtitle {
      margin-top: 4px;
      color: #999;
      font-size: 12px;
    }

    .close-btn {
      margin: -4px;
      padding: 4px;
      transition: color 0.2s;
      color: #999;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        color: #666;
      }
    }
  }

  .detail-body {
    padding: 12px 16px 16px;
  }

  .detail-row {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;
    color: #333;
    font-size: 13px;
    line-height: 1.5;

    &:last-child {
      border-bottom: none;
    }

    &.address-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin-top: 4px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      border-bottom: none;
    }
  }

  .detail-label {
    min-width: 70px;
    color: #999;
  }

  .detail-value {
    flex: 1;
    color: #333;
    word-break: break-all;
  }

  .address-icon {
    margin-top: 2px;
    color: @primary-color;
    font-size: 14px;
  }
</style>
