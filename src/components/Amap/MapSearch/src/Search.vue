<template>
  <div class="map-search-component" :style="style">
    <div :class="['box-search', isShowSearchContentStatus ? 'box-search-active' : '']">
      <CascaderCity
        ref="cascaderRef"
        :extStyle="{ top: '30px', left: '-12px', ...cityStyle }"
        okText="确定"
        @change="onCityChange"
        :dataLevel="3"
        isCascader
      >
        <div class="city" @click="onCityBoxClick">
          <div class="city-name">{{ cityInfo?.name || '-' }}</div>
          <img class="city-arrow" :src="arrowDownIcon" alt="" />
        </div>
      </CascaderCity>
      <div :class="['search', searchCls]">
        <img class="search-icon" :src="searchIcon" alt="" />
        <Input
          class="search-input"
          placeholder="输入关键字搜索"
          style="width: 150px"
          :value="searchInfo.searchValue"
          @focus="onInputFocus"
          @change="onInputChange"
          @press-enter="() => onInputEnter(searchInfo.searchValue, true)"
          allowClear
          :bordered="false"
        />
      </div>
    </div>

    <div v-if="isShowSearchContentStatus" :class="['search-content', searchCls]">
      <Spin :spinning="searchInfo.loading">
        <div style="min-height: 60px">
          <div
            v-for="v in searchInfo.data || []"
            :key="v?.id"
            class="content-item"
            @click="onSearchItemClick(v)"
          >
            {{ v.name }}&nbsp;
            <span class="font-12-left-400-pr45" style="margin-left: 4px">
              {{ v.district }}
            </span>
          </div>
          <div v-if="searchInfo.loading" style="height: 30px"></div>
        </div>
      </Spin>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { Input, Spin } from 'ant-design-vue';
  import { CascaderCity } from '@/components/CascaderCity';
  import arrowDownIcon from '@/assets/icons/arrow-down.png';
  import searchIcon from '@/assets/icons/search.png';
  import centerPointIcon from '@/assets/icons/centerPoint.png';

  interface AMapGeocoder {
    getLocation: (
      address: string,
      callback: (status: string, result: AMapGeocoderResult) => void,
    ) => void;
  }

  interface AMapGeocoderResult {
    geocodes: Array<{
      location: AMapLocation;
      formattedAddress: string;
    }>;
  }

  interface AMapAutoComplete {
    search: (
      keyword: string,
      callback: (status: string, result: AMapAutoCompleteResult) => void,
    ) => void;
  }

  interface AMapAutoCompleteResult {
    tips: Array<{
      id?: string;
      name: string;
      location?: AMapLocation;
      district: string;
    }>;
    info: string;
  }

  interface AMapMarker {
    setPosition: (position: [number, number]) => void;
    setContent: (content: string) => void;
    setMap: (map: any) => void;
  }

  interface AMapLocation {
    lng: number;
    lat: number;
  }

  interface AMapCityInfo {
    province: string;
    city: string;
  }

  const searchCls = 'event-axyzivekvb';

  const props = defineProps<{
    map?: any;
    style?: Record<string, any>;
    cityStyle?: Record<string, any>;
    queryCreateCircle?: Function;
    options?: Record<string, any>;
  }>();

  const geocoder = ref<AMapGeocoder | null>(null);
  const cascaderRef = ref<any>(null);
  const searchRef = ref<AMapAutoComplete | null>(null);
  const locationPoi = ref<AMapMarker | null>(null);

  const cityInfo = ref({
    name: '全国',
    cityList: [] as string[],
  });
  const searchInfo = ref({
    searchValue: '',
    loading: false,
    data: [] as AMapAutoCompleteResult['tips'],
    showItems: false,
  });

  const resultPoiInfo = ref({
    name: '',
    location: { lng: 0, lat: 0 },
  });

  const timer = ref<any>(null);

  // marker内容
  const markerContent = ({ name }: { name: string }) => {
    return `
    <div style="position: relative;display: flex;flex-wrap: wrap;justify-content: center;">
      <div
          class="left-nav-poi-shadow aux-color-bg-b10"
          style="display: flex;white-space: nowrap;padding: 4px 10px;border-radius: 4px;"
        >
        <div>${name}</div>
      </div>
      <img style="width: 25px;margin-top: 4px; height: 25px;margin" src="${centerPointIcon}" />
    </div>
  `;
  };

  const initMapSearch = () => {
    setTimeout(() => {
      (window as any).AMap.plugin('AMap.Geocoder', () => {
        geocoder.value = new (window as any).AMap.Geocoder({
          city: '全国',
        });
      });
      (window as any).AMap.plugin('AMap.AutoComplete', () => {
        searchRef.value = new (window as any).AMap.AutoComplete({
          city: '全国',
        });
      });
    }, 1000);
  };

  const onMapDragend = () => {
    if (props.map) {
      props.map.getCity(function (info: AMapCityInfo) {
        const res = info.city
          ? {
              name: info.city,
              cityList: [info.province, info.city],
            }
          : info.province === '中华人民共和国'
            ? {
                name: '全国',
                cityList: [],
              }
            : {
                name: info.province,
                cityList: [info.province],
              };

        cityInfo.value = res;
      });
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    let target = e.target as HTMLElement;
    let isInSearchDom = false;
    while (target) {
      if (target.className && String(target.className).includes(searchCls)) {
        isInSearchDom = true;
        break;
      }
      target = target.parentNode as HTMLElement;
    }
    if (!isInSearchDom) {
      searchInfo.value.showItems = false;
    }
  };

  onMounted(() => {
    initMapSearch();
    document.addEventListener('click', handleClickOutside);

    if (props.map) {
      props.map.on('moveend', onMapDragend);
      onMapDragend();
    }
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    if (props.map) {
      props.map.off('moveend', onMapDragend);
    }
    clearTimeout(timer.value);
  });

  const onCityChange = (value?: any[]) => {
    const zoomConfig: Record<number, number> = {
      1: 10.38,
      2: 13,
      3: 15.34,
      4: 16.5,
    };

    try {
      if (geocoder.value) {
        const city = value!.map((_) => _.label).join();
        geocoder.value.getLocation(city, (status, result) => {
          if (result && result.geocodes && result.geocodes.length) {
            const { location } = result.geocodes[0];

            if (props.map) {
              props.map.setZoomAndCenter(
                zoomConfig[value!.length] || 10.38,
                [location.lng, location.lat],
                true,
              );
              onUpdateLocation({
                location: location,
                name: result.geocodes[0]?.formattedAddress,
              });

              if (props.queryCreateCircle) {
                props.queryCreateCircle({
                  lnglat: location,
                  isMove: true,
                });
              }

              const _cityInfo = value![value!.length - 1];
              cityInfo.value = {
                name: _cityInfo.label,
                cityList: value!.map((_) => _.label),
              };
              searchInfo.value = {
                ...searchInfo.value,
                searchValue: '',
                data: [],
              };
            }

            if (props.options?.search_ChangeCity) {
              props.options.search_ChangeCity(value!);
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onInputFocus = () => {
    if (cascaderRef.value) {
      cascaderRef.value.setModalOpen(false);
      searchInfo.value.showItems = true;
    }
  };

  const getSearchValue = (
    cityInfo: {
      name: string;
      cityList: string[];
    },
    value: string,
  ) => {
    return value;
  };

  const onSearchItemClick = (v: AMapAutoCompleteResult['tips'][0]) => {
    if (!props?.map) {
      console.error('请bind map 实例');
      return;
    }
    searchInfo.value.searchValue = v.name;
    if (v.location) {
      props.map.setZoomAndCenter(16, [v.location.lng, v.location.lat], true);

      onUpdateLocation({
        location: v.location,
        name: v.name,
      });
      searchInfo.value.showItems = false;
      if (props.queryCreateCircle) {
        props.queryCreateCircle({
          lnglat: [v.location.lng, v.location.lat],
          isMove: true,
        });
      }
    } else {
      const value = v.name;
      const searchValue = getSearchValue(cityInfo.value, value);
      if (searchRef.value) {
        searchRef.value.search(searchValue, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            const location = result?.tips[0]?.location;
            if (location) {
              props.map!.setZoomAndCenter(16, [location.lng, location.lat], true);
              onUpdateLocation({
                location: location,
                name: result?.tips[0]?.name,
              });
              searchInfo.value.showItems = false;
            }
          }
        });
      }
    }
  };

  const onUpdateLocation = ({ location, name }: { location: AMapLocation; name: string }) => {
    if (locationPoi.value) {
      locationPoi.value.setPosition([location.lng, location.lat]);
      locationPoi.value.setContent(markerContent({ name }));
    } else {
      const icon = new (window as any).AMap.Marker({
        zIndex: 999,
        offset: new (window as any).AMap.Pixel(0, 10),
        content: markerContent({ name }),
        anchor: 'bottom-center',
        clickable: false,
        bubble: true,
      });
      icon.setPosition([location.lng, location.lat]);
      if (props.map) {
        icon.setMap(props.map);
      }
      locationPoi.value = icon;
    }
    resultPoiInfo.value = { location, name };
  };

  const onInputEnter = (value = searchInfo.value.searchValue, isEnter = false) => {
    if (!value) {
      searchInfo.value = {
        ...searchInfo.value,
        data: [],
        loading: false,
      };
    } else {
      const searchValue = getSearchValue(cityInfo.value, value);
      if (searchRef.value) {
        searchRef.value.search(searchValue, (_, result) => {
          searchInfo.value = {
            ...searchInfo.value,
            data: result.tips,
            loading: false,
            showItems: true,
          };
          if (result.tips && isEnter) {
            const location = result?.tips[0]?.location;
            if (location && props.map) {
              props.map.setZoomAndCenter(16, [location.lng, location.lat], true);
              if (props.queryCreateCircle) {
                props.queryCreateCircle({
                  lnglat: location,
                  isMove: true,
                });
              }
            }
          }
        });
      }
    }
  };

  const onInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    searchInfo.value = {
      ...searchInfo.value,
      searchValue: target.value,
      loading: true,
    };
    if (!target.value) {
      searchInfo.value.loading = false;
      searchInfo.value.data = [];
    }
    clearTimeout(timer.value);
    timer.value = setTimeout(() => {
      onInputEnter(searchInfo.value.searchValue);
    }, 300);
  };

  const onCityBoxClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (cascaderRef.value) {
      cascaderRef.value.modalToggle();
    }
  };

  const isShowSearchContentStatus = computed(() => {
    return (
      searchInfo.value.loading ||
      (!searchInfo.value.loading &&
        searchInfo.value.data &&
        searchInfo.value.data.length &&
        searchInfo.value.showItems)
    );
  });

  defineExpose({
    resultPoiInfo,
    onUpdateLocation,
  });
</script>
<style scoped>
  @import url('./index.less');
</style>
