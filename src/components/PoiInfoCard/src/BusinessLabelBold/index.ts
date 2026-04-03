import type { Component } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';

import BusinessLabelBold from './index.vue';

export { BusinessLabelBold };

export interface TabConfig {
  label: string;
  key: string;
}

export interface BusinessLabelBoldProps {
  tabsConfig?: TabConfig[];
  columns?: TableColumnsType;
  data?: Record<string, any[]>;
  setStore?: (param: { category: string }) => void;
  getData?: () => void;
}

export default BusinessLabelBold as Component;
