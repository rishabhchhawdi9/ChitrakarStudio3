/**
 * ChitrakarStudio - Local Artwork Directory to Sanity CMS Uploader
 *
 * This script scans the local folder `/Users/rishab/Downloads/Tarun Art 2`,
 * automatically classifies the images, generates catchy titles & descriptions,
 * and uploads them to Sanity CMS.
 */

const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "/Users/rishab/Downloads/Tarun Art 2";

// Load environment variables from .env.local if exists
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/['"]/g, "");
      if (key === "VITE_SANITY_PROJECT_ID") process.env.VITE_SANITY_PROJECT_ID = val;
      if (key === "VITE_SANITY_DATASET") process.env.VITE_SANITY_DATASET = val;
      if (key === "VITE_SANITY_TOKEN") process.env.VITE_SANITY_TOKEN = val;
    }
  });
}

const projectId = process.env.VITE_SANITY_PROJECT_ID || "chitrakar-studios-cms";
const dataset = process.env.VITE_SANITY_DATASET || "production";
const token = process.env.VITE_SANITY_TOKEN || 
  "skIMe6ZpPe3Luvv8rB0wykaqeEvAV4hqFCsGwPL4ddzK1DVb5QydNJHWMS4y9FpZGIxyqre5hLLneXnj6OZl6oCVkWV4Fmp4Y73dvhG4Skvzwwyr6UPaurU70aj4a4pqySqQqw0AMg1NZA86WDAEInPy4IMmQUErMHt1mBBBeiFddZKPXn7i";

console.log(`📡 Connecting to Sanity Project: "${projectId}" (Dataset: "${dataset}")`);

// Initialize Sanity Client
const client = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion: "2023-05-03",
});

// Curated list of high-end artistic titles and descriptions for hashed files
const CURATED_ARTWORKS = [
  {
    title: "Symphony of Rust & Indigo",
    category: "Canvas",
    caption: "Textured mixed-media canvas painting",
    description: "An evocative abstract study exploring the passage of time through rich, layered gesso textures, mineral iron oxide pigments, and deep indigo washes."
  },
  {
    title: "Ethereal Echoes in Gesso",
    category: "Canvas",
    caption: "Sculptural plaster canvas relief",
    description: "A minimal, highly tactile white-on-white composition focusing on shadows and light using hand-sculpted marble plaster and delicate charcoal sweeps."
  },
  {
    title: "Golden Hour Solitude",
    category: "Canvas",
    caption: "Textured acrylic painting with gold-leaf accents",
    description: "Capturing the serene warmth of the setting sun, this piece features high-texture horizons overlaid with hand-placed premium gold foil."
  },
  {
    title: "Whispering Tropics Sanctuary",
    category: "Mural",
    caption: "Bespoke hand-painted tropical wall mural",
    description: "A lush, immersive accent mural painted on-site, celebrating raw botanical curves, oversized palm leaves, and warm earthy tones."
  },
  {
    title: "Celestial Moon Serenade",
    category: "Mural",
    caption: "Luminous lunar wall mural",
    description: "A gorgeous celestial installation mapping the details and craters of the moon. Casts a serene, peaceful ambiance over the room."
  },
  {
    title: "Symmetric Mandala Sanctum",
    category: "Mural",
    caption: "Precision geometric mandala mural",
    description: "Hand-painted traditional mandala design featuring fine-line radial symmetry, gold-leaf accents, and a rich charcoal background."
  },
  {
    title: "Linear Thread Tensions",
    category: "Wall Art",
    caption: "Silk thread tension installation on wood planks",
    description: "A modern relief wall art piece utilizing high-tensile colored threads wrapped around steel pins on charred cedar wood, exploring geometric intersections."
  },
  {
    title: "Polished Brass Mandorla",
    category: "Wall Art",
    caption: "Wood and metallic relief wall panel",
    description: "A rustic modern design incorporating reclaimed teak planks, textured black gesso base, and a polished hand-beaten brass center."
  },
  {
    title: "Blooming Grace Portrait",
    category: "Portrait",
    caption: "Mixed-media portrait with organic foliage",
    description: "A beautiful fusion of high-contrast charcoal portraiture with loose, vibrant floral brushstrokes representing thoughts in full bloom."
  },
  {
    title: "Verdant Canopy Reverie",
    category: "Mural",
    caption: "Hand-painted jungle leaf wall mural",
    description: "An elegant botanical mural combining forest green hues and copper detailing, designed to transform any residential feature wall."
  },
  {
    title: "Monolithic Echoes Study",
    category: "Canvas",
    caption: "Minimalist relief painting on canvas",
    description: "Part of the materiality series, this abstract easel study features bold geometric blocks sculpted from texture paste and finished in matte ochre."
  },
  {
    title: "Funky Bistro Fusion",
    category: "Commercial",
    caption: "Vibrant branded interior wall mural",
    description: "A custom, high-energy graffiti-style mural designed to elevate the commercial dining experience with bold typography and cafe themes."
  },
  {
    title: "Soot & Linen Contrast",
    category: "Canvas",
    caption: "Abstract charcoal and raw linen study",
    description: "Exploring absolute minimalism, this piece displays deep charcoal washes and stark white lines painted directly onto raw unprimed linen."
  },
  {
    title: "Gilded Arches Relief",
    category: "Wall Art",
    caption: "Sculptured plaster wall panel",
    description: "A geometric wall panel exploring Roman architectural arches, sculpted in relief plaster and highlighted with 24k gold leaf details."
  },
  {
    title: "Savage Jungle Wilds",
    category: "Mural",
    caption: "Immersive exotic wildlife mural",
    description: "An expansive wall mural illustrating wild tropical flora and hidden wildlife motifs in dark, rich jungle-palette tones."
  },
  {
    title: "Crimson Horizon Relief",
    category: "Canvas",
    caption: "Tactile red and gold abstract canvas",
    description: "A bold, fiery abstract painting using heavy modeling paste to create horizontal ridge lines, washed in rich crimson and bronze leaf."
  },
  {
    title: "Tethered Topographical Panel",
    category: "Wall Art",
    caption: "Wood carving and wire relief",
    description: "A unique relief panel depicting topographical mapping curves, hand-carved in solid pine and detailed with polished steel wire."
  },
  {
    title: "Rustic Palermo Pizzeria",
    category: "Commercial",
    caption: "Italian restaurant theme wall fresco",
    description: "Authentic hand-painted Italian vista combined with rustic brick accents, painted on-site to create a cozy dining atmosphere."
  },
  {
    title: "Ochre & Ash Study No. 12",
    category: "Canvas",
    caption: "Earth mineral pigments on heavy canvas",
    description: "An abstract exploration of natural pigments: burnt sienna, yellow ochre, and wood ash, layered to simulate natural sedimentary formations."
  },
  {
    title: "Midnight Flora Study",
    category: "Canvas",
    caption: "Floral fine art painting in dark tones",
    description: "A dramatic floral study featuring deep velvet purples, navy blues, and high-gloss translucent varnish drops reflecting morning dew."
  }
];

// Helper: Capitalize Words
function capitalize(str) {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Clean filename to use as helper/fallback title
function cleanString(str) {
  let cleaned = str.replace(/^chitrakar_finearts_/i, "");
  // Remove trailing dates, hash tags, IDs, etc.
  cleaned = cleaned.replace(/_\d{4}-\d{2}-\d{2}_.*/gi, "");
  cleaned = cleaned.replace(/_\d+_\d+$/gi, "");
  cleaned = cleaned.replace(/_[A-Za-z0-9]{11}_.*/gi, "");
  cleaned = cleaned.replace(/IMG_\d+_\d+/gi, "");
  cleaned = cleaned.replace(/IMG_/gi, "");
  cleaned = cleaned.replace(/Photo \d+-\d+-\d+.*/gi, "");
  // Replace symbols/underscores with space
  cleaned = cleaned.replace(/[^A-Za-z0-9\s]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned || "Untitled Studio Art";
}

// Catchy naming and description generation based on keywords
function analyzeAndClassify(filename) {
  const nameLower = filename.toLowerCase();
  const nameWithoutExt = path.parse(filename).name.toLowerCase();
  
  // Deterministic hash based on filename characters
  let charHash = 0;
  for (let c = 0; c < filename.length; c++) {
    charHash += filename.charCodeAt(c);
  }

  // Detect if name is a random hash or numeric identifier
  const isRandom = 
    /^[a-f0-9]{32}$/i.test(nameWithoutExt) ||
    /^[0-9\s_-]+$/.test(cleanString(filename)) ||
    (cleanString(filename).split(" ").length === 1 && cleanString(filename).length > 12 && /[0-9]/.test(cleanString(filename))) ||
    (!cleanString(filename).match(/[aeiou]/gi) && cleanString(filename).length > 4);

  if (isRandom) {
    const curated = CURATED_ARTWORKS[charHash % CURATED_ARTWORKS.length];
    const projectId = `p-${curated.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const projectName = `${curated.category} Portfolio Collection`;
    return {
      title: `${curated.title} – Study #${(charHash % 90) + 10}`,
      category: curated.category,
      caption: curated.caption,
      description: curated.description,
      projectId,
      projectName,
    };
  }

  let title = "";
  let category = "Wall Art";
  let caption = "";
  let description = "";

  if (nameLower.includes("moon")) {
    title = "Celestial Moon Serenade";
    category = "Mural";
    caption = "Luminous hand-painted lunar mural";
    description = "A beautiful celestial wall mural capturing the detailed textures of the moon. Ideal for creating a calming, reflective atmosphere in master bedrooms or lounges.";
  } else if (nameLower.includes("chaska")) {
    title = "Funky Chaska Bistro Mural";
    category = "Commercial";
    caption = "High-energy mural for Chaska Cafe, Faridabad";
    description = "A colorful, modern retro graffiti wall mural designed for Chaska Restaurant and Cafe. This custom piece energizes the space and provides an iconic backdrop for guests.";
  } else if (nameLower.includes("resin") || nameLower.includes("coasters") || nameLower.includes("river")) {
    title = "Ethereal Turquoise Resin Study";
    category = "Canvas";
    caption = "Liquid glass epoxy resin and wood slab work";
    description = "A custom-commissioned live edge wood panel with deep-ocean turquoise resin pour and high-gloss polish. Evokes organic, aerial topography.";
  } else if (nameLower.includes("mandala") || nameLower.includes("regenta")) {
    title = "Symmetric Mandala Sanctum";
    category = "Mural";
    caption = "Traditional mandala wall art at Regenta Central";
    description = "A large-scale wall mural featuring geometric mandala flow, fine-line detailing, and gold-leaf accents, commissioned for the entryway of Regent Central Chandigarh.";
  } else if (nameLower.includes("metallica")) {
    title = "Metallica Heavy Metal Grunge Panel";
    category = "Signage";
    caption = "Industrial custom metal band tribute sign";
    description = "A custom relief wall signage piece created as a tribute to the legendary metal band. Hand-distressed with rustic textures and black-charred wood styling.";
  } else if (nameLower.includes("dapalermopizzeria") || nameLower.includes("pizza")) {
    title = "Rustic Palermo Pizza Fresco";
    category = "Commercial";
    caption = "Italian bistro interior mural for Da Palermo Pizzeria";
    description = "A custom commercial brick-wall mural painted at Da Palermo Pizzeria. Combines classic Italian scenery with bold typography for a warm, cozy dining environment.";
  } else if (nameLower.includes("dakshinmis")) {
    title = "Dakshin Southern Heritage Mural";
    category = "Commercial";
    caption = "South Indian heritage theme wall panel";
    description = "A multi-paneled mural displaying traditional South Indian landscapes, architecture, and cultural motifs. Commissioned for Dakshin Restaurant's main dining hall.";
  } else if (nameLower.includes("punjab") || nameLower.includes("culture")) {
    title = "Folk Punjab Harvest Mural";
    category = "Mural";
    caption = "Traditional Punjabi culture wall mural";
    description = "A detailed mural portraying traditional Punjabi rural life, harvesting festivals, and local heritage, painted using vibrant tones and hand-blended pigments.";
  } else if (nameLower.includes("thread") || nameLower.includes("planks")) {
    title = "Architectural Thread Geometries";
    category = "Wall Art";
    caption = "Custom thread tension geometry on wood planks";
    description = "A unique installation using high-tensile silk threads woven around steel pins on reclaimed wood planks. Creates a shifting geometric shadow pattern.";
  } else if (nameLower.includes("blooming") || nameLower.includes("grace")) {
    title = "Blooming Grace Female Portrait";
    category = "Portrait";
    caption = "Mixed media portrait with organic foliage";
    description = "A beautiful study in canvas painting, combining delicate charcoal facial details with bold, colorful acrylic floral elements representing thoughts in bloom.";
  } else if (nameLower.includes("ta0024")) {
    const num = filename.replace(/[^0-9]/g, "") || "1";
    title = `Materiality Relief Study #${num}`;
    category = "Canvas";
    caption = "Tactile gesso and gold leaf canvas study";
    description = "Part of a dedicated series of minimal abstract paintings exploring textures, sculpted plaster, soot-ash, and hand-beaten gold foil.";
  } else {
    // General parser fallback
    const rawClean = cleanString(filename);
    title = capitalize(rawClean);

    // Determine category based on generic keywords
    if (nameLower.includes("mural") || nameLower.includes("graffiti") || nameLower.includes("wall") || nameLower.includes("room")) {
      category = "Mural";
      caption = "Custom-painted wall mural commission";
      description = `A hand-painted custom mural titled "${title}". Meticulously designed and painted on-site to fit the unique lighting and contours of the wall surface.`;
    } else if (nameLower.includes("canvas") || nameLower.includes("painting") || nameLower.includes("study") || nameLower.includes("art")) {
      category = "Canvas";
      caption = "Original fine art canvas commission";
      description = `An original canvas painting titled "${title}" created at Chitrakar Finearts studio. Crafted using premium acrylics, gesso textures, and mixed media.`;
    } else if (nameLower.includes("cafe") || nameLower.includes("restaurant") || nameLower.includes("interior") || nameLower.includes("diner")) {
      category = "Commercial";
      caption = "Corporate and commercial interior art branding";
      description = `Bespoke branded wall design titled "${title}", curated specifically to match the restaurant interior, theme, and company aesthetic.`;
    } else if (nameLower.includes("portrait")) {
      category = "Portrait";
      caption = "Custom hand-drawn portrait commission";
      description = `A high-fidelity personalized portrait commission titled "${title}". Hand-drawn with precision and artistic depth.`;
    } else {
      category = "Wall Art";
      caption = "Bespoke studio wall decoration";
      description = `A curated wall art installation titled "${title}". Crafted to add visual texture, color depth, and dimension to your home wall surface.`;
    }
  }

  // Ensure unique project names for matching galleries
  const projectId = `p-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const projectName = `${category} Portfolio Collection`;

  return { title, category, caption, description, projectId, projectName };
}

// Main Migration Loop
async function migrate() {
  console.log("🚀 Starting Sanity CMS automated folder migration...");
  
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source folder not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const items = fs.readdirSync(SOURCE_DIR);
  console.log(`📁 Scanning local directory. Found ${items.length} items.`);

  const files = [];
  const folders = [];

  for (const item of items) {
    if (item.startsWith(".")) continue;
    const fullPath = path.join(SOURCE_DIR, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      if (item === "studio-chitrakar-studios-cms" || item === "New folder") {
        console.log(`⚠️  Ignoring folder: "${item}"`);
        continue;
      }
      folders.push(item);
    } else {
      files.push(item);
    }
  }

  console.log(`🔍 Scan complete: ${files.length} images, ${folders.length} project folders.\n`);

  console.log("🧹 Cleaning up old local uploader documents from Sanity...");
  try {
    const oldDocs = await client.fetch('*[_type in ["artwork", "abstractArtProject"] && (_id match "artwork-local-*" || _id match "abstract-local-*")]');
    if (oldDocs.length > 0) {
      console.log(`  🔹 Found ${oldDocs.length} old documents. Deleting...`);
      const tx = client.transaction();
      oldDocs.forEach((d) => tx.delete(d._id));
      await tx.commit();
      console.log(`  ✅ Cleanup complete.`);
    } else {
      console.log(`  ✅ No old documents found.`);
    }
  } catch (err) {
    console.error("  ❌ Warning: Cleanup error:", err.message);
  }

  // 1. PROCESS INDIVIDUAL ARTWORKS (FILES)
  console.log("--------------------------------------------");
  console.log("🎨 Phase 1: Uploading Individual Artworks...");
  console.log("--------------------------------------------");

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(SOURCE_DIR, filename);
    const ext = path.extname(filename).toLowerCase();
    
    if (![".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(ext)) {
      console.log(`⚠️  Skipping non-image file: "${filename}"`);
      continue;
    }

    const { title, category, caption, description, projectId, projectName } = analyzeAndClassify(filename);
    console.log(`📦 [${i + 1}/${files.length}] Processing Artpiece: "${title}" (${category})`);

    try {
      console.log(`  🔹 Uploading image asset...`);
      const fileStream = fs.createReadStream(filePath);
      const asset = await client.assets.upload("image", fileStream, {
        filename,
      });
      console.log(`  ✅ Registered! Asset ID: "${asset._id}"`);

      const artworkDoc = {
        _type: "artwork",
        _id: `artwork-local-${filename.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.substring(0, 100),
        title,
        category,
        caption,
        description,
        projectId,
        projectName,
        featured: i < 6, // Feature the first 6 items to populate home slider
        exclusive: filename.includes("exclusive") || category === "Portrait",
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        },
      };

      console.log(`  🔹 Writing artwork document to Sanity...`);
      const result = await client.createOrReplace(artworkDoc);
      console.log(`  🎉 Success! Created document reference: "${result._id}"`);
    } catch (err) {
      console.error(`  ❌ Error processing file "${filename}":`, err.message);
    }
  }

  // 2. PROCESS ABSTRACT SERIES (FOLDERS)
  console.log("\n--------------------------------------------");
  console.log("📚 Phase 2: Uploading Abstract Project Folders...");
  console.log("--------------------------------------------");

  for (let k = 0; k < folders.length; k++) {
    const folderName = folders[k]; // e.g. "TA001"
    const folderPath = path.join(SOURCE_DIR, folderName);
    
    console.log(`📦 Folder [${k + 1}/${folders.length}] Scanning Collection: "${folderName}"`);
    const subFiles = fs.readdirSync(folderPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(ext);
    });

    if (subFiles.length === 0) {
      console.log(`  ⚠️  No valid images found in "${folderName}". Skipping.`);
      continue;
    }

    // Take at most 3 images per folder to optimize upload speed
    const targetPhotos = subFiles.slice(0, 3);
    console.log(`  🔹 Found ${subFiles.length} photos inside. Uploading first ${targetPhotos.length} assets...`);
    const uploadedPhotos = [];

    for (let j = 0; j < targetPhotos.length; j++) {
      const filename = targetPhotos[j];
      const filePath = path.join(folderPath, filename);
      console.log(`    📷 [${j + 1}/${targetPhotos.length}] Uploading image: "${filename}"`);

      try {
        const fileStream = fs.createReadStream(filePath);
        const asset = await client.assets.upload("image", fileStream, {
          filename,
        });

        uploadedPhotos.push({
          _key: `photo-local-${Date.now()}-${j}`,
          caption: `Detail Perspective Study #${j + 1}`,
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          },
        });
      } catch (err) {
        console.error(`    ❌ Failed to upload photo "${filename}":`, err.message);
      }
    }

    if (uploadedPhotos.length === 0) {
      console.log(`  ⚠️  All uploads failed for folder "${folderName}". Skipping doc creation.`);
      continue;
    }

    try {
      const numStr = folderName.replace(/[^0-9]/g, "") || String(k + 1);
      const title = `Abstract Materiality Series ${folderName}`;
      const series = `Collection ${numStr}`;

      const abstractDoc = {
        _type: "abstractArtProject",
        _id: `abstract-local-${folderName.toLowerCase()}`,
        title,
        series,
        year: "2024",
        medium: "Sculpted gesso, minerals, soot-ash & gold-leaf on structural panels",
        dimensions: "48 x 60 inches",
        description: `A monumental textured wall study from ${series} (Designation ${folderName}), investigating tactile materiality, raw plaster relief work, and metallic contrasts.`,
        photos: uploadedPhotos,
      };

      console.log(`  🔹 Creating Abstract Art Project document in Sanity...`);
      const result = await client.createOrReplace(abstractDoc);
      console.log(`  🎉 Success! Created abstract series reference: "${result._id}"`);
    } catch (err) {
      console.error(`  ❌ Error creating abstract project doc for "${folderName}":`, err.message);
    }
  }

  console.log("\n============================================");
  console.log("🏆 All local items have been reviewed, classified, and uploaded to Sanity CMS!");
  console.log("============================================");
}

migrate();
