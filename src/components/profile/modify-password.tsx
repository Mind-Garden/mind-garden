'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
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
import FloatingShapes from '@/components/ui/floating-shapes';

export default function ModifyPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const newPass = useRef<HTMLInputElement>(null);
  const confirmPass = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (
      confirmPass.current &&
      newPass.current &&
      confirmPass.current.value === newPass.current.value
    ) {
      try {
        setIsLoading(true);
        const result = await modifyPassword(newPass.current.value);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Password updated successfully!');
          // Clear input fields after a successful password change
          if (newPass.current && confirmPass.current) {
            newPass.current.value = '';
            confirmPass.current.value = '';
          }
        }
      } catch (error) {
        toast.error('An error occurred while updating your password.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.warn('Passwords do not match');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="font-body"
    >
      <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-300">
        <Card className="bg-white rounded-[14px] h-full overflow-hidden border-none">
          <div className="absolute inset-0 rounded-xl z-0" />
          <FloatingShapes
            colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
            className={'z-10'}
          />
          <CardHeader className="relative z-10">
            <CardTitle className="font-title">Change Password</CardTitle>
            <CardDescription className="font-header font-semibold text-md">
              Update your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                ref={newPass}
                disabled={isLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-2"
            >
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                ref={confirmPass}
                disabled={isLoading}
              />
            </motion.div>
          </CardContent>
          <CardFooter className="relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}
