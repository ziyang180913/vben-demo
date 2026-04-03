<template>
  <div class="business-label-bold">
    <Tabs v-model:active-key="activeKey" @change="handleTabChange">
      <TabPane v-for="tab in tabsConfig" :key="tab.key" :tab="tab.label">
        <Table
          :columns="columns"
          :data-source="data[tab.key] || []"
          bordered
          :pagination="{
            current: currentPage,
            onChange: handlePageChange,
          }"
        />
      </TabPane>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Tabs, Table } from 'ant-design-vue';
  import type { TableColumnsType } from 'ant-design-vue';

  const TabPane = Tabs.TabPane;

  interface TabConfig {
    label: string;
    key: string;
  }

  interface Props {
    tabsConfig?: TabConfig[];
    columns?: TableColumnsType;
    data?: Record<string, any[]>;
    setStore?: (param: { category: string }) => void;
    getData?: () => void;
  }

  const props = withDefaults(defineProps<Props>(), {
    tabsConfig: () => [],
    columns: () => [],
    data: () => ({}),
  });

  // 当前激活的 Tab
  const activeKey = ref<string>(props.tabsConfig[0]?.key || 'default');
  // 当前页码
  const currentPage = ref<number>(1);

  /**
   * 处理 Tab 切换
   * @param key - 切换到的 Tab key
   */
  const handleTabChange = (key: string) => {
    const param = { category: key === 'default' ? '' : key };

    // 如果数据已存在，不重复加载
    if (props.data[key]) {
      return;
    }

    // 调用 store 设置参数
    if (props.setStore) {
      props.setStore(param);
    }

    // 加载数据并重置页码
    if (props.getData) {
      props.getData();
      currentPage.value = 1;
    }
  };

  /**
   * 处理页码变化
   * @param page - 新的页码
   */
  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  // 监听 tabsConfig 变化，重置 activeKey
  watch(
    () => props.tabsConfig,
    (newTabs) => {
      if (newTabs.length > 0 && !newTabs.find((t) => t.key === activeKey.value)) {
        activeKey.value = newTabs[0].key;
      }
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .business-label-bold {
    :deep(.ant-tabs) {
      border-top: 1px solid #e8e8e8;
    }
  }
</style>
