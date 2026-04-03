import type { ModuleConfig, PermissionChecker } from './types';

/**
 * 指标经营模块配置
 */
const operate = [
  {
    value: 1,
    key: 'number-of-people',
    label: '人群数量统计',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 2,
    key: 'passenger-flow',
    label: '客流趋势',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 3,
    key: 'daily-passenger-flow',
    label: '当日客流',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 4,
    key: 'realtime-passenger-flow',
    label: '实时客流',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 5,
    key: 'onsite-behavior',
    label: '场内行为分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 6,
    key: 'competitive-analysis',
    label: '竞品到访分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 7,
    key: 'business-format',
    label: '业态与品牌分布',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 9,
    key: 'new-and-old-customers',
    label: '新老客分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 10,
    key: 'lost-customers',
    label: '流失客分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
];

/**
 * 地理属性模块配置
 */
const attribute = [
  {
    value: 1,
    key: 'origin',
    label: '客群来源地',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 2,
    key: 'point-of-consumption',
    label: '消费地统计',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 3,
    key: 'distance-distribution',
    label: '距离比例分布',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 4,
    key: 'provincial-urban-areas',
    label: '省市区分布',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 5,
    key: 'community-analysis',
    label: '小区分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 6,
    key: 'permeability',
    label: '周边来客率（渗透率）',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 7,
    key: 'surrounding-population',
    label: '周边人口',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 8,
    key: 'customer-destination',
    label: '流失客去向分析',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
];

/**
 * 客户画像模块配置
 */
const portrait = [
  {
    value: 1,
    key: 'base-portrait',
    label: '基础画像',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 2,
    key: 'income-consumption',
    label: '收入消费',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 4,
    key: 'transportation',
    label: '交通方式',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 3,
    key: 'business-preference-detail',
    label: '业态偏好(细)',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 5,
    key: 'catering-preference',
    label: '餐饮偏好',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 6,
    key: 'shopping-preference',
    label: '商场偏好',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 7,
    key: 'brand-preference',
    label: '品牌偏好',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 8,
    key: 'mobile-terminal',
    label: '手机终端',
    componentLoader: () => import('../MobileTerminal/index.vue'),
  },
  {
    value: 9,
    key: 'business-preference-rough',
    label: '业态偏好(粗)',
    componentLoader: () => import('../ViewPortrait/index.vue'),
  },
  {
    value: 11,
    key: 'operator-preference',
    label: '运营商偏好',
    componentLoader: () => import('../Operator/index.vue'),
  },
  {
    value: 12,
    key: 'charging-station',
    label: '充电站',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
];

/**
 * 精准营销模块配置
 */
const marketing = [
  {
    value: 1,
    key: 'lost-customer-recovery',
    label: '流失客挽回',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 2,
    key: 'competitive-marketing',
    label: '竞品营销',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 3,
    key: 'surrounding-marketing',
    label: '周边营销',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 4,
    key: 'member-marketing',
    label: '会员营销',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
];

/**
 * 门店模型模块配置
 */
const model = [
  {
    value: 1,
    key: 'store-score',
    label: '门店经营评分',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 2,
    key: 'location-score',
    label: '店铺位置得分',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 3,
    key: 'site-selection-score',
    label: '选址打分表',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
  {
    value: 4,
    key: 'site-selection-recommend',
    label: '选址推荐位',
    componentLoader: () => import('../CustomerBase/index.vue'),
  },
];

/**
 * 默认模块配置 - 数据分析卡片系统
 * 包含：指标经营、地理属性、客户画像、精准营销、门店模型 五大模块
 */
export const defaultModuleConfig: ModuleConfig[] = [
  {
    key: 'operate',
    title: '指标经营',
    sort: 1,
    tags: operate.map((item) => ({
      key: item.key,
      label: item.label,
      permission: `analysis:operate:${item.value}`,
      componentLoader: item.componentLoader,
      modalConfig: { width: 900, title: item.label },
    })),
  },
  {
    key: 'attribute',
    title: '地理属性',
    sort: 2,
    tags: attribute.map((item) => ({
      key: item.key,
      label: item.label,
      permission: `analysis:attribute:${item.value}`,
      componentLoader: item.componentLoader,
      modalConfig: { width: 900, title: item.label },
    })),
  },
  {
    key: 'portrait',
    title: '客户画像',
    sort: 3,
    tags: portrait.map((item) => ({
      key: item.key,
      label: item.label,
      permission: `analysis:portrait:${item.value}`,
      componentLoader: item.componentLoader,
      modalConfig: { width: 900, title: item.label },
    })),
  },
  {
    key: 'marketing',
    title: '精准营销',
    sort: 4,
    tags: marketing.map((item) => ({
      key: item.key,
      label: item.label,
      permission: `analysis:marketing:${item.value}`,
      componentLoader: item.componentLoader,
      modalConfig: { width: 900, title: item.label },
    })),
  },
  {
    key: 'model',
    title: '门店模型',
    sort: 5,
    tags: model.map((item) => ({
      key: item.key,
      label: item.label,
      permission: `analysis:model:${item.value}`,
      componentLoader: item.componentLoader,
      modalConfig: { width: 900, title: item.label },
    })),
  },
];

/**
 * 默认权限检查器 - 允许访问所有标签
 * 在实际项目中，应该替换为真实的权限检查逻辑
 */
export const defaultPermissionChecker: PermissionChecker = (permission) => {
  if (!permission) return true;
  // 这里可以接入真实的权限系统，例如：
  // return useUserStore().hasPermission(permission);
  // 或者从 props 传入的权限列表中检查
  return true;
};

/**
 * 排序并过滤模块配置
 * @param modules - 模块配置列表
 * @param permissionChecker - 权限检查函数
 * @returns 排序并过滤后的模块列表
 */
export const filterAndSortModules = (
  modules: ModuleConfig[],
  permissionChecker: PermissionChecker,
): ModuleConfig[] => {
  return modules
    .map((module) => ({
      ...module,
      tags: module.tags.filter((tag) => permissionChecker(tag.permission)),
    }))
    .filter((module) => module.tags.length > 0)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
};
