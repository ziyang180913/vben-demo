<template>
  <div class="select-address-urban-street" @click.stop>
    <Cascader
      :placeholder="placeholderText"
      style="width: 100%"
      allowClear
      :showSearch="{ filter }"
      :open="open"
      :value="cascaderValue"
      changeOnSelect
      @dropdown-visible-change="handleDropdownVisibleChange"
      @change="handleCascaderChange"
      @search="handleSearch"
      :options="selectOptions"
    >
      <template #dropdownRender="{ menuNode }">
        <div v-show="open" @click.stop>
          <component :is="menuNode" />
        </div>
      </template>
    </Cascader>

    <Spin :spinning="loading">
      <div class="select-address-urban-street-card">
        <div class="select-address-urban-street-card-current">
          <div v-if="valueList?.length" class="select-address-urban-street-card-current-title">
            <span
              v-for="(item, index) in valueList"
              :key="index"
              class="title-color"
              @click="handleTitleClick(item)"
            >
              {{ item.label }}
            </span>
            <span>请选择</span>
          </div>
          <template v-else> 省/直辖市 </template>
        </div>

        <div class="select-address-urban-street-card-list">
          <ul>
            <li v-for="(item, index) in cardList" :key="index">
              <span
                :class="item.label === curValue?.label ? 'color-4d6aff' : ''"
                @click="handleItemClick(item)"
              >
                {{ item.label }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, h } from 'vue';
  import { Spin, Cascader } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { treeFindDataByFactor, findChildrenById } from '@/components/CascaderCity/src/fn';
  // import { useCityStore } from '@/stores/city';
  // import { storeToRefs } from 'pinia';

  interface Option {
    label: string;
    value: string;
    additional?: Option[];
    children?: Option[];
  }

  // 定义城市数据项类型
  interface CityDataItem {
    label: string;
    value: string;
    children?: CityDataItem[];
    additional?: CityDataItem[];
  }

  const props = withDefaults(
    defineProps<{
      valueList?: Option[];
      curTabsVal: string | number;
      curValue: Option;
      request?: Function;
    }>(),
    {
      valueList: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'updateValueList', val: Option[]): void;
    (e: 'updateCurValue', val: Option): void;
  }>();

  const cardList = ref<CityDataItem[]>([]);
  const open = ref(false);
  const selectOptions = ref<Option[]>([]);
  const cascaderValue = ref<string[]>([]);
  const loading = ref(false);

  // 获取城市
  // const cityStore = useCityStore();
  // const { cityList } = storeToRefs(cityStore);
  const cityList = ref([]);
  // 获取数据源
  const getCommercialareaList = async () => {
    loading.value = true;
    try {
      let data = cityList.value || [];
      if (data.length === 0) {
        // 如果本地没有数据，从接口获取
        data = await cityStore.getCityList();
      }

      selectOptions.value = data;
      cardList.value = data.map(({ label, value }) => ({ label, value }));
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    getCommercialareaList();
  });

  // 查询
  const filter = (inputValue: string, path: CityDataItem[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };

  const handleCascaderChange = (value: string[], selectedOptions: Option[]) => {
    if (value?.length) {
      cascaderValue.value = value;
      const lastOption = selectedOptions.at(-1);

      if (lastOption?.children?.length) {
        emit('updateValueList', [...selectedOptions]);
        cardList.value = lastOption.children;
        emit('updateCurValue', lastOption);
      } else {
        const parentOptions = selectedOptions.slice(0, -1);
        emit('updateValueList', parentOptions);
        cardList.value = selectedOptions.at(-2)?.children || [];
        emit('updateCurValue', lastOption || ({} as Option));
      }
    } else {
      cascaderValue.value = [];
      emit('updateCurValue', {} as Option);
      emit('updateValueList', []);
      cardList.value = selectOptions.value.map(({ label, value }) => ({ label, value }));
    }
    open.value = false;
  };

  const handleDropdownVisibleChange = (value: boolean) => {
    if (!value) {
      open.value = false;
    }
  };

  const handleSearch = (search: string) => {
    open.value = !!search;
  };

  const handleTitleClick = (item: Option) => {
    const newValList = JSON.parse(JSON.stringify(props.valueList));
    // 查找到的下标
    const idx = newValList.findIndex((val: any) => val.value === item.value);
    // 删除后面的数据
    newValList.splice(idx);
    //  获取查询数据
    const findData = treeFindDataByFactor(
      selectOptions.value,
      (d: any) => d.value === item.value,
    ) as any;
    const data = findData.at(-1);
    if (data) {
      emit('updateCurValue', item);
      // // 增加当前选中数据
      emit('updateValueList', findData);
      cardList.value = data?.parent_admin_div_id
        ? findChildrenById(selectOptions.value, data?.parent_admin_div_id)
        : selectOptions.value;
    }
  };

  const handleItemClick = (item: Option) => {
    cascaderValue.value = [];
    const foundData = treeFindDataByFactor(selectOptions.value, (d) => d.value === item.value);
    const lastData = foundData.at(-1);

    if (lastData?.children?.length) {
      emit('updateValueList', foundData);
      cardList.value = lastData.children.map(({ label, value }: any) => ({
        label,
        value,
      }));
      emit('updateCurValue', lastData);
    } else {
      emit('updateCurValue', item);
    }
  };

  // Custom placeholder with icon
  const placeholderText = ref<any>(undefined);
  onMounted(() => {
    placeholderText.value = h('div', [h(SearchOutlined), '\u00A0 请输入省份/城市/区县/街道搜索']);
  });
</script>
<style lang="less">
  @import url("./index.less");
</style>
