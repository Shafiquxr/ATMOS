import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Lock, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Transaction, TransactionType } from '../types';
import { useWalletStore } from '../stores/walletStore';
import { useGroupStore } from '../stores/groupStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/security';

export function WalletPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const { groups, members } = useGroupStore();
  const { user } = useAuthStore();
  const { getGroupWallet, getGroupTransactions } = useWalletStore();

  const userGroups = groups.filter((group) => 
    group.owner_id === user?.id || 
    members.some((m) => m.group_id === group.id && (m.user_id === user?.id || m.user_id === user?.email))
  );

  // Calculate stats from real data
  let walletStats = {
    totalBalance: 0,
    escrowBalance: 0,
    pendingBalance: 0,
  };

  let allTransactions: Transaction[] = [];

  if (selectedGroup === 'all') {
    userGroups.forEach((group) => {
      const wallet = getGroupWallet(group.id);
      if (wallet) {
        walletStats.totalBalance += wallet.balance;
        walletStats.escrowBalance += wallet.escrow_balance;
        walletStats.pendingBalance += 0; // pending_balance not currently used
      }
      allTransactions = [...allTransactions, ...getGroupTransactions(group.id)];
    });
    allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    const wallet = getGroupWallet(selectedGroup);
    if (wallet) {
      walletStats = {
        totalBalance: wallet.balance,
        escrowBalance: wallet.escrow_balance,
        pendingBalance: wallet.pending_balance,
      };
    }
    allTransactions = getGroupTransactions(selectedGroup);
  }

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
      refunded: 'default',
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
          {userGroups.length > 0 && (
            <Link to={`/groups/${userGroups[0].id}?tab=wallet`}>
              <Button>
                <Plus size={20} className="mr-2" />
                Add Funds
              </Button>
            </Link>
          )}
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
                  <p className="text-2xl font-mono font-bold">{formatCurrency(walletStats.totalBalance)}</p>
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
                  <p className="text-2xl font-mono font-bold">{formatCurrency(walletStats.escrowBalance)}</p>
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
                  <p className="text-2xl font-mono font-bold">{formatCurrency(walletStats.pendingBalance)}</p>
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
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {allTransactions.length > 0 ? (
              <div className="space-y-4">
                {allTransactions.map((transaction) => (
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
                        {transaction.type === 'collection' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
            ) : (
              <div className="text-center py-12">
                <Wallet size={48} className="mx-auto text-nostalgic-400 mb-4" />
                <p className="text-lg font-medium mb-2">No transactions yet</p>
                <p className="text-nostalgic-600">
                  Add funds to your wallet to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
