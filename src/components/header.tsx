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
import { useEffect, useState } from 'react';

import { ProfileDropdown } from '@/components/profile-dropdown';
import { Button } from '@/components/ui/button';
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
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    // Check on initial load
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo-blue.png"
              alt="Mind Garden Logo"
              className="h-10 w-auto mr-2 transition-transform hover:scale-110"
              onClick={() => router.push('/home')}
              style={{ cursor: 'pointer' }}
            />
            <p className="text-3xl font-extrabold font-title">Mind Garden</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Show navigation buttons only on larger screens */}
            {!isMobile &&
              navItems.map((item) => {
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

            {/* Pass navItems to ProfileDropdown when on mobile */}
            <ProfileDropdown navItems={isMobile ? navItems : undefined} />
          </div>
        </div>
      </header>

      {/*Need This so Components dont render behind the header*/}
      <div className="mt-16"></div>
    </>
  );
}
