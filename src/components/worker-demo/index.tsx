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

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px' }}>操作类型：</h3>

        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as any)}
          style={{
            padding: '6px 12px',
            marginTop: '6px',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            fontSize: '15px',
            background: '#fff',
            outline: 'none',
            minWidth: '100px',
          }}
        >
          <option value="sum">求和</option>
          <option value="multiply">相乘</option>
          <option value="sort">排序</option>
        </select>

        <button
          onClick={handleProcess}
          disabled={!isReady || !execute || loading || numbers.length === 0}
          style={{
            padding: '10px 24px',
            backgroundColor:
              isReady && execute && numbers.length > 0 && !loading
                ? '#007acc'
                : '#e0e0e0',
            color:
              isReady && execute && numbers.length > 0 && !loading
                ? 'white'
                : '#888',
            border: 'none',
            borderRadius: '4px',
            cursor:
              isReady && execute && numbers.length > 0 && !loading
                ? 'pointer'
                : 'not-allowed',
            fontWeight: 500,
            fontSize: '15px',
            transition: 'background 0.2s',
          }}
        >
          {loading ? '处理中...' : '执行计算'}
        </button>

        <button
          onClick={handleTerminate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff7875',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '15px',
            transition: 'background 0.2s',
          }}
        >
          销毁
        </button>
        <button
          onClick={initWorker}
          style={{
            padding: '10px 20px',
            backgroundColor: '#36cfc9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '15px',
            transition: 'background 0.2s',
          }}
        >
          启动
        </button>
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
        Worker 状态: {isReady ? '✅ 就绪' : '⏳ 未启动'}
      </div>
    </div>
  );
}

export default ComplexDemo;
