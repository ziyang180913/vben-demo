<template>
  <div class="example-page">
    <h2>数据分析卡片系统示例</h2>

    <!-- 权限设置面板 -->
    <div class="permission-panel">
      <h3>权限设置（模拟）</h3>
      <CheckboxGroup v-model:value="userPermissions" :options="allPermissions" />
    </div>

    <!-- 卡片展示 -->
    <div class="card-container">
      <PoiInfoCard
        ref="cardRef"
        :visible="true"
        :data="poiData"
        :permission-checker="checkPermission"
        :modules="customModules"
        :tag-component-props="{ data: poiDetailData }"
        @tag-click="handleTagClick"
        @more="handleMore"
        @close="handleClose"
        @modal-close="handleModalClose"
      />
    </div>

    <!-- 快捷操作 -->
    <div class="actions">
      <h3>快捷操作</h3>
      <Space>
        <Button @click="openSpecificModal('business-label')">打开消费标签</Button>
        <Button @click="openSpecificModal('customer-base')">打开基础画像</Button>
        <Button @click="closeAll">关闭弹窗</Button>
      </Space>
    </div>

    <!-- 事件日志 -->
    <div class="event-log">
      <h3>事件日志</h3>
      <div class="log-list">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Button, Space, CheckboxGroup, message } from 'ant-design-vue';
  import { PoiInfoCard, type ModuleConfig, type TagClickEvent } from '../index';

  // ==================== 权限配置 ====================
  const allPermissions = [
    { label: '消费标签', value: 'analysis:business:label' },
    { label: '业态偏好', value: 'analysis:business:bold' },
    { label: '餐饮偏好', value: 'analysis:business:restaurant' },
    { label: '商场偏好', value: 'analysis:business:shopping' },
    { label: '车辆属性', value: 'analysis:geo:vehicle' },
    { label: '视图画像', value: 'analysis:geo:view' },
    { label: '基础画像', value: 'analysis:customer:base' },
    { label: '收入消费职业', value: 'analysis:customer:income' },
    { label: '手机终端', value: 'analysis:customer:mobile' },
    { label: '运营商分析', value: 'analysis:customer:operator' },
    { label: '短信营销', value: 'marketing:sms' },
    { label: '推送营销', value: 'marketing:push' },
  ];

  const userPermissions = ref<string[]>([
    'analysis:business:label',
    'analysis:customer:base',
    'analysis:customer:mobile',
    'marketing:sms',
  ]);

  // 权限检查函数
  const checkPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return userPermissions.value.includes(permission);
  };

  // ==================== 数据配置 ====================
  const poiData = {
    sceneId: 'M-2024-001',
    title: '朝阳大悦城',
    tag: 'A级商圈',
    address: '北京市朝阳区朝阳北路101号',
    showMore: true,
  };

  const poiDetailData = {
    location: [116.518, 39.928],
    customerCount: 125000,
    avgStayTime: 2.5,
  };

  // ==================== 自定义模块配置 ====================
  const customModules: ModuleConfig[] = [
    {
      key: 'business',
      title: '经营指标',
      sort: 1,
      tags: [
        {
          key: 'business-label',
          label: '消费标签',
          permission: 'analysis:business:label',
          componentLoader: () => import('../src/BusinessLabel/index.vue'),
          modalConfig: { width: 900 },
        },
        {
          key: 'business-label-bold',
          label: '业态偏好',
          permission: 'analysis:business:bold',
          componentLoader: () => import('../src/BusinessLabelBold/index.vue'),
          modalConfig: { width: 900 },
        },
        {
          key: 'restaurant-label',
          label: '餐饮偏好',
          permission: 'analysis:business:restaurant',
          componentLoader: () => import('../src/RestaurantLabel/index.vue'),
          modalConfig: { width: 900 },
        },
        {
          key: 'shopping-preferences',
          label: '商场偏好',
          permission: 'analysis:business:shopping',
          componentLoader: () => import('../src/ShoppingPreferences/index.vue'),
          modalConfig: { width: 1100 },
        },
      ],
    },
    {
      key: 'geography',
      title: '地理属性',
      sort: 2,
      tags: [
        {
          key: 'vehicle-related',
          label: '车辆属性',
          permission: 'analysis:geo:vehicle',
          componentLoader: () => import('../src/VehicleRelated/index.vue'),
          modalConfig: { width: 800 },
        },
      ],
    },
    {
      key: 'customer',
      title: '客群画像',
      sort: 3,
      tags: [
        {
          key: 'customer-base',
          label: '基础画像',
          permission: 'analysis:customer:base',
          componentLoader: () => import('../src/CustomerBase/index.vue'),
          modalConfig: { width: 800 },
        },
        {
          key: 'income-consumption',
          label: '收入/消费/职业',
          permission: 'analysis:customer:income',
          componentLoader: () => import('../src/IncomeConsumptionOccupation/index.vue'),
          modalConfig: { width: 800 },
        },
        {
          key: 'mobile-terminal',
          label: '手机终端',
          permission: 'analysis:customer:mobile',
          componentLoader: () => import('../src/MobileTerminal/index.vue'),
          modalConfig: { width: 900 },
        },
        {
          key: 'operator',
          label: '运营商分析',
          permission: 'analysis:customer:operator',
          componentLoader: () => import('../src/Operator/index.vue'),
          modalConfig: { width: 800 },
        },
      ],
    },
    {
      key: 'marketing',
      title: '精准营销',
      sort: 4,
      tags: [
        {
          key: 'marketing-sms',
          label: '短信营销',
          permission: 'marketing:sms',
          componentLoader: () => import('../src/CustomerBase/index.vue'),
          componentProps: { mode: 'marketing', type: 'sms' },
          modalConfig: { width: 800 },
        },
        {
          key: 'marketing-push',
          label: '推送营销',
          permission: 'marketing:push',
          componentLoader: () => import('../src/CustomerBase/index.vue'),
          componentProps: { mode: 'marketing', type: 'push' },
          modalConfig: { width: 800 },
        },
      ],
    },
  ];

  // ==================== 事件处理 ====================
  const eventLogs = ref<string[]>([]);
  const cardRef = ref<InstanceType<typeof PoiInfoCard>>();

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${time}] ${msg}`);
    if (eventLogs.value.length > 20) {
      eventLogs.value.pop();
    }
  };

  const handleTagClick = (event: TagClickEvent) => {
    addLog(`点击标签: ${event.tag.label} (模块: ${event.module.title})`);
  };

  const handleMore = () => {
    addLog('点击更多按钮');
    message.info('查看更多详情');
  };

  const handleClose = () => {
    addLog('关闭卡片');
  };

  const handleModalClose = () => {
    addLog('弹窗关闭');
  };

  // ==================== 快捷操作 ====================
  const openSpecificModal = async (tagKey: string) => {
    const success = await cardRef.value?.openTagModal(tagKey, {
      date: '2024-01-15',
      extraParam: 'test',
    });
    if (success) {
      addLog(`通过 API 打开标签: ${tagKey}`);
    } else {
      addLog(`标签不存在或无权限: ${tagKey}`);
      message.warning('该标签不存在或当前用户无权限访问');
    }
  };

  const closeAll = () => {
    cardRef.value?.closeCurrentModal();
    addLog('手动关闭弹窗');
  };
</script>

<style lang="less" scoped>
  .example-page {
    padding: 20px;

    h2 {
      margin-bottom: 20px;
      color: @text-color;
      font-size: 20px;
    }

    h3 {
      margin-bottom: 12px;
      color: @text-color;
      font-size: 14px;
      font-weight: 600;
    }

    .permission-panel {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #b7eb8f;
      border-radius: 8px;
      background: #f6ffed;
    }

    .card-container {
      position: relative;
      height: 600px;
      margin-bottom: 20px;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .actions {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #91d5ff;
      border-radius: 8px;
      background: #e6f7ff;
    }

    .event-log {
      padding: 16px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      background: #f9f9f9;

      .log-list {
        max-height: 200px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
      }

      .log-item {
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;
        color: #595959;

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
</style>
