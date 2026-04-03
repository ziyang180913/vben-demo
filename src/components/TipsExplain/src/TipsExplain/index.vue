<template>
  <div class="tips-explain-style" :style="style">
    <QuestionCircleOutlined
      class="tips-explain-icon"
      :style="{ color: '#a1a2a5', fontSize: '16px' }"
      @click="handleOpen"
    />
    <Modal
      v-model:open="open"
      :z-index="9999"
      wrap-class-name="tips-explain-modal"
      :get-container="getContainer"
      :mask-closable="false"
      destroy-on-close
      :width="700"
      :footer="null"
      @cancel="handleClose"
    >
      <div class="tips-explain-box">
        <div class="font-16-left-500-pr85 tips-explain-title">数据说明</div>
        <div class="tips-explain-content" v-html="content" />
        <div class="tips-explain-btn">
          <Button type="primary" @click="handleClose">我知道了</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { Button, Modal } from 'ant-design-vue';

  interface TipsExplainProps {
    /** 弹窗内容（支持 HTML） */
    content?: string;
    /** 自定义样式 */
    style?: Record<string, string | number>;
  }

  withDefaults(defineProps<TipsExplainProps>(), {
    content: '',
    style: () => ({}),
  });

  defineOptions({ name: 'TipsExplain' });

  const open = ref(false);

  const getContainer = () => document.getElementById('app') as HTMLElement;

  const handleOpen = () => {
    open.value = true;
  };

  const handleClose = () => {
    open.value = false;
  };
</script>

<style lang="less" scoped src="./index.less"></style>
