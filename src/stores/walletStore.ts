import { create } from 'zustand';
import { Wallet, Transaction, PaymentRequest, PaymentRequestMember } from '../types';
import { supabase } from '../utils/supabase';
import { generateUniqueId } from '../utils/idGenerator';
import { validateAmount } from '../utils/security';

interface WalletState {
  wallets: Wallet[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  paymentRequestMembers: PaymentRequestMember[];
  isLoading: boolean;
  
  getGroupWallet: (groupId: string) => Promise<Wallet | undefined>;
  fetchGroupWallet: (groupId: string) => Promise<Wallet | undefined>;
  createGroupWallet: (groupId: string) => Promise<Wallet>;
  
  fetchWalletTransactions: (walletId: string) => Promise<void>;
  fetchGroupTransactions: (groupId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  getWalletTransactions: (walletId: string) => Transaction[];
  getGroupTransactions: (groupId: string) => Transaction[];
  
  addFunds: (groupId: string, amount: number, description: string, userId: string) => Promise<Transaction>;
  makePayment: (groupId: string, amount: number, description: string, userId: string, vendorId?: string) => Promise<Transaction>;
  lockEscrow: (groupId: string, amount: number, description: string) => Promise<Transaction>;
  releaseEscrow: (groupId: string, transactionId: string) => Promise<Transaction>;
  
  fetchPaymentRequests: (groupId: string) => Promise<void>;
  createPaymentRequest: (request: Omit<PaymentRequest, 'id' | 'status' | 'created_at'>) => Promise<PaymentRequest>;
  addPaymentRequestMember: (member: Omit<PaymentRequestMember, 'id' | 'status' | 'paid_at'>) => Promise<PaymentRequestMember>;
  markMemberPaid: (requestMemberId: string) => Promise<void>;
  approvePaymentRequest: (requestId: string, approverId: string) => Promise<void>;
  rejectPaymentRequest: (requestId: string) => Promise<void>;
  getGroupPaymentRequests: (groupId: string) => PaymentRequest[];
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  transactions: [],
  paymentRequests: [],
  paymentRequestMembers: [],
  isLoading: false,

  getGroupWallet: async (groupId: string) => {
    return get().fetchGroupWallet(groupId);
  },

  fetchGroupWallet: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const typedWallet: Wallet | undefined = wallet ? {
        id: wallet.id,
        group_id: wallet.group_id,
        balance: wallet.balance,
        escrow_balance: wallet.escrow_balance,
        pending_balance: wallet.pending_balance,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at,
      } : undefined;

      if (typedWallet) {
        set((state) => ({
          wallets: state.wallets.find(w => w.id === typedWallet.id)
            ? state.wallets.map(w => w.id === typedWallet.id ? typedWallet : w)
            : [...state.wallets, typedWallet],
        }));
      }

      return typedWallet;
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createGroupWallet: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const newWallet = {
        id: generateUniqueId(),
        group_id: groupId,
        balance: 0,
        escrow_balance: 0,
        pending_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('wallets')
        .insert([newWallet]);

      if (error) throw error;

      const typedWallet: Wallet = newWallet as Wallet;

      set((state) => ({
        wallets: [...state.wallets, typedWallet],
      }));

      return typedWallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWalletTransactions: async (walletId: string) => {
    set({ isLoading: true });
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          from_user:users!transactions_from_user_id_fkey(*),
          to_user:users!transactions_to_user_id_fkey(*)
        `)
        .eq('wallet_id', walletId);

      if (error) throw error;

      const typedTransactions: Transaction[] = (transactions || []).map(t => ({
        id: t.id,
        wallet_id: t.wallet_id,
        type: t.type,
        amount: t.amount,
        from_user_id: t.from_user_id,
        to_user_id: t.to_user_id,
        vendor_id: t.vendor_id,
        description: t.description,
        payment_method: t.payment_method,
        payment_gateway_id: t.payment_gateway_id,
        status: t.status,
        created_at: t.created_at,
        from_user: t.from_user,
        to_user: t.to_user,
      }));

      set({ transactions: typedTransactions });
    } catch (error) {
      console.error('Failed to fetch wallet transactions:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupTransactions: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('group_id', groupId)
        .single();

      if (!wallet) {
        set({ transactions: [] });
        return;
      }

      await get().fetchWalletTransactions(wallet.id);
    } catch (error) {
      console.error('Failed to fetch group transactions:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionData) => {
    set({ isLoading: true });
    try {
      const newTransaction = {
        id: generateUniqueId(),
        ...transactionData,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('transactions')
        .insert([newTransaction]);

      if (error) throw error;

      set((state) => ({
        transactions: [...state.transactions, newTransaction as Transaction],
      }));

      return newTransaction as Transaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getWalletTransactions: (walletId) => {
    return get().transactions.filter((t) => t.wallet_id === walletId);
  },

  getGroupTransactions: (groupId) => {
    return get().transactions.filter((t) => {
      const wallet = get().wallets.find(w => w.id === t.wallet_id);
      return wallet?.group_id === groupId;
    });
  },

  addFunds: async (groupId, amount, description, userId) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }
    
    const wallet = get().wallets.find(w => w.group_id === groupId) || 
                   await get().fetchGroupWallet(groupId);
    
    if (!wallet) {
      throw new Error('Group wallet not found');
    }

    const transaction = await get().addTransaction({
      wallet_id: wallet.id,
      type: 'collection',
      amount: amount,
      from_user_id: userId,
      status: 'completed',
      description: description,
      payment_method: 'upi',
    });

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (walletError) throw walletError;

    set((state) => ({
      wallets: state.wallets.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: w.balance + amount, updated_at: new Date().toISOString() }
          : w
      ),
    }));

    return transaction;
  },

  makePayment: async (groupId, amount, description, userId, vendorId) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }
    
    const wallet = get().wallets.find(w => w.group_id === groupId) || 
                   await get().fetchGroupWallet(groupId);
    
    if (!wallet) {
      throw new Error('Group wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = await get().addTransaction({
      wallet_id: wallet.id,
      type: 'payment',
      amount: amount,
      to_user_id: userId,
      vendor_id: vendorId,
      description: description,
      payment_method: 'upi',
      status: 'completed',
    });

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (walletError) throw walletError;

    set((state) => ({
      wallets: state.wallets.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: w.balance - amount, updated_at: new Date().toISOString() }
          : w
      ),
    }));

    return transaction;
  },

  lockEscrow: async (groupId, amount, description) => {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }
    
    const wallet = get().wallets.find(w => w.group_id === groupId) || 
                   await get().fetchGroupWallet(groupId);
    
    if (!wallet) {
      throw new Error('Group wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = await get().addTransaction({
      wallet_id: wallet.id,
      type: 'escrow_lock',
      amount: amount,
      description: description,
      status: 'pending',
    });

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        escrow_balance: wallet.escrow_balance + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (walletError) throw walletError;

    set((state) => ({
      wallets: state.wallets.map(w => 
        w.id === wallet.id 
          ? { 
              ...w, 
              balance: w.balance - amount,
              escrow_balance: w.escrow_balance + amount,
              updated_at: new Date().toISOString(),
            }
          : w
      ),
    }));

    return transaction;
  },

  releaseEscrow: async (groupId, transactionId) => {
    const wallet = get().wallets.find(w => w.group_id === groupId) || 
                   await get().fetchGroupWallet(groupId);
    
    if (!wallet) {
      throw new Error('Group wallet not found');
    }

    const transaction = get().transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.type !== 'escrow_lock') {
      throw new Error('Invalid escrow transaction');
    }

    const releaseTransaction = await get().addTransaction({
      wallet_id: wallet.id,
      type: 'escrow_release',
      amount: transaction.amount,
      description: `Release escrow: ${transaction.description}`,
      status: 'completed',
    });

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        escrow_balance: wallet.escrow_balance - transaction.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (walletError) throw walletError;

    set((state) => ({
      wallets: state.wallets.map(w => 
        w.id === wallet.id 
          ? { 
              ...w, 
              escrow_balance: w.escrow_balance - transaction.amount,
              updated_at: new Date().toISOString(),
            }
          : w
      ),
      transactions: state.transactions.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'completed' as const }
          : t
      ),
    }));

    return releaseTransaction;
  },

  fetchPaymentRequests: async (groupId) => {
    set({ isLoading: true });
    try {
      const { data: requests, error: requestError } = await supabase
        .from('payment_requests')
        .select(`
          *,
          creator:users!payment_requests_created_by_fkey(*),
          approver:users!payment_requests_approved_by_fkey(*)
        `)
        .eq('group_id', groupId);

      if (requestError) throw requestError;

      const { data: members, error: memberError } = await supabase
        .from('payment_request_members')
        .select(`
          *,
          user:users(*)
        `)
        .in('payment_request_id', requests?.map(r => r.id) || []);

      if (memberError) throw memberError;

      const typedRequests: PaymentRequest[] = (requests || []).map(r => ({
        id: r.id,
        group_id: r.group_id,
        created_by: r.created_by,
        amount: r.amount,
        purpose: r.purpose,
        split_type: r.split_type,
        status: r.status,
        approved_by: r.approved_by,
        due_date: r.due_date,
        created_at: r.created_at,
        creator: r.creator,
        approver: r.approver,
      }));

      const typedMembers: PaymentRequestMember[] = (members || []).map(m => ({
        id: m.id,
        payment_request_id: m.payment_request_id,
        user_id: m.user_id,
        amount: m.amount,
        status: m.status,
        paid_at: m.paid_at,
        user: m.user,
      }));

      set({ 
        paymentRequests: typedRequests,
        paymentRequestMembers: typedMembers,
      });
    } catch (error) {
      console.error('Failed to fetch payment requests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createPaymentRequest: async (requestData) => {
    set({ isLoading: true });
    try {
      const newRequest = {
        id: generateUniqueId(),
        ...requestData,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('payment_requests')
        .insert([newRequest]);

      if (error) throw error;

      set((state) => ({
        paymentRequests: [...state.paymentRequests, newRequest as PaymentRequest],
      }));

      return newRequest as PaymentRequest;
    } catch (error) {
      console.error('Failed to create payment request:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addPaymentRequestMember: async (memberData) => {
    set({ isLoading: true });
    try {
      const newMember = {
        id: generateUniqueId(),
        ...memberData,
        status: 'pending' as const,
        paid_at: undefined,
      };

      const { error } = await supabase
        .from('payment_request_members')
        .insert([newMember]);

      if (error) throw error;

      set((state) => ({
        paymentRequestMembers: [...state.paymentRequestMembers, newMember as PaymentRequestMember],
      }));

      return newMember as PaymentRequestMember;
    } catch (error) {
      console.error('Failed to add payment request member:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markMemberPaid: async (requestMemberId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('payment_request_members')
        .update({ 
          status: 'paid' as const,
          paid_at: new Date().toISOString(),
        })
        .eq('id', requestMemberId);

      if (error) throw error;

      set((state) => ({
        paymentRequestMembers: state.paymentRequestMembers.map((m) => 
          m.id === requestMemberId 
            ? { ...m, status: 'paid' as const, paid_at: new Date().toISOString() }
            : m
        ),
      }));
    } catch (error) {
      console.error('Failed to mark member paid:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approvePaymentRequest: async (requestId, approverId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ 
          status: 'approved' as const,
          approved_by: approverId,
        })
        .eq('id', requestId);

      if (error) throw error;

      set((state) => ({
        paymentRequests: state.paymentRequests.map((r) => 
          r.id === requestId 
            ? { ...r, status: 'approved' as const, approved_by: approverId }
            : r
        ),
      }));
    } catch (error) {
      console.error('Failed to approve payment request:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectPaymentRequest: async (requestId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ 
          status: 'rejected' as const,
        })
        .eq('id', requestId);

      if (error) throw error;

      set((state) => ({
        paymentRequests: state.paymentRequests.map((r) => 
          r.id === requestId 
            ? { ...r, status: 'rejected' as const }
            : r
        ),
      }));
    } catch (error) {
      console.error('Failed to reject payment request:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getGroupPaymentRequests: (groupId) => {
    const requests = get().paymentRequests.filter((r) => r.group_id === groupId);
    return requests.map(r => ({
      ...r,
      member_payments: get().paymentRequestMembers.filter(m => m.payment_request_id === r.id),
    }));
  },
}));