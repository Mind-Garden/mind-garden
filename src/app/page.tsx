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
  ArrowRight,
  EyeOff,
  Eye,
} from 'lucide-react';
import Footer from '@/components/footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TypingAnimation } from '@/components/magicui/typing-animation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setError('');
  }, [isLogin]);

  const handleAuth = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await (isLogin ? login(formData) : signup(formData));
      setError(error ?? '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailRef.current?.value;
    if (!email) {
      return toast.warn('Please enter your email first.');
    }

    setIsLoading(true);
    const { error } = await forgotPassword(email, window.location.origin);
    setIsLoading(false);

    error
      ? toast.warn('Please try again later.')
      : toast.success('Password reset email sent successfully.');
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
    <div className="font-body min-h-screen w-full flex flex-col items-center px-4 py-12 bg-gradient-to-br ">
      <div className="w-full max-w-lg flex flex-col items-center text-center space-y-6 mb-12">
        {/* Logo Section */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Mind Garden Logo"
            className="h-24 w-auto mb-2 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-6xl md:text-7xl font-extrabold text-slate-800 font-title tracking-tight pb-8 transition-transform duration-300 hover:scale-105">
          Mind Garden
        </h1>

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
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 bg-white/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <CircleAlert className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-red-600 text-base">{error}</p>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleAuth(new FormData(e.currentTarget));
            }}
            className="space-y-6"
          >
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First Name"
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  placeholder="you@example.com"
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-base text-primary hover:text-primary/80 transition-colors"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder={
                    isLogin ? 'Enter your password' : 'Create a strong password'
                  }
                  className="pl-10 h-12 text-base pr-10"
                  required
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 transition-all duration-300 relative overflow-hidden text-base font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 absolute inset-0 transition-transform duration-300">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  <span>
                    {isLogin
                      ? 'Unlocking your garden...'
                      : 'Sprouting your account...'}
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 absolute inset-0 transition-transform duration-300">
                  <span>{isLogin ? 'Log in' : 'Create account'}</span>
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-base text-slate-600">
                {isLogin
                  ? "Don't have an account?"
                  : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
