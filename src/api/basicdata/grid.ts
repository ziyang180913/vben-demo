import { defHttp } from '@/utils/http/axios';

import { ErrorMessageMode } from '#/axios';

enum Api {
  GetGridPopulation = '/api/citymap/grid/population',
}

/**
 * @description: 获取网格人口数据
 */
export function fetchGridPopulation(params: any, mode: ErrorMessageMode = 'none') {
  return defHttp.post<any>(
    {
      url: Api.GetGridPopulation,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}
