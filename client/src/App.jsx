import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute, RoleRoute } from './routes/guards';
import MainLayout from './components/layout/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// App pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilesPage from './pages/profiles/ProfilesPage';
import JourneyPage from './pages/journey/JourneyPage';
import TicketsPage from './pages/tickets/TicketsPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import CampaignsPage from './pages/campaigns/CampaignsPage';
import AICenterPage from './pages/ai/AICenterPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Admin pages
import UsersPage from './pages/admin/UsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '10px',
              fontSize: '14px',
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
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Protected App Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Profiles */}
            <Route path="/profiles" element={
              <RoleRoute allowedRoles={['Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin']}>
                <ProfilesPage />
              </RoleRoute>
            } />

            {/* Journey */}
            <Route path="/journey" element={<JourneyPage />} />

            {/* Tickets */}
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />

            {/* Campaigns */}
            <Route path="/campaigns" element={
              <RoleRoute allowedRoles={['Marketing Manager', 'Admin']}>
                <CampaignsPage />
              </RoleRoute>
            } />

            {/* AI Center */}
            <Route path="/ai" element={
              <RoleRoute allowedRoles={['Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin']}>
                <AICenterPage />
              </RoleRoute>
            } />

            {/* Reports */}
            <Route path="/reports" element={
              <RoleRoute allowedRoles={['Marketing Manager', 'Sales Manager', 'Admin']}>
                <ReportsPage />
              </RoleRoute>
            } />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin */}
            <Route path="/admin/users" element={
              <RoleRoute allowedRoles={['Admin']}>
                <UsersPage />
              </RoleRoute>
            } />
            <Route path="/admin/audit" element={
              <RoleRoute allowedRoles={['Admin']}>
                <AuditLogsPage />
              </RoleRoute>
            } />
            <Route path="/admin/settings" element={
              <RoleRoute allowedRoles={['Admin']}>
                <SettingsPage />
              </RoleRoute>
            } />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen gap-4">
              <div className="text-8xl">404</div>
              <h1 className="text-2xl font-bold text-white">Page not found</h1>
              <a href="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline">Back to dashboard</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
