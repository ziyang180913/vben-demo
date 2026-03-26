import dayjs from 'dayjs';
/** --- 常量与配置 --- */
const INITIAL_POPULATION = {
  population_type: 3,
  size: 100,
  month: dayjs().subtract(3, 'month'),
  heatmap: true,
  grid: false,
  gridPopulation: false,
};
const INITIAL_POI = {
  selectAll: false,
  baseInfo: false,
  otherPoiType: 'category',
  otherPoiValue: [],
  selectedTypes: [],
  otherCategoryDetails: [],
  otherBrandDetails: [],
};
const GRID_COLORS = [
  'rgba(255,121,0,0.6)',
  'rgba(255,142,40,0.6)',
  'rgba(255,169,92,0.6)',
  'rgba(255,191,134,0.6)',
  'rgba(255,212,174,0.6)',
  'rgba(29,217,185,0.6)',
  'rgba(85,234,209,0.6)',
  'rgba(132,247,227,0.6)',
  'rgba(172,251,237,0.6)',
  'rgba(213,251,245,0.6)',
].reverse();
const DRAW_STYLE = { strokeOpacity: 1, strokeStyle: 'solid', strokeWidth: 2 };
const legendColors = ['#4E6AFF', '#4CCB73', '#B77EEF', '#FAD336', '#1DD3F8'];

export { INITIAL_POPULATION, INITIAL_POI, GRID_COLORS, DRAW_STYLE, legendColors };
