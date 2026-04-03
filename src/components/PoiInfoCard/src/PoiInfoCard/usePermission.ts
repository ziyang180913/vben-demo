import { computed, type ComputedRef, type Ref } from 'vue';
import type { ModuleConfig, PermissionChecker, TagItem } from './types';
import { filterAndSortModules } from './config';

export interface UsePermissionOptions {
  /** 模块配置 */
  modules: Ref<ModuleConfig[]> | ModuleConfig[] | ComputedRef<ModuleConfig[]>;
  /** 权限检查函数 */
  permissionChecker: PermissionChecker;
  /** 额外过滤条件 */
  extraFilter?: (tag: TagItem) => boolean;
}

export interface UsePermissionReturn {
  /** 过滤并排序后的模块列表 */
  visibleModules: ComputedRef<ModuleConfig[]>;
  /** 检查单个标签是否有权限 */
  hasPermission: (tag: TagItem) => boolean;
  /** 检查模块是否可见 */
  isModuleVisible: (moduleKey: string) => boolean;
  /** 获取可见的标签数量 */
  getVisibleTagCount: (moduleKey: string) => number;
}

/**
 * 权限管理组合式函数
 * 用于处理模块和标签的权限过滤逻辑
 */
export function usePermission(options: UsePermissionOptions): UsePermissionReturn {
  const { modules, permissionChecker, extraFilter } = options;

  // 计算可见模块
  const visibleModules = computed(() => {
    const modulesValue = Array.isArray(modules) ? modules : modules.value;
    let filtered = filterAndSortModules(modulesValue, permissionChecker);
    
    // 应用额外过滤条件
    if (extraFilter) {
      filtered = filtered
        .map((module) => ({
          ...module,
          tags: module.tags.filter(extraFilter),
        }))
        .filter((module) => module.tags.length > 0);
    }
    
    return filtered;
  });

  // 检查单个标签是否有权限
  const hasPermission = (tag: TagItem): boolean => {
    if (!permissionChecker(tag.permission)) return false;
    if (extraFilter && !extraFilter(tag)) return false;
    return true;
  };

  // 检查模块是否可见
  const isModuleVisible = (moduleKey: string): boolean => {
    return visibleModules.value.some((m) => m.key === moduleKey);
  };

  // 获取可见的标签数量
  const getVisibleTagCount = (moduleKey: string): number => {
    const module = visibleModules.value.find((m) => m.key === moduleKey);
    return module?.tags.length || 0;
  };

  return {
    visibleModules,
    hasPermission,
    isModuleVisible,
    getVisibleTagCount,
  };
}
