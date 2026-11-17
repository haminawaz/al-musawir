import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { buttonClass, PageBody, Split } from "@/components/ui";
import { whatsappLink } from "@/data/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PageBody>
      <Split align="start">
        <div>
          <h1>Get your plot drawn</h1>
          <p className="mt-4 mb-6 text-muted">Send your plot size and city. We reply the same day.</p>
          <a href={whatsappLink()} className={buttonClass()}>
            Message on WhatsApp
          </a>
        </div>
        <ContactForm />
      </Split>
    </PageBody>
  );
}
