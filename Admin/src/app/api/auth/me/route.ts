import { ok, withUser } from "@/mock/http";

export const GET = withUser((_request, _context, user) => ok({ user }));
