import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signup = async (name, email, password) => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call for signup
      // Replace with actual API call
      const response = await fakeApiCall(name, email, password);
      setUser(response.user);
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call for OTP verification
      // Replace with actual API call
      const response = await fakeApiCallForOTP(otp);
      if (response.success) {
        // Handle successful OTP verification
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// Simulated API calls (to be replaced with actual implementations)
const fakeApiCall = async (name, email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ user: { name, email } });
    }, 1000);
  });
};

const fakeApiCallForOTP = async (otp) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: otp === '123456' }); // Example OTP check
    }, 1000);
  });
};