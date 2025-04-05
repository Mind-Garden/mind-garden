'use client';

import {
  Bell,
  ListCheck,
  ListTodo,
  LucideIcon,
  Moon,
  NotebookPen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ProfileDropdown } from '@/components/layout/profile-dropdown';
import { Button } from '@/components/shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/tooltip';

// Define navigation item type
interface NavItem {
  icon: LucideIcon;
  path: string;
  label: string;
}

export function Header() {
  const router = useRouter();

  // List of navigation items - easy to add more
  const navItems: NavItem[] = [
    {
      icon: ListCheck,
      path: '/daily-habits',
      label: 'Daily Habits',
    },
    {
      icon: NotebookPen,
      path: '/journal',
      label: 'Journal',
    },
    {
      icon: Moon,
      path: '/sleep-tracker',
      label: 'Sleep Tracker',
    },
    {
      icon: ListTodo,
      path: '/task-manager',
      label: 'Task Manager',
    },
    {
      icon: Bell,
      path: '/reminders',
      label: 'Reminders',
    },
  ];

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo-black-line.png"
              alt="Mind Garden Logo"
              className="h-10 w-auto mr-2 transition-transform hover:scale-110"
              onClick={() => router.push('/home')}
              style={{ cursor: 'pointer' }}
            />
            <p className="text-3xl font-extrabold font-title">Mind Garden</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Show on medium screens and above */}
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TooltipProvider key={item.path} delayDuration={50}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => router.push(item.path)}
                          variant="ghost"
                          size="icon"
                          aria-label={item.label}
                          className="transition-transform hover:scale-110"
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-body">{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Pass navItems to ProfileDropdown only on small screens */}
            <ProfileDropdown navItems={undefined} className="hidden md:block" />
            <ProfileDropdown navItems={navItems} className="block md:hidden" />
          </div>
        </div>
      </header>

      {/*Need This so Components dont render behind the header*/}
      <div className="mt-16"></div>
    </>
  );
}
