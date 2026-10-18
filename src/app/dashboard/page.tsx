"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCachedUser } from "@/lib/session-cache";

type Note = { id: string; body: string; created_at: string };

export default function DashboardPage() {
  const supabase = createClient();
  const user = getCachedUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase
      .from("notes")
      .select("*")
      .eq("user_id", user?.id)
      .then(({ data }) => setNotes(data ?? []));
  }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await supabase
      .from("notes")
      .insert({ body, user_id: user?.id })
      .select()
      .single();
    if (data) setNotes([data, ...notes]);
    setBody("");
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">My notes</h1>
      <form onSubmit={addNote} className="mb-6 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="New note"
          className="flex-1 rounded border px-3 py-2"
          required
        />
        <button className="rounded bg-black px-3 py-2 text-white">Add</button>
      </form>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded border px-3 py-2">
            {note.body}
          </li>
        ))}
      </ul>
    </main>
  );
}
