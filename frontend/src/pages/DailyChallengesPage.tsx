import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XIcon, FlameIcon, ClockIcon, TrophyIcon, StarIcon, Mic as MicIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPProgress from '../components/XPProgress';
import StreakCounter from '../components/StreakCounter';
import Button from '../components/Button';
interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  category: 'grammar' | 'vocabulary' | 'speaking' | 'writing';
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
}
const DailyChallengesPage = () => {
  const {
    user
  } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([{
    id: '1',
    title: 'Past Tense Practice',
    description: 'Describe your day yesterday using past tense verbs.',
    xp: 20,
    completed: false,
    category: 'grammar',
    difficulty: 'medium',
    timeEstimate: '5 min'
  }, {
    id: '2',
    title: 'Food Vocabulary',
    description: 'Learn 10 new words related to food and restaurants.',
    xp: 15,
    completed: true,
    category: 'vocabulary',
    difficulty: 'easy',
    timeEstimate: '3 min'
  }, {
    id: '3',
    title: 'Pronunciation Challenge',
    description: 'Practice pronouncing difficult Spanish sounds like "rr" and "j".',
    xp: 25,
    completed: false,
    category: 'speaking',
    difficulty: 'hard',
    timeEstimate: '7 min'
  }, {
    id: '4',
    title: 'Write a Short Story',
    description: 'Write a 100-word story about your favorite hobby.',
    xp: 30,
    completed: false,
    category: 'writing',
    difficulty: 'hard',
    timeEstimate: '10 min'
  }, {
    id: '5',
    title: 'Daily Conversation',
    description: 'Have a 2-minute conversation with the AI about your favorite movie.',
    xp: 20,
    completed: false,
    category: 'speaking',
    difficulty: 'medium',
    timeEstimate: '5 min'
  }]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const categoryColors = {
    grammar: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    vocabulary: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    speaking: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    writing: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
  };
  const difficultyColors = {
    easy: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    hard: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar':
        return <span className="text-purple-600 dark:text-purple-400">📝</span>;
      case 'vocabulary':
        return <span className="text-green-600 dark:text-green-400">📚</span>;
      case 'speaking':
        return <span className="text-blue-600 dark:text-blue-400">🗣️</span>;
      case 'writing':
        return <span className="text-orange-600 dark:text-orange-400">✍️</span>;
      default:
        return <span>📝</span>;
    }
  };
  const openChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };
  const closeChallenge = () => {
    setSelectedChallenge(null);
  };
  const completeChallenge = () => {
    if (!selectedChallenge) return;
    setChallenges(prev => prev.map(challenge => challenge.id === selectedChallenge.id ? {
      ...challenge,
      completed: true
    } : challenge));
    setShowCompletionModal(true);
    setSelectedChallenge(null);
  };
  const closeCompletionModal = () => {
    setShowCompletionModal(false);
  };
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;
  const completionPercentage = completedChallenges / totalChallenges * 100;
  return <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">Daily Challenges</h1>
              <StreakCounter streak={user?.streak || 0} size="lg" />
            </div>
            <div className="mb-4">
              <XPProgress currentXP={user?.xp || 0} levelXP={1000} level={user?.level || 1} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                  <TrophyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Today's Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {completedChallenges} of {totalChallenges} challenges
                    completed
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" className="dark:stroke-gray-700" />
                  <path d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${completionPercentage}, 100`} className="dark:stroke-blue-500" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
                  {completionPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
          {/* Challenge Cards */}
          <div className="grid grid-cols-1 gap-4 mb-20">
            <AnimatePresence>
              {challenges.map(challenge => <motion.div key={challenge.id} initial={{
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
            }} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${challenge.completed ? 'border-l-4 border-green-500' : ''}`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl mr-4">
                          {getCategoryIcon(challenge.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1 flex items-center">
                            {challenge.title}
                            {challenge.completed && <span className="ml-2 text-green-500">
                                <CheckIcon className="w-5 h-5" />
                              </span>}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {challenge.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[challenge.category]}`}>
                              {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[challenge.difficulty]}`}>
                              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {challenge.timeEstimate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                          +{challenge.xp} XP
                        </div>
                        <Button onClick={() => openChallenge(challenge)} disabled={challenge.completed} size="sm" variant={challenge.completed ? 'outline' : 'primary'}>
                          {challenge.completed ? 'Completed' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Challenge Modal */}
      <AnimatePresence>
        {selectedChallenge && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedChallenge.title}
                  </h2>
                  <button onClick={closeChallenge} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl mr-3">
                      {getCategoryIcon(selectedChallenge.category)}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[selectedChallenge.category]}`}>
                          {selectedChallenge.category.charAt(0).toUpperCase() + selectedChallenge.category.slice(1)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[selectedChallenge.difficulty]}`}>
                          {selectedChallenge.difficulty.charAt(0).toUpperCase() + selectedChallenge.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedChallenge.description}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Instructions
                    </h3>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 text-sm space-y-1">
                      <li>Complete this challenge in one session</li>
                      <li>Use only the vocabulary you've learned</li>
                      <li>Submit your answer to receive feedback</li>
                      <li>Earn {selectedChallenge.xp} XP upon completion</li>
                    </ul>
                  </div>
                  {selectedChallenge.category === 'writing' && <div className="mb-4">
                      <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Answer
                      </label>
                      <textarea id="answer" rows={5} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Write your answer here..." />
                    </div>}
                  {selectedChallenge.category === 'speaking' && <div className="mb-4 text-center">
                      <button className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2">
                        <MicIcon className="w-8 h-8" />
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Press to start recording
                      </p>
                    </div>}
                </div>
                <div className="flex justify-between">
                  <Button onClick={closeChallenge} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={completeChallenge}>
                    Complete Challenge
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden text-center">
              <div className="p-6">
                <motion.div initial={{
              scale: 0.5,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} transition={{
              delay: 0.2,
              type: 'spring'
            }} className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Great job! You've earned XP and maintained your learning
                  streak.
                </p>
                <div className="flex justify-center space-x-6 mb-6">
                  <div className="text-center">
                    <motion.div initial={{
                  y: 20,
                  opacity: 0
                }} animate={{
                  y: 0,
                  opacity: 1
                }} transition={{
                  delay: 0.4
                }} className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      +20
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      XP Earned
                    </p>
                  </div>
                  <div className="text-center">
                    <motion.div initial={{
                  y: 20,
                  opacity: 0
                }} animate={{
                  y: 0,
                  opacity: 1
                }} transition={{
                  delay: 0.5
                }} className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center justify-center">
                      <FlameIcon className="w-6 h-6 mr-1 text-orange-500" />
                      {user?.streak || 12}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Day Streak
                    </p>
                  </div>
                </div>
                <Button onClick={closeCompletionModal} fullWidth>
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default DailyChallengesPage;