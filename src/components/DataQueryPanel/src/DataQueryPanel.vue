<template>
  <div class="data-query-panel">
    <!-- Header -->
    <div class="panel-header" @click="togglePanel">
      <span class="info-text">信息展示:{{ infoText }}</span>
      <UpOutlined v-if="internalOpen" class="toggle-icon" />
      <DownOutlined v-else class="toggle-icon" />
    </div>

    <!-- Body -->
    <Transition name="panel-slide">
      <div v-show="internalOpen" class="panel-body">
        <div class="panel-content">
          <!-- 人口分布 -->
          <div class="section">
            <div class="section-title">
              <div class="title-bar"></div>
              <span>人口分布</span>
            </div>

            <div class="form-item">
              <span class="label">人群筛选</span>
              <Select
                v-model:value="internalFormData.population.population_type"
                placeholder="请选择"
                class="flex-1"
                allowClear
                :options="populationOptions"
              />
            </div>

            <div class="form-item">
              <span class="label">网格边长</span>
              <Select
                v-model:value="internalFormData.population.size"
                placeholder="请选择"
                class="flex-1"
                allowClear
                :options="gridSizeOptions"
              />
            </div>

            <div class="form-item">
              <span class="label">季度选择</span>
              <DatePicker
                v-model:value="internalFormData.population.month"
                picker="quarter"
                placeholder="请选择季度"
                class="flex-1"
                allowClear
                :disabledDate="disabledDate"
              />
            </div>

            <div class="switch-group">
              <div class="switch-item">
                <span class="switch-label">热力图</span>
                <Switch v-model:checked="internalFormData.population.heatmap" size="medium" />
              </div>
              <div class="switch-item">
                <span class="switch-label">网格</span>
                <Switch v-model:checked="internalFormData.population.grid" size="medium" />
              </div>
              <div class="switch-item">
                <span class="switch-label">网格人数</span>
                <Switch
                  :checked="internalFormData.population.gridPopulation"
                  size="medium"
                  @change="onGridPopulationChange"
                />
              </div>
            </div>
          </div>

          <!-- POI分布 -->
          <div class="section">
            <div class="section-title poi-section flex-justify-between">
              <div class="section-title-other">
                <div class="title-bar"></div>
                <span>POI分布</span>
              </div>
              <div class="switch-item switch-item-other">
                <span class="switch-label">基本信息</span>
                <Switch v-model:checked="internalFormData.poi.baseInfo" size="medium" />
              </div>
            </div>

            <div class="poi-grid">
              <div class="poi-item w-full">
                <Checkbox
                  v-model:checked="internalFormData.poi.selectAll"
                  @change="onSelectAllChange"
                  >全选</Checkbox
                >
              </div>

              <div class="poi-item" v-for="item in poiLabelSuffix" :key="item.label">
                <Checkbox
                  :checked="
                    internalFormData.poi.selectedTypes?.some((type) => type.label === item.label)
                  "
                  @change="(e) => onPoiChange(e, item)"
                  size="medium"
                >
                  <span class="poi-dot" :style="{ backgroundColor: item.color }"></span>
                  <span class="poi-label">{{ item.label }}</span>
                </Checkbox>
              </div>
            </div>
          </div>
          <!-- 其他POI -->
          <div>
            <div class="poi-item w-full other-poi-wrapper">
              <div class="flex items-center">
                <span class="poi-dot" style="background-color: #4b85ff"></span>
                <span class="poi-label">其他POI</span>
              </div>

              <div class="other-poi-box">
                <Radio.Group v-model:value="internalFormData.poi.otherPoiType" class="radio-group">
                  <Radio value="category">业态</Radio>
                  <Radio value="brand">品牌</Radio>
                </Radio.Group>
                <span class="divider">|</span>
                <Cascader
                  v-if="internalFormData.poi.otherPoiType === 'category'"
                  v-model:value="internalFormData.poi.otherPoiValue"
                  :options="formatOptions"
                  :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                  multiple
                  max-tag-count="responsive"
                  placeholder="请选择业态"
                  :bordered="false"
                  class="other-input flex-1"
                  allowClear
                />
                <Select
                  v-else
                  v-model:value="internalFormData.poi.otherPoiValue"
                  mode="multiple"
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
          </div>
        </div>
        <!-- Footer -->
        <div class="panel-footer">
          <Button type="primary" class="analyze-btn" @click="handleAnalyze">开始分析</Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed, onMounted } from 'vue';
  import { Select, DatePicker, Switch, Checkbox, Radio, Button, Cascader } from 'ant-design-vue';
  import { UpOutlined, DownOutlined } from '@ant-design/icons-vue';
  import { populationOptions, gridSizeOptions, poiLabelSuffix } from './config';
  import { useCategroyStore } from '@/store/modules/business';
  import { getBrandSearch } from '@/api/global';
  import { debounce } from 'lodash-es';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import quarterOfYear from 'dayjs/plugin/quarterOfYear'; // ES 2015

  dayjs.extend(quarterOfYear);
  const categroyStore = useCategroyStore();
  const props = withDefaults(
    defineProps<{
      open?: boolean;
      infoText?: string;
      formData?: any;
    }>(),
    {
      open: true,
      infoText: '暂无围栏信息',
      formData: () => ({
        population: {
          population_type: 3,
          size: 100,
          // month: dayjs().subtract(1, 'quarter').format('YYYY-[Q]Q'),
          month: dayjs().subtract(3, 'month'),
          heatmap: true,
          grid: false,
          gridPopulation: false,
        },
        poi: {
          selectAll: false,
          baseInfo: false,
          otherPoiType: 'category',
          otherPoiValue: [],
        },
      }),
    },
  );

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'update:formData', value: any): void;
    (e: 'analyze', data: any): void;
  }>();

  const getInitFormData = (data: any) => {
    const parsed = JSON.parse(JSON.stringify(data));
    if (parsed.population && parsed.population.month) {
      parsed.population.month = dayjs(parsed.population.month);
    }
    return parsed;
  };

  const internalOpen = ref(props.open);
  const internalFormData = reactive(getInitFormData(props.formData));

  // 获取状态管理工具中的业态数据
  const formatOptions = computed(() => {
    return categroyStore.getCategroyTree;
  });

  // 如果业态数据为空，则调用接口获取
  onMounted(() => {
    if (!formatOptions.value || formatOptions.value.length === 0) {
      categroyStore.fetchCategroyTree();
    }
  });

  // 模拟品牌数据
  const brandOptions = ref([]);

  // 切换业态或品牌时，清空选择的值
  watch(
    () => internalFormData.poi.otherPoiType,
    () => {
      internalFormData.poi.otherPoiValue = [];
    },
  );

  watch(
    () => props.open,
    (newVal) => {
      internalOpen.value = newVal;
    },
  );

  watch(
    () => props.formData,
    (newVal) => {
      if (JSON.stringify(internalFormData) !== JSON.stringify(newVal)) {
        Object.assign(internalFormData, getInitFormData(newVal));
      }
    },
    { deep: true },
  );

  watch(
    internalFormData,
    (newVal) => {
      emit('update:formData', JSON.parse(JSON.stringify(newVal)));
    },
    { deep: true },
  );

  // 互斥逻辑：热力图和网格
  watch(
    () => internalFormData.population.heatmap,
    (val) => {
      if (val) {
        internalFormData.population.grid = false;
        internalFormData.population.gridPopulation = false;
      }
    },
  );
  watch(
    () => internalFormData.population.grid,
    (val) => {
      if (val) {
        internalFormData.population.heatmap = false;
        internalFormData.population.gridPopulation = true;
      } else {
        internalFormData.population.gridPopulation = false;
      }
    },
  );

  // 网格没有开启人数不可开启
  const onGridPopulationChange = (e) => {
    if (internalFormData.population.grid) {
      internalFormData.population.gridPopulation = e;
    }
  };

  // 查询获取品牌数据
  const searchBrand = debounce(async (value: string) => {
    const res = await getBrandSearch({ keyword: value });
    brandOptions.value = res.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, 500);
  const togglePanel = () => {
    internalOpen.value = !internalOpen.value;
    emit('update:open', internalOpen.value);
  };

  // 全选/取消全选
  const onSelectAllChange = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      internalFormData.poi.selectedTypes = poiLabelSuffix;
    } else {
      internalFormData.poi.selectedTypes = [];
    }
  };

  // 单个 POI 选中状态改变，判断是否需要同步全选状态
  const onPoiChange = (e: any, value: any) => {
    if (!internalFormData.poi.selectedTypes) {
      internalFormData.poi.selectedTypes = [];
    }
    if (e.target.checked) {
      internalFormData.poi.selectedTypes.push(value);
    } else {
      internalFormData.poi.selectedTypes = internalFormData.poi.selectedTypes.filter(
        (v) => v.label !== value.label,
      );
    }

    const allChecked = internalFormData.poi.selectedTypes.length === poiLabelSuffix.length;
    internalFormData.poi.selectAll = allChecked;
  };

  // 收集数据并触发分析事件
  const handleAnalyze = () => {
    const selectedPois = internalFormData.poi.selectedTypes || [];

    const payload = {
      ...internalFormData.population,
      month: internalFormData.population.month
        ? dayjs(internalFormData.population.month).format('YYYY-[Q]Q')
        : undefined,
      poi: {
        selectedTypes: selectedPois,
        otherPoiType: internalFormData.poi.otherPoiType,
        otherPoiValue: internalFormData.poi.otherPoiValue,
      },
    };

    emit('analyze', payload);
  };

  const disabledDate = (current: Dayjs) => {
    // 不能选择今天之后的季度
    return current && current > dayjs().endOf('quarter');
  };
</script>

<style lang="less" scoped src="./index.less"></style>
