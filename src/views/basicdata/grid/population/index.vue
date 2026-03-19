<template>
  <div class="population-map">
    <TemplateMap isMapConstor />
  </div>
</template>

<script lang="ts" setup>
  import { TemplateMap } from '@/components/Amap/TemplateMap';
</script>

<style scoped>
  .population-map {
    width: 100%;
    height: 100%;
  }
</style>
