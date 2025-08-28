import { useEffect, useState } from 'react';

import { useThreadsWorker } from './hooks/useThreadsWorker';

interface ComplexWorker {
  add: (a: number, b: number) => Promise<number>;
  processData: (options: {
    numbers: number[];
    operation: 'sum' | 'multiply' | 'sort';
  }) => Promise<{
    result: number | number[];
    processTime: number;
  }>;
  generateLargeDataSet: () => Promise<number[]>;
}

function ComplexDemo() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [operation, setOperation] = useState<'sum' | 'multiply' | 'sort'>(
    'sum',
  );
  const [result, setResult] = useState<any>(null);
  const [processTime, setProcessTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const { execute, isReady, error, handleTerminate, initWorker } =
    useThreadsWorker<ComplexWorker>();

  const handleProcess = async () => {
    if (!isReady || !execute) return;

    setLoading(true);
    try {
      const workerResult = await execute.processData({
        numbers,
        operation,
      });
      setResult(workerResult.result);
      setProcessTime(workerResult.processTime);
    } catch (error) {
      console.error('处理失败：', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNumber = () => {
    const newNumber = Math.floor(Math.random() * 100) + 1;
    setNumbers([...numbers, newNumber]);
  };

  const handleAddBatchNumbers = (count: number) => {
    const newNumbers = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 1000) + 1,
    );
    setNumbers([...numbers, ...newNumbers]);
  };

  const handleClearNumbers = () => {
    setNumbers([]);
  };

  const handleRemoveNumber = (index: number) => {
    setNumbers(numbers.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!isReady || !execute) return;

    const fetchData = async () => {
      const data = await execute.generateLargeDataSet();
      setNumbers(data);
    };
    fetchData();
  }, [execute, isReady]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Complex Threads Worker Demo</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>数字数组（共 {numbers.length} 个）：</h3>
        {numbers.length > 100 && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '12px',
              color: '#0050b3',
            }}
          >
            💡 虚拟列表优化：即使有 {numbers.length}{' '}
            个元素，也只渲染可见的部分，保持高性能
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={handleAddNumber}
            style={{
              padding: '8px 16px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            添加1个数字
          </button>
          <button
            onClick={() => handleAddBatchNumbers(100)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            添加100个数字
          </button>
          <button
            onClick={() => handleAddBatchNumbers(1000)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#722ed1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            添加1000个数字
          </button>
          <button
            onClick={handleClearNumbers}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            清空列表
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>操作类型：</h3>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as any)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="sum">求和</option>
          <option value="multiply">相乘</option>
          <option value="sort">排序</option>
        </select>

        <button
          onClick={handleProcess}
          disabled={!isReady || !execute || loading || numbers.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: isReady && execute ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isReady && execute ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? '处理中...' : '执行计算'}
        </button>
        <button onClick={handleTerminate}>销毁</button>
        <button onClick={initWorker}>重启</button>
      </div>

      {result !== null && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
          }}
        >
          <h3>结果：</h3>
          <p>
            <strong>计算结果：</strong>{' '}
            {Array.isArray(result) ? result.join(', ') : result}
          </p>
          <p>
            <strong>处理时间：</strong> {processTime.toFixed(2)}ms
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            color: 'red',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
          }}
        >
          错误: {error.message}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Worker 状态: {isReady ? '✅ 就绪' : '⏳ 初始化中...'}
      </div>
    </div>
  );
}

export default ComplexDemo;
