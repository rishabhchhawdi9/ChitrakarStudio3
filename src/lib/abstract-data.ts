export type AbstractArtProject = {
  id: string;
  title: string;
  series: string;
  medium: string;
  dimensions: string;
  year: string;
  description: string;
  projectId: string; // The linking identifier corresponding to the artwork collections
  photos: {
    url: string;
    caption: string;
    aspect?: string; // e.g. "aspect-[4/5]" or "aspect-[3/4]"
  }[];
};

export const ABSTRACT_ARTS: AbstractArtProject[] = [
  {
    id: "abs-1",
    title: "Symphony of Rust & Indigo",
    series: "Abstract Series I",
    medium: "Mixed Media, Heavy Gesso, Oxide Pigments & Acrylic on Cradled Wood Panel",
    dimensions: '60" x 48" (5ft x 4ft)',
    year: "2026",
    description:
      "A deep, layered tactile study of natural oxidation and fluid currents, exploring the dialogue between coarse earth tones and serene deep blues. Painted using textured plaster, iron oxide compounds, and watered-down acrylic washes to mimic organic weathering processes.",
    projectId: "p-abs-1",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
        caption:
          "Complete frontal view showcasing the tense contrast between rust textures and deep indigo flows.",
      },
      {
        url: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=800&q=80",
        caption:
          "Macro detail of the central heavily-plastered fissure, showing the physical depth of the gesso.",
      },
      {
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        caption: "Studio perspective under natural raking light, emphasizing the sculpted surface.",
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption:
          "Scale reference: installed in a minimalist living room setting with modern neutral decor.",
      },
    ],
  },
  {
    id: "abs-2",
    title: "Ethereal Echoes of Silent Arcs",
    series: "Abstract Series II",
    medium: "Acrylic, Marble Dust Plaster & Raw Pigment on Belgian Linen",
    dimensions: '72" x 54" (6ft x 4.5ft)',
    year: "2025",
    description:
      "Inspired by the transition of early morning light over architectural monoliths. This series features sweeping geometric curves and a muted, powdery pastel palette, conveying a sense of silent, slow-motion balance and ancient architectural weight.",
    projectId: "p-abs-2",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        caption:
          "Frontal presentation highlighting the elegant, overlapping archways and soft cream gradients.",
      },
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        caption: "Detail of the impasto texture where the marble dust plaster meets the raw linen.",
      },
      {
        url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80",
        caption:
          "Warm afternoon light hitting the canvas in the studio, highlighting the dry, mineral finish.",
      },
      {
        url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=800&q=80",
        caption:
          "Gallery installation preview, displaying its monumental presence against a dark gallery wall.",
      },
    ],
  },
  {
    id: "abs-3",
    title: "Fractured Horizons",
    series: "Abstract Series III",
    medium: "24k Gold Leaf, Liquid Graphite, Charcoal & Oil on Canvas",
    dimensions: '54" x 54" (4.5ft x 4.5ft)',
    year: "2026",
    description:
      "An architectural exploration of verticality, erosion, and structural lines. The juxtaposition of delicate gold leaf fragments with rough, smoky charcoal washes creates a shimmering, tactile landscape that shifts dynamically with the viewer's relative position and lighting.",
    projectId: "p-abs-3",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1579783928586-78d1af47d286?auto=format&fit=crop&w=1200&q=80",
        caption:
          "Main panel view illustrating the stark vertical divides and the reflective gold leaf veins.",
      },
      {
        url: "https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?auto=format&fit=crop&w=800&q=80",
        caption:
          "Detailed landscape view of the gold-leafing transition into heavy charcoal dust layers.",
      },
      {
        url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80",
        caption:
          "Angle view on the active easel showing the painterly edge treatment and graphite gloss.",
      },
      {
        url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80",
        caption:
          "Extreme close-up showing the metallic crinkling of the 24k gold leaf layered over carbon.",
      },
    ],
  },
  {
    id: "abs-4",
    title: "Primal Obsidian & Ochre",
    series: "Abstract Series IV",
    medium: "Ash, Siennas, Natural Ochres, Soot-Black Acrylic & Sand on Heavy Canvas",
    dimensions: '64" x 48" (5.3ft x 4ft)',
    year: "2025",
    description:
      "Drawing from prehistoric cave drawings and the ancient textures of raw stone. Broad soot-black gestures and coarse volcanic sand overlay vibrant iron-oxide ochre pigments, invoking a primal, ritualistic sense of human mark-making and deep time.",
    projectId: "p-abs-4",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
        caption:
          "Complete composition showing the energetic obsidian strokes slicing across the warm, raw earth background.",
      },
      {
        url: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=800&q=80",
        caption:
          "Close-up of the energetic charcoal sweep, revealing the underlying granular sand texture.",
      },
      {
        url: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=800&q=80",
        caption:
          "Detail showing transparent glaze layers of raw sienna built up over the dark, dense gestures.",
      },
      {
        url: "https://images.unsplash.com/photo-1525909002-1b05c04071db?auto=format&fit=crop&w=800&q=80",
        caption:
          "Framing view highlighting the raw, painted gallery-wrap edges of the museum-grade canvas.",
      },
    ],
  },
  {
    id: "abs-5",
    title: "Monolithic Echoes",
    series: "Abstract Series V",
    medium: "Minimalist Gesso relief & Carbon Pigments on Custom Linen Board",
    dimensions: '80" x 40" (6.6ft x 3.3ft)',
    year: "2026",
    description:
      "A monumentally scaled quiet meditation on negative space, vertical mass, and heavy physical balance. Features a massive, sculptural monochrome block contrasted against the warm, organic weave of unprimed raw linen.",
    projectId: "p-abs-5",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
        caption:
          "Main front view highlighting the imposing, tall monolith and its subtle texture gradient.",
      },
      {
        url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80",
        caption:
          "Texture closeup of the hand-troweled sculptural ridges that run the length of the dark block.",
      },
      {
        url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        caption:
          "Studio photo capturing the depth of the relief shadow cast under soft side-window illumination.",
      },
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        caption:
          "Installed context showcasing the monolithic scale against a tall ceiling in a contemporary boardroom.",
      },
    ],
  },
];
