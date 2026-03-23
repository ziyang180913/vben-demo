/**
 * 辅助函数：将 SVG 字符串转换为 Base64 编码的 Data URL
 */
const svgToBase64 = (svgString: string): string => {
  const utf8Bytes = new TextEncoder().encode(svgString);
  const base64Content = window.btoa(
    Array.from(utf8Bytes)
      .map((b) => String.fromCharCode(b))
      .join(''),
  );
  return `data:image/svg+xml;base64,${base64Content}`;
};

/**
 * 获取圆点图标
 */
export const getCircleIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <circle stroke="#FFFFFF" stroke-width="1" fill="${color}" cx="9" cy="9" r="6.5"></circle>
    </g>
  </svg>`;
  return svgToBase64(icon);
};

/**
 * 获取水滴型图标 (已优化路径坐标)
 */
export const getWaterDropIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="24px" height="30px" viewBox="0 0 24 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(5, 2)" fill="none" fill-rule="evenodd">
      <ellipse fill-opacity="0.2" fill="#000000" cx="6.25" cy="24" rx="4" ry="1.5"></ellipse>
      <path d="M6.25,0 C9.7,0 12.5,2.8 12.5,6.25 C12.5,11 6.25,20 6.25,20 C6.25,20 0,11 0,6.25 C0,2.8 2.8,0 6.25,0 Z" stroke="#FFFFFF" stroke-width="1" fill="${color}"></path>
    </g>
  </svg>`;
  return svgToBase64(icon);
};

/**
 * 测距图标
 */
export const getRuleIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.6017 1.7849C15.7816 1.605 16.0733 1.605 16.2532 1.7849L22.2186 7.7503C22.3985 7.9302 22.3985 8.2219 22.2186 8.4018L8.3982 22.2221C8.2183 22.402 7.9266 22.402 7.7467 22.2221L1.7813 16.2567C1.6014 16.0768 1.6014 15.7851 1.7813 15.6052L15.6017 1.7849Z M15.9274 2.762L14.2754 4.414L16.444 6.5825C16.6239 6.7624 16.6239 7.0541 16.444 7.234C16.2841 7.3939 16.0358 7.4117 15.8563 7.2873L15.7925 7.234L13.6244 5.066L12.0194 6.67L14.971 9.6214C15.1509 9.8013 15.1385 10.1054 14.9432 10.3007C14.7696 10.4742 14.5101 10.5033 14.3282 10.3813L14.2639 10.3285L11.3124 7.377L9.6684 9.021L11.8372 11.1893C12.0171 11.3692 12.0171 11.6609 11.8372 11.8408C11.6773 12.0007 11.4291 12.0185 11.2495 11.8941L11.1857 11.8408L9.0174 9.672L7.4134 11.277L10.3642 14.2281C10.5441 14.408 10.5317 14.7122 10.3364 14.9074C10.1629 15.081 9.9033 15.1101 9.7214 14.9881L9.6571 14.9352L6.7064 11.984L5.0624 13.628L7.2304 15.7961C7.4103 15.976 7.4103 16.2676 7.2304 16.4476C7.0705 16.6075 6.8223 16.6252 6.6427 16.5009L6.5789 16.4476L4.4104 14.279L2.7585 15.931L8.0724 21.2449L21.2413 8.0759L15.9274 2.762Z" fill="${color}" fill-rule="nonzero"></path>
  </svg>`;
  return svgToBase64(icon);
};

/**
 * 酒店图标
 */
export const getHotelIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="28px" height="30px" viewBox="0 0 28 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path d="M12.5,0 C19.4,0 25,5.59 25,12.5 C25,18.63 20.57,23.74 14.74,24.79 L12.5,28 L10.25,24.79 C4.42,23.74 0,18.63 0,12.5 C0,5.59 5.59,0 12.5,0 Z" id="hotel-path"></path>
    </defs>
    <g transform="translate(1.5, 1)" fill="none" fill-rule="evenodd">
      <use fill="${color}" xlink:href="#hotel-path"></use>
      <circle fill="#FFFFFF" cx="12.5" cy="12.5" r="9.5"></circle>
      <path d="M6.47 18.35 C6.21 18.35 6 18.14 6 17.88 C6 17.61 6.21 17.40 6.47 17.40 L7.29 17.40 L7.29 7.91 C7.29 7.13 7.93 6.5 8.72 6.5 L13.48 6.5 C14.26 6.5 14.90 7.13 14.90 7.91 L14.90 9.79 L16.33 9.79 C17.12 9.79 17.76 10.43 17.76 11.22 L17.76 17.40 L18.52 17.40 C18.78 17.40 19 17.61 19 17.88 C19 18.14 18.78 18.35 18.52 18.35 L6.47 18.35 Z" fill="${color}"></path>
    </g>
  </svg>`;
  return svgToBase64(icon);
};

/**
 * 景点图标
 */
export const getScenicSpotIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="28px" height="28px" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <circle fill="${color}" cx="14" cy="14" r="14"></circle>
    <g transform="translate(6, 8)" stroke="#FFFFFF" stroke-linejoin="round" stroke-width="2">
      <polygon points="5.8 0 11.6 11.6 0 11.6"></polygon>
      <line x1="7.89" y1="4.57" x2="4.15" y2="11.6" stroke-linecap="round"></line>
      <polyline stroke-linecap="round" points="11.6 11.6 16 11.6 12.46 5.8 10.59 9.14"></polyline>
    </g>
  </svg>`;
  return svgToBase64(icon);
};

/**
 * 会展图标
 */
export const getConventionIcon = (color: string = '#3455FF'): string => {
  const icon = `<svg width="28px" height="28px" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <circle fill="${color}" cx="14" cy="14" r="14"></circle>
    <g transform="translate(7, 6.5)" stroke="#FFFFFF" stroke-width="2">
      <polygon stroke-linejoin="round" points="0 1.98 6.8 0 13.6 1.98 13.6 4.54 0 4.54"></polygon>
      <line x1="1.81" y1="4.54" x2="1.81" y2="13.27" stroke-linecap="round"></line>
      <line x1="5.45" y1="4.54" x2="5.45" y2="13.27" stroke-linecap="round"></line>
      <line x1="12" y1="4.54" x2="12" y2="13.27" stroke-linecap="round"></line>
      <rect stroke-linejoin="round" x="0.36" y="13.27" width="13.63" height="1"></rect>
    </g>
  </svg>`;
  return svgToBase64(icon);
};

export default {
  getCircleIcon,
  getWaterDropIcon,
  getRuleIcon,
  getHotelIcon,
  getScenicSpotIcon,
  getConventionIcon,
};
