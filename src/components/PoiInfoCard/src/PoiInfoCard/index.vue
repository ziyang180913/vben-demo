<template>
  <div v-show="visible" class="poi-info-card">
    <!-- 卡片头部 -->
    <div class="poi-info-card__header">
      <div class="header-top">
        <span class="scene-id">场景ID： {{ data.sceneId }}</span>
        <CloseOutlined class="close-btn" @click="handleClose" />
      </div>
      <div class="header-main">
        <div class="title-row">
          <h3 class="title">{{ data.title }}</h3>
          <span v-if="data.tag" class="status-badge">{{ data.tag }}</span>
        </div>
        <div class="address-row">
          <span class="address" :title="data.address">{{ data.address }}</span>
          <span v-if="data.showMore" class="more-btn" @click="handleMore">更多</span>
        </div>
      </div>
    </div>

    <!-- 卡片主体 - 数据模块列表 -->
    <div class="poi-info-card__body">
      <Collapse v-model:activeKey="activeKeys" :bordered="false" ghost>
        <CollapsePanel v-for="module in visibleModules" :key="module.key" class="module-panel">
          <template #header>
            <div class="module-header">
              <span class="module-indicator"></span>
              <span class="module-title">{{ module.title }}</span>
            </div>
          </template>

          <!-- 标签列表 -->
          <div class="tag-list">
            <div
              v-for="tag in module.tags"
              :key="tag.key"
              :class="['tag-item', { active: selectedTagKey === tag.key }]"
              @click="handleTagClick(tag, module)"
            >
              {{ tag.label }}
            </div>
          </div>
        </CollapsePanel>
      </Collapse>

      <!-- 空状态 -->
      <div v-if="visibleModules.length === 0" class="empty-state">
        <div class="empty-icon">
          <LockOutlined />
        </div>
        <div class="empty-text">暂无权限查看数据</div>
      </div>
    </div>

    <!-- 数据分析弹窗 -->
    <DataAnalysisModal
      v-model:open="modalVisible"
      :current-tag="currentTag"
      :current-component="currentComponent"
      :modal-config="modalConfig"
      :data="data"
      :loading="isLoading"
      @close="handleModalClose"
    />

    <!-- 详情弹窗 -->
    <PoiDetailModal
      :visible="detailModalVisible"
      :data="detailData"
      @close="handleDetailModalClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { CloseOutlined, LockOutlined } from '@ant-design/icons-vue';
  import { Collapse, CollapsePanel } from 'ant-design-vue';
  import DataAnalysisModal from './DataAnalysisModal.vue';
  import PoiDetailModal from '../PoiDetailModal/index.vue';
  import { usePermission } from './usePermission';
  import { useDynamicComponent } from './useDynamicComponent';
  import type {
    PoiInfoCardData,
    ModuleConfig,
    TagItem,
    PermissionChecker,
    TagClickEvent,
  } from './types';
  import { defaultModuleConfig, defaultPermissionChecker } from './config';

  // ==================== 类型导出 ====================
  export type { PoiInfoCardData, ModuleConfig, TagItem, TagClickEvent };

  // ==================== Props & Emits ====================
  interface Props {
    /** 卡片可见性 */
    visible: boolean;
    /** POI 基础数据 */
    data: PoiInfoCardData;
    /** 默认展开的模块 keys */
    defaultActiveKeys?: string[];
    /** 模块配置 */
    modules?: ModuleConfig[];
    /** 权限检查函数 */
    permissionChecker?: PermissionChecker;
    /** 默认弹窗宽度 */
    defaultModalWidth?: string | number;
    /** 传递给标签组件的额外属性 */
    tagComponentProps?: Record<string, any>;
  }

  interface Emits {
    (e: 'close'): void;
    (e: 'more', data: PoiInfoCardData): void;
    (e: 'tag-click', event: TagClickEvent): void;
    (e: 'modal-close', tag: TagItem | null): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    defaultActiveKeys: () => [],
    modules: () => defaultModuleConfig,
    permissionChecker: () => defaultPermissionChecker,
    defaultModalWidth: 900,
    tagComponentProps: () => ({}),
  });

  const emit = defineEmits<Emits>();

  // ==================== 状态管理 ====================
  /** 展开的模块 keys */
  const activeKeys = ref<string[]>([]);
  /** 当前选中的标签 key */
  const selectedTagKey = ref<string>('');
  /** 详情弹窗可见性 */
  const detailModalVisible = ref(false);

  // ==================== 权限管理 ====================
  const { visibleModules } = usePermission({
    modules: computed(() => props.modules),
    permissionChecker: props.permissionChecker,
  });

  // ==================== 动态组件管理 ====================
  const {
    modalVisible,
    currentTag,
    currentComponent,
    modalConfig,
    openModal,
    closeModal,
    isLoading,
  } = useDynamicComponent({
    defaultModalWidth: props.defaultModalWidth,
    onAfterClose: () => {
      emit('modal-close', currentTag.value);
    },
  });

  // ==================== 监听 ====================
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        // 默认展开所有可见模块，或按照用户传入的 keys 展开
        activeKeys.value =
          props.defaultActiveKeys.length > 0
            ? props.defaultActiveKeys.filter((key) =>
                visibleModules.value.some((m) => m.key === key),
              )
            : visibleModules.value.map((m) => m.key);
      } else {
        selectedTagKey.value = '';
      }
    },
    { immediate: true },
  );

  // ==================== 事件处理 ====================
  /** 关闭卡片 */
  const handleClose = () => {
    // 详情弹窗关闭
    handleDetailModalClose();
    emit('close');
  };

  /** 点击更多 */
  const handleMore = () => {
    detailModalVisible.value = true;
    emit('more', props.data);
  };

  /** 详情弹窗数据 */
  const detailData = computed(() => {
    return {
      name: props.data.title,
      id: props.data.sceneId,
      add: props.data.address,
    };
  });

  /** 关闭详情弹窗 */
  const handleDetailModalClose = () => {
    detailModalVisible.value = false;
  };

  /** 客群画像模块的 key */
  const PORTRAIT_MODULE_KEY = 'portrait';

  /** 判断是否属于统一组件的客群画像标签（除手机终端、运营商偏好、充电站外） */
  const isUnifiedPortraitTag = (tag: TagItem): boolean => {
    const unifiedKeys = [
      'base-portrait',
      'income-consumption',
      'transportation',
      'business-preference-detail',
      'catering-preference',
      'shopping-preference',
      'brand-preference',
      'business-preference-rough',
    ];
    return unifiedKeys.includes(tag.key);
  };

  /** 构建客群画像的 filterLabel */
  const buildPortraitFilterLabel = (module: ModuleConfig) => {
    return module.tags
      .filter((t) => isUnifiedPortraitTag(t))
      .map((t) => ({
        label: t.label,
        value: getTagValue(t),
        key: t.key,
      }));
  };

  /** 获取标签的 value 值（从 componentProps 或 modalConfig 中获取） */
  const getTagValue = (tag: TagItem): number => {
    // 从 modalConfig 或 componentProps 中获取 value，默认为 1
    return tag.componentProps?.value || tag.modalConfig?.value || 1;
  };

  /** 点击标签 */
  const handleTagClick = async (tag: TagItem, module: ModuleConfig) => {
    selectedTagKey.value = tag.key;

    // 触发点击事件
    emit('tag-click', {
      tag,
      module,
      data: props.data,
    });

    // 客群画像模块特殊处理：统一使用 ViewPortrait 组件
    if (module.key === PORTRAIT_MODULE_KEY && isUnifiedPortraitTag(tag)) {
      const filterLabel = buildPortraitFilterLabel(module);
      const curLable = {
        label: tag.label,
        value: getTagValue(tag),
        key: tag.key,
      };

      // 创建一个新的 tag 配置，使用 ViewPortrait 组件，并传递 filterLabel 和 curLable
      const portraitTag: TagItem = {
        ...tag,
        componentLoader: () => import('../ViewPortrait/index.vue'),
        componentProps: {
          ...tag.componentProps,
          filterLabel,
          curLable,
          params: { sceneId: props.data.sceneId },
        },
        modalConfig: {
          ...tag.modalConfig,
          title: '客群画像',
          width: 1200,
        },
      };

      await openModal(portraitTag, [props.data.sceneId], props.tagComponentProps);
      return;
    }

    // 打开弹窗并加载对应组件
    await openModal(tag, [props.data.sceneId], props.tagComponentProps);
  };

  /** 弹窗关闭 */
  const handleModalClose = () => {
    selectedTagKey.value = '';
    closeModal();
  };

  // ==================== 暴露方法 ====================
  defineExpose({
    /**
     * 打开指定标签的弹窗
     * @param tagKey - 标签 key
     * @param loaderArgs - 传递给 componentLoader 的参数
     * @param extraProps - 额外传递给组件的属性
     */
    openTagModal: async (tagKey: string, loaderArgs?: any[], extraProps?: Record<string, any>) => {
      for (const module of visibleModules.value) {
        const tag = module.tags.find((t) => t.key === tagKey);
        if (tag) {
          selectedTagKey.value = tagKey;

          // 客群画像模块特殊处理
          if (module.key === PORTRAIT_MODULE_KEY && isUnifiedPortraitTag(tag)) {
            const filterLabel = buildPortraitFilterLabel(module);
            const curLable = {
              label: tag.label,
              value: getTagValue(tag),
              key: tag.key,
            };

            const portraitTag: TagItem = {
              ...tag,
              componentLoader: () => import('../ViewPortrait/index.vue'),
              componentProps: {
                ...tag.componentProps,
                ...extraProps,
                filterLabel,
                curLable,
                params: { sceneId: props.data.sceneId },
              },
              modalConfig: {
                ...tag.modalConfig,
                title: '客群画像',
                width: 900,
              },
            };

            await openModal(portraitTag, loaderArgs);
            return true;
          }

          await openModal(tag, loaderArgs, extraProps);
          return true;
        }
      }
      console.warn(`[PoiInfoCard] Tag with key "${tagKey}" not found or no permission`);
      return false;
    },
    /** 关闭当前弹窗 */
    closeCurrentModal: handleModalClose,
    /** 获取可见模块列表 */
    getVisibleModules: () => visibleModules.value,
  });
</script>

<style lang="less" scoped>
  @import './index.less';
</style>
