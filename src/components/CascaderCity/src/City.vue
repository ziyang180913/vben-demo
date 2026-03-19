<template>
  <div class="other-cascader-city" ref="containerRef" :style="props.style">
    <slot></slot>

    <div
      class="other-cascader-city-modal"
      :style="{
        height: modalOpen ? '330px' : '0',
        opacity: modalOpen ? 1 : 0,
        ...props.extStyle,
      }"
    >
      <div class="other-cascader-city-select-address-urban-street">
        <Cascader
          v-if="props.isCascader"
          v-model:value="cascaderValue"
          :options="selectOptions"
          :style="{ width: '100%', ...props.cardStyle }"
          :open="isDropdownOpen"
          change-on-select
          allow-clear
          @focus="modalOpen = true"
          @dropdown-visible-change="(v) => (isDropdownOpen = v)"
          @change="onCascaderChange"
        >
          <template #placeholder> <SearchOutlined />&nbsp; 请输入省份/城市/区县 </template>
        </Cascader>

        <div class="other-cascader-city-select-address-urban-street-card">
          <div class="other-cascader-city-select-address-urban-street-card-current">
            <div
              v-if="valueList.length"
              class="other-cascader-city-select-address-urban-street-card-current-title"
            >
              <span
                v-for="(item, index) in valueList"
                :key="index"
                class="title-color"
                @click="handleBreadcrumbClick(item)"
              >
                {{ item.label }}
              </span>
              <span>请选择</span>
            </div>
            <template v-else>省/直辖市/区县</template>
          </div>

          <Spin :spinning="loading">
            <div class="other-cascader-city-select-address-urban-street-card-list">
              <ul>
                <li v-for="(item, index) in cardList" :key="index">
                  <span
                    :class="[
                      'other-cascader-city-select-address-urban-street-tag',
                      { 'color-4d6aff': item.label === curValue.label },
                    ]"
                    @click="handleTagClick(item)"
                  >
                    {{ item.label }}
                  </span>
                </li>
              </ul>
            </div>
          </Spin>
        </div>
      </div>

      <div class="other-cascader-city-btn">
        <Button
          @click="
            () => {
              modalOpen = false;
              props.onClose?.();
            }
          "
          >取消</Button
        >
        <Button type="primary" @click="handleConfirm">
          {{ props.okText || '加载区域围栏' }}
        </Button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import { Cascader, Spin, Button } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { treeFindDataByFactor, findChildrenById } from './fn';
  import './index.less';

  // --- 类型定义 ---
  interface CityDataItem {
    label: string;
    value: string;
    children?: CityDataItem[];
    parent_admin_div_id?: string;
  }

  interface Props {
    dataLevel?: number;
    setSelectVal?: (val: CityDataItem[]) => void;
    onChange?: (val: CityDataItem[]) => void;
    onClose?: () => void;
    style?: any;
    cardStyle?: any;
    isCascader?: boolean;
    extStyle?: any;
    okText?: string;
  }

  // --- Props & Slots ---
  const props = withDefaults(defineProps<Props>(), {
    dataLevel: 0,
    cardStyle: () => ({}),
    isCascader: false,
  });
  const cityList = [];
  const modalOpen = ref(false);
  const isDropdownOpen = ref(false);
  const loading = ref(false);
  const containerRef = ref<HTMLElement | null>(null);

  const cardList = ref<CityDataItem[]>([]);
  const selectOptions = ref<CityDataItem[]>([]);
  const cascaderValue = ref<string[]>([]);
  const valueList = ref<CityDataItem[]>([]);
  const curValue = ref<CityDataItem>({} as CityDataItem);

  const resetParam = () => {
    cascaderValue.value = [];
    curValue.value = {} as CityDataItem;
    valueList.value = [];
    cardList.value = selectOptions.value.map(({ label, value }) => ({ label, value }));
  };

  // 搜索过滤
  const filterSearch = (inputValue: string, path: CityDataItem[]) => {
    return path.some((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  };

  // 点击外部关闭逻辑
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (containerRef.value && !containerRef.value.contains(target)) {
      // 额外判断：如果点击的是 antd 自动生成的级联菜单面板，则不关闭
      const isAntPopup =
        target.closest('.ant-cascader-menus') ||
        target.classList.contains('other-cascader-city-select-address-urban-street-tag');
      if (!isAntPopup) {
        modalOpen.value = false;
      }
    }
  };

  // 同步级联选择状态（弹窗关闭时调用）
  const syncCascaderToSelection = () => {
    if (!selectOptions.value.length) return;

    const currentPathStr = valueList.value.map((i) => i.value).join(',');
    const cascaderPathStr = cascaderValue.value.slice(0, -1).join(',');

    if (currentPathStr === cascaderPathStr) return;

    let currentLevel = selectOptions.value;
    const newPath: CityDataItem[] = [];

    for (const val of cascaderValue.value.slice(0, -1)) {
      const found = currentLevel.find((item) => item.value === val);
      if (found) {
        newPath.push(found);
        currentLevel = found.children || [];
      }
    }
    cardList.value = currentLevel;
    valueList.value = newPath;
  };

  watch(modalOpen, (isOpen) => {
    if (isOpen) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
      syncCascaderToSelection();
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('click', handleClickOutside);
  });

  // --- 暴露给父组件的方法 ---
  defineExpose({
    setModalOpen: (val: boolean) => (modalOpen.value = val),
    modalToggle: () => (modalOpen.value = !modalOpen.value),
    resetParam,
  });

  // 标签点击处理
  const handleTagClick = (item: CityDataItem) => {
    const findData = treeFindDataByFactor(
      selectOptions.value,
      (d: any) => d.value === item.value,
    ) as CityDataItem[];
    const lastFound = findData?.at(-1);
    if (lastFound) {
      if (lastFound.children?.length) {
        valueList.value = [...findData];
        cardList.value = lastFound.children.map(({ label, value }) => ({ label, value }));
        curValue.value = lastFound;
      } else {
        curValue.value = item;
      }
    }
  };

  // 面包屑点击处理
  const handleBreadcrumbClick = (item: CityDataItem) => {
    const findData = treeFindDataByFactor(
      selectOptions.value,
      (d: any) => d.value === item.value,
    ) as CityDataItem[];
    const data = findData?.at(-1);
    if (data) {
      curValue.value = item;
      valueList.value = findData;
      cardList.value = data.parent_admin_div_id
        ? findChildrenById(cityList.value, data.parent_admin_div_id)
        : cityList.value;
    }
  };

  const handleConfirm = () => {
    const finalSelection = Object.keys(curValue.value).length
      ? Array.from(new Set([...valueList.value, curValue.value]))
      : [...valueList.value];

    cascaderValue.value = finalSelection.map((i) => i.value);
    modalOpen.value = false;
    props.setSelectVal?.(finalSelection);
    props.onChange?.(finalSelection);
  };
</script>

<style lang="less">
  @import url('./index.less');
</style>
