<template>
  <div v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <div class="enter-x min-w-64 min-h-64">
      <Divider class="enter-x">扫码登录</Divider>
      <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin"> 返回登录 </Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { Button, Divider } from 'ant-design-vue';

  import { useLoginState, LoginStateEnum } from './useLogin';

  const { getShow, handleBackLogin } = useLoginState();
</script>
