'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function Home() {
  const [healthData, setHealthData] = useState<any>(null);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setHealthData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      }
    }
    fetchHealth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 transition-colors duration-500 p-4">
      <main className="relative flex w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-black sm:p-16">
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-12 w-full">
          <div className="flex flex-col items-center gap-4">
            <Image
              className="dark:invert hover:scale-105 transition-transform duration-300"
              src="/next.svg"
              alt="Next.js logo"
              width={120}
              height={24}
              priority
            />
            <h1 className="bg-gradient-to-r from-black to-zinc-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-zinc-500 sm:text-5xl text-center">
              SP Expense Management
            </h1>
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
            {/* User Info / Login Action */}
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white uppercase">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role} • {user?.tenantId}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-black px-8 text-lg font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto shadow-xl hover:shadow-blue-500/10"
                >
                  Sign In to Dashboard
                </button>
              </div>
            )}

            {/* Health Status Card */}
            <div className="group w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 transition-all hover:border-blue-500/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">System Status</span>
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-tighter ${healthData?.status === 'healthy'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  <span className={`h-2 w-2 rounded-full ${healthData?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {healthData?.status || 'Unknown'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Timestamp</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {healthData ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Environment</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium capitalize">
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <p className="max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 text-center">
                Welcome to the next generation of multi-tenant expense management. Secure, scalable, and built for speed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
