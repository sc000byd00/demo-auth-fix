import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Notes</h1>
      <p className="mb-6">A small notes app on Next.js and Supabase.</p>
      <div className="flex gap-4">
        <Link href="/login" className="underline">
          Sign in
        </Link>
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
