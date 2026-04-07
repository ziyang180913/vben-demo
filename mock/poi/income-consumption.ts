import { MockMethod } from 'vite-plugin-mock';
import { resultSuccess } from '../_util';

/**
 * 模拟收入消费职业数据
 */
export function createMockIncomeConsumptionData() {
  return {
    // 收入区间分布数据
    收入区间分布: {
      '0-3K': { 比例: 0.08 },
      '3K-5K': { 比例: 0.15 },
      '5K-8K': { 比例: 0.25 },
      '8K-12K': { 比例: 0.22 },
      '12K-20K': { 比例: 0.18 },
      '20K-30K': { 比例: 0.08 },
      '30K以上': { 比例: 0.04 },
      收入总体均值: 9850.5,
      市平均收入: 8750.3,
    },
    // 消费区间分布数据
    消费区间分布: {
      '0-1K': { 比例: 0.05 },
      '1K-2K': { 比例: 0.12 },
      '2K-3K': { 比例: 0.2 },
      '3K-5K': { 比例: 0.28 },
      '5K-8K': { 比例: 0.18 },
      '8K-12K': { 比例: 0.1 },
      '12K以上': { 比例: 0.07 },
      消费总体均值: 4850.75,
      市平均消费: 4200.5,
    },
  };
}

export default [
  {
    url: '/basic-api/poi/income-consumption',
    timeout: 300,
    method: 'get',
    response: () => {
      return resultSuccess(createMockIncomeConsumptionData());
    },
  },
] as MockMethod[];
