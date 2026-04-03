<template>
  <div class="income-consumption-occupation">
    <OuterDiv title="收入/消费/职业">
      <div class="placeholder-content">收入/消费/职业内容待补充</div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import OuterDiv from '../OuterDiv/index.vue';

  interface Props {
    data?: Record<string, any>;
  }

  defineProps<Props>();
</script>

<style lang="less" scoped>
  .income-consumption-occupation {
    .placeholder-content {
      padding: 40px 0;
      text-align: center;
      color: #999;
    }
  }
</style>
