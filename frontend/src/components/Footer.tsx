import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlobeIcon, MessageCircleIcon, HeadphonesIcon, InstagramIcon, TwitterIcon, FacebookIcon, YoutubeIcon } from 'lucide-react';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerLinks = [{
    title: 'Product',
    links: [{
      name: 'Features',
      path: '#features'
    }, {
      name: 'Pricing',
      path: '#pricing'
    }, {
      name: 'Testimonials',
      path: '#testimonials'
    }, {
      name: 'Languages',
      path: '#languages'
    }]
  }, {
    title: 'Resources',
    links: [{
      name: 'Blog',
      path: '/blog'
    }, {
      name: 'Learning Tips',
      path: '/tips'
    }, {
      name: 'Success Stories',
      path: '/stories'
    }, {
      name: 'Language Guides',
      path: '/guides'
    }]
  }, {
    title: 'Company',
    links: [{
      name: 'About Us',
      path: '/about'
    }, {
      name: 'Careers',
      path: '/careers'
    }, {
      name: 'Privacy Policy',
      path: '/privacy'
    }, {
      name: 'Terms of Service',
      path: '/terms'
    }]
  }];
  const socialLinks = [{
    icon: <InstagramIcon className="w-5 h-5" />,
    path: 'https://instagram.com'
  }, {
    icon: <TwitterIcon className="w-5 h-5" />,
    path: 'https://twitter.com'
  }, {
    icon: <FacebookIcon className="w-5 h-5" />,
    path: 'https://facebook.com'
  }, {
    icon: <YoutubeIcon className="w-5 h-5" />,
    path: 'https://youtube.com'
  }];
  return <footer className="bg-gray-100 dark:bg-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                LinguaAI
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Your personal AI language coach available 24/7. Learn through
              conversation, get instant feedback, and track your progress.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => <motion.a key={index} href={social.path} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors" whileHover={{
              y: -3
            }}>
                  {social.icon}
                </motion.a>)}
            </div>
          </div>
          {/* Links Sections */}
          {footerLinks.map((section, index) => <div key={index}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => <li key={linkIndex}>
                    <Link to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>)}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} LinguaAI. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;