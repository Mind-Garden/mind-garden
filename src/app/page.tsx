'use client'

import React, { useEffect, useState } from 'react';
import { login, signup } from "./auth/actions";

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
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(/gradient.svg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-700 mb-2">MindGarden</h1>
            <p className="text-gray-500">Cultivate Your Mental Wellness</p>
          </div>

          <form action={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out text-black"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out text-black"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out text-black"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 ease-in-out"
            >
              {isLogin ? "Log in" : "Sign up"}
            </button>

            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 hover:text-green-700 font-medium focus:outline-none"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}