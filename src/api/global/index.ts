import { defHttp } from '@/utils/http/axios';
import qs from 'qs';

/**
 * 获取可达圈
 * @param params objct 查询参数
 */
export function getReachable(params: object) {
  return fetch(
    `https://citymap.isjike.com/api/newcitymap/outletanalysis/reachable?${qs.stringify(params)}`,
  ).then((response) => {
    if (!response.ok) throw new Error('Network error');
    return response.json(); // 解析 JSON
  });
}
