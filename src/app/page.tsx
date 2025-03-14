'use client';

import { useEffect, useState, useRef } from 'react';
import { useEffect, useState, useRef } from 'react';
import { login, signup, forgotPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  CircleAlert,
  LoaderCircle,
  Lock,
  Mail,
  User,
  LineChart,
  BookOpen,
  CheckCircle,
  Brain,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { WordRotate } from '@/components/magicui/word-rotate';
import Footer from '@/components/footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import PathMorphingNav from '@/components/path-morphing-nav';
import PathDrawing from '@/components/arrow-explore';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState(
    process.env.NEXT_PUBLIC_SITE_URL || '',
  );
  const [showAuthForm, setShowAuthForm] = useState(false);

  const heroRef = useRef(null);
  const authRef = useRef<HTMLElement>(null);
  const isAuthInView = useInView(authRef, { once: false, amount: 0.3 });
  const featuresRef = useRef<HTMLDivElement>(null);
  const isFeaturesInView = useInView(featuresRef, { amount: 0.25 });

  // Feature section refs for animations
  const habitRef = useRef<HTMLDivElement>(null);
  const journalRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  const isHabitInView = useInView(habitRef, { amount: 0.5, once: false });
  const isJournalInView = useInView(journalRef, { amount: 0.5, once: false });
  const isDataInView = useInView(dataRef, { amount: 0.5, once: false });
  const isAiInView = useInView(aiRef, { amount: 0.5, once: false });

  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  /**
   * Handles authentication by calling the appropriate function
   * (login or signup) based on the value of isLogin.
   */
  const handleAuth = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await (isLogin ? login(formData) : signup(formData));
      setError(error ?? '');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the error message when the user switches between login and signup
  useEffect(() => {
    setError('');
  }, [isLogin]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_SITE_URL) {
      setSiteUrl(window.location.origin);
    }
  }, []);

  /**
   * Handles the forgot password functionality.
   */
  const handleForgotPassword = async () => {
    const email = emailRef.current?.value;
    if (!email) {
      return toast.warn('Please enter your email first.');
    }

    try {
      const { error, success } = await forgotPassword(email, siteUrl);
      if (error) {
        toast.warn('Please try again later.');
      } else {
        toast.success('Password reset email sent successfully.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setShowAuthForm(true), 500);
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative font-sans">
      {/* Path Morphing Navigation */}
      {isFeaturesInView ? <PathMorphingNav featuresRef={featuresRef} /> : null}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950"></div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="h-screen flex flex-col items-center justify-center relative"
        style={{ opacity, scale, y }}
      >
        {/* Title, logo, and tagline centered */}
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center">
            <motion.img
              src="/logo.png"
              alt="Mind Garden Logo"
              className="h-20 w-auto mb-4 mr-7"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
            />
            <h1 className="p-10 font-title text-7xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text mb-4 tracking-tight z-2">
              Mind Garden
            </h1>
          </div>
          <div className="text-2xl text-gray-600 dark:text-gray-300 flex justify-center items-center mt-2">
            <span className="mr-2 z-1">Cultivate Your</span>
            <span className="text-4xl font-bold text-emerald-500 inline-flex items-center">
              <WordRotate
                className="inline-block"
                words={[
                  'Mental Wellness',
                  'Growth',
                  'Mindfulness',
                  'Balance',
                  'Resilience',
                  'Well-being',
                  'Potential',
                  'Focus',
                  'Happiness',
                  'Strength',
                  'Self-awareness',
                ]}
              />
            </span>
          </div>
        </motion.div>

        {/* PathDrawing aligned to the right */}
        <motion.div className="">
          <PathDrawing />
        </motion.div>

        {/* Arrow to the right of the title */}
        <motion.div
          className="mt-20 flex justify-center items-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          onClick={scrollToAuth}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center cursor-pointer"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-2 font-light">
              Click here to unlock your garden
            </p>
            <ChevronDown className="h-6 w-6 text-emerald-500" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-20">
        {/* Content Wrapper */}
        <div className="relative max-w-6xl mx-auto z-10 px-4">
          <motion.h2
            className="pb-6 text-4xl md:text-5xl font-bold text-center mb-24 bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How Mind Garden Helps You Thrive
          </motion.h2>

          {/* Feature 1: Habit Tracking */}
          <div ref={habitRef} className="mb-32">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              initial={{ opacity: 0 }}
              animate={isHabitInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-full md:w-1/2 order-2 md:order-1"
                initial={{ x: -50 }}
                animate={isHabitInView ? { x: 0 } : { x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                  Habit Tracking
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Build consistent routines that nurture your mental well-being.
                  Our intelligent habit tracker helps you:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Create custom habits tailored to your mental health goals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Track streaks and build momentum with visual progress
                      indicators
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Receive gentle reminders and personalized insights
                    </span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 order-1 md:order-2"
                initial={{ x: 50 }}
                animate={isHabitInView ? { x: 0 } : { x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-emerald-500 mr-3" />
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                          Daily Habits
                        </h4>
                      </div>
                      <span className="text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/50 py-1 px-3 rounded-full">
                        4/5 Today
                      </span>
                    </div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isHabitInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {[
                        {
                          name: 'Morning Meditation',
                          completed: true,
                          streak: 12,
                        },
                        {
                          name: 'Gratitude Journal',
                          completed: true,
                          streak: 28,
                        },
                        { name: 'Mindful Walk', completed: true, streak: 5 },
                        {
                          name: 'Evening Reflection',
                          completed: true,
                          streak: 15,
                        },
                        { name: 'Digital Detox', completed: false, streak: 0 },
                      ].map((habit, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl ${habit.completed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-700/30'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={
                            isHabitInView
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 10 }
                          }
                          transition={{
                            duration: 0.3,
                            delay: 0.5 + index * 0.1,
                          }}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${habit.completed ? 'bg-emerald-500' : 'border-2 border-gray-300 dark:border-gray-600'}`}
                            >
                              {habit.completed && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <span
                              className={`font-medium ${habit.completed ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {habit.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
                              {habit.streak} days
                            </span>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, habit.streak * 3.33)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Feature 2: Journaling */}
          <div ref={journalRef} className="mb-32">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              initial={{ opacity: 0 }}
              animate={isJournalInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-full md:w-1/2 order-2 md:order-2"
                initial={{ x: 50 }}
                animate={isJournalInView ? { x: 0 } : { x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                  Journaling
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Express your thoughts and emotions in a safe, private space
                  designed to foster self-reflection and growth:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Guided prompts to inspire meaningful reflection
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Rich text editor with mood tracking and tagging
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      End-to-end encryption for complete privacy
                    </span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 order-1 md:order-1"
                initial={{ x: -50 }}
                animate={isJournalInView ? { x: 0 } : { x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 overflow-hidden">
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <BookOpen className="h-7 w-7 text-blue-500 mr-3" />
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                          Today's Journal
                        </h4>
                      </div>
                      <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/50 py-1 px-3 rounded-full">
                        May 14, 2025
                      </span>
                    </div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isJournalInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="mb-4">
                        <h5 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                          How am I feeling today?
                        </h5>
                        <div className="flex space-x-3">
                          {['😊', '😌', '😐', '😔', '😤'].map((emoji, i) => (
                            <motion.button
                              key={i}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${i === 1 ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                        <h5 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                          Today's Reflection
                        </h5>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          I started my morning with a 10-minute meditation
                          session, which helped me center myself before a busy
                          day. The team meeting went better than expected, and I
                          felt confident presenting my ideas...
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-1 px-3 rounded-full">
                          Gratitude
                        </span>
                        <span className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 py-1 px-3 rounded-full">
                          Work
                        </span>
                        <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 py-1 px-3 rounded-full">
                          Meditation
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Feature 3: Data Visualization */}
          <div ref={dataRef} className="mb-32">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              initial={{ opacity: 0 }}
              animate={isDataInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-full md:w-1/2 order-2 md:order-1"
                initial={{ x: -50 }}
                animate={isDataInView ? { x: 0 } : { x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                  Data Visualization
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Gain powerful insights into your mental well-being through
                  beautiful, intuitive visualizations:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Track mood patterns and identify triggers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Visualize progress across all your wellness metrics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Discover correlations between habits and emotional
                      well-being
                    </span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 order-1 md:order-2"
                initial={{ x: 50 }}
                animate={isDataInView ? { x: 0 } : { x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-100 dark:bg-purple-900/30 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <LineChart className="h-7 w-7 text-purple-500 mr-3" />
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                          Wellness Insights
                        </h4>
                      </div>
                      <div className="flex space-x-2">
                        <span className="text-xs font-medium bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 py-1 px-2 rounded-full">
                          Week
                        </span>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-1 px-2 rounded-full">
                          Month
                        </span>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-1 px-2 rounded-full">
                          Year
                        </span>
                      </div>
                    </div>

                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isDataInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {/* Mood Chart */}
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
                          Mood Trends
                        </h5>
                        <div className="h-32 flex items-end space-x-2">
                          {[65, 72, 58, 80, 75, 90, 85].map((value, index) => (
                            <motion.div
                              key={index}
                              className="flex-1 bg-gradient-to-t from-purple-500 to-blue-400 rounded-t-md"
                              style={{ height: `${value}%` }}
                              initial={{ height: 0 }}
                              animate={
                                isDataInView
                                  ? { height: `${value}%` }
                                  : { height: 0 }
                              }
                              transition={{
                                duration: 0.5,
                                delay: 0.6 + index * 0.1,
                              }}
                            ></motion.div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>

                      {/* Habit Completion */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                          Habit Completion
                        </h5>
                        <div className="space-y-3">
                          {[
                            { name: 'Meditation', completion: 85 },
                            { name: 'Journaling', completion: 92 },
                            { name: 'Exercise', completion: 68 },
                          ].map((habit, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">
                                  {habit.name}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {habit.completion}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={
                                    isDataInView
                                      ? { width: `${habit.completion}%` }
                                      : { width: 0 }
                                  }
                                  transition={{
                                    duration: 0.8,
                                    delay: 0.8 + index * 0.2,
                                  }}
                                ></motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Feature 4: AI Assistant */}
          <div ref={aiRef} className="mb-16">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              initial={{ opacity: 0 }}
              animate={isAiInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-full md:w-1/2 order-2 md:order-2"
                initial={{ x: 50 }}
                animate={isAiInView ? { x: 0 } : { x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Leverage the power of artificial intelligence to enhance your
                  mental wellness journey:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Personalized insights based on your journal entries and
                      habits
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Smart to-do list generation tailored to your goals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Adaptive recommendations that evolve with your progress
                    </span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 order-1 md:order-1"
                initial={{ x: -50 }}
                animate={isAiInView ? { x: 0 } : { x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 overflow-hidden">
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Brain className="h-7 w-7 text-blue-500 mr-3" />
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                          AI Insights
                        </h4>
                      </div>
                      <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/50 py-1 px-3 rounded-full">
                        Updated Now
                      </span>
                    </div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isAiInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500">
                        <h5 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          Weekly Summary
                        </h5>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Based on your journal entries, your mood has been
                          consistently improving this week. Your meditation
                          practice is showing positive effects on your stress
                          levels. Consider increasing outdoor activities as they
                          correlate with your highest mood scores.
                        </p>
                      </div>

                      <div>
                        <h5 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                          Suggested To-Do List
                        </h5>
                        <div className="space-y-2">
                          {[
                            'Complete 15-minute morning meditation',
                            'Take a 30-minute walk in nature',
                            "Journal about today's accomplishments",
                            'Practice deep breathing before meeting',
                            'Read 20 pages of mindfulness book',
                          ].map((task, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={
                                isAiInView
                                  ? { opacity: 1, x: 0 }
                                  : { opacity: 0, x: -20 }
                              }
                              transition={{
                                duration: 0.3,
                                delay: 0.6 + index * 0.1,
                              }}
                            >
                              <div className="w-5 h-5 rounded-full border-2 border-blue-500 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-200 text-sm">
                                {task}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section
        ref={authRef}
        className="min-h-screen flex flex-col items-center justify-center py-16 px-4 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isAuthInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl relative"
        >
          <AnimatePresence mode="wait">
            {showAuthForm ? (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="w-full backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 shadow-xl border-0 rounded-2xl relative">
                  <CardContent className="space-y-8 p-12">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        await handleAuth(formData);
                      }}
                      className="space-y-8"
                    >
                      {/* Error message */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex items-center space-x-3"
                        >
                          <CircleAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                          <p className="text-base text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        </motion.div>
                      )}

                      {/* First and Last Name for signup only */}
                      {!isLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label
                              htmlFor="firstName"
                              className="text-base font-medium text-gray-700 dark:text-gray-300"
                            >
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="lastName"
                              className="text-base font-medium text-gray-700 dark:text-gray-300"
                            >
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="email"
                          className="text-base font-medium text-gray-700 dark:text-gray-300"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="password"
                            className="text-base font-medium text-gray-700 dark:text-gray-300"
                          >
                            Password
                          </Label>
                          {isLogin && (
                            <button
                              className="text-base text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                              type="button"
                              onClick={handleForgotPassword}
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={
                              isLogin
                                ? 'Enter your password'
                                : 'Create a strong password'
                            }
                            className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                          />
                        </div>
                      </div>

                      {/* Submit auth button for login or signup */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                              <span>
                                {isLogin
                                  ? 'Unlocking your garden...'
                                  : 'Sprouting your account...'}
                              </span>
                            </>
                          ) : (
                            <span>{isLogin ? 'Log in' : 'Sign up'}</span>
                          )}
                        </Button>
                      </motion.div>

                      {/* Toggle between login and signup */}
                      <div className="text-center">
                        <span className="text-base text-gray-600 dark:text-gray-400">
                          {isLogin
                            ? "Don't have an account?"
                            : 'Already have an account?'}
                        </span>{' '}
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-base text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors"
                        >
                          {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="get-started"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center relative"
              >
                <motion.h2
                  className="pb-4 text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-blue-500 text-transparent bg-clip-text"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Begin Your Journey Today
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Join thousands of others who have transformed their mental
                  well-being with Mind Garden.
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button
                    onClick={() => setShowAuthForm(true)}
                    className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
