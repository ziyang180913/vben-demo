<template>
  <div class="data-query-panel">
    <div class="panel-header" @click="togglePanel">
      <span class="info-text">信息展示:{{ infoText }}</span>
      <UpOutlined v-if="internalOpen" class="toggle-icon" />
      <DownOutlined v-else class="toggle-icon" />
    </div>

    <Transition name="panel-slide">
      <div v-show="internalOpen" class="panel-body">
        <div class="panel-content">
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
                :options="populationOptions"
              />
            </div>

            <div class="form-item">
              <span class="label">网格边长</span>
              <Select
                v-model:value="internalFormData.population.size"
                placeholder="请选择"
                class="flex-1"
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
                :disabledDate="disabledDate"
              />
            </div>

            <div class="switch-group">
              <div class="switch-item">
                <span class="switch-label">热力图</span>
                <Switch
                  v-model:checked="internalFormData.population.heatmap"
                  @change="onHeatmapChange"
                  size="medium"
                />
              </div>
              <div class="switch-item">
                <span class="switch-label">网格</span>
                <Switch
                  v-model:checked="internalFormData.population.grid"
                  @change="onGridChange"
                  size="medium"
                />
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
          <div>
            <div class="poi-item w-full other-poi-wrapper">
              <div class="flex items-center">
                <span class="poi-dot" style="background-color: #4b85ff"></span>
                <span class="poi-label">其他POI</span>
              </div>

              <PoiBusinessSelector
                v-model:type="internalFormData.poi.otherPoiType"
                v-model:value="currentPoiDetails"
              />
            </div>
          </div>
        </div>
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
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import quarterOfYear from 'dayjs/plugin/quarterOfYear';
  import { PoiBusinessSelector } from '@/components/PoiBusinessSelector';

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
          month: dayjs().subtract(3, 'month'),
          heatmap: true,
          grid: false,
          gridPopulation: false,
        },
        poi: {
          selectAll: false,
          baseInfo: false,
          otherPoiType: 'category',
          otherPoiValue: [], // 仅存放 Cascader 绑定的 ID 数组
          otherCategoryDetails: [], // 存放业态选中的 {label, value}
          otherBrandDetails: [], // 存放品牌选中的 {label, value} (label-in-value 自动生成)
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

  const formatOptions = computed(() => categroyStore.getCategroyTree);

  onMounted(() => {
    if (!formatOptions.value || formatOptions.value.length === 0) {
      categroyStore.fetchCategroyTree();
    }
  });

  const brandOptions = ref([]);

  // 切换类型时清空数据
  watch(
    () => internalFormData.poi.otherPoiType,
    () => {
      internalFormData.poi.otherPoiValue = [];
      internalFormData.poi.otherCategoryDetails = [];
      internalFormData.poi.otherBrandDetails = [];
    },
  );

  // 监听外部 props 变化
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

  // 交互逻辑
  const onHeatmapChange = (checked: boolean) => {
    if (checked) {
      internalFormData.population.grid = false;
      internalFormData.population.gridPopulation = false;
    }
  };

  const onGridChange = (checked: boolean) => {
    if (checked) {
      internalFormData.population.heatmap = false;
      internalFormData.population.gridPopulation = true;
    } else {
      internalFormData.population.gridPopulation = false;
    }
  };

  const onGridPopulationChange = (e: any) => {
    if (internalFormData.population.grid) {
      internalFormData.population.gridPopulation = e;
    }
  };

  // 使用计算属性来中转 internalFormData 中的数据，保持逻辑清晰
  const currentPoiDetails = computed({
    get: () => {
      return internalFormData.poi.otherPoiType === 'category'
        ? internalFormData.poi.otherCategoryDetails
        : internalFormData.poi.otherBrandDetails;
    },
    set: (val) => {
      if (internalFormData.poi.otherPoiType === 'category') {
        internalFormData.poi.otherCategoryDetails = val;
      } else {
        internalFormData.poi.otherBrandDetails = val;
      }
    },
  });

  const togglePanel = () => {
    internalOpen.value = !internalOpen.value;
    emit('update:open', internalOpen.value);
  };

  const onSelectAllChange = (e: any) => {
    const checked = e.target.checked;
    internalFormData.poi.selectedTypes = checked ? [...poiLabelSuffix] : [];
  };

  const onPoiChange = (e: any, value: any) => {
    if (!internalFormData.poi.selectedTypes) internalFormData.poi.selectedTypes = [];
    if (e.target.checked) {
      internalFormData.poi.selectedTypes.push(value);
    } else {
      internalFormData.poi.selectedTypes = internalFormData.poi.selectedTypes.filter(
        (v: any) => v.label !== value.label,
      );
    }
    internalFormData.poi.selectAll =
      internalFormData.poi.selectedTypes.length === poiLabelSuffix.length;
  };

  // 最终提交逻辑
  const handleAnalyze = () => {
    const payload = {
      ...internalFormData.population,
      month: internalFormData.population.month
        ? dayjs(internalFormData.population.month).format('YYYY-[Q]Q')
        : undefined,
      poi: {
        selectedTypes: internalFormData.poi.selectedTypes || [],
        baseInfo: internalFormData.poi.baseInfo,
        otherPoiType: internalFormData.poi.otherPoiType,
        otherPoiDetails: currentPoiDetails.value,
      },
    };

    emit('analyze', payload);
  };

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('quarter');
  };
</script>

<style lang="less" scoped src="./index.less"></style>
