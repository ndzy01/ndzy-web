import { useEffect, useRef, useState } from 'react';

import { randTextRange } from '@ngneat/falso';
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
  type VirtuosoMessageListMethods,
  type VirtuosoMessageListProps,
} from '@virtuoso.dev/message-list';

interface Message {
  key: string;
  text: string;
}

let idCounter = 0;

function randomMessage(): Message {
  return {
    key: `${idCounter++}`,
    text: randTextRange({ min: 20, max: 200 }),
  };
}

const ItemContent: VirtuosoMessageListProps<Message, null>['ItemContent'] = ({
  data,
}) => {
  return (
    <div
      style={{
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        background: '#f1f1f1',
        color: '#333',
        padding: '10px 16px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        fontSize: '15px',
        wordBreak: 'break-word',
        paddingBlock: '8px',
        paddingInline: '12px',
        marginBottom: 16,
      }}
    >
      {data.text}
    </div>
  );
};

export default function App() {
  const listRef = useRef<VirtuosoMessageListMethods>(null);

  const [data, setData] = useState<
    VirtuosoMessageListProps<Message, null>['data']
  >(() => ({
    data: [],
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
          ...(listRef.current?.getScrollLocation().isAtBottom
            ? {
                scrollModifier: {
                  type: 'auto-scroll-to-bottom',
                  autoScroll: () => {
                    return {
                      index: 'LAST',
                      align: 'start-no-overflow',
                      behavior: 'smooth',
                    };
                  },
                },
              }
            : {}),
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <VirtuosoMessageListLicense licenseKey="">
      <VirtuosoMessageList<Message, null>
        ref={listRef}
        style={{ height: 500 }}
        data={data}
        computeItemKey={({ data }) => data.key}
        ItemContent={ItemContent}
        initialLocation={{ index: 'LAST', align: 'end' }}
      />
    </VirtuosoMessageListLicense>
  );
}
