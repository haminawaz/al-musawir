import { read } from "@/mock/db";
import { ok, withUser } from "@/mock/http";

/** All page text at once. */
export const GET = withUser(() => ok(read("pages")));
