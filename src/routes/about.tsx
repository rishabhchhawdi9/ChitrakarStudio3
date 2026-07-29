import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { STUDIO as staticStudio } from "../lib/studio";
import { useStudio } from "../lib/store";
import { SafeImage } from "../components/SafeImage";
import { portraitImage, heroImage } from "../lib/works";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${staticStudio.artist} — ${staticStudio.name}` },
      {
        name: "description",
        content: `${staticStudio.artist} is a mural and fine artist based in ${staticStudio.city}. Studio story, timeline and press.`,
      },
      { property: "og:title", content: `About ${staticStudio.artist} — ${staticStudio.name}` },
      {
        property: "og:description",
        content: `Mural artist and founder of ${staticStudio.name}, painting walls, canvases and stories from ${staticStudio.city}.`,
      },
      { property: "og:image", content: staticStudio.portraitUrl || portraitImage },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const timeline = [
  { year: "2015", body: "Studio founded. First commissioned mural in Delhi NCR." },
  { year: "2018", body: "Expanded into full restaurant &amp; café interiors." },
  { year: "2021", body: "Featured in local press for community mural projects." },
  {
    year: "2024",
    body: "Over 200 walls painted across India — private, commercial &amp; hospitality.",
  },
];

const press = ["Local Living", "Design Faridabad", "Café India", "The Wall Journal"];

function AboutPage() {
  const STUDIO = useStudio();

  return (
    <>
      <section className="px-6 py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border-4 border-primary-foreground/20 rotate-[-2deg] shadow-2xl">
              <SafeImage
                src={STUDIO.portraitUrl || portraitImage}
                alt={`${STUDIO.artist} in the studio`}
                className="w-full h-full object-cover"
              />
              <span
                className="tape"
                style={{
                  top: "-10px",
                  left: "40%",
                  background: "oklch(0.965 0.018 85 / 0.5)",
                  borderColor: "oklch(0.965 0.018 85 / 0.7)",
                }}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7"
          >
            <p className="text-xs uppercase tracking-[0.4em] opacity-70 mb-6">Hello There</p>
            <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-8xl leading-none mb-8 -rotate-1">
              I'm {STUDIO.artist.split(" ")[0]}.
            </h1>
            <div className="space-y-4 text-base md:text-lg leading-relaxed max-w-xl opacity-95">
              <p>
                I'm a mural and fine artist based in {STUDIO.city}, and the founder of {STUDIO.name}
                . I paint walls and canvases for restaurants, homes, and brands who want their
                spaces to feel alive.
              </p>
              <p>
                From large-scale interior murals to intimate canvas commissions and portrait studies
                — every piece is hand-painted, one wall and one brushstroke at a time.
              </p>
              <p>If a wall of yours is waiting for a story, I'd love to hear about it.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-7xl mb-12 rotate-1 leading-none">
            Studio Timeline
          </h2>
          <ol className="space-y-6 border-l-2 border-primary/30 pl-8">
            {timeline.map((t, i) => (
              <motion.li
                key={t.year}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                <span className="absolute -left-[42px] top-1 w-4 h-4 rounded-full bg-primary" />
                <p className="font-[family-name:var(--font-display)] text-primary text-3xl">
                  {t.year}
                </p>
                <p
                  className="mt-1 text-base opacity-90"
                  dangerouslySetInnerHTML={{ __html: t.body }}
                />
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-16 border-t-2 border-primary/20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-6 text-center">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center gap-x-14 gap-y-6 font-[family-name:var(--font-display)] text-3xl md:text-4xl text-primary/70">
            {press.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <img src={heroImage} alt="Studio work" className="hidden" />
        <h2 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-7xl -rotate-1">
          Let's make something.
        </h2>
        <div className="mt-8">
          <Link
            to="/contact"
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-[0.25em] hover:scale-105 transition-transform"
          >
            Say hello
          </Link>
        </div>
      </section>
    </>
  );
}
