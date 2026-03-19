<template>
  <div
    :id="containerID"
    class="do-watch-map-control-address-box address-box"
    :style="{
      height: open ? '325px' : '0',
      opacity: open ? 1 : 0,
    }"
  >
    <Spin :spinning="loading">
      <div class="select-address">
        <Tabs :activeKey="curTabsVal" @change="handleTabChange" destroyInactiveTabPane>
          <Tabs.TabPane key="1" tab="市区街">
            <Card
              key="市区街"
              :valueList="valueList"
              :curTabsVal="curTabsVal"
              :curValue="curValue as any"
              @update-value-list="(val) => (valueList = val)"
              @update-cur-value="(val) => (curValue = val)"
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <div class="select-address-card-btn">
        <Button @click="handleCancel">取消</Button>
        <Button type="primary" @click="queryFence" :disabled="!(valueList.length > 1 || isSpecial)">
          确定
        </Button>
      </div>
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted, onMounted } from 'vue';
  import { Tabs, Button, Spin } from 'ant-design-vue';
  // import { getFencesfind } from '@/api/global';
  import Card from './components/card/index.vue';
  import { buildUUID } from '@/utils/uuid';
  import { convertBD09ToGCJ02 } from '@/utils/gcoord';
  import './index.less';

  // 定义选项类型
  interface Option {
    label: string;
    value: string;
  }

  // 定义地图类型
  interface MapType {
    on: (event: string, callback: () => void) => void;
    off: (event: string, callback: () => void) => void;
  }

  const props = defineProps<{
    open: boolean;
    map?: MapType;
  }>();

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', fence: any[]): void;
  }>();

  const containerID = `address-box-${buildUUID()}`;
  // 已选择的数据
  const valueList = ref<Option[]>([]);
  // 当前选择的数据
  const curValue = ref<Option | null>(null);
  // 当前标签
  const curTabsVal = ref<string>('1');
  const loading = ref<boolean>(false);

  // 直接展示查询按钮
  const isSpecial = computed(() => {
    // 直辖市/行政区/自治区 需特殊处理
    const specialData = [
      '上海市',
      '北京市',
      '重庆市',
      '天津市',
      '香港特别行政区',
      '内蒙古自治区',
      '广西壮族自治区',
      '西藏自治区',
      '新疆维吾尔自治区',
      '宁夏回族自治区',
    ];
    return valueList.value.some((item) => specialData.includes(item.label));
  });

  const handleTabChange = (e: string) => {
    valueList.value = [];
    curValue.value = null;
    curTabsVal.value = e;
  };

  const handleCancel = () => {
    emit('update:open', false);
  };

  // 点击查询
  const queryFence = async (): Promise<void> => {
    loading.value = true;
    const params = curValue.value
      ? Array.from(new Set([...valueList.value, curValue.value].map((item) => item.value)))
      : [...valueList.value].map((item) => item.value);
    let res: any = {};

    try {
      // if (curTabsVal.value === '1') {
      //   res = await getFencesfind({ admin_div_id: params.at(-1) });
      // }
      // if (res?.code === 200) {
      //   let fence: any[] = [];
      //   // 数据源
      //   const resFences = res?.data?.fences_list?.[0] || {};
      //   // 如果返回围栏有多个取围栏最大的一个
      //   if (resFences?.type === 'MultiPolygon') {
      //     const fenceArea = resFences?.coordinates.map((item: any) => {
      //       return {
      //         area: (window as any).AMap.GeometryUtil.ringArea(item?.[0] || []),
      //         fence: item?.[0] || [],
      //       };
      //     });
      //     const maxAreaFence = fenceArea.reduce(
      //       (prev: any, current: any) => {
      //         return prev.area > current.area ? prev : current;
      //       },
      //       { area: 0, fence: [] },
      //     );
      //     // 经纬度转换,后台接口返回的是百度经纬度
      //     fence = (maxAreaFence.fence || []).map((item: any) =>
      //       convertBD09ToGCJ02(item[0], item[1]),
      //     );
      //   } else if (resFences?.type === 'Polygon') {
      //     // 经纬度转换,后台接口返回的是百度经纬度
      //     fence = (resFences?.coordinates?.[0] || []).map((item: any) =>
      //       convertBD09ToGCJ02(item[0], item[1]),
      //     );
      //   }
      //   emit('submit', fence);
      // }
    } finally {
      loading.value = false;
    }
  };

  let isDrag = false;

  // 如果是鼠标点击拖拽了地图就不关闭弹窗
  const handleDocumentMouseDown = (e: MouseEvent): void => {
    if (isDrag) {
      isDrag = false;
      return;
    }
    const dom = document.getElementById(`${containerID}`);
    if (dom && !dom.contains(e.target as Node)) {
      emit('update:open', false);
    }
  };

  // 拖拽地图时不关闭弹窗
  const handleMapDrag = (): void => {
    isDrag = true;
  };

  onMounted(() => {
    if (props.map) {
      props.map.on('dragstart', handleMapDrag);
    }
    document.addEventListener('click', handleDocumentMouseDown);
  });

  onUnmounted(() => {
    if (props.map) {
      props.map.off('dragstart', handleMapDrag);
    }
    document.removeEventListener('click', handleDocumentMouseDown);
  });
</script>
