'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { deleteAccount } from '@/actions/auth';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import FloatingShapes from '@/components/ui/floating-shapes';

export default function DeleteAccount(props: { userId: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteAccount(props.userId);
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="font-body"
    >
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-red-500 border-2 overflow-hidden">
        <FloatingShapes colors={['bg-red-200']} />
        <CardHeader>
          <CardTitle className="font-title">Delete Account</CardTitle>
          <CardDescription className="font-header font-semibold text-md">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="destructive">
                  Delete Account <Trash2 className="w-6 h-6" />
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Yes, delete my account
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
