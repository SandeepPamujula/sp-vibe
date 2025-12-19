/**
 * Dashboard Layout
 *
 * Layout for protected dashboard pages.
 * Requires authentication and tenant context.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header will be added in Milestone 2 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

