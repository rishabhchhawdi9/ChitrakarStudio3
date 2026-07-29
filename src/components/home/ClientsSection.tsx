import { motion } from "framer-motion";
import { useClients } from "../../lib/store";

export function ClientsSection() {
  const clients = useClients();
  const publishedClients = clients.filter((c) => c.published);

  if (publishedClients.length === 0) return null;

  return (
    <section className="px-6 py-20 bg-background overflow-hidden relative">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-3 font-semibold">
            Collaborative Spaces
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-primary text-5xl md:text-7xl -rotate-1 leading-none">
            Trusted By
          </h2>
          <p className="mt-4 text-base text-primary/70 max-w-xl mx-auto leading-relaxed">
            From boutique cafés to premium private residences, we collaborate to breathe life into
            physical walls.
          </p>
        </div>

        {/* Clients Grid */}
        <div className="flex overflow-x-auto gap-6 md:grid md:grid-cols-3 lg:grid-cols-4 pb-6 md:pb-0 scrollbar-none snap-x snap-mandatory">
          {publishedClients.map((c, i) => {
            // Slight alternating rotations to mimic studio paper mounts
            const rotates = ["-1deg", "1deg", "-1.5deg", "0.5deg"];
            const rotation = rotates[i % rotates.length];

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="flex-none w-[75vw] sm:w-[45vw] md:w-auto snap-center relative pt-4"
                style={{ transform: `rotate(${rotation})` }}
              >
                {/* Tape corner */}
                <div className="tape left-4 -top-3 z-10 rotate-[-8deg] opacity-80" />

                <div className="group rounded-xl border-2 border-primary/15 bg-card p-3 shadow-md hover:shadow-xl hover:rotate-0 transition-all duration-300">
                  {/* Project image display */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-primary/5">
                    <img
                      src={c.projectImageUrl}
                      alt={`${c.name} Project`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Brand & Name details below */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border border-primary/10 overflow-hidden bg-background flex items-center justify-center shrink-0">
                      <img
                        src={c.logoUrl}
                        alt={`${c.name} Logo`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-display)] text-primary text-sm truncate">
                        {c.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-primary/50">
                        Corporate Partner
                      </p>
                    </div>
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
