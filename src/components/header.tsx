'use client';

import {
  LucideIcon,
  Moon,
  NotebookPen,
  ListCheck,
  Bell,
  ListTodo,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile-dropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      path: '/daily-intake',
      label: 'Daily Intake',
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
    <header className="border-b bg-white/50 backdrop-blur-sm mt-4 mx-4 rounded-full border-none">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Mind Garden Logo"
            className="h-8 w-auto mr-2 transition-transform hover:scale-110"
            onClick={() => router.push('/home')}
            style={{ cursor: 'pointer' }}
          />
          <p className="text-2xl font-semibold text-green-700">Mind Garden</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Navigation buttons generated from navItems array */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <TooltipProvider key={item.path}>
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
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
