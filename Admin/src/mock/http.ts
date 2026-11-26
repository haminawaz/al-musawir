import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/types";
import { read, write, type Collection, type Database } from "./db";

// Response helpers for the mock API. Every response is JSON:
//   success: { data: ... }
//   failure: { error: "message", details?: ["problem", ...] }

export const ok = <T>(data: T, status = 200) => NextResponse.json({ data }, { status });

export const fail = (status: number, error: string, details?: string[]) =>
  NextResponse.json(details?.length ? { error, details } : { error }, { status });

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

type Handler<C> = (request: NextRequest, context: C, user: SessionUser) => Promise<Response> | Response;

/** Runs the handler only for a signed-in user; otherwise answers 401. */
export function withUser<C>(handler: Handler<C>) {
  return async (request: NextRequest, context: C) => {
    const user = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user) return fail(401, "Not signed in.");
    try {
      return await handler(request, context, user);
    } catch (error) {
      console.error(error);
      return fail(500, "Something went wrong in the mock API.");
    }
  };
}

/**
 * GET and PUT for content that is saved as one document, such as the site settings or the services list.
 * PUT replaces the whole document after validation.
 */
export function documentRoute<K extends Collection>(
  key: K,
  options: { label: string; href: string; validate: (body: unknown, current: Database[K]) => string[] },
) {
  return {
    GET: withUser(() => ok(read(key))),
    PUT: withUser(async (request, _context, user) => {
      const body = await readJson(request);
      const errors = options.validate(body, read(key));
      if (errors.length) return fail(422, "Some fields need fixing.", errors);
      write(key, body as Database[K], { user: user.name, action: "updated", target: options.label, href: options.href });
      return ok(read(key));
    }),
  };
}
