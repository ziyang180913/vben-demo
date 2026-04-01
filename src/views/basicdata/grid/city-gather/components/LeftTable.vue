<template>
  <div
    class="do-page-hotel-left-table"
    :style="{
      width: open ? 400 + 'px' : 'auto',
      height: open ? height : 'auto',
    }"
  >
    <AButton v-if="!open" type="primary" @click="open = true">
      {{ info?.title }}
      <DoubleRightOutlined />
    </AButton>

    <ASpin :spinning="loading || false">
      <div v-if="open" class="right-drawers-box">
        <div class="right-drawers-table aux-color-bg-b1">
          <div class="right-drawers-table-title">
            <div class="right-drawers-table-title-bt">{{ info?.title }}</div>
            <div class="right-drawers-table-title-subtitle" @click="onSubtitleClick">
              {{ info?.subtitle }}
            </div>
            <div class="table-title-float-right">
              <span class="btn" @click="open = false">隐藏</span>
            </div>
          </div>
          <div class="right-drawers-table-content aux-color-bg-b1">
            <div class="hotel-city-gather-table">
              <div class="table-head">
                <div
                  v-for="(item, index) in columns"
                  :key="item.key || `head-col-${index}`"
                  class="table-head-col"
                  :style="{ width: item.width, textAlign: item.align }"
                >
                  {{ item.title }}
                </div>
              </div>
              <div class="table-content">
                <template v-if="data && data.length">
                  <div
                    v-for="(col, index) in data"
                    :key="`${index}-col`"
                    class="table-content-item"
                    :class="{
                      'table-content-item-action': curTableInfo?.id && col.id === curTableInfo?.id,
                    }"
                    @click="handleRowClick(col)"
                  >
                    <ATooltip
                      v-for="(item, index1) in columns"
                      :key="`${item.key}-${index1}-tooltip`"
                      :title="
                        item.tooltip
                          ? item.key === 'index'
                            ? index + 1
                            : col[item.key] || '-'
                          : ''
                      "
                    >
                      <div
                        class="table-body-col"
                        :style="{ width: item.width, textAlign: item.align }"
                      >
                        {{ item.key === 'index' ? index + 1 : col[item.key] || '-' }}
                      </div>
                    </ATooltip>
                  </div>
                </template>
                <AEmpty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无数据" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ASpin>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick } from 'vue';
  import { Button as AButton, Spin as ASpin, Tooltip as ATooltip, Empty } from 'ant-design-vue';
  import { DoubleRightOutlined } from '@ant-design/icons-vue';

  export interface ColumnItem {
    title: string;
    key: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    tooltip?: boolean;
  }

  export interface TableInfo {
    id?: number | string;
    [key: string]: any;
  }

  interface Props {
    height?: string;
    loading?: boolean;
    info?: { title: string; subtitle: string };
    columns?: ColumnItem[];
    data?: TableInfo[];
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 'calc(100% - 96px)',
    loading: false,
  });

  const emit = defineEmits<{ rowClick: [record: TableInfo]; subtitleClick: [] }>();

  const open = ref(true);
  const curTableInfo = ref<TableInfo | undefined>();

  watch(
    () => props.loading,
    () => {
      open.value = true;
    },
  );

  watch(curTableInfo, () => {
    if (!curTableInfo.value) return;
    nextTick(() => {
      document
        .querySelector('.table-content-item-action')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const handleRowClick = (col: TableInfo) => {
    curTableInfo.value = col;
    emit('rowClick', col);
  };

  const onSubtitleClick = () => emit('subtitleClick');

  defineExpose({
    setCurTableInfo: (info: TableInfo) => {
      curTableInfo.value = info;
    },
  });
</script>

<style scoped lang="less">
  .do-page-hotel-left-table {
    position: absolute;
    z-index: 2;
    top: 76px;
    left: 20px;
    transition: 0.4s;
  }

  .ant-spin-nested-loading {
    height: 100%;
  }

  .ant-spin-container {
    height: 100%;
  }

  .do-page-hotel-left-table > :deep(.ant-btn) {
    display: flex;
    align-items: center;
    border-radius: 4px;
    background-color: #fff;
    color: #006be6;
    font-size: 14px;
    font-weight: 400;
  }

  .right-drawers-box {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .right-drawers-table {
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.4s;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }

  .right-drawers-table-title {
    position: relative;
    height: 90px;
    padding: 16px 20px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATgAAAC0CAMAAAA3pMBPAAAAAXNSR0IArs4c6QAAAIRQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////INvm0QAAACx0Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKivOXDPXAAAMnklEQVR42u2d2ZLqOBKGqYKiwGaxWQzeZMAshn7/92ulMiXL9JmbiRQTk9Gizq1O6Pefiz6wNBr992OSHQ/HwyHDsYex02O73W7gX7pJzUiSZL3Wf6v1So8ljAWM2IwIxhzGzIzf32lU1VVVlUVR5HmRH7NDttfT77Z65o0edtY1zKuHmXVlJo3hXwQfnHQ2m8OMMKYwfmBMzBiPv/WfHl8wRp8coJuWDZXbZ6TbFtaHKzRrTJI0WeMK9RqXRriFWWS8INmsbnNcY1Rq3cqy0MrlR/1ozLPRU+9RuBQeSGJGrxvMuRw8jfk8ms/oYcx+p0a4n6nR7UerBsPI9v0/0Q0+qBzK1ivnW4PWuMJBwsW0RrPIiLwBH/Cb0sJp5XJUDufXM29IOWfkRE+6Nn5bkXLOxPg05jPruF8STss2GcMHlBtr2fTf6JPKfe9hUTCGkYqGI8vB+lyorn3dyB0R6UaL1OublXUNkQqGK455jrplGRhutxnOSkb243/hPQwK1ZmvG8WqNdznI/Vre6QwgmhF2chyOy9SN3qJqTXcMMd5KS6y3tB/R6WMcGC53nE4t7bcP3y8NhluRbPaSWMtXGQNNxvkOJBt4gxHkfo56ZJjbpTrHQfigXBbLA56hbBIYw30xmqNUdUnObTcHM2BymWqMY4D3bTjQDmdC3Dy3W6zdYZLrY3XVBus44yRycUzp5xLchNUrnccSPc54RY6iIxy5DhPt50rDp41rDf+GFVePtqoBhxXg3DkOK2czXF9ybEpjko1zUqpE6d0Pp69VdVeufHHdZujai5SMcftXDtihSPLoTdoiaZxWL5FaoT1L2lQNyyrOQqH02Okbr1IXf8zUilxRmQ5THEk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')
      no-repeat right #006be6;
    background-size: 180px 90px;
    color: #fff;
  }

  .right-drawers-table-title-bt {
    width: calc(100% - 40px);
    margin-bottom: 4px;
    overflow: hidden;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right-drawers-table-title-subtitle {
    color: rgb(255 255 255 / 90%);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    cursor: pointer;
  }

  .table-title-float-right {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #fff;
    font-size: 13px;
  }

  .table-title-float-right .btn {
    padding: 2px 8px;
    transition: background-color 0.2s;
    border-radius: 4px;
    cursor: pointer;
  }

  .table-title-float-right .btn:hover {
    background-color: rgb(255 255 255 / 15%);
  }

  .right-drawers-table-content {
    height: calc(100% - 90px);
    overflow-y: auto;
  }

  .hotel-city-gather-table {
    height: 100%;
  }

  .table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 42px;
    padding: 0 20px;
    background: #f5f7fa;
    color: #909399;
    font-size: 13px;
    font-weight: 500;
  }

  .table-content-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 20px;
    transition: background-color 0.2s;
    border-bottom: 1px solid #ebeef5;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
  }

  .table-content-item:hover {
    background: #f5f7fa;
  }

  .table-content-item-action {
    background: #ecf5ff;
  }

  .table-body-col {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-content {
    height: calc(100vh - 310px);
    overflow-y: auto;
  }
</style>
