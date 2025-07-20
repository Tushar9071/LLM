// src/pages/ProfileSetupPage.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ArrowLeftIcon } from 'lucide-react';

const ProfileSetupPage = () => {
  const { user, updateProfile, completeProfileSetup } = useAuth();
  const navigate = useNavigate();

  interface FormData {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other" | "Prefer not to say" | undefined;
    dob: string;
    proficiencyLevel: string;
    learningGoals: string;
    dailyXPGoal: number;
    learningFocus: string[];
  }
  
  const [formData, setFormData] = useState<FormData>({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || undefined,
    dob: user?.dob || '',
    proficiencyLevel: user?.proficiencyLevel || '',
    learningGoals: user?.learningGoals || '',
    dailyXPGoal: user?.dailyXPGoal || 50,
    learningFocus: user?.learningFocus || [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const currentFocus = prev.learningFocus || [];
      return {
        ...prev,
        learningFocus: checked 
          ? [...currentFocus, name] 
          : currentFocus.filter(item => item !== name)
      };
    });
    if (errors.learningFocus) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.learningFocus;
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.proficiencyLevel) newErrors.proficiencyLevel = 'Please select your proficiency';
    if (formData.learningFocus.length === 0) newErrors.learningFocus = 'Select at least one focus area';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  try {
    // Check if user exists and has a token
    if (!user || !user) {
      throw new Error('Authentication token not found');
    }

    // Call the API to update account details
    // const response = await fetch('/api/auth/update-profile', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Authorization': `Bearer ${user.token}`
    //   }
    // });

    // Update local profile data
    await updateProfile(formData);
    await completeProfileSetup();
    
    // Remove verification flag after successful submission
    localStorage.removeItem('isOtpVerified');
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Profile setup failed:', error);
    setErrors({
      ...errors,
      form: error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const proficiencyLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Native'
  ];

  const focusAreas = [
    'Grammar',
    'Vocabulary',
    'Pronunciation',
    'Listening',
    'Speaking',
    'Reading',
    'Writing'
  ];

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 pb-8 pt-24 md:pt-28">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden self-start"
      >
        <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700 flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-700">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 rounded-full hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="text-white" />
          </button>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Complete Your Profile
          </motion.h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {errors.form && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg"
            >
              {errors.form}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <motion.div variants={inputVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                placeholder="Choose a username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </motion.div>

            {/* First Name */}
            <motion.div variants={inputVariants}>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                placeholder="Your first name"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </motion.div>

            {/* Last Name */}
            <motion.div variants={inputVariants}>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                placeholder="Your last name"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </motion.div>

            {/* Phone */}
            <motion.div variants={inputVariants}>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Your phone number"
              />
            </motion.div>

            {/* Gender */}
            <motion.div variants={inputVariants}>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </motion.div>

            {/* Date of Birth */}
            <motion.div variants={inputVariants}>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </motion.div>
          </div>

          {/* Proficiency Level */}
          <motion.div variants={inputVariants}>
            <label htmlFor="proficiencyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language Proficiency Level *
            </label>
            <select
              id="proficiencyLevel"
              name="proficiencyLevel"
              value={formData.proficiencyLevel}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.proficiencyLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select your proficiency level</option>
              {proficiencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.proficiencyLevel && <p className="mt-1 text-sm text-red-500">{errors.proficiencyLevel}</p>}
          </motion.div>

          {/* Learning Goals */}
          <motion.div variants={inputVariants}>
            <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Goals
            </label>
            <textarea
              id="learningGoals"
              name="learningGoals"
              value={formData.learningGoals}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="What are your language learning goals?"
            />
          </motion.div>

          {/* Daily XP Goal */}
          <motion.div variants={inputVariants}>
            <label htmlFor="dailyXPGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily XP Goal
            </label>
            <input
              type="range"
              id="dailyXPGoal"
              name="dailyXPGoal"
              min="10"
              max="100"
              step="10"
              value={formData.dailyXPGoal}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">10 XP</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{formData.dailyXPGoal} XP</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">100 XP</span>
            </div>
          </motion.div>

          {/* Learning Focus */}
          <motion.div variants={inputVariants}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Learning Focus Areas *
            </label>
            {errors.learningFocus && <p className="mt-1 text-sm text-red-500">{errors.learningFocus}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {focusAreas.map(area => (
                <motion.div 
                  key={area}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={area}
                    name={area}
                    checked={formData.learningFocus.includes(area)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor={area} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {area}
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="w-full md:w-auto px-8 py-3 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile Setup'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;