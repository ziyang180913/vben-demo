import gcoord from 'gcoord';

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * 坐标转换工具函数：WGS84 转 GCJ02
 * @param lng 经度
 * @param lat 纬度
 * @returns 转换后的坐标 [lng, lat]
 */
export function convertWGS84ToGCJ02(lng: number, lat: number): [number, number] {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.GCJ02);
  return [round6(lng2), round6(lat2)];
}

/**
 * 坐标转换工具函数：WGS84 转 BD09
 */
export function convertWGS84ToBD09(lng: number, lat: number): [number, number] {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.BD09);
  return [round6(lng2), round6(lat2)];
}

/**
 * 坐标转换工具函数：BD09 转 GCJ02
 */
export function convertBD09ToGCJ02(lng: number, lat: number): [number, number] {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.BD09, gcoord.GCJ02);
  return [round6(lng2), round6(lat2)];
}

export function converGCJ02ToBD09(lng: number, lat: number): [number, number] {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.BD09);
  return [round6(lng2), round6(lat2)];
}

/**
 * 坐标转换工具函数：GCJ02 转 WGS84
 * @param lng 经度
 * @param lat 纬度
 * @returns 转换后的坐标 [lng, lat]
 */
export function convertGCJ02ToWGS84(lng: number, lat: number): [number, number] {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.WGS84);
  return [round6(lng2), round6(lat2)];
}

/**
 * 坐标转换工具函数：GCJ02 转 BD09
 * @param lng 经度
 * @param lat 纬度
 * @returns 转换后的坐标 [lng, lat]
 */

export const convertGCJ02ToBD09 = (lng: number, lat: number): [number, number] => {
  const [lng2, lat2] = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.BD09);
  return [round6(lng2), round6(lat2)];
};

/**
 * 转换围栏坐标数组
 * @param fenceString 围栏坐标字符串
 * @returns 转换后的围栏坐标字符串
 */
export function convertFenceCoordinates(fenceString: string): string {
  try {
    const coordinates = JSON.parse(fenceString);
    if (Array.isArray(coordinates)) {
      const convertedCoordinates = coordinates.map((coord) => {
        if (Array.isArray(coord) && coord.length >= 2) {
          const [lng, lat] = convertWGS84ToGCJ02(coord[0], coord[1]);
          return [round6(lng), round6(lat)];
        }
        return coord;
      });
      return JSON.stringify(convertedCoordinates);
    }
    return fenceString;
  } catch (error) {
    console.warn('围栏坐标转换失败:', error);
    return fenceString;
  }
}

/**
 * 转换围栏坐标数组：GCJ02 -> WGS84
 * @param fenceString 围栏坐标字符串（GCJ02，形如 [[lng,lat], ...]）
 * @returns 转换后的围栏坐标字符串（WGS84）
 */
export function convertFenceCoordinatesGCJ02ToWGS84(fenceString: string): string {
  try {
    const coordinates = JSON.parse(fenceString);
    if (Array.isArray(coordinates)) {
      const convertedCoordinates = coordinates.map((coord) => {
        if (Array.isArray(coord)) {
          const [lng, lat] = convertGCJ02ToWGS84(coord[0], coord[1]);
          return [round6(lng), round6(lat)];
        }
        return coord;
      });
      return JSON.stringify(convertedCoordinates);
    }
    return fenceString;
  } catch (error) {
    console.warn('围栏坐标转换失败(GCJ02->WGS84):', error);
    return fenceString;
  }
}

export function convertFenceCoordinatesGCJ02ToBD09(fenceString: string): string {
  try {
    const coordinates = JSON.parse(fenceString);
    if (Array.isArray(coordinates)) {
      const convertedCoordinates = coordinates.map((coord) => {
        if (Array.isArray(coord)) {
          const [lng, lat] = converGCJ02ToBD09(coord[0], coord[1]);
          return [round6(lng), round6(lat)];
        }
        return coord;
      });
      return JSON.stringify(convertedCoordinates);
    }
    return fenceString;
  } catch (error) {
    console.warn('围栏坐标转换失败(GCJ02->BD09):', error);
    return fenceString;
  }
}

export function convertFenceCoordinatesBD09ToGCJ02(fenceString: string): string {
  try {
    const coordinates = JSON.parse(fenceString);
    if (Array.isArray(coordinates)) {
      const convertedCoordinates = coordinates.map((coord) => {
        if (Array.isArray(coord)) {
          const [lng, lat] = convertBD09ToGCJ02(coord[0], coord[1]);
          return [round6(lng), round6(lat)];
        }
        return coord;
      });
      return JSON.stringify(convertedCoordinates);
    }
    return fenceString;
  } catch (error) {
    console.warn('围栏坐标转换失败(GCJ02->BD09):', error);
    return fenceString;
  }
}

export function FenceCoordinatesBD09ToGCJ02(fenceString: string): string {
  try {
    const coordinates = JSON.parse(fenceString);
    if (Array.isArray(coordinates)) {
      const convertedCoordinates = coordinates.map((coord) => {
        if (Array.isArray(coord)) {
          const [lng, lat] = convertBD09ToGCJ02(coord[0], coord[1]);
          return [round6(lng), round6(lat)];
        }
        return coord;
      });
      return JSON.stringify(convertedCoordinates);
    }
    return fenceString;
  } catch (error) {
    console.warn('围栏坐标转换失败(BD09->GCJ02):', error);
    return fenceString;
  }
}
