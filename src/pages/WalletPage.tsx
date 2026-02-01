import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Lock, Clock, Plus } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Transaction, TransactionType } from '../types';

export function WalletPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Mock wallet data
  const walletStats = {
    totalBalance: 45000,
    escrowBalance: 15000,
    pendingBalance: 5000,
  };

  // Mock transactions
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      wallet_id: '1',
      type: 'collection',
      amount: 5000,
      description: 'Conference venue advance payment',
      status: 'completed',
      payment_method: 'upi',
      created_at: '2024-02-10T10:00:00Z',
    },
    {
      id: '2',
      wallet_id: '1',
      type: 'escrow_lock',
      amount: 15000,
      description: 'Vendor booking - Catering service',
      status: 'completed',
      created_at: '2024-02-08T14:30:00Z',
    },
    {
      id: '3',
      wallet_id: '2',
      type: 'payment',
      amount: 8000,
      description: 'Flight tickets payment',
      status: 'completed',
      payment_method: 'card',
      created_at: '2024-02-05T09:15:00Z',
    },
    {
      id: '4',
      wallet_id: '1',
      type: 'collection',
      amount: 3000,
      description: 'Member contribution - March',
      status: 'pending',
      created_at: '2024-02-12T16:45:00Z',
    },
  ];

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'collection':
        return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'payment':
        return <ArrowUpRight size={18} className="text-red-600" />;
      case 'escrow_lock':
        return <Lock size={18} className="text-amber-600" />;
      case 'escrow_release':
        return <ArrowUpRight size={18} className="text-blue-600" />;
      default:
        return <Wallet size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      pending: 'warning',
      completed: 'success',
      failed: 'error',
    };
    return <Badge variant={variants[status] || 'default'} size="sm">{status.toUpperCase()}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold">Wallet</h1>
            <p className="text-nostalgic-600 mt-1">
              Manage your group finances
            </p>
          </div>
          <Button>
            <Plus size={20} className="mr-2" />
            Collect Payment
          </Button>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 border-2 border-green-600">
                  <Wallet size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-nostalgic-600">Available Balance</p>
                  <p className="text-2xl font-mono font-bold">₹{walletStats.totalBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 border-2 border-amber-600">
                  <Lock size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-nostalgic-600">Escrow Balance</p>
                  <p className="text-2xl font-mono font-bold">₹{walletStats.escrowBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 border-2 border-blue-600">
                  <Clock size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-nostalgic-600">Pending Amount</p>
                  <p className="text-2xl font-mono font-bold">₹{walletStats.pendingBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <option value="all">All Groups</option>
            <option value="1">Tech Conference 2024</option>
            <option value="2">Europe Trip Summer</option>
            <option value="3">Photography Club</option>
          </select>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border-2 border-nostalgic-200 hover:bg-nostalgic-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-nostalgic-100 border border-nostalgic-400">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-nostalgic-600 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-mono font-bold ${
                      transaction.type === 'collection' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'collection' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.payment_method && (
                      <p className="text-sm text-nostalgic-600 mt-1 capitalize">
                        {transaction.payment_method}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
