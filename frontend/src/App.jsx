import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';

import LandingPage    from './pages/LandingPage';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import UserDashboard  from './pages/user/UserDashboard';
import CreateTicket   from './pages/user/CreateTicket';
import MyTickets      from './pages/user/MyTickets';
import TicketDetail   from './pages/user/TicketDetail';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets   from './pages/admin/AdminTickets';
import AdminUsers     from './pages/admin/AdminUsers';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const to = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
    return <Navigate to={to} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    const to = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
    return <Navigate to={to} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected shell */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"   element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/tickets/new" element={<ProtectedRoute roles={['user']}><CreateTicket /></ProtectedRoute>} />
        <Route path="/my-tickets"  element={<ProtectedRoute roles={['user']}><MyTickets /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/staff"         element={<ProtectedRoute roles={['staff','admin']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/tickets" element={<ProtectedRoute roles={['staff','admin']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/admin"         element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute roles={['admin']}><AdminTickets /></ProtectedRoute>} />
        <Route path="/admin/users"   element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px', borderRadius: '8px',
              padding: '10px 14px',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
              border: '1px solid #e2e8f0',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
