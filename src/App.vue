<template>
  <ConfigProvider :locale="zhCN" :theme="themeConfig">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { ConfigProvider } from 'ant-design-vue';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import { useDarkModeTheme } from '@/hooks/setting/useDarkModeTheme';
  import { computed } from 'vue';

  const { isDark, darkTheme } = useDarkModeTheme();

  const themeConfig = computed(() =>
    Object.assign(
      {
        token: {
          colorPrimary: '#006be6',
          colorSuccess: '#55D187',
          colorWarning: '#EFBD47',
          colorError: '#ED6F6F',
          colorInfo: '#006be6',
        },
      },
      isDark.value ? darkTheme : {},
    ),
  );
  // Listening to page changes and dynamically changing site titles
  useTitle();
</script>
