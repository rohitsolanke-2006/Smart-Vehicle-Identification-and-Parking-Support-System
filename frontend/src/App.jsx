import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import EntryExit from './pages/guard/EntryExit';

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

          {/* Manager Routes (Placeholder for now) */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1>Manager Analytics Dashboard</h1>
                  <p>In development...</p>
                  <button onClick={() => { localStorage.removeItem('token'); window.location.href='/' }} className="btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Logout</button>
                </div>
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
