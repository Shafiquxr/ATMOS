import { create } from 'zustand';
import { Task, TaskComment, TaskAttachment } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const TASKS_STORAGE_KEY = 'atmos_tasks';
const COMMENTS_STORAGE_KEY = 'atmos_task_comments';
const ATTACHMENTS_STORAGE_KEY = 'atmos_task_attachments';

interface TaskState {
  tasks: Task[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getGroupTasks: (groupId: string) => Task[];
  getUserTasks: (userId: string) => Task[];
  
  addComment: (comment: Omit<TaskComment, 'id' | 'created_at'>) => TaskComment;
  deleteComment: (commentId: string) => void;
  getTaskComments: (taskId: string) => TaskComment[];
  
  addAttachment: (attachment: Omit<TaskAttachment, 'id' | 'uploaded_at'>) => TaskAttachment;
  deleteAttachment: (attachmentId: string) => void;
  getTaskAttachments: (taskId: string) => TaskAttachment[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const loadTasksFromStorage = (): Task[] => {
  return storageGet<Task[]>(TASKS_STORAGE_KEY, []);
};

const loadCommentsFromStorage = (): TaskComment[] => {
  return storageGet<TaskComment[]>(COMMENTS_STORAGE_KEY, []);
};

const loadAttachmentsFromStorage = (): TaskAttachment[] => {
  return storageGet<TaskAttachment[]>(ATTACHMENTS_STORAGE_KEY, []);
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadTasksFromStorage(),
  comments: loadCommentsFromStorage(),
  attachments: loadAttachmentsFromStorage(),
  isLoading: false,

  setTasks: (tasks) => {
    set({ tasks });
    storageSet(TASKS_STORAGE_KEY, tasks);
  },

  addTask: (taskData) => {
    const newTask: Task = {
      id: generateUniqueId(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedTasks = [...get().tasks, newTask];
    set({ tasks: updatedTasks });
    storageSet(TASKS_STORAGE_KEY, updatedTasks);

    return newTask;
  },

  updateTask: (id, updates) => {
    const updatedTasks = get().tasks.map((t) => 
      t.id === id 
        ? { 
            ...t, 
            ...updates, 
            updated_at: new Date().toISOString(),
            completed_at: updates.status === 'completed' && t.status !== 'completed'
              ? new Date().toISOString()
              : t.completed_at
          } 
        : t
    );
    
    set({ tasks: updatedTasks });
    storageSet(TASKS_STORAGE_KEY, updatedTasks);
  },

  deleteTask: (id) => {
    const updatedTasks = get().tasks.filter((t) => t.id !== id);
    const updatedComments = get().comments.filter((c) => c.task_id !== id);
    const updatedAttachments = get().attachments.filter((a) => a.task_id !== id);

    set({ 
      tasks: updatedTasks,
      comments: updatedComments,
      attachments: updatedAttachments
    });

    storageSet(TASKS_STORAGE_KEY, updatedTasks);
    storageSet(COMMENTS_STORAGE_KEY, updatedComments);
    storageSet(ATTACHMENTS_STORAGE_KEY, updatedAttachments);
  },

  getGroupTasks: (groupId) => {
    return get().tasks.filter((t) => t.group_id === groupId);
  },

  getUserTasks: (userId) => {
    return get().tasks.filter((t) => t.assignee_id === userId);
  },

  addComment: (commentData) => {
    const newComment: TaskComment = {
      id: generateUniqueId(),
      ...commentData,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...get().comments, newComment];
    set({ comments: updatedComments });
    storageSet(COMMENTS_STORAGE_KEY, updatedComments);

    return newComment;
  },

  deleteComment: (commentId) => {
    const updatedComments = get().comments.filter((c) => c.id !== commentId);
    set({ comments: updatedComments });
    storageSet(COMMENTS_STORAGE_KEY, updatedComments);
  },

  getTaskComments: (taskId) => {
    return get().comments.filter((c) => c.task_id === taskId);
  },

  addAttachment: (attachmentData) => {
    const newAttachment: TaskAttachment = {
      id: generateUniqueId(),
      ...attachmentData,
      uploaded_at: new Date().toISOString(),
    };

    const updatedAttachments = [...get().attachments, newAttachment];
    set({ attachments: updatedAttachments });
    storageSet(ATTACHMENTS_STORAGE_KEY, updatedAttachments);

    return newAttachment;
  },

  deleteAttachment: (attachmentId) => {
    const updatedAttachments = get().attachments.filter((a) => a.id !== attachmentId);
    set({ attachments: updatedAttachments });
    storageSet(ATTACHMENTS_STORAGE_KEY, updatedAttachments);
  },

  getTaskAttachments: (taskId) => {
    return get().attachments.filter((a) => a.task_id === taskId);
  },

  loadFromStorage: () => {
    set({
      tasks: loadTasksFromStorage(),
      comments: loadCommentsFromStorage(),
      attachments: loadAttachmentsFromStorage(),
    });
  },

  saveToStorage: () => {
    const { tasks, comments, attachments } = get();
    storageSet(TASKS_STORAGE_KEY, tasks);
    storageSet(COMMENTS_STORAGE_KEY, comments);
    storageSet(ATTACHMENTS_STORAGE_KEY, attachments);
  },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
  if (
    event.key === TASKS_STORAGE_KEY ||
    event.key === COMMENTS_STORAGE_KEY ||
    event.key === ATTACHMENTS_STORAGE_KEY
  ) {
    useTaskStore.getState().loadFromStorage();
  }
});
