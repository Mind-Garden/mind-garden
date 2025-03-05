'use client';

import React, { useEffect, useState } from 'react';
import { login, signup, forgotPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CircleAlert, LoaderCircle, Lock, Mail, User } from 'lucide-react';
import { WordRotate } from '@/components/magicui/word-rotate';
import Footer from '@/components/footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState(
    process.env.NEXT_PUBLIC_SITE_URL || '',
  );

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

  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      {/* Title, logo and tagline */}
      <div className="text-center mb-12 relative">
        <div className=" flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Mind Garden Logo"
            className="h-20 w-auto mb-4 mr-7"
          />
          <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text mb-4">
            Mind Garden
          </h1>
        </div>
        <div className="text-2xl text-gray-600 flex justify-left items-center">
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
      </div>

      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/50 shadow-xl border-0 rounded-2xl">
        <CardContent className="space-y-8 p-12">
          <form
            onSubmit={async (e) => {
              e.preventDefault(); // Prevent form from reloading the page
              const formData = new FormData(e.currentTarget);
              await handleAuth(formData);
            }}
            className="space-y-8"
          >
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3">
                <CircleAlert className="h-6 w-6 text-red-600" />
                <p className="text-base text-red-600">{error}</p>
              </div>
            )}

            {/* First and Last Name  for signup only*/}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-8">
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
                    isLogin ? 'Enter your password' : 'Create a strong password'
                  }
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>

            {/* Submit auth button for login or signup */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
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

            {/* Toggle between login and signup */}
            <div className="text-center">
              <span className="text-base text-gray-600">
                {isLogin
                  ? 'Don\'t have an account?'
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
      <Footer />
    </div>
  );
}
