# 📊 数据分析卡片系统（权限 + 动态弹窗）实现模板

## 一、任务描述

实现一个「数据分析卡片系统」，要求如下：

### 1. 模块结构
系统包含 4 大模块：
- 经营指标
- 地理属性
- 客群画像
- 精准营销

### 2. 标签规则
- 每个模块下包含多个“标签”（功能入口）
- 标签必须支持权限控制
- 无权限标签不显示

### 3. 模块显示规则
- 如果某个模块下没有任何标签可见
- 则隐藏整个模块

### 4. 交互行为
- 点击标签 → 打开弹窗（Modal）
- 弹窗内容为对应功能组件

### 5. 技术要求
- 必须使用 Vue3 + Composition API
- 必须配置驱动（不可写死）
- 必须支持动态组件
- 必须支持懒加载

---

## 二、数据结构定义

### 1. 卡片配置（cardConfig）

```ts
export const cardConfig = [
  {
    key: 'business',
    title: '经营指标',
    children: [
      {
        key: 'flow',
        name: '客流趋势',
        perm: 'flow:view',
        feature: 'FlowTrend',
      },
      {
        key: 'behavior',
        name: '场内行为分析',
        perm: 'behavior:view',
        feature: 'BehaviorAnalysis',
      },
    ],
  },
  {
    key: 'geo',
    title: '地理属性',
    children: [
      {
        key: 'city',
        name: '省市区分布',
        perm: 'geo:city',
        feature: 'CityDistribution',
      },
    ],
  },
]