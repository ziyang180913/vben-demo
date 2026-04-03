import type { Component } from 'vue';

import BusinessLabel from './index.vue';

export { BusinessLabel };

export type BusinessLabelData = Record<
  string,
  {
    比例: {
      无消费行为人口占比?: number;
      有消费行为人口占比?: number;
      [key: string]: number | undefined;
    };
    人数: {
      整体平均次数?: number;
      有消费行为平均次数?: number;
    };
  }
>;

export default BusinessLabel as Component;
