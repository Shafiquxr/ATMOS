import { Users, Wallet, ClipboardList, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Group } from '../../types';
import { Link } from 'react-router-dom';

interface GroupCardProps {
  group: Group;
  memberCount?: number;
  balance?: number;
  pendingTasks?: number;
  userRole?: string;
}

export function GroupCard({
  group,
  memberCount = 0,
  balance = 0,
  pendingTasks = 0,
  userRole = 'member'
}: GroupCardProps) {
  const roleColors: Record<string, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
    owner: 'error',
    organizer: 'warning',
    team_lead: 'info',
    finance_rep: 'success',
    member: 'default',
  };

  return (
    <Link to={`/groups/${group.id}`}>
      <Card hover className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{group.name}</CardTitle>
            <Badge variant={roleColors[userRole] || 'default'} size="sm">
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          {group.category && (
            <p className="text-sm text-nostalgic-600 mt-1 capitalize">{group.category}</p>
          )}
        </CardHeader>

        <CardContent>
          {group.description && (
            <p className="text-sm text-nostalgic-700 mb-4 line-clamp-2">
              {group.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-nostalgic-600" />
              <span className="font-medium">{memberCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-nostalgic-600" />
              <span className="font-medium">₹{balance.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-nostalgic-600" />
              <span className={`font-medium ${pendingTasks > 0 ? 'text-amber-600' : ''}`}>
                {pendingTasks}
              </span>
            </div>
          </div>

          {(group.start_date || group.location) && (
            <div className="mt-4 pt-4 border-t-2 border-nostalgic-200 text-sm text-nostalgic-600">
              {group.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(group.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {group.location && (
                <p className="mt-1 truncate">{group.location}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
