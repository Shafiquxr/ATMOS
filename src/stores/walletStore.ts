import { create } from 'zustand';
import { Wallet, Transaction, PaymentRequest, PaymentRequestMember } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { validateAmount } from '../utils/security';

const WALLETS_STORAGE_KEY = 'atmos_wallets';
const TRANSACTIONS_STORAGE_KEY = 'atmos_transactions';
const PAYMENT_REQUESTS_STORAGE_KEY = 'atmos_payment_requests';
const PAYMENT_MEMBERS_STORAGE_KEY = 'atmos_payment_request_members';

interface WalletState {
  wallets: Wallet[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  paymentRequestMembers: PaymentRequestMember[];
  isLoading: boolean;
  
  getGroupWallet: (groupId: string) => Wallet | undefined;
  createGroupWallet: (groupId: string) => Wallet;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Transaction;
  getWalletTransactions: (walletId: string) => Transaction[];
  getGroupTransactions: (groupId: string) => Transaction[];
  
  addFunds: (groupId: string, amount: number, description: string, userId: string) => Transaction;
  makePayment: (groupId: string, amount: number, description: string, userId: string, vendorId?: string) => Transaction;
  lockEscrow: (groupId: string, amount: number, description: string) => Transaction;
  releaseEscrow: (groupId: string, transactionId: string) => Transaction;
  
  createPaymentRequest: (request: Omit<PaymentRequest, 'id' | 'status' | 'created_at'>) => PaymentRequest;
  addPaymentRequestMember: (member: Omit<PaymentRequestMember, 'id' | 'status' | 'paid_at'>) => PaymentRequestMember;
  markMemberPaid: (requestMemberId: string) => void;
  approvePaymentRequest: (requestId: string, approverId: string) => void;
  rejectPaymentRequest: (requestId: string) => void;
  getGroupPaymentRequests: (groupId: string) => PaymentRequest[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const loadWalletsFromStorage = (): Wallet[] => {
  return storageGet<Wallet[]>(WALLETS_STORAGE_KEY, []);
};

const loadTransactionsFromStorage = (): Transaction[] => {
  return storageGet<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
};

const loadPaymentRequestsFromStorage = (): PaymentRequest[] => {
  return storageGet<PaymentRequest[]>(PAYMENT_REQUESTS_STORAGE_KEY, []);
};

const loadPaymentMembersFromStorage = (): PaymentRequestMember[] => {
  return storageGet<PaymentRequestMember[]>(PAYMENT_MEMBERS_STORAGE_KEY, []);
};

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: loadWalletsFromStorage(),
  transactions: loadTransactionsFromStorage(),
  paymentRequests: loadPaymentRequestsFromStorage(),
  paymentRequestMembers: loadPaymentMembersFromStorage(),
  isLoading: false,

  getGroupWallet: (groupId) => {
    return get().wallets.find((w) => w.group_id === groupId);
  },

  createGroupWallet: (groupId) => {
    const existingWallet = get().getGroupWallet(groupId);
    if (existingWallet) return existingWallet;

    const newWallet: Wallet = {
      id: generateUniqueId(),
      group_id: groupId,
      balance: 0,
      escrow_balance: 0,
      pending_balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedWallets = [...get().wallets, newWallet];
    set({ wallets: updatedWallets });
    storageSet(WALLETS_STORAGE_KEY, updatedWallets);

    return newWallet;
  },

  addTransaction: (transactionData) => {
    const newTransaction: Transaction = {
      id: generateUniqueId(),
      ...transactionData,
      created_at: new Date().toISOString(),
    };

    const updatedTransactions = [...get().transactions, newTransaction];
    set({ transactions: updatedTransactions });
    storageSet(TRANSACTIONS_STORAGE_KEY, updatedTransactions);

    return newTransaction;
  },

  getWalletTransactions: (walletId) => {
    return get().transactions
      .filter((t) => t.wallet_id === walletId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getGroupTransactions: (groupId) => {
    const wallet = get().getGroupWallet(groupId);
    if (!wallet) return [];
    return get().getWalletTransactions(wallet.id);
  },

  addFunds: (groupId, amount, description, userId) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }

    const wallet = get().createGroupWallet(groupId);
    
    const updatedWallets = get().wallets.map((w) =>
      w.id === wallet.id
        ? {
            ...w,
            balance: w.balance + amount,
            updated_at: new Date().toISOString(),
          }
        : w
    );

    const newTransaction = get().addTransaction({
      wallet_id: wallet.id,
      type: 'collection',
      amount,
      description,
      from_user_id: userId,
      status: 'completed',
    });

    set({ wallets: updatedWallets });
    storageSet(WALLETS_STORAGE_KEY, updatedWallets);

    return newTransaction;
  },

  makePayment: (groupId, amount, description, userId, vendorId) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }

    const wallet = get().getGroupWallet(groupId);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient balance');

    const updatedWallets = get().wallets.map((w) =>
      w.id === wallet.id
        ? {
            ...w,
            balance: w.balance - amount,
            updated_at: new Date().toISOString(),
          }
        : w
    );

    const newTransaction = get().addTransaction({
      wallet_id: wallet.id,
      type: 'payment',
      amount,
      description,
      from_user_id: userId,
      vendor_id: vendorId || undefined,
      status: 'completed',
    });

    set({ wallets: updatedWallets });
    storageSet(WALLETS_STORAGE_KEY, updatedWallets);

    return newTransaction;
  },

  lockEscrow: (groupId, amount, description) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }

    const wallet = get().getGroupWallet(groupId);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient balance');

    const updatedWallets = get().wallets.map((w) =>
      w.id === wallet.id
        ? {
            ...w,
            balance: w.balance - amount,
            escrow_balance: w.escrow_balance + amount,
            updated_at: new Date().toISOString(),
          }
        : w
    );

    const newTransaction = get().addTransaction({
      wallet_id: wallet.id,
      type: 'escrow_lock',
      amount,
      description,
      status: 'completed',
    });

    set({ wallets: updatedWallets });
    storageSet(WALLETS_STORAGE_KEY, updatedWallets);

    return newTransaction;
  },

  releaseEscrow: (groupId, transactionId) => {
    const lockTransaction = get().transactions.find((t) => t.id === transactionId);
    if (!lockTransaction || lockTransaction.type !== 'escrow_lock') {
      throw new Error('Transaction not found or not an escrow lock');
    }

    const wallet = get().getGroupWallet(groupId);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.escrow_balance < lockTransaction.amount) throw new Error('Insufficient escrow balance');

    const updatedWallets = get().wallets.map((w) =>
      w.id === wallet.id
        ? {
            ...w,
            escrow_balance: w.escrow_balance - lockTransaction.amount,
            updated_at: new Date().toISOString(),
          }
        : w
    );

    const newTransaction = get().addTransaction({
      wallet_id: wallet.id,
      type: 'escrow_release',
      amount: lockTransaction.amount,
      description: `Escrow release for: ${lockTransaction.description}`,
      status: 'completed',
    });

    set({ wallets: updatedWallets });
    storageSet(WALLETS_STORAGE_KEY, updatedWallets);

    return newTransaction;
  },

  createPaymentRequest: (requestData) => {
    const newPaymentRequest: PaymentRequest = {
      id: generateUniqueId(),
      ...requestData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const updatedPaymentRequests = [...get().paymentRequests, newPaymentRequest];
    set({ paymentRequests: updatedPaymentRequests });
    storageSet(PAYMENT_REQUESTS_STORAGE_KEY, updatedPaymentRequests);

    return newPaymentRequest;
  },

  addPaymentRequestMember: (memberData) => {
    const newMember: PaymentRequestMember = {
      id: generateUniqueId(),
      ...memberData,
      status: 'pending',
    };

    const updatedMembers = [...get().paymentRequestMembers, newMember];
    set({ paymentRequestMembers: updatedMembers });
    storageSet(PAYMENT_MEMBERS_STORAGE_KEY, updatedMembers);

    return newMember;
  },

  markMemberPaid: (requestMemberId) => {
    const updatedMembers = get().paymentRequestMembers.map((m) =>
      m.id === requestMemberId
        ? {
            ...m,
            status: 'paid' as const,
            paid_at: new Date().toISOString(),
          }
        : m
    );

    const member = get().paymentRequestMembers.find((m) => m.id === requestMemberId);
    if (member) {
      const request = get().paymentRequests.find((pr) => pr.id === member.payment_request_id);
      if (request) {
        get().addFunds(request.group_id, member.amount, `Payment request: ${request.purpose}`, member.user_id);
      }
    }

    set({ paymentRequestMembers: updatedMembers });
    storageSet(PAYMENT_MEMBERS_STORAGE_KEY, updatedMembers);
  },

  approvePaymentRequest: (requestId, approverId) => {
    const updatedPaymentRequests = get().paymentRequests.map((pr) =>
      pr.id === requestId
        ? {
            ...pr,
            status: 'approved' as const,
            approved_by: approverId,
          }
        : pr
    );

    set({ paymentRequests: updatedPaymentRequests });
    storageSet(PAYMENT_REQUESTS_STORAGE_KEY, updatedPaymentRequests);
  },

  rejectPaymentRequest: (requestId) => {
    const updatedPaymentRequests = get().paymentRequests.map((pr) =>
      pr.id === requestId
        ? {
            ...pr,
            status: 'rejected' as const,
          }
        : pr
    );

    set({ paymentRequests: updatedPaymentRequests });
    storageSet(PAYMENT_REQUESTS_STORAGE_KEY, updatedPaymentRequests);
  },

  getGroupPaymentRequests: (groupId) => {
    return get().paymentRequests
      .filter((pr) => pr.group_id === groupId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  loadFromStorage: () => {
    set({
      wallets: loadWalletsFromStorage(),
      transactions: loadTransactionsFromStorage(),
      paymentRequests: loadPaymentRequestsFromStorage(),
      paymentRequestMembers: loadPaymentMembersFromStorage(),
    });
  },

  saveToStorage: () => {
    const { wallets, transactions, paymentRequests, paymentRequestMembers } = get();
    storageSet(WALLETS_STORAGE_KEY, wallets);
    storageSet(TRANSACTIONS_STORAGE_KEY, transactions);
    storageSet(PAYMENT_REQUESTS_STORAGE_KEY, paymentRequests);
    storageSet(PAYMENT_MEMBERS_STORAGE_KEY, paymentRequestMembers);
  },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
  if (
    event.key === WALLETS_STORAGE_KEY ||
    event.key === TRANSACTIONS_STORAGE_KEY ||
    event.key === PAYMENT_REQUESTS_STORAGE_KEY ||
    event.key === PAYMENT_MEMBERS_STORAGE_KEY
  ) {
    useWalletStore.getState().loadFromStorage();
  }
});
