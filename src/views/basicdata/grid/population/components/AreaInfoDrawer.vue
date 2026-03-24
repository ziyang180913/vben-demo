<template>
  <RightDrawers
    ref="rightDrawerRef"
    title="区域信息"
    feedBackInfo
    @feedback="handleFeedback"
    @open="handleOpenChange"
  >
    <div class="drawer-content">
      <!-- 人口数量部分 -->
      <div class="section-title">
        <span class="bar"></span>
        <span class="text">人口数量</span>
      </div>

      <div class="table-container">
        <table class="custom-table population-table">
          <thead>
            <tr>
              <th>围栏名称</th>
              <th>常驻人群</th>
              <th>居住人群</th>
              <th>工作人群</th>
              <th>年轻人群</th>
            </tr>
          </thead>
          <tbody class="population-table-tbody">
            <template v-for="(item, index) in populationList" :key="index">
              <tr>
                <td class="fence-name-cell">
                  <span class="dot"></span>
                  <span class="name-text" :title="item.name">{{ item.name }}</span>
                  <EditOutlined class="edit-icon" @click="handleEditFence(item)" />
                </td>
                <td class="number-cell">{{ item.resident }}</td>
                <td class="number-cell">{{ item.living }}</td>
                <td class="number-cell">{{ item.working }}</td>
                <td class="number-cell">{{ item.young }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 配套统计部分 -->
      <div class="section-title mt-4">
        <span class="bar"></span>
        <span class="text">配套统计</span>
      </div>

      <div class="fence-select-container">
        <Select
          v-model:value="selectedFence"
          class="fence-select"
          :options="fenceOptions"
          placeholder="请选择围栏"
        />
      </div>

      <div class="table-container">
        <table class="custom-table facility-table">
          <thead>
            <tr>
              <th>配套类型</th>
              <th>数量（个）</th>
              <th>密度（个/km）</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in currentFacilities" :key="index">
              <td class="type-cell">{{ item.type }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.density }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </RightDrawers>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { RightDrawers } from '@/components/RightDrawers';
  import { Select } from 'ant-design-vue';
  import { EditOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false,
    },
    populationData: {
      type: Array,
      default: () => [],
    },
    facilityData: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['update:open', 'edit-fence']);

  const rightDrawerRef = ref<any>(null);

  watch(
    () => props.open,
    (val) => {
      if (rightDrawerRef.value) {
        rightDrawerRef.value.setOpen(val);
      }
    },
  );

  const handleOpenChange = (status: boolean) => {
    emit('update:open', status);
  };

  const handleFeedback = () => {
    // 处理反馈逻辑
    console.log('点击反馈');
  };

  const handleEditFence = (item: any) => {
    emit('edit-fence', item);
  };

  // 模拟数据结构或使用传入数据
  const populationList = computed(() => {
    if (props.populationData.length > 0) return props.populationData;
    // 默认模拟数据以展示样式
    return [
      {
        id: '1',
        name: '龙城国际...',
        resident: 337269,
        living: 207169,
        working: 130164,
        young: 120000,
      },
    ];
  });

  const selectedFence = ref('1');

  const fenceOptions = computed(() => {
    return populationList.value.map((item) => ({
      label: item.name.replace('...', ''),
      value: item.id,
    }));
  });

  const currentFacilities = computed(() => {
    // 根据选中围栏筛选数据
    if (props.facilityData.length > 0) {
      return props.facilityData.filter((f: any) => f.fenceId === selectedFence.value);
    }
    // 默认模拟数据
    return [
      {
        type: '地铁',
        count: 4,
        density: 0.35,
      },
    ];
  });

  // 当围栏列表变化时，默认选中第一个
  watch(
    fenceOptions,
    (newVal) => {
      if (newVal.length > 0 && !newVal.find((item) => item.value === selectedFence.value)) {
        selectedFence.value = newVal[0].value;
      }
    },
    { immediate: true },
  );
</script>

<style scoped lang="less">
  .drawer-content {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    gap: 16px;
  }

  .section-title {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 4px;
    background: #f5f5f6;

    .bar {
      width: 4px;
      height: 16px;
      margin-right: 8px;
      border-radius: 2px;
      background-color: @primary-color;
    }

    .text {
      color: @primary-color;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .mt-4 {
    margin-top: 16px;
  }

  .table-container {
    padding: 0;
    overflow-x: auto;
    border-radius: 4px;
    background: #fff;

    /* 隐藏滚动条但可滚动 */
    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: #e0e0e0;
    }
  }

  .custom-table {
    width: 100%;
    min-width: 400px;
    border-collapse: collapse;
    font-size: 14px;

    th {
      padding: 12px 16px;
      background: #fff;
      color: #8c8c8c;
      font-weight: 400;
      text-align: left;
      white-space: nowrap;
    }

    td {
      padding: 12px 16px;
      color: #333;
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: none;
      background: #f5f5f6;

      &:hover {
        background: #f0f5ff;
      }
    }
  }

  .facility-table {
    tbody tr {
      border-radius: 4px;
      background: #fafafa;
    }
  }

  .progress-row {
    border-bottom: none !important;
    background: transparent !important;

    td {
      padding: 0 16px 12px !important;
    }
  }

  .progress-bar-bg {
    width: 100%;
    height: 8px;
    overflow: hidden;
    border-radius: 4px;
    background-color: #e5e7eb;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    background-color: #d1d5db;
  }

  .fence-name-cell {
    display: flex;
    align-items: center;
    color: @primary-color !important;

    .dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      border-radius: 50%;
      background-color: #ff4d4f;
    }

    .name-text {
      max-width: 80px;
      margin-right: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .edit-icon {
      color: @primary-color !important;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .number-cell {
    color: @primary-color !important;
  }

  .type-cell {
    color: @primary-color !important;
  }

  .fence-select-container {
    background: #fff;

    .fence-select {
      width: 100%;

      :deep(.ant-select-selector) {
        border-radius: 4px;
        border-color: #d9d9d9;
      }
    }
  }
</style>
