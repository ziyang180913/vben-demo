import type { Component, VNode } from 'vue';

/** 标签项配置 */
export interface TagItem {
  /** 唯一标识 */
  key: string;
  /** 显示标签名 */
  label: string;
  /** 权限标识符 - 为空时允许所有用户访问 */
  permission?: string;
  /** 动态组件加载函数，支持传入参数 */
  componentLoader: (...args: any[]) => Promise<Component>;
  /** 传递给组件加载器的参数 */
  loaderParams?: any[];
  /** 传递给组件的额外属性 */
  componentProps?: Record<string, any>;
  /** 弹窗配置 */
  modalConfig?: ModalConfig;
}

/** 模块配置 */
export interface ModuleConfig {
  /** 模块唯一标识 */
  key: string;
  /** 模块标题 */
  title: string;
  /** 模块下的标签列表 */
  tags: TagItem[];
  /** 排序权重，越小越靠前 */
  sort?: number;
}

/** 弹窗配置 */
export interface ModalConfig {
  /** 弹窗标题，默认为标签名 */
  title?: string;
  /** 弹窗宽度 */
  width?: string | number;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 是否显示遮罩 */
  maskClosable?: boolean;
  /** 自定义头部 */
  header?: VNode | (() => VNode);
  /** 自定义底部 */
  footer?: VNode | (() => VNode) | null;
  /** 其他 ant-design-vue Modal 配置 */
  [key: string]: any;
}

/** 卡片数据 */
export interface PoiInfoCardData {
  /** 场景ID */
  sceneId: string | number;
  /** 标题 */
  title: string;
  /** 状态标签 */
  tag?: string;
  /** 地址 */
  address: string;
  /** 是否显示更多按钮 */
  showMore?: boolean;
}

/** 用户权限检查函数类型 */
export type PermissionChecker = (permission: string | undefined) => boolean;

/** 标签点击事件参数 */
export interface TagClickEvent {
  tag: TagItem;
  module: ModuleConfig;
  data: PoiInfoCardData;
}
