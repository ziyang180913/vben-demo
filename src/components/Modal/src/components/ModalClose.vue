<template>
  <div :class="getClass">
    <template v-if="canFullscreen">
      <Tooltip title="还原" placement="bottom" v-if="fullScreen">
        <FullscreenExitOutlined role="full" @click="handleFullScreen" />
      </Tooltip>
      <Tooltip title="最大化" placement="bottom" v-else>
        <FullscreenOutlined role="close" @click="handleFullScreen" />
      </Tooltip>
    </template>
    <Tooltip title="关闭" placement="bottom">
      <CloseOutlined @click="handleCancel" />
    </Tooltip>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { FullscreenExitOutlined, FullscreenOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { Tooltip } from 'ant-design-vue';
  import { useDesign } from '@/hooks/web/useDesign';

  defineOptions({ name: 'ModalClose' });

  const props = defineProps({
    canFullscreen: { type: Boolean, default: true },
    fullScreen: { type: Boolean },
  });

  const emit = defineEmits(['cancel', 'fullscreen']);

  const { prefixCls } = useDesign('basic-modal-close');

  const getClass = computed(() => {
    return [
      prefixCls,
      `${prefixCls}--custom`,
      {
        [`${prefixCls}--can-full`]: props.canFullscreen,
      },
    ];
  });

  function handleCancel() {
    emit('cancel');
  }
  function handleFullScreen() {
    emit('fullscreen');
  }
</script>
