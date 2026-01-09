export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold text-black dark:text-white">Expense Management System</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          Multi-tenant expense management for petty expenses
        </p>
        <a
          href="/login"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Sign In
        </a>
      </main>
    </div>
  );
}
