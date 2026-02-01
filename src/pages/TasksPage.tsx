import { useState } from 'react';
import { Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Task, TaskPriority, TaskStatus } from '../types';

export function TasksPage() {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  // Mock tasks
  const mockTasks: Task[] = [
    {
      id: '1',
      group_id: '1',
      title: 'Book venue for conference',
      description: 'Research and book a suitable venue that can accommodate 500+ attendees',
      status: 'in_progress',
      priority: 'high',
      deadline: '2024-03-15T00:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      group_id: '1',
      title: 'Design event posters',
      description: 'Create promotional posters for social media and print',
      status: 'pending',
      priority: 'medium',
      deadline: '2024-03-20T00:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      group_id: '2',
      title: 'Book flights to Paris',
      description: 'Find and book affordable flights for the group',
      status: 'completed',
      priority: 'high',
      deadline: '2024-02-28T00:00:00Z',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      group_id: '2',
      title: 'Create itinerary',
      description: 'Plan daily activities and destinations',
      status: 'review',
      priority: 'medium',
      deadline: '2024-03-10T00:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const filteredTasks = mockTasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: TaskStatus) => {
    const variants: Record<TaskStatus, 'default' | 'warning' | 'info' | 'success'> = {
      pending: 'default',
      in_progress: 'warning',
      review: 'info',
      completed: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants: Record<TaskPriority, 'default' | 'warning' | 'error'> = {
      low: 'default',
      medium: 'default',
      high: 'warning',
      urgent: 'error',
    };
    return <Badge variant={variants[priority]} size="sm">{priority.toUpperCase()}</Badge>;
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold">Tasks</h1>
            <p className="text-nostalgic-600 mt-1">
              Track and manage your assignments
            </p>
          </div>
          <Button>
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
              className="px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{task.title}</CardTitle>
                      {isOverdue(task.deadline) && task.status !== 'completed' && (
                        <AlertCircle size={18} className="text-red-600" />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-nostalgic-600">{task.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-nostalgic-600">
                  {task.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className={isOverdue(task.deadline) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Assigned to {task.assignee.full_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white border-2 border-black shadow-retro-sm">
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p className="text-nostalgic-600 mb-4">
                  No tasks match your current filters
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
