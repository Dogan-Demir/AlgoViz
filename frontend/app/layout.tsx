import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthInitializer from '@/components/auth/AuthInitializer';
import Navbar from '@/components/nav/Navbar';
import OnboardingTour from '@/components/onboarding/OnboardingTour';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AlgoViz - Interactive Algorithm Learning Platform',
  description:
    'Learn algorithms through interactive visualizations with step-by-step execution, pseudocode highlighting, and educational explanations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthInitializer />
        <Navbar />
        {children}
        <OnboardingTour />
      </body>
    </html>
  );
}
