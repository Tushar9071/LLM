import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      navigate('/signup');
    }
    
    inputRefs.current[0]?.focus();
    
    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location, navigate]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (index === 5 && value && newDigits.every(d => d !== "")) {
      handleSubmit();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteDigits = paste.match(/\d/g)?.slice(0, 6) || [];
    
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
          email:location.state?.email || email,
          username:location.state?.username || "",
          password:location.state?.password || "",

          otp:String(otp),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Clear temporary data
      localStorage.removeItem('tempUserData');
      
      // Store authentication data
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      navigate("/dashboard");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      // Start countdown timer
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
      setResendDisabled(false);
    }
  };

  const handleSubmit = async () => {
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
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
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

        <div className="flex justify-center space-x-3 mb-8">
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
              className={`w-14 h-14 text-3xl text-center border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all ${
                digit ? "border-indigo-500" : "border-gray-300 dark:border-gray-600"
              }`}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <Button 
          onClick={handleSubmit}
          fullWidth
          disabled={digits.some(d => d === "") || isSubmitting}
         
        >
          Verify Account
        </Button>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Didn't receive code?{' '}
          <button
            onClick={resendOTP}
            disabled={resendDisabled}
            className={`font-medium ${
              resendDisabled 
                ? "text-gray-400 dark:text-gray-500" 
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