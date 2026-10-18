import type { SupabaseClient } from "@supabase/supabase-js";

export type Note = { id: string; body: string; created_at: string };

export async function loadNotes(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("notes")
    .select("id, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Loading notes failed: ${error.message}`);

  return data as Note[];
}

export async function addNote(supabase: SupabaseClient, body: string) {
  const text = body.trim();
  if (!text) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("notes")
    .insert({ body: text, user_id: user.id });
  if (error) throw new Error(`Saving note failed: ${error.message}`);
}
