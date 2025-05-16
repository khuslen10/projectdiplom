import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme, { createAppTheme } from './theme';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Attendance from './pages/attendance/Attendance';
import LeaveRequests from './pages/leave/LeaveRequests';
import PerformanceReviews from './pages/performance/PerformanceReviews';
import Salary from './pages/salary/Salary';
import Changelog from './pages/changelog/Changelog';
import UserManagement from './pages/admin/UserManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';
import SalaryManagement from './pages/admin/SalaryManagement';
import Reports from './pages/reports/Reports';
import ApprovalDashboard from './pages/admin/ApprovalDashboard';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Create a ThemeContext
export const ColorModeContext = React.createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div>Ачаалж байна...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  // Get stored theme preference from localStorage
  const storedMode = localStorage.getItem('themeMode');
  const [mode, setMode] = useState(storedMode || 'light');
  const [appTheme, setAppTheme] = useState(createAppTheme(mode));
  
  // Color mode context value
  const colorMode = {
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', newMode);
        return newMode;
      });
    },
    mode,
  };
  
  // Update theme when mode changes
  useEffect(() => {
    setAppTheme(createAppTheme(mode));
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<AuthLayout />}>
                <Route index element={<Navigate to="/login" />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leave" element={<LeaveRequests />} />
                <Route path="performance" element={<PerformanceReviews />} />
                <Route path="salary" element={<Salary />} />
                <Route path="changelog" element={<Changelog />} />
                
                {/* Admin Routes */}
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/attendance" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AttendanceManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/leave" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <LeaveManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/performance" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <PerformanceManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/salary" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SalaryManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/approvals" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <ApprovalDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Reports Routes */}
                <Route path="reports" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Reports />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
