import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Tells the website that content changed, so its cached pages are rebuilt on the next visit
 * instead of when their timer runs out. Called after every successful save in the admin API.
 *
 * Off unless WEBSITE_REVALIDATE_URL and REVALIDATE_SECRET are both set. Failures are logged and
 * never fail the save: the website still refreshes on its own timer (CONTENT_REVALIDATE_SECONDS there).
 */
export function notifyWebsite() {
  const url = env.WEBSITE_REVALIDATE_URL;
  const secret = env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  fetch(url, {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
    signal: AbortSignal.timeout(5_000),
  })
    .then((res) => {
      if (!res.ok) logger.warn({ status: res.status, url }, "Website did not accept the revalidation request");
    })
    .catch((err: unknown) => logger.warn({ err, url }, "Could not reach the website to refresh its pages"));
}
