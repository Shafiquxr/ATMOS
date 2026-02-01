# ATMOS - Frequently Asked Questions

## Implementation Questions

### 1. Payment Gateway: Razorpay vs Stripe?

**Recommendation: Start with Razorpay**

**Razorpay is preferred for the MVP because:**

- **Better for Indian market**: Since ATMOS targets groups in India (trips, college events, etc.), Razorpay is the natural choice
- **UPI Integration**: Seamless UPI payments which are dominant in India
- **Local payment methods**: Supports Indian wallets, cards, net banking
- **Lower fees for domestic transactions**
- **Better documentation for Indian developers**
- **Local support and compliance** (RBI regulations)

**Architecture for flexibility:**

The payment gateway is abstracted in `src/services/payment.ts` so you can add Stripe later:

```typescript
// src/services/payment.ts
interface PaymentGateway {
  initiate(options: PaymentOptions): Promise<PaymentResult>;
  verify(paymentId: string): Promise<boolean>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
}

class RazorpayGateway implements PaymentGateway {
  // Razorpay implementation
}

class StripeGateway implements PaymentGateway {
  // Stripe implementation (future)
}

// Use factory pattern
export function getPaymentGateway(): PaymentGateway {
  const gateway = import.meta.env.VITE_PAYMENT_GATEWAY || 'razorpay';
  
  switch (gateway) {
    case 'stripe':
      return new StripeGateway();
    case 'razorpay':
    default:
      return new RazorpayGateway();
  }
}
```

**Future expansion:**
- Add Stripe for international groups
- Support both simultaneously with user/group preference
- Add PayPal, regional gateways as needed

---

### 2. Real-time Features: How real-time should it be?

**Recommendation: Hybrid approach**

**Real-time for critical features:**

✅ **These should update in real-time** (Supabase Realtime):

1. **Notifications**
   - New notification appears instantly
   - Badge count updates live
   - Push notifications

2. **Wallet Balance**
   - Balance updates when payment received
   - Transaction appears immediately

3. **Task Status Changes**
   - Status updates (e.g., "Completed") reflect instantly
   - New comments appear without refresh

4. **Member Activity**
   - "User X joined the group" shows immediately
   - "User Y completed task Z" updates live

**Implementation:**

```typescript
// src/services/realtime.ts
import { supabase } from './supabase';

export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      callback(payload.new as Notification);
    })
    .subscribe();
}

export function subscribeToGroupActivity(groupId: string, callback: (activity: Activity) => void) {
  return supabase
    .channel(`group:${groupId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `group_id=eq.${groupId}`,
    }, (payload) => {
      callback(payload.new as Activity);
    })
    .subscribe();
}
```

⏱️ **Periodic refresh is acceptable for:**

1. **Dashboard Statistics**
   - Refresh every 30 seconds or on page visit
   - Not critical to be instant

2. **Analytics/Reports**
   - Calculate on page load
   - No need for live updates

3. **Vendor Directory**
   - Static data, refresh on navigation
   - Reviews update on page reload

**Why hybrid?**
- **Performance**: Not everything needs real-time
- **Cost**: Supabase charges for realtime connections
- **Battery**: Real-time drains mobile battery
- **Complexity**: Simpler to implement and debug

**Best of both worlds:**
- Real-time where it matters (notifications, critical updates)
- Periodic refresh for less critical data
- Manual refresh button always available

---

### 3. Vendor Directory: Pre-populated marketplace vs. User-added vendors?

**Recommendation: Hybrid model with user-added vendors**

**Phase 1 (MVP): User-Added Vendors**

Each group can add their own vendors:

✅ **Pros:**
- Faster to launch (no vendor onboarding needed)
- Users know their local vendors best
- No moderation burden initially
- Groups can use vendors they trust

❌ **Cons:**
- No shared vendor database initially
- Each group maintains their own list
- Less discovery of new vendors

**Implementation:**

```typescript
// User can add vendor to their group
interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_phone: string;
  contact_email: string;
  added_by_group_id: string; // Who added this vendor
  is_public: boolean;         // Share with other groups?
}

// When creating vendor
async function addVendor(vendorData: Partial<Vendor>, groupId: string) {
  const { data, error } = await supabase
    .from('vendors')
    .insert({
      ...vendorData,
      added_by_group_id: groupId,
      is_public: false, // Private to group by default
    })
    .select()
    .single();
  
  return { data, error };
}
```

**Phase 2 (Future): Shared Marketplace**

Add a "public" vendor directory:

1. **Verified vendors**: ATMOS team verifies vendors
2. **User contributions**: Groups can make vendors public
3. **Rating system**: Aggregate ratings across all groups
4. **Featured vendors**: Promoted listings (monetization)

**Hybrid approach in practice:**

```typescript
// Vendor visibility levels
enum VendorVisibility {
  PRIVATE = 'private',       // Only visible to adding group
  PUBLIC = 'public',          // Visible to all groups
  VERIFIED = 'verified',      // Verified by ATMOS team
}

// When browsing vendors
async function getVendors(groupId: string, category?: string) {
  let query = supabase
    .from('vendors')
    .select('*')
    .or(`visibility.eq.public,visibility.eq.verified,added_by_group_id.eq.${groupId}`);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  return { data, error };
}
```

**Monetization path:**
- Free: Add private vendors
- Pro: Access verified vendor marketplace
- Featured: Vendors pay to be featured

---

## Design & Implementation Questions

### 4. Can I customize the color scheme?

Yes! The theme is defined in `tailwind.config.js`:

```javascript
// Change these values to customize colors
theme: {
  extend: {
    colors: {
      nostalgic: {
        50: '#fafafa',   // Lightest gray
        // ... customize all shades
        900: '#171717',  // Darkest gray
      },
    },
  },
}
```

For a different theme (e.g., blue and white):

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
}
```

Update `src/index.css` to use new colors:

```css
.btn-primary {
  @apply bg-primary-500 text-white;
}
```

### 5. How do I deploy ATMOS?

**Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# etc.
```

**Option 2: Netlify**

```bash
# Build command: npm run build
# Publish directory: dist

# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy
```

**Option 3: Traditional hosting**

```bash
# Build the app
npm run build

# Upload dist/ folder to your server
# Configure your web server (nginx, Apache) to serve the SPA
```

### 6. How scalable is this architecture?

**Current architecture supports:**

- **Users**: 10,000+ concurrent users (Supabase free tier handles this)
- **Groups**: Unlimited (database scales horizontally)
- **Transactions**: Millions (PostgreSQL is battle-tested)

**Bottlenecks to watch:**

1. **Supabase Free Tier Limits**:
   - 500 MB database storage
   - 2 GB file storage
   - 50 GB bandwidth/month
   - Solution: Upgrade to Pro ($25/month) for 8 GB database, 100 GB storage

2. **Real-time Connections**:
   - Free tier: 200 concurrent realtime connections
   - Solution: Use selective subscriptions, close inactive connections

3. **API Rate Limits**:
   - Supabase has rate limits on free tier
   - Solution: Implement client-side caching, upgrade plan

**Optimization strategies:**

1. **Database**:
   - Already has indexes on frequently queried fields
   - Use database functions for complex queries
   - Implement pagination (cursor-based)
   - Archive old data

2. **Frontend**:
   - Code splitting by route (already implemented in Vite)
   - Lazy load heavy components
   - Use React.memo for expensive components
   - Implement virtual scrolling for long lists

3. **Caching**:
   - Cache static data (vendor list, user profile)
   - Implement SWR (stale-while-revalidate)
   - Use service workers for offline support

**For enterprise scale (100,000+ users):**

- Migrate to self-hosted Supabase or PostgreSQL
- Add Redis for caching
- Use CDN for static assets
- Implement edge functions for compute-heavy operations
- Consider microservices for isolated features

---

## Feature-Specific Questions

### 7. How does the escrow system work?

**Escrow Flow:**

1. **Group books vendor**:
   - Group selects vendor
   - Enters booking details and advance amount
   - Advance gets locked in escrow

2. **Payment processing**:
   - User pays via Razorpay
   - Money goes to group wallet
   - System creates escrow transaction (locks funds)
   - Wallet balance decreases, escrow_balance increases

3. **Booking confirmed**:
   - Vendor confirms booking
   - Funds remain locked until service completed

4. **Service delivery**:
   - Event happens, service delivered
   - Group marks booking as complete
   - Optional: Rate and review vendor

5. **Escrow release**:
   - On booking completion
   - Funds transferred to vendor
   - escrow_balance decreases
   - Transaction created for vendor payment

**Database structure:**

```sql
-- Wallet tracks escrow separately
CREATE TABLE wallets (
  balance DECIMAL(12, 2),         -- Available funds
  escrow_balance DECIMAL(12, 2),  -- Locked funds
  pending_balance DECIMAL(12, 2)  -- Awaiting collection
);

-- Each escrow has linked transaction
CREATE TABLE bookings (
  escrow_transaction_id UUID REFERENCES transactions(id)
);

-- Transaction types
-- 'escrow_lock' - Lock funds for booking
-- 'escrow_release' - Release to vendor
-- 'escrow_refund' - Refund to group (if cancelled)
```

**Security:**

- Only Finance Rep or Owner can release escrow
- Audit log records all escrow operations
- Cannot release escrow without booking completion
- Refund policy configurable per booking

### 8. How do trust scores work?

**Trust Score Calculation:**

```typescript
interface TrustScore {
  userId: string;
  groupId: string;
  totalPromises: number;
  fulfilledPromises: number;
  brokenPromises: number;
  score: number; // 0-100
}

function calculateTrustScore(userId: string, groupId: string): number {
  const promises = await getPromisesForUser(userId, groupId);
  
  const total = promises.length;
  const fulfilled = promises.filter(p => p.status === 'fulfilled').length;
  const broken = promises.filter(p => p.status === 'broken').length;
  
  if (total === 0) return 100; // New users start at 100
  
  // Calculate score
  const score = Math.round((fulfilled / total) * 100);
  
  // Penalize broken promises more heavily
  const penalty = broken * 10; // -10 points per broken promise
  
  return Math.max(0, Math.min(100, score - penalty));
}
```

**Trust Score Effects:**

- **90-100**: Excellent - Badge shown on profile
- **70-89**: Good - Normal member
- **50-69**: Fair - Warning shown
- **Below 50**: Poor - May be restricted from critical tasks

**Improving trust score:**

1. Fulfill promises on time
2. Complete assigned tasks
3. Make payments on time
4. Active participation

**Trust score is per-group:**
- Different score in each group
- Actions in one group don't affect others
- Fresh start when joining new group

### 9. Can groups have sub-groups with independent wallets?

**Current design: Shared wallet**

In the current schema, all members share one group wallet:

```sql
CREATE TABLE wallets (
  group_id UUID UNIQUE -- One wallet per group
);
```

**Pros:**
- Simple to manage
- Clear visibility
- Easy reconciliation

**To implement sub-group wallets:**

1. **Modify schema:**

```sql
-- Add wallet level
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  sub_group_id UUID REFERENCES sub_groups(id),
  -- If sub_group_id is NULL, it's main wallet
);

-- Each sub-group can have its own wallet
ALTER TABLE wallets DROP CONSTRAINT wallets_group_id_key;
CREATE UNIQUE INDEX idx_wallets_main ON wallets(group_id) WHERE sub_group_id IS NULL;
CREATE UNIQUE INDEX idx_wallets_sub ON wallets(sub_group_id) WHERE sub_group_id IS NOT NULL;
```

2. **Wallet hierarchy:**

```typescript
interface WalletHierarchy {
  mainWallet: Wallet;           // Group-level wallet
  subWallets: Wallet[];         // Sub-group wallets
  consolidatedBalance: number;  // Total across all wallets
}

// Transfer between wallets
async function transferBetweenWallets(
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  reason: string
) {
  // Create debit transaction in from_wallet
  // Create credit transaction in to_wallet
  // Requires approval from both wallet managers
}
```

3. **Permission model:**

- Main wallet: Managed by group Finance Rep
- Sub-group wallet: Managed by Team Lead
- Transfers require multi-sig approval
- Sub-groups can request funds from main wallet

**Use case:**
- Main group: College Fest
- Sub-group 1: Events Team (budget: ₹50,000)
- Sub-group 2: Hospitality Team (budget: ₹30,000)
- Sub-group 3: Publicity Team (budget: ₹20,000)
- Each team manages their own budget independently

---

## Security & Privacy Questions

### 10. How is payment data secured?

**ATMOS never stores payment card details:**

1. **Razorpay handles sensitive data**:
   - Card numbers, CVV, etc. never touch our servers
   - PCI DSS compliant (Razorpay is PCI Level 1)
   - Tokenization for saved cards (handled by Razorpay)

2. **We only store**:
   - Transaction ID (from Razorpay)
   - Amount
   - Status (success/failed)
   - Timestamp
   - User reference

3. **Payment flow**:
   ```
   User → Razorpay Checkout (secure) → Payment Gateway
   ↓
   Webhook to ATMOS → Update transaction status
   ↓
   User sees confirmation
   ```

**Security measures:**

- HTTPS everywhere
- Environment variables for API keys
- Webhook signature verification
- Rate limiting on payment endpoints
- Audit logs for all financial operations

### 11. Can users delete their data (GDPR)?

**Yes, full GDPR compliance:**

**Data export:**

```typescript
// User can export all their data
async function exportUserData(userId: string): Promise<UserData> {
  const profile = await getProfile(userId);
  const groups = await getUserGroups(userId);
  const tasks = await getUserTasks(userId);
  const transactions = await getUserTransactions(userId);
  const promises = await getUserPromises(userId);
  
  return {
    profile,
    groups,
    tasks,
    transactions,
    promises,
    exportedAt: new Date().toISOString(),
  };
}
```

**Data deletion:**

```typescript
// User can request account deletion
async function deleteUserAccount(userId: string) {
  // 1. Transfer group ownership if user is owner
  await transferGroupOwnerships(userId);
  
  // 2. Anonymize financial records (can't delete for audit)
  await anonymizeTransactions(userId);
  
  // 3. Delete personal data
  await deleteProfile(userId);
  await deleteComments(userId);
  await deleteNotifications(userId);
  
  // 4. Soft delete user (mark as deleted)
  await supabase.auth.admin.deleteUser(userId);
}
```

**What happens to user's contributions:**

- **Comments**: Replaced with "Deleted User"
- **Tasks**: Remain but unassigned
- **Transactions**: Anonymized (amount preserved for reconciliation)
- **Promises**: Remain (compliance tracking)
- **Reviews**: Remain but anonymized

**User rights:**

- Right to access (export data)
- Right to erasure (delete account)
- Right to rectification (edit profile)
- Right to restrict processing (disable notifications)
- Right to data portability (export as JSON/CSV)

---

## Performance Questions

### 12. How many transactions can the wallet handle?

**Database capacity:**

PostgreSQL (via Supabase) can handle:
- **Millions of rows** easily
- **Thousands of transactions per second** with proper indexing
- **Complex queries** with joins across multiple tables

**Current indexes:**

```sql
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
```

**Pagination for large datasets:**

```typescript
// Cursor-based pagination for scalability
async function getTransactions(
  walletId: string,
  cursor?: string,
  limit: number = 50
) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  
  const { data, error } = await query;
  
  return {
    transactions: data || [],
    nextCursor: data?.[data.length - 1]?.created_at,
  };
}
```

**Real-world numbers:**

- Group with 1,000 members
- 100 transactions per member per year
- Total: 100,000 transactions
- Database size: ~10 MB (highly compressible)
- Query time: <100ms with proper indexes

**Optimization for millions of transactions:**

1. **Partitioning**: Split table by date ranges
2. **Archiving**: Move old transactions to separate table
3. **Materialized views**: Pre-compute aggregates
4. **Caching**: Cache recent transactions

### 13. How fast do notifications arrive?

**Real-time notifications (Supabase):**

- **Latency**: ~100-500ms from database insert to client
- **Delivery**: Push via WebSocket
- **Reliability**: Automatic reconnection on disconnect

**Email notifications:**

- **Latency**: ~2-10 seconds (SendGrid/Resend)
- **Reliability**: 99.9% delivery rate
- **Retries**: Automatic with exponential backoff

**SMS notifications:**

- **Latency**: ~2-30 seconds (Twilio)
- **Reliability**: 98% delivery rate (network dependent)
- **Cost**: ₹0.50-1.00 per SMS (use sparingly)

**Notification strategy:**

```typescript
// Priority-based notification
enum NotificationPriority {
  CRITICAL = 'critical',  // In-app + Email + SMS
  HIGH = 'high',          // In-app + Email
  MEDIUM = 'medium',      // In-app only
  LOW = 'low',            // In-app only
}

// Examples
const notificationRules = {
  'payment_overdue': NotificationPriority.CRITICAL,
  'task_overdue': NotificationPriority.HIGH,
  'task_assigned': NotificationPriority.MEDIUM,
  'member_joined': NotificationPriority.LOW,
};
```

---

## Customization Questions

### 14. Can I white-label ATMOS?

**For MVP: No**

The current design has "ATMOS" branding throughout. To make it white-labelable:

**Changes needed:**

1. **Environment configuration:**

```env
VITE_APP_NAME=Your App Name
VITE_APP_LOGO_URL=/path/to/logo.png
VITE_PRIMARY_COLOR=#000000
VITE_SECONDARY_COLOR=#FFFFFF
```

2. **Dynamic branding:**

```typescript
// src/config/branding.ts
export const branding = {
  name: import.meta.env.VITE_APP_NAME || 'ATMOS',
  logo: import.meta.env.VITE_APP_LOGO_URL || '/atmos-logo.svg',
  colors: {
    primary: import.meta.env.VITE_PRIMARY_COLOR || '#000000',
    secondary: import.meta.env.VITE_SECONDARY_COLOR || '#FFFFFF',
  },
};

// Use in components
import { branding } from '../config/branding';

<h1>{branding.name}</h1>
```

3. **Multi-tenant architecture:**

```sql
-- Add tenant/organization table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  domain VARCHAR(255) UNIQUE
);

-- Link groups to organizations
ALTER TABLE groups ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

**White-label pricing (future):**
- Self-hosted: Free (MIT license)
- Cloud: $99/month per organization
- Enterprise: Custom pricing

### 15. Can I add custom fields to groups/tasks?

**Current: Fixed schema**

To add custom fields:

**Option 1: JSONB column (flexible)**

```sql
-- Add custom_fields column
ALTER TABLE groups ADD COLUMN custom_fields JSONB;
ALTER TABLE tasks ADD COLUMN custom_fields JSONB;

-- Example usage
UPDATE groups 
SET custom_fields = '{"trip_theme": "Beach", "transport_mode": "Bus"}'
WHERE id = 'group-id';

-- Query with JSONB
SELECT * FROM groups 
WHERE custom_fields->>'trip_theme' = 'Beach';
```

**Option 2: Field templates**

```sql
-- Define custom field templates
CREATE TABLE field_templates (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50), -- 'group' or 'task'
  field_name VARCHAR(100),
  field_type VARCHAR(50),  -- 'text', 'number', 'date', 'select'
  options JSONB,           -- For select fields
  required BOOLEAN
);

-- Link custom values
CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY,
  field_template_id UUID REFERENCES field_templates(id),
  entity_id UUID,
  entity_type VARCHAR(50),
  value TEXT
);
```

**UI for custom fields:**

```tsx
// Dynamic form rendering
function CustomFieldsForm({ fieldTemplates, values, onChange }) {
  return (
    <>
      {fieldTemplates.map(field => (
        <div key={field.id}>
          <label>{field.field_name}</label>
          {field.field_type === 'text' && (
            <input
              type="text"
              value={values[field.field_name] || ''}
              onChange={(e) => onChange(field.field_name, e.target.value)}
            />
          )}
          {field.field_type === 'select' && (
            <select
              value={values[field.field_name] || ''}
              onChange={(e) => onChange(field.field_name, e.target.value)}
            >
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </>
  );
}
```

---

## Need More Help?

**Documentation:**
- `README.md` - Project overview
- `QUICKSTART.md` - Get started in 10 minutes
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation steps
- `DATABASE_SCHEMA.md` - Complete database structure
- `CONTRIBUTING.md` - How to contribute

**Community:**
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and ideas
- Discord - Real-time chat (coming soon)

**Contact:**
- Email: support@atmos.app (placeholder)
- Twitter: @atmosapp (placeholder)

---

**Still have questions? Create a GitHub issue with the `question` label!**
