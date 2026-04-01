<template>
  <div class="hotel-search-container">
    <div class="filter-item">
      <span class="label">酒店房量</span>
      <div class="range-input-group">
        <InputNumber
          v-model:value="formState.minRooms"
          placeholder="最小"
          :controls="false"
          class="num-input"
        />
        <span class="separator">-</span>
        <InputNumber
          v-model:value="formState.maxRooms"
          placeholder="最大"
          :controls="false"
          class="num-input"
        />
        <span class="unit">间</span>
      </div>
    </div>

    <div class="filter-item">
      <span class="label">开业年数</span>
      <Select
        v-model:value="formState.openYears"
        placeholder="请选择"
        class="select-input"
        :options="openYearOptions"
        allow-clear
      />
    </div>

    <div class="filter-item">
      <span class="label">酒店类型</span>
      <Select
        v-model:value="formState.hotelType"
        placeholder="请选择"
        class="select-input mini"
        :options="hotelTypeOptions"
      />
    </div>

    <div class="filter-item">
      <span class="label">酒店档次</span>
      <Select
        v-model:value="formState.hotelLevel"
        placeholder="选择酒店档次"
        class="select-input large"
        :options="hotelLevelOptions"
        mode="multiple"
        max-tag-count="responsive"
      />
    </div>

    <div class="filter-actions">
      <Button class="btn-reset" @click="handleReset">重置</Button>
      <Button type="primary" class="btn-search" @click="handleSearch"> 查询 </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { Select, Button, InputNumber } from 'ant-design-vue';

  // 1. 定义数据结构
  export interface SearchForm {
    minRooms: number | null;
    maxRooms: number | null;
    openYears: number | undefined;
    hotelType: number | undefined;
    hotelLevel: string[];
  }

  // 2. 定义 Emits 用于组件通信
  const emit = defineEmits<{
    (e: 'search', params: SearchForm): void;
    (e: 'reset'): void;
  }>();

  // 3. 初始状态
  const formState = reactive<SearchForm>({
    minRooms: null,
    maxRooms: null,
    openYears: 3,
    hotelType: 2,
    hotelLevel: [],
  });

  // 4. 下拉框选项配置
  const openYearOptions = [
    { value: 0, label: '不限' },
    { value: 1, label: '四年及以下' },
    { value: 2, label: '五至七年' },
    { value: 3, label: '八年及以上' },
  ];

  const hotelTypeOptions = [
    { value: 1, label: '全部' },
    { value: 2, label: '连锁' },
    { value: 3, label: '单体' },
  ];

  const hotelLevelOptions = [
    { label: '经济型', value: 'economy' },
    { label: '中档', value: 'mid' },
    { label: '高档', value: 'high' },
    { label: '豪华', value: 'luxury' },
  ];

  // 5. 交互逻辑
  const handleReset = () => {
    Object.assign(formState, {
      minRooms: null,
      maxRooms: null,
      openYears: undefined,
      hotelType: undefined,
      hotelLevel: [],
    });
    emit('reset');
  };

  const handleSearch = () => {
    emit('search', { ...formState });
  };
</script>

<style scoped lang="less">
  .hotel-search-container {
    display: flex;
    position: absolute;
    top: 20px;
    left: 270px;
    flex-wrap: wrap; /* 关键：允许子元素自动换行 */
    align-items: center;
    min-width: 520px;

    /* 根据侧边栏位置动态限制最大宽度，触发自动换行 */
    max-width: calc(100vw - 900px);
    padding: 12px 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);

    /* gap 控制行间距(12px)和列间距(24px) */
    gap: 12px 24px;

    .filter-item {
      display: flex;
      flex-shrink: 0; /* 防止子项被压缩变窄 */
      align-items: center;

      .label {
        margin-right: 8px;
        color: #666;
        font-size: 14px;
        white-space: nowrap;
      }

      .range-input-group {
        display: flex;
        align-items: center;

        .num-input {
          width: 80px;

          :deep(.ant-input-number-input) {
            text-align: center;
          }
        }

        .separator {
          margin: 0 4px;
          color: #999;
        }

        .unit {
          margin-left: 6px;
          color: #333;
        }
      }

      .select-input {
        width: 130px;

        &.mini {
          width: 90px;
        }

        &.large {
          width: 200px;
          min-width: 150px;
        }
      }
    }

    .filter-actions {
      display: flex;
      flex-shrink: 0;
      margin-left: auto; /* 空间充足时靠右对齐，换行后也保持右对齐 */
      padding-left: 12px;
      gap: 8px;

      .btn-reset {
        border-color: #d9d9d9;
        color: #666;
      }
    }
  }

  // 统一 UI 细节
  :deep(.ant-input-number),
  :deep(.ant-select-selector) {
    border-radius: 4px !important;
  }
</style>
