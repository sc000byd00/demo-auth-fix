import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addNote, loadNotes } from "./notes";

function fakeClient(options: {
  user: { id: string } | null;
  rows?: object[];
  error?: { message: string };
}) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: options.rows ?? [],
      error: options.error ?? null,
    }),
    insert: vi.fn().mockResolvedValue({ error: options.error ?? null }),
  };
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: options.user } }),
    },
    from: vi.fn().mockReturnValue(query),
  };
  return { client: client as unknown as SupabaseClient, query };
}

describe("loadNotes", () => {
  it("returns null without a signed-in user and runs no query", async () => {
    const { client, query } = fakeClient({ user: null });

    expect(await loadNotes(client)).toBeNull();
    expect(query.select).not.toHaveBeenCalled();
  });

  it("filters by the user from the session, not from client state", async () => {
    const rows = [{ id: "n1", body: "Hello", created_at: "2026-10-18" }];
    const { client, query } = fakeClient({ user: { id: "user-1" }, rows });

    expect(await loadNotes(client)).toEqual(rows);
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("surfaces query errors instead of showing an empty list", async () => {
    const { client } = fakeClient({
      user: { id: "user-1" },
      error: { message: "boom" },
    });

    await expect(loadNotes(client)).rejects.toThrow("boom");
  });
});

describe("addNote", () => {
  it("saves the note for the session user", async () => {
    const { client, query } = fakeClient({ user: { id: "user-1" } });

    await addNote(client, "  Buy milk ");

    expect(query.insert).toHaveBeenCalledWith({
      body: "Buy milk",
      user_id: "user-1",
    });
  });

  it("ignores empty notes", async () => {
    const { client, query } = fakeClient({ user: { id: "user-1" } });

    await addNote(client, "   ");

    expect(query.insert).not.toHaveBeenCalled();
  });
});
