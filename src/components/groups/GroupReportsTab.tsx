import { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, CheckCircle, Wallet as WalletIcon, Calendar, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Group } from '../../types';
import { useGroupStore } from '../../stores/groupStore';
import { useTaskStore } from '../../stores/taskStore';
import { useWalletStore } from '../../stores/walletStore';
import { useBookingStore } from '../../stores/bookingStore';
import { formatCurrency } from '../../utils/security';

interface GroupReportsTabProps {
  group: Group;
}

interface ReportData {
  members: any[];
  tasks: any[];
  wallet: any;
  transactions: any[];
  bookings: any[];
  completedTasks: any[];
  pendingTasks: any[];
  confirmedBookings: any[];
  totalBookingAmount: number;
}

export function GroupReportsTab({ group }: GroupReportsTabProps) {
  const { getGroupMembers } = useGroupStore();
  const { getGroupTasks } = useTaskStore();
  const { fetchGroupWallet: getGroupWallet, getGroupTransactions } = useWalletStore();
  const { getGroupBookings } = useBookingStore();

  const [selectedReport, setSelectedReport] = useState<string>('summary');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        
        const members = getGroupMembers(group.id);
        const tasks = getGroupTasks(group.id);
        const wallet = await getGroupWallet(group.id);
        const transactions = getGroupTransactions(group.id);
        const bookings = getGroupBookings(group.id);

        const completedTasks = tasks.filter((t) => t.status === 'completed');
        const pendingTasks = tasks.filter((t) => t.status !== 'completed');
        const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
        const totalBookingAmount = bookings.reduce((sum, b) => sum + b.amount, 0);

        setReportData({
          members,
          tasks,
          wallet,
          transactions,
          bookings,
          completedTasks,
          pendingTasks,
          confirmedBookings,
          totalBookingAmount,
        });
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [group, getGroupMembers, getGroupTasks, getGroupWallet, getGroupTransactions, getGroupBookings]);

  if (isLoading || !reportData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const { members, tasks, wallet, transactions, bookings, completedTasks, pendingTasks, confirmedBookings, totalBookingAmount } = reportData;

  const handleExportReport = (reportType: string) => {
    let csvContent = '';

    if (reportType === 'summary') {
      csvContent = `Group Report: ${group.name}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      csvContent += `Members,${members.length}\n`;
      csvContent += `Tasks,${tasks.length}\n`;
      csvContent += `Completed Tasks,${completedTasks.length}\n`;
      csvContent += `Pending Tasks,${pendingTasks.length}\n`;
      csvContent += `Total Balance,${formatCurrency(wallet?.balance || 0)}\n`;
      csvContent += `Escrow Balance,${formatCurrency(wallet?.escrow_balance || 0)}\n`;
      csvContent += `Total Bookings,${bookings.length}\n`;
      csvContent += `Total Booking Value,${formatCurrency(totalBookingAmount)}\n`;
    } else if (reportType === 'financial') {
      csvContent = `Financial Report: ${group.name}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      csvContent += `Date,Type,Description,Amount,Status\n`;
      transactions.forEach((t) => {
        csvContent += `${new Date(t.created_at).toLocaleDateString()},${t.type},${t.description},${t.amount},${t.status}\n`;
      });
    } else if (reportType === 'tasks') {
      csvContent = `Task Report: ${group.name}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      csvContent += `Task,Status,Priority,Deadline\n`;
      tasks.forEach((t) => {
        csvContent += `${t.title},${t.status},${t.priority},${t.deadline || 'N/A'}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${group.name.replace(/\s+/g, '_')}_${reportType}_report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedReport === 'summary' ? 'primary' : 'outline'}
              onClick={() => setSelectedReport('summary')}
            >
              <FileText size={18} className="mr-2" />
              Summary
            </Button>
            <Button
              variant={selectedReport === 'financial' ? 'primary' : 'outline'}
              onClick={() => setSelectedReport('financial')}
            >
              <WalletIcon size={18} className="mr-2" />
              Financial
            </Button>
            <Button
              variant={selectedReport === 'tasks' ? 'primary' : 'outline'}
              onClick={() => setSelectedReport('tasks')}
            >
              <CheckCircle size={18} className="mr-2" />
              Tasks
            </Button>
            <Button
              variant={selectedReport === 'bookings' ? 'primary' : 'outline'}
              onClick={() => setSelectedReport('bookings')}
            >
              <Calendar size={18} className="mr-2" />
              Bookings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Report */}
      {selectedReport === 'summary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono font-bold">Group Summary Report</h3>
            <Button onClick={() => handleExportReport('summary')}>
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="text-nostalgic-600" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold">{members.length}</p>
                    <p className="text-sm text-nostalgic-600">Total Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold">{completedTasks.length}</p>
                    <p className="text-sm text-nostalgic-600">Completed Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-amber-600" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold">{pendingTasks.length}</p>
                    <p className="text-sm text-nostalgic-600">Pending Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <WalletIcon className="text-nostalgic-600" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold">
                      {formatCurrency(wallet?.balance || 0)}
                    </p>
                    <p className="text-sm text-nostalgic-600">Wallet Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completed</span>
                      <span className="font-medium">
                        {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-nostalgic-200 h-4 border-2 border-black">
                      <div
                        className="bg-green-600 h-full"
                        style={{
                          width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-nostalgic-600">
                    {completedTasks.length} of {tasks.length} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-nostalgic-600">Available Balance</span>
                    <span className="font-mono font-bold">{formatCurrency(wallet?.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nostalgic-600">Escrow Balance</span>
                    <span className="font-mono font-bold">{formatCurrency(wallet?.escrow_balance || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-nostalgic-200 pt-3">
                    <span className="font-medium">Total Balance</span>
                    <span className="font-mono font-bold text-lg">
                      {formatCurrency((wallet?.balance || 0) + (wallet?.escrow_balance || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {selectedReport === 'financial' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono font-bold">Financial Report</h3>
            <Button onClick={() => handleExportReport('financial')}>
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border-2 border-nostalgic-200">
                  <p className="text-sm text-nostalgic-600">Total Transactions</p>
                  <p className="text-2xl font-mono font-bold">{transactions.length}</p>
                </div>
                <div className="p-4 border-2 border-green-200 bg-green-50">
                  <p className="text-sm text-green-600">Total Collections</p>
                  <p className="text-2xl font-mono font-bold text-green-600">
                    {formatCurrency(
                      transactions
                        .filter((t) => t.type === 'collection')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="p-4 border-2 border-red-200 bg-red-50">
                  <p className="text-sm text-red-600">Total Payments</p>
                  <p className="text-2xl font-mono font-bold text-red-600">
                    {formatCurrency(
                      transactions
                        .filter((t) => t.type === 'payment')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((t) => (
                        <tr key={t.id} className="border-b border-nostalgic-200">
                          <td className="p-2">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Badge size="sm">{t.type.replace('_', ' ')}</Badge>
                          </td>
                          <td className="p-2">{t.description}</td>
                          <td className={`p-2 text-right font-mono ${t.type === 'collection' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {t.type === 'collection' ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                          <td className="p-2 text-center">
                            <Badge
                              variant={t.status === 'completed' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {t.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-nostalgic-600">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks Report */}
      {selectedReport === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono font-bold">Tasks Report</h3>
            <Button onClick={() => handleExportReport('tasks')}>
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border-2 border-nostalgic-200">
                  <p className="text-sm text-nostalgic-600">Total Tasks</p>
                  <p className="text-2xl font-mono font-bold">{tasks.length}</p>
                </div>
                <div className="p-4 border-2 border-blue-200 bg-blue-50">
                  <p className="text-sm text-blue-600">Pending</p>
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {tasks.filter((t) => t.status === 'pending').length}
                  </p>
                </div>
                <div className="p-4 border-2 border-amber-200 bg-amber-50">
                  <p className="text-sm text-amber-600">In Progress</p>
                  <p className="text-2xl font-mono font-bold text-amber-600">
                    {tasks.filter((t) => t.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-4 border-2 border-green-200 bg-green-50">
                  <p className="text-sm text-green-600">Completed</p>
                  <p className="text-2xl font-mono font-bold text-green-600">
                    {completedTasks.length}
                  </p>
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-nostalgic-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-nostalgic-600">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge size="sm">{task.priority}</Badge>
                        <Badge
                          variant={task.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-nostalgic-600">No tasks yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings Report */}
      {selectedReport === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono font-bold">Bookings Report</h3>
            <Button onClick={() => handleExportReport('summary')}>
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border-2 border-nostalgic-200">
                  <p className="text-sm text-nostalgic-600">Total Bookings</p>
                  <p className="text-2xl font-mono font-bold">{bookings.length}</p>
                </div>
                <div className="p-4 border-2 border-green-200 bg-green-50">
                  <p className="text-sm text-green-600">Confirmed</p>
                  <p className="text-2xl font-mono font-bold text-green-600">
                    {confirmedBookings.length}
                  </p>
                </div>
                <div className="p-4 border-2 border-blue-200 bg-blue-50">
                  <p className="text-sm text-blue-600">Total Value</p>
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {formatCurrency(totalBookingAmount)}
                  </p>
                </div>
              </div>

              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border border-nostalgic-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          Booking for {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-nostalgic-600">{booking.terms}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">{formatCurrency(booking.amount)}</p>
                        <Badge
                          variant={booking.status === 'confirmed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-nostalgic-600">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
