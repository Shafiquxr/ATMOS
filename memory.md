# ATMOS - Group Operating System

## Project Overview
ATMOS is a minimalist black & white themed group management platform that combines project management, financial management, member management, and compliance tracking.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (minimalist black & white nostalgic theme)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL + Realtime)
- **Payments**: To be integrated with Razorpay

## Code Style & Conventions
- Use functional components with hooks
- TypeScript strict mode enabled
- No comments unless complex logic
- Use Zustand stores for global state management
- Use controlled components for forms
- Follow existing UI component patterns from `/src/components/ui`
- **IMPORTANT**: Never use `await` outside async functions - use store arrays instead of async getters in render methods

## Design System
- **Colors**: Pure black (#000) and white (#FFF) with nostalgic grayscale tones
- **Typography**: 
  - Headers: `font-mono` (Courier New)
  - Body: Default sans-serif (Inter)
- **Borders**: 2px solid black
- **Shadows**: Retro box shadows (shadow-retro-sm, shadow-retro-md, shadow-retro-lg)
- **Components**: Card-based layouts with consistent spacing

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Modal, etc.)
│   ├── auth/            # Authentication components
│   ├── groups/          # Group management components
│   ├── members/         # Member management components
│   ├── tasks/           # Task management components
│   ├── wallet/          # Wallet & payment components
│   └── ...
├── layouts/             # Page layouts (AppLayout)
├── pages/               # Route pages
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (supabase, security, storage, etc.)
```

## Critical Patterns

### ✅ Correct: Synchronous Data Access in Render
```typescript
export function MyComponent() {
  const { wallets } = useWalletStore();  // Get array from store
  
  const wallet = wallets.find((w) => w.group_id === groupId);  // Synchronous lookup
  
  return <div>{wallet?.balance}</div>;
}
```

### ❌ Incorrect: Async Operations in Render
```typescript
export function MyComponent() {
  const { getGroupWallet } = useWalletStore();
  
  const wallet = await getGroupWallet(groupId);  // ❌ Error: await outside async
  
  return <div>{wallet?.balance}</div>;
}
```

### ✅ Correct: Async Operations in Effects/Handlers
```typescript
export function MyComponent() {
  const { fetchGroupWallet } = useWalletStore();
  
  useEffect(() => {
    const loadWallet = async () => {
      await fetchGroupWallet(groupId);  // ✅ OK in async function
    };
    loadWallet();
  }, [groupId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createGroup(data);  // ✅ OK in async handler
  };
}
```

## Real-time Synchronization

### Setup
All pages displaying real-time data should:
1. Subscribe to updates on mount
2. Unsubscribe on unmount

```typescript
useEffect(() => {
  if (user) {
    fetchGroups();
    subscribeToRealtimeUpdates();
  }
  
  return () => {
    unsubscribeFromRealtimeUpdates();
  };
}, [user, fetchGroups, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates]);
```

### Tables with Realtime Enabled
- `groups` - Group creation, updates, deletion
- `group_members` - Member additions, removals, role changes
- More to be added: `tasks`, `transactions`, `bookings`, etc.

## State Management Best Practices

### Store Structure
Each store should have:
- State arrays (groups, wallets, tasks, etc.)
- Loading states (isLoading)
- Realtime channels (realtimeChannel)
- Sync getters (getGroupMembers, getGroupTasks)
- Async actions (fetchGroups, addGroup, updateGroup)
- Realtime methods (subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates)
- Storage methods (loadFromStorage, saveToStorage, clearLocalData)

### Cleanup on Logout
Always cleanup subscriptions and local data:
```typescript
logout: async () => {
  const { useGroupStore } = await import('./groupStore');
  useGroupStore.getState().clearLocalData();
  
  await supabase.auth.signOut();
  storageRemove(AUTH_STORAGE_KEY);
}
```

## Environment Setup

### Required Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Files
- `.env` - Local environment variables (gitignored)
- `.env.example` - Template for environment variables (committed)

## Implemented Features
1. ✅ Authentication pages (Login, SignUp) with Supabase Auth
2. ✅ Dashboard with stats and alerts
3. ✅ Groups page with CRUD and real-time sync
4. ✅ Group detail page with tabs (Overview, Members, Tasks, Wallet, Bookings, Vendors, Reports)
5. ✅ Tasks page with filtering
6. ✅ Wallet page with transactions
7. ✅ UI component library (Button, Card, Modal, Badge, Toast, Input, Skeleton)
8. ✅ AppLayout with navigation
9. ✅ Protected routes
10. ✅ State management (Auth, Groups, Wallet, Tasks, Toast)
11. ✅ Real-time synchronization for groups and members
12. ✅ Loading states and error handling

## To Be Implemented
- Task CRUD operations
- Member invitation system
- Vendor management
- Booking system with escrow
- Promises tracking
- Advanced notifications system
- Reports & analytics export
- Payment integration (Razorpay)
- File uploads (attachments, avatars)
- Email/SMS notifications
- PWA features for mobile

## Common Issues & Solutions

### Issue: "await outside async function"
**Solution**: Use store arrays in render, not async getters
```typescript
// ❌ const wallet = await getGroupWallet(groupId);
// ✅ const wallet = wallets.find(w => w.group_id === groupId);
```

### Issue: Groups not appearing after creation
**Solution**: 
1. Ensure `addGroup()` is awaited
2. Fetch groups on component mount
3. Subscribe to realtime updates

### Issue: Changes not syncing across devices
**Solution**: 
1. Enable Supabase Realtime replication
2. Subscribe to table changes in store
3. Update local state on realtime events

### Issue: Memory leaks
**Solution**: 
1. Unsubscribe from realtime on unmount
2. Cleanup subscriptions on logout
3. Use useEffect cleanup functions

## Important Notes
1. All pages use AppLayout for consistent navigation
2. Toast notifications are globally managed via useToastStore
3. Authentication state is managed via useAuthStore
4. Real-time sync is handled by individual stores (groupStore, etc.)
5. Always test with multiple devices/browsers to verify sync
6. TypeScript strict mode is enabled - no implicit any
7. Build must complete without errors before committing

## Database Schema Notes
- All tables use UUID primary keys
- Timestamps: created_at, updated_at (auto-managed)
- RLS (Row Level Security) must be configured for all tables
- Foreign keys use ON DELETE CASCADE where appropriate
- Indexes on frequently queried columns (user_id, group_id, etc.)

## Performance Considerations
- Use `skipLibCheck` in tsconfig for faster builds
- Lazy load heavy components/pages when possible
- Debounce search inputs
- Paginate large lists
- Cache wallet data to avoid repeated fetches
- Optimize Supabase queries with proper select statements

## Security Best Practices
- Sanitize all user inputs (use utils/security.ts)
- Validate amounts before financial operations
- Use Supabase RLS for data access control
- Never expose sensitive keys in client code
- Implement proper authentication checks
- Validate user permissions before operations

## Testing Strategy
- Manual testing on multiple devices/browsers
- Test real-time sync with 2+ simultaneous sessions
- Test error scenarios (network failures, invalid data)
- Verify loading states appear correctly
- Check mobile responsiveness
- Test on actual mobile devices (not just browser devtools)

---
**Last Updated**: February 2, 2026
**Project Status**: Core features implemented, backend integrated, real-time sync working
