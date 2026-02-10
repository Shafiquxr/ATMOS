import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { TasksPage } from './pages/TasksPage';
import { WalletPage } from './pages/WalletPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';
import { useToastStore } from './stores/toastStore';
import { useAuthStore } from './stores/authStore';
import { useGroupStore } from './stores/groupStore';

function App() {
  const { toasts, removeToast } = useToastStore();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchGroups } = useGroupStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchGroups();
    }
  }, [isAuthenticated, user, fetchGroups]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </BrowserRouter>
  );
}

export default App;
