import { neon } from '@neondatabase/serverless';

// Neon 数据库连接
const DATABASE_URL = 'postgresql://neondb_owner:npg_NJw7fPB9vQGu@ep-soft-smoke-ahjxdxvc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);

// 数据库初始化函数
export async function initDatabase() {
  try {
    // 创建简化的 TodoList 表（使用数据库生成的 UUID 作为主键）
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'medium',
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建索引以提高查询性能
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)`;

    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// Todo 相关数据库操作
export async function createTodo(title: string, description?: string, priority: string = 'medium', dueDate?: Date) {
  try {
    const result = await sql`
      INSERT INTO todos (title, description, priority, due_date)
      VALUES (${title}, ${description || null}, ${priority}, ${dueDate || null})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('创建 Todo 失败:', error);
    throw error;
  }
}

export async function getAllTodos() {
  try {
    const result = await sql`
      SELECT * FROM todos
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('获取 Todos 失败:', error);
    throw error;
  }
}

export async function updateTodo(todoId: string, updates: {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: Date;
}) {
  try {
    // 构建更新查询
    if (updates.title !== undefined) {
      await sql`UPDATE todos SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP WHERE id = ${todoId}`;
    }
    if (updates.description !== undefined) {
      await sql`UPDATE todos SET description = ${updates.description}, updated_at = CURRENT_TIMESTAMP WHERE id = ${todoId}`;
    }
    if (updates.completed !== undefined) {
      await sql`UPDATE todos SET completed = ${updates.completed}, updated_at = CURRENT_TIMESTAMP WHERE id = ${todoId}`;
    }
    if (updates.priority !== undefined) {
      await sql`UPDATE todos SET priority = ${updates.priority}, updated_at = CURRENT_TIMESTAMP WHERE id = ${todoId}`;
    }
    if (updates.dueDate !== undefined) {
      await sql`UPDATE todos SET due_date = ${updates.dueDate}, updated_at = CURRENT_TIMESTAMP WHERE id = ${todoId}`;
    }
    
    // 返回更新后的记录
    const result = await sql`
      SELECT * FROM todos
      WHERE id = ${todoId}
    `;
    
    return result[0];
  } catch (error) {
    console.error('更新 Todo 失败:', error);
    throw error;
  }
}

export async function deleteTodo(todoId: string) {
  try {
    const result = await sql`
      DELETE FROM todos
      WHERE id = ${todoId}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('删除 Todo 失败:', error);
    throw error;
  }
}