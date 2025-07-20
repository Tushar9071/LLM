// src/components/ProfileSetupRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileSetupRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isProfileComplete } = useAuth();

  // If user is not logged in, they can't set up a profile.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in AND their profile is already complete,
  // don't let them set it up again. Send them to the dashboard.
  if (isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // If logged in and profile is incomplete, show the setup page.
  return children;
};

export default ProfileSetupRoute;