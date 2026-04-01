<template>
  <div class="do-page-hotel-card-detail" :style="style">
    <div class="close-icon" @click="onClose"><CloseCircleFilled /></div>
    <ASpin :spinning="loading">
      <div class="query-box">
        <div class="query-box-header">
          <ATabs
            type="card"
            :active-key="selectCard"
            :items="tabItems"
            :bordered="false"
            @change="handleTabChange"
          >
            <ATabs.TabPane key="2" tab="客群画像分析"
          /></ATabs>
        </div>
        <div class="query-box-content">
          <template v-if="selectItem && selectItem.children">
            <div v-for="item in selectItem.children" :key="item.value">
              <div v-if="item.label || item.right" class="col-label">
                {{ item.label }}
                <div v-if="item.right" class="label-right label-right-date">
                  <ADatePicker
                    v-if="item.right.type === 'date'"
                    v-model:value="rowConfig[item.value]"
                    :picker="item.right.picker"
                    :allow-clear="false"
                    :bordered="false"
                    style="width: 84px; padding: 0"
                    @change="(val) => handleDateChange(val, item)"
                  />
                </div>
              </div>
              <template v-if="item.components">
                <div v-for="col in item.components" :key="col.value">
                  <div v-if="col.title" class="components-title">{{ col.title }}</div>
                  <div :style="{ height: (col.height || 222) + 'px' }">
                    <ColumnPlot
                      v-if="col.type === 'ColumnPlotStack'"
                      :data="data?.[selectCard]?.[col.value] || []"
                      v-bind="col?.fieldProps || {}"
                    />
                    <PieChart
                      v-else-if="col.type === 'PieChart'"
                      :data="data?.[selectCard]?.[col.value] || []"
                      :height="col.height || 222"
                      v-bind="col?.fieldProps || {}"
                    />
                    <Portrait
                      v-else-if="col.type === 'Portrait'"
                      :data="data?.[selectCard]?.[col.value] || []"
                      v-bind="col?.fieldProps || {}"
                    />
                    <Ranking
                      v-else-if="col.type === 'Ranking'"
                      :data="data?.[selectCard]?.[col.value] || []"
                      v-bind="col?.fieldProps || {}"
                    />
                    <BrandRecommend
                      v-else-if="col.type === 'BrandRecommend'"
                      :data="data?.[selectCard]?.[col.value] || []"
                      v-bind="col?.fieldProps || {}"
                    />
                    <MultiLevelPie
                      v-else-if="col.type === 'MultiLevelPie'"
                      :data="data?.[selectCard]?.[col.value] || {}"
                      v-bind="col?.fieldProps || {}"
                    />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </ASpin>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { CloseCircleFilled } from '@ant-design/icons-vue';
  import { Spin as ASpin, Tabs as ATabs, DatePicker as ADatePicker } from 'ant-design-vue';
  import type { TabsProps } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import PieChart from './PieChart.vue';
  import ColumnPlot from './ColumnPlot.vue';
  import Portrait from './Portrait.vue';
  import Ranking from './Ranking.vue';
  import BrandRecommend from './BrandRecommend.vue';
  import MultiLevelPie from './MultiLevelPie.vue';
  import type { RightConfigItem } from '../config';

  interface Props {
    config: RightConfigItem[];
    param?: any;
    style?: Record<string, any>;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{ close: [] }>();

  const selectCard = ref<string>(props.config?.[0]?.value || '');
  const data = ref<Record<string, any>>({});
  const actionTab = ref<RightConfigItem | null>(null);
  const loading = ref(false);
  const rowConfig = ref<Record<string, any>>({});
  const copeParam = ref<any>({});

  const tabItems = computed(() =>
    props.config.map((item) => ({ key: item.value, label: item.label })),
  );
  const selectItem = computed(() => props.config.find((item) => item.value === selectCard.value));

  const updataDefaultConfig = (items: any[] = []) => {
    const param: Record<string, any> = {};
    items.forEach((col) => {
      param[col.value] =
        col?.right?.type === 'date' && col?.right?.default ? dayjs(col.right.default) : null;
    });
    rowConfig.value = param;
  };

  const onChange = async (item: RightConfigItem) => {
    data.value = {};
    if (item.callback) {
      loading.value = true;
      try {
        const result = await item.callback(rowConfig.value, item, props.param);
        data.value = { ...data.value, [item.value]: result };
      } catch (error) {
        console.error(error);
      }
      loading.value = false;
    }
    actionTab.value = item;
  };

  const handleTabChange: TabsProps['onChange'] = (activeKey) => {
    const item = props.config.find((col) => col.value === activeKey);
    if (item) {
      loading.value = true;
      selectCard.value = activeKey as string;
      updataDefaultConfig(item.children);
      onChange(item);
    }
  };

  const handleDateChange = async (val: any, item: any) => {
    rowConfig.value = { ...rowConfig.value, [item.value]: val };
    if (item.right?.callback) {
      const list = await item.right.callback(rowConfig.value, item, props.param);
      data.value = { ...data.value, ...list };
    }
  };

  const onClose = () => emit('close');

  watch(
    () => props.param,
    () => {
      if (!rowConfig.value || !actionTab.value) return;
      if (copeParam.value?.id !== props?.param?.id) {
        loading.value = true;
        copeParam.value = props.param;
        onChange(actionTab.value);
      }
    },
    { immediate: true },
  );

  if (props.config.length > 0) {
    loading.value = true;
    updataDefaultConfig(props.config[0].children);
    onChange(props.config[0]);
  }
</script>

<style scoped lang="less">
  @prefix-cls: ~'@{namespace}-darg-bar';

  .do-page-hotel-card-detail {
    position: absolute;
    top: 76px;
    right: 20px;
    width: 412px;
    max-width: 412px;
    transition: 0.3s;
    border-radius: 4px;
    background-color: #fff;
  }

  .query-box {
    max-height: 100%;
    overflow: hidden;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: rgb(2 4 13 / 20%) 0 3px 6px 0;
  }

  .query-box-header {
    display: flex;
    width: 100%;
    height: 50px;
    padding: 0 12px;
    background: @primary-color;
  }

  .query-box-header :deep(.ant-tabs-card) {
    width: 412px;
    margin-top: 12px;
  }

  .query-box-header :deep(.ant-tabs-nav) {
    margin: 0;
  }

  .query-box-header :deep(.ant-tabs-nav-operations) {
    color: #fff;
    font-size: 20px;
  }

  .query-box-header :deep(.ant-tabs-tab) {
    border: 0;
    background-color: rgb(0 0 0 / 0%);
  }

  .query-box-header :deep(.ant-tabs-tab) div {
    color: #fff;
  }

  .query-box-header :deep(.ant-tabs-tab-active) {
    background: #fff;
    color: @primary-color !important;
    font-size: 14px;
    font-weight: 500;
  }

  .query-box-header :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: @primary-color !important;
  }

  .query-box-content {
    height: 100%;
    max-height: calc(100vh - 230px);
    padding: 20px;
    overflow-y: auto;
  }

  .col-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 2px solid @primary-color;
    background: #f5f5f6;
    color: @primary-color;
    font-size: 16px;
    line-height: 32px;
  }

  .label-right {
    display: flex;
    align-items: center;
    padding-right: 12px;
    color: rgb(0 11 54 / 45%);
    font-size: 14px;
  }

  .components-title {
    margin: 0 0 10px;
    color: rgb(0 11 54 / 65%);
    font-size: 14px;
    font-weight: 500;
  }

  .close-icon {
    display: none;
    position: absolute;
    z-index: 1;
    top: -16px;
    right: -13px;
    transition: 0.3s;
    border-radius: 50%;
    background-color: @primary-color;
    box-shadow:
      0 9px 28px 8px rgb(0 0 0 / 5%),
      0 6px 16px 0 rgb(0 0 0 / 8%),
      0 3px 6px -4px rgb(0 0 0 / 12%);
    color: #fff;
    font-size: 26px;
    cursor: pointer;
  }

  .do-page-hotel-card-detail:hover .close-icon {
    display: block;
  }
</style>
