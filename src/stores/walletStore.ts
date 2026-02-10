import { create } from 'zustand';
import { Wallet, Transaction, PaymentRequest, PaymentRequestMember } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const WALLETS_STORAGE_KEY = 'atmos_wallets';
const TRANSACTIONS_STORAGE_KEY = 'atmos_transactions';
const PAYMENT_REQUESTS_STORAGE_KEY = 'atmos_payment_requests';

interface WalletState {
    wallets: Wallet[];
    currentWallet: Wallet | null;
    transactions: Transaction[];
    paymentRequests: PaymentRequest[];
    isLoading: boolean;
    error: string | null;

    // Wallet actions
    fetchWallet: (groupId: string) => Promise<void>;
    createWallet: (groupId: string) => Promise<Wallet>;
    updateBalance: (walletId: string, amount: number) => Promise<void>;

    // Transaction actions
    fetchTransactions: (walletId: string) => Promise<void>;
    createTransaction: (transaction: Partial<Transaction>) => Promise<Transaction>;

    // Payment Request actions
    fetchPaymentRequests: (groupId: string) => Promise<void>;
    createPaymentRequest: (request: Partial<PaymentRequest>) => Promise<PaymentRequest>;
    updatePaymentRequestStatus: (requestId: string, status: string) => Promise<void>;

    // Utility
    getGroupBalance: (groupId: string) => number;
    getUserBalance: (userId: string, groupId: string) => number;
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

export const useWalletStore = create<WalletState>((set, get) => ({
    wallets: [],
    currentWallet: null,
    transactions: [],
    paymentRequests: [],
    isLoading: false,
    error: null,

    fetchWallet: async (groupId: string) => {
        set({ isLoading: true });
        try {
            const wallets = loadWalletsFromStorage();
            let wallet = wallets.find((w) => w.group_id === groupId);

            // Create wallet if it doesn't exist
            if (!wallet) {
                wallet = await get().createWallet(groupId);
            }

            set({ currentWallet: wallet, wallets });
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
            set({ error: 'Failed to fetch wallet' });
        } finally {
            set({ isLoading: false });
        }
    },

    createWallet: async (groupId: string) => {
        const wallets = loadWalletsFromStorage();

        const existingWallet = wallets.find((w) => w.group_id === groupId);
        if (existingWallet) {
            return existingWallet;
        }

        const newWallet: Wallet = {
            id: generateUniqueId(),
            group_id: groupId,
            balance: 0,
            escrow_balance: 0,
            pending_balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const updatedWallets = [...wallets, newWallet];
        storageSet(WALLETS_STORAGE_KEY, updatedWallets);
        set({ wallets: updatedWallets, currentWallet: newWallet });

        return newWallet;
    },

    updateBalance: async (walletId: string, amount: number) => {
        const wallets = loadWalletsFromStorage();
        const updatedWallets = wallets.map((w) =>
            w.id === walletId
                ? { ...w, balance: w.balance + amount, updated_at: new Date().toISOString() }
                : w
        );
        storageSet(WALLETS_STORAGE_KEY, updatedWallets);
        set({ wallets: updatedWallets });

        if (get().currentWallet?.id === walletId) {
            set({ currentWallet: updatedWallets.find((w) => w.id === walletId) });
        }
    },

    fetchTransactions: async (walletId: string) => {
        set({ isLoading: true });
        try {
            const allTransactions = loadTransactionsFromStorage();
            const walletTransactions = allTransactions.filter((t) => t.wallet_id === walletId);
            set({ transactions: walletTransactions });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    createTransaction: async (transactionData: Partial<Transaction>) => {
        const transactions = loadTransactionsFromStorage();

        const newTransaction: Transaction = {
            id: generateUniqueId(),
            wallet_id: transactionData.wallet_id || '',
            type: transactionData.type || 'collection',
            amount: transactionData.amount || 0,
            from_user_id: transactionData.from_user_id,
            to_user_id: transactionData.to_user_id,
            vendor_id: transactionData.vendor_id,
            description: transactionData.description,
            payment_method: transactionData.payment_method,
            status: 'completed',
            created_at: new Date().toISOString(),
        };

        const updatedTransactions = [...transactions, newTransaction];
        storageSet(TRANSACTIONS_STORAGE_KEY, updatedTransactions);
        set({ transactions: updatedTransactions.filter((t) => t.wallet_id === newTransaction.wallet_id) });

        // Update wallet balance
        if (newTransaction.wallet_id) {
            const amount = newTransaction.type === 'collection' ? newTransaction.amount : -newTransaction.amount;
            await get().updateBalance(newTransaction.wallet_id, amount);
        }

        return newTransaction;
    },

    fetchPaymentRequests: async (groupId: string) => {
        set({ isLoading: true });
        try {
            const allRequests = loadPaymentRequestsFromStorage();
            const groupRequests = allRequests.filter((r) => r.group_id === groupId);
            set({ paymentRequests: groupRequests });
        } catch (error) {
            console.error('Failed to fetch payment requests:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    createPaymentRequest: async (requestData: Partial<PaymentRequest>) => {
        const requests = loadPaymentRequestsFromStorage();

        const newRequest: PaymentRequest = {
            id: generateUniqueId(),
            group_id: requestData.group_id || '',
            created_by: requestData.created_by || '',
            amount: requestData.amount || 0,
            purpose: requestData.purpose || '',
            split_type: requestData.split_type || 'equal',
            status: 'pending',
            due_date: requestData.due_date,
            created_at: new Date().toISOString(),
        };

        const updatedRequests = [...requests, newRequest];
        storageSet(PAYMENT_REQUESTS_STORAGE_KEY, updatedRequests);
        set({ paymentRequests: updatedRequests.filter((r) => r.group_id === newRequest.group_id) });

        return newRequest;
    },

    updatePaymentRequestStatus: async (requestId: string, status: string) => {
        const requests = loadPaymentRequestsFromStorage();
        const updatedRequests = requests.map((r) =>
            r.id === requestId ? { ...r, status: status as any } : r
        );
        storageSet(PAYMENT_REQUESTS_STORAGE_KEY, updatedRequests);
        set({ paymentRequests: updatedRequests });
    },

    getGroupBalance: (groupId: string) => {
        const wallets = loadWalletsFromStorage();
        const wallet = wallets.find((w) => w.group_id === groupId);
        return wallet?.balance || 0;
    },

    getUserBalance: (userId: string, groupId: string) => {
        const transactions = loadTransactionsFromStorage();
        const wallets = loadWalletsFromStorage();
        const wallet = wallets.find((w) => w.group_id === groupId);

        if (!wallet) return 0;

        const userTransactions = transactions.filter(
            (t) => t.wallet_id === wallet.id && (t.from_user_id === userId || t.to_user_id === userId)
        );

        return userTransactions.reduce((acc, t) => {
            if (t.from_user_id === userId) {
                return acc + t.amount;
            } else if (t.to_user_id === userId) {
                return acc - t.amount;
            }
            return acc;
        }, 0);
    },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
    if (event.key === WALLETS_STORAGE_KEY || event.key === TRANSACTIONS_STORAGE_KEY) {
        // Refresh data on storage change
    }
});
