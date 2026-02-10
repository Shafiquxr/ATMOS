import { create } from 'zustand';
import { Task, TaskComment, TaskAttachment } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const TASKS_STORAGE_KEY = 'atmos_tasks';
const TASK_COMMENTS_STORAGE_KEY = 'atmos_task_comments';

interface TaskState {
    tasks: Task[];
    currentTask: Task | null;
    comments: TaskComment[];
    isLoading: boolean;
    error: string | null;

    // Task actions
    fetchTasks: (groupId: string) => Promise<void>;
    fetchTaskById: (taskId: string) => Promise<Task | null>;
    createTask: (task: Partial<Task>) => Promise<Task>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    updateTaskStatus: (taskId: string, status: string) => Promise<void>;

    // Comment actions
    fetchComments: (taskId: string) => Promise<void>;
    addComment: (taskId: string, userId: string, comment: string) => Promise<TaskComment>;

    // Utility
    getTasksByGroup: (groupId: string) => Task[];
    getTasksByAssignee: (userId: string) => Task[];
    getTaskStats: (groupId: string) => { total: number; completed: number; pending: number; inProgress: number };
}

const loadTasksFromStorage = (): Task[] => {
    return storageGet<Task[]>(TASKS_STORAGE_KEY, []);
};

const loadCommentsFromStorage = (): TaskComment[] => {
    return storageGet<TaskComment[]>(TASK_COMMENTS_STORAGE_KEY, []);
};

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    currentTask: null,
    comments: [],
    isLoading: false,
    error: null,

    fetchTasks: async (groupId: string) => {
        set({ isLoading: true });
        try {
            const allTasks = loadTasksFromStorage();
            const groupTasks = allTasks.filter((t) => t.group_id === groupId);
            set({ tasks: groupTasks });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ error: 'Failed to fetch tasks' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTaskById: async (taskId: string) => {
        try {
            const tasks = loadTasksFromStorage();
            const task = tasks.find((t) => t.id === taskId) || null;
            if (task) {
                set({ currentTask: task });
            }
            return task;
        } catch (error) {
            console.error('Failed to fetch task:', error);
            return null;
        }
    },

    createTask: async (taskData: Partial<Task>) => {
        set({ isLoading: true });
        try {
            const { useAuthStore } = await import('./authStore');
            const currentUser = useAuthStore.getState().user;

            const tasks = loadTasksFromStorage();
            const newTask: Task = {
                id: generateUniqueId(),
                group_id: taskData.group_id || '',
                sub_group_id: taskData.sub_group_id,
                title: taskData.title || 'New Task',
                description: taskData.description,
                assignee_id: taskData.assignee_id,
                created_by: currentUser?.id,
                status: 'pending',
                priority: taskData.priority || 'medium',
                deadline: taskData.deadline,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const updatedTasks = [...tasks, newTask];
            storageSet(TASKS_STORAGE_KEY, updatedTasks);
            set({ tasks: updatedTasks.filter((t) => t.group_id === newTask.group_id) });

            return newTask;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTask: async (taskId: string, updates: Partial<Task>) => {
        try {
            const tasks = loadTasksFromStorage();
            const updatedTasks = tasks.map((t) =>
                t.id === taskId
                    ? { ...t, ...updates, updated_at: new Date().toISOString() }
                    : t
            );
            storageSet(TASKS_STORAGE_KEY, updatedTasks);

            const currentGroupId = get().tasks[0]?.group_id;
            if (currentGroupId) {
                set({ tasks: updatedTasks.filter((t) => t.group_id === currentGroupId) });
            }

            if (get().currentTask?.id === taskId) {
                set({ currentTask: updatedTasks.find((t) => t.id === taskId) });
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    },

    deleteTask: async (taskId: string) => {
        try {
            const tasks = loadTasksFromStorage();
            const updatedTasks = tasks.filter((t) => t.id !== taskId);
            storageSet(TASKS_STORAGE_KEY, updatedTasks);

            const currentGroupId = get().tasks[0]?.group_id;
            if (currentGroupId) {
                set({ tasks: updatedTasks.filter((t) => t.group_id === currentGroupId) });
            }

            if (get().currentTask?.id === taskId) {
                set({ currentTask: null });
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    },

    updateTaskStatus: async (taskId: string, status: string) => {
        await get().updateTask(taskId, {
            status: status as any,
            completed_at: status === 'completed' ? new Date().toISOString() : undefined,
        });
    },

    fetchComments: async (taskId: string) => {
        try {
            const allComments = loadCommentsFromStorage();
            const taskComments = allComments.filter((c) => c.task_id === taskId);
            set({ comments: taskComments });
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    },

    addComment: async (taskId: string, userId: string, comment: string) => {
        const comments = loadCommentsFromStorage();
        const newComment: TaskComment = {
            id: generateUniqueId(),
            task_id: taskId,
            user_id: userId,
            comment,
            created_at: new Date().toISOString(),
        };

        const updatedComments = [...comments, newComment];
        storageSet(TASK_COMMENTS_STORAGE_KEY, updatedComments);
        set({ comments: updatedComments.filter((c) => c.task_id === taskId) });

        return newComment;
    },

    getTasksByGroup: (groupId: string) => {
        const tasks = loadTasksFromStorage();
        return tasks.filter((t) => t.group_id === groupId);
    },

    getTasksByAssignee: (userId: string) => {
        const tasks = loadTasksFromStorage();
        return tasks.filter((t) => t.assignee_id === userId);
    },

    getTaskStats: (groupId: string) => {
        const tasks = loadTasksFromStorage().filter((t) => t.group_id === groupId);
        return {
            total: tasks.length,
            completed: tasks.filter((t) => t.status === 'completed').length,
            pending: tasks.filter((t) => t.status === 'pending').length,
            inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        };
    },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
    if (event.key === TASKS_STORAGE_KEY) {
        // Refresh data on storage change
    }
});
