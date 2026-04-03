import type { Component } from 'vue';

import MobileTerminal from './index.vue';

export { MobileTerminal };

export interface MobileTerminalData {
  [key: string]: Record<string, { 比例?: number } | number>;
}

export interface MobileTerminalProps {
  data?: MobileTerminalData;
}

export default MobileTerminal as Component;
