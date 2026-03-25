'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors">
          AlgoViz
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {user.email[0].toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm text-slate-600 sm:block">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
