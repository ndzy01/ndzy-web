import { useEffect, useRef, useState } from 'react';

import { randTextRange } from '@ngneat/falso';
import { Virtuoso } from 'react-virtuoso';

interface Message {
  key: string;
  text: string;
}

let idCounter = 0;

function randomMessage(): Message {
  return {
    key: `${idCounter++}`,
    text: randTextRange({ min: 20, max: 300 }),
  };
}

const ItemContent = ({ data }: { data: Message }) => {
  return (
    <>
      <div
        style={{
          maxWidth: '100%',
          background: '#f1f1f1',
          color: '#333',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: '15px',
          wordBreak: 'break-word',
          paddingBlock: '8px',
          paddingInline: '12px',
        }}
      >
        {data.text}
      </div>
      <div style={{ height: 5, background: 'red' }}></div>
    </>
  );
};

export default function App() {
  const virtuoso = useRef<any>(null);

  const [data, setData] = useState<{ data: Message[] }>(() => ({
    data: Array.from({ length: 50 }, () => randomMessage()),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((current) => {
        const oldData = current?.data ?? [];
        const newData = [...oldData, randomMessage()];
        // 保留最新500条
        const limitedData =
          newData.length > 500 ? newData.slice(newData.length - 500) : newData;
        return {
          data: limitedData,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Virtuoso
      alignToBottom
      ref={virtuoso}
      style={{
        height: 800,
      }}
      followOutput={(isAtBottom) => {
        if (isAtBottom) {
          return 'smooth';
        }

        return false;
      }}
      data={data.data}
      computeItemKey={(_index, data) => data.key}
      itemContent={(index, data) => <ItemContent key={data.key} data={data} />}
    />
  );
}
