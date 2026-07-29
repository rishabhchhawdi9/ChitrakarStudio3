import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { STUDIO } from "../lib/studio";
import { heroImage } from "../lib/works";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services & Pricing — ${STUDIO.name}` },
      {
        name: "description",
        content: `Murals, wall art, restaurant interiors and canvas commissions by ${STUDIO.name}. Process, packages and starting rates.`,
      },
      { property: "og:title", content: `Services & Pricing — ${STUDIO.name}` },
      {
        property: "og:description",
        content: `What we paint, how we work, and how much it starts from.`,
      },
      { property: "og:image", content: heroImage },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  {
    title: "Murals",
    body: "Large-scale hand-painted walls for restaurants, cafés, homes and public spaces.",
  },
  {
    title: "Wall Art",
    body: "Bespoke wall paintings, illustrations and decorative motifs made for your space.",
  },
  {
    title: "Interiors",
    body: "End-to-end creative direction for restaurants and commercial interiors.",
  },
  { title: "Canvas", body: "Original paintings, portrait studies and commissioned canvas work." },
];

const process = [
  {
    n: "01",
    title: "Enquiry",
    body: "Share your space, brief and reference. We reply within 48 hours.",
  },
  {
    n: "02",
    title: "Concept",
    body: "Site visit or photos, followed by a hand-drawn concept sketch and quote.",
  },
  {
    n: "03",
    title: "Paint",
    body: "On-site painting with minimal disruption. Timelines from 2 days to 3 weeks.",
  },
  {
    n: "04",
    title: "Reveal",
    body: "Final walk-through, care notes, and a photoshoot of the finished piece.",
  },
];

const packages = [
  {
    tier: "Wall Accent",
    from: "₹15,000",
    body: "Feature panel, decorative motif, single accent wall up to ~40 sq.ft.",
  },
  {
    tier: "Full Mural",
    from: "₹45,000",
    body: "Full room mural or storefront. Custom concept, on-site painting, up to 150 sq.ft.",
  },
  {
    tier: "Commercial Interior",
    from: "On request",
    body: "Restaurants, cafés, retail, hospitality. Multi-wall + creative direction.",
  },
];

function ServicesPage() {
  return (
    <>
      <section className="px-6 pt-16 pb-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4">What I Do</p>
          <h1 className="font-[family-name:var(--font-display)] text-primary text-6xl md:text-8xl -rotate-1 leading-none">
            Services
          </h1>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative p-8 rounded-2xl border-2 border-primary/25 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.8}deg)` }}
            >
              <span className="font-[family-name:var(--font-display)] text-primary/40 text-5xl absolute top-3 right-4">
                0{i + 1}
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-3xl mb-3">{s.title}</h3>
              <p className="text-sm leading-relaxed opacity-90">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.4em] opacity-70 mb-4">How We Work</p>
          <h2 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl leading-none mb-14 -rotate-1">
            The Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 border-2 border-primary-foreground/25 rounded-2xl"
              >
                <p className="font-[family-name:var(--font-display)] text-4xl opacity-60">{p.n}</p>
                <h3 className="font-[family-name:var(--font-display)] text-2xl mt-2">{p.title}</h3>
                <p className="mt-3 text-sm opacity-90">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4">Packages</p>
          <h2 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-7xl leading-none mb-4 rotate-1">
            Starting Rates
          </h2>
          <p className="text-sm max-w-xl opacity-80 mb-12">
            Every project is custom-quoted. Below is a rough starting point — surface prep, height,
            medium and complexity all shape the final quote.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((p, i) => (
              <div
                key={p.tier}
                className="p-8 rounded-2xl border-2 border-primary/25 bg-card"
                style={{ transform: `rotate(${(i - 1) * 0.6}deg)` }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-primary/60">{p.tier}</p>
                <p className="font-[family-name:var(--font-display)] text-primary text-5xl mt-4">
                  {p.from}
                </p>
                <p className="mt-4 text-sm opacity-90">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-[0.25em] hover:scale-105 transition-transform"
            >
              Get a custom quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
