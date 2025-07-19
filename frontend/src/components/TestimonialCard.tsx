import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from 'lucide-react';
interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  language: string;
}
const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  avatar,
  rating,
  language
}) => {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col h-full">
      <div className="flex items-start mb-4">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-100 dark:border-blue-900" />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
          <div className="flex items-center mt-1">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {language}
            </span>
          </div>
        </div>
      </div>
      <div className="flex mb-4">
        {Array.from({
        length: 5
      }).map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />)}
      </div>
      <p className="text-gray-700 dark:text-gray-300 flex-grow">"{content}"</p>
    </motion.div>;
};
export default TestimonialCard;