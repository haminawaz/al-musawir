"use client";

import { useState, type FormEvent } from "react";
import { whatsappLink } from "@/lib/format";
import type { PageTexts } from "@/lib/types";
import { buttonClass, WhatsAppIcon } from "./ui";

const field =
  "w-full rounded-lg border border-line-strong bg-raised px-4 py-3 text-fg transition placeholder:text-subtle hover:border-subtle focus:border-accent focus:outline-none aria-invalid:border-danger";

type Result = { kind: "sent" } | { kind: "blocked"; href: string } | null;

/**
 * Builds a WhatsApp message from the form and opens it in a new tab. Nothing is sent to a server.
 * After submitting, a status line says what happened; if the browser blocks the new tab, it offers a direct link.
 */
export function ContactForm({ whatsappNumber, text }: { whatsappNumber: string; text: PageTexts["contact"]["form"] }) {
  const [cityError, setCityError] = useState(false);
  const [result, setResult] = useState<Result>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const data = new FormData(e.currentTarget);
    const city = String(data.get("city") ?? "").trim();
    if (!city) {
      setCityError(true);
      e.currentTarget.querySelector<HTMLInputElement>("input[name=city]")?.focus();
      return;
    }
    const message = `Plot: ${data.get("size")}\nCity: ${city}\n${String(data.get("message") ?? "").trim()}`.trim();
    const href = whatsappLink(whatsappNumber, message);
    // No "noopener" feature here: with it, window.open always returns null and a blocked tab cannot be detected.
    // The new tab is cut off from this page by clearing its opener instead.
    const tab = window.open(href, "_blank");
    if (tab) {
      tab.opener = null;
      setResult({ kind: "sent" });
    } else {
      setResult({ kind: "blocked", href });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-7 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Plot size</legend>
        <div className="flex flex-wrap gap-2">
          {text.plotSizes.map((s, i) => (
            <label key={i} className="cursor-pointer">
              <input type="radio" name="size" value={s} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-fg">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="city" className="text-sm font-medium">
          City <span className="font-normal text-subtle">(required)</span>
        </label>
        <input
          id="city"
          name="city"
          autoComplete="address-level2"
          required
          maxLength={100}
          placeholder={text.cityPlaceholder}
          aria-invalid={cityError || undefined}
          aria-describedby={cityError ? "city-error" : undefined}
          onChange={() => cityError && setCityError(false)}
          className={field}
        />
        {cityError && (
          <p id="city-error" role="alert" className="text-sm text-danger">
            {text.cityError}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm font-medium">
          What do you need? <span className="font-normal text-subtle">(optional)</span>
        </label>
        <textarea id="message" name="message" rows={4} maxLength={1000} placeholder={text.messagePlaceholder} className={field} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-subtle">{text.helpText}</p>
        <button type="submit" className={buttonClass()}>
          <WhatsAppIcon className="size-5" />
          {text.submitLabel}
        </button>
      </div>

      {/* Always in the page, so screen readers announce what is put into it. */}
      <div role="status" aria-live="polite" className="empty:hidden">
        {result?.kind === "sent" && (
          <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            WhatsApp opened in a new tab with your message filled in. Press send there to reach us.
          </p>
        )}
        {result?.kind === "blocked" && (
          <p className="rounded-lg border border-danger/50 bg-danger/10 px-4 py-3 text-sm">
            Your browser blocked the new tab.{" "}
            <a href={result.href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">
              Open WhatsApp with your message
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
