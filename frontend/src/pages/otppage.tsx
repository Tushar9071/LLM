import React, { useState, useRef, useEffect, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const OTPPage: React.FC = () => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate("/dashboard");
    } catch (err) {
      setError("Verification failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // CSS-in-JS solution for shake animation
  const shakeAnimation: CSSProperties = shake 
    ? {
        animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
      }
    : {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Verify OTP</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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
              className={`w-14 h-14 text-3xl text-center border-2 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-all duration-200 ${
                digit ? "border-indigo-500 shadow-sm" : "border-gray-300 dark:border-gray-600"
              } hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm transform hover:scale-105 focus:scale-105`}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <Button 
          onClick={handleSubmit}
          fullWidth
          disabled={digits.some(d => d === "") || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : (
            "Verify Account"
          )}
        </Button>

        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <p>Didn't receive the code? 
            <button 
              className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
              onClick={() => console.log("Resend OTP")}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;