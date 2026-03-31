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
          <div v-if="$slots.desc || desc" class="right-drawers-table-title-info">
            <slot name="desc">
              <component :is="desc" v-if="typeof desc === 'object' || typeof desc === 'function'" />
              <template v-else>{{ desc }}</template>
            </slot>
          </div>
          <div class="table-title-float-right">
            <span v-if="feedBackInfo" class="btn" @click="emit('feedback')"> 反馈 </span>
            <!-- <div v-if="feedBackInfo && hasExport" class="line"></div> -->
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
  import { ref } from 'vue';
  import type { PropType, Component } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { QuestionCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons-vue';

  defineProps({
    title: String,
    titleTips: String,
    desc: [String, Object, Function] as PropType<string | Component>,
    feedBackInfo: Boolean,
    hasExport: Boolean,
    style: Object,
  });

  const emit = defineEmits(['open', 'export', 'feedback']);

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
