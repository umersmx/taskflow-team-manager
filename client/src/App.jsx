import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import TeamDetail from './pages/TeamDetail';
import NotFound from './pages/NotFound';
import { Loader2 } from 'lucide-react';

/**
 * Route guard for authenticated routes
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Route guard for guest-only routes (login/register)
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
            },
          }}
        />

        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<GuestRoute><LoginForm /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterForm /></GuestRoute>} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
