'use client';

import { deleteAccount } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function DeleteAccount(props: { userId: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteAccount(props.userId);
    setOpen(false);
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
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
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
