import React, { useState, useEffect } from 'react';
import { 
  createTodo, 
  getAllTodos, 
  updateTodo, 
  deleteTodo,
  initDatabase 
} from '../lib/database';
import TodoModal from '../components/TodoModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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

const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 弹窗相关状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // 确认删除弹窗状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 筛选状态
  const [filters, setFilters] = useState({
    status: 'all', // all, completed, pending
    priority: 'all', // all, high, medium, low
    timeRange: 'all', // all, today, thisWeek, thisMonth, overdue, custom
    customStartDate: '',
    customEndDate: ''
  });

  useEffect(() => {
    loadTodos();
    // 初始化数据库表
    initDatabase().catch(err => {
      console.error('数据库初始化失败:', err);
    });
  }, []);

  // 筛选逻辑
  useEffect(() => {
    let filtered = [...todos];

    // 按状态筛选
    if (filters.status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filters.status === 'pending') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // 按优先级筛选
    if (filters.priority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // 按时间筛选
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(todo => {
        if (!todo.due_date) return filters.timeRange === 'all';
        
        const dueDate = new Date(todo.due_date);
        
        switch (filters.timeRange) {
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return dueDate >= today && dueDate < tomorrow;
          
          case 'thisWeek':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            return dueDate >= startOfWeek && dueDate < endOfWeek;
          
          case 'thisMonth':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            return dueDate >= startOfMonth && dueDate < endOfMonth;
          
          case 'overdue':
            return dueDate < today && !todo.completed;
          
          case 'custom':
            if (filters.customStartDate && filters.customEndDate) {
              const startDate = new Date(filters.customStartDate);
              const endDate = new Date(filters.customEndDate);
              endDate.setHours(23, 59, 59, 999); // 包含结束日期的整天
              return dueDate >= startDate && dueDate <= endDate;
            }
            return true;
          
          default:
            return true;
        }
      });
    }

    setFilteredTodos(filtered);
  }, [todos, filters]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const allTodos = await getAllTodos();
      setTodos(allTodos as Todo[]);
    } catch (err) {
      console.error('加载 Todos 失败:', err);
      setError('加载 Todos 失败');
    } finally {
      setLoading(false);
    }
  };

  // 弹窗处理函数
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setModalMode('edit');
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const handleSaveTodo = async (todoData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) => {
    try {
      const dueDate = todoData.dueDate ? new Date(todoData.dueDate) : undefined;
      
      if (modalMode === 'create') {
        // 创建新Todo
        const createdTodo = await createTodo(
          todoData.title.trim(),
          todoData.description.trim() || undefined,
          todoData.priority,
          dueDate
        );
        setTodos(prev => [createdTodo as Todo, ...prev]);
      } else {
        // 编辑已有Todo
        if (!editingTodo) return;
        
        const updatedTodo = await updateTodo(editingTodo.id, {
          title: todoData.title.trim(),
          description: todoData.description.trim() || undefined,
          priority: todoData.priority,
          dueDate: dueDate
        });
        
        if (updatedTodo) {
          setTodos(prev => prev.map(t => 
            t.id === editingTodo.id ? updatedTodo as Todo : t
          ));
        }
      }
    } catch (err) {
      console.error('保存 Todo 失败:', err);
      throw err; // 重新抛出错误，让弹窗组件处理
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed
      });
      
      if (updatedTodo) {
        setTodos(prev => prev.map(t => 
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        ));
      }
    } catch (err) {
      console.error('更新 Todo 状态失败:', err);
      setError('更新 Todo 状态失败');
    }
  };

  // 打开删除确认弹窗
  const handleOpenDeleteModal = (todo: Todo) => {
    setDeletingTodo(todo);
    setIsDeleteModalOpen(true);
  };

  // 关闭删除确认弹窗
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTodo(null);
    setDeleteLoading(false);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingTodo) return;

    setDeleteLoading(true);
    try {
      await deleteTodo(deletingTodo.id);
      setTodos(prev => prev.filter(t => t.id !== deletingTodo.id));
      handleCloseDeleteModal();
    } catch (err) {
      console.error('删除 Todo 失败:', err);
      setError('删除 Todo 失败');
      setDeleteLoading(false);
    }
  };

  // 筛选处理函数
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // 如果改变时间范围不是自定义，清空自定义日期
      ...(key === 'timeRange' && value !== 'custom' ? {
        customStartDate: '',
        customEndDate: ''
      } : {})
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      timeRange: 'all',
      customStartDate: '',
      customEndDate: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#777';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };



  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>我的 Todo List</h1>
        <button
          onClick={handleOpenCreateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>➕</span>
          添加 Todo
        </button>
      </div>

      {/* 筛选区域 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, color: '#495057' }}>筛选条件</h3>
          <button
            onClick={handleResetFilters}
            style={{
              padding: '5px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            重置筛选
          </button>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          {/* 状态筛选 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              完成状态
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">全部</option>
              <option value="pending">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          {/* 优先级筛选 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              优先级
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">全部</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>

          {/* 时间范围筛选 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              时间范围
            </label>
            <select
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">全部</option>
              <option value="today">今天</option>
              <option value="thisWeek">本周</option>
              <option value="thisMonth">本月</option>
              <option value="overdue">已逾期</option>
              <option value="custom">自定义范围</option>
            </select>
          </div>

          {/* 自定义时间范围 */}
          {filters.timeRange === 'custom' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  开始日期
                </label>
                <input
                  type="date"
                  value={filters.customStartDate}
                  onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  结束日期
                </label>
                <input
                  type="date"
                  value={filters.customEndDate}
                  onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* 筛选结果统计 */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#495057'
        }}>
          📊 筛选结果：显示 {filteredTodos.length} 项 / 总共 {todos.length} 项
        </div>
      </div>

      {error && (
        <div style={{
          color: 'red',
          backgroundColor: '#fee',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}



      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>加载中...</div>
        </div>
      ) : todos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          还没有任何 Todo，点击上方"添加 Todo"开始创建吧！
        </div>
      ) : filteredTodos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          😔 没有符合筛选条件的 Todo，试试调整筛选条件或者重置筛选
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTodos.map(todo => {
            const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;
            
            return (
              <div
                key={todo.id}
                style={{
                  padding: '15px',
                  backgroundColor: todo.completed ? '#f8f9fa' : isOverdue ? '#fff5f5' : 'white',
                  border: `1px solid ${isOverdue ? '#feb2b2' : '#ddd'}`,
                  borderRadius: '8px',
                  opacity: todo.completed ? 0.7 : 1,
                  boxShadow: isOverdue ? '0 2px 4px rgba(220, 53, 69, 0.1)' : 'none'
                }}
              >
          
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  style={{
                    marginTop: '3px',
                    transform: 'scale(1.2)',
                    cursor: 'pointer'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#666' : '#333'
                  }}>
                    {todo.title}
                  </h3>
                  
                  {todo.description && (
                    <p style={{
                      margin: '0 0 8px 0',
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {todo.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px' }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: getPriorityColor(todo.priority),
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getPriorityLabel(todo.priority)}优先级
                    </span>
                    
                    {todo.due_date && (
                      <span style={{ color: '#666' }}>
                        📅 {new Date(todo.due_date).toLocaleString('zh-CN')}
                      </span>
                    )}
                    
                    <span style={{ color: '#999' }}>
                      创建于 {new Date(todo.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEditModal(todo)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>✏️</span>
                    编辑
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(todo)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>🗑️</span>
                    删除
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Todo编辑弹窗 */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTodo}
        todo={editingTodo}
        mode={modalMode}
      />
      
      {/* 删除确认弹窗 */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        todo={deletingTodo}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TodoListPage;