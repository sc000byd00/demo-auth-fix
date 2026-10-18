import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

type SetAll = (
  cookies: { name: string; value: string; options: object }[],
  headers: Record<string, string>,
) => void;

let user: { id: string } | null = null;
let refreshedCookie: { name: string; value: string } | null = null;

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: { setAll: SetAll } },
  ) => ({
    auth: {
      // Simulates a token refresh: Supabase writes new cookies during getUser().
      getUser: async () => {
        if (refreshedCookie) {
          options.cookies.setAll(
            [{ ...refreshedCookie, options: { path: "/" } }],
            { "Cache-Control": "private, no-store" },
          );
        }
        return { data: { user } };
      },
    },
  }),
}));

const { updateSession } = await import("./middleware");

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("updateSession", () => {
  beforeEach(() => {
    user = null;
    refreshedCookie = null;
  });

  it("sends refreshed session cookies to the browser", async () => {
    user = { id: "user-1" };
    refreshedCookie = { name: "sb-test-auth-token", value: "new-token" };

    const response = await updateSession(request("/dashboard"));

    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("new-token");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("redirects to /login without a user", async () => {
    const response = await updateSession(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("keeps cookie updates on the redirect", async () => {
    refreshedCookie = { name: "sb-test-auth-token", value: "" };

    const response = await updateSession(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.cookies.get("sb-test-auth-token")).toBeDefined();
  });

  it("lets public pages through without a user", async () => {
    const response = await updateSession(request("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
