# ATMOS Database Schema

Complete database schema for the ATMOS Group Operating System.

## Overview

The database is designed for PostgreSQL (via Supabase) with Row Level Security (RLS) enabled for all tables. The schema supports multi-tenant group management with role-based access control.

---

## Core Tables

### 1. profiles

Extends Supabase auth.users with additional user information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| phone | VARCHAR(20) | | Phone number |
| avatar_url | TEXT | | Profile picture URL |
| is_phone_verified | BOOLEAN | DEFAULT FALSE | Phone verification status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`

**RLS Policies:**
- SELECT: Public (all users can view all profiles)
- UPDATE: Users can only update their own profile

---

### 2. groups

Stores group/organization information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique group identifier |
| name | VARCHAR(255) | NOT NULL | Group name |
| description | TEXT | | Group description |
| category | VARCHAR(100) | | Group category (trip, event, project, club) |
| start_date | DATE | | Event/project start date |
| end_date | DATE | | Event/project end date |
| location | TEXT | | Physical location |
| owner_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Group owner |
| status | VARCHAR(50) | DEFAULT 'active' | Group status (active, completed, archived) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `owner_id`
- INDEX on `status`

**RLS Policies:**
- SELECT: Users can view groups they are members of
- INSERT: Any authenticated user can create groups
- UPDATE: Only owners and organizers can update
- DELETE: Only owners can delete

---

### 3. group_members

Junction table linking users to groups with roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique membership record |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | User reference |
| role | VARCHAR(50) | NOT NULL | User role (owner, organizer, team_lead, finance_rep, member, vendor) |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | Join timestamp |

**Constraints:**
- UNIQUE(group_id, user_id) - One membership per user per group

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `group_id`
- UNIQUE INDEX on `(group_id, user_id)`

**RLS Policies:**
- SELECT: Group members can view other members
- INSERT: Owners and organizers can add members
- UPDATE: Owners and organizers can change roles
- DELETE: Owners and organizers can remove members

---

## Task Management Tables

### 4. sub_groups

Teams/sub-groups within a main group.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique sub-group ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Parent group |
| name | VARCHAR(255) | NOT NULL | Sub-group name |
| description | TEXT | | Sub-group description |
| team_lead_id | UUID | REFERENCES auth.users(id) | Team lead user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### 5. sub_group_members

Members of sub-groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique membership |
| sub_group_id | UUID | REFERENCES sub_groups(id) ON DELETE CASCADE | Sub-group reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | User reference |

**Constraints:**
- UNIQUE(sub_group_id, user_id)

---

### 6. tasks

Task management and tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique task ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| sub_group_id | UUID | REFERENCES sub_groups(id) ON DELETE SET NULL | Optional sub-group |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | | Task description |
| assignee_id | UUID | REFERENCES auth.users(id) ON DELETE SET NULL | Assigned user |
| created_by | UUID | REFERENCES auth.users(id) | Task creator |
| status | VARCHAR(50) | DEFAULT 'pending' | Task status (pending, in_progress, review, completed) |
| priority | VARCHAR(50) | DEFAULT 'medium' | Priority (low, medium, high, urgent) |
| deadline | TIMESTAMPTZ | | Task deadline |
| completed_at | TIMESTAMPTZ | | Completion timestamp |
| proof_url | TEXT | | Proof of completion URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `group_id`
- INDEX on `assignee_id`
- INDEX on `status`

---

### 7. task_comments

Comments on tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique comment ID |
| task_id | UUID | REFERENCES tasks(id) ON DELETE CASCADE | Task reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Comment author |
| comment | TEXT | NOT NULL | Comment text |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### 8. task_attachments

File attachments for tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique attachment ID |
| task_id | UUID | REFERENCES tasks(id) ON DELETE CASCADE | Task reference |
| file_url | TEXT | NOT NULL | File storage URL |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_size | INTEGER | | File size in bytes |
| uploaded_by | UUID | REFERENCES auth.users(id) | Uploader user ID |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |

---

## Financial Tables

### 9. wallets

Group wallets for financial management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique wallet ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE, UNIQUE | Group reference (one wallet per group) |
| balance | DECIMAL(12, 2) | DEFAULT 0.00 | Available balance |
| escrow_balance | DECIMAL(12, 2) | DEFAULT 0.00 | Locked in escrow |
| pending_balance | DECIMAL(12, 2) | DEFAULT 0.00 | Pending payments |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### 10. transactions

All financial transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique transaction ID |
| wallet_id | UUID | REFERENCES wallets(id) ON DELETE CASCADE | Wallet reference |
| type | VARCHAR(50) | NOT NULL | Transaction type (collection, payment, escrow_lock, escrow_release, refund) |
| amount | DECIMAL(12, 2) | NOT NULL | Transaction amount |
| from_user_id | UUID | REFERENCES auth.users(id) | Source user |
| to_user_id | UUID | REFERENCES auth.users(id) | Destination user |
| vendor_id | UUID | REFERENCES vendors(id) | Vendor reference (if applicable) |
| description | TEXT | | Transaction description |
| payment_method | VARCHAR(50) | | Payment method (upi, card, wallet) |
| payment_gateway_id | TEXT | | Payment gateway transaction ID |
| status | VARCHAR(50) | DEFAULT 'pending' | Transaction status (pending, completed, failed, refunded) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `wallet_id`
- INDEX on `status`

---

### 11. payment_requests

Payment collection requests from members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique request ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| created_by | UUID | REFERENCES auth.users(id) | Request creator |
| amount | DECIMAL(12, 2) | NOT NULL | Total amount to collect |
| purpose | TEXT | NOT NULL | Purpose description |
| split_type | VARCHAR(50) | DEFAULT 'equal' | Split type (equal, custom) |
| status | VARCHAR(50) | DEFAULT 'pending' | Request status (pending, approved, rejected) |
| approved_by | UUID | REFERENCES auth.users(id) | Approver user ID |
| due_date | TIMESTAMPTZ | | Payment due date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### 12. payment_request_members

Individual member payment obligations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique record ID |
| payment_request_id | UUID | REFERENCES payment_requests(id) ON DELETE CASCADE | Payment request reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Member user ID |
| amount | DECIMAL(12, 2) | NOT NULL | Amount owed by this member |
| status | VARCHAR(50) | DEFAULT 'pending' | Payment status (pending, paid, exempted) |
| paid_at | TIMESTAMPTZ | | Payment timestamp |

---

## Vendor & Booking Tables

### 13. vendors

Service provider directory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique vendor ID |
| name | VARCHAR(255) | NOT NULL | Vendor name |
| category | VARCHAR(100) | NOT NULL | Service category (accommodation, transport, catering, equipment, venue) |
| description | TEXT | | Vendor description |
| contact_name | VARCHAR(255) | | Contact person name |
| contact_phone | VARCHAR(20) | | Contact phone |
| contact_email | VARCHAR(255) | | Contact email |
| address | TEXT | | Physical address |
| rating | DECIMAL(3, 2) | DEFAULT 0.00 | Average rating (0-5) |
| total_reviews | INTEGER | DEFAULT 0 | Total review count |
| price_range | VARCHAR(50) | | Price range (budget, moderate, premium) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### 14. bookings

Vendor bookings by groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique booking ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| vendor_id | UUID | REFERENCES vendors(id) ON DELETE CASCADE | Vendor reference |
| created_by | UUID | REFERENCES auth.users(id) | Booking creator |
| booking_date | DATE | NOT NULL | Service date |
| amount | DECIMAL(12, 2) | NOT NULL | Total booking amount |
| advance_amount | DECIMAL(12, 2) | DEFAULT 0.00 | Advance payment (escrow) |
| terms | TEXT | | Booking terms |
| status | VARCHAR(50) | DEFAULT 'pending' | Booking status (pending, confirmed, completed, cancelled) |
| escrow_transaction_id | UUID | REFERENCES transactions(id) | Escrow transaction reference |
| confirmed_at | TIMESTAMPTZ | | Confirmation timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### 15. vendor_reviews

Reviews and ratings for vendors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique review ID |
| vendor_id | UUID | REFERENCES vendors(id) ON DELETE CASCADE | Vendor reference |
| booking_id | UUID | REFERENCES bookings(id) ON DELETE CASCADE | Booking reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Reviewer user ID |
| rating | INTEGER | CHECK (rating >= 1 AND rating <= 5) | Rating (1-5 stars) |
| review | TEXT | | Review text |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE(booking_id, user_id) - One review per user per booking

---

## Compliance Tables

### 16. promises

Promise tracking for accountability.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique promise ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Promise maker |
| task_id | UUID | REFERENCES tasks(id) ON DELETE CASCADE | Related task |
| promise_text | TEXT | NOT NULL | Promise description |
| deadline | TIMESTAMPTZ | NOT NULL | Promise deadline |
| status | VARCHAR(50) | DEFAULT 'pending' | Status (pending, fulfilled, broken) |
| verification_proof_url | TEXT | | Proof URL |
| verified_by | UUID | REFERENCES auth.users(id) | Verifier user ID |
| verified_at | TIMESTAMPTZ | | Verification timestamp |
| penalty_amount | DECIMAL(12, 2) | DEFAULT 0.00 | Penalty for broken promise |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## Notification Tables

### 17. notifications

In-app and multi-channel notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique notification ID |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Recipient user ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Related group |
| type | VARCHAR(100) | NOT NULL | Notification type (task_assigned, payment_due, etc.) |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| send_email | BOOLEAN | DEFAULT TRUE | Send email flag |
| send_sms | BOOLEAN | DEFAULT FALSE | Send SMS flag |
| email_sent | BOOLEAN | DEFAULT FALSE | Email sent status |
| sms_sent | BOOLEAN | DEFAULT FALSE | SMS sent status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `is_read`

---

## Audit Tables

### 18. audit_logs

System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log ID |
| user_id | UUID | REFERENCES auth.users(id) | Acting user |
| group_id | UUID | REFERENCES groups(id) | Related group |
| action | VARCHAR(100) | NOT NULL | Action type |
| entity_type | VARCHAR(50) | NOT NULL | Entity type |
| entity_id | UUID | | Entity ID |
| old_values | JSONB | | Previous values |
| new_values | JSONB | | New values |
| ip_address | INET | | Client IP address |
| user_agent | TEXT | | Client user agent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `group_id`

---

### 19. invite_links

Group invitation links.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique link ID |
| group_id | UUID | REFERENCES groups(id) ON DELETE CASCADE | Group reference |
| code | VARCHAR(50) | UNIQUE, NOT NULL | Invite code |
| created_by | UUID | REFERENCES auth.users(id) | Link creator |
| max_uses | INTEGER | | Maximum uses (NULL = unlimited) |
| uses_count | INTEGER | DEFAULT 0 | Current use count |
| expires_at | TIMESTAMPTZ | | Expiration timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `code`

---

## Database Functions

### calculate_wallet_balance

Calculates current wallet balance from transactions.

```sql
CREATE OR REPLACE FUNCTION calculate_wallet_balance(wallet_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(
    CASE 
      WHEN type IN ('collection') THEN amount
      WHEN type IN ('payment', 'escrow_lock') THEN -amount
      WHEN type = 'escrow_release' THEN amount
      ELSE 0
    END
  ), 0)
  FROM transactions
  WHERE wallet_id = wallet_uuid AND status = 'completed';
$$ LANGUAGE SQL;
```

### update_updated_at_column

Automatically updates the `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

```sql
-- Update updated_at on groups
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on tasks
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on wallets
CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration Strategy

1. Run migrations in order
2. Enable RLS on all tables
3. Create RLS policies
4. Create indexes
5. Create functions and triggers
6. Seed initial data (vendors, etc.)

---

This schema provides a complete foundation for the ATMOS platform with support for multi-user groups, role-based access, task management, financial operations, vendor management, and comprehensive audit trails.
