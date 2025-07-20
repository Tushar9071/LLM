import React, { useEffect, useState, createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  displayName: string;
  id: string;
  name: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: number;
  xp: number;
  streak: number;
  profileComplete: boolean; // New field to track profile completion
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string;
   token: string; // Add this line
  proficiencyLevel?: string;
  learningGoals?: string;
  dailyXPGoal?: number;
  learningFocus?: string[];
  dailyReminders?: boolean;
  weeklyProgressReports?: boolean;
  achievementNotifications?: boolean;
  newFeatureAnnouncements?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean; // New property
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  completeProfileSetup: () => void; // New method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const MOCK_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  nativeLanguage: 'English',
  targetLanguage: 'Spanish',
  level: 7,
  xp: 3240,
  streak: 12,
  profileComplete: true, // Profile is complete for mock user
  // ...other profile fields
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  // useEffect(()=>{
  //   fetch("/api/user/get-corrent-user",{
  //     method:"GET",
  //     headers:{
  //       "Content-Type":"application/json",
  //       // "Authorization": `Bearer ${localStorage.getItem('token')}`
  //     },
  //     credentials:"include"
  //   }).then((res)=>res.json()).then((data)=>{
  //     console.log(data);
      
  //     localStorage.setItem('main_user',JSON.stringify(data))})
  // },[user])

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsProfileComplete(parsedUser.profileComplete || false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // return new Promise<void>(resolve => {
    //   // setTimeout(() => {
    //   //   setUser(MOCK_USER);
    //   //   setIsAuthenticated(true);
    //   //   setIsProfileComplete(true);
    //   //   localStorage.setItem('user', JSON.stringify(MOCK_USER));
    //   //   resolve();
    //   // }, 1000);
    // });
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "identifier":email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem("user",JSON.stringify({data,image:"https://avatar.iran.liara.run/public/boy"}))
          setUser(data)
          setIsAuthenticated(true)
          // setIsProfileComplete(data.profileComplete || false)
          localStorage.setItem('main_user',JSON.stringify({data,image:"https://avatar.iran.liara.run/public/boy"}))
          toast.success("Login successful");
          // resolve();
        })
    } catch (error) {
      console.log(error);
      
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const newUser: User = {
          ...MOCK_USER,
          name,
          email,
          level: 1,
          xp: 0,
          streak: 0,
          profileComplete: false, // New users have incomplete profiles
          // Reset profile-specific fields
          username: '',
          firstName: '',
          lastName: '',
          phone: '',
          gender: undefined,
          dob: '',
          proficiencyLevel: '',
          learningGoals: '',
          learningFocus: [],
          dailyXPGoal: 50, // Default value
        };
        
        setUser(newUser);
        setIsAuthenticated(true);
        setIsProfileComplete(false);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (user) {
          const updatedUser = { ...user, ...userData };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          toast.success('Profile updated successfully!');
          resolve();
        }
      }, 500);
    });
  };

  // NEW: Mark profile as complete
  const completeProfileSetup = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (user) {
          const updatedUser = { ...user, profileComplete: true };
          setUser(updatedUser);
          setIsProfileComplete(true);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          toast.success('Profile setup complete!');
          resolve();
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsProfileComplete(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isProfileComplete, // New value
      login,
      signup,
      logout,
      updateProfile,
      completeProfileSetup // New method
    }}>
      {children}
    </AuthContext.Provider>
  );
};