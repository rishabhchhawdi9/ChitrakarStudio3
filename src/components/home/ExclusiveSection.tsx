import { Link } from "@tanstack/react-router";
import { useWorks } from "../../lib/store";
import { ArrowRight, Sparkles } from "lucide-react";
import { SafeImage } from "../SafeImage";

export function ExclusiveSection() {
  const works = useWorks();
  const exclusiveItems = works.filter((w) => w.exclusive).slice(0, 3); // Three premium items

  if (exclusiveItems.length === 0) return null;

  return (
    <section className="px-6 py-20 bg-card border-t border-primary/10 overflow-hidden relative">
      <div className="mx-auto max-w-7xl relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/45 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary/50" />
              Bespoke Masterpieces
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl sm:text-6xl -rotate-1 leading-none tracking-tight">
              Exclusive &amp; On-Demand
            </h2>
            <p className="text-base text-primary/80 leading-relaxed">
              Highly tactile, specialized creations combining hardwood carpentry, hand-poured epoxy
              resin, dynamic fiber structures, and metal foils. Crafted individually on commission.
            </p>
          </div>
        </div>

        {/* Uniform Sized Cards Layout: Swipeable on Mobile, 3-Column Grid on Tablet/Desktop */}
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
          {exclusiveItems.map((item) => (
            <div
              key={item.id}
              className="w-[290px] sm:w-[350px] md:w-full shrink-0 snap-start snap-always flex flex-col h-full"
            >
              {/* Perfectly Proportioned Fine Art Commission Card with Uniform Height */}
              <div className="group bg-background border border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-primary/25 transition-all duration-300 flex flex-col h-full justify-between text-left">
                <div className="space-y-4">
                  {/* Image Header with aspect-ratio and SafeImage loader */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-primary/5">
                    <SafeImage
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[8px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase font-bold z-10">
                      Bespoke
                    </div>
                  </div>

                  {/* Body Text with fixed heights/caps to ensure uniformity */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/45 block">
                      {item.category}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-primary text-xl mt-0.5 leading-tight group-hover:text-primary/75 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-primary/70 line-clamp-3 leading-relaxed min-h-[3.75rem]">
                      {item.caption}
                    </p>
                  </div>
                </div>

                {/* Footer Trigger Button */}
                <div className="pt-4 border-t border-primary/5 mt-6 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-primary/40 uppercase tracking-widest font-semibold">
                    By Commission Only
                  </span>
                  <Link
                    to="/contact"
                    search={{
                      subject: `Commission inquiry for ${item.title}`,
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary group-hover:opacity-75"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Scroll Hint for Mobile */}
        <p className="text-[9px] text-primary/35 tracking-wider uppercase text-center mt-4 block md:hidden">
          Swipe horizontally to browse on-demand catalog
        </p>
      </div>
    </section>
  );
}
