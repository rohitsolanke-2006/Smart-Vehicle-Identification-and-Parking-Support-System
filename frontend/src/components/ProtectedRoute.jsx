import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their specific dashboard based on role
    switch (user.role) {
      case 'student': return <Navigate to="/student" replace />;
      case 'guard': return <Navigate to="/guard" replace />;
      case 'manager': return <Navigate to="/manager" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return children;
}
