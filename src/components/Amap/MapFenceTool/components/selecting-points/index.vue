<template>
  <Teleport v-if="targetReady" :to="`#${modalId}`">
    <img style="width: 25px; height: 25px" :src="centerPointIcon" @click="onMyOK" />
    <div
      class="selecting-points-style"
      :style="{
        boxShadow: open ? '0px 3px 6px 0px rgba(2, 4, 13, 0.2)' : 'none',
        height: open ? 'auto' : '0',
        opacity: open ? 1 : 0,
        display: open ? 'block' : 'none',
      }"
    >
      <div class="sharp"></div>
      <div class="header">
        <div class="header-content">
          <div class="header-name">
            <div
              :class="isFunction(params.nameClick) ? 'header-name-click' : ''"
              @click="params.nameClick"
            >
              <template v-if="(params?.name as string)?.length > 13">
                <Tooltip :title="params.name">
                  <span>{{ params.name }}</span>
                </Tooltip>
              </template>
              <template v-else>
                <span>{{ params.name }}</span>
              </template>
            </div>
            <CloseOutlined @click="onMyCancel" />
          </div>
          <div class="header-desc">
            <img :src="centerPointIcon" alt="位置图标" />
            {{ params.desc }}
          </div>
        </div>
        <div class="content">
          <Radio.Group
            v-if="isRadio"
            :options="QUERY_OPTIONS"
            :value="radVal"
            @change="handleRadioChange"
            buttonStyle="solid"
            optionType="button"
          />
          <div class="content-cur-dom">
            <!-- 周边查询 -->
            <template v-if="radVal === '0'">
              <div class="item" key="radius-query">
                <div class="item-label">查询范围</div>
                <div class="item-content content-cur-dom-content-slider">
                  <Slider
                    v-bind="customizedProps.slider"
                    :value="sliderVal"
                    @change="handleSliderChange"
                    @after-change="handleSliderAfterChange"
                  />
                </div>
              </div>
              <div class="item">
                <div class="item-label">自定义半径</div>
                <div class="item-content">
                  <InputNumber
                    v-bind="customizedProps.inputNumber"
                    style="width: 240px"
                    :value="inputValue"
                    @blur="handleInputBlur"
                    @change="
                      (e: any) => {
                        inputValue = e;
                      }
                    "
                    :formatter="limitDecimals"
                    :parser="limitDecimals"
                  />
                  <span class="item-span">{{ customizedProps.inputNumber.unit }}</span>
                </div>
              </div>
            </template>

            <!-- 可达域查询 -->
            <template v-else>
              <div class="item flex" key="reachable-query-type">
                <div class="item-label">出行方式</div>
                <div class="item-content">
                  <Select
                    :options="TRAVEL_MODE_OPTIONS"
                    style="width: 160px; margin-left: 15px"
                    :value="kdqParams.type"
                    @change="handleTravelModeChange"
                  />
                </div>
              </div>
              <div class="item flex" key="reachable-query-time">
                <div class="item-label">出行时间</div>
                <div class="item-content">
                  <InputNumber
                    :min="5"
                    v-bind="reachableDomainProps"
                    style="width: 160px; margin-left: 15px"
                    :value="kdqParams.minute"
                    @blur="handleBlur"
                    @change="
                      (e: any) => {
                        if (e !== null) kdqParams.minute = e;
                      }
                    "
                  />
                  <span class="item-span">分钟</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <component v-if="footer" :is="customFooter" />
        <div class="footer" v-else-if="radVal === '1'">
          <Button style="width: 130px" @click="onCancel"> 取消 </Button>
          <Button
            style="width: 130px"
            :loading="btnLoading"
            type="primary"
            @click="onGenerateReachable"
          >
            生成可达圈
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import { Radio, InputNumber, Slider, Button, Select, Tooltip } from 'ant-design-vue';
  import type { InputNumberProps } from 'ant-design-vue';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { isFunction } from '@/utils/is';
  import centerPointIcon from '@/assets/icons/centerPoint.png';
  import './index.less';

  // 类型定义
  type Option = { label: string; value: string };
  type TravelMode = '0' | '1' | '2'; // 步行 | 车行 | 骑行
  type QueryType = '0' | '1'; // 周边查询 | 可达域查询

  interface InputNumberConfig extends Partial<InputNumberProps> {
    max: number;
    placeholder: string;
    unit?: string;
  }

  interface MapType {
    setStatus: (status: { dragEnable: boolean }) => void;
  }

  interface KdqParams {
    type: TravelMode;
    minute: number;
  }

  const props = withDefaults(
    defineProps<{
      open: boolean;
      map: MapType;
      params: {
        name?: string;
        nameClick?: () => void;
        desc?: string;
      };
      modalId: string;
      footer?: Function;
      isRadio?: boolean;
      isOk?: boolean;
      inputNumberConfig?: Record<TravelMode, InputNumberConfig>;
      customizeProps?: {
        slider: Partial<any>;
        inputNumber: InputNumberConfig;
      };
    }>(),
    {
      isRadio: true,
    },
  );

  const emit = defineEmits<{
    (e: 'setCircleRadius', radius: number): void;
    (
      e: 'handleQuery',
      radVal: QueryType,
      kdqParams: KdqParams,
      callback: (loadingStatus: boolean, options?: Record<string, any>) => void,
    ): void;
    (e: 'handleIsShow', value: string): void;
    (e: 'setSelectPoints', points: { open: boolean }): void;
    (e: 'onCancel'): void;
  }>();

  // 常量配置
  const QUERY_OPTIONS: Option[] = [
    { label: '周边查询', value: '0' },
    { label: '可达域查询', value: '1' },
  ];

  const DEFAULT_INPUT_NUMBER_CONFIG: Record<TravelMode, InputNumberConfig> = {
    '0': { max: 30, placeholder: '自定义输入5-30' },
    '1': { max: 60, placeholder: '自定义输入5-60' },
    '2': { max: 30, placeholder: '自定义输入5-30' },
  };

  const TRAVEL_MODE_OPTIONS: Option[] = [
    { label: '步行', value: '0' },
    { label: '车行', value: '1' },
    { label: '骑行', value: '2' },
  ];

  // 状态管理
  const radVal = ref<QueryType>('0');
  const inputValue = ref<number | null>(null);
  const sliderVal = ref<number>(0.5);
  const btnLoading = ref(false);
  const kdqParams = ref<KdqParams>({ type: '0', minute: 5 });
  const targetReady = ref(false);

  let checkInterval: any = null;
  onMounted(() => {
    checkInterval = setInterval(() => {
      if (document.getElementById(props.modalId)) {
        targetReady.value = true;
        clearInterval(checkInterval);
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });

  // 方法
  const handleBlur = () => {
    if (kdqParams.value?.minute) {
      kdqParams.value.minute = Math.round(kdqParams.value.minute);
    }
  };

  const onMyCancel = () => {
    emit('setSelectPoints', { open: false });
  };

  const onMyOK = () => {
    emit('setSelectPoints', { open: !props.open });
  };

  const callback = (loadingStatus: boolean, options?: Record<string, any>) => {
    btnLoading.value = loadingStatus;
    if (options?.loadStatus && !props.isOk) {
      emit('handleIsShow', '1');
    }
  };

  const limitDecimals = (value: any): string => {
    const reg = /^(\-)*(\d+)\.(\d).*$/;
    return String(value).replace(reg, '$1$2.$3');
  };

  // 计算属性
  const reachableDomainProps = computed(() => {
    return props.inputNumberConfig
      ? props.inputNumberConfig[kdqParams.value.type]
      : DEFAULT_INPUT_NUMBER_CONFIG[kdqParams.value.type];
  });

  const customizedProps = computed<any>(() => {
    return (
      props.customizeProps || {
        slider: {
          step: 0.1,
          min: 0.1,
          max: 5,
          marks: {
            0.1: '100M',
            1: '1KM',
            2: '2KM',
            3: '3KM',
            4: '4KM',
            5: '5KM',
          },
        },
        inputNumber: {
          step: 0.1,
          min: 0.1,
          max: 40,
          placeholder: '输入半径，最大为40',
          unit: 'KM',
        },
      }
    );
  });

  const customFooter = computed(() => {
    if (props.footer) {
      return props.footer({
        handelFooterClick: () => emit('handleQuery', radVal.value, kdqParams.value, callback),
        val: radVal.value,
        btnLoading: btnLoading.value,
        onCancel: () => emit('onCancel'),
      });
    }
    return null;
  });

  const onGenerateReachable = () => {
    emit('handleQuery', radVal.value, kdqParams.value, callback);
  };

  const onCancel = () => {
    emit('onCancel');
  };

  const handleRadioChange = (e: any) => {
    const value = e.target.value as QueryType;
    emit('handleIsShow', value);
    radVal.value = value;
  };

  const handleSliderChange = (e: number) => {
    props.map.setStatus({ dragEnable: false });
    sliderVal.value = e;
    inputValue.value = null;
  };

  const handleSliderAfterChange = (e: number) => {
    emit('setCircleRadius', e);
    props.map.setStatus({ dragEnable: true });
  };

  const handleInputBlur = () => {
    const val = inputValue.value || 0.1;
    inputValue.value = val;
    emit('setCircleRadius', val);
  };

  const handleTravelModeChange = (e: TravelMode) => {
    kdqParams.value = {
      type: e,
      minute: ['0', '2'].includes(e) ? 5 : 10,
    };
  };

  // 监听props.params变化重置状态
  watch(
    () => props.params,
    () => {
      radVal.value = '0';
      inputValue.value = null;
      sliderVal.value = 0.5;
      kdqParams.value = { type: '0', minute: 5 };
    },
    { deep: true },
  );
</script>
