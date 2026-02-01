import { useState } from 'react';
import { Plus, Filter, MoreVertical, Calendar, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Group, Task, TaskPriority, TaskStatus, UserRole } from '../../types';
import { useTaskStore } from '../../stores/taskStore';
import { useGroupStore } from '../../stores/groupStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { useNotificationStore } from '../../stores/notificationStore';

interface GroupTasksTabProps {
  group: Group;
}

export function GroupTasksTab({ group }: GroupTasksTabProps) {
  const { user } = useAuthStore();
  const { getGroupMembers } = useGroupStore();
  const { getGroupTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { addToast } = useToastStore();
  const { addNotification } = useNotificationStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    priority: 'medium' as TaskPriority,
    deadline: '',
  });

  const tasks = getGroupTasks(group.id);
  const members = getGroupMembers(group.id);
  const isOwner = user?.id === group.owner_id;

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTask = addTask({
        group_id: group.id,
        title: formData.title,
        description: formData.description,
        assignee_id: formData.assignee_id || undefined,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
        created_by: user?.id,
        status: 'pending',
      });

      if (formData.assignee_id) {
        addNotification({
          user_id: formData.assignee_id,
          group_id: group.id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to: ${formData.title}`,
          send_email: true,
          send_sms: false,
          email_sent: false,
          sms_sent: false,
        });
      }

      addToast('success', 'Task created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      addToast('error', 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    updateTask(taskId, { status });

    if (status === 'completed' && task?.assignee_id) {
      addNotification({
        user_id: task.assignee_id,
        group_id: group.id,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${task.title}" has been marked as completed`,
        send_email: true,
        send_sms: false,
        email_sent: false,
        sms_sent: false,
      });
    }

    addToast('success', 'Task status updated');
    setIsMenuOpen(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    deleteTask(taskId);
    addToast('success', 'Task deleted');
    setIsMenuOpen(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignee_id: '',
      priority: 'medium',
      deadline: '',
    });
  };

  const priorityColors: Record<TaskPriority, 'default' | 'warning' | 'error'> = {
    low: 'default',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  };

  const statusColors: Record<TaskStatus, 'default' | 'warning' | 'success'> = {
    pending: 'default',
    in_progress: 'warning',
    review: 'warning',
    completed: 'success',
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Tasks ({tasks.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="px-3 py-1.5 border-2 border-black text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                className="px-3 py-1.5 border-2 border-black text-sm"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-4 border-2 border-nostalgic-200 hover:bg-nostalgic-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant={priorityColors[task.priority]} size="sm">
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={statusColors[task.status]} size="sm">
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-nostalgic-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-nostalgic-600">
                      {task.assignee_id && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {members.find((m) => m.user_id === task.assignee_id)?.user?.full_name || task.assignee_id}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="px-3 py-1.5 border-2 border-black text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMenuOpen(
                          isMenuOpen === task.id ? null : task.id
                        )}
                      >
                        <MoreVertical size={18} />
                      </Button>

                      {isMenuOpen === task.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-lg z-10">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setFormData({
                                title: task.title,
                                description: task.description || '',
                                assignee_id: task.assignee_id || '',
                                priority: task.priority,
                                deadline: task.deadline || '',
                              });
                              setIsEditModalOpen(true);
                              setIsMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 text-sm"
                          >
                            Edit Task
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                          >
                            Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-nostalgic-600 mb-4">Create tasks to track your group's work</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create First Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={selectedTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleCreateTask}>
          <div className="space-y-4">
            <Input
              label="Task Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Assign To</label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {member.user?.full_name || member.user_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">{selectedTask ? 'Update Task' : 'Create Task'}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
