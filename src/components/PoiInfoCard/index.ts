import { withInstall } from '@/utils';
import poiInfoCard from './src/PoiInfoCard/index.vue';

export const PoiInfoCard = withInstall(poiInfoCard);

// 导出类型定义
export type {
  PoiInfoCardData,
  ModuleConfig,
  TagItem,
  ModalConfig,
  TagClickEvent,
  PermissionChecker,
} from './src/PoiInfoCard/types';

// 导出配置和工具函数
export {
  defaultModuleConfig,
  filterAndSortModules,
} from './src/PoiInfoCard/config';

// 导出组合式函数
export { usePermission } from './src/PoiInfoCard/usePermission';
export { useDynamicComponent } from './src/PoiInfoCard/useDynamicComponent';

// 导出子组件
export { default as DataAnalysisModal } from './src/PoiInfoCard/DataAnalysisModal.vue';
