import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Lock, Clock, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Group, Transaction, TransactionType } from '../../types';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { formatCurrency, validateAmount } from '../../utils/security';

interface GroupWalletTabProps {
  group: Group;
}

export function GroupWalletTab({ group }: GroupWalletTabProps) {
  const { user } = useAuthStore();
  const { wallets, getGroupTransactions, addFunds, makePayment, lockEscrow } = useWalletStore();
  const { addToast } = useToastStore();

  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isMakePaymentModalOpen, setIsMakePaymentModalOpen] = useState(false);
  const [isLockEscrowModalOpen, setIsLockEscrowModalOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');

  const wallet = wallets.find((w) => w.group_id === group.id);
  const transactions = getGroupTransactions(group.id);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!validateAmount(amountNum)) {
      addToast('error', 'Invalid amount');
      return;
    }

    try {
      addFunds(group.id, amountNum, description, user!.id);
      addToast('success', 'Funds added successfully');
      setIsAddFundsModalOpen(false);
      resetForm();
    } catch (error: any) {
      addToast('error', error.message || 'Failed to add funds');
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!validateAmount(amountNum)) {
      addToast('error', 'Invalid amount');
      return;
    }

    try {
      makePayment(group.id, amountNum, description, user!.id, vendorId || undefined);
      addToast('success', 'Payment successful');
      setIsMakePaymentModalOpen(false);
      resetForm();
    } catch (error: any) {
      addToast('error', error.message || 'Payment failed');
    }
  };

  const handleLockEscrow = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!validateAmount(amountNum)) {
      addToast('error', 'Invalid amount');
      return;
    }

    try {
      lockEscrow(group.id, amountNum, description);
      addToast('success', 'Escrow locked successfully');
      setIsLockEscrowModalOpen(false);
      resetForm();
    } catch (error: any) {
      addToast('error', error.message || 'Failed to lock escrow');
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setVendorId('');
  };

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
        return <WalletIcon size={18} />;
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 border-2 border-green-600">
                <WalletIcon size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-nostalgic-600">Available Balance</p>
                <p className="text-2xl font-mono font-bold">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
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
                <p className="text-2xl font-mono font-bold">
                  {formatCurrency(wallet?.escrow_balance || 0)}
                </p>
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
                <p className="text-sm text-nostalgic-600">Total Transactions</p>
                <p className="text-2xl font-mono font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button onClick={() => setIsAddFundsModalOpen(true)} className="justify-center">
              <Plus size={20} className="mr-2" />
              Add Funds
            </Button>
            <Button onClick={() => setIsMakePaymentModalOpen(true)} variant="outline" className="justify-center">
              <ArrowUpRight size={20} className="mr-2" />
              Make Payment
            </Button>
            <Button onClick={() => setIsLockEscrowModalOpen(true)} variant="outline" className="justify-center">
              <Lock size={20} className="mr-2" />
              Lock Escrow
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
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
              <WalletIcon size={48} className="mx-auto text-nostalgic-400 mb-4" />
              <p className="text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-nostalgic-600 mb-4">Add funds to your wallet to get started</p>
              <Button onClick={() => setIsAddFundsModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Add First Funds
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Funds Modal */}
      <Modal
        isOpen={isAddFundsModalOpen}
        onClose={() => {
          setIsAddFundsModalOpen(false);
          resetForm();
        }}
        title="Add Funds"
      >
        <form onSubmit={handleAddFunds}>
          <div className="space-y-4">
            <Input
              label="Amount (₹)"
              type="number"
              required
              min="1"
              max="10000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="What is this for?"
              />
            </div>
          </div>
          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsAddFundsModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">Add Funds</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Make Payment Modal */}
      <Modal
        isOpen={isMakePaymentModalOpen}
        onClose={() => {
          setIsMakePaymentModalOpen(false);
          resetForm();
        }}
        title="Make Payment"
      >
        <form onSubmit={handleMakePayment}>
          <div className="space-y-4">
            <Input
              label="Amount (₹)"
              type="number"
              required
              min="1"
              max="10000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="What is this payment for?"
              />
            </div>
          </div>
          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsMakePaymentModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">Make Payment</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Lock Escrow Modal */}
      <Modal
        isOpen={isLockEscrowModalOpen}
        onClose={() => {
          setIsLockEscrowModalOpen(false);
          resetForm();
        }}
        title="Lock Escrow"
      >
        <form onSubmit={handleLockEscrow}>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border-2 border-amber-600">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Escrow funds will be locked until you release them after the service is completed.
              </p>
            </div>
            <Input
              label="Amount (₹)"
              type="number"
              required
              min="1"
              max="10000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to lock"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="What is this escrow for?"
              />
            </div>
          </div>
          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsLockEscrowModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">Lock Escrow</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
