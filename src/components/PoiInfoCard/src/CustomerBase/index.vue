<template>
  <div class="customer-base">
    <OuterDiv title="基础画像">
      <div class="placeholder-content">基础画像内容待补充</div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import OuterDiv from '../OuterDiv/index.vue';

  interface Props {
    data?: Record<string, any>;
    params?: Record<string, any>;
  }

  defineProps<Props>();
</script>

<style lang="less" scoped>
  .customer-base {
    .placeholder-content {
      padding: 40px 0;
      text-align: center;
      color: #999;
    }
  }
</style>
