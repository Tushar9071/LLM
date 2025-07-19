import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // Assuming useAuth provides user data and update function
import Button from "../components/Button"; // Assuming you have a Button component
import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  GraduationCapIcon,
  TargetIcon,
  StarIcon,
  BellIcon,
  MailIcon,
  SettingsIcon,
  Image as ImageIcon, // Renamed to avoid conflict with HTML ImageElement
} from "lucide-react";
import { toast } from "react-hot-toast";

// Mock interfaces for user data (should match your backend response structure)
interface UserInfo {
  Username?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string; // ISO string
  proficiencyLevel?: string;
  learningGoals?: string;
  dailyXPGoal?: number;
  learningFocus?: string[];
  avatar?: string;
  dailyReminders?: boolean;
  weeklyProgressReports?: boolean;
  achievementNotifications?: boolean;
  newFeatureAnnouncements?: boolean;
  // Existing fields from signup, might be pre-filled or displayed
  nativeLanguage?: string;
  targetLanguage?: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  userInfo?: UserInfo;
}

const ProfileCompletionForm = () => {
  const navigate = useNavigate();
  const { user, fetchCurrentUser, updateProfile } = useAuth(); // Assuming useAuth provides these
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for all fields to be collected/updated
  const [formData, setFormData] = useState<UserInfo>({
    Username: "",
    firstname: "",
    lastname: "",
    phone: "",
    gender: undefined,
    dob: "",
    proficiencyLevel: "",
    learningGoals: "",
    dailyXPGoal: 50,
    learningFocus: [],
    avatar: "https://placehold.co/150x150/cccccc/333333?text=Profile", // Default avatar
    dailyReminders: true,
    weeklyProgressReports: true,
    achievementNotifications: true,
    newFeatureAnnouncements: true,
    nativeLanguage: user?.userInfo?.nativeLanguage || "English", // Pre-fill from existing user data
    targetLanguage: user?.userInfo?.targetLanguage || "Spanish", // Pre-fill from existing user data
  });

  // Populate form data if user data is already available (e.g., from a previous session)
  useEffect(() => {
    if (user && user.userInfo) {
      setFormData((prev) => ({
        ...prev,
        Username: user.userInfo.Username || "",
        firstname: user.userInfo.firstname || "",
        lastname: user.userInfo.lastname || "",
        phone: user.userInfo.phone || "",
        gender: user.userInfo.gender || undefined,
        dob: user.userInfo.dob
          ? new Date(user.userInfo.dob).toISOString().split("T")[0]
          : "", // Format date for input
        proficiencyLevel: user.userInfo.proficiencyLevel || "",
        learningGoals: user.userInfo.learningGoals || "",
        dailyXPGoal: user.userInfo.dailyXPGoal || 50,
        learningFocus: user.userInfo.learningFocus || [],
        avatar:
          user.userInfo.avatar ||
          "https://placehold.co/150x150/cccccc/333333?text=Profile",
        dailyReminders: user.userInfo.dailyReminders ?? true,
        weeklyProgressReports: user.userInfo.weeklyProgressReports ?? true,
        achievementNotifications:
          user.userInfo.achievementNotifications ?? true,
        newFeatureAnnouncements: user.userInfo.newFeatureAnnouncements ?? true,
        nativeLanguage: user.userInfo.nativeLanguage || "English",
        targetLanguage: user.userInfo.targetLanguage || "Spanish",
      }));
    } else if (user && !user.userInfo) {
      // If user exists but userInfo is null, it means a new user just registered.
      // We can pre-fill native/target language if they were part of signup directly
      setFormData((prev) => ({
        ...prev,
        nativeLanguage: user.nativeLanguage || "English", // Assuming native/target might be directly on user for new signups
        targetLanguage: user.targetLanguage || "Spanish",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle learningFocus array
      if (name === "learningFocus") {
        const focusValue = value;
        setFormData((prev) => ({
          ...prev,
          learningFocus: checked
            ? [...(prev.learningFocus || []), focusValue]
            : (prev.learningFocus || []).filter((item) => item !== focusValue),
        }));
      } else {
        // Handle boolean notification settings
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.Username || !formData.firstname || !formData.targetLanguage) {
      setError("Username, First Name, and Target Language are required.");
      setIsLoading(false);
      return;
    }

    try {
      // Call the updateProfile function from AuthContext
      // This function should make an API call to your backend's updateAccountDetails endpoint
      await updateProfile(formData);
      toast.success("Profile updated successfully!");
      navigate("/dashboard"); // Redirect to dashboard after successful update
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const learningFocusOptions = [
    "Speaking",
    "Listening",
    "Reading",
    "Writing",
    "Vocabulary",
    "Grammar",
    "Culture",
  ];
  const proficiencyLevels = [
    "A1 (Beginner)",
    "A2 (Elementary)",
    "B1 (Intermediate)",
    "B2 (Upper-Intermediate)",
    "C1 (Advanced)",
    "C2 (Proficient)",
  ];
  const dailyXPGoals = [20, 50, 100, 200, 300, 500];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tell us more about yourself to personalize your learning journey.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Picture URL
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/150x150/cccccc/333333?text=Profile";
                }} // Fallback
              />
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/your-avatar.jpg"
                />
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="Username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="Username"
                  name="Username"
                  type="text"
                  required
                  value={formData.Username}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="unique_username"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="firstname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  value={formData.firstname}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""} // Handle undefined
                onChange={handleChange}
                className="appearance-none block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Language & Learning Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proficiencyLevel"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency Level
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCapIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="proficiencyLevel"
                  name="proficiencyLevel"
                  value={formData.proficiencyLevel}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select Level</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level.split(" ")[0]}>
                      {" "}
                      {/* Store only A1, B2 etc. */}
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="learningGoals"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Learning Goals
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TargetIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="learningGoals"
                  name="learningGoals"
                  type="text"
                  value={formData.learningGoals}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Travel, Business, Hobbies"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="dailyXPGoal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily XP Goal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <StarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="dailyXPGoal"
                  name="dailyXPGoal"
                  value={formData.dailyXPGoal}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  {dailyXPGoals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal} XP
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Learning Focus Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Focus Areas
            </label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {learningFocusOptions.map((focus) => (
                <div key={focus} className="flex items-center">
                  <input
                    id={`focus-${focus}`}
                    name="learningFocus"
                    type="checkbox"
                    value={focus}
                    checked={formData.learningFocus?.includes(focus) || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`focus-${focus}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {focus}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Settings
            </h3>
            {[
              { id: "dailyReminders", label: "Daily reminders" },
              { id: "weeklyProgressReports", label: "Weekly progress reports" },
              {
                id: "achievementNotifications",
                label: "Achievement notifications",
              },
              {
                id: "newFeatureAnnouncements",
                label: "New feature announcements",
              },
            ].map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {notification.label}
                </span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id={notification.id}
                    name={notification.id}
                    checked={
                      formData[notification.id as keyof UserInfo] as boolean
                    }
                    onChange={handleChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-300 border-4 border-gray-300 dark:border-gray-700 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor={notification.id}
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"></label>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button type="submit" fullWidth size="lg" disabled={isLoading}>
              {isLoading ? "Saving Profile..." : "Complete Profile"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionForm;
