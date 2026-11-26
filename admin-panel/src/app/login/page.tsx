import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

/** Only same-site paths, so ?next= cannot send people to another website. */
function safeNext(next: string | string[] | undefined) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const { next } = await searchParams;
  const showDevHint = process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD;

  return (
    <main className="relative isolate grid min-h-dvh place-items-center px-5 py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
      />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <div>
            <p className="font-semibold tracking-[-0.02em]">Al-Musawir</p>
            <p className="eyebrow">Admin</p>
          </div>
        </div>
        <h1 className="mt-10 text-[1.75rem] leading-tight font-semibold tracking-[-0.03em]">Sign in</h1>
        <p className="mt-1.5 text-muted">Edit the projects, services and page text on the website.</p>
        <LoginForm next={safeNext(next)} />
        {showDevHint && (
          <p className="mt-6 rounded-lg border border-dashed border-line-strong px-4 py-3 font-mono text-[0.78rem] text-subtle">
            Mock login (development): admin@example.com / admin12345
          </p>
        )}
      </div>
    </main>
  );
}
