"use client";

import type { FormEvent } from "react";
import { whatsappLink } from "@/data/site";
import { buttonClass } from "./ui";

const plotSizes = ["5 Marla", "10 Marla", "1 Kanal", "Commercial", "Other"];
const field = "rounded-md border border-line bg-panel px-3 py-2.5 text-ink";
const label = "grid gap-1 font-medium";

/** Builds a WhatsApp message from the form and opens it in a new tab. Nothing is sent to a server. */
export function ContactForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const message = `Plot: ${data.get("size")}\nCity: ${data.get("city")}\n${data.get("message") || ""}`;
    window.open(whatsappLink(message), "_blank", "noopener");
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-[480px] gap-3.5">
      <label className={label}>
        Plot size
        <select name="size" className={field}>
          {plotSizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        City
        <input name="city" required className={field} />
      </label>
      <label className={label}>
        What do you need?
        <textarea name="message" rows={4} className={field} />
      </label>
      <button type="submit" className={buttonClass()}>
        Send on WhatsApp
      </button>
    </form>
  );
}
