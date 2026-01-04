import Image from "next/image";

export const dynamic = "force-dynamic";

async function getHealthData() {
  try {
    // Determine base URL based on environment
    // Use an absolute URL for fetch, but handle build-time environment where server is not yet running
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    // Silence error during build as the server is not running
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL) {
      return null;
    }
    console.error('Failed to fetch health data:', error);
    return null;
  }
}

export default async function Home() {
  const healthData = await getHealthData();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 transition-colors duration-500">
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
            <h1 className="bg-gradient-to-r from-black to-zinc-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-zinc-500 sm:text-5xl">
              Expense Management
            </h1>
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
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
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <p className="max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                Welcome to the next generation of multi-tenant expense management. Secure, scalable, and built for speed.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center">
            <button className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-black px-8 text-lg font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto shadow-xl hover:shadow-blue-500/10">
              Get Started
            </button>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-full items-center justify-center rounded-xl border border-zinc-200 px-8 text-lg font-semibold transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 sm:w-auto"
            >
              Documentation
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
