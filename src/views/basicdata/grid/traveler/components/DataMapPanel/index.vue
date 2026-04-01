<template>
  <div class="gis-container">
    <aside class="side-panel" :class="{ 'is-collapsed': isCollapsed }">
      <div
        class="panel-header"
        @click="
          () => {
            isCollapsed = !isCollapsed;
          }
        "
      >
        <div class="header-inner">
          <unordered-list-outlined class="primary-icon" />
          <span class="title">数据地图</span>
        </div>
      </div>

      <div v-show="!isCollapsed" class="panel-scroll-content">
        <section class="ctrl-group">
          <h4 class="group-title">地图分析</h4>
          <div class="ctrl-items">
            <div class="ctrl-item">
              <Switch v-model:checked="state.baseInfo" size="small" />
              <span class="label">基本信息</span>
            </div>

            <div
              class="ctrl-item clickable"
              :class="{ 'is-active': activePanels.analysis === 'overnight' }"
            >
              <Switch
                v-model:checked="state.overnight"
                size="small"
                @change="(val) => handleSwitchChange('overnight', val)"
              />
              <span class="label">过夜热力分析</span>
              <right-outlined class="arrow-icon" @click.stop="handlePopupToggle('overnight')" />
            </div>

            <div
              class="ctrl-item clickable"
              :class="{ 'is-active': activePanels.analysis === 'daytime' }"
            >
              <Switch
                v-model:checked="state.daytime"
                size="small"
                @change="(val) => handleSwitchChange('daytime', val)"
              />
              <span class="label">白天聚客分析</span>
              <right-outlined class="arrow-icon" @click.stop="handlePopupToggle('daytime')" />
            </div>
          </div>
        </section>

        <section class="ctrl-group">
          <h4 class="group-title">POI点位查看</h4>
          <div class="ctrl-items">
            <div v-for="poi in poiList" :key="poi.key" class="ctrl-item">
              <Switch
                v-model:checked="poi.visible"
                size="small"
                @change="(val) => onPoiChange(poi, val)"
              />
              <div class="poi-color-bar" :style="{ background: poi.color }"></div>
              <span class="label">{{ poi.label }}</span>
              <right-outlined
                v-if="poi.hasDetail"
                class="arrow-icon"
                :class="{ 'is-active': activePanels.business }"
                @click.stop="handlePopupToggle('business')"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>

    <div class="config-panels-wrapper">
      <transition name="slide-fade">
        <div v-if="activePanels.analysis" class="config-drawer" :style="{ marginBottom: '16px' }">
          <div class="drawer-header">
            <a-button type="link" size="small" @click="activePanels.analysis = null">隐藏</a-button>
          </div>

          <div class="drawer-body">
            <div class="form-item">
              <label>过滤条件</label>
              <a-input
                v-model:value="queryConfig.minPeople"
                placeholder="最小人群数量"
                allow-clear
              />
            </div>

            <div class="form-item">
              <label>网格边长</label>
              <RadioGroup
                v-model:value="queryConfig.gridSize"
                button-style="solid"
                class="full-width-radio"
              >
                <RadioButton value="40">40m</RadioButton>
                <RadioButton value="100">100m</RadioButton>
              </RadioGroup>
            </div>

            <div class="form-actions">
              <a-button @click="resetQuery">重置</a-button>
              <a-button type="primary" @click="submitQuery">确定</a-button>
            </div>

            <div class="view-toggles">
              <div class="toggle-unit">
                <Switch :checked="queryConfig.showGrid" size="small" @change="onGridChange" />
                <span>网格</span>
              </div>
              <div class="toggle-unit">
                <Switch
                  :checked="queryConfig.showValue"
                  size="small"
                  @change="onGridPopulationChange"
                />
                <span>网格数值</span>
              </div>
              <div class="toggle-unit">
                <Switch :checked="queryConfig.showHeat" size="small" @change="onHeatmapChange" />
                <span>热力图</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <transition name="slide-fade">
        <div v-if="activePanels.business" class="config-drawer">
          <div class="drawer-header">
            <a-button type="link" size="small" @click="activePanels.business = false"
              >隐藏</a-button
            >
          </div>
          <div class="drawer-body">
            <div class="form-item">
              <label>业态分类</label>
              <Cascader
                v-model:value="cascaderValue"
                :options="formatOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                multiple
                max-tag-count="responsive"
                placeholder="请选择业态"
                :style="{ width: '100%' }"
                :showCheckedStrategy="Cascader.SHOW_CHILD"
              />
            </div>
            <div class="form-actions" :style="{ border: 'none' }">
              <a-button @click="resetBusinessQuery">重置</a-button>
              <a-button type="primary" @click="submitBusinessQuery">确定</a-button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted } from 'vue';
  import {
    Switch,
    RadioGroup,
    RadioButton,
    Cascader,
    Button as AButton,
    Input as AInput,
  } from 'ant-design-vue';
  import { UnorderedListOutlined, RightOutlined } from '@ant-design/icons-vue';
  import { useCategroyStore } from '@/store/modules/business';

  interface PoiItem {
    key: string;
    label: string;
    color: string;
    visible: boolean;
    hasDetail?: boolean;
  }

  const isCollapsed = ref(false);

  const activePanels = reactive({
    analysis: null as 'overnight' | 'daytime' | null,
    business: false,
  });

  const state = reactive({
    baseInfo: false,
    overnight: false, // 初始设为关闭
    daytime: false, // 初始设为关闭
  });

  const poiList = ref<PoiItem[]>([
    { key: 'business', label: '业态', color: '#3A57FE', visible: false, hasDetail: true },
    { key: 'subway', label: '地铁站', color: '#FADB14', visible: false },
    { key: 'mall', label: '商场', color: '#1890FF', visible: false },
    { key: 'airport', label: '机场', color: '#52C41A', visible: false },
    { key: 'railway', label: '火车站/高铁站', color: '#6FCDEF', visible: false },
    { key: 'scenery', label: '大型景区', color: '#F5222D', visible: false },
    { key: 'hospital', label: '大型医院', color: '#EB2F96', visible: false },
    { key: 'exhibition', label: '展览馆', color: '#FAAD14', visible: false },
    { key: 'office', label: '写字楼/园区', color: '#A0D911', visible: false },
    { key: 'college', label: '高校', color: '#722ED1', visible: false },
  ]);

  const queryConfig = reactive({
    minPeople: '',
    gridSize: '100',
    showGrid: false,
    showValue: false,
    showHeat: true,
  });

  const cascaderValue = ref([]);
  const categroyStore = useCategroyStore();
  const formatOptions = computed(() => categroyStore.getCategroyTree);

  // 互斥逻辑：处理直接点击 Switch 的情况
  const handleSwitchChange = (type: 'overnight' | 'daytime', val: boolean) => {
    if (val) {
      if (type === 'overnight') state.daytime = false;
      else state.overnight = false;
      emit('analysisQuery', { type, config: { ...queryConfig } });
    } else {
      emit('analysisQuery', { type: null, config: { ...queryConfig } });
    }
    // 如果关闭了 Switch，且当前面板正是该类型，则关闭面板
    if (!val && activePanels.analysis === type) {
      activePanels.analysis = null;
    }
  };

  const handlePopupToggle = (type: 'overnight' | 'daytime' | 'business') => {
    if (type === 'business') {
      activePanels.business = !activePanels.business;
    } else {
      // 展开/折叠逻辑：点击右侧箭头仅控制面板显隐
      activePanels.analysis = activePanels.analysis === type ? null : type;
    }
  };

  const resetQuery = () => {
    queryConfig.minPeople = '';
    queryConfig.gridSize = '100';
  };

  const resetBusinessQuery = () => {
    cascaderValue.value = [];
  };

  const emitDisplayChange = () => {
    const currentType = state.overnight ? 'overnight' : state.daytime ? 'daytime' : null;
    emit('analysisDisplay', { type: currentType, config: { ...queryConfig } });
  };

  // 交互逻辑
  const onHeatmapChange = (checked: boolean) => {
    if (checked) {
      queryConfig.showValue = false;
      queryConfig.showGrid = false;
    }
    queryConfig.showHeat = checked;
    emitDisplayChange();
  };

  const onGridChange = (checked: boolean) => {
    queryConfig.showGrid = checked;
    if (checked) {
      queryConfig.showHeat = false;
      queryConfig.showValue = true;
    } else {
      queryConfig.showValue = false;
    }
    emitDisplayChange();
  };

  const onGridPopulationChange = (checked: boolean) => {
    if (queryConfig.showGrid) {
      queryConfig.showValue = checked;
      emitDisplayChange();
    }
  };

  // 核心逻辑：点击确定时开启对应的开关，并执行互斥
  const submitQuery = () => {
    const currentType = activePanels.analysis;
    if (currentType === 'overnight') {
      state.overnight = true;
      state.daytime = false;
      emit('analysisQuery', { type: 'overnight', config: { ...queryConfig } });
    } else if (currentType === 'daytime') {
      state.daytime = true;
      state.overnight = false;
      emit('analysisQuery', { type: 'daytime', config: { ...queryConfig } });
    }
  };

  const submitBusinessQuery = () => {
    console.log('触发业态 查询:', cascaderValue.value);
  };

  const emit = defineEmits(['poiChange', 'poiLookInfo', 'analysisQuery', 'analysisDisplay']);

  const onPoiChange = (poi: PoiItem, visible: boolean) => {
    if (poi.key === 'business' && !visible) {
      activePanels.business = false;
    }
    emit('poiChange', { ...poi, visible });
  };

  watch(
    () => state.baseInfo,
    (newVal) => {
      emit('poiLookInfo', newVal);
    },
  );

  onMounted(() => {
    if (!formatOptions.value || formatOptions.value.length === 0) {
      categroyStore.fetchCategroyTree();
    }
  });

  defineExpose({
    baseInfo: computed(() => state.baseInfo),
  });
</script>

<style scoped lang="less" src="./index.less"></style>
