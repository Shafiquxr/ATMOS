import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Calendar, User } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useGroupStore } from '../stores/groupStore';
import { useAuthStore } from '../stores/authStore';

export function TasksPage() {
  const { user } = useAuthStore();
  const { groups, members } = useGroupStore();
  const { getGroupTasks, updateTask } = useTaskStore();
  const { users: allUsers } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  const userGroups = groups.filter((group) => 
    group.owner_id === user?.id || 
    members.some((m) => m.group_id === group.id && (m.user_id === user?.id || m.user_id === user?.email))
  );

  // Get all tasks from all groups
  const allTasks = userGroups.flatMap((group) => getGroupTasks(group.id));

  const filteredTasks = allTasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const getGroupForTask = (taskId: string) => {
    for (const group of groups) {
      const tasks = getGroupTasks(group.id);
      if (tasks.some((t) => t.id === taskId)) {
        return group;
      }
    }
    return null;
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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold">Tasks</h1>
            <p className="text-nostalgic-600 mt-1">
              Manage your tasks across all groups
            </p>
          </div>
          <Link to="/groups">
            <Button>
              <Plus size={20} className="mr-2" />
              Add Task
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
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
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const group = getGroupForTask(task.id);
                  return (
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
                          {group && (
                            <span className="text-nostalgic-600 font-medium">
                              {group.name}
                            </span>
                          )}
                          {task.assignee_id && (
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {allUsers.find(u => u.id === task.assignee_id || u.email === task.assignee_id)?.full_name || 
                               task.assignee_id}
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
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="px-3 py-1.5 border-2 border-black text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>

                        {group && (
                          <Link to={`/groups/${group.id}?tab=tasks`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p className="text-nostalgic-600 mb-4">
                  {filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create tasks in your groups to get started'}
                </p>
                <Link to="/groups">
                  <Button>
                    <Plus size={20} className="mr-2" />
                    Go to Groups
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
