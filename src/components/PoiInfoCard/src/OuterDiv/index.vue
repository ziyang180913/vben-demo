<template>
  <div class="outer-div" :style="style">
    <div v-if="showHeader" class="outer-div__header">
      <div class="outer-div__title-box">
        <span v-if="title" class="outer-div__title">{{ title }}</span>
        <span v-if="otherTitle" class="outer-div__subtitle">{{ otherTitle }}</span>
        <component v-if="tips" :is="tips" class="outer-div__tips" />
      </div>
      <div v-if="$slots.rightOperate || rightOperate" class="outer-div__extra">
        <slot name="rightOperate">
          <span>{{ rightOperate }}</span>
        </slot>
      </div>
    </div>
    <div class="outer-div__body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import { computed } from 'vue';

  const props = defineProps<{
    title?: string;
    otherTitle?: string;
    tips?: any;
    style?: CSSProperties;
    rightOperate?: any;
  }>();

  const showHeader = computed(
    () => !!props.title || !!props.otherTitle || !!props.tips || !!props.rightOperate,
  );
</script>

<style lang="less" scoped>
  .outer-div {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid @border-color-split;
    border-radius: 4px;
    background: #fff;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__title-box {
      display: flex;
      align-items: center;
    }

    &__title {
      color: @text-color;
      font-size: 20px;
      font-weight: 500;
    }

    &__subtitle {
      color: @primary-color;
      font-size: 20px;
      font-weight: 500;
    }

    &__tips {
      display: inline-flex;
      align-items: center;
      margin-left: 10px;
    }

    &__extra {
      display: flex;
      align-items: center;
    }
  }
</style>
