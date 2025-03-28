'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { modifyAccount } from '@/actions/auth';
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

export default function ModifyAccount(props: {
  profileData: any;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (firstNameRef.current && lastNameRef.current && emailRef.current) {
      try {
        setIsLoading(true);
        const result = await modifyAccount(
          firstNameRef.current.value,
          lastNameRef.current.value,
          emailRef.current.value,
          props.userId,
        );
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Profile updated successfully!');
        }
      } catch (error) {
        toast.error('An error occurred while updating your profile.');
      } finally {
        setIsLoading(false);
      }
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
            <CardTitle className="font-title">Profile Information</CardTitle>
            <CardDescription className="font-header font-semibold text-md">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                defaultValue={props.profileData?.first_name}
                ref={firstNameRef}
                disabled={isLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-2"
            >
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                defaultValue={props.profileData?.last_name}
                ref={lastNameRef}
                disabled={isLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-2"
            >
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={props.profileData?.email}
                ref={emailRef}
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
                  'Update Profile'
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}
