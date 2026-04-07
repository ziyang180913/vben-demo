import { ref, shallowRef, computed, type Component, type ComputedRef, type ShallowRef } from 'vue';
import type { TagItem, ModalConfig, TagClickEvent } from './types';

export interface UseDynamicComponentOptions {
  /** 默认弹窗宽度 */
  defaultModalWidth?: string | number;
  /** 弹窗打开前的回调 */
  onBeforeOpen?: (tag: TagItem) => Promise<boolean> | boolean;
  /** 弹窗关闭后的回调 */
  onAfterClose?: () => void;
}

export interface UseDynamicComponentReturn {
  /** 是否显示弹窗 */
  modalVisible: Ref<boolean>;
  /** 当前选中的标签 */
  currentTag: ShallowRef<TagItem | null>;
  /** 当前加载的组件 */
  currentComponent: ShallowRef<Component | null>;
  /** 当前弹窗配置 */
  modalConfig: ComputedRef<ModalConfig>;
  /** 当前组件属性 */
  componentProps: ComputedRef<Record<string, any>>;
  /** 打开标签对应的弹窗
   * @param tag - 标签配置
   * @param loaderArgs - 传递给 componentLoader 的参数
   * @param extraProps - 额外传递给组件的属性
   */
  openModal: (tag: TagItem, loaderArgs?: any[], extraProps?: Record<string, any>) => Promise<void>;
  /** 关闭弹窗 */
  closeModal: () => void;
  /** 是否正在加载组件 */
  isLoading: Ref<boolean>;
}

/**
 * 动态组件管理组合式函数
 * 处理组件的懒加载和弹窗状态管理
 */
export function useDynamicComponent(
  options: UseDynamicComponentOptions = {},
): UseDynamicComponentReturn {
  const { defaultModalWidth = 800, onBeforeOpen, onAfterClose } = options;

  // 弹窗状态
  const modalVisible = ref(false);
  const isLoading = ref(false);

  // 当前选中的标签和组件（使用 shallowRef 避免深层响应）
  const currentTag = shallowRef<TagItem | null>(null);
  const currentComponent = shallowRef<Component | null>(null);

  // 计算弹窗配置
  const modalConfig = computed<ModalConfig>(() => {
    if (!currentTag.value) return {};
    return {
      title: currentTag.value.label,
      width: defaultModalWidth,
      closable: true,
      maskClosable: false,
      destroyOnClose: true,
      footer: null,
      ...currentTag.value.modalConfig,
    };
  });

  // 计算组件属性
  const componentProps = computed<Record<string, any>>(() => {
    if (!currentTag.value) return {};
    return currentTag.value.componentProps || {};
  });

  /**
   * 打开标签对应的弹窗
   * @param tag - 标签配置
   * @param loaderArgs - 传递给 componentLoader 的额外参数
   * @param extraProps - 额外传递给组件的属性
   */
  const openModal = async (
    tag: TagItem,
    loaderArgs?: any[],
    extraProps?: Record<string, any>,
  ): Promise<void> => {
    // 执行打开前的回调
    if (onBeforeOpen) {
      const shouldOpen = await onBeforeOpen(tag);
      if (!shouldOpen) return;
    }

    isLoading.value = true;

    try {
      // 动态加载组件，传入 loaderParams 和额外的 loaderArgs
      const args = [...(tag.loaderParams || []), ...(loaderArgs || [])];
      const module = await tag.componentLoader(...args);
      // 处理 ES Module 的默认导出
      const component = module?.default || module;
      currentComponent.value = component;
      currentTag.value = tag;

      // 合并额外属性
      if (extraProps) {
        currentTag.value = {
          ...tag,
          componentProps: { ...tag.componentProps, ...extraProps },
        };
      }

      modalVisible.value = true;
    } catch (error) {
      console.error(`Failed to load component for tag "${tag.key}":`, error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 关闭弹窗
   */
  const closeModal = (): void => {
    modalVisible.value = false;

    // 延迟清理，等待关闭动画完成
    setTimeout(() => {
      currentComponent.value = null;
      currentTag.value = null;
      onAfterClose?.();
    }, 300);
  };

  return {
    modalVisible,
    currentTag,
    currentComponent,
    modalConfig,
    componentProps,
    openModal,
    closeModal,
    isLoading,
  };
}
