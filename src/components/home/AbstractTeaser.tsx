import { Link } from "@tanstack/react-router";
import { useAbstracts, useStudio } from "../../lib/store";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AbstractTeaser() {
  const ABSTRACT_ARTS = useAbstracts();
  const STUDIO = useStudio();

  const featuredArts = ABSTRACT_ARTS.slice(0, 3);

  if (featuredArts.length === 0) return null;

  return (
    <section className="px-6 py-20 bg-card border-y border-primary/10 overflow-hidden relative">
      {/* Background soft lighting accent */}
      <div className="absolute right-1/4 top-1/4 w-96 h-96 rounded-full bg-primary/2 opacity-30 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/45 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Hero Exhibition Launch
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl sm:text-6xl -rotate-1 leading-none tracking-tight">
              Abstract Space
            </h2>
            <p className="text-base text-primary/80 leading-relaxed">
              Step away from representative lines and delve into physical materiality. Our dedicated
              abstract showcase highlights {STUDIO.artist}'s experimental canvases—sculpted with
              gesso plaster, natural oxides, gold leaf, and mineral ash.
            </p>
          </div>
          <Link
            to="/abstract"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform cursor-pointer shadow-sm"
          >
            <span>Explore All Canvases</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3-Column Fine Art Panels (No Overlapping) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArts.map((art, index) => {
            const photos = art.photos || [];
            if (photos.length === 0) return null;

            return (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col space-y-4 bg-background border border-primary/10 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-primary/25 transition-all duration-300"
              >
                {/* Visual Image */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-primary/5 border border-primary/5">
                  <img
                    src={photos[0].url}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  {/* Subtle artist tag inside */}
                  <div className="absolute top-3 left-3 bg-background/90 border border-primary/15 text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full text-primary">
                    {art.series}
                  </div>
                </div>

                {/* Details labels */}
                <div className="text-left space-y-1.5 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-primary/40 block">
                      {art.year} · {art.medium}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-primary text-xl mt-0.5 leading-tight group-hover:text-primary/75 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-primary/70 mt-1.5 line-clamp-2 leading-relaxed">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-primary/5 mt-auto">
                    <Link
                      to="/abstract"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:opacity-75"
                    >
                      <span>Inspect Surface Detail</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
