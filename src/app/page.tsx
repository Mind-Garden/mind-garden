'use client'

import React, { useEffect, useState } from 'react';
import { login, signup } from "./auth/actions";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Lock, User, CircleAlert } from "lucide-react"
import { Particles } from "@/components/magicui/particles";
import { WordRotate } from "@/components/magicui/word-rotate";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

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
    const result = await (isLogin ? login(formData) : signup(formData));
    if (result?.error) {
      setError(result.error);
    } else {
      setError('');
    }
  };

  // Reset the error message when the user switches between login and signup
  useEffect(() => {
    setError('');
  }, [isLogin]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-16" style={{
      backgroundImage: `url(/gradient.svg)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={"#000000"}
        refresh
      />
      <div className="text-center mb-12 relative">
        <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text mb-4">
          MindGarden
        </h1>
        <div className="text-2xl text-gray-600 flex justify-left items-center">
          <span className="mr-2">Cultivate Your</span>
          <span className="text-4xl font-bold text-green-500 inline-flex items-center">
            <WordRotate
              className="inline-block"
              words={[
                "Mental Wellness",
                "Growth",
                "Mindfulness",
                "Balance",
                "Resilience",
                "Well-being",
                "Potential",
                "Focus",
                "Happiness",
                "Strength",
                "Self-awareness"
              ]}
            />
          </span>
        </div>
      </div>


      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/90 shadow-xl border-0 rounded-2xl">
        <CardContent className="space-y-8 p-12">
          <form action={handleAuth} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3">
                <CircleAlert className="h-6 w-6 text-red-600" />
                <p className="text-base text-red-600">{error}</p>
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-base">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input id="firstName" name="firstName" placeholder="John" className="pl-12 h-12 text-lg" required />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-base">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input id="lastName" name="lastName" placeholder="Doe" className="pl-12 h-12 text-lg" required />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base">Email</Label>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">Password</Label>
                {isLogin && (
                  <p className="text-base text-green-600 hover:text-green-700 transition-colors">
                    Forgot password?
                  </p>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLogin ? "Log in" : "Sign up"}
            </Button>

            <div className="text-center">
              <span className="text-base text-gray-600">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-base text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}