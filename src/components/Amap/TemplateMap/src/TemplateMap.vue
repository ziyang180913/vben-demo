<template>
  <div class="template-map-component">
    <MapInit :callback="onMapCallback" />
    <MapSearch v-if="map" :map="map" ref="mapSearchRef" v-bind="mapSearchProps" />
    <div v-if="map && isMapConstor" class="template-map-operate">
      <MapFenceTool
        ref="mapConstorRef"
        :map="map"
        :clearCover="onClearCover"
        v-bind="mapConstorProps"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { markRaw, shallowRef, watch } from 'vue';
  import { MapInit } from '@/components/Amap/MapInit';
  import { MapSearch } from '@/components/Amap/MapSearch';
  import { MapFenceTool } from '@/components/Amap/MapFenceTool';

  const props = withDefaults(
    defineProps<{
      mapConstorProps?: Record<string, any>;
      mapSearchProps?: Record<string, any>;
      isCacheFence?: boolean;
      initMapEvent?: Function;
      defaultShowInfo?: boolean;
      isMapConstor?: boolean;
      clearCover?: Function;
    }>(),
    {
      mapConstorProps: () => ({}),
      mapSearchProps: () => ({}),
      isCacheFence: false,
      initMapEvent: () => {},
      defaultShowInfo: true,
      isMapConstor: false,
    },
  );

  // 地图实例
  const map = shallowRef<any>(null);
  // 绘制围栏工具引用
  const mapConstorRef = shallowRef<any>(null);
  // 搜索实例
  const mapSearchRef = shallowRef<any>(null);

  const onMapCallback = (mapInstance: any) => {
    map.value = markRaw(mapInstance);
  };

  const onClearCover = () => {
    props.clearCover?.();
  };

  // 创建完地图注册其他事件
  watch(map, (newMap) => {
    if (newMap) {
      props.initMapEvent(newMap);
    }
  });

  // 暴露组件方法给父组件
  defineExpose({
    map,
    mapConstorRef,
    mapSearchRef,
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
