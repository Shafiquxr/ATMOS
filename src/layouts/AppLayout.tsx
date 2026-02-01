import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, Users, LayoutDashboard, Wallet, ClipboardList, UserCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();

  const handleLogout = () => {
    logout();
    addToast('success', 'Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'My Groups', path: '/groups' },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
  ];

  return (
    <div className="min-h-screen bg-nostalgic-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center">
                <span className="text-white font-mono font-bold text-lg">A</span>
              </div>
              <span className="font-mono font-bold text-xl hidden sm:inline">ATMOS</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-nostalgic-100 transition-colors"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="p-2 hover:bg-nostalgic-100 relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-nostalgic-100 transition-colors">
                  <UserCircle size={20} />
                  <span className="hidden sm:inline text-sm">{user?.full_name || 'User'}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-nostalgic-100 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-nostalgic-100 transition-colors text-left border-t-2 border-nostalgic-200"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-40">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 p-3 hover:bg-nostalgic-100 transition-colors flex-1"
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
