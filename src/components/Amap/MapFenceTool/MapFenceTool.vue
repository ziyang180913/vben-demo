<template>
  <div :class="`do-map-constor ${className}`" :style="style">
    <div
      v-if="btnType === 'icon'"
      class="constor-item-box aux-color-bg-b1 business-control-card-shadow do-map-constor-icon"
    >
      <Tooltip v-for="item in operate" :key="item.text" placement="bottom" :title="item.text">
        <div
          :class="`constor-item ${current === item.key ? 'active' : ''}`"
          @click.stop="constorClick(item)"
        >
          <img :src="item.img" alt="" />
        </div>
      </Tooltip>
    </div>
    <div v-else class="constor-item-box">
      <Button
        v-for="(item, index) in operate"
        :key="index"
        class="constor-item-btn"
        type="primary"
        @click.stop="constorClick(item)"
      >
        <template #icon v-if="item.key === 'circle'">
          <EnvironmentOutlined />
        </template>
        <span>{{ item.text }}</span>
      </Button>
    </div>

    <EnterFence
      :open="open"
      @update:open="(val) => (open = val)"
      @submit="onSubmit"
      :content="content"
    />

    <SelectAddress
      :map="map"
      :open="selectAddressOpen"
      @update:open="(val) => (selectAddressOpen = val)"
      @submit="selectAddressOnSubmit"
    />

    <SelectingPoints
      :modalId="markerModalId"
      :map="map"
      v-bind="{ ...selectPoints, ...selectingPointsProps }"
      @handle-query="handleQuery"
      @set-circle-radius="setCircleRadius"
      @set-select-points="(points) => setSelectPoints(points)"
      @on-cancel="onCancel"
      @handle-is-show="handleIsShow"
      :isOk="isOk"
    />
  </div>
</template>

<script setup lang="ts">
  import { message, Button, Tooltip } from 'ant-design-vue';
  import { convertBD09ToGCJ02, convertWGS84ToGCJ02 } from '@/utils/gcoord';
  import { ref, computed, watch, onMounted, onUnmounted, shallowRef, markRaw } from 'vue';
  import { getReachable } from '@/api/global';
  import content from './tips-content';
  import { EnvironmentOutlined } from '@ant-design/icons-vue';
  import close from '@/assets/mapImg/close-outlined.png';
  import check from '@/assets/mapImg/check-outlined.png';
  import EnterFence from './components/enter-fence/index.vue';
  import SelectAddress from './components/select-address/index.vue';
  import SelectingPoints from './components/selecting-points/index.vue';
  import { buildUUID } from '@/utils/uuid';
  import circleIcon from '@/assets/mapImg/circle.png';
  import polyIcon from '@/assets/mapImg/poly.png';
  import positionIcon from '@/assets/mapImg/position.png';
  import enterIcon from '@/assets/mapImg/enter.png';
  import handIcon from '@/assets/mapImg/hand.png';
  import markerIcon from '@/assets/mapImg/marker.png';
  import eraserIcon from '@/assets/mapImg/eraser.png';
  import ruleIcon from '@/assets/mapImg/distance@2x.png';

  declare const AMap: any;

  interface DrawStyle {
    fillColor: string;
    strokeColor: string;
    strokeOpacity: number;
    fillOpacity: number;
    strokeStyle: string;
  }

  const drawStyle: DrawStyle = {
    fillColor: '#5392F7',
    strokeColor: '#5392F7',
    strokeOpacity: 1,
    fillOpacity: 0.12,
    strokeStyle: 'solid',
  };

  interface ConstrDataItem {
    img: string;
    key: string;
    text: string;
  }

  const constorData: ConstrDataItem[] = [
    { img: circleIcon, key: 'circle', text: '选点' },
    { img: polyIcon, key: 'polygon', text: '绘制围栏' },
    { img: positionIcon, key: 'position', text: '市区街' },
    {
      img: ruleIcon,
      key: 'rule',
      text: '测距',
    },
    { img: enterIcon, key: 'enter', text: '录入围栏' },
    { img: handIcon, key: 'hand', text: '手势' },
    { img: eraserIcon, key: 'eraser', text: '擦除' },
  ];

  interface SelectPointsState {
    open: boolean;
    params: {
      name?: string;
      desc?: string;
      nameClick?: () => void;
    };
  }

  interface CircleParams {
    lng: number;
    lat: number;
    value: number;
    path: any[];
    area: string;
    name?: string;
    desc?: string;
    nameClick?: () => void;
  }

  const isFence = (list: any[] = [], area: any): boolean => list?.length > 2 && Number(area) > 0;

  const okQueryDom = (key: string, data: any, text = '开始分析'): string => `
  <div class="amap-info-outer-operate">
    <div class="amap-info-outer-operate-clear" data-params=${JSON.stringify({
      type: 'clear',
      [key]: data,
    })}><img src=${close} />取消</div>
    <div class="amap-info-outer-operate-ok" data-params=${JSON.stringify({
      type: 'ok',
      [key]: data,
    })}><img src=${check} />${text}</div>
  </div>`;

  const props = withDefaults(
    defineProps<{
      isOk?: boolean;
      mapOperate?: string[];
      selectingPointsProps?: Record<string, any>;
      btnType?: 'icon' | 'button';
      className?: string;
      map?: any;
      callback?: Function;
      clearCover?: Function;
      notFit?: boolean;
      style?: Record<string, any>;
    }>(),
    {
      isOk: false,
      mapOperate: () => [],
      selectingPointsProps: () => ({}),
      btnType: 'icon',
      className: '',
      map: null,
      callback: null as any,
      clearCover: null as any,
      notFit: false,
      style: () => ({}),
    },
  );

  const current = ref<string>('hand');
  const drawInstance = shallowRef<any>(null);
  const overlayLayer = shallowRef<any>(null);
  const leftMarker = shallowRef<any>(null);
  const circleCenterMarker = shallowRef<any>(null);
  const ruler = shallowRef<any>(null);
  const infoWindow = shallowRef<any>(null);
  const open = ref<boolean>(false);
  const markerOpen = ref<boolean>(false);
  const selectPoints = ref<SelectPointsState>({ open: false, params: {} });
  const markerModalId = ref<string>(`marker-modal${buildUUID()}`);
  const selectAddressOpen = ref<boolean>(false);
  const prevLoadOverlay = ref<string | null>(null);

  const operate = computed(() =>
    props.mapOperate?.length
      ? constorData.filter((item) => props.mapOperate?.includes(item.key))
      : constorData,
  );

  const getCircleParams = (circle: any): CircleParams => {
    return {
      lng: circle.getCenter().lng,
      lat: circle.getCenter().lat,
      value: circle.getRadius(),
      path: circle.getPath(),
      area: (window as any).AMap.GeometryUtil.ringArea(circle.getPath()) / 1000000,
      ...selectPoints.value?.params,
    } as any;
  };

  // 设置圆半径
  const setCircleRadius = (val: number) => {
    if (!overlayLayer.value) return;

    const overlays = overlayLayer.value.getOverlays();
    // 查找出圆
    const circle = overlays.find((item: any) => item.className === 'Overlay.Circle');

    if (!circle) return;

    // 设置新半径（假设val单位是km，转换为米）
    circle.setRadius(val * 1000);
    const params: any = getCircleParams(circle);

    // 更新信息窗口
    if (infoWindow.value) {
      infoWindow.value.setContent(
        `<div class="info-nowrap">圆面积: ${typeof params?.area === 'number' ? params.area.toFixed(3) : params?.area}平方公里</div>`,
      );

      // 打开信息窗口
      if (params.path.length > 0) {
        infoWindow.value.open(props.map, params.path[params.path.length - 1]);
      }
    }

    // 调用回调函数
    if (props.callback && !props.isOk) {
      props.callback(params, 'circle');
    }
  };

  const clearAllOverlay = () => {
    overlayLayer.value?.clearOverlays();
    selectAddressOpen.value = false;
    props.clearCover?.();
    props.map.clearInfoWindow();
    selectPoints.value = { open: false, params: {} };
    ruler.value?.turnOff();
  };

  const addOverlay = (data: any, type: string, option: Record<string, any> = {}) => {
    let params: any[] = [];

    if (type === 'circle') {
      const { lng, lat, value } = data;
      const position = [lng, lat];
      const circle = new AMap.Circle({ center: position, radius: value, ...drawStyle });
      circleCenterMarker.value.setPosition(position);
      params = [circle, circleCenterMarker.value];
      new AMap.Geocoder({}).getAddress(position, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          const { province, city, district, township } = result.regeocode.addressComponent;
          const address = result.regeocode.formattedAddress.split(township);
          selectPoints.value = {
            open: option?.open ? false : true,
            params: {
              name: option.title || address.at(-1),
              desc: province + city + district + township,
              nameClick: option.titleClick,
            },
          };
        }
      });
    } else if (type === 'polygon') {
      params = [
        new AMap.Polygon({
          path: data.path.map((v: [number, number]) => new AMap.LngLat(v[0], v[1])),
          ...drawStyle,
        }),
      ];
    }

    overlayLayer.value.addOverlays(params);
  };

  const drawCallback = (data: any, type: string, option: Record<string, any> = {}) => {
    if (!props.isOk) {
      clearAllOverlay();
    }
    // 生成面积
    const key = type === 'circle' ? '圆' : '围栏';
    createArea(data?.path, key, data?.area, data);
    if (isFence(data?.path, data?.area)) {
      addOverlay(data, type, option);
      if (props.callback && !props.isOk) {
        props.callback(data, type);
      }
    }
  };

  const queryCreateCircle = (event: { lnglat: any; isMove?: boolean }) => {
    constorClick({ key: 'eraser' } as ConstrDataItem);
    props.map.setDefaultCursor('pointer');
    drawInstance.value?.close(true);

    const circle = new AMap.Circle({ center: event?.lnglat, radius: 500, ...drawStyle });
    if (!circle) return;

    const params = getCircleParams(circle);
    params.area = (params.area as any).toFixed(3);
    createArea(params.path, '圆', params.area, params);
    drawCallback(params, 'circle');

    if (!props.notFit || event?.isMove) {
      const pixel = props.map.lngLatToPixel(event?.lnglat, 16);
      pixel.y += 150;
      props.map.setZoomAndCenter(16, props.map.pixelToLngLat(pixel, 16), true);
    }
  };

  const mouseToolDraw = (item: { key: string }) => {
    drawInstance.value[item.key](drawStyle);
    drawInstance.value.on('draw', (e: any) => {
      if (e.obj.CLASS_NAME === 'Overlay.Polygon') {
        try {
          const path = e.obj.getPath().map((_item: any) => [_item.lng, _item.lat]);
          const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);
          drawCallback({ path, area }, 'polygon');
          createArea(path, '围栏', area, { path, area });
        } catch (err) {
          console.error(err);
        }
      } else if (e.obj.CLASS_NAME === 'AMap.Marker') {
        queryCreateCircle({ lnglat: e.obj.getPosition() });
      }

      drawInstance.value.close(true);
      drawInstance.value.clearEvents();
      props.map.setDefaultCursor('pointer');
      current.value = 'hand';
      props.map.set('doubleClickZoom', true);
    });
  };

  const constorClick = async (item: ConstrDataItem) => {
    if (!['hand', 'rule'].includes(item.key) && props.isOk) {
      clearAllOverlay();
    }

    current.value = item.key === 'eraser' ? 'hand' : item.key;
    props.map.set('doubleClickZoom', item.key !== 'polygon');

    switch (item.key) {
      case 'circle':
        props.map.setDefaultCursor('pointer');
        mouseToolDraw({ key: 'marker' });
        break;
      case 'polygon':
        props.map.setDefaultCursor('crosshair');
        mouseToolDraw(item);
        break;
      case 'rule':
        props.map.setDefaultCursor('crosshair');
        ruler.value.turnOn();
        break;
      case 'enter':
        open.value = true;
        break;
      case 'marker':
        markerOpen.value = true;
        break;
      case 'position':
        props.map.setDefaultCursor('pointer');
        drawInstance.value.close(true);
        selectAddressOpen.value = true;
        break;
      case 'hand':
        props.map.setDefaultCursor('pointer');
        drawInstance.value.close(true);
        break;
      case 'eraser':
        ruler.value?.turnOff(true);
        props.map.setDefaultCursor('pointer');
        if (props.callback && !props.isOk) {
          props.callback(null, 'clear');
          // clearAllOverlay();
        }
        // props.clearCover?.();
        clearAllOverlay();
        break;
    }
  };

  const createArea = (fence: any[], name: string, area: string, data: Record<string, any> = {}) => {
    const key = name === '圆' ? 'circle' : 'polygon';
    if (Number(area) > 20000) {
      infoWindow.value.setContent(
        '<div class="info-nowrap" style="color:red;">最大面积: 20000平方公里！</div>',
      );
    } else if (isFence(fence, area)) {
      if (props.isOk && key === 'polygon') {
        infoWindow.value.setContent(okQueryDom(key, data, props.selectingPointsProps?.okText));
      } else {
        infoWindow.value.setContent(`<div class="info-nowrap">${name}面积: ${area}平方公里</div>`);
      }
    }
    // 文本展示在最后一个path上
    infoWindow.value.open(props.map, fence.at(-1));
  };

  const onSubmit = async (values: any, reset: () => void) => {
    let fence = JSON.parse(values.fence.replace(/\s*/g, ''));

    if (values.coordinate === 'WGS84') {
      fence = fence.map((item: [number, number]) => convertWGS84ToGCJ02(item[0], item[1]));
    } else if (values.coordinate === 'BD09') {
      fence = fence.map((item: [number, number]) => convertBD09ToGCJ02(item[0], item[1]));
    }

    const path = fence;
    const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);
    createArea(path, '围栏', area, { path, area });
    drawCallback({ path, area }, 'polygon');

    reset();
    open.value = false;
    setTimeout(() => props.map.setFitView(null, true, [200, 100, 100, 100]), 100);
  };

  const modalOnSubmit = async (values: any, res: any, reset: () => void) => {
    const lnglat = res?.data.at(-1);
    if (props.notFit) {
      props.map.setCenter(lnglat, true);
      props.map.setZoom(14.5);
    }

    const path = res?.data;
    const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);
    const params = { path, area, values, ...selectPoints.value.params };

    overlayLayer.value
      .getOverlays()
      .find((item: any) => item.className === 'Overlay.Circle')
      ?.hide();
    // 生成面积
    createArea(path, '围栏', area, params);
    if (isFence(path, area)) {
      addOverlay(params, 'polygon', {});
      // 如果需要点击确认围栏不直接调用该方法 判断 调用父组件回调方法
      if (props.callback && !props.isOk) {
        props.callback(params, 'polygon');
      }
    }

    reset();
    markerOpen.value = false;
  };

  const selectAddressOnSubmit = (values: any) => {
    const path = values;
    const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);
    drawCallback({ path, area }, 'polygon');
    createArea(path, '围栏', area, { path, area });

    selectAddressOpen.value = false;
    setTimeout(() => {
      props.map.setFitView(overlayLayer.value.getOverlays(), true, [200, 100, 100, 100]);
    }, 100);
  };

  const handleQuery = async (
    value: string,
    kdqParams: any,
    callback: (status: boolean, data?: any) => void,
  ) => {
    const overlays = overlayLayer.value.getOverlays();
    const circle = overlays.find((item: any) => item.className === 'Overlay.Circle');
    if (!circle) return;

    const params = getCircleParams(circle);

    if (value === '1' && !kdqParams.minute) {
      return message.error('请输入出行时间！');
    }

    if (value === '0') {
      overlayLayer.value.clearOverlays();
      infoWindow.value.remove();
      props.callback?.(params, 'circle');
    } else {
      callback(true);
      if (kdqParams?.minute && kdqParams?.type) {
        const values = {
          ...kdqParams,
          lat: params.lng,
          lon: params.lat,
          centerPoint: [params.lng, params.lat],
        };
        const res = await getReachable(values);
        callback(false, { loadStatus: res.code === 200 });

        if (res?.code !== 200) return message.error('获取可达圈失败！');

        selectPoints.value.open = false;
        overlayLayer.value.removeOverlay(
          overlays.find((item: any) => item.className === 'Overlay.Polygon'),
        );
        modalOnSubmit(values, res, () => {});
      }
    }
  };

  const handleIsShow = (value: string) => {
    if (!overlayLayer.value) return;

    const overlays = overlayLayer.value.getOverlays();
    prevLoadOverlay.value = value;
    const circle = overlays.find((item: any) => item.className === 'Overlay.Circle');
    const polygon = overlays.find((item: any) => item.className === 'Overlay.Polygon');

    if (value === '1' && polygon) {
      polygon.show();
      circle?.hide();
      const path = polygon.getPath().map((_item: any) => [_item.lng, _item.lat]);
      const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);
      const params = { path, area, ...selectPoints.value.params };
      createArea(path, '围栏', area, params);
      // 把当前覆盖物围栏等参数返回给父组件
      if (props.callback && !props.isOk) {
        props.callback(params, 'polygon');
      }
    } else {
      circle?.show();
      polygon?.hide();
      if (!circle) return;
      const params = getCircleParams(circle);
      params.area = (params.area as any).toFixed(3);
      createArea(params.path, '圆', params.area, params);
      if (props.callback && !props.isOk) {
        props.callback(params, 'circle');
      }
    }
  };

  const showAndHide = (status = false) => {
    infoWindow.value?.[status ? 'show' : 'hide']();
    overlayLayer.value?.[status ? 'show' : 'hide']();

    if (status && prevLoadOverlay.value) {
      const overlays = overlayLayer.value.getOverlays();
      const circle = overlays.find((item: any) => item.className === 'Overlay.Circle');
      const polygon = overlays.find((item: any) => item.className === 'Overlay.Polygon');

      if (prevLoadOverlay.value === '1' && polygon) {
        polygon.show();
        circle?.hide();
      } else {
        circle?.show();
        polygon?.hide();
      }
    }
  };

  const onOpenRules = () => {
    ruler.value?.turnOff();
    props.map.setDefaultCursor('pointer');
    current.value = 'hand';
  };

  // 清除所有覆盖物
  const clearAll = () => {
    clearAllOverlay();
  };

  const onCancel = () => constorClick({ key: 'eraser' } as ConstrDataItem);

  const initMapFeatures = () => {
    if (!props.map) return;
    if (!drawInstance.value) {
      drawInstance.value = markRaw(new AMap.MouseTool(props.map));
    }
    if (!overlayLayer.value) {
      overlayLayer.value = markRaw(new AMap.OverlayGroup());
      props.map.add(overlayLayer.value);
    }

    if (!infoWindow.value) {
      infoWindow.value = markRaw(
        new AMap.InfoWindow({
          autoMove: false,
          avoid: [0, 0, 0, 0],
          anchor: 'center',
        }),
      );
    }

    if (!ruler.value) {
      const ruleStyle = {
        startMarkerOptions: {
          icon: new AMap.Icon({
            size: new AMap.Size(19, 31),
            imageSize: new AMap.Size(19, 31),
            image: '//webapi.amap.com/theme/v1.3/markers/b/start.png',
          }),
          offset: new AMap.Pixel(-9, -31),
        },
        endMarkerOptions: {
          //可缺省
          icon: new (window as any).AMap.Icon({
            size: new (window as any).AMap.Size(19, 31), //图标大小
            imageSize: new (window as any).AMap.Size(19, 31),
            image: '//webapi.amap.com/theme/v1.3/markers/b/end.png',
          }),
          offset: new (window as any).AMap.Pixel(-9, -31),
        },
        midMarkerOptions: {
          //可缺省
          icon: new (window as any).AMap.Icon({
            size: new (window as any).AMap.Size(19, 31), //图标大小
            imageSize: new (window as any).AMap.Size(19, 31),
            image: '//webapi.amap.com/theme/v1.3/markers/b/mid.png',
          }),
          offset: new (window as any).AMap.Pixel(-9, -31),
        },
        lineOptions: {
          //可缺省
          strokeStyle: 'solid',
          strokeColor: '#FF33FF',
          strokeOpacity: 1,
          strokeWeight: 2,
        },
        // ... other ruler styles
      };

      ruler.value = markRaw(new AMap.RangingTool(props.map, ruleStyle));
      ruler.value.on('end', onOpenRules);
    }

    if (!circleCenterMarker.value) {
      circleCenterMarker.value = markRaw(
        new AMap.Marker({
          zIndex: 999,
          offset: new AMap.Pixel(0, 10),
          content: `<div id=${markerModalId.value} style="position: relative;">

      </div>`,
          anchor: 'bottom-center',
        }),
      );
    }

    infoWindow.value?.on('click', (e: any) => {
      const params = e.originEvent.target?.dataset?.params;
      if (!params) return;

      overlayLayer.value.clearOverlays();
      const data = JSON.parse(params);

      if (data.type === 'ok') {
        const key = Object.keys(data).at(-1)!;
        props.callback?.(Object.values(data).at(-1), key);
      } else {
        props.map.clearInfoWindow();
        message.success('已取消！');
      }

      infoWindow.value.remove();
    });
  };

  const setupMapMouseEvents = () => {
    props.map.clearEvents('mousemove');
    if (current.value === 'circle') {
      leftMarker.value?.show();
      props.map.on('mousemove', (e: any) => {
        if (!leftMarker.value) {
          leftMarker.value = markRaw(
            new AMap.Marker({
              position: e.lnglat,
              icon: markerIcon,
              cursor: 'none',
              offset: new AMap.Pixel(-12, 0),
              bubble: true,
              label: { direction: 'right', content: '<div>点击左键开始绘制</div>' },
            }),
          );
          leftMarker.value.add(props.map);
        } else {
          leftMarker.value.setPosition(e.lnglat);
        }
      });
    } else {
      leftMarker.value?.hide();
      props.map.on('mousemove', (e: any) => {
        const currentEle = e.target.getAllOverlays(current.value)?.at(0);
        const extData = currentEle?.getExtData() || {};

        if (!Object.keys(extData).length && currentEle?.getPath) {
          const path = currentEle.getPath();
          const area = (AMap.GeometryUtil.ringArea(path) / 1000000).toFixed(3);

          if (Number(area) > 20000) {
            infoWindow.value.setContent(
              '<div class="info-nowrap" style="color:red;">最大面积: 20000平方公里！</div>',
            );
          } else if (isFence(path, area) && current.value === 'polygon') {
            infoWindow.value.setContent(
              `<div class="info-nowrap">当前多边形围栏面积: ${area}平方公里</div>`,
            );
            infoWindow.value.open(props.map, path.at(-1));
          }
        }
      });
    }
  };

  const setSelectPoints = (points: Partial<SelectPointsState>) => {
    selectPoints.value = { ...selectPoints.value, ...points };
  };

  watch(current, setupMapMouseEvents);

  onMounted(() => {
    initMapFeatures();
    setupMapMouseEvents();
  });

  onUnmounted(() => {
    // clearAllOverlay()
    drawInstance.value?.close(true);
    props.map?.clearEvents('mousemove');
    props.map?.off('mousemove', () => {});
  });

  defineExpose({
    drawCallback,
    createArea,
    queryCreateCircle,
    onCancel,
    showAndHide,
    addOverlay,
    clearAll,
    setSelectPoints,
    onSubmit,
    selectAddressOnSubmit,
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
