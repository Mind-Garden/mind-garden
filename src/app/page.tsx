'use client';

import { useEffect, useState, useRef } from 'react';
import { login, signup, forgotPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  CircleAlert,
  LoaderCircle,
  Lock,
  Mail,
  User,
  LineChart,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Calendar,
  Eye,
  EyeOff,
  PenLine,
  Check,
  Plus,
  Trash2,
  BrushIcon as Broom,
  X,
} from 'lucide-react';
import { TypingAnimation } from '@/components/magicui/typing-animation';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
  const [index, setIndex] = useState(0);

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
    const email = document.querySelector<HTMLInputElement>('#email')?.value;

    if (!email) {
      toast.warn('Please enter your email first.');
      return;
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

  const words = [
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
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative font-sans">
      {/* Path Morphing Navigation */}
      {isFeaturesInView ? <PathMorphingNav featuresRef={featuresRef} /> : null}

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
          {/* Animated Slogan */}
          <div className="text-slate-600 flex flex-col md:flex-row items-center">
            <span className="mr-2 text-slate-500 text-2xl">Cultivate Your</span>
            <TypingAnimation
              className="inline-block font-semibold text-2xl"
              duration={100}
              delay={500}
              key={words[index]} // Forces re-render for new word
            >
              {words[index]}
            </TypingAnimation>
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
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          I started my morning with a 10-minute meditation
                          session, which helped me center myself before a busy
                          day. The team meeting went better than expected, and I
                          felt confident presenting my ideas. Other than that, I
                          had a good time with my girlfriend today. We went for
                          a walk around the park and the weather was beautiful.
                        </p>
                      </div>

                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                        <PenLine className="w-4 h-4 mr-2" />
                        Save Entry
                      </Button>
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
          <div ref={aiRef} className="mb-32">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              initial={{ opacity: 0 }}
              animate={isAiInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-full md:w-1/2 order-2 md:order-1"
                initial={{ x: -50 }}
                animate={isAiInView ? { x: 0 } : { x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                  AI-Powered Task Management
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Streamline your productivity with our intelligent task
                  management system that helps you organize and prioritize:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Voice input to quickly capture tasks as they come to mind
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      AI organizes and categorizes your tasks automatically
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Track completion progress and maintain productivity
                      momentum
                    </span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 order-1 md:order-2"
                initial={{ x: 50 }}
                animate={isAiInView ? { x: 0 } : { x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-70"></div>

                  <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      isAiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {/* Task Management UI */}
                    <div className="scale-[0.85] origin-top">
                      <div className="w-full space-y-3 p-4 pt-6">
                        <p className="text-gray-500 text-sm text-center">
                          Press record and tell me about your tasks for today.
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-gray-100 text-gray-600 p-3 rounded-full shadow-md"
                                >
                                  <Broom className="w-5 h-5" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Clear all tasks</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 max-w-md mx-auto"
                          >
                            <Card className="bg-white shadow-md border-none overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex items-center justify-center p-3">
                                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                        fill="#3B82F6"
                                      />
                                      <path
                                        d="M19 12C19 12.9193 18.8189 13.8295 18.4672 14.6788C18.1154 15.5281 17.5998 16.2997 16.9497 16.9497C16.2997 17.5998 15.5281 18.1154 14.6788 18.4672C13.8295 18.8189 12.9193 19 12 19C11.0807 19 10.1705 18.8189 9.32122 18.4672C8.47194 18.1154 7.70026 17.5998 7.05025 16.9497C6.40024 16.2997 5.88463 15.5281 5.53284 14.6788C5.18106 13.8295 5 12.9193 5 12C5 10.1435 5.7375 8.36301 7.05025 7.05025C8.36301 5.7375 10.1435 5 12 5C13.8565 5 15.637 5.7375 16.9497 7.05025C18.2625 8.36301 19 10.1435 19 12Z"
                                        stroke="#3B82F6"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </div>
                                  <div className="ml-3 text-gray-500">
                                    Tap to record
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-blue-500 text-white p-3 rounded-full shadow-md"
                                >
                                  <Plus className="w-5 h-5" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Add task manually</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Main Card */}
                      <Card className="w-full overflow-hidden border-none shadow-lg bg-white rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 bg-blue-50">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-500 rounded-full p-1.5">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 4.75V6.25"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M17.25 6.75L16.25 7.75"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19.25 12H17.75"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M17.25 17.25L16.25 16.25"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 19.25V17.75"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M7.75 16.25L6.75 17.25"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6.25 12H4.75"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M7.75 7.75L6.75 6.75"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <h2 className="text-lg font-medium">AI Insights</h2>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="p-4 pt-2 pb-0">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Suggested To-Do List
                            </h3>

                            <div className="relative mb-4">
                              <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: '50%' }}
                                  initial={{ width: '0%' }}
                                  animate={
                                    isAiInView
                                      ? { width: '50%' }
                                      : { width: '0%' }
                                  }
                                  transition={{ duration: 0.8, delay: 0.6 }}
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>3 completed</span>
                                <span>6 total</span>
                              </div>
                            </div>
                          </div>

                          {/* Task Lists - Side by Side */}
                          <div className="grid grid-cols-2 gap-4 p-4">
                            {/* Left Column - To Do Tasks */}
                            <div className="space-y-4">
                              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                <div className="bg-blue-100 p-1 rounded-full">
                                  <Check className="w-4 h-4 text-blue-500" />
                                </div>
                                To Do
                              </h3>

                              <div className="space-y-2">
                                {[
                                  'Review notes and textbook chapters',
                                  'Get enough sleep and eat well',
                                  'Confirm meeting time with client',
                                ].map((task, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={
                                      isAiInView
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 10 }
                                    }
                                    transition={{
                                      duration: 0.4,
                                      delay: 0.7 + index * 0.1,
                                    }}
                                  >
                                    <Checkbox
                                      checked={false}
                                      className="rounded-full border-2 border-gray-300"
                                    />
                                    <span className="flex-1 text-sm">
                                      {task}
                                    </span>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Right Column - Completed Tasks */}
                            <div className="space-y-4">
                              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                <div className="bg-green-100 p-1 rounded-full">
                                  <Check className="w-4 h-4 text-green-500" />
                                </div>
                                Completed
                              </h3>

                              <div className="space-y-2">
                                {[
                                  'Practice problems and past exams',
                                  'Focus on weak areas of the subject',
                                  'Use flashcards for learning',
                                ].map((task, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={
                                      isAiInView
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 10 }
                                    }
                                    transition={{
                                      duration: 0.4,
                                      delay: 0.9 + index * 0.1,
                                    }}
                                  >
                                    <Checkbox
                                      checked={true}
                                      className="rounded-full border-2 border-green-500 bg-green-500"
                                    />
                                    <span className="flex-1 text-sm text-gray-400 line-through">
                                      {task}
                                    </span>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
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
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder={
                              isLogin
                                ? 'Enter your password'
                                : 'Create a strong password'
                            }
                            className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-5 top-3 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {passwordVisible ? <EyeOff /> : <Eye />}
                          </button>
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
