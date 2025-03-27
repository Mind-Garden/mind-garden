'use client';

import 'react-toastify/dist/ReactToastify.css';

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
    <Card className="bg-white/50 backdrop-blur-sm rounded-2xl">
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
        <Button onClick={handleSubmit}>Change Password</Button>
      </CardFooter>
    </Card>
  );
}
