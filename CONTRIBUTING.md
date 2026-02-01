# Contributing to ATMOS

Thank you for your interest in contributing to ATMOS! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Collaborate openly and constructively
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** explaining why this would be useful
- **Mockups or examples** if applicable
- **Implementation ideas** if you have any

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** (see below)
3. **Write clear commit messages**
4. **Update documentation** as needed
5. **Add tests** if applicable
6. **Ensure the build passes**: `npm run build`
7. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for database)

### Getting Started

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/atmos.git
   cd atmos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`

5. Start the development server:
   ```bash
   npm run dev
   ```

## Coding Style

### General Guidelines

- Use **TypeScript** for all new code
- Enable **strict mode** in TypeScript
- Use **functional components** with hooks (no class components)
- Follow **ESLint** rules (run `npm run lint`)
- Write **meaningful variable and function names**
- Add **comments** for complex logic only

### File Naming

- Components: `PascalCase.tsx` (e.g., `CreateGroupModal.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Stores: `camelCase.ts` with `Store` suffix (e.g., `authStore.ts`)
- Pages: `PascalCase.tsx` with `Page` suffix (e.g., `DashboardPage.tsx`)

### Component Structure

```tsx
import { useState } from 'react';
import { SomeIcon } from 'lucide-react';

interface MyComponentProps {
  title: string;
  onClose: () => void;
}

export function MyComponent({ title, onClose }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    // Handler logic
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### CSS/Tailwind Guidelines

- Use **Tailwind utility classes** when possible
- Follow the **nostalgic theme** (black, white, grays)
- Use **predefined component classes** (btn, card, input, etc.)
- Maintain **consistent spacing** (4px, 8px, 12px, 16px, 24px)
- Use **retro shadows** for depth (`shadow-retro`, `shadow-retro-sm`, `shadow-retro-lg`)

### State Management

- Use **Zustand** for global state
- Use **React useState** for local component state
- Keep stores **focused and minimal**
- Use **TypeScript interfaces** for store state

Example store:

```typescript
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Database Queries

- Use **Supabase client** for all database operations
- Handle **errors gracefully**
- Use **TypeScript types** for query results
- Implement **proper RLS policies**

Example:

```typescript
const { data, error } = await supabase
  .from('groups')
  .select('*')
  .eq('owner_id', userId);

if (error) {
  console.error('Error fetching groups:', error);
  return;
}
```

## Design System

### Colors

- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Grays**: nostalgic-50 through nostalgic-900
- **Accents**: Red (errors), Green (success), Yellow (warnings), Blue (info)

### Typography

- **Headers**: `font-mono` (Courier New)
- **Body**: `font-sans` (Inter, system-ui)
- **Sizes**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Spacing

- **Extra Small**: 4px (p-1, m-1)
- **Small**: 8px (p-2, m-2)
- **Medium**: 16px (p-4, m-4)
- **Large**: 24px (p-6, m-6)
- **Extra Large**: 32px (p-8, m-8)

### Components

Always use the predefined component classes:

- **Buttons**: `btn btn-primary`, `btn btn-secondary`, `btn btn-outline`
- **Cards**: `card`, optionally add `card-hover` for hover effects
- **Inputs**: `input`, `label`
- **Badges**: `badge badge-primary`, `badge-success`, etc.
- **Modals**: `modal-overlay`, `modal-content`

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Build succeeds**: `npm run build`
2. **No ESLint errors**: `npm run lint`
3. **Feature works** as expected in the browser
4. **Responsive** on mobile, tablet, and desktop
5. **Accessible** via keyboard navigation

### Writing Tests (Future)

- Use **Vitest** for unit tests
- Use **React Testing Library** for component tests
- Use **Playwright** for E2E tests

## Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Google OAuth login
fix(wallet): correct balance calculation
docs(readme): update installation instructions
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Pull Request Process

1. **Update documentation** if you've changed APIs
2. **Add yourself to contributors** if it's your first PR
3. **Link related issues** in the PR description
4. **Request review** from maintainers
5. **Address review comments**
6. **Squash commits** if requested
7. Wait for **approval and merge**

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord community (if available)
- Email the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ATMOS! 🚀
