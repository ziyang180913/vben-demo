import type { Component } from 'vue';

import ShoppingPreferences from './index.vue';

export { ShoppingPreferences };

export interface ShoppingPreferencesProps {
  info?: {
    location?: [number, number] | number[];
  };
  data?: any[];
  title?: string;
}

export default ShoppingPreferences as Component;
