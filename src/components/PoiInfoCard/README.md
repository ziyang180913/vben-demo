# 数据分析卡片系统 (PoiInfoCard)

一个配置驱动的数据分析卡片系统，支持权限控制、动态组件加载和模块自动隐藏。

## 核心特性

- **四大模块**：经营指标、地理属性、客群画像、精准营销
- **权限控制**：基于权限标识符的标签级权限控制
- **配置驱动**：所有模块和标签通过配置生成，无需修改模板
- **动态加载**：组件懒加载，优化性能
- **自动隐藏**：无权限标签的模块自动隐藏

## 基础用法

```vue
<template>
  <PoiInfoCard
    :visible="cardVisible"
    :data="poiData"
    :permission-checker="checkPermission"
    @tag-click="handleTagClick"
    @close="cardVisible = false"
  />
</template>

<script setup lang="ts">
import { PoiInfoCard } from '@/components/PoiInfoCard';
import { useUserStore } from '@/stores/user';

const cardVisible = ref(true);
const userStore = useUserStore();

const poiData = {
  sceneId: '12345',
  title: '示例商场',
  tag: '营业中',
  address: '北京市朝阳区xxx路123号',
  showMore: true,
};

// 权限检查函数
const checkPermission = (permission?: string) => {
  if (!permission) return true;
  return userStore.permissions.includes(permission);
};

const handleTagClick = (event) => {
  console.log('点击了标签:', event.tag.label);
};
</script>
```

## Props 配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | false | 卡片可见性 |
| data | PoiInfoCardData | 必填 | POI 基础数据 |
| modules | ModuleConfig[] | defaultModuleConfig | 模块配置 |
| permissionChecker | PermissionChecker | 允许所有 | 权限检查函数 |
| defaultActiveKeys | string[] | [] | 默认展开的模块 keys |
| defaultModalWidth | string/number | 800 | 默认弹窗宽度 |
| tagComponentProps | object | {} | 传递给标签组件的额外属性 |

## 自定义模块配置

```vue
<script setup lang="ts">
import { PoiInfoCard, type ModuleConfig } from '@/components/PoiInfoCard';

const customModules: ModuleConfig[] = [
  {
    key: 'business',
    title: '经营指标',
    sort: 1,
    tags: [
      {
        key: 'sales-analysis',
        label: '销售分析',
        permission: 'business:sales',
        componentLoader: () => import('./components/SalesAnalysis.vue'),
        modalConfig: { width: 1000, title: '销售数据分析' },
      },
      {
        key: 'traffic-analysis',
        label: '客流分析',
        permission: 'business:traffic',
        componentLoader: () => import('./components/TrafficAnalysis.vue'),
        componentProps: { mode: 'detail' },
      },
    ],
  },
];
</script>

<template>
  <PoiInfoCard :modules="customModules" :data="poiData" />
</template>
```

## 组件暴露的方法

```vue
<template>
  <PoiInfoCard ref="cardRef" :data="poiData" />
</template>

<script setup>
const cardRef = ref();

// 通过 key 打开指定标签的弹窗
const openSalesModal = () => {
  cardRef.value?.openTagModal('sales-analysis', { date: '2024-01' });
};

// 关闭当前弹窗
const closeModal = () => {
  cardRef.value?.closeCurrentModal();
};

// 获取当前可见模块
const visibleModules = computed(() => {
  return cardRef.value?.getVisibleModules() || [];
});
</script>
```

## 使用独立的组合式函数

### usePermission - 权限管理

```ts
import { usePermission } from '@/components/PoiInfoCard';

const { visibleModules, hasPermission } = usePermission({
  modules: customModules,
  permissionChecker: (permission) => {
    return userStore.hasPermission(permission);
  },
  extraFilter: (tag) => {
    // 额外的过滤条件
    return tag.key !== 'hidden-tag';
  },
});
```

### useDynamicComponent - 动态组件管理

```ts
import { useDynamicComponent } from '@/components/PoiInfoCard';

const {
  modalVisible,
  currentComponent,
  openModal,
  closeModal,
  isLoading,
} = useDynamicComponent({
  defaultModalWidth: 900,
  onBeforeOpen: async (tag) => {
    // 打开前的验证
    return await validateTagAccess(tag);
  },
  onAfterClose: () => {
    console.log('弹窗已关闭');
  },
});

// 打开标签对应的弹窗
await openModal(tagConfig, { extraData: 'xxx' });
```

## TypeScript 类型

```ts
import type {
  PoiInfoCardData,
  ModuleConfig,
  TagItem,
  ModalConfig,
  TagClickEvent,
  PermissionChecker,
} from '@/components/PoiInfoCard';
```
