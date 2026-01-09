/**
 * Auth Layout
 *
 * Layout for authentication pages (login, etc.)
 * No authentication required for these routes.
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      {children}
    </div>
  );
}
