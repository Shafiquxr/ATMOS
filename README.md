# ATMOS - Group Operating System

> A minimalist, black & white nostalgic-themed platform for managing groups like digital institutions.

## Overview

ATMOS (Adaptive Team Management & Operating System) is a comprehensive group management platform that combines:
- **Project Management**: Task assignment, tracking, and collaboration
- **Financial Management**: Group wallet, payment collection, vendor payments, escrow
- **Member Management**: Role-based access, teams, and permissions
- **Vendor Management**: Directory, bookings, and reviews
- **Compliance Tracking**: Promises, deadlines, and trust scores
- **Real-time Notifications**: In-app, email, and SMS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (minimalist black & white theme)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Database**: Bolt Database (PostgreSQL + Real-time)
- **Authentication**: Bolt Auth + Google OAuth
- **Payments**: Razorpay (UPI, Cards, Wallets)
- **Notifications**: Email (SendGrid/Resend) + SMS (Twilio)

## Design Philosophy

**Minimalist Black & White Nostalgic Theme**
- Pure black (#000) and white (#FFF) with grayscale accents
- Monospace fonts for headers (Courier New)
- Retro box shadows (4px hard offsets)
- Solid 2px black borders
- No gradients, no fancy effects - just clarity and function

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── groups/            # Group management
│   ├── members/           # Member management
│   ├── tasks/             # Task management
│   ├── wallet/            # Wallet & payments
│   ├── bookings/          # Vendor bookings
│   ├── promises/          # Promise tracking
│   ├── notifications/     # Notification center
│   └── ui/                # Reusable UI components
├── layouts/               # Page layouts
├── pages/                 # Route pages
├── stores/                # Zustand state stores
├── services/              # API & external services
├── utils/                 # Helper functions
├── schemas/               # Zod validation schemas
└── types/                 # TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Bolt Database account
- Razorpay account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for required variables:
- Bolt Database credentials
- Razorpay API keys
- Google OAuth credentials
- Email/SMS service credentials

## Features

### User Roles
- **Owner**: Full control over group
- **Organizer**: Manage tasks, members, and bookings
- **Team Lead**: Manage sub-group tasks
- **Finance Rep**: Handle payments and wallet operations
- **Member**: Participate in tasks and activities
- **Vendor**: External service providers

### Key Modules

1. **Dashboard**: Overview of all groups, tasks, and alerts
2. **Groups**: Create, manage, and archive groups
3. **Members & Teams**: Invite, assign roles, create sub-groups
4. **Tasks**: Kanban board, assignments, deadlines, proof tracking
5. **Wallet**: Collect payments, pay vendors, escrow system
6. **Bookings**: Vendor directory, booking management, reviews
7. **Promises**: Commitment tracking with trust scores
8. **Reports**: Financial, task completion, member contribution analytics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Functional components with hooks
- Controlled form components
- Zod for validation

## Documentation

- [Full Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API.md)
- [Design System](./docs/DESIGN_SYSTEM.md)

## Security

- Row-level security (RLS) in database
- Input validation with Zod
- XSS and CSRF protection
- Rate limiting on sensitive endpoints
- Audit logging for all critical operations
- GDPR compliant data handling

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Support

For issues and questions, please use GitHub Issues or contact support@atmos.app.

---

**Built with ❤️ for better group management**
