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
  const icon = `<svg width="28px" height="30px" viewBox="0 0 28 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>POI点_酒店</title>
    <defs>
        <path d="M12.5,0 C19.4035594,0 25,5.59644063 25,12.5 C25,18.6383337 20.5754739,23.743264 14.7416551,24.7995574 L12.5,28 L10.2593476,24.7997389 C4.42503307,23.7438489 0,18.6386854 0,12.5 C0,5.59644063 5.59644063,0 12.5,0 Z" id="path-1"></path>
        <filter x="-6.0%" y="-5.4%" width="112.0%" height="110.7%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <linearGradient x1="50%" y1="7.63394851%" x2="50%" y2="76.0526456%" id="linearGradient-3">
            <stop stop-color="#A5B4FF" offset="0%"></stop>
            <stop stop-color="#3455FF" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="酒店客研" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="酒店客研-地理属性" transform="translate(-765, -364)">
            <g id="POI点_酒店" transform="translate(765, 365)">
                <g id="编组-2" transform="translate(1.5, 0)">
                    <g id="形状结合">
                        <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                        <use fill="${color}" fill-rule="evenodd" xlink:href="#path-1"></use>
                    </g>
                    <circle id="椭圆形" fill="#FFFFFF" cx="12.5" cy="12.5" r="9.5"></circle>
                    <path d="M6.47584188,18.3579795 C6.21304166,18.3579795 6,18.1449378 6,17.8821376 C6,17.6193374 6.21304166,17.4062957 6.47584188,17.4062957 L7.294,17.406 L7.29428989,7.91800878 C7.29952122,7.13332724 7.93711654,6.5 8.72181552,6.5 L13.4802343,6.5 C14.2649332,6.5 14.9025286,7.13332724 14.9077599,7.91800878 L14.907,9.792 L16.3352855,9.79282577 C17.1252231,9.79805726 17.7628111,10.4399133 17.762,17.406 L18.5241581,17.4062957 C18.7869583,17.4062957 19,17.6193374 19,17.8821376 C19,18.1449378 18.7869583,18.3579795 18.5241581,18.3579795 L6.47584188,18.3579795 Z M16.3352855,10.7540263 L14.9077599,10.7540263 L14.9077599,17.4062957 L16.8111274,17.4062957 L16.8111274,11.2393851 C16.8136847,11.1115432 16.7646828,10.9880516 16.6751664,10.8967449 C16.5856501,10.8054382 16.463153,10.7540263 16.3352855,10.7540263 Z M12.2430454,12.1720351 L9.78770132,12.1720351 C9.52490111,12.1720351 9.31185945,12.3850768 9.31185945,12.647877 C9.31185945,12.9106772 9.52490112,13.1237189 9.78770132,13.1237189 L12.2430454,13.1237189 C12.5058456,13.1237189 12.7188873,12.9106772 12.7188873,12.647877 C12.7188873,12.5216759 12.6687541,12.4006437 12.5795164,12.311406 C12.4902787,12.2221683 12.3692465,12.1720351 12.2430454,12.1720351 Z M12.2430454,9.83089311 L9.78770132,9.83089311 C9.52490111,9.83089311 9.31185945,10.0439348 9.31185945,10.306735 C9.31185945,10.5695352 9.52490111,10.7825769 9.78770132,10.7825769 L12.2430454,10.7825769 C12.3692465,10.7825769 12.4902787,10.7324437 12.5795164,10.643206 C12.6687541,10.5539683 12.7188873,10.4329361 12.7188873,10.306735 C12.7188873,10.1805339 12.6687541,10.0595016 12.5795164,9.97026397 C12.4902787,9.88102631 12.3692465,9.83089311 12.2430454,9.83089311 Z" id="形状结合" fill="${color}" fill-rule="nonzero"></path>
                </g>
            </g>
        </g>
    </g>
</svg>`;
  // 将SVG代码转换为UTF-8编码的字节数组
  const utf8Bytes = new TextEncoder().encode(icon);
  // 将字节数组编码为Base64
  const base64Svg =
    'data:image/svg+xml;base64,' +
    window.btoa(String.fromCharCode.apply(null, Array.from(utf8Bytes)));
  return base64Svg;
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
