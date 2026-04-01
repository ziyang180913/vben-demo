<template>
  <div class="do-page-hotel-table-layer">
    <div class="do-page-hotel-table">
      <div class="table-hander">
        <div
          v-for="item in columns"
          :key="`table-hander-${item.key}`"
          :style="{ width: item.width, textAlign: item.align }"
        >
          {{ item.title }}
        </div>
      </div>
      <div class="table-content">
        <template v-if="data?.length">
          <div
            v-for="(item, index1) in data"
            :key="`table-item-${index1}`"
            class="table-item"
            :class="{ active: currentTask?.[rowKey] === item?.[rowKey] }"
            @click="setCurrentTask?.(item)"
          >
            <ATooltip
              v-for="item1 in columns"
              :key="`table-item-${item1.key}-${index1}`"
              :title="item1?.isTooltip ? item[item1.key as string] : false"
            >
              <div
                :class="['table-item-cont', item1.hover ? 'table-item-cont-hover' : '']"
                :style="{ width: item1.width, textAlign: item1.align, ...(item1?.style || {}) }"
                @click.stop="item1?.onClick?.()"
              >
                <template v-if="item1.key === 'index'">{{ index1 + 1 }}</template>
                <template v-else-if="item1?.render">
                  {{ renderCell(item1.render, item[item1.key as string], item) }}
                </template>
                <template v-else>{{ item[item1.key as string] || '-' }}</template>
              </div>
            </ATooltip>
          </div>
        </template>
        <AEmpty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Tooltip as ATooltip, Empty } from 'ant-design-vue';

  export interface ColumnType {
    key: string | 'index';
    title: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    isTooltip?: boolean;
    hover?: boolean;
    onClick?: () => void;
    render?: (text: any, record: any) => any;
    style?: Record<string, any>;
  }

  interface Props {
    columns: ColumnType[];
    data?: any[];
    rowKey?: string;
    currentTask?: any | null;
    setCurrentTask?: (item: any) => void;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    rowKey: 'id',
  });

  const renderCell = (renderFn: Function, text: any, record: any) => {
    const result = renderFn(text, record);
    return typeof result === 'string' ? result : result;
  };
</script>

<style scoped lang="less">
  .do-page-hotel-table-layer {
    height: 100%;
    overflow: hidden;
  }

  .do-page-hotel-table {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .table-hander {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 12px;
    background: rgb(2 4 13 / 4%);
    color: rgb(2 4 13 / 45%);
    font-size: 12px;
  }

  .table-hander > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-content {
    flex: 1;
    overflow-y: auto;
  }

  .table-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 12px;
    border-bottom: 1px solid rgb(2 4 13 / 8%);
    color: rgb(2 4 13 / 85%);
    cursor: pointer;
  }

  .table-item:hover {
    background: rgb(52 85 255 / 4%);
  }

  .table-item.active {
    background: rgb(52 85 255 / 8%);
  }

  .table-item-cont {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-item-cont-hover {
    color: #3455ff;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
