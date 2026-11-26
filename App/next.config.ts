import type { NextConfig } from "next";

// The site used to be plain .html files. Keep those old links working.
// The project addresses are the original slugs: if a project is renamed in the dashboard, update it here.
const legacyPages: Record<string, string> = {
  "/index.html": "/",
  "/services.html": "/services",
  "/projects.html": "/projects",
  "/survey.html": "/survey",
  "/about.html": "/about",
  "/contact.html": "/contact",
  "/project-1.html": "/projects/family-house-5-marla",
  "/project-2.html": "/projects/family-house-10-marla",
  "/project-3.html": "/projects/residence-1-kanal",
  "/project-4.html": "/projects/shop-and-office-block",
};

// Sent with every response. A full script CSP is left out: Next.js inline scripts would need nonces.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site is meant to be shown inside another site's frame.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Ignored over plain HTTP; tells browsers to use HTTPS for this host once they have seen it over HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return Object.entries(legacyPages).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
