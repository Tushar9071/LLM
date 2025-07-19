import React, { useEffect, useState, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
// Pages
import LandingPage from './pages/LandingPage';
import AIChatPage from './pages/AIChatPage';
import DailyChallengesPage from './pages/DailyChallengesPage';
import OCRScanPage from './pages/OCRScanPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeInitializer from './components/ThemeInitializer';
export function App() {
  return <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemeInitializer />
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <Navbar />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chat" element={<AIChatPage />} />
                  <Route path="/challenges" element={<DailyChallengesPage />} />
                  <Route path="/ocr" element={<OCRScanPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>;
}