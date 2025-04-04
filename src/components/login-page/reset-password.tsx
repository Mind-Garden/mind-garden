'use client';

import { redirect } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'react-toastify';

import { modifyPassword } from '@/actions/auth';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import { Input } from '@/components/shadcn/input';

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
    <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-300">
      <Card className="w-full backdrop-blur-sm bg-white/90 shadow-xl border-0 rounded-[14px] relative">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <Input id="newPassword" type="password" ref={newPass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <Input id="confirmPassword" type="password" ref={confirmPass} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-300 hover:from-emerald-400 hover:via-teal-400 hover:to-violet-400 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleSubmit}
          >
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
