import { create } from 'zustand';
import { Task, TaskComment, TaskAttachment } from '../types';
import { supabase } from '../utils/supabase';
import { generateUniqueId } from '../utils/idGenerator';

interface TaskState {
  tasks: Task[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  fetchGroupTasks: (groupId: string) => Promise<void>;
  fetchUserTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getGroupTasks: (groupId: string) => Task[];
  getUserTasks: (userId: string) => Task[];
  
  fetchTaskComments: (taskId: string) => Promise<void>;
  addComment: (comment: Omit<TaskComment, 'id' | 'created_at'>) => Promise<TaskComment>;
  deleteComment: (commentId: string) => Promise<void>;
  getTaskComments: (taskId: string) => TaskComment[];
  
  fetchTaskAttachments: (taskId: string) => Promise<void>;
  addAttachment: (attachment: Omit<TaskAttachment, 'id' | 'uploaded_at'>) => Promise<TaskAttachment>;
  deleteAttachment: (attachmentId: string) => Promise<void>;
  getTaskAttachments: (taskId: string) => TaskAttachment[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  comments: [],
  attachments: [],
  isLoading: false,

  setTasks: (tasks) => {
    set({ tasks });
  },

  fetchGroupTasks: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const typedTasks: Task[] = (tasks || []).map(t => ({
        id: t.id,
        group_id: t.group_id,
        sub_group_id: t.sub_group_id,
        title: t.title,
        description: t.description,
        assignee_id: t.assignee_id,
        created_by: t.created_by,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        completed_at: t.completed_at,
        proof_url: t.proof_url,
        created_at: t.created_at,
        updated_at: t.updated_at,
        assignee: t.assignee,
        creator: t.creator,
      }));

      set({ tasks: typedTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserTasks: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .eq('assignee_id', userId);

      if (error) throw error;

      const typedTasks: Task[] = (tasks || []).map(t => ({
        id: t.id,
        group_id: t.group_id,
        sub_group_id: t.sub_group_id,
        title: t.title,
        description: t.description,
        assignee_id: t.assignee_id,
        created_by: t.created_by,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        completed_at: t.completed_at,
        proof_url: t.proof_url,
        created_at: t.created_at,
        updated_at: t.updated_at,
        assignee: t.assignee,
        creator: t.creator,
      }));

      set({ tasks: typedTasks });
    } catch (error) {
      console.error('Failed to fetch user tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (taskData) => {
    set({ isLoading: true });
    try {
      const newTask = {
        id: generateUniqueId(),
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tasks')
        .insert([newTask]);

      if (error) throw error;

      set((state) => ({
        tasks: [...state.tasks, newTask as Task],
      }));

      return newTask as Task;
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: updatedAt })
        .eq('id', id);

      if (error) throw error;

      const { data: updatedTask, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(*),
          creator:users!tasks_created_by_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (updatedTask) {
        const typedTask: Task = {
          id: updatedTask.id,
          group_id: updatedTask.group_id,
          sub_group_id: updatedTask.sub_group_id,
          title: updatedTask.title,
          description: updatedTask.description,
          assignee_id: updatedTask.assignee_id,
          created_by: updatedTask.created_by,
          status: updatedTask.status,
          priority: updatedTask.priority,
          deadline: updatedTask.deadline,
          completed_at: updatedTask.completed_at,
          proof_url: updatedTask.proof_url,
          created_at: updatedTask.created_at,
          updated_at: updatedTask.updated_at,
          assignee: updatedTask.assignee,
          creator: updatedTask.creator,
        };

        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? typedTask : t),
        }));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getGroupTasks: (groupId) => {
    return get().tasks.filter((t) => t.group_id === groupId);
  },

  getUserTasks: (userId) => {
    return get().tasks.filter((t) => t.assignee_id === userId);
  },

  fetchTaskComments: async (taskId: string) => {
    set({ isLoading: true });
    try {
      const { data: comments, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('task_id', taskId);

      if (error) throw error;

      const typedComments: TaskComment[] = (comments || []).map(c => ({
        id: c.id,
        task_id: c.task_id,
        user_id: c.user_id,
        comment: c.comment,
        created_at: c.created_at,
        user: c.user,
      }));

      set({ comments: typedComments });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (commentData) => {
    set({ isLoading: true });
    try {
      const newComment = {
        id: generateUniqueId(),
        ...commentData,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('task_comments')
        .insert([newComment]);

      if (error) throw error;

      set((state) => ({
        comments: [...state.comments, newComment as TaskComment],
      }));

      return newComment as TaskComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteComment: async (commentId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
      }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getTaskComments: (taskId) => {
    return get().comments.filter((c) => c.task_id === taskId);
  },

  fetchTaskAttachments: async (taskId: string) => {
    set({ isLoading: true });
    try {
      const { data: attachments, error } = await supabase
        .from('task_attachments')
        .select(`
          *,
          uploader:users(*)
        `)
        .eq('task_id', taskId);

      if (error) throw error;

      const typedAttachments: TaskAttachment[] = (attachments || []).map(a => ({
        id: a.id,
        task_id: a.task_id,
        file_url: a.file_url,
        file_name: a.file_name,
        file_size: a.file_size,
        uploaded_by: a.uploaded_by,
        uploaded_at: a.uploaded_at,
        uploader: a.uploader,
      }));

      set({ attachments: typedAttachments });
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addAttachment: async (attachmentData) => {
    set({ isLoading: true });
    try {
      const newAttachment = {
        id: generateUniqueId(),
        ...attachmentData,
        uploaded_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('task_attachments')
        .insert([newAttachment]);

      if (error) throw error;

      set((state) => ({
        attachments: [...state.attachments, newAttachment as TaskAttachment],
      }));

      return newAttachment as TaskAttachment;
    } catch (error) {
      console.error('Failed to add attachment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAttachment: async (attachmentId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      set((state) => ({
        attachments: state.attachments.filter((a) => a.id !== attachmentId),
      }));
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getTaskAttachments: (taskId) => {
    return get().attachments.filter((a) => a.task_id === taskId);
  },
}));