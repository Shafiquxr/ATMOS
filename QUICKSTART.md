# ATMOS Quick Start Guide

Get up and running with ATMOS in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** installed
- A **Supabase account** (free tier is fine) - [Sign up here](https://supabase.com)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/atmos.git
cd atmos

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose an organization (create one if needed)
4. Fill in project details:
   - **Name**: atmos (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait for project to be provisioned (~2 minutes)

### Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Open the SQL migrations from `DATABASE_SCHEMA.md`
3. Copy and run each migration in order:
   - Migration 1: Core Tables
   - Migration 2: Tasks
   - Migration 3: Wallet & Transactions
   - Enable RLS policies
   - Create indexes
   - Create functions and triggers

Alternatively, you can copy the entire schema at once and execute it.

## Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional for now (can add later)
VITE_RAZORPAY_KEY=
VITE_GOOGLE_CLIENT_ID=
```

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

## Step 5: Explore the Application

### Landing Page

You should see the ATMOS landing page with:
- Hero section
- Feature cards
- Use case examples
- Call-to-action buttons

### Try Signing Up

1. Click "Sign Up" button
2. Fill in the form:
   - Full name
   - Email
   - Phone number
   - Password (must be 8+ characters with uppercase, lowercase, and digit)
   - Accept terms
3. Click "Sign Up"

**Note**: Currently, the authentication is a placeholder. To implement real auth:

1. Create `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. Install Supabase client:

```bash
npm install @supabase/supabase-js
```

3. Update the auth pages to use Supabase Auth (see `IMPLEMENTATION_GUIDE.md`)

### Dashboard

After "logging in" (currently redirects without real auth), you'll see:
- Welcome message
- Statistics cards
- Alerts section
- Groups list
- Quick actions

## Common Tasks

### Create a New Component

```bash
# Create a new component file
touch src/components/groups/MyNewComponent.tsx
```

```tsx
// src/components/groups/MyNewComponent.tsx
interface MyNewComponentProps {
  title: string;
}

export function MyNewComponent({ title }: MyNewComponentProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-mono font-bold">{title}</h2>
      <p>Component content here</p>
    </div>
  );
}
```

### Add a New Page

```bash
# Create a new page file
touch src/pages/MyNewPage.tsx
```

```tsx
// src/pages/MyNewPage.tsx
export function MyNewPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-mono font-bold mb-6">My New Page</h1>
        <div className="card">
          <p>Page content here</p>
        </div>
      </div>
    </div>
  );
}
```

Add route in `src/App.tsx`:

```tsx
import { MyNewPage } from './pages/MyNewPage';

// Inside Routes component:
<Route path="/my-new-page" element={<MyNewPage />} />
```

### Create a New Store

```bash
# Create a new store file
touch src/stores/myStore.ts
```

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  items: string[];
  increment: () => void;
  addItem: (item: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  items: [],
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));
```

Use in component:

```tsx
import { useMyStore } from '../stores/myStore';

function MyComponent() {
  const { count, increment } = useMyStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment} className="btn btn-primary">
        Increment
      </button>
    </div>
  );
}
```

### Styling with Tailwind

Use the predefined component classes:

```tsx
// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-outline">Outline</button>

// Cards
<div className="card">Content</div>
<div className="card card-hover">Hoverable card</div>

// Inputs
<input type="text" className="input" />
<label className="label">Label text</label>

// Badges
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-error">Error</span>

// Tables
<table className="table">
  <thead>
    <tr>
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

## Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Or run on a different port
npm run dev -- --port 3000
```

### Build Errors

If you get TypeScript errors:

```bash
# Check for errors
npm run lint

# Fix automatically fixable issues
npm run lint -- --fix
```

### Environment Variables Not Loading

Make sure:
1. File is named exactly `.env` (not `.env.txt`)
2. Variables start with `VITE_`
3. You restarted the dev server after creating/editing `.env`

### Supabase Connection Issues

Check:
1. Project URL is correct (should be `https://xxxxx.supabase.co`)
2. Anon key is correct (it's a long string)
3. No trailing spaces in `.env` file
4. Supabase project is active (not paused)

## Next Steps

Now that you have ATMOS running locally, you can:

1. **Read the Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for detailed instructions on implementing features
2. **Explore the Database Schema**: See `DATABASE_SCHEMA.md` for the complete database structure
3. **Check the Project Overview**: See `PROJECT_OVERVIEW.md` for the big picture
4. **Start Contributing**: See `CONTRIBUTING.md` for guidelines

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Git
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote

# Package management
npm install package-name        # Install a package
npm uninstall package-name      # Remove a package
npm update                      # Update all packages
```

## Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite**: https://vitejs.dev/
- **Supabase**: https://supabase.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Lucide Icons**: https://lucide.dev/

## Getting Help

If you run into issues:

1. Check existing GitHub issues
2. Read the documentation files
3. Ask in GitHub Discussions
4. Reach out on Discord (if available)

---

Happy coding! 🚀

**ATMOS - Manage your group like a digital institution.**
