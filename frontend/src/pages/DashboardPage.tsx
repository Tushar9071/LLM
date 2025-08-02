import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, TrophyIcon, BookOpenIcon, BarChart3Icon, BrainIcon, StarIcon, GlobeIcon, SettingsIcon, FlameIcon, CheckIcon } from 'lucide-react';
import XPProgress from '../components/XPProgress';
import StreakCounter from '../components/StreakCounter';
import Button from '../components/Button';
import toast from 'react-hot-toast';

interface Activity {
  date: string;
  xp: number;
}
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
}
const DashboardPage = () => {
  
  const userString = localStorage.getItem("user");
const user = userString ? JSON.parse(userString) : null;
console.log(user);
const [formData, setFormData] = useState({
    nativeLanguage: user?.nativeLanguage || 'English',
    targetLanguage: user?.targetLanguage || 'Spanish'
  });

  // Handle changes in both select inputs
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form data:', formData);

  try {
    const res = await fetch("/api/auth/setLanguage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first: formData.nativeLanguage,
        learning: formData.targetLanguage,
      }),
    });

    if (res.ok) {
      toast.success("Language preferences updated successfully!");
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Something went wrong!");
    }
  } catch (error) {
    toast.error("Network error! Please try again.");
    console.error("Error:", error);
  }
};


  const [activeTab, setActiveTab] = useState('overview');
  // Mock data for activities (last 30 days)
  const activities: Activity[] = Array.from({
    length: 30
  }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      xp: i === 0 ? 70 : i === 1 ? 45 : i === 2 ? 0 : Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 0
    };
  }).reverse();
  // Mock data for badges
  const badges: Badge[] = [{
    id: '1',
    name: 'Early Bird',
    description: 'Complete 5 lessons before 9 AM',
    icon: <CalendarIcon className="w-6 h-6" />,
    achieved: true
  }, {
    id: '2',
    name: 'Conversation Master',
    description: 'Have 50 AI conversations',
    icon: <BrainIcon className="w-6 h-6" />,
    achieved: true
  }, {
    id: '3',
    name: 'Vocabulary Builder',
    description: 'Learn 500 new words',
    icon: <BookOpenIcon className="w-6 h-6" />,
    achieved: false,
    progress: 342,
    maxProgress: 500
  }, {
    id: '4',
    name: 'Perfect Week',
    description: 'Reach your daily goal 7 days in a row',
    icon: <StarIcon className="w-6 h-6" />,
    achieved: true
  }, {
    id: '5',
    name: 'Grammar Guru',
    description: 'Complete 20 grammar challenges with perfect scores',
    icon: <BarChart3Icon className="w-6 h-6" />,
    achieved: false,
    progress: 14,
    maxProgress: 20
  }, {
    id: '6',
    name: 'Global Citizen',
    description: 'Learn basics in 3 different languages',
    icon: <GlobeIcon className="w-6 h-6" />,
    achieved: false,
    progress: 1,
    maxProgress: 3
  }];
  const maxXP = Math.max(...activities.map(a => a.xp));
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };
  const getActivityColor = (xp: number) => {
    if (xp === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (xp < 20) return 'bg-green-200 dark:bg-green-900';
    if (xp < 50) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }} whileHover={{
              y: -5,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
                <div className="flex items-center mb-4">
                  <motion.div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4" whileHover={{
                  rotate: 10,
                  scale: 1.1
                }}>
                    <TrophyIcon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold">Current Level</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Intermediate
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Level {user?.data?.level || 7}
                </div>
                <XPProgress currentXP={user?.xp || 3240} levelXP={4000} level={user?.level || 7} showLevel={false} />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {4000 - (user?.xp || 3240)} XP until next level
                </p>
              </motion.div>
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.1
            }} whileHover={{
              y: -5,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
                <div className="flex items-center mb-4">
                  <motion.div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mr-4" whileHover={{
                  rotate: 10,
                  scale: 1.1
                }}>
                    <FlameIcon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold">Current Streak</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Keep it going!
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {user?.streak || 12} days
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Your longest streak: 24 days
                </p>
                <motion.div className="mt-4" whileHover={{
                scale: 1.05
              }}>
                  <StreakCounter streak={user?.streak || 12} size="lg" />
                </motion.div>
              </motion.div>
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.2
            }} whileHover={{
              y: -5,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
                <div className="flex items-center mb-4">
                  <motion.div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4" whileHover={{
                  rotate: 10,
                  scale: 1.1
                }}>
                    <BookOpenIcon className="w-6 h-6" />
                  </motion.div>
                 
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  342
                </div>
                <motion.div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" whileHover={{
                scale: 1.02
              }}>
                  <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${342 / 500 * 100}%`
                }} transition={{
                  duration: 1,
                  ease: 'easeOut'
                }} className="h-full bg-green-600 dark:bg-green-500 rounded-full"></motion.div>
                </motion.div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  158 more words until "Vocabulary Master" badge
                </p>
              </motion.div>
            </div>

            {/* Activity Heatmap */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: 0.3
          }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Activity History</h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-1 min-w-max">
                  {activities.map((activity, index) => <motion.div key={index} className="flex flex-col items-center" whileHover={{
                  scale: 1.2,
                  y: -5
                }} transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 10
                }}>
                      <div className={`w-8 h-8 rounded-sm ${getActivityColor(activity.xp)} hover:opacity-80 transition-opacity relative group`} style={{
                    opacity: activity.xp > 0 ? Math.max(0.4, activity.xp / maxXP) : 0.15
                  }}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {activity.xp > 0 && <span className="text-xs font-semibold text-white">
                              {activity.xp}
                            </span>}
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          {new Date(activity.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                          : {activity.xp} XP
                        </div>
                      </div>
                      {index % 7 === 0 && <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getDateLabel(activity.date)}
                        </span>}
                    </motion.div>)}
                </div>
              </div>
              <div className="flex items-center justify-end mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center mr-4">
                  <span className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm mr-1"></span>
                  No activity
                </span>
                <span className="flex items-center mr-4">
                  <span className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm mr-1"></span>
                  Low
                </span>
                <span className="flex items-center mr-4">
                  <span className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm mr-1"></span>
                  Medium
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm mr-1"></span>
                  High
                </span>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: 0.4
          }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">
                Badges & Achievements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {badges.map((badge, index) => <motion.div key={badge.id} initial={{
                opacity: 0,
                scale: 0.9
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                duration: 0.3,
                delay: 0.1 * index
              }} whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                y: -5
              }} className={`p-4 rounded-lg border-2 ${badge.achieved ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : 'border-gray-300 dark:border-gray-700'} flex flex-col items-center text-center transition-all`}>
                    <motion.div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${badge.achieved ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`} whileHover={{
                  rotate: 10,
                  scale: 1.1
                }}>
                      {badge.icon}
                    </motion.div>
                    <h4 className="font-semibold mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {badge.description}
                    </p>
                    {badge.achieved ? <motion.span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" whileHover={{
                  scale: 1.1
                }}>
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Achieved
                      </motion.span> : <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          In Progress
                        </span>
                        {badge.progress !== undefined && badge.maxProgress !== undefined && <div className="w-full mt-2">
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div initial={{
                        width: 0
                      }} animate={{
                        width: `${badge.progress / badge.maxProgress * 100}%`
                      }} transition={{
                        duration: 1,
                        ease: 'easeOut'
                      }} className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"></motion.div>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {badge.progress}/{badge.maxProgress}
                              </p>
                            </div>}
                      </>}
                  </motion.div>)}
              </div>
            </motion.div>
          </div>;
      case 'settings':
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-semibold mb-6">Language Settings</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium mb-4">Language Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="nativeLanguage" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Native Language
                </label>
                <select 
                  id="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Spanish">Spanish</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Hindi">Hindi</option>
                    <option value="Japanese">Japanese</option>
                  <option value="Italian">Italian</option>
                  <option value="Korean">Korean</option>
                  <option value="gujrati">gujrati</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Urdu">Urdu</option>
                  
                </select>
              </div>
              <div>
                <label 
                  htmlFor="targetLanguage" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Target Language
                </label>
                <select 
                  id="targetLanguage"
                  value={formData.targetLanguage}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                 <option value="Spanish">Spanish</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Hindi">Hindi</option>
                    <option value="Japanese">Japanese</option>
                  <option value="Italian">Italian</option>
                  <option value="Korean">Korean</option>
                  <option value="gujrati">gujrati</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Urdu">Urdu</option>
  
                </select>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit">Save Changes</Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
      default:
        return null;
    }
  };
  return <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* User Profile Header */}
          <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <motion.img src={user?.image} alt={user?.data?.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 mb-4 md:mb-0 md:mr-6" initial={{
              scale: 0.8
            }} animate={{
              scale: 1
            }} transition={{
              duration: 0.5
            }} whileHover={{
              scale: 1.1,
              rotate: 5
            }} />
              <div className="text-center md:text-left flex-grow">
                <motion.h1 className="text-2xl font-bold" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.2
              }}>
                  {user?.data?.data?.username}
                </motion.h1>
                <motion.p className="text-gray-600 dark:text-gray-400 mb-4" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.3
              }}>
                  Learning {user?.targetLanguage} • Level {user?.level} •{' '}
                  {user?.streak} day streak
                </motion.p>
                <motion.div className="flex flex-wrap justify-center md:justify-start gap-2" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.4
              }}>
                  <motion.span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" whileHover={{
                  scale: 1.1
                }}>
                    {user?.targetLanguage} Learner
                  </motion.span>
                  <motion.span className="px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" whileHover={{
                  scale: 1.1
                }}>
                    {user?.streak}+ Days
                  </motion.span>
                  <motion.span className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" whileHover={{
                  scale: 1.1
                }}>
                    {badges.filter(b => b.achieved).length} Badges
                  </motion.span>
                </motion.div>
              </div>
              <motion.div className="mt-4 md:mt-0" whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Button variant="outline" icon={<SettingsIcon className="w-4 h-4" />} onClick={() => setActiveTab('settings')}>
                  Settings
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-hidden" initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }}>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <motion.button onClick={() => setActiveTab('overview')} className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`} whileHover={{
              backgroundColor: activeTab !== 'overview' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
            }} whileTap={{
              scale: 0.98
            }}>
                Overview
              </motion.button>
              <motion.button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`} whileHover={{
              backgroundColor: activeTab !== 'settings' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
            }} whileTap={{
              scale: 0.98
            }}>
                Settings
              </motion.button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.3
          }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>l
    </div>;
};
export default DashboardPage;