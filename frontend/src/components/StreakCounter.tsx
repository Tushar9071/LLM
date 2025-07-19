import React from 'react';
import { motion } from 'framer-motion';
import { FlameIcon } from 'lucide-react';
interface StreakCounterProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}
const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3 mr-1',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4 mr-1.5',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5 mr-2',
      text: 'text-base'
    }
  };
  return <motion.div className={`inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full ${sizeClasses[size].container}`} initial={{
    scale: 0.9
  }} animate={{
    scale: 1
  }} whileHover={{
    scale: 1.05
  }}>
      <motion.div animate={{
      rotate: [0, -10, 10, -10, 10, 0]
    }} transition={{
      duration: 0.5,
      ease: 'easeInOut',
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      repeat: Infinity,
      repeatDelay: 3
    }}>
        <FlameIcon className={`${sizeClasses[size].icon} text-yellow-300`} />
      </motion.div>
      <span className={`font-semibold ${sizeClasses[size].text}`}>
        {streak} day streak
      </span>
    </motion.div>;
};
export default StreakCounter;