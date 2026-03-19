// 定义树节点的通用类型
interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
}

/**
 * 递归查找树结构中的数据
 * @param tree - 树结构数据数组
 * @param func - 用于判断是否找到目标的函数
 * @param findArr - 存储查找路径的数组
 * @returns 包含查找路径的数组，如果未找到则返回空数组
 */
export function treeFindDataByFactor(
  tree: TreeNode[],
  func: (data: TreeNode) => boolean,
  findArr: TreeNode[] = [],
): TreeNode[] {
  if (!tree || !tree.length) {
    return [];
  }
  for (const data of tree) {
    findArr.push(data);
    if (func(data)) {
      return findArr;
    }
    if (data.children && data.children.length) {
      const findChildren = treeFindDataByFactor(data.children, func, findArr);
      if (findChildren.length) return findChildren;
    }
    findArr.pop();
  }
  return [];
}

/**
 * 递归查找指定id下的所有子项
 * @param data 原始数据
 * @param targetId 要查找的id
 * @returns 找到的子项数组（包含所有层级），未找到返回空数组
 */
export function findChildrenById(data: any[], targetId: number): any[] {
  // 用于存储结果的数组
  let result: any[] = [];

  // 递归查找函数
  const search = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.admin_div_id === targetId) {
        // 找到目标节点，返回它的children
        if (node.children && node.children.length > 0) {
          result = node.children;
        }
        return;
      }

      // 如果没有匹配，继续递归搜索子节点
      if (node.children && node.children.length > 0) {
        search(node.children);
      }
    }
  };

  search(data);
  return result;
}

// 数据格式重组
export function transformData(data: any[]): any[] {
  return data.map((item) => {
    return {
      value: item.id,
      label: item.admin_div_name,
      ...item,
      children: item.children ? transformData(item.children) : [],
    };
  });
}
