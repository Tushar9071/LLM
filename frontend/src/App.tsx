import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";

// Pages
import LandingPage from "./pages/LandingPage";
import AIChatPage from "./pages/AIChatPage";
import DailyChallengesPage from "./pages/DailyChallengesPage";
import OCRScanPage from "./pages/OCRScanPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/otppage";
import ForgotPasswordPage from "./pages/forgetpass";

// Components
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import ThemeInitializer from "./components/ThemeInitializer";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Import this
import OTPPageReset from "./pages/otpForReset";
import NotFoundPage from "./pages/NotFoundPage";
import { Toaster } from "react-hot-toast";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
              <Toaster position="top-right" reverseOrder={false} />

        <Router>
          <ScrollToTop />
          <ThemeInitializer />
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <Navbar />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/otppage" element={<OTPPage />} />
                  <Route path="/otpForReset" element={<OTPPageReset />} />

                  {/* ✅ Public Routes */}
                  <Route path="/forgetpass" element={<ForgotPasswordPage />} />

                  {/* ✅ Protected Routes */}
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <AIChatPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="/profilesetup"
                    element={
                      <ProfileSetupRoute>
                        <ProfileSetupPage />
                      </ProfileSetupRoute>
                    }
                  /> */}
                  <Route
                    path="/challenges"
                    element={
                      <ProtectedRoute>
                        <DailyChallengesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ocr"
                    element={
                      <ProtectedRoute>
                        <OCRScanPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
