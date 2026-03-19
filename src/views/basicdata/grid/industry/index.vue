<template>
  <div class="industry-map">
    <TemplateMap isMapConstor />
  </div>
</template>

<script lang="ts" setup>
  import { TemplateMap } from '@/components/Amap/TemplateMap';
</script>

<style scoped>
  .industry-map {
    width: 100%;
    height: 100%;
  }
</style>
