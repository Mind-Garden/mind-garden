'use client';

import { LogOut, LucideIcon, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import { logout } from '@/actions/auth';
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

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
  hover: { scale: 1.05, transition: { duration: 0.1 } },
};

const buttonClickVariants = {
  tap: { scale: 0.9 },
};

export function ProfileDropdown({
  navItems,
  className = '',
}: ProfileDropdownProps) {
  const { push } = useRouter();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            variants={buttonClickVariants}
            whileTap="tap"
            className="p-2 rounded-md"
          >
            <User className="h-5 w-5" />
          </motion.button>
        </DropdownMenuTrigger>
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
        >
          <DropdownMenuContent align="end" className="w-56">
            {/* Conditionally render navigation items if they're passed in */}
            {navItems && navItems.length > 0 && (
              <>
                <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
                  Navigation
                </DropdownMenuLabel>
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                    >
                      <DropdownMenuItem onClick={() => push(item.path)}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    </motion.div>
                  );
                })}
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <motion.div
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <DropdownMenuItem onClick={() => push('/profile')}>
                Profile
              </DropdownMenuItem>
            </motion.div>
            <DropdownMenuSeparator />
            <motion.div
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 hover:text-red-50 focus:text-red-50 hover:bg-red-600 focus:bg-red-600 cursor-pointer flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </motion.div>
      </DropdownMenu>
    </div>
  );
}
