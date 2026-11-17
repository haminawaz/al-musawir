import { site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line pt-7 pb-10 text-[.92rem] text-muted print:hidden">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-5 px-6">
        <div>
          {site.name}
          <br />
          {site.tagline}
        </div>
        <div>
          WhatsApp: {site.whatsappDisplay}
          <br />
          {site.hours}
        </div>
      </div>
    </footer>
  );
}
