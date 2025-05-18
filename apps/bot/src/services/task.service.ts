import { supabase } from '../db/supabaseClient';

export type Task = {
  id: string;
  title: string;
  due_date?: string;
  status: string;
  priority?: string;
  category_id?: string;
  project_id?: string;
  assignee_id?: string;
  created_at?: string;
};

export class TaskService {
  static async addTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single();
    if (error) throw error;
    return data;
  }

  static async listTasks(filter: Partial<Pick<Task, 'status' | 'assignee_id' | 'project_id' | 'category_id'>> = {}) {
    let query = supabase.from('tasks').select('*');
    if (filter.status) query = query.eq('status', filter.status);
    if (filter.assignee_id) query = query.eq('assignee_id', filter.assignee_id);
    if (filter.project_id) query = query.eq('project_id', filter.project_id);
    if (filter.category_id) query = query.eq('category_id', filter.category_id);
    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async updateTaskStatus(id: string, status: string) {
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // 他のCRUDメソッドも必要に応じて追加
} 