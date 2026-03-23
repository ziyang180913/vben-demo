import utils from '@/utils/map-icon';

// 网格颜色
export const GRID_COLORS = [
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

// 点位默认颜色
export const MARKER_DEFAULT_COLOR = '#5D95FF';

// 点位选中颜色
export const MARKER_CURRENT_COLOR = '#f45925';

// 点位ICON
export const MARKER_ICON = {
  '#5D95FF': utils.getWaterDropIcon('#5D95FF'),
  '#f45925': utils.getWaterDropIcon('#f45925'),
};
