import { redirect } from "next/navigation";
import { loadNotes } from "@/lib/notes";
import { createClient } from "@/lib/supabase/server";
import { addNoteAction, signOutAction } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const notes = await loadNotes(supabase);
  if (!notes) redirect("/login");

  return (
    <main className="mx-auto max-w-xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My notes</h1>
        <form action={signOutAction}>
          <button className="text-sm underline">Sign out</button>
        </form>
      </div>
      <form action={addNoteAction} className="mb-6 flex gap-2">
        <input
          name="body"
          placeholder="New note"
          className="flex-1 rounded border px-3 py-2"
          required
        />
        <button className="rounded bg-black px-3 py-2 text-white">Add</button>
      </form>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id} className="rounded border px-3 py-2">
              {note.body}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
