'use client';

import { useState, useRef } from 'react';
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
import { modifyPassword } from '@/actions/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from 'lucide-react';
import FloatingShapes from '../ui/floating-shapes';
import { motion } from 'framer-motion';

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
    >
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-emerald-400">
        <FloatingShapes className="bg-emerald-200" />
        <CardHeader>
          <CardTitle className="font-title">Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        <CardFooter>
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
    </motion.div>
  );
}
