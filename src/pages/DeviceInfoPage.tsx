import React, { useState } from 'react';
import DeviceInfoDisplay from '../components/DeviceInfoDisplay';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

const DeviceInfoPage: React.FC = () => {
  const deviceInfo = useDeviceInfo();
  const [customUA, setCustomUA] = useState('');
  const [activeUA, setActiveUA] = useState<string | undefined>(undefined);

  // 预设的 User-Agent 示例
  const presetUAs = {
    'iPhone 14 Pro':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Samsung Galaxy S23':
      'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'iPad Pro':
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Windows Chrome':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'macOS Safari':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Linux Firefox':
      'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0',
  };

  const handlePresetClick = (ua: string) => {
    setCustomUA(ua);
    setActiveUA(ua);
  };

  const handleReset = () => {
    setCustomUA('');
    setActiveUA(undefined);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {deviceInfo && (
        <div
          style={{
            padding: '10px',
            margin: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
          }}
        >
          <strong>当前设备:</strong>
          {JSON.stringify(deviceInfo)}
          {deviceInfo.isMobile ? '📱 移动端' : '💻 桌面端'} |
          <strong> 浏览器:</strong> {deviceInfo.browser.name} |
          <strong> 系统:</strong> {deviceInfo.os.name}
        </div>
      )}
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
        🔍 设备信息检测工具
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        基于 ua-parser-js 的设备信息解析示例
      </p>

      {/* 控制面板 */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ marginTop: 0 }}>测试不同的 User-Agent</h3>

        {/* 预设选项 */}
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            预设设备:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(presetUAs).map(([name, ua]) => (
              <button
                key={name}
                onClick={() => handlePresetClick(ua)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: activeUA === ua ? '#007bff' : '#fff',
                  color: activeUA === ua ? '#fff' : '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {name}
              </button>
            ))}
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: !activeUA ? '#28a745' : '#fff',
                color: !activeUA ? '#fff' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              当前设备
            </button>
          </div>
        </div>

        {/* 自定义输入 */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            或输入自定义 User-Agent:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={customUA}
              onChange={(e) => setCustomUA(e.target.value)}
              placeholder="粘贴 User-Agent 字符串..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            />
            <button
              onClick={() => setActiveUA(customUA || undefined)}
              disabled={!customUA}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: customUA ? '#007bff' : '#ccc',
                color: '#fff',
                cursor: customUA ? 'pointer' : 'not-allowed',
              }}
            >
              解析
            </button>
          </div>
        </div>
      </div>

      {/* 设备信息显示 */}
      <DeviceInfoDisplay userAgent={activeUA} showRawUA={true} />

      {/* 使用说明 */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <h3>💡 使用说明</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>点击预设设备按钮可快速切换不同设备的 User-Agent</li>
          <li>可以在输入框中粘贴任意 User-Agent 字符串进行解析</li>
          <li>点击"当前设备"按钮可查看你正在使用的设备信息</li>
          <li>展开"查看原始 User-Agent"可以看到完整的 UA 字符串</li>
        </ul>

        <h4 style={{ marginTop: '20px' }}>🔧 技术栈</h4>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <code>ua-parser-js</code> - User-Agent 解析库
          </li>
          <li>
            <code>React Hooks</code> - 自定义 Hook 封装
          </li>
          <li>
            <code>TypeScript</code> - 类型安全
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DeviceInfoPage;
