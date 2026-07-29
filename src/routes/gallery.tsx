import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, heroImage, type Category, type Work } from "../lib/works";
import { STUDIO as staticStudio } from "../lib/studio";
import { useWorks, useStudio, getRelatedWorksByProjectId } from "../lib/store";
import { SafeImage } from "../components/SafeImage";
import { getPinterestFeed, type PinterestPin } from "../lib/pinterest";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  RefreshCw,
  Eye,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery — ${staticStudio.name}` },
      {
        name: "description",
        content: `Selected murals, wall art, canvas and interior work by ${staticStudio.artist}.`,
      },
      { property: "og:title", content: `Gallery — ${staticStudio.name}` },
      {
        property: "og:description",
        content: `Hand-painted murals, wall art and canvas work from the ${staticStudio.name} studio.`,
      },
      { property: "og:image", content: heroImage },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const works = useWorks();
  const STUDIO = useStudio();
  const [viewMode, setViewMode] = useState<"studio" | "pinterest">("studio");
  const [filter, setFilter] = useState<Category | "All">("All");

  // Lightbox State
  const [active, setActive] = useState<Work | null>(null);
  const [activePin, setActivePin] = useState<PinterestPin | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const filteredWorks = useMemo(() => {
    // Hide exclusive pieces from the main gallery unless explicitly sorted or they fit
    // Wait, let's show all published works, sorting by ID
    const baseWorks = works.filter((w) => !w.exclusive);
    return filter === "All" ? baseWorks : baseWorks.filter((w) => w.category === filter);
  }, [filter, works]);

  // Related works for the active work inside the lightbox (from same project ID, or category fallback)
  const relatedWorks = useMemo(() => {
    if (!active) return [];
    const fromProject = getRelatedWorksByProjectId(active.projectId, active.id);
    if (fromProject.length > 0) return fromProject.slice(0, 6);
    return works.filter((w) => w.category === active.category && w.id !== active.id).slice(0, 6);
  }, [active, works]);

  // Handle keyboard navigation inside the related strip
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        setIsZoomed(false);
      } else if (e.key === "ArrowRight" && relatedWorks.length > 0) {
        // Swap to the first related work
        setActive(relatedWorks[0]);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft" && relatedWorks.length > 0) {
        // Swap to the last related work
        setActive(relatedWorks[relatedWorks.length - 1]);
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, relatedWorks]);

  // React Query for live Pinterest feed
  const {
    data: pinterestPins,
    isLoading: isPinterestLoading,
    error: pinterestError,
    refetch: refetchPinterest,
    isFetching: isPinterestFetching,
  } = useQuery({
    queryKey: ["pinterestFeed"],
    queryFn: async () => {
      const res = await getPinterestFeed();
      if (!res.success) throw new Error(res.error || "Failed to fetch");
      return res.pins;
    },
    enabled: viewMode === "pinterest", // Only fetch when user switches to Pinterest view
  });

  return (
    <section className="px-6 py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4 font-semibold">
            The Studio Wall
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-primary text-6xl md:text-8xl -rotate-1 leading-none">
            Gallery
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-primary/80 leading-relaxed">
            A curated showcase from the studio floor. Explore our hand-painted catalog or sync with
            our live Pinterest work desk.
          </p>
        </header>

        {/* View Mode Toggle */}
        <div className="flex gap-6 mb-12 border-b-2 border-primary/10 pb-4">
          <button
            onClick={() => setViewMode("studio")}
            className={`pb-2 text-sm uppercase tracking-[0.2em] font-bold border-b-2 transition-all relative cursor-pointer ${
              viewMode === "studio"
                ? "border-primary text-primary"
                : "border-transparent text-primary/50 hover:text-primary"
            }`}
          >
            Curated Catalog
          </button>
          <button
            onClick={() => setViewMode("pinterest")}
            className={`pb-2 text-sm uppercase tracking-[0.2em] font-bold border-b-2 transition-all relative flex items-center gap-2 cursor-pointer ${
              viewMode === "pinterest"
                ? "border-primary text-primary"
                : "border-transparent text-primary/50 hover:text-primary"
            }`}
          >
            Live Pinterest Feed
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </button>
        </div>

        {viewMode === "studio" ? (
          <>
            {/* Category Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
              <div className="flex flex-wrap gap-3">
                {(["All", ...CATEGORIES] as const).map((c) => {
                  const on = filter === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      className="relative px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold cursor-pointer transition-colors"
                    >
                      <span
                        className={`relative z-10 ${on ? "text-primary-foreground" : "text-primary/70 hover:text-primary"}`}
                      >
                        {c}
                      </span>
                      {on && (
                        <motion.div
                          layoutId="activeCategoryPill"
                          className="absolute inset-0 bg-primary rounded-full -z-0"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                      )}
                      {!on && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 hover:border-primary/25 -z-0 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EVEN, BALANCED POLISHED GALLERY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              <AnimatePresence mode="popLayout">
                {filteredWorks.map((w, i) => {
                  const aspectClass = "aspect-[4/3] w-full object-cover rounded-xl";

                  return (
                    <motion.div
                      key={w.id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="cursor-zoom-in group flex flex-col space-y-3"
                      onClick={() => {
                        setActive(w);
                        setIsZoomed(false);
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/5 shadow-sm group-hover:shadow-md group-hover:border-primary/25 transition-all duration-300">
                        <SafeImage
                          src={w.url}
                          alt={`${w.title} by ${STUDIO.name}`}
                          className={`${aspectClass} transition-transform duration-700 group-hover:scale-[1.035]`}
                        />
                        {/* Elegant hover overlay */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Clean, simplified labels below (No description overload) */}
                      <div className="text-left px-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/45">
                          {w.category}
                        </span>
                        <h3 className="font-[family-name:var(--font-display)] text-primary text-lg mt-0.5 leading-tight group-hover:text-primary/80 transition-colors">
                          {w.title}
                        </h3>
                        {w.projectName && (
                          <span className="text-[9px] text-primary/50 block mt-0.5 italic font-medium">
                            Part of "{w.projectName}"
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="animate-reveal">
            {/* Pinterest Profile Summary Banner */}
            <div className="bg-card rounded-2xl border-2 border-primary/15 p-6 md:p-8 mb-10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-red-600 text-white flex items-center justify-center font-[family-name:var(--font-display)] text-3xl md:text-4xl shadow-md border-2 border-white shrink-0 select-none">
                  CF
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-primary leading-tight">
                    CHITRAKAR FINEARTS
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mt-1">
                    @chitrakarartwork · Live Workpiece Board
                  </p>
                  <p className="mt-3 text-sm max-w-2xl text-primary/90 leading-relaxed">
                    Mural Artist | Wall Art | Restaurant Interiors | Commercial Artwork | Canvas
                    Paintings. This board displays live pictures directly from my official Pinterest
                    feed, showing behind-the-scenes projects and completed commissions.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                    <a
                      href={STUDIO.pinterest}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer"
                    >
                      Visit Pinterest <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => refetchPinterest()}
                      disabled={isPinterestFetching}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary/20 hover:border-primary/50 text-primary font-medium text-xs uppercase tracking-wider rounded-full transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPinterestFetching ? "Syncing..." : "Sync Live Pins"}{" "}
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isPinterestFetching ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinterest Live Feed State Container */}
            {isPinterestLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-sm uppercase tracking-[0.2em] text-primary/60">
                  Retrieving live pins...
                </p>
              </div>
            ) : pinterestError ? (
              <div className="py-16 text-center border-2 border-dashed border-primary/20 rounded-2xl max-w-lg mx-auto px-6">
                <p className="text-sm text-destructive font-medium mb-3">
                  Failed to synchronize with Pinterest.
                </p>
                <p className="text-xs text-primary/70 mb-6 leading-relaxed">
                  We couldn't reach Pinterest's feed. You can retry syncing or explore the artworks
                  directly on Pinterest.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => refetchPinterest()}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer"
                  >
                    Retry Sync
                  </button>
                  <a
                    href={STUDIO.pinterest}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 border-2 border-primary text-primary rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer"
                  >
                    Open Pinterest
                  </a>
                </div>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-8">
                <AnimatePresence mode="popLayout">
                  {pinterestPins?.map((pin, i) => (
                    <motion.figure
                      key={pin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
                      className="break-inside-avoid cursor-zoom-in group relative pt-4"
                      onClick={() => setActivePin(pin)}
                    >
                      {/* Decorative Tape centered on top */}
                      <div className="tape left-1/2 -translate-x-1/2 top-0 z-10 rotate-[-1.5deg]" />

                      <div className="relative overflow-hidden rounded-lg border-2 border-primary/25 bg-card shadow-sm group-hover:shadow-md group-hover:border-primary/60 transition-all duration-300 rotate-[0.5deg] group-hover:rotate-0">
                        <img
                          src={pin.image}
                          alt={pin.title}
                          loading="lazy"
                          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center shadow-md border border-primary/10 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </motion.figure>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REDESIGNED PAPER-CARD STUDIO LIGHTBOX */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setActive(null);
              setIsZoomed(false);
            }}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md p-4 md:p-8 flex items-center justify-center cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-background text-primary max-w-5xl w-full rounded-2xl border-2 border-primary/20 p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] relative grid grid-cols-1 md:grid-cols-12 gap-8 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setActive(null);
                  setIsZoomed(false);
                }}
                className="absolute top-4 right-4 h-9 w-9 rounded-full border border-primary/10 hover:border-primary flex items-center justify-center hover:bg-primary/5 transition-all cursor-pointer text-primary"
                aria-label="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>

              {/* LEFT COLUMN: Large Image and Zoom Control (col-span-7) */}
              <div className="md:col-span-7 flex flex-col justify-center relative group">
                <div
                  className={`relative overflow-hidden rounded-xl border border-primary/10 bg-primary/2 flex items-center justify-center transition-all ${
                    isZoomed ? "aspect-auto max-h-[75vh]" : "aspect-[4/5] max-h-[60vh]"
                  }`}
                >
                  <SafeImage
                    src={active.url}
                    alt={active.title}
                    className={`rounded-lg transition-all duration-300 ${
                      isZoomed
                        ? "w-full h-full object-contain cursor-zoom-out"
                        : "w-full h-full object-cover cursor-zoom-in"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />

                  {/* Zoom indicator triggers */}
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 text-primary border border-primary/10 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                    title={isZoomed ? "Normal view" : "Zoom view"}
                  >
                    {isZoomed ? (
                      <Minimize2 className="h-4.5 w-4.5" />
                    ) : (
                      <Maximize2 className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Permanent Marker details & "Same Project" strip (col-span-5) */}
              <div className="md:col-span-5 flex flex-col justify-between text-left space-y-6 pt-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/50 block">
                      Category · {active.category}
                    </span>
                    <h2 className="font-[family-name:var(--font-display)] text-primary text-3xl md:text-4xl mt-1 leading-tight">
                      {active.title}
                    </h2>
                  </div>

                  <div className="h-[2px] bg-primary/10 w-12" />

                  <p className="text-sm text-primary/80 leading-relaxed">{active.caption}</p>
                </div>

                {/* RELATED IMAGES FROM SAME PROJECT STRIP */}
                <div className="space-y-3.5 pt-4 border-t border-primary/10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/50 block">
                    Related from this Project ({active.category})
                  </span>

                  {relatedWorks.length === 0 ? (
                    <p className="text-xs text-primary/40 italic">
                      No other works in this project series.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {relatedWorks.map((rw) => (
                        <button
                          key={rw.id}
                          onClick={() => {
                            setActive(rw);
                            setIsZoomed(false);
                          }}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-primary/15 hover:border-primary cursor-pointer bg-primary/5 transition-all"
                        >
                          <SafeImage
                            src={rw.url}
                            alt={rw.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-primary/10 flex items-center justify-between">
                  <span className="text-[10px] text-primary/40 font-mono">ID: {active.id}</span>
                  <Link
                    to="/contact"
                    search={{
                      subject: `Inquiry for ${active.title} (${active.category})`,
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinterest Pin Lightbox */}
      <AnimatePresence>
        {activePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePin(null)}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md p-6 md:p-12 flex items-center justify-center cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-5xl w-full max-h-full grid md:grid-cols-[1fr_280px] gap-6 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePin.image}
                alt={activePin.title}
                className="w-full max-h-[80vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="text-primary-foreground">
                <div className="flex flex-col gap-3 text-left">
                  <a
                    href={activePin.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center cursor-pointer"
                  >
                    View Pin <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => setActivePin(null)}
                    className="px-5 py-2.5 border-2 border-primary-foreground rounded-full text-xs uppercase tracking-[0.2em] hover:bg-primary-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
