import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-[1.75rem] font-semibold tracking-[-0.03em]">This page does not exist.</h1>
        <Link href="/dashboard" className={`${buttonClass()} mt-8`}>
          Back to the overview
        </Link>
      </div>
    </main>
  );
}
