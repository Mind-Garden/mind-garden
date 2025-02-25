'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRef } from 'react';
import { modifyPassword } from '@/actions/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ModifyPassword() {
  const newPass = useRef<HTMLInputElement>(null);
  const confirmPass = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (
      confirmPass.current &&
      newPass.current &&
      confirmPass.current.value == newPass.current.value
    ) {
      const result = await modifyPassword(newPass.current.value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Password updated successfully!');
      }
    } else if (
      confirmPass.current &&
      newPass.current &&
      confirmPass.current.value != newPass.current.value
    ) {
      toast.warn('Passwords do not match');
    }
  };
  return (
    <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
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
        <Button onClick={() => handleSubmit()}>Change Password</Button>
      </CardFooter>
    </Card>
  );
}
