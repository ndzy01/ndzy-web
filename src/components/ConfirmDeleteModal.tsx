import React from 'react';
import Dialog from 'rc-dialog';
import './ConfirmDeleteModal.css';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  todo: Todo | null;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  todo,
  loading = false
}) => {
  return (
    <Dialog
      prefixCls="confirm-delete-dialog"
      visible={isOpen}
      onClose={onClose}
      closable={true}
      closeIcon={<span>✕</span>}
      title={
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#dc2626'
        }}>
          🗑️ 确认删除
        </div>
      }
      width={420}
      style={{ maxWidth: '95vw' }}
      styles={{
        body: { padding: '0' }
      }}
    >
      <div className="confirm-delete-container">
        <div className="confirm-delete-content">
          <p className="confirm-delete-message">
            确定要删除这个 Todo 吗？
          </p>
          
          {todo && (
            <div className="confirm-delete-todo-info">
              <div className="todo-info-item">
                <strong>标题：</strong>
                <span>{todo.title}</span>
              </div>
              {todo.description && (
                <div className="todo-info-item">
                  <strong>描述：</strong>
                  <span>{todo.description}</span>
                </div>
              )}
              <div className="todo-info-item">
                <strong>优先级：</strong>
                <span>
                  {todo.priority === 'high' && '🔴 高优先级'}
                  {todo.priority === 'medium' && '🟡 中优先级'}
                  {todo.priority === 'low' && '🟢 低优先级'}
                </span>
              </div>
            </div>
          )}

          <div className="confirm-delete-warning">
            ⚠️ 此操作不可撤销，请谨慎操作！
          </div>
        </div>

        <div className="confirm-delete-buttons">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`confirm-delete-button confirm-delete-button-cancel ${loading ? 'confirm-delete-button-disabled' : ''}`}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`confirm-delete-button confirm-delete-button-danger ${loading ? 'confirm-delete-button-disabled' : ''}`}
          >
            {loading ? '删除中...' : '确认删除'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteModal;