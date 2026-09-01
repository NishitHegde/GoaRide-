import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-cyan-400 font-bold">Loading GoaRide...</div>;
  }

  // Regular user routes require verification (admins bypass)
  const isAdmin = user?.role === 'ADMIN';
  if (!user || (!isAdmin && !user.isVerified)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-amber-500 font-extrabold text-xs">Loading Admin Console...</div>;
  }

  // Admin route requires role === 'ADMIN' (email verification not required for admin)
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
