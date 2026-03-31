<template>
  <RightDrawers
    ref="rightDrawerRef"
    title="品牌智选列表"
    hasExport
    @export="handleExport"
    @open="handleOpenChange"
  >
    <template #desc>
      <div :style="{ marginTop: '10px' }">
        <span>列表数量: 9个</span>
        <span>围栏面积：233.3231平方公里</span>
      </div>
    </template>
    <div
      v-for="(item, index) in hotelList"
      :key="item.p_name"
      class="brand-selection-table-item"
      :class="{ active: activeData === item.p_name }"
      @click="handleSelect(item)"
    >
      <div class="hotel-info">
        <span class="hotel-index">{{ index + 1 }}.</span>
        <span class="hotel-name">{{ item.p_name }}</span>
      </div>

      <div v-if="item.pb_name" class="brand-info">
        <img :src="hotelIcon" alt="brand-icon" />
        <div class="brand-name">{{ item.pb_name }}</div>
      </div>

      <div class="hotel-details">
        <div class="detail-item">
          <div class="detail-label">开业年数</div>
          <div class="detail-value">{{ item.open_years ? `${item.open_years}年` : '-' }}</div>
        </div>

        <div class="detail-line"></div>

        <div class="detail-item">
          <div class="detail-label">房间数量</div>
          <div class="detail-value">{{ item.rooms ? `${item.rooms}间` : '-' }}</div>
        </div>

        <div class="detail-line"></div>

        <div class="detail-item">
          <div class="detail-label">年均房价</div>
          <div class="detail-value">{{ item.year_price ? `${item.year_price}元` : '-' }}</div>
        </div>

        <div class="detail-line"></div>

        <div class="detail-item">
          <div class="detail-label">综合评分</div>
          <div class="detail-value">{{ item.user_score || '-' }}</div>
        </div>
      </div>
    </div>
  </RightDrawers>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { RightDrawers } from '@/components/RightDrawers';
  // 导入图片资源
  import hotelIcon from '@/assets/images/icon-1.png';
  // 定义 Props 或模拟数据
  interface HotelItem {
    p_name: string;
    pb_name?: string;
    open_years?: number;
    rooms?: number;
    year_price?: number;
    user_score?: number;
  }
  defineProps<{
    hotelList: HotelItem[];
  }>();
  const rightDrawerRef = ref(null);
  // 状态管理
  const activeData = ref<string>('');
  const selectedHotel = ref<HotelItem | null>(null);

  // 点击事件处理
  const handleSelect = (item: HotelItem) => {
    selectedHotel.value = item;
    activeData.value = item.p_name;
    // 如果需要向父组件同步，可以 emit
    // emit('update:selected', item);
  };
  const handleExport = (val: string) => {
    console.log(val);
  };

  const handleOpenChange = (val: boolean) => {
    console.log(val);
  };
</script>

<style scoped lang="less" src="./index.less"></style>
