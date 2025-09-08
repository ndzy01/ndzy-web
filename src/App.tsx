import { useSetState } from 'ahooks';
import './App.css';
import LiveChat from './components/LiveChat';
import WorkerDemo from './components/worker-demo';
import LiveChat1 from './components/LiveChat1';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

interface State {
  showLiveChat: boolean;
  showLiveChat1: boolean;
  showWorkerDemo: boolean;
  openDialog: boolean;
}
const App = () => {
  const [state, setState] = useSetState<State>({
    showLiveChat: false,
    showLiveChat1: false,
    showWorkerDemo: false,
    openDialog: false,
  });
  const handleClick = (key: keyof State) => {
    setState({ [key]: !state[key] } as Pick<State, keyof State>);
  };
  const handleText = (key: keyof State) => {
    return state[key] ? '展示中' : '已隐藏';
  };

  return (
    <>
      <div
        style={{
          padding: 16,
          display: 'flex',
          gap: 8,
          '--border-width': '8px',
          '--border-radius': '24px',
          height: 36,
        }}
        className="border-box"
      >
        {(Object.keys(state) as Array<keyof State>).map((k, i) => (
          <button key={i} onClick={() => handleClick(k)}>
            {k} {handleText(k)}
          </button>
        ))}
      </div>

      {state.showLiveChat && <LiveChat />}
      {state.showLiveChat1 && <LiveChat1 />}
      {state.showWorkerDemo && <WorkerDemo />}
      <button onClick={() => setState({ openDialog: true })}>打开对话框</button>
      {state.openDialog && (
        <Dialog
          title={'111'}
          onClose={() => setState({ openDialog: false })}
          visible={state.openDialog}
        >
          <p>first dialog</p>
        </Dialog>
      )}
    </>
  );
};

export default App;
