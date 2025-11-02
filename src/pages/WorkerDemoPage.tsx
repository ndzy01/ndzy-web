import React from 'react';
import WorkerDemo from '../components/worker-demo';

const WorkerDemoPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Worker Demo</h1>
      <WorkerDemo />
    </div>
  );
};

export default WorkerDemoPage;