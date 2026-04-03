<template>
  <div class="shopping-preferences-styles" :style="{ height: '740px' }">
    <ASpin :spinning="loading">
      <div :id="mapId" class="map-container"></div>
      <div class="side-panel">
        <div class="work-panel shopping-preferences-work">
          <div class="work-title">
            <slot name="title">
              <div style="display: flex">{{ title }}</div>
            </slot>
          </div>
          <ATable
            :columns="tableColumns"
            :data-source="list"
            :pagination="false"
            size="small"
            :scroll="{ y: 400 }"
            :custom-row="customRow"
            :row-class-name="rowClassName"
          >
            <template #bodyCell="{ column, record, text, index }">
              <template v-if="column.key === 'index'">
                {{ index + 1 }}
              </template>
              <template v-else-if="column.key === 'name'">
                <ATooltip v-if="text && text.length > 10" :title="text">
                  <span class="name-ellipsis">{{ text }}</span>
                </ATooltip>
                <span v-else>{{ text || '-' }}</span>
              </template>
              <template v-else-if="column.key === 'value'">
                {{
                  record.value ? record.value : `${(record.penetration * 100).toFixed(2) || '0'}%`
                }}
              </template>
              <template v-else-if="column.key === 'operate'">
                <a @click.stop="handleMoreClick(record)">更多</a>
              </template>
            </template>
          </ATable>
        </div>
        <div v-if="showMoreInfo" class="more-info-card poi-card-info-box">
          <div class="more-info-card__header">
            <span class="more-info-card__title">{{ baseInfo.name }}</span>
            <CloseOutlined class="close-btn" @click="baseInfo = {}" />
          </div>
          <div class="more-info-card__body">
            <div v-for="item in infoLabels" :key="item.value" class="info-item">
              <span class="info-label">{{ item.label }}:</span>
              <span class="info-value">{{ baseInfo[item.value] || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </ASpin>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
  import { Spin as ASpin, Table as ATable, Tooltip as ATooltip, message } from 'ant-design-vue';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { getPoiInfo } from '@/api/new-mall/insight';
  import type { TableColumnsType } from 'ant-design-vue';

  // 地图 DOM id
  const mapId = 'do-map-shopping-preferences-map';

  // 详情 label
  const infoLabels = [
    { label: '经营评分', value: 'score_rank' },
    { label: '开业时间', value: 'open_date' },
    { label: '经纬度', value: 'p_loc' },
    { label: '商业面积', value: 'area' },
    { label: '商业楼层', value: 'floor' },
    { label: '营业状态', value: 'business_status' },
    { label: '营业时间', value: 'open_hour' },
    { label: '招商状态', value: 'investment_status' },
  ];

  interface Props {
    info?: {
      location?: [number, number] | number[];
    };
    data?: any[];
    title?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    info: () => ({}),
    data: () => [],
    title: '',
  });

  // 地图相关实例（非响应式）
  let mapInstance: any = null;
  let markerInfo: any = null;
  let markersList: any = null;
  let overlayFenceGroup: any = null;

  // 响应式状态
  const list = ref<any[]>([]);
  const baseInfo = ref<Record<string, any>>({});
  const loading = ref(false);
  const activeName = ref('');
  const theme = ref('normal');

  // 表格列配置
  const tableColumns: TableColumnsType = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 31 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 156 },
    { title: '人数比例', dataIndex: 'value', key: 'value', width: 60 },
    { title: '操作', dataIndex: 'operate', key: 'operate', width: 50 },
  ];

  const showMoreInfo = computed(() => Object.keys(baseInfo.value).length > 0);

  /**
   * 生成 Marker 的 HTML 内容
   */
  const curMarkerDom = (data: any) => `
    <div class="left-nav-poi-shadow aux-color-bg-b10 font-12-left-400-pr100"
      style="display: inline-block;white-space: nowrap;padding: 4px 10px;border-radius: 4px;max-width: 140px;">
      <div class="left-title font-12-left-600-pr85"
        style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
        title="${data?.poi_name || data?.name}">
        ${data?.poi_name || data?.name || '暂无'}
      </div>
      <div class="left-num font-12-left-500-pr45">
        <span>指数：${(data.penetration * 100).toFixed(2) ?? '--'}%</span>
      </div>
      <div class="amap-info-sharp"></div>
    </div>
  `;

  /**
   * 初始化高德地图
   */
  const initMap = async (center?: any) => {
    await (window as any).Utils.map.loadMapJs();
    await (window as any).Utils.map.loadLocal();
    await (window as any).Utils.map.initPlugin('AMap', [
      'HeatMap',
      'MarkerCluster',
      'IndexCluster',
      'Geocoder',
      'MouseTool',
      'CircleEditor',
    ]);
    const map = new (window as any).AMap.Map(mapId, {
      resizeEnable: true,
      zoom: 14.5,
      center: center || [],
      mapStyle: 'amap://styles/' + theme.value,
    });
    return map;
  };

  /**
   * 生成海量点位及围栏
   */
  const createMassMarks = (data: any[]) => {
    if (markersList && overlayFenceGroup && markerInfo) {
      markersList.clearOverlays();
      overlayFenceGroup.clearOverlays();
      markerInfo.hide();
    }
    const markers: any[] = [];
    const kedaMarks: any[] = [];
    const ranking = (window as any).Utils.mapContentDom.ranking;

    data.forEach((item, i) => {
      const marker1 = new (window as any).AMap.Marker({
        extData: item,
        content: `<div class="marker-box"><div class="marker-img">${ranking(i + 1)}</div></div>`,
        position: [item.lng, item.lat],
        anchor: 'bottom-center',
      });
      const markerFence = new (window as any).AMap.Polygon({
        path: item.fence,
        fillColor: '#4E6AFF',
        strokeColor: '#4E6AFF',
        strokeOpacity: 1,
        fillOpacity: 0.25,
        strokeStyle: 'solid',
        strokeWeight: 1,
      });
      markers.push(marker1);
      kedaMarks.push(markerFence);
    });

    markersList = new (window as any).AMap.OverlayGroup(markers);
    overlayFenceGroup = new (window as any).AMap.OverlayGroup(kedaMarks);
    mapInstance.add(markersList);
    mapInstance.add(overlayFenceGroup);

    markersList.on('click', (e: any) => {
      const data = e?.target?.getExtData();
      markerInfo.show();
      markerInfo.setPosition([data?.lng, data?.lat]);
      markerInfo.setContent(curMarkerDom(data));
    });
  };

  /**
   * 列表锚点定位
   */
  const onListPoint = (params: any) => {
    const pixel = mapInstance.lngLatToPixel([params?.lng, params?.lat], 16);
    pixel.x -= 200;
    const lnglat = mapInstance.pixelToLngLat(pixel, 16);
    mapInstance.setZoomAndCenter(16, lnglat, true);
    baseInfo.value = {};
    activeName.value = params.name;
    markerInfo.show();
    markerInfo.setPosition([params?.lng, params?.lat]);
    markerInfo.setContent(curMarkerDom(params));
  };

  /**
   * 获取 POI 详情
   */
  const getPoiBaseInfo = async (values: any) => {
    if (!values?.id) return;
    loading.value = true;
    try {
      const res = await getPoiInfo({ p_ids: values?.id, p_type: 1 });
      if (res?.code !== 200) {
        message.error(res?.message || '查询失败');
        return;
      }
      const data = res?.data?.data?.[0];
      baseInfo.value = data
        ? {
            ...data,
            id: data?.p_id,
            add: data?.p_add,
            name: values?.name,
            p_loc: values?.p_loc,
          }
        : {
            id: values?.id,
            name: values?.name,
            p_loc: values?.p_loc,
          };
    } catch (err) {
      message.error('查询失败');
    } finally {
      loading.value = false;
    }
  };

  const handleMoreClick = (record: any) => {
    getPoiBaseInfo({
      ...record,
      id: record?.competitor_p_id || record?.p_id,
    });
  };

  const customRow = (record: any) => {
    return {
      onClick: () => {
        onListPoint(record);
      },
    };
  };

  const rowClassName = (record: any) => {
    return record.name === activeName.value ? 'active-row' : '';
  };

  onMounted(() => {
    initMap(props.info?.location).then((_map) => {
      mapInstance = _map;
      markerInfo = new (window as any).AMap.Marker({
        zIndex: 999,
        offset: new (window as any).AMap.Pixel(0, -45),
      });
      markerInfo.setMap(_map);
    });
  });

  onUnmounted(() => {
    mapInstance?.destroy();
  });

  watch(
    () => props.data,
    (val) => {
      if (val && mapInstance) {
        const res = val.map((item) => {
          const fence = JSON.parse(item.pb_boundary);
          const location = item.p_loc ? item.p_loc.split(',') : [0, 0];
          return {
            name: item.p_name,
            penetration: item.ratio,
            fence,
            location,
            lng: location[0],
            lat: location[1],
            ...item,
          };
        });
        createMassMarks(res);
        list.value = res;
      }
    },
    { deep: true, immediate: true },
  );

  watch(
    () => props.info?.location,
    (val) => {
      if (mapInstance && val) {
        mapInstance.setCenter(val, true);
      }
    },
  );
</script>

<style lang="less" scoped>
  @import './index.less';

  .shopping-preferences-styles {
    position: relative;

    .map-container {
      width: 100%;
      height: 100%;
    }

    .side-panel {
      position: absolute;
      top: 0;
      left: 0;
      width: 378px;
    }

    .work-panel {
      margin: 10px;
      padding: 12px;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

      .work-title {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        font-weight: 500;
      }

      .name-ellipsis {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :deep(.active-row) {
        background-color: #e6f7ff;
      }
    }

    .more-info-card {
      margin: 0 10px 10px;
      padding: 12px;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      &__title {
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        color: #999;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          color: #666;
        }
      }

      &__body {
        .info-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .info-label {
          min-width: 70px;
          color: #999;
        }

        .info-value {
          flex: 1;
          color: #333;
        }
      }
    }
  }
</style>
