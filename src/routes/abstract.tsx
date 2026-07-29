import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type AbstractArtProject } from "../lib/abstract-data";
import { STUDIO as staticStudio } from "../lib/studio";
import { useAbstracts, useStudio } from "../lib/store";
import { SafeImage } from "../components/SafeImage";
import {
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";

export const Route = createFileRoute("/abstract")({
  head: () => ({
    meta: [
      { title: `Abstract Collection — ${staticStudio.name}` },
      {
        name: "description",
        content: `Explore the tactile, large-format abstract canvases of ${staticStudio.artist}. Sculpted gesso, natural pigments, and minimal styling.`,
      },
      { property: "og:title", content: `Abstract Collection — ${staticStudio.name}` },
      {
        property: "og:description",
        content: `Tactile, textured abstract collections by ${staticStudio.artist}.`,
      },
      { property: "og:url", content: "/abstract" },
    ],
    links: [{ rel: "canonical", href: "/abstract" }],
  }),
  component: AbstractPage,
});

function AbstractPage() {
  const ABSTRACT_ARTS = useAbstracts();
  const STUDIO = useStudio();

  // Track active project being explored in the immersive detail modal (for multi-angle studies)
  const [activeProject, setActiveProject] = useState<AbstractArtProject | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Keep track of which project's description is revealed in the alternating view
  const [revealedProjects, setRevealedProjects] = useState<Record<string, boolean>>({});

  const toggleNarrative = (id: string) => {
    setRevealedProjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Reset photo index when switching active projects
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [activeProject]);

  // Keyboard navigation for active project detail slider
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProject(null);
      } else if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => (prev + 1) % activeProject.photos.length);
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex(
          (prev) => (prev - 1 + activeProject.photos.length) % activeProject.photos.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProject]);

  if (ABSTRACT_ARTS.length === 0) {
    return (
      <div className="bg-background text-primary min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl mb-4">
          No Abstract Projects
        </h1>
        <p className="max-w-md opacity-80 mb-6">
          Create abstract paintings inside the Admin Dashboard to begin.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-wider font-medium"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen selection:bg-neutral-800 selection:text-white">
      {/* 1. MINIMAL HERO HEADER */}
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-20 border-b border-primary/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-primary/2 opacity-30 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl text-left">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/45 mb-4 font-semibold font-mono">
            Tactile Materiality &amp; Raw Form
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-8xl -rotate-1 leading-none tracking-tight">
            Abstract Space
          </h1>
          <p className="mt-6 max-w-2xl text-sm md:text-base text-primary/70 leading-relaxed font-sans">
            A permanent long-form gallery displaying <strong>{STUDIO.artist}'s</strong> tactile
            abstract collections. These monumental canvases feature sculpted gesso, natural
            pigments, soot-ash, and hand-beaten gold leaf—entirely celebrating pure visual texture.
          </p>
        </div>
      </section>

      {/* 2. FULL-VIEWPORT ALTERNATING GRID CATALOG */}
      <section className="divide-y divide-primary/10">
        {ABSTRACT_ARTS.map((project, index) => {
          const primaryPhoto = project.photos[0] || { url: "" };
          const isRevealed = !!revealedProjects[project.id];

          return (
            <div
              key={project.id}
              className="flex flex-col md:flex-row min-h-[85vh] md:even:flex-row-reverse items-stretch"
            >
              {/* Massive Hero Artwork Image Frame */}
              <div className="w-full md:w-[60%] relative group bg-neutral-950 overflow-hidden min-h-[45vh] md:min-h-auto">
                <SafeImage
                  src={primaryPhoto.url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
                />

                {/* Micro numbering & Series Badge */}
                <div className="absolute top-6 left-6 bg-background/90 border border-primary/10 text-[9px] font-mono tracking-widest px-3 py-1 rounded-full text-primary uppercase z-10 backdrop-blur-sm shadow-sm">
                  COLLECTION {index + 1} // {project.series}
                </div>

                {/* Overlap visual indicator on hover */}
                <div
                  onClick={() => setActiveProject(project)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-zoom-in z-20"
                >
                  <span className="px-5 py-2.5 bg-background text-primary rounded-full text-[10px] font-mono uppercase tracking-[0.2em] font-bold shadow-md hover:scale-105 transition-transform">
                    Explore Surface Angles
                  </span>
                </div>
              </div>

              {/* Minimal Typographic Editorial Panel */}
              <div className="w-full md:w-[40%] bg-background p-8 sm:p-12 md:p-16 flex flex-col justify-between text-left space-y-8">
                <div className="space-y-6">
                  {/* Subtle Context metadata */}
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-primary/40 uppercase">
                    <span>Year: {project.year}</span>
                    <span>•</span>
                    <span>No. 0{index + 1}</span>
                  </div>

                  {/* Title & Medium Description */}
                  <div className="space-y-3">
                    <h2 className="font-[family-name:var(--font-display)] text-primary text-3xl sm:text-4xl tracking-tight leading-none">
                      {project.title}
                    </h2>
                    <p className="text-xs uppercase tracking-wider text-primary/60 font-mono">
                      {project.medium}
                    </p>
                    <p className="text-[11px] font-mono text-primary/40">
                      Dimensions: {project.dimensions}
                    </p>
                  </div>

                  {/* Material Narrative Toggle Indicator */}
                  <div className="pt-4 border-t border-primary/15">
                    <button
                      onClick={() => toggleNarrative(project.id)}
                      className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors cursor-pointer"
                    >
                      {isRevealed ? (
                        <>
                          <Minus className="h-3 w-3" />
                          <span>Hide Material Story</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span>Read Material Story</span>
                        </>
                      )}
                    </button>

                    {/* Collapsible Story Narrative */}
                    <AnimatePresence initial={false}>
                      {isRevealed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs md:text-sm text-primary/80 leading-relaxed mt-4 bg-primary/2 p-4 rounded-xl border border-primary/5 font-sans">
                            {project.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Call to action & Multi-angle visual launcher */}
                <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setActiveProject(project)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer border border-primary/10"
                  >
                    <span>View Angles</span>
                  </button>
                  <Link
                    to="/contact"
                    search={{
                      subject: `Inquiry regarding Abstract: ${project.title} (${project.series})`,
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-[0.15em] rounded-xl hover:opacity-90 transition-opacity text-center cursor-pointer"
                  >
                    <span>Purchase</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. FULLSCREEN IMMERSIVE MULTI-ANGLE EXPLORATION DIALOG */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-zoom-out overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-background text-primary max-w-6xl w-full rounded-2xl border-2 border-primary/20 p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] relative grid grid-cols-1 lg:grid-cols-12 gap-8 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full border border-primary/10 hover:border-primary flex items-center justify-center hover:bg-primary/5 transition-colors cursor-pointer text-primary z-50"
                aria-label="Close Detailed View"
              >
                <X className="h-5 w-5" />
              </button>

              {/* LEFT COLUMN: Large Active Photo & Thumbnail Strips (col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-4 text-left">
                {/* Active Photo Frame */}
                <div className="relative border border-primary/10 rounded-xl p-2 bg-background shadow-md">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center max-h-[55vh]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activePhotoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        src={activeProject.photos[activePhotoIndex]?.url}
                        alt={`${activeProject.title} detail angle`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>

                    {/* Navigation buttons inside photo frame */}
                    {activeProject.photos.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActivePhotoIndex(
                              (prev) =>
                                (prev - 1 + activeProject.photos.length) %
                                activeProject.photos.length,
                            )
                          }
                          className="absolute left-3 h-8 w-8 rounded-full bg-background/80 hover:bg-background border border-primary/10 flex items-center justify-center text-primary cursor-pointer transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setActivePhotoIndex((prev) => (prev + 1) % activeProject.photos.length)
                          }
                          className="absolute right-3 h-8 w-8 rounded-full bg-background/80 hover:bg-background border border-primary/10 flex items-center justify-center text-primary cursor-pointer transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Multiple Perspective Angle Thumbnail Selectors */}
                {activeProject.photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 px-1">
                    {activeProject.photos.map((photo, pIdx) => {
                      const isActive = activePhotoIndex === pIdx;
                      return (
                        <button
                          key={pIdx}
                          onClick={() => setActivePhotoIndex(pIdx)}
                          className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            isActive
                              ? "border-primary ring-2 ring-primary/5 shadow-md"
                              : "border-primary/10 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt="Angle detail thumbnail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-1 right-1 bg-background/95 border border-primary/10 text-[8px] font-mono px-1 rounded-sm">
                            Angle 0{pIdx + 1}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Rich Narrative & Inquiry triggers (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/45 block">
                      {activeProject.series} · Completed {activeProject.year}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-primary text-3xl md:text-4xl tracking-tight leading-none mt-1">
                      {activeProject.title}
                    </h3>

                    <p className="text-xs uppercase tracking-[0.15em] text-primary/70 font-semibold border-b border-primary/10 pb-3 pt-2">
                      {activeProject.medium}
                    </p>
                    <p className="text-xs text-primary/50 mt-1 font-semibold">
                      Dimensions: {activeProject.dimensions}
                    </p>
                  </div>

                  {/* Surface description / Material narrative */}
                  <div className="space-y-3.5 pt-2">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-primary/60 font-semibold">
                      Surface Material Narrative:
                    </h4>
                    <p className="text-sm leading-relaxed text-primary/85 whitespace-pre-line bg-primary/2 p-3.5 rounded-xl border border-primary/5">
                      {activeProject.description}
                    </p>

                    {activeProject.photos[activePhotoIndex]?.caption && (
                      <p className="text-xs italic text-primary/60 border-l-2 border-primary/20 pl-3">
                        Currently viewing: {activeProject.photos[activePhotoIndex].caption}
                      </p>
                    )}
                  </div>
                </div>

                {/* Studio dispatch triggers and Inquiry buttons */}
                <div className="pt-4 border-t border-primary/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 text-[10px] font-mono text-primary/60">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                      <span>Worldwide dispatch</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                      <span>Custom wooden crating</span>
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    search={{
                      subject: `Inquiry regarding Abstract: ${activeProject.title} (${activeProject.series})`,
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md text-center"
                  >
                    <span>Request Studio Purchase</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
