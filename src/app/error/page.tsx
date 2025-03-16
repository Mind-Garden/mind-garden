'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md border-0 shadow-md rounded-3xl">
        <CardHeader className="pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 text-center font-title">
            Oops!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">Something went wrong on our end.</p>
          <p className="text-sm text-slate-500">
            We're working on fixing this issue. If the problem persists, please
            try again later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-8">
          <Button
            asChild
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
            <Link href="/">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
