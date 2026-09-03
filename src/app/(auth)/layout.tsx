// Plain paper for now: the split brand layout comes with the auth redesign (U2).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8">
        {children}
      </div>
    </main>
  );
}
