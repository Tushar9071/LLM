import React from 'react';
import { motion } from 'framer-motion';
interface XPProgressProps {
  currentXP: number;
  levelXP: number;
  level: number;
  showLevel?: boolean;
}
const XPProgress: React.FC<XPProgressProps> = ({
  currentXP,
  levelXP,
  level,
  showLevel = true
}) => {
  const percentage = Math.min(currentXP / levelXP * 100, 100);
  return <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showLevel && <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mr-2">
              {level}
            </div>
            <span className="text-sm font-medium">Level {level}</span>
          </div>}
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {currentXP}/{levelXP} XP
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" initial={{
        width: 0
      }} animate={{
        width: `${percentage}%`
      }} transition={{
        duration: 0.5,
        ease: 'easeOut'
      }} />
      </div>
    </div>;
};
export default XPProgress;