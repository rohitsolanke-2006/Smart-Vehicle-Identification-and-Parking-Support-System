import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import EntryExit from './pages/guard/EntryExit';
import Analytics from './pages/manager/Analytics';

// Pages
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/student/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<LoginPage />} />

          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Guard Routes */}
          <Route 
            path="/guard/*" 
            element={
              <ProtectedRoute allowedRoles={['guard']}>
                <EntryExit />
              </ProtectedRoute>
            } 
          />

          {/* Manager Routes */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/analytics" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
