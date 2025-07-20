// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isProfileComplete } = useAuth();

  // If user is not logged in, redirect to login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in BUT their profile is not complete,
  // redirect them to the profile setup page.
  // if (!isProfileComplete) {
  //   // return <Navigate to="/profilesetup" replace />;
  // }

  // If logged in and profile is complete, show the page.
  return children;
};

export default ProtectedRoute;