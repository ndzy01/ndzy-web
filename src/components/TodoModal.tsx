import React, { useState, useEffect } from 'react';
import Dialog from 'rc-dialog';
import './TodoModal.css';

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

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) => Promise<void>;
  todo?: Todo | null; // 如果是编辑模式，传入todo数据
  mode: 'create' | 'edit';
}

const TodoModal: React.FC<TodoModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  todo, 
  mode 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 当弹窗打开或todo数据变化时，初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && todo) {
        setFormData({
          title: todo.title,
          description: todo.description || '',
          priority: todo.priority,
          dueDate: todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: ''
        });
      }
      setError('');
    }
  }, [isOpen, todo, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('标题不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('保存失败:', err);
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <Dialog
        prefixCls="todo-dialog"
        visible={isOpen}
        onClose={onClose}
        closable={true}
        closeIcon={<span>✕</span>}
        title={
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {mode === 'create' ? '📝 添加新Todo' : '✏️ 编辑Todo'}
          </div>
        }
        width={520}
        style={{ maxWidth: '95vw' }}

        styles={{
          body: { padding: '0' }
        }}
      >

        <div className="todo-form-container">
          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            {/* 标题 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                标题 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="输入Todo标题..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                描述
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="添加详细描述..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* 响应式布局 - 优先级和截止日期 */}
            <div className="todo-form-row">
              {/* 优先级 */}
              <div className="todo-form-row-item">
                <label className="todo-form-label">
                  优先级
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="todo-form-input todo-form-select"
                >
                  <option value="low">🟢 低优先级</option>
                  <option value="medium">🟡 中优先级</option>
                  <option value="high">🔴 高优先级</option>
                </select>
              </div>

              {/* 截止日期 */}
              <div className="todo-form-row-item">
                <label className="todo-form-label">
                  截止时间
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="todo-form-input"
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="todo-error-message">
                ⚠️ {error}
              </div>
            )}

            {/* 按钮组 */}
            <div className="todo-button-group">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={`todo-button todo-button-secondary ${loading ? 'todo-button-disabled' : ''}`}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`todo-button ${loading ? 'todo-button-loading' : 'todo-button-primary'} ${loading ? 'todo-button-disabled' : ''}`}
              >
                {loading ? '保存中...' : (mode === 'create' ? '创建' : '保存')}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default TodoModal;