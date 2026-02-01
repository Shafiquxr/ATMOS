# ATMOS - Project Overview

## Executive Summary

ATMOS (Adaptive Team Management & Operating System) is a comprehensive web application designed to manage groups like digital institutions. It combines project management, financial operations, member management, and compliance tracking in a single, unified platform with a distinctive minimalist black & white nostalgic aesthetic.

## Current Implementation Status

### ✅ Completed Features

1. **Project Infrastructure**
   - Vite + React + TypeScript setup
   - Tailwind CSS with custom nostalgic theme
   - ESLint configuration
   - Build system working correctly

2. **Design System**
   - Black & white color palette
   - Retro box shadows (4px hard offsets)
   - Monospace fonts for headers
   - Reusable component classes (buttons, cards, inputs, badges, modals)
   - Responsive design foundation

3. **Landing Page**
   - Hero section with value proposition
   - Feature showcase (6 key features)
   - Use case examples (4 scenarios)
   - Call-to-action sections
   - Responsive layout

4. **Authentication Pages**
   - Login page with email/password
   - Google OAuth integration UI
   - Sign-up page with validation
   - Password strength indicator
   - Remember me functionality
   - Terms acceptance checkbox

5. **Dashboard**
   - Welcome header with user greeting
   - Statistics cards (groups, tasks, wallet balance)
   - Alerts section for urgent items
   - Groups list with role badges
   - Quick actions panel
   - Navigation header with notifications

6. **Documentation**
   - Comprehensive README
   - Implementation guide with code examples
   - Complete database schema documentation
   - Contributing guidelines
   - Environment setup instructions

### 🚧 Pending Implementation

#### Phase 1: Backend Integration (Week 1-2)

1. **Database Setup**
   - Set up Supabase project
   - Run database migrations (19 tables)
   - Configure Row Level Security policies
   - Create database functions and triggers
   - Set up indexes for performance

2. **Authentication**
   - Implement Supabase Auth integration
   - Create auth store with Zustand
   - Add protected route component
   - Implement Google OAuth flow
   - Add OTP verification for phone
   - Password reset functionality

3. **API Service Layer**
   - Create Supabase client service
   - Build API wrapper functions
   - Implement error handling
   - Add request/response types

#### Phase 2: Core Features (Week 3-5)

4. **Groups Module**
   - Create group functionality
   - Edit group details
   - Group settings modal
   - Invite system (links & emails)
   - Join group flow
   - Archive/delete groups
   - Group detail page with tabs

5. **Members Management**
   - Members list with search/filter
   - Add/remove members
   - Role management
   - Permission matrix display
   - Sub-groups/teams creation
   - Team lead assignment
   - Member profile view

6. **Tasks Module**
   - Task board (Kanban view)
   - Task list (table view)
   - Create/edit tasks
   - Task assignment
   - Comments on tasks
   - File attachments
   - Status workflow
   - Proof of completion
   - Task filters and sorting

#### Phase 3: Financial System (Week 6-7)

7. **Wallet & Payments**
   - Wallet dashboard
   - Transaction history
   - Collect money flow
   - Payment request creation
   - Member payment tracking
   - Pay vendor functionality
   - Escrow management
   - Razorpay integration
   - Payment approval workflow
   - Export transactions

#### Phase 4: Vendors & Bookings (Week 8)

8. **Vendor Management**
   - Vendor directory with search
   - Vendor profiles
   - Rating and review system
   - Category filtering
   - Price range filtering

9. **Bookings**
   - Create booking flow
   - Escrow payment integration
   - Booking status tracking
   - Vendor confirmation
   - Booking completion
   - Release escrow funds

#### Phase 5: Compliance & Notifications (Week 9)

10. **Promise Tracker**
    - Create promise linked to task
    - Promise dashboard
    - Verification workflow
    - Trust score calculation
    - Penalty tracking
    - Promise history per member

11. **Notifications System**
    - In-app notification center
    - Real-time updates via Supabase
    - Email notifications (SendGrid/Resend)
    - SMS notifications (Twilio)
    - Notification preferences
    - Notification history

#### Phase 6: Analytics & Reports (Week 10)

12. **Reporting Module**
    - Financial reports
    - Task completion analytics
    - Member contribution reports
    - Group analytics dashboard
    - PDF export
    - CSV export
    - Charts and visualizations

#### Phase 7: Polish & Testing (Week 11-12)

13. **UI/UX Enhancements**
    - Loading states
    - Empty states
    - Error boundaries
    - Skeleton screens
    - Animations and transitions
    - Accessibility improvements

14. **Testing**
    - Unit tests for utilities
    - Component tests
    - E2E tests for critical flows
    - Performance optimization
    - Security audit

15. **Deployment**
    - Production build optimization
    - Environment configuration
    - CI/CD pipeline
    - Monitoring setup
    - Documentation finalization

## Technical Architecture

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Icons**: Lucide React
- **Forms**: React Hook Form (to be added)
- **Validation**: Zod
- **Date Handling**: date-fns
- **Charts**: Recharts (to be added)

### Backend Stack

- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Email**: SendGrid or Resend (to be integrated)
- **SMS**: Twilio (to be integrated)
- **Payments**: Razorpay (to be integrated)

### Infrastructure

- **Hosting**: Vercel or Netlify
- **Database**: Supabase Cloud
- **CDN**: Automatic via hosting provider
- **Monitoring**: (To be determined)

## Database Schema Summary

Total Tables: 19

**Core Tables:**
- profiles (1)
- groups (1)
- group_members (1)

**Task Management:**
- sub_groups (1)
- sub_group_members (1)
- tasks (1)
- task_comments (1)
- task_attachments (1)

**Financial:**
- wallets (1)
- transactions (1)
- payment_requests (1)
- payment_request_members (1)

**Vendor & Booking:**
- vendors (1)
- bookings (1)
- vendor_reviews (1)

**Compliance:**
- promises (1)

**System:**
- notifications (1)
- audit_logs (1)
- invite_links (1)

## User Roles & Permissions

### Role Hierarchy

1. **Owner**
   - Full control over group
   - Can delete group
   - Can change any settings
   - Can manage all aspects

2. **Organizer**
   - Manage tasks, members, bookings
   - Cannot delete group
   - Cannot change critical settings

3. **Team Lead**
   - Manage sub-group tasks
   - Assign tasks to team members
   - View team performance

4. **Finance Rep**
   - Manage wallet operations
   - Approve payments
   - View all transactions
   - Export financial reports

5. **Member**
   - View group information
   - Complete assigned tasks
   - Make payments when requested
   - Participate in activities

6. **Vendor**
   - External service provider
   - View booking details
   - Confirm bookings
   - Receive payments

## Key Features Summary

### 1. Group Management
- Create and manage multiple groups
- Categorize (Trip, Event, Project, Club)
- Set dates and locations
- Archive or delete groups
- Invite members via link or email

### 2. Member Management
- Add/remove members
- Assign roles with permissions
- Create sub-groups/teams
- View member profiles
- Track member contributions

### 3. Task Management
- Create tasks with assignments
- Set deadlines and priorities
- Add descriptions and attachments
- Comment on tasks
- Track completion with proof
- Kanban and list views

### 4. Wallet & Payments
- Group wallet with balance tracking
- Collect money from members
- Split payments (equal or custom)
- Pay vendors
- Escrow system for vendor payments
- Payment approval workflow
- Transaction history

### 5. Vendor & Bookings
- Browse vendor directory
- Filter by category and price
- View vendor profiles and reviews
- Book vendors
- Escrow advance payments
- Rate and review after service

### 6. Promise & Compliance
- Create promises linked to tasks
- Set deadlines
- Verify completion
- Track broken promises
- Calculate trust scores
- Enforce penalties

### 7. Notifications
- In-app notifications
- Email notifications
- SMS notifications
- Customizable preferences
- Real-time updates

### 8. Reports & Analytics
- Financial summary
- Task completion rates
- Member contributions
- Group health score
- Export to PDF/CSV
- Charts and visualizations

## Design Philosophy

### Visual Identity

**Minimalist Black & White Nostalgic Theme**

- **Colors**: Pure black (#000), white (#FFF), grays (nostalgic-50 to nostalgic-900)
- **Typography**: 
  - Headers: Courier New (monospace)
  - Body: Inter (sans-serif)
- **Shadows**: Retro box shadows (4px, 8px hard offsets)
- **Borders**: Solid 2px black borders
- **Corners**: Sharp or subtle rounded (max 4px)
- **Layout**: Card-based with generous whitespace
- **Icons**: Line-based (Lucide React)

### Design Principles

1. **Clarity over Decoration**
   - No gradients, no fancy effects
   - Clear visual hierarchy
   - High contrast for readability

2. **Functional Beauty**
   - Every element serves a purpose
   - Clean, uncluttered interfaces
   - Responsive and accessible

3. **Nostalgic Computing**
   - Inspired by classic terminal UIs
   - Retro shadows instead of modern soft shadows
   - Monospace fonts for emphasis
   - Binary simplicity (black/white)

4. **Modern Usability**
   - Responsive design
   - Touch-friendly
   - Keyboard navigation
   - Screen reader support

## Security Considerations

### Authentication Security
- Secure password hashing (handled by Supabase)
- JWT tokens with refresh mechanism
- Session management
- 2FA support (optional)

### Data Security
- Row Level Security (RLS) on all tables
- Input validation with Zod
- XSS prevention (React's built-in escaping)
- CSRF protection
- SQL injection prevention (parameterized queries)

### Financial Security
- Escrow system for vendor payments
- Payment approval workflow for large amounts
- Audit trail for all transactions
- Encrypted sensitive data

### Privacy
- GDPR compliant
- Data export functionality
- Account deletion
- Clear privacy policy

## Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Debounced search inputs
- Virtual scrolling for long lists
- React.memo for expensive components

### Backend
- Database indexes on frequently queried fields
- Pagination for large datasets
- Select only needed columns
- Database functions for complex queries
- Caching strategy for static data

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast ratio > 4.5:1
- Screen reader tested
- Alt text on images
- Form labels properly associated

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Mobile Chrome (Android 10+)

## Development Timeline

**Total Estimated Time: 12 weeks**

- Week 1-2: Backend setup & authentication
- Week 3-5: Core features (groups, members, tasks)
- Week 6-7: Financial system
- Week 8: Vendors & bookings
- Week 9: Compliance & notifications
- Week 10: Analytics & reports
- Week 11-12: Polish, testing & deployment

## Success Metrics

### Technical Metrics
- Build time < 2 seconds
- Page load time < 1 second
- Lighthouse score > 90
- Zero critical security vulnerabilities
- 100% type coverage

### User Experience Metrics
- Task completion rate
- User retention
- Feature adoption
- Average session duration
- User satisfaction (NPS)

## Future Enhancements (Post-MVP)

1. **Mobile Apps**
   - React Native for iOS and Android
   - Offline mode with sync

2. **Advanced Features**
   - AI-powered vendor recommendations
   - Budget forecasting
   - Automated task assignment
   - Smart payment reminders
   - Blockchain-based trust scores

3. **Integrations**
   - Calendar sync (Google, Outlook)
   - WhatsApp group integration
   - Slack/Discord notifications
   - Bank account connections
   - Accounting software export

4. **Enterprise Features**
   - White-label options
   - Custom branding
   - Advanced permissions
   - SSO integration
   - Dedicated support

## Getting Started

### For Developers

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Fill in environment variables
5. Run development server: `npm run dev`
6. Read `IMPLEMENTATION_GUIDE.md` for detailed instructions

### For Contributors

1. Read `CONTRIBUTING.md`
2. Check open issues
3. Fork the repository
4. Create a feature branch
5. Make your changes
6. Submit a pull request

### For Users

1. Visit the deployed application
2. Sign up for an account
3. Create your first group
4. Invite members
5. Start managing your group

## Support & Community

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@atmos.app (placeholder)
- **Discord**: (To be created)

## License

MIT License - See LICENSE file for details.

---

**ATMOS - Manage your group like a digital institution.**

Built with ❤️ using modern web technologies and a nostalgic design philosophy.
