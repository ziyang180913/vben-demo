import type { Component } from 'vue';

import RestaurantLabel from './index.vue';

export { RestaurantLabel };

export type RestaurantLabelData = Record<string, any>;

export interface RestaurantLabelProps {
  data?: RestaurantLabelData;
}

export default RestaurantLabel as Component;
