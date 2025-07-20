import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuIcon, XIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme
  } = useTheme();

  const {
    isAuthenticated,
    
    logout
  } = useAuth();


  const userString = localStorage.getItem("user");
const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = isAuthenticated
    ? [
      { name: 'AI Chat', path: '/chat' },
      { name: 'Challenges', path: '/challenges' },
      { name: 'Scan & Learn', path: '/ocr' },
      { name: 'Dashboard', path: '/dashboard' }
    ]
    : [
      { name: 'Home', path: '/' }
    ];

  return <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
    <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <motion.div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center" whileHover={{
          rotate: 10,
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
          <span className="text-white font-bold text-xl">L</span>
        </motion.div>
        <motion.span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600" initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.3
        }}>
          LinguaAI
        </motion.span>
      </Link>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <ul className="flex space-x-6">
          {navLinks.map(link => <li key={link.path}>
            <Link to={link.path} className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${location.pathname === link.path ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {link.name}
              {location.pathname === link.path && <motion.div layoutId="navbar-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </Link>
          </li>)}
        </ul>
        {/* Theme Toggle */}
        <motion.button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme" whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }}>
          {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-700" />}
        </motion.button>
        {/* Auth Buttons */}
        {isAuthenticated ? <div className="flex items-center space-x-3">
          <motion.div whileHover={{
            scale: 1.05
          }}>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src={user?.image} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-500" />
              <span className="font-medium">{user?.name}</span>
            </Link>
          </motion.div>
          <motion.button onClick={logout} className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
            Logout
          </motion.button>
        </div> : <div className="flex items-center space-x-3">
          <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
            <Link to="/login" className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Login
            </Link>
          </motion.div>
          <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
            <Link to="/signup" className="px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
          </motion.div>
        </div>}
      </div>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-3">
        <motion.button onClick={toggleTheme}>
          {theme === 'dark'
            ? <SunIcon className="w-5 h-5 text-yellow-400" />
            : <MoonIcon className="w-5 h-5 text-gray-700" />
          }
        </motion.button>

        <motion.button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle menu" whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }}>
          {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </motion.button>
      </div>
    </nav>
    {/* Mobile Menu */}
    <AnimatePresence>
      {isOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }} className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <ul className="space-y-4">
            {navLinks.map(link => <motion.li key={link.path} whileHover={{
              x: 5
            }} transition={{
              type: 'spring',
              stiffness: 300
            }}>
              <Link to={link.path} className={`block py-2 font-medium ${location.pathname === link.path ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {link.name}
              </Link>
            </motion.li>)}
          </ul>
          <div className="mt-6 space-y-3">
            {isAuthenticated ? <>
              <Link to="/dashboard" className="flex items-center space-x-2 py-2">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-500" />
                <span className="font-medium">{user?.name}</span>
              </Link>
              <motion.button onClick={logout} className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                Logout
              </motion.button>
            </> : <>
              <motion.div whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                <Link to="/login" className="block w-full px-4 py-2 text-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                <Link to="/signup" className="block w-full px-4 py-2 text-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </motion.div>
            </>}
          </div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </header>;
};
export default Navbar;