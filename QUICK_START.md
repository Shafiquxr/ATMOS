# ATMOS - Quick Start Guide

Get up and running with ATMOS in 5 minutes.

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:5173/

### 3. Build for Production
```bash
npm run build
```

---

## 🎯 First Steps

### Navigate the App

1. **Landing Page** (`/`)
   - Visit http://localhost:5173/
   - Click "Get Started" to go to login

2. **Login** (`/login`)
   - Enter any email and password (currently mock authentication)
   - You'll be redirected to the dashboard

3. **Dashboard** (`/dashboard`)
   - View your groups overview
   - See pending tasks and alerts
   - Quick actions to create groups

4. **My Groups** (`/groups`)
   - View all your groups
   - Create new groups
   - Search and filter

5. **Tasks** (`/tasks`)
   - View all tasks across groups
   - Filter by status and priority

6. **Wallet** (`/wallet`)
   - View wallet balances
   - See transaction history

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── auth/               # Auth components
│   │   └── ProtectedRoute.tsx
│   └── groups/             # Group components
│       ├── CreateGroupModal.tsx
│       └── GroupCard.tsx
├── layouts/
│   └── AppLayout.tsx       # Main app layout
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignUpPage.tsx
│   ├── DashboardPage.tsx
│   ├── GroupsPage.tsx
│   ├── TasksPage.tsx
│   ├── WalletPage.tsx
│   └── LandingPage.tsx
├── stores/
│   ├── authStore.ts        # Authentication state
│   ├── groupStore.ts       # Groups state
│   └── toastStore.ts       # Toast notifications
├── types/
│   └── index.ts            # TypeScript types
└── App.tsx                 # Main app component
```

---

## 🎨 Using UI Components

### Button
```tsx
import { Button } from '../components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

<Card hover>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```

### Modal
```tsx
import { Modal, ModalFooter } from '../components/ui/Modal';

<Modal isOpen={isOpen} onClose={onClose} title="My Modal">
  <p>Modal content</p>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>
```

### Toast Notifications
```tsx
import { useToastStore } from '../stores/toastStore';

const { addToast } = useToastStore();

// Success toast
addToast('success', 'Success!', 'Operation completed successfully');

// Error toast
addToast('error', 'Error!', 'Something went wrong');

// Warning toast
addToast('warning', 'Warning!', 'Please check this');

// Info toast
addToast('info', 'Info', 'Here is some information');
```

---

## 🔐 Authentication

Currently using **mock authentication**. To use:

```tsx
import { useAuthStore } from '../stores/authStore';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user?.full_name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

Wrap any route that requires authentication:

```tsx
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

---

## 🎨 Styling Guide

### Colors

The app uses a **minimalist black & white nostalgic theme**:

- `bg-black` - Pure black (#000)
- `bg-white` - Pure white (#FFF)
- `bg-nostalgic-50` to `bg-nostalgic-900` - Grayscale tones
- Accent colors (use sparingly):
  - `text-green-600` - Success
  - `text-red-600` - Error
  - `text-amber-600` - Warning
  - `text-blue-600` - Info

### Typography

- Headers: Use `font-mono font-bold` (Courier New)
- Body: Default sans-serif

### Shadows

- `shadow-retro-sm` - Small retro shadow
- `shadow-retro-md` - Medium retro shadow
- `shadow-retro-lg` - Large retro shadow

### Borders

Always use `border-2 border-black` for consistency.

### Example Component

```tsx
<div className="bg-white border-2 border-black shadow-retro-md p-4">
  <h2 className="font-mono font-bold text-2xl mb-2">Title</h2>
  <p className="text-nostalgic-600">Description text</p>
  <button className="mt-4 px-4 py-2 bg-black text-white border-2 border-black shadow-retro-sm hover:shadow-retro-md">
    Action
  </button>
</div>
```

---

## 📝 Common Tasks

### Adding a New Page

1. Create the page component in `src/pages/`:
```tsx
// src/pages/MyNewPage.tsx
import { AppLayout } from '../layouts/AppLayout';

export function MyNewPage() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-mono font-bold">My New Page</h1>
    </AppLayout>
  );
}
```

2. Add the route in `src/App.tsx`:
```tsx
import { MyNewPage } from './pages/MyNewPage';

<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

### Creating a New Component

1. Create in appropriate folder:
```tsx
// src/components/groups/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h3>{title}</h3>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

2. Use it in a page:
```tsx
import { MyComponent } from '../components/groups/MyComponent';

<MyComponent title="Hello" onAction={() => console.log('clicked')} />
```

### Adding a New Store

```tsx
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Usage in components:
import { useMyStore } from '../stores/myStore';

const { count, increment } = useMyStore();
```

---

## 🔧 Development Tips

### Hot Reload

Vite provides instant hot module replacement. Just save your files and see changes immediately.

### TypeScript Errors

Run type checking:
```bash
npm run build
```

### Linting

Check code quality:
```bash
npm run lint
```

### Preview Production Build

```bash
npm run build
npm run preview
```

---

## 🎯 Next Steps

See `CURRENT_STATUS.md` for:
- Detailed implementation status
- Pending features
- Architecture overview
- Next sprint priorities

See `DATABASE_SCHEMA.md` for:
- Complete database schema
- Table relationships
- RLS policies

See `IMPLEMENTATION_GUIDE.md` for:
- Backend integration steps
- Supabase setup
- Payment integration

---

## 📞 Need Help?

- Check existing components in `/src/components/ui/` for examples
- Look at existing pages for patterns
- Follow the minimalist black & white design theme
- Use TypeScript types from `/src/types/index.ts`

---

**Happy Coding! 🚀**
