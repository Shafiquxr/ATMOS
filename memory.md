# ATMOS - Group Operating System

## Project Overview
ATMOS is a minimalist black & white themed group management platform that combines project management, financial management, member management, and compliance tracking.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (minimalist black & white nostalgic theme)
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

## Code Style & Conventions
- Use functional components with hooks
- TypeScript strict mode enabled
- No comments unless complex logic
- Use Zustand stores for global state management
- Use controlled components for forms
- Follow existing UI component patterns from `/src/components/ui`

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
- `npm run build` - Build for production (TypeScript + Vite with --skipLibCheck)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Modal, etc.)
│   ├── auth/            # Authentication components
│   ├── groups/           # Group management components (tabs, modals)
├── layouts/             # Page layouts (AppLayout)
├── pages/               # Route pages
├── stores/              # Zustand state stores with localStorage persistence
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (ID gen, storage, security)
```

## Implemented Features
1. ✅ Authentication pages (Login, SignUp) with password storage
2. ✅ Dashboard with real-time stats from stores
3. ✅ Groups page with full CRUD functionality
4. ✅ Group Detail page with tabs (Overview, Members, Tasks, Wallet, Bookings, Vendors, Reports)
5. ✅ Tasks page with filtering and status management
6. ✅ Wallet page with transaction history
7. ✅ UI component library (Button, Card, Modal, Badge, Toast, Input, Skeleton)
8. ✅ AppLayout with navigation and notification badge
9. ✅ Protected routes with authentication
10. ✅ Toast notifications globally managed
11. ✅ Complete state management with localStorage persistence

## Stores Created
- **authStore**: User authentication, login/signup, password management
- **groupStore**: Group CRUD, member management, subgroups
- **taskStore**: Task management, comments, attachments
- **walletStore**: Wallet management, transactions, payments, escrow
- **vendorStore**: Vendor management, reviews
- **bookingStore**: Booking management with escrow integration
- **notificationStore**: Notification management with read status

## Utilities Created
- **idGenerator**: Unique ID generation (timestamp + random)
- **storage**: localStorage wrapper functions (get, set, remove, clear)
- **security**: Input validation, sanitization, OWASP best practices

## Security Implementation
- Input validation and sanitization (XSS prevention)
- Password strength validation
- Email validation and sanitization
- Phone number sanitization
- Amount validation (min/max limits)
- Type safety with TypeScript

## Data Persistence
All data is persisted in localStorage with keys:
- atmos_auth - Current logged-in user
- atmos_users - All registered users (for demo/auth)
- atmos_groups - All groups
- atmos_members - Group memberships
- atmos_subgroups - Group sub-teams
- atmos_tasks - All tasks
- atmos_task_comments - Task comments
- atmos_task_attachments - Task attachments
- atmos_wallets - Group wallets
- atmos_transactions - All transactions
- atmos_payment_requests - Payment collection requests
- atmos_payment_request_members - Payment request member payments
- atmos_bookings - Vendor bookings
- atmos_vendors - Vendor list
- atmos_vendor_reviews - Vendor reviews
- atmos_notifications - User notifications
- atmos_current_group - Currently selected group

## To Be Implemented
- Backend integration (Supabase/Bolt Database)
- Real authentication with JWT
- Real-time updates with WebSockets
- Payment gateway integration (Razorpay)
- Email/SMS notification services
- Promise tracking completion
- Reports export to PDF

## Important Notes
- All pages use AppLayout for consistent navigation
- Toast notifications are globally managed via useToastStore
- Authentication state is managed via useAuthStore
- User data includes password field for localStorage storage only
- All IDs are generated as timestamp + random string format
- All create/update/delete operations persist to localStorage
- Navigation flows are properly implemented across all pages

## Build Notes
The project uses `tsc --skipLibCheck && vite build` for the build command to work around some TypeScript library check issues while still providing type safety for application code.
