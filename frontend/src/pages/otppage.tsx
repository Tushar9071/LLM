// src/pages/OTPPage.tsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import Button from "../components/Button";
import { LockIcon, RotateCwIcon, AlertCircleIcon, MailIcon } from "lucide-react";

const OTPPage = () => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get the login function from the context

  // Initialize component
  useEffect(() => {
    const locationEmail = location.state?.email;
    const tempUserData = localStorage.getItem('tempUserData');

    if (locationEmail) {
      setEmail(locationEmail);
    } else if (tempUserData) {
      const userData = JSON.parse(tempUserData);
      setEmail(userData.email);
    } else {
      // If no email is found, redirect to sign-up as a fallback
      navigate('/signup');
    }

    inputRefs.current[0]?.focus();

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer); // Clear interval when it reaches zero
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, [location, navigate]);

  const handleDigitChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Move focus to the next input if a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move focus to the previous input on backspace if the current input is empty
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteDigits = paste.match(/\d/g)?.slice(0, 6) || [];

    // If a 6-digit code is pasted, fill the inputs
    if (pasteDigits.length === 6) {
      setDigits(pasteDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: location.state?.email || email,
          username: location.state?.username || "",
          password: location.state?.password || "",
          otp: String(otp),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Update the AuthContext with the new user and token
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      // Clear temporary data from sign-up
      localStorage.removeItem('tempUserData');
      
      // Set a flag to allow access to the profile setup page
      localStorage.setItem('isOtpVerified', 'true');
      
      // Navigate to the profile setup page
      navigate("/profilesetup");

    } catch (err) {
      throw err;
    }
  };

  const resendOTP = async () => {
    try {
      setResendDisabled(true);
      setResendTimer(30);
      setError("");

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      // Restart the countdown timer
      const newTimer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(newTimer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
      setResendDisabled(false); // Allow user to try again if it fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    const otp = digits.join("");
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await verifyOTP(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please check the code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Verify OTP</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <MailIcon className="mr-2 h-4 w-4" />
            Code sent to {email}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg mb-6 flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-2 sm:space-x-3 mb-8">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl text-center border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all ${digit ? "border-indigo-500" : "border-gray-300 dark:border-gray-600"}`}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Didn't receive code?{' '}
          <button
            onClick={resendOTP}
            disabled={resendDisabled}
            className={`font-medium transition-colors ${resendDisabled
                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              }`}
          >
            {resendDisabled ? (
              `Resend in ${resendTimer}s`
            ) : (
              <span className="flex items-center justify-center">
                <RotateCwIcon className="mr-1 h-4 w-4" />
                Resend OTP
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
