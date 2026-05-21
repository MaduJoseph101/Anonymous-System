import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import CaptchaWrapper from './components/shared/CaptchaWrapper';

import AdminLayout from './layouts/AdminLayout';
import Home from './pages/student/Home';
import SubmitReport from './pages/student/SubmitReport';
import TrackReport from './pages/student/TrackReport';
import TrackMessages from './pages/student/TrackMessages';
import RetractReport from './pages/student/RetractReport';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReportDetail from './pages/admin/ReportDetail';
import AdminAnalytics from './pages/admin/Analytics';
import AdminUsers from './pages/admin/Users';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-gray-600 mt-2 mb-6">Page not found</p>
      <a href="/" className="btn-primary inline-block">Return Home</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1f2937', color: '#fff' },
            success: { style: { background: '#065f46', color: '#fff' } },
            error: { style: { background: '#7f1d1d', color: '#fff' } }
          }}
        />
        <Routes>
          <Route element={<CaptchaWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/track" element={<TrackReport />} />
            <Route path="/track/messages" element={<TrackMessages />} />
            <Route path="/retract" element={<RetractReport />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/reports/:id" element={
            <ProtectedRoute><AdminReportDetail /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
