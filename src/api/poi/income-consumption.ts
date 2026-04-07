import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

enum Api {
  GetIncomeConsumption = '/basic-api/poi/income-consumption',
}

/**
 * @description: 获取收入消费职业数据
 */
export function fetchIncomeConsumption(params?: any, mode: ErrorMessageMode = 'none') {
  return defHttp.get<any>(
    {
      url: Api.GetIncomeConsumption,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}
