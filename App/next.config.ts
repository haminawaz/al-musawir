import type { NextConfig } from "next";

// The site used to be plain .html files. Keep those old links working.
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

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(legacyPages).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
