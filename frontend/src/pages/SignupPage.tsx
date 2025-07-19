import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon, MailIcon, GlobeIcon, AlertCircleIcon } from 'lucide-react';
import Button from '../components/Button';

// Define types for our form data
type FormData = {
  name: string;
  email: string;
  password: string;
  nativeLanguage: string;
  targetLanguage: string;
};

type ErrorType = {
  field?: string;
  message: string;
};

const SignupPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    nativeLanguage: '',
    targetLanguage: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorType[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const navigate = useNavigate();

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Japanese', 'Chinese', 
    'Korean', 'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Swedish'
  ];

  // Password strength calculator
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 1;
    // Uppercase check
    if (/[A-Z]/.test(formData.password)) strength += 1;
    // Number check
    if (/\d/.test(formData.password)) strength += 1;
    // Special char check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors.some(err => err.field === name)) {
      setErrors(errors.filter(err => err.field !== name));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorType[] = [];

    if (!formData.name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email' });
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (passwordStrength < 3) {
      newErrors.push({ 
        field: 'password', 
        message: 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character' 
      });
    }

    if (formData.nativeLanguage && formData.targetLanguage && 
        formData.nativeLanguage === formData.targetLanguage) {
      newErrors.push({ 
        field: 'targetLanguage', 
        message: 'Target language must be different from native language' 
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  setErrors([]);

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Accept": "application/json" // Explicitly ask for JSON response
      },
      body: JSON.stringify({
        username: formData.name,
        email: formData.email,
        password: formData.password
        // Only sending required fields to backend
      }),
    });

    // First check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(text || "Server returned non-JSON response");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Store minimal data in localStorage for OTP verification
    localStorage.setItem('tempUserData', JSON.stringify({
      email: formData.email,
      username: formData.name,
      password: formData.password
    }));

    // Navigate to OTP page with email
    navigate('/otppage', { state: { email: formData.email ,username:formData.name , password:formData.password} });
  
  } catch (err) {
    let errorMessage = 'There was a problem creating your account. Please try again.';
    
    if (err instanceof Error) {
      // Try to extract error message from HTML response if needed
      if (err.message.includes("<!DOCTYPE html>")) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        errorMessage = err.message;
      }
    }
    
    setErrors([{ message: errorMessage }]);
  } finally {
    setIsLoading(false);
  }
};
  const getError = (fieldName: string): string | undefined => {
    return errors.find(err => err.field === fieldName)?.message;
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    // Placeholder for social login implementation
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              LinguaAI
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start your language learning journey today
          </p>
        </div>

        {/* General errors */}
        {errors.some(err => !err.field) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm flex items-start"
          >
            <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              {errors.filter(err => !err.field).map((err, i) => (
                <p key={i}>{err.message}</p>
              ))}
            </div>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${getError('name') ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="John Doe"
                />
              </div>
              {getError('name') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getError('name')}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${getError('email') ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="you@example.com"
                />
              </div>
              {getError('email') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getError('email')}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${getError('password') ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Password strength meter */}
              <div className="mt-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        passwordStrength >= i
                          ? i >= 3
                            ? 'bg-green-500'
                            : i === 2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character
                </p>
                {getError('password') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getError('password')}</p>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Native Language
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="nativeLanguage"
                    name="nativeLanguage"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a language</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Language
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="targetLanguage"
                    name="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={handleChange}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${getError('targetLanguage') ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  >
                    <option value="">Select a language</option>
                    {languages
                      .filter(lang => lang !== formData.nativeLanguage)
                      .map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                  </select>
                </div>
                {getError('targetLanguage') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getError('targetLanguage')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
             
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
        </form>

        {/* Social Login Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          
          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;