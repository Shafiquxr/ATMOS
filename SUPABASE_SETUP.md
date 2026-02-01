# Supabase Setup Guide for ATMOS

This guide will help you set up Supabase backend to persist your data in the cloud instead of localStorage. This ensures your data survives app uninstalls and works across multiple devices.

## 🚀 Quick Start

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Create a new project:
   - **Name**: `atmos-app` (or any name you prefer)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (Mumbai/Singapore for India)
   - **Pricing Plan**: Start with Free (can upgrade later)

3. Wait for your project to be provisioned (2-3 minutes)

### 2. Get Your API Keys

1. Once the project is ready, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy the following:
   - **Project URL** (starts with `https://`)
   - **anon public** API key

### 3. Configure Environment Variables

Update your `.env` file with the values you copied:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Replace**: `your_supabase_project_url` and `your_supabase_anon_key` with your actual values.

### 4. Set Up Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL commands one by one:

#### Users Table
```sql
create table users (
  id uuid references auth.users(id) primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  avatar_url text,
  is_phone_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table users enable row level security;

-- Allow users to view their own profile
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);create policy "Users can insert their own profile"
  on users for insert
  with check (auth.uid() = id);
```

#### Groups Table
```sql
create table groups (
  id text primary key,
  name text not null,
  description text,
  category text,
  start_date date,
  end_date date,
  location text,
  owner_id uuid references auth.users(id) not null,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table groups enable row level security;

create policy "View groups you're a member of"
  on groups for select
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "Users can create groups"
  on groups for insert
  with check (owner_id = auth.uid());

create policy "Group owner can update group"
  on groups for update
  using (owner_id = auth.uid());

create policy "Group owner can delete group"
  on groups for delete
  using (owner_id = auth.uid());
```

#### Group Members Table
```sql
create table group_members (
  id text primary key,
  group_id text references groups(id) not null,
  user_id uuid references auth.users(id) not null,
  role text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  contact_info text,
  unique(group_id, user_id)
);

alter table group_members enable row level security;

create policy "View group members if you're a member"
  on group_members for select
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Members can add other members"
  on group_members for insert
  with check (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );
```

#### Subgroups Table
```sql
create table subgroups (
  id text primary key,
  group_id text references groups(id) not null,
  name text not null,
  description text,
  team_lead_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table subgroups enable row level security;

create policy "View subgroups if you're a group member"
  on subgroups for select
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );
```

#### Tasks Table
```sql
create table tasks (
  id text primary key,
  group_id text references groups(id) not null,
  sub_group_id text references subgroups(id),
  title text not null,
  description text,
  assignee_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  status text default 'pending',
  priority text default 'medium',
  deadline timestamp with time zone,
  completed_at timestamp with time zone,
  proof_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tasks enable row level security;

create policy "View tasks if you're a group member"
  on tasks for select
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Members can create tasks"
  on tasks for insert
  with check (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );
```

#### Task Comments Table
```sql
create table task_comments (
  id text primary key,
  task_id text references tasks(id) not null,
  user_id uuid references auth.users(id) not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table task_comments enable row level security;

create policy "View comments if you're a group member"
  on task_comments for select
  using (
    task_id in (
      select id from tasks where group_id in (
        select group_id from group_members where user_id = auth.uid()
      )
    )
  );
```

#### Task Attachments Table
```sql
create table task_attachments (
  id text primary key,
  task_id text references tasks(id) not null,
  file_url text not null,
  file_name text not null,
  file_size integer not null,
  uploaded_by uuid references auth.users(id) not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now())
);

alter table task_attachments enable row level security;
```

#### Wallets Table
```sql
create table wallets (
  id text primary key,
  group_id text references groups(id) not null,
  balance numeric(12,2) default 0,
  escrow_balance numeric(12,2) default 0,
  pending_balance numeric(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table wallets enable row level security;

create policy "View wallet if you're a group member"
  on wallets for select
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );
```

#### Transactions Table
```sql
create table transactions (
  id text primary key,
  wallet_id text references wallets(id) not null,
  type text not null,
  amount numeric(12,2) not null,
  from_user_id uuid references auth.users(id),
  to_user_id uuid references auth.users(id),
  vendor_id text,
  description text,
  payment_method text,
  payment_gateway_id text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table transactions enable row level security;

create policy "View transactions if you're a group member"
  on transactions for select
  using (
    wallet_id in (
      select id from wallets where group_id in (
        select group_id from group_members where user_id = auth.uid()
      )
    )
  );
```

#### Payment Requests Table
```sql
create table payment_requests (
  id text primary key,
  group_id text references groups(id) not null,
  created_by uuid references auth.users(id) not null,
  amount numeric(12,2) not null,
  purpose text not null,
  split_type text not null,
  status text default 'pending',
  approved_by uuid references auth.users(id),
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table payment_requests enable row level security;
```

#### Payment Request Members Table
```sql
create table payment_request_members (
  id text primary key,
  payment_request_id text references payment_requests(id) not null,
  user_id uuid references auth.users(id) not null,
  amount numeric(12,2) not null,
  status text default 'pending',
  paid_at timestamp with time zone,
  unique(payment_request_id, user_id)
);

alter table payment_request_members enable row level security;
```

#### Vendors Table
```sql
create table vendors (
  id text primary key,
  name text not null,
  category text not null,
  description text,
  contact_name text,
  contact_phone text,
  contact_email text,
  address text,
  rating numeric(3,2) default 0,
  total_reviews integer default 0,
  price_range text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table vendors enable row level security;
```

#### Vendor Reviews Table
```sql
create table vendor_reviews (
  id text primary key,
  vendor_id text references vendors(id) not null,
  booking_id text,
  user_id uuid references auth.users(id) not null,
  rating integer not null,
  review text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table vendor_reviews enable row level security;
```

## 📱 How It Works

### Authentication Flow
1. User signs up → Creates Supabase auth user + profile in `users` table
2. User logs in → Supabase manages session with JWT tokens
3. Session persists across app restarts and reinstalls
4. Data automatically syncs from cloud

### Data Persistence
- **Real Data**: All data now stored in Supabase PostgreSQL database
- **Offline Cache**: User session cached in localStorage for offline access
- **Auto-sync**: Data fetches from Supabase on every screen load
- **Cross-device**: Login on any device to access same data

## ✅ Testing Your Setup

### Test in Browser
```bash
npm run dev
```

### Test on Android
```bash
# Build the app
npm run build

# Sync with Android
npx cap sync

# Open in Android Studio
npx cap open android
```

### Uninstall & Reinstall Test
1. Sign up and create some groups/tasks
2. Close the app
3. Uninstall the APK from your phone
4. Reinstall the APK
5. Log in with same credentials
6. ✅ All your data should be there!

## 🔧 Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart dev server after changes

#### "Failed to fetch" errors
- Check your internet connection
- Verify API keys are correct in `.env`
- Check Supabase project is active (not paused)

#### "RLS policy violation"
- Make sure Row Level Security policies are created
- Verify policies allow authenticated users to access their data
- Check that user is properly authenticated

#### "User already exists" on signup
- This is expected - Supabase auth persists across installs
- Use Login instead if user already exists
- Or delete user from Supabase dashboard (Auth → Users)

## 📊 Monitoring Your App

### Supabase Dashboard
- **Database**: View real-time data, run queries
- **Auth**: Manage users, view sessions
- **Storage**: Check if you're approaching limits
- **Logs**: Debug errors in real-time
- **Usage**: Track API calls and bandwidth

### Usage Limits (Free Tier)
- 50,000 monthly active users
- 500MB database size
- 1GB file storage
- 50GB bandwidth
- Good for testing and small groups

## 🔄 Migrating Existing Local Data (Optional)

If you have existing localStorage data you want to migrate:

```javascript
// Run this once in browser console after setting up Supabase
const migrateLocalToSupabase = async () => {
  const authData = localStorage.getItem('atmos_auth');
  if (!authData) return;
  
  console.log('Please manually re-create your groups and data in the new system');
  console.log('Old data structure is not compatible with cloud sync');
};
```

**Note**: Due to data structure changes, it's best to start fresh with the cloud version. Your users can simply re-create groups after logging in.

## 🎉 Success!

Your app now has:
- ✅ Cloud-based authentication (survives app uninstalls)
- ✅ Real database storage (no more localStorage limits)
- ✅ Cross-device sync (login from any phone)
- ✅ Backup and security (managed by Supabase)
- ✅ Scalability ready (upgrade plan as you grow)

## 📞 Need Help?

- Check [Supabase Docs](https://supabase.com/docs)
- Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema
- Check logs in Supabase dashboard for errors
- Make sure all SQL policies are created correctly

**Important**: Don't share your `.env` file or commit it to git. The `.gitignore` should already prevent this.