import React, { useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const shakeAnimation: CSSProperties = shake
    ? {
      animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
    }
    : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/req-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      // Navigate to OTP page, pass data via state
      navigate("/otpForReset", {
        state: {
          email,
          newPassword,
          confirmPassword,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.4s ease forwards;
          }
        `}
      </style>
      <div
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        style={shakeAnimation}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your email and new password to receive a verification code
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg mb-6 flex items-center fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="fade-in">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all duration-200 border-gray-300 dark:border-gray-600"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all duration-200 border-gray-300 dark:border-gray-600"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              minLength={8}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all duration-200 border-gray-300 dark:border-gray-600"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;