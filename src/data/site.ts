export const site = {
  name: "Al-Musawir",
  tagline: "Naqsha nawees and land survey, Pakistan",
  // Placeholders: replace both with the real WhatsApp number.
  whatsappDisplay: "+92 300 0000000",
  whatsappNumber: "920000000000",
  hours: "Mon to Sat, 9am to 6pm",
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/survey", label: "Land survey" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
