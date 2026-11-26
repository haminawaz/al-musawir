import { reset } from "@/mock/db";
import { ok, withUser } from "@/mock/http";

/** Mock only: puts every piece of content back to the copy taken from the website. */
export const POST = withUser((_request, _context, user) => {
  reset(user.name);
  return ok({ reset: true });
});
