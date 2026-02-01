// User and Profile Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
  password?: string; // For local storage only
}

export type UserRole = 'owner' | 'organizer' | 'team_lead' | 'finance_rep' | 'member' | 'vendor';

export type GroupStatus = 'active' | 'completed' | 'archived';

export type GroupCategory = 'trip' | 'event' | 'project' | 'club' | 'other';

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  category?: GroupCategory;
  start_date?: string;
  end_date?: string;
  location?: string;
  owner_id: string;
  status: GroupStatus;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  user?: User;
}

export interface SubGroup {
  id: string;
  group_id: string;
  name: string;
  description?: string;
  team_lead_id?: string;
  created_at: string;
  team_lead?: User;
  members?: User[];
}

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  group_id: string;
  sub_group_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  created_by?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  completed_at?: string;
  proof_url?: string;
  created_at: string;
  updated_at: string;
  assignee?: User;
  creator?: User;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: User;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  uploader?: User;
}

// Wallet and Transaction Types
export type TransactionType = 'collection' | 'payment' | 'escrow_lock' | 'escrow_release' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'netbanking';

export interface Wallet {
  id: string;
  group_id: string;
  balance: number;
  escrow_balance: number;
  pending_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  from_user_id?: string;
  to_user_id?: string;
  vendor_id?: string;
  description?: string;
  payment_method?: PaymentMethod;
  payment_gateway_id?: string;
  status: TransactionStatus;
  created_at: string;
  from_user?: User;
  to_user?: User;
}

export type SplitType = 'equal' | 'custom';
export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  group_id: string;
  created_by: string;
  amount: number;
  purpose: string;
  split_type: SplitType;
  status: PaymentRequestStatus;
  approved_by?: string;
  due_date?: string;
  created_at: string;
  creator?: User;
  approver?: User;
  member_payments?: PaymentRequestMember[];
}

export interface PaymentRequestMember {
  id: string;
  payment_request_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'exempted';
  paid_at?: string;
  user?: User;
}

// Vendor and Booking Types
export type VendorCategory = 'accommodation' | 'transport' | 'catering' | 'equipment' | 'venue' | 'other';
export type PriceRange = 'budget' | 'moderate' | 'premium';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  rating: number;
  total_reviews: number;
  price_range?: PriceRange;
  created_at: string;
}

export interface Booking {
  id: string;
  group_id: string;
  vendor_id: string;
  created_by: string;
  booking_date: string;
  amount: number;
  advance_amount: number;
  terms?: string;
  status: BookingStatus;
  escrow_transaction_id?: string;
  confirmed_at?: string;
  created_at: string;
  vendor?: Vendor;
  creator?: User;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  booking_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  user?: User;
}

// Promise Types
export type PromiseStatus = 'pending' | 'fulfilled' | 'broken';

export interface Promise {
  id: string;
  group_id: string;
  user_id: string;
  task_id?: string;
  promise_text: string;
  deadline: string;
  status: PromiseStatus;
  verification_proof_url?: string;
  verified_by?: string;
  verified_at?: string;
  penalty_amount: number;
  created_at: string;
  user?: User;
  verifier?: User;
  task?: Task;
}

// Notification Types
export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'payment_due'
  | 'payment_received'
  | 'booking_confirmed'
  | 'promise_deadline'
  | 'member_joined'
  | 'group_update'
  | 'general';

export interface Notification {
  id: string;
  user_id: string;
  group_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  send_email: boolean;
  send_sms: boolean;
  email_sent: boolean;
  sms_sent: boolean;
  created_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id?: string;
  group_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Invite Link Types
export interface InviteLink {
  id: string;
  group_id: string;
  code: string;
  created_by: string;
  max_uses?: number;
  uses_count: number;
  expires_at?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignUpFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

export interface CreateGroupFormData {
  name: string;
  description?: string;
  category?: GroupCategory;
  start_date?: string;
  end_date?: string;
  location?: string;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  assignee_id?: string;
  sub_group_id?: string;
  priority: TaskPriority;
  deadline?: string;
}
