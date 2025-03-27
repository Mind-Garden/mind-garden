'use client';

import { LogOut, LucideIcon, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { logout } from '@/actions/auth';
import { Button } from '@/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';

// Define NavItem interface
interface NavItem {
  icon: LucideIcon;
  path: string;
  label: string;
}

interface ProfileDropdownProps {
  navItems?: NavItem[];
  className?: string;
}

export function ProfileDropdown({
  navItems,
  className = '',
}: ProfileDropdownProps) {
  const { push } = useRouter();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Conditionally render navigation items if they're passed in */}
          {navItems && navItems.length > 0 && (
            <>
              <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
                Navigation
              </DropdownMenuLabel>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => push(item.path)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => push('/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 hover:text-red-50 focus:text-red-50 hover:bg-red-600 focus:bg-red-600 cursor-pointer flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
