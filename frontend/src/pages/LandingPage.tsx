import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon, MessageCircleIcon, MicIcon, BookOpenIcon, TrophyIcon, ScanLineIcon, SparklesIcon } from 'lucide-react';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import TestimonialCard from '../components/TestimonialCard';
import AnimatedBackground from '../components/AnimatedBackground';
const LandingPage = () => {
  const ref = useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const features = [{
    icon: <MessageCircleIcon className="w-6 h-6" />,
    title: 'AI Chat',
    description: 'Have natural conversations with our AI tutor in your target language. Get instant corrections and explanations.'
  }, {
    icon: <MicIcon className="w-6 h-6" />,
    title: 'Voice Pronunciation Feedback',
    description: 'Practice speaking and receive detailed feedback on your pronunciation, accent, and fluency.'
  }, {
    icon: <BookOpenIcon className="w-6 h-6" />,
    title: 'Grammar Correction',
    description: 'Write in your target language and get instant grammar corrections with explanations of your mistakes.'
  }, {
    icon: <TrophyIcon className="w-6 h-6" />,
    title: 'Daily Challenges & XP',
    description: 'Complete daily challenges to earn XP, maintain your streak, and track your progress over time.'
  }, {
    icon: <ScanLineIcon className="w-6 h-6" />,
    title: 'OCR Scan & Learn',
    description: 'Scan text in your target language and get instant translations, pronunciations, and add words to your vocabulary list.'
  }];
  const testimonials = [{
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    content: 'LinguaAI helped me prepare for a business trip to Spain in just 2 months. The AI conversations were incredibly helpful for building confidence.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80',
    rating: 5,
    language: 'Spanish'
  }, {
    name: 'David Chen',
    role: 'Software Engineer',
    content: "The daily challenges keep me motivated, and the pronunciation feedback has significantly improved my speaking skills. Best language app I've used!",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80',
    rating: 5,
    language: 'Japanese'
  }, {
    name: 'Emma Rodriguez',
    role: 'University Student',
    content: "The OCR feature is a game-changer! I can scan my textbook and instantly get translations and pronunciations. It's like having a tutor with me 24/7.",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80',
    rating: 4,
    language: 'French'
  }];
  return <div className="pt-16 overflow-hidden relative">
    <AnimatedBackground />
    {/* Hero Section */}
    <section ref={ref} className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div className="lg:w-1/2 mb-10 lg:mb-0 z-10" initial={{
            opacity: 0,
            x: -50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5
          }}>
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }}>
              <span className="block">Master Any Language</span>
              <motion.span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" animate={{
                backgroundPosition: ['0% center', '100% center']
              }} transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}>
                with AI
              </motion.span>
            </motion.h1>
            <motion.p className="text-xl text-gray-600 dark:text-gray-300 mb-8" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }}>
              Your personal language coach — wherever you are. Learn through
              conversation, get instant feedback, and track your progress.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.6
            }}>
              <Button to="/signup" size="lg" icon={<ArrowRightIcon className="w-5 h-5" />} iconPosition="right">
                Start Learning
              </Button>
              <Button to="/chat" variant="outline" size="lg">
                Try a Demo
              </Button>
            </motion.div>
          </motion.div>
          <motion.div className="lg:w-1/2 relative z-10" initial={{
            opacity: 0,
            x: 50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5,
            delay: 0.3
          }} style={{
            y,
            opacity
          }}>
            <motion.div whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }} transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="People learning languages with AI" className="rounded-lg shadow-xl" />
            </motion.div>
            {/* Floating Elements */}
            <motion.div className="absolute -top-10 -right-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.8
            }} whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center">
                <motion.div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-3" animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0]
                }} transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}>
                  <TrophyIcon className="w-5 h-5" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium">12-day streak!</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Keep it going
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 1
            }} whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center">
                <motion.div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3" animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0]
                }} transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  delay: 1
                }}>
                  <MessageCircleIcon className="w-5 h-5" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium">AI Conversation</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Practice anytime
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="text-white dark:text-gray-800"></path>
        </svg>
      </div>
    </section>
    {/* Features Section */}
    <section id="features" className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} viewport={{
            once: true
          }} className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 mr-1" />
            AI-Powered Learning
          </motion.div>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }}>
            How LinguaAI Works
          </motion.h2>
          <motion.p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }}>
            Our AI-powered platform makes language learning effective,
            engaging, and personalized to your needs.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} delay={index * 0.1} />)}
        </div>
      </div>
    </section>
    {/* Testimonials Section */}
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800/50 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} viewport={{
            once: true
          }} className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-1 rounded-full text-sm font-medium mb-4">
            <TrophyIcon className="w-4 h-4 mr-1" />
            Success Stories
          </motion.div>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }}>
            What Our Users Say
          </motion.h2>
          <motion.p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }}>
            Join thousands of satisfied learners who have transformed their
            language skills with LinguaAI.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <TestimonialCard key={index} name={testimonial.name} role={testimonial.role} content={testimonial.content} avatar={testimonial.avatar} rating={testimonial.rating} language={testimonial.language} />)}
        </div>
      </div>
    </section>
    {/* CTA Section */}
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 md:p-16 text-center text-white" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5
        }} whileHover={{
          boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
        }}>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-6" initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }}>
            Ready to Start Your Language Journey?
          </motion.h2>
          <motion.p className="text-xl mb-8 max-w-2xl mx-auto" initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.4
          }}>
            Join LinguaAI today and experience the future of language
            learning. Your first week is on us!
          </motion.p>
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.6
          }}>
            <Button to="/signup" variant="primary" size="lg" className="bg-white text-black dark:text-blue-600 hover:bg-gray-200" icon={<ArrowRightIcon className="w-5 h-5" />} iconPosition="right">
              Get Started for Free
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  </div>;
};
export default LandingPage;