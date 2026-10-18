"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addNote } from "@/lib/notes";
import { createClient } from "@/lib/supabase/server";

export async function addNoteAction(formData: FormData) {
  const supabase = await createClient();
  await addNote(supabase, String(formData.get("body") ?? ""));
  revalidatePath("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
