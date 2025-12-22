import React from 'react';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

interface DeviceInfoDisplayProps {
  userAgent?: string;
  showRawUA?: boolean;
}

const DeviceInfoDisplay: React.FC<DeviceInfoDisplayProps> = ({
  userAgent,
  showRawUA = false,
}) => {
  const deviceInfo = useDeviceInfo(userAgent);

  if (!deviceInfo) {
    return <div>加载设备信息中...</div>;
  }

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return '📱';
    if (deviceInfo.isTablet) return '📲';
    return '💻';
  };

  const getOSIcon = () => {
    if (deviceInfo.isIOS) return '🍎';
    if (deviceInfo.isAndroid) return '🤖';
    if (deviceInfo.isWindows) return '🪟';
    if (deviceInfo.isMac) return '🍎';
    if (deviceInfo.isLinux) return '🐧';
    return '❓';
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        maxWidth: '600px',
        margin: '20px auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
        {getDeviceIcon()} 设备信息
      </h2>

      <div style={{ display: 'grid', gap: '15px' }}>
        {/* 设备类型 */}
        <InfoItem
          label="设备类型"
          value={
            deviceInfo.isMobile
              ? '移动设备'
              : deviceInfo.isTablet
                ? '平板设备'
                : '桌面设备'
          }
          icon={getDeviceIcon()}
        />

        {/* 浏览器 */}
        <InfoItem
          label="浏览器"
          value={`${deviceInfo.browser.name || 'Unknown'} ${deviceInfo.browser.version || ''}`}
          icon="🌐"
        />

        {/* 操作系统 */}
        <InfoItem
          label="操作系统"
          value={`${deviceInfo.os.name || 'Unknown'} ${deviceInfo.os.version || ''}`}
          icon={getOSIcon()}
        />

        {/* 渲染引擎 */}
        {deviceInfo.engine.name && (
          <InfoItem
            label="渲染引擎"
            value={`${deviceInfo.engine.name} ${deviceInfo.engine.version || ''}`}
            icon="⚙️"
          />
        )}

        {/* CPU架构 */}
        {deviceInfo.cpu.architecture && (
          <InfoItem
            label="CPU架构"
            value={deviceInfo.cpu.architecture}
            icon="🖥️"
          />
        )}

        {/* 设备型号 */}
        {deviceInfo.device.vendor && (
          <InfoItem
            label="设备厂商"
            value={`${deviceInfo.device.vendor} ${deviceInfo.device.model || ''}`}
            icon="🏭"
          />
        )}
      </div>

      {/* 原始UA字符串 */}
      {showRawUA && (
        <details style={{ marginTop: '20px' }}>
          <summary
            style={{ cursor: 'pointer', color: '#666', fontWeight: 'bold' }}
          >
            查看原始 User-Agent
          </summary>
          <pre
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '12px',
              overflowX: 'auto',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}
          >
            {deviceInfo.ua}
          </pre>
        </details>
      )}
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  icon?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
      }}
    >
      <span style={{ fontWeight: 'bold', color: '#555' }}>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {label}:
      </span>
      <span style={{ color: '#333' }}>{value}</span>
    </div>
  );
};

export default DeviceInfoDisplay;
