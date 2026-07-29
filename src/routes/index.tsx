import { createFileRoute, Link } from "@tanstack/react-router";
import { motion as framerMotion } from "framer-motion";
import { heroImage, type Work } from "../lib/works";
import { STUDIO as staticStudio } from "../lib/studio";
import { useWorks, useStudio } from "../lib/store";
import { FeaturedCarousel } from "../components/home/FeaturedCarousel";
import { ClientsSection } from "../components/home/ClientsSection";
import { AbstractTeaser } from "../components/home/AbstractTeaser";
import { ExclusiveSection } from "../components/home/ExclusiveSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${staticStudio.name} — Hand-Painted Murals & Wall Art, Faridabad` },
      {
        name: "description",
        content: `Studio by ${staticStudio.artist}. Murals, wall art, restaurant interiors, canvas commissions across India.`,
      },
      { property: "og:title", content: `${staticStudio.name} — Mural & Wall Art Studio` },
      {
        property: "og:description",
        content: `Hand-painted murals and wall art by ${staticStudio.artist}, based in ${staticStudio.city}.`,
      },
      { property: "og:image", content: heroImage },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const testimonials = [
  {
    quote: "Tarun turned a blank wall into the heart of our café. Guests photograph it every day.",
    by: "Aarti K.",
    role: "Café owner, Faridabad",
  },
  {
    quote:
      "The mural in our daughter's room is pure magic. Careful, patient, and genuinely talented.",
    by: "Rohit & Meera",
    role: "Private home",
  },
  {
    quote: "Chitrakar delivered on-time and elevated our brand space beyond what we imagined.",
    by: "Studio Nine",
    role: "Retail client",
  },
];

function Index() {
  const works = useWorks();
  const featured = works.filter((w) => w.featured).slice(0, 6);

  return (
    <>
      <Hero />

      {/* Redesigned Featured Work Section with Sliding Carousel */}
      {featured.length > 0 && (
        <section className="px-6 py-20 bg-background relative">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-primary/25 pb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-2 font-semibold">
                  Curated Highlights
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-7xl -rotate-1 leading-none">
                  Featured Work
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/gallery"
                  className="text-xs uppercase tracking-[0.3em] text-primary hover:opacity-70 underline underline-offset-8 decoration-2 shrink-0 font-semibold"
                >
                  View full gallery →
                </Link>
              </div>
            </div>
            <FeaturedCarousel items={featured} />
          </div>
        </section>
      )}

      {/* Clients / Worked for section BEFORE Abstract Series */}
      <ClientsSection />

      {/* Redesigned Abstract Series section with 3 Swappable cards stack */}
      <AbstractTeaser />

      {/* NEW - Exclusive / On-Demand section AFTER Abstract Series */}
      <ExclusiveSection />

      <Testimonials />

      <CTA />
    </>
  );
}

function Hero() {
  const STUDIO = useStudio();
  return (
    <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden grain">
      <div className="mx-auto max-w-6xl text-center relative">
        <framerMotion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs md:text-sm uppercase tracking-[0.4em] text-primary/70 mb-8 font-semibold"
        >
          Mural Artist · Wall Art · Commercial Interiors
        </framerMotion.p>
        <h1 className="font-[family-name:var(--font-display)] text-primary leading-[0.88] text-balance">
          <framerMotion.span
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="block text-6xl sm:text-8xl md:text-[10rem]"
          >
            LET'S PAINT
          </framerMotion.span>
          <framerMotion.span
            initial={{ opacity: 0, y: 30, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="block text-6xl sm:text-8xl md:text-[10rem] mt-2 md:mt-4"
          >
            YOUR WALLS
          </framerMotion.span>
        </h1>
        <framerMotion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left"
        >
          <p className="text-base md:text-lg leading-relaxed text-primary/85">
            {STUDIO.name} is a mural &amp; fine-art studio led by <strong>{STUDIO.artist}</strong>.
            From full-wall murals for restaurants and homes to portrait commissions and canvas work
            — painted by hand from our studio in {STUDIO.city}.
          </p>
          <div className="space-y-2 md:text-right font-semibold uppercase tracking-wider text-sm md:text-base text-primary/80">
            <p>{STUDIO.instagramHandle}</p>
            <p>{STUDIO.phone}</p>
            <p className="lowercase">{STUDIO.email}</p>
          </div>
        </framerMotion.div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/gallery"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-[0.25em] rounded-full hover:scale-105 transition-transform"
          >
            See the Work
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 border-2 border-primary text-primary font-semibold text-xs uppercase tracking-[0.25em] rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Commission a Piece
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="px-6 py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.4em] opacity-70 mb-4 font-semibold">
          Kind Words
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl mb-14 -rotate-1 leading-none">
          From clients &amp; collectors
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <framerMotion.blockquote
              key={t.by}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-8 rounded-2xl border-2 border-primary-foreground/30 bg-primary-foreground/5"
              style={{ transform: `rotate(${i % 2 === 0 ? -0.6 : 0.6}deg)` }}
            >
              <p className="text-lg leading-relaxed opacity-95">"{t.quote}"</p>
              <footer className="mt-6 text-xs uppercase tracking-[0.25em] opacity-80 font-semibold">
                — {t.by} · {t.role}
              </footer>
            </framerMotion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-28 text-center bg-background">
      <h2 className="font-[family-name:var(--font-display)] text-primary text-6xl sm:text-7xl md:text-9xl leading-[0.9] -rotate-1">
        Got a wall?
      </h2>
      <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-primary/80 leading-relaxed">
        Restaurants, cafés, homes, brand spaces — let's plan a piece that turns your space into a
        story.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/contact"
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-[0.25em] hover:scale-105 transition-transform font-semibold"
        >
          Start a project
        </Link>
        <Link
          to="/services"
          className="px-8 py-3 border-2 border-primary text-primary rounded-full text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors font-semibold"
        >
          See services
        </Link>
      </div>
    </section>
  );
}
