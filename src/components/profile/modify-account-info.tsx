'use client';

import { useState } from 'react';
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
import { modifyAccount } from '@/actions/auth';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from 'lucide-react';

export default function ModifyAccount(props: {
  profileData: any;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    // Check if the ref is not null before using it
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
    <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </label>
          <Input
            id="firstName"
            defaultValue={props.profileData?.first_name}
            ref={firstNameRef}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </label>
          <Input
            id="lastName"
            defaultValue={props.profileData?.last_name}
            ref={lastNameRef}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
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
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleSubmit()} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Profile'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
