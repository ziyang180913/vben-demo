<template>
  <SessionTimeoutLogin v-if="getIsSessionTimeout" />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useUserStoreWithOut } from '@/store/modules/user';
  import SessionTimeoutLogin from '@/views/sys/login/SessionTimeoutLogin.vue';

  defineOptions({ name: 'LayoutFeatures' });

  const userStore = useUserStoreWithOut();

  const getIsSessionTimeout = computed(() => userStore.getSessionTimeout);
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-setting-drawer-feature';

  .@{prefix-cls} {
    display: flex;
    position: absolute;
    z-index: 10;
    top: 45%;
    right: 0;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 6px 0 0 6px;
    background-color: @primary-color;
    color: @white;
    cursor: pointer;

    svg {
      width: 1em;
      height: 1em;
    }
  }
</style>
