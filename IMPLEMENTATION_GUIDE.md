# ATMOS Implementation Guide

This guide provides step-by-step instructions for implementing the full ATMOS platform based on the minimalist black & white nostalgic theme.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Setup](#database-setup)
3. [Authentication Implementation](#authentication-implementation)
4. [Core Features Implementation](#core-features-implementation)
5. [UI Components](#ui-components)
6. [Integration Guide](#integration-guide)
7. [Deployment](#deployment)

---

## Project Setup

### Already Completed

✅ Vite + React + TypeScript configured
✅ Tailwind CSS with custom nostalgic theme
✅ Basic routing with React Router
✅ Landing page with feature showcase
✅ Login and signup pages with validation
✅ Dashboard with stats and groups list

### Next Steps

1. **Install Additional Dependencies**

```bash
npm install @supabase/supabase-js
npm install react-hook-form
npm install recharts  # For analytics charts
```

2. **Environment Setup**

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Database Setup

### Using Supabase (Recommended for MVP)

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migrations**

Create the following SQL migrations in Supabase SQL Editor:

#### Migration 1: Core Tables

```sql
-- Users table (extended from Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  start_date DATE,
  end_date DATE,
  location TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_status ON groups(status);
```

#### Migration 2: Tasks

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_group ON tasks(group_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

#### Migration 3: Wallet & Transactions

```sql
-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  escrow_balance DECIMAL(12, 2) DEFAULT 0.00,
  pending_balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  description TEXT,
  payment_method VARCHAR(50),
  payment_gateway_id TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment requests
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  amount DECIMAL(12, 2) NOT NULL,
  purpose TEXT NOT NULL,
  split_type VARCHAR(50) DEFAULT 'equal',
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_payment_requests_group ON payment_requests(group_id);
```

3. **Enable Row Level Security**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Groups: Members can view their groups
CREATE POLICY "Users can view groups they are members of" ON groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Group members: Members can view other members
CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Tasks: Group members can view tasks
CREATE POLICY "Group members can view tasks" ON tasks
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );
```

---

## Authentication Implementation

### Supabase Auth Setup

Create `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Auth Store with Zustand

Create `src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signUp: async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        phone,
      });
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
}));
```

### Protected Route Component

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Core Features Implementation

### 1. Groups Module

#### Group Store

Create `src/stores/groupStore.ts`:

```typescript
import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  owner_id: string;
  status: string;
  created_at: string;
}

interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (data: Partial<Group>) => Promise<void>;
  selectGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  selectedGroup: null,
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error);
    } else {
      set({ groups: data || [] });
    }
    set({ loading: false });
  },

  createGroup: async (groupData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .insert({
        ...groupData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: user.id,
      role: 'owner',
    });

    await supabase.from('wallets').insert({
      group_id: data.id,
    });

    await get().fetchGroups();
  },

  selectGroup: (id) => {
    const group = get().groups.find((g) => g.id === id);
    set({ selectedGroup: group || null });
  },
}));
```

#### Create Group Modal

Create `src/components/groups/CreateGroupModal.tsx`:

```typescript
import { useState } from 'react';
import { X } from 'lucide-react';
import { useGroupStore } from '../../stores/groupStore';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { createGroup } = useGroupStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'trip',
    start_date: '',
    end_date: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createGroup(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        category: 'trip',
        start_date: '',
        end_date: '',
        location: '',
      });
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-mono font-bold">Create New Group</h2>
          <button onClick={onClose} className="hover:bg-nostalgic-100 p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Group Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="trip">Trip</option>
              <option value="event">Event</option>
              <option value="project">Project</option>
              <option value="club">Club</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="label">
                Start Date
              </label>
              <input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="label">
                End Date
              </label>
              <input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## UI Components

### Button Component

Already implemented via Tailwind classes. Usage:

```tsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
```

### Card Component

```tsx
<div className="card">
  <h3 className="text-xl font-mono font-bold mb-4">Card Title</h3>
  <p>Card content goes here</p>
</div>
```

### Modal Component

Create `src/components/ui/Modal.tsx`:

```typescript
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-mono font-bold">{title}</h2>
          <button onClick={onClose} className="hover:bg-nostalgic-100 p-2">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">{children}</div>
        
        {footer && (
          <div className="p-6 border-t-2 border-black">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Integration Guide

### Razorpay Payment Integration

1. **Install Razorpay SDK**

```bash
npm install razorpay
```

2. **Create Payment Service**

Create `src/services/razorpay.ts`:

```typescript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  description: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

export function initiatePayment(options: PaymentOptions) {
  const { amount, currency, description, onSuccess, onError } = options;

  const razorpayOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: amount * 100, // Convert to paise
    currency,
    name: 'ATMOS',
    description,
    handler: onSuccess,
    modal: {
      ondismiss: () => onError(new Error('Payment cancelled')),
    },
    theme: {
      color: '#000000',
    },
  };

  const rzp = new window.Razorpay(razorpayOptions);
  rzp.open();
}
```

3. **Add Razorpay Script to HTML**

Add to `index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Deploy to Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

---

## Next Steps

1. **Complete remaining modules**:
   - Tasks management
   - Wallet & payments
   - Bookings & vendors
   - Promises tracker
   - Notifications
   - Reports & analytics

2. **Add real-time features**:
   - Supabase real-time subscriptions for live updates

3. **Implement file uploads**:
   - Supabase Storage for task attachments and proof uploads

4. **Add email notifications**:
   - SendGrid or Resend integration

5. **Testing**:
   - Unit tests with Vitest
   - E2E tests with Playwright

6. **Performance optimization**:
   - Code splitting
   - Lazy loading
   - Image optimization

---

This guide provides the foundation for implementing ATMOS. Follow each section systematically, and refer to the codebase for complete examples.
