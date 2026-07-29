import { Link } from "@tanstack/react-router";
import { useStudio } from "../lib/store";

export function SiteFooter() {
  const STUDIO = useStudio();
  return (
    <footer className="border-t-2 border-primary/20 mt-24">
      <Marquee />
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-[family-name:var(--font-display)] text-primary text-4xl leading-none">
            {STUDIO.name}
          </p>
          <p className="mt-4 text-sm max-w-sm opacity-80">
            Mural &amp; fine art studio led by {STUDIO.artist}. Painting walls, canvases and stories
            from {STUDIO.city}.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-3">Studio</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/gallery" className="hover:text-primary">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary">
                Services
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-3">Reach</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${STUDIO.email}`} className="hover:text-primary break-all">
                {STUDIO.email}
              </a>
            </li>
            <li>
              <a href={`tel:${STUDIO.phoneRaw}`} className="hover:text-primary">
                {STUDIO.phone}
              </a>
            </li>
            <li>
              <a
                href={STUDIO.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={STUDIO.pinterest}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                Pinterest
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/15 px-6 py-6 text-xs uppercase tracking-[0.25em] text-primary/60 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-7xl mx-auto">
        <span>
          © {new Date().getFullYear()} {STUDIO.name}
        </span>
        <div className="flex gap-4 items-center">
          <span>Painted by hand in India</span>
        </div>
      </div>
    </footer>
  );
}

function Marquee() {
  const words = [
    "Murals",
    "Wall Art",
    "Canvas",
    "Interiors",
    "Portraits",
    "Faridabad",
    "Since 2015",
    "Hand-painted",
  ];
  const row = [...words, ...words, ...words];
  return (
    <div className="overflow-hidden bg-primary text-primary-foreground py-4 border-y-2 border-primary">
      <div className="flex gap-10 whitespace-nowrap animate-marquee font-[family-name:var(--font-display)] text-2xl md:text-3xl">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w}
            <span className="opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
