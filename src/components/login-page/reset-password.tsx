'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'react-toastify';

import { modifyPassword } from '@/actions/auth';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardHeader } from '@/components/shadcn/card';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';

export default function ResetPassword({ session }: { session: any }) {
  const newPass = useRef<HTMLInputElement>(null);
  const confirmPass = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (
      confirmPass.current &&
      newPass.current &&
      confirmPass.current.value === newPass.current.value
    ) {
      const result = await modifyPassword(newPass.current.value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Password updated successfully!');
        redirect('/');
      }
    } else if (
      confirmPass.current &&
      newPass.current &&
      confirmPass.current.value !== newPass.current.value
    ) {
      toast.warn('Passwords do not match');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w">
        <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-300">
          <Card className="w-full backdrop-blur-sm bg-white/90 shadow-xl border-0 rounded-[14px] relative p-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-title font-bold">
                    Reset Password
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="newPassword"
                  className="text-base font-body text-gray-700"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    ref={newPass}
                    placeholder="Enter new password"
                    className="font-body pl-12 h-12 text-lg bg-white/80 border-gray-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="text-base font-body text-gray-700"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    ref={confirmPass}
                    placeholder="Confirm new password"
                    className="font-body pl-12 h-12 text-lg bg-white/80 border-gray-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="items-center pt-4 pb-4 ">
                  <Button
                    className="w-full font-body text-base h-12 bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-300 hover:from-emerald-400 hover:via-teal-400 hover:to-violet-400 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleSubmit}
                  >
                    Reset Password
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
