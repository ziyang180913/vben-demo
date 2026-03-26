<template>
  <RightDrawers
    ref="rightDrawerRef"
    title="区域信息"
    feedBackInfo
    @feedback="handleFeedback"
    @open="handleOpenChange"
  >
    <div class="drawer-content">
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
            <tr v-for="(item, index) in populationData" :key="item.id || index">
              <td class="fence-name-cell">
                <span class="dot" :style="{ backgroundColor: item.color }"></span>
                <span class="name-text" :title="item.name">{{ item.name }}</span>
                <Popconfirm
                  :open="popconfirmVisible === item.id"
                  ok-text="保存"
                  cancel-text="取消"
                  :icon="null"
                  :ok-button-props="{ style: { height: '32px', width: '70px' } }"
                  :cancel-button-props="{ style: { height: '32px', width: '66px' } }"
                  @cancel="popconfirmVisible = ''"
                  @confirm="fenceNameConfirm(item.id)"
                >
                  <template #title>
                    <div>
                      <h3 style="margin-bottom: 8px">编辑围栏名称</h3>
                      <a-input
                        v-model:value="fenceInputName"
                        :default-value="item.name"
                        placeholder="请输入围栏名称"
                        style="width: 246px"
                      />
                    </div>
                  </template>
                  <EditOutlined class="edit-icon" @click="handleEditFence(item)" />
                </Popconfirm>
              </td>
              <td class="number-cell">{{ item.resident.toLocaleString() }}</td>
              <td class="number-cell">{{ item.living.toLocaleString() }}</td>
              <td class="number-cell">{{ item.working.toLocaleString() }}</td>
              <td class="number-cell">{{ item.young.toLocaleString() }}</td>
            </tr>
            <tr v-if="populationData.length === 0">
              <td colspan="5" style="padding: 20px; color: #999; text-align: center"
                >暂无分析数据</td
              >
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section-title">
        <span class="bar"></span>
        <span class="text">配套统计</span>
      </div>

      <div class="fence-select-container">
        <Select
          v-model:value="selectedFence"
          class="fence-select"
          :options="fenceOptions"
          placeholder="请选择查看的围栏"
        />
      </div>

      <div class="table-container">
        <table class="custom-table facility-table">
          <thead>
            <tr>
              <th>配套类型</th>
              <th>数量（个）</th>
              <th>密度（个/km²）</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in currentFacilities" :key="index">
              <td class="type-cell">{{ item.label }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.density }}</td>
            </tr>
            <tr v-if="currentFacilities.length === 0">
              <td colspan="3" style="padding: 20px; color: #999; text-align: center"
                >该区域暂无配套设施数据</td
              >
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
  import { Select, Popconfirm } from 'ant-design-vue';
  import { EditOutlined } from '@ant-design/icons-vue';

  interface PopulationItem {
    id: string;
    color: string;
    name: string;
    resident: number;
    living: number;
    working: number;
    young: number;
    area: number; // 围栏面积，用于计算密度
  }

  interface FacilityItem {
    fenceId: string;
    label: string;
    [key: string]: any;
  }

  const props = defineProps({
    open: {
      type: Boolean,
      default: false,
    },
    currentActiveKey: {
      type: String,
      default: '',
    },
    // 从父组件 layerGroups 整理出来的所有围栏人口数据
    populationData: {
      type: Array as () => PopulationItem[],
      default: () => [],
    },
    // 从父组件整理出来的所有 POI 点位数据
    facilityData: {
      type: Array as () => FacilityItem[],
      default: () => [],
    },
  });

  const emit = defineEmits([
    'update:open',
    'edit-fence',
    'update:currentActiveKey',
    'switch-fence',
    'handle-edit-fence-name',
  ]);

  const rightDrawerRef = ref<any>(null);
  const selectedFence = ref<string>('');

  // 当前正在修改的围栏名称输入框值
  const fenceInputName = ref<string>('');
  // 气泡框状态
  const popconfirmVisible = ref<string>('');
  // 确认修改围栏名称
  const fenceNameConfirm = (id: string) => {
    popconfirmVisible.value = '';
    if (!fenceInputName.value.trim()) return;
    emit('handle-edit-fence-name', id, fenceInputName.value);
    // 清空输入框
    fenceInputName.value = '';
  };
  // 抽屉开关控制
  watch(
    () => props.open,
    (val) => {
      if (rightDrawerRef.value) {
        rightDrawerRef.value.setOpen(val);
      }
    },
  );

  watch(
    () => props.currentActiveKey,
    (val) => {
      selectedFence.value = val;
    },
  );

  const handleOpenChange = (status: boolean) => {
    emit('update:open', status);
  };

  const handleFeedback = () => {
    console.log('点击反馈');
  };

  const handleEditFence = (item: any) => {
    fenceInputName.value = item.name;
    popconfirmVisible.value = item.id;
    emit('edit-fence', item);
  };

  // 下拉框选项：基于当前已有的人口数据列表
  const fenceOptions = computed(() => {
    return props.populationData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  });

  // 核心逻辑：计算当前选中围栏的配套分类统计
  const currentFacilities = computed(() => {
    if (!selectedFence.value) return [];

    // 1. 查找当前选中围栏的详细信息（主要为了面积）
    const activeFenceInfo = props.populationData.find((f) => f.id === selectedFence.value);
    const area = activeFenceInfo?.area || 0;

    // 2. 过滤出属于该围栏的所有 POI
    const filteredPoi = props.facilityData.filter((f) => f.fenceId === selectedFence.value);

    // 3. 按 label（分类）进行汇总统计
    const statsMap: Record<string, { label: string; count: number }> = {};
    filteredPoi.forEach((item) => {
      const label = item.label || '其他';
      if (!statsMap[label]) {
        statsMap[label] = { label, count: 0 };
      }
      statsMap[label].count++;
    });

    // 4. 转换为数组格式并计算密度
    return Object.values(statsMap).map((item) => ({
      label: item.label,
      count: item.count,
      // 密度计算：数量 / 面积 (km²)
      density: area > 0 ? (item.count / area).toFixed(2) : '0.00',
    }));
  });

  // 监听围栏列表变化：如果当前没有选中值，或者之前选中的值在列表中消失了，默认选中第一个
  watch(
    () => props.populationData,
    (newVal) => {
      if (newVal.length > 0) {
        const isStillExist = newVal.some((item) => item.id === selectedFence.value);
        if (!selectedFence.value || !isStillExist) {
          selectedFence.value = newVal[0].id;
        }
      } else {
        selectedFence.value = '';
      }
    },
    { immediate: true, deep: true },
  );
  watch(
    () => selectedFence.value,
    (val) => {
      emit('switch-fence', val);
    },
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
    overflow-y: auto;
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
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    background: #fff;

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
    min-width: 345px;
    border-collapse: collapse;
    font-size: 13px;

    th {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      color: #8c8c8c;
      font-weight: 400;
      text-align: left;
      white-space: nowrap;
    }

    td {
      padding: 10px 12px;
      color: #333;
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid #f0f0f0;
      background: #fff;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f9f9f9;
      }
    }
  }

  .fence-name-cell {
    display: flex;
    align-items: center;
    color: @primary-color !important;

    .dot {
      display: inline-block;
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      margin-bottom: 1px;
      border-radius: 50%;
    }

    .name-text {
      max-width: 100px;
      margin-right: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .edit-icon {
      color: #bfbfbf;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        color: @primary-color;
      }
    }
  }

  .number-cell {
    color: @primary-color !important;
    font-family: DINAlternate-Bold, DINAlternate;
    font-weight: bold;
  }

  .type-cell {
    color: #555 !important;
  }

  .fence-select-container {
    background: #fff;

    .fence-select {
      width: 100%;
    }
  }
</style>
