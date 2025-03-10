import { Pacifico, Dosis, Mulish } from 'next/font/google';

export const pacifico = Pacifico({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-pacifico',
});

export const dosis = Dosis({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-dosis',
});

export const mulish = Mulish({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-mulish',
});
