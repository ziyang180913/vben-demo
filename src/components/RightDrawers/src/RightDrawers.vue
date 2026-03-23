<template>
  <div
    class="right-drawers-component"
    :style="{ width: showPortrait ? '380px' : '25px', ...(style || {}) }"
  >
    <div class="right-drawers-box">
      <div class="right-drawers-icon" @click="iconOnClick">
        <div class="icon-style">
          <RightOutlined v-if="showPortrait" />
          <LeftOutlined v-else />
        </div>
      </div>
      <div class="right-drawers-table" :style="{ width: showPortrait ? '380px' : '0' }">
        <div class="right-drawers-table-title">
          <div class="right-drawers-table-title-bt">
            {{ title }}
            <Tooltip v-if="titleTips" :title="titleTips" placement="bottom">
              <QuestionCircleOutlined class="title-icon" />
            </Tooltip>
          </div>
          <div v-if="desc" class="right-drawers-table-title-info">{{ desc }}</div>
          <div class="table-title-float-right">
            <div v-if="feedBackInfo && hasExport" class="line"></div>
            <span v-if="hasExport" class="btn" @click="emit('export')"> 导出 </span>
          </div>
        </div>
        <div class="right-drawers-table-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, useAttrs, computed } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { QuestionCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    title: String,
    titleTips: String,
    desc: String,
    feedBackInfo: Boolean,
    style: Object,
  });

  const emit = defineEmits(['open', 'export']);

  const attrs = useAttrs();
  const hasExport = computed(() => !!attrs.onExport);

  const showPortrait = ref(false);

  const iconOnClick = () => {
    showPortrait.value = !showPortrait.value;
    emit('open', !showPortrait.value);
  };

  const setOpen = (status: boolean) => {
    if (showPortrait.value !== status) {
      showPortrait.value = status;
      emit('open', status);
    }
  };

  defineExpose({
    setOpen,
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
