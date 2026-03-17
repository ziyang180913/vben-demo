import type { PropType } from 'vue';

export const basicProps = {
  value: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  isSlot: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  text: {
    type: [String] as PropType<string>,
    default: '请向右滑动验证',
  },
  successText: {
    type: [String] as PropType<string>,
    default: '验证成功',
  },
  height: {
    type: [Number, String] as PropType<number | string>,
    default: 40,
  },

  width: {
    type: [Number, String] as PropType<number | string>,
    default: 220,
  },

  circle: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  wrapStyle: {
    type: Object as PropType<Record<string, string>>,
    default: () => {},
  },

  contentStyle: {
    type: Object as PropType<Record<string, string>>,
    default: () => {},
  },

  barStyle: {
    type: Object as PropType<Record<string, string>>,
    default: () => {},
  },

  barScript: {
    type: [String, Function] as PropType<string | ((...args: any[]) => any)>,
  },

  showTip: {
    type: Boolean as PropType<boolean>,
    default: true,
  },

  accuracy: {
    type: Number as PropType<number>,
    default: 6,
  },

  mode: {
    type: String as PropType<string>,
    default: 'bar',
  },

  defaultImg: {
    type: String as PropType<string>,
    default: '',
  },

  successImg: {
    type: String as PropType<string>,
    default: '',
  },

  failImg: {
    type: String as PropType<string>,
    default: '',
  },

  imgSize: {
    type: Object as PropType<{ width: number; height: number }>,
    default: () => ({ width: 310, height: 155 }),
  },

  block: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  token: {
    type: String as PropType<string>,
    default: '',
  },

  secretKey: {
    type: String as PropType<string>,
    default: '',
  },

  captchaId: {
    type: String as PropType<string>,
    default: '',
  },
};
