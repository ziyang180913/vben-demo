import type { PropType, CSSProperties } from 'vue';
import type { ModalWrapperProps } from './typing';
import { ButtonProps } from 'ant-design-vue/es/button/buttonTypes';

export const modalProps = {
  open: { type: Boolean },
  scrollTop: { type: Boolean, default: true },
  height: { type: Number },
  minHeight: { type: Number },
  draggable: { type: Boolean, default: true },
  centered: { type: Boolean },
  cancelText: { type: String, default: '取消' },
  okText: { type: String, default: '确定' },

  closeFunc: Function as PropType<() => Promise<boolean>>,
};

export const basicProps = Object.assign({}, modalProps, {
  defaultFullscreen: { type: Boolean },
  canFullscreen: { type: Boolean, default: true },
  wrapperFooterOffset: { type: Number, default: 0 },
  helpMessage: [String, Array] as PropType<string | string[]>,
  showConfirmBtn: { type: Boolean, default: true },
  showCancelBtn: { type: Boolean, default: true },
  reverseBtn: { type: Boolean, default: false },
  footerOffset: { type: Number, default: 0 },
  modalFooterOffset: { type: Number },
  closable: { type: Boolean, default: true },
  closeIcon: { type: Object as PropType<any> },
  maskClosable: { type: Boolean, default: true },
  keyboard: { type: Boolean, default: true },
  centered: { type: Boolean },
  width: [String, Number] as PropType<string | number>,
  title: { type: String as PropType<string>, default: '' },
  content: { type: String as PropType<string> },
  action: { type: Object as PropType<any> },
  loading: { type: Boolean, default: false },
  loadingTip: { type: String as PropType<string> },
  showActionButtonGroup: { type: Boolean, default: true },
  showAdvancedButton: { type: Boolean, default: true },
  formConfig: { type: Object as PropType<any> },
  wrapClassName: { type: String as PropType<string> },
  ref: Object as PropType<any>,

  tableResult: { type: Object as PropType<any> },
});
