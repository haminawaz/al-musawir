// Server-side only: where the backend is. Read from API_URL at runtime, so changing it needs a
// restart, not a rebuild. Used by the /api forwarder and by src/proxy.ts.

const DEV_DEFAULT = "http://localhost:4000";

export function backendOrigin(): string {
  const value = process.env.API_URL?.trim() || (process.env.NODE_ENV === "production" ? "" : DEV_DEFAULT);
  if (!value) throw new Error("API_URL is not set. Set it to the backend's address, e.g. https://api.example.com.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`API_URL is not a valid URL: "${value}".`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("API_URL must start with https:// or http://.");
  return url.origin;
}

/** A path on the backend's admin API, e.g. adminApiUrl("/auth/me"). */
export const adminApiUrl = (path: string) => `${backendOrigin()}/api/admin${path}`;
