import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  // 浏览器信息
  browser: {
    name?: string;
    version?: string;
    major?: string;
  };
  // 操作系统信息
  os: {
    name?: string;
    version?: string;
  };
  // 设备信息
  device: {
    vendor?: string;
    model?: string;
    type?: string; // 'mobile' | 'tablet' | 'console' | 'smarttv' | 'wearable' | 'embedded' | undefined
  };
  // 引擎信息
  engine: {
    name?: string;
    version?: string;
  };
  // CPU架构
  cpu: {
    architecture?: string;
  };
  // 便捷判断
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  // 原始UA字符串
  ua: string;
}

/**
 * 使用 ua-parser-js 解析设备信息的 Hook
 * @param userAgent - 可选的自定义 User-Agent 字符串，不传则使用当前浏览器的
 */
export function useDeviceInfo(userAgent?: string): DeviceInfo | null {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    try {
      const ua = userAgent || window.navigator.userAgent;
      const parser = new UAParser(ua);
      const result = parser.getResult();

      const info: DeviceInfo = {
        browser: {
          name: result.browser.name,
          version: result.browser.version,
          major: result.browser.major,
        },
        os: {
          name: result.os.name,
          version: result.os.version,
        },
        device: {
          vendor: result.device.vendor,
          model: result.device.model,
          type: result.device.type,
        },
        engine: {
          name: result.engine.name,
          version: result.engine.version,
        },
        cpu: {
          architecture: result.cpu.architecture,
        },
        // 便捷判断
        isMobile: result.device.type === 'mobile',
        isTablet: result.device.type === 'tablet',
        isDesktop: !result.device.type,
        isIOS: result.os.name === 'iOS',
        isAndroid: result.os.name === 'Android',
        isWindows: result.os.name === 'Windows',
        isMac: result.os.name === 'Mac OS',
        isLinux: result.os.name === 'Linux',
        ua,
      };

      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to parse user agent:', error);
      setDeviceInfo(null);
    }
  }, [userAgent]);

  return deviceInfo;
}

/**
 * 简化版本 - 只返回设备类型判断
 */
export function useDeviceType() {
  const deviceInfo = useDeviceInfo();

  return {
    isMobile: deviceInfo?.isMobile ?? false,
    isTablet: deviceInfo?.isTablet ?? false,
    isDesktop: deviceInfo?.isDesktop ?? true,
  };
}

/**
 * 只返回浏览器信息
 */
export function useBrowserInfo() {
  const deviceInfo = useDeviceInfo();

  return deviceInfo?.browser ?? { name: 'Unknown', version: 'Unknown' };
}

/**
 * 只返回操作系统信息
 */
export function useOSInfo() {
  const deviceInfo = useDeviceInfo();

  return deviceInfo?.os ?? { name: 'Unknown', version: 'Unknown' };
}
