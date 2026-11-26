import { read } from "@/mock/db";
import { ok, withUser } from "@/mock/http";

/** The latest changes, newest first. */
export const GET = withUser(() => ok(read("activity")));
