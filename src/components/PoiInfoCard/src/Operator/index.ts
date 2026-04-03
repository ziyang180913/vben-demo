import type { Component } from 'vue';

import Operator from './index.vue';

export { Operator };

export interface OperatorData {
  '手机运营商'?: Record<string, number>;
  wifi?: Record<string, number>;
}

export interface OperatorProps {
  data?: OperatorData;
}

export default Operator as Component;
