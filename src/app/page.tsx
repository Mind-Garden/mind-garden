'use client';

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
  ChevronDown,
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
  // Inside your Home component:
  const featuresRef = useRef<HTMLDivElement>(null);
  const isFeaturesInView = useInView(featuresRef, { amount: 0.5 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  /**
   * Handles authentication by calling the appropriate function
   * (login or signup) based on the value of isLogin. If the
   * authentication is successful, it resets the error message.
   * If there is an error, it stores the error message in the
   * error state.
   * @param {FormData} formData - The form data to be passed to
   * the authentication function
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
   * Handles the forgot password functionality. It prompts the user to
   * enter their email address and sends a reset email if the email is
   * valid. If the email is not valid or there is any other issue, it
   * shows an error message.
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

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative">
      {/* Path Morphing Navigation */}
      {isFeaturesInView && <PathMorphingNav featuresRef={featuresRef} />}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-green-50 to-blue-50"></div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="h-screen flex flex-col items-center justify-center relative"
        style={{ opacity, scale, y }}
      >
        {/* Title, logo, and tagline */}
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
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text mb-4">
              Mind Garden
            </h1>
          </div>
          <div className="text-2xl text-gray-600 flex justify-center items-center">
            <span className="mr-2">Cultivate Your</span>
            <span className="text-4xl font-bold text-green-500 inline-flex items-center">
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

        {/* Scroll down indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer z-20 "
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
            className="flex flex-col items-center"
          >
            <p className="text-gray-600 mb-2">Get Started</p>
            <ChevronDown className="h-6 w-6 text-green-500" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* New Section - Features/Benefits */}
      <section ref={featuresRef} className="py-24 px-4 bg-gradient-to-b">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How Mind Garden Helps You Thrive
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                {/* Icon here */}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Daily Mindfulness
              </h3>
              <p className="text-gray-600">
                Build a consistent practice with guided meditations tailored to
                your needs and schedule.
              </p>
            </motion.div>

            {/* Add 2 more feature cards with similar structure */}
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
                <Card className="w-full backdrop-blur-sm bg-white/60 shadow-xl border-0 rounded-2xl relative">
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
                          className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3"
                        >
                          <CircleAlert className="h-6 w-6 text-red-600" />
                          <p className="text-base text-red-600">{error}</p>
                        </motion.div>
                      )}

                      {/* First and Last Name for signup only */}
                      {!isLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="firstName" className="text-base">
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                className="pl-12 h-12 text-lg"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="lastName" className="text-base">
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                className="pl-12 h-12 text-lg"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-base">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            className="pl-12 h-12 text-lg"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-base">
                            Password
                          </Label>
                          {isLogin && (
                            <button
                              className="text-base text-green-600 hover:text-green-700 transition-colors"
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
                            className="pl-12 h-12 text-lg"
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
                          className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                              <span>
                                {isLogin
                                  ? 'Unlocking your garden..'
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
                        <span className="text-base text-gray-600">
                          {isLogin
                            ? "Don't have an account?"
                            : 'Already have an account?'}
                        </span>{' '}
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-base text-green-600 hover:text-green-700 font-medium transition-colors"
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
                  className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Begin Your Journey Today
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-600 mb-8 max-w-lg mx-auto"
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
                    className="h-14 px-8 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
