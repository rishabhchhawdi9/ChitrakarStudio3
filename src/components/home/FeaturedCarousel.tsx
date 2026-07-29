import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { type Work } from "../../lib/works";
import { useStudio } from "../../lib/store";
import { Eye, ArrowRight } from "lucide-react";

interface FeaturedCarouselProps {
  items: Work[];
}

export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const STUDIO = useStudio();

  // If there are no items, return null
  if (!items || items.length === 0) return null;

  // We duplicate the items 3 times to make sure we have plenty of width for seamless infinite looping
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-10 select-none">
      {/* Inject custom CSS keyframes for seamless, hardware-accelerated continuous sliding marquee */}
      <style>{`
        @keyframes marqueeContinuous {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.3333%, 0, 0);
          }
        }
        .marquee-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: marqueeContinuous 32s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background radial gradient accent */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/2 opacity-30 blur-3xl pointer-events-none" />

      {/* Continuous Marquee Container */}
      <div className="w-full overflow-hidden py-4">
        <div className="marquee-track px-4">
          {marqueeItems.map((w, index) => {
            return (
              <div
                key={`${w.id}-${index}`}
                className="w-[280px] sm:w-[320px] md:w-[380px] shrink-0"
              >
                {/* Clean, Symmetric Museum-Grade Frame Card */}
                <div className="group bg-background border border-primary/10 rounded-2xl p-3.5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
                  {/* Aspect Ratio Controlled Image Holder */}
                  <div className="relative overflow-hidden rounded-xl bg-primary/5 aspect-[4/3] w-full">
                    <img
                      src={w.url}
                      alt={`${w.title} by ${STUDIO.name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />

                    {/* Dark Elegant View Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-primary rounded-full text-xs uppercase tracking-wider font-bold shadow-md hover:scale-105 transition-transform"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Gallery</span>
                      </Link>
                    </div>
                  </div>

                  {/* Artwork Labels Below (Simplified and Clutter-free) */}
                  <div className="mt-4 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/45">
                      {w.category}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-primary text-xl mt-0.5 leading-tight group-hover:text-primary/75 transition-colors truncate">
                      {w.title}
                    </h3>
                    <p className="text-xs text-primary/70 mt-1.5 line-clamp-2 leading-relaxed">
                      {w.caption}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continuous Motion Guide / Call to Action */}
      <div className="mx-auto max-w-7xl px-6 md:px-24 flex items-center justify-between gap-6 mt-8">
        <span className="text-[10px] text-primary/40 uppercase tracking-[0.25em] font-medium flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
          Continuous Loop · Hover to pause
        </span>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-bold text-primary hover:opacity-70 group"
        >
          <span>Explore All Artworks</span>
          <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
