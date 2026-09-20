import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import CreateTicket from './pages/user/CreateTicket';
import MyTickets from './pages/user/MyTickets';
import TicketDetail from './pages/user/TicketDetail';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminUsers from './pages/admin/AdminUsers';

// Route guards
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected - All roles via AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/tickets/new" element={<ProtectedRoute roles={['user']}><CreateTicket /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute roles={['user']}><MyTickets /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

        {/* Staff routes */}
        <Route path="/staff" element={<ProtectedRoute roles={['staff','admin']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/tickets" element={<ProtectedRoute roles={['staff','admin']}><StaffDashboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute roles={['admin']}><AdminTickets /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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
            style: { fontSize: '14px', borderRadius: '10px', padding: '12px 16px' },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
