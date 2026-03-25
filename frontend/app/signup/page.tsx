'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Google Identity Services and render the button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const scriptId = 'google-gsi';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      const btn = document.getElementById('google-btn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signup_with',
        });
      }
    }
  }, []);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.googleAuth(response.credential);
      setAuth(data.user, data.access, data.refresh);
      router.push('/algorithms');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.register({ email, password });
      setAuth(data.user, data.access, data.refresh);
      router.push('/algorithms');
    } catch (err) {
      if (err instanceof ApiError) {
        const detail = (err.details as Record<string, string[]> | undefined);
        const msg = detail?.email?.[0] ?? detail?.password?.[0] ?? err.message;
        setError(msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-slate-800">
            AlgoViz
          </Link>
          <p className="mt-2 text-slate-500">Create your account</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          {/* Google sign-in button rendered by GIS SDK */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div id="google-btn" className="flex justify-center" />
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
                <span className="ml-1 font-normal text-slate-400">(min. 8 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
