import { SESSION_COOKIE } from "@/lib/auth/session";
import { ok } from "@/mock/http";

export function POST() {
  const response = ok({ signedOut: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
