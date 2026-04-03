import { defHttp } from '@/utils/http/axios';

import { ErrorMessageMode } from '#/axios';

enum Api {
  CustomerResearch = '/api/newcitymap/outletanalysis/CustomerResearch',
}

/**
 * @description: 获取商场数据
 */
export function fetchCustomerResearch(params: any, mode: ErrorMessageMode = 'none') {
  return defHttp.get<any>(
    {
      url: Api.CustomerResearch,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}
