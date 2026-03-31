<template>
  <div class="poi-business-selector">
    <div class="other-poi-box">
      <Radio.Group v-model:value="type" class="radio-group">
        <Radio value="category">业态</Radio>
        <Radio value="brand">品牌</Radio>
      </Radio.Group>
      <span class="divider">|</span>

      <Cascader
        v-if="type === 'category'"
        v-model:value="cascaderValue"
        :options="formatOptions"
        :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
        multiple
        max-tag-count="responsive"
        placeholder="请选择业态"
        :bordered="false"
        class="other-input flex-1"
        :showCheckedStrategy="Cascader.SHOW_CHILD"
        allowClear
        @change="onCascaderChange"
      />

      <Select
        v-else
        v-model:value="selectedDetails"
        mode="multiple"
        label-in-value
        :options="brandOptions"
        placeholder="请输入或选择品牌"
        :bordered="false"
        class="other-input flex-1"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        @search="searchBrand"
        max-tag-count="responsive"
        allowClear
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { Radio, Cascader, Select } from 'ant-design-vue';
  import { useCategroyStore } from '@/store/modules/business';
  import { getBrandSearch } from '@/api/global';
  import { debounce } from 'lodash-es';

  // 定义接口提高代码健壮性
  interface SelectionItem {
    label: string;
    value: string | number;
  }

  const props = defineProps<{
    type: 'category' | 'brand';
    value: SelectionItem[]; // 统一输出的详情列表
  }>();

  const emit = defineEmits<{
    (e: 'update:type', val: 'category' | 'brand'): void;
    (e: 'update:value', val: SelectionItem[]): void;
  }>();

  const categroyStore = useCategroyStore();
  const brandOptions = ref<SelectionItem[]>([]);
  const cascaderValue = ref<(string | number)[][]>([]); // 内部维护 Cascader 的 ID 数组

  // 计算属性：同步 Store 数据
  const formatOptions = computed(() => categroyStore.getCategroyTree);

  // 计算属性：简化 Select 绑定的双向数据流
  const selectedDetails = computed({
    get: () => props.value,
    set: (val) => emit('update:value', val),
  });

  const type = computed({
    get: () => props.type,
    set: (val) => {
      cascaderValue.value = [];
      emit('update:type', val);
      emit('update:value', []);
    },
  });

  onMounted(() => {
    if (!formatOptions.value || formatOptions.value.length === 0) {
      categroyStore.fetchCategroyTree();
    }
  });

  // 搜索品牌
  const searchBrand = debounce(async (value: string) => {
    if (!value) return;
    try {
      const res = await getBrandSearch({ keyword: value });
      brandOptions.value = res.items.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
    } catch (error) {
      console.error('Fetch brands failed:', error);
    }
  }, 500);

  // 处理 Cascader 变化
  const onCascaderChange = (_value: any, selectedOptions: any[][]) => {
    const details = selectedOptions.map((path) => {
      const target = path[path.length - 1];
      return {
        label: target.name,
        value: target.id,
      };
    });
    emit('update:value', details);
  };
</script>

<style lang="less" scoped>
  /* 建议将原 index.less 中相关的 CSS 迁移至此或保持引用 */
  .other-poi-box {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    width: 100%;
    margin-top: 12px;
    // padding: 0 12px;
    padding-left: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;

    :deep(.ant-select-selector) {
      border: none;
      box-shadow: none !important;
    }

    .radio-group {
      display: flex;
      white-space: nowrap;
    }

    .divider {
      margin: -2px 5px 0;
      color: #e8e8e8;
    }

    .other-input {
      // padding: 4px 0;
      width: 184px;

      &:focus {
        box-shadow: none;
      }
    }
  }
</style>
