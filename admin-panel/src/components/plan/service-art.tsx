// Copied from the website (App/src/components/plan) so the dashboard draws plans the same way.
import type { ServiceId } from "@/lib/types";

// Small line drawings, one per service, in the "model" tone. Inside a `group`, the accent lines brighten on hover.
const base = "fill-none stroke-fg/70 stroke-[1.5]";
const thin = "fill-none stroke-fg/35 stroke-1";
const accent = "fill-none stroke-accent/70 stroke-1 transition-[stroke] duration-300 group-hover:stroke-accent";
const label = "fill-accent/80 font-mono text-[8px]";

export function ServiceArt({ id, className = "h-auto w-full" }: { id: ServiceId; className?: string }) {
  return (
    <svg viewBox="0 0 240 150" aria-hidden="true" className={className}>
      {art[id]}
    </svg>
  );
}

const art: Record<ServiceId, React.ReactNode> = {
  "floor-plans": (
    <>
      <path className={accent} d="M60 18H180M60 14V22M180 14V22" />
      <text className={label} x="120" y="12" textAnchor="middle">
        30&apos;-0&quot;
      </text>
      <rect className="fill-none stroke-fg/80 stroke-[3.5]" x="60" y="30" width="120" height="104" />
      <path className={base} d="M60 82H120V134M120 30V82H180M150 82V134" />
      <path className={thin} d="M100 82A16 16 0 0 1 84 98M84 82V98M150 104A14 14 0 0 1 136 118M150 118H136" />
      <path className={thin} d="M76 30H96M138 30H162M180 46V66" />
    </>
  ),
  elevations: (
    <>
      <path className={thin} d="M20 132H220" />
      <rect className="fill-none stroke-fg/80 stroke-[2.5]" x="56" y="44" width="128" height="88" />
      <path className={base} d="M50 44H190M50 38H190V44M50 38V44" />
      <rect className={thin} x="72" y="62" width="28" height="30" />
      <rect className={thin} x="140" y="62" width="28" height="30" />
      <path className={thin} d="M86 62V92M154 62V92" />
      <rect className={base} x="108" y="94" width="24" height="38" />
      <path className={accent} d="M204 132V44M200 132H208M200 44H208" />
      <text className={label} x="212" y="47">
        +11&apos;
      </text>
      <text className={label} x="212" y="135">
        ±0
      </text>
    </>
  ),
  "working-drawings": (
    <>
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V6" className="stroke-fg/30 stroke-1" />
        </pattern>
      </defs>
      <path className={thin} d="M20 104H220" />
      <rect x="98" y="26" width="26" height="78" fill="url(#hatch)" className="stroke-fg/70 stroke-[1.5]" />
      <path className="fill-none stroke-fg/70 stroke-[1.5]" d="M90 104H132V116H140V128H82V116H90Z" />
      <path className={thin} d="M74 128H148" />
      <path className={accent} d="M160 26V128M156 26H164M156 104H164M156 128H164" />
      <text className={label} x="168" y="68">
        10&apos;-6&quot;
      </text>
      <text className={label} x="168" y="119">
        2&apos;
      </text>
      <path className={accent} d="M98 50L56 36H30" />
      <text className={label} x="30" y="32">
        9&quot; brick
      </text>
    </>
  ),
  "approval-drawings": (
    <>
      <rect className={base} x="34" y="16" width="172" height="118" />
      <rect className={thin} x="48" y="28" width="82" height="70" />
      <path className={thin} d="M48 62H90V98M90 28V62" />
      <path className={base} d="M138 98H206M138 98V134M138 110H206M138 122H206M170 98V134" />
      <circle className={accent} cx="168" cy="54" r="22" />
      <circle className={accent} cx="168" cy="54" r="17" />
      <path className={accent} d="M159 54L165 60L178 47" />
      <path className={thin} d="M48 110H124M48 120H110" />
    </>
  ),
};
