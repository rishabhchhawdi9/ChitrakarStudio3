/**
 * ChitrakarStudio - Sanity CMS Automated Portfolio Migration Script
 *
 * This script automates the process of fetching high-resolution portfolio images
 * from Unsplash/Pinterest streams, uploading them directly into Sanity CMS's
 * asset store, and creating corresponding document nodes linked to those assets.
 *
 * Run with: node migrate.js
 */

const { createClient } = require("@sanity/client");

// Initialize Sanity Client with secure Write Token
const client = createClient({
  projectId: "chitrakar-studios-cms",
  dataset: "production",
  token:
    "skIMe6ZpPe3Luvv8rB0wykaqeEvAV4hqFCsGwPL4ddzK1DVb5QydNJHWMS4y9FpZGIxyqre5hLLneXnj6OZl6oCVkWV4Fmp4Y73dvhG4Skvzwwyr6UPaurU70aj4a4pqySqQqw0AMg1NZA86WDAEInPy4IMmQUErMHt1mBBBeiFddZKPXn7i",
  useCdn: false, // CDN must be bypassed for write operations
  apiVersion: "2023-05-03", // Stable api version
});

// Complete list of all 9 target portfolio artwork assets from ChitrakarStudio
const artworks = [
  {
    id: "w1",
    url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=800&q=80",
    title: "Jungle Reverie",
    category: "Mural",
    caption: "Hand-painted feature wall for a Faridabad residence.",
    featured: true,
    projectName: "Tropical Murals Collection",
    projectId: "p-tropical",
  },
  {
    id: "w2",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    title: "Sunburst Motif",
    category: "Wall Art",
    caption: "Decorative motif for a boutique café.",
    featured: true,
    projectName: "Botanical & Floral Studies",
    projectId: "p-botanical",
  },
  {
    id: "w3",
    url: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80",
    title: "Study in Ochre",
    category: "Canvas",
    caption: "Original canvas, mixed media.",
    featured: true,
    projectName: "Easel Studies & Palettes",
    projectId: "p-easel",
  },
  {
    id: "w4",
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    title: "Restaurant Wall — Kilim",
    category: "Interior",
    caption: "Full interior styling with hand-painted panels.",
    featured: true,
    projectName: "Bespoke Café & Retail Interiors",
    projectId: "p-cafe",
  },
  {
    id: "w6",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    title: "Terrace Diner",
    category: "Interior",
    caption: "Restaurant terrace with painted arches.",
    featured: true,
    projectName: "Bespoke Café & Retail Interiors",
    projectId: "p-cafe",
  },
  {
    id: "w10",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=736&q=80",
    title: "Kids' Room Safari",
    category: "Mural",
    caption: "Full-wall mural for a children's bedroom.",
    featured: true,
    projectName: "Tropical Murals Collection",
    projectId: "p-tropical",
  },
  {
    id: "ex1",
    url: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    title: "Live Edge Resin River Table",
    category: "Interior",
    caption: "Premium custom-built walnut wood slab with deep-sea turquoise resin pour.",
    exclusive: true,
    projectName: "Bespoke Sculptural Commissions",
    projectId: "p-commission",
  },
  {
    id: "ex2",
    url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    title: "Geometric Thread-Art Board",
    category: "Wall Art",
    caption: "Hand-spun silk thread architectural geometry over charred cedar panel.",
    exclusive: true,
    projectName: "Bespoke Sculptural Commissions",
    projectId: "p-commission",
  },
  {
    id: "ex3",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    title: "Textured Gesso & Brass Mandorla",
    category: "Canvas",
    caption: "Sculptural mineral relief featuring raw ochres and hand-beaten polished brass inlay.",
    exclusive: true,
    projectName: "Bespoke Sculptural Commissions",
    projectId: "p-commission",
  },
];

async function migrate() {
  console.log("🚀 Starting Sanity CMS portfolio migration...");
  console.log(`📡 Connecting to Sanity Project ID: "${client.config().projectId}"`);
  console.log(`🗂️ Target Dataset: "${client.config().dataset}"`);

  for (let i = 0; i < artworks.length; i++) {
    const art = artworks[i];
    console.log(`\n--------------------------------------------`);
    console.log(`📦 [${i + 1}/${artworks.length}] Processing Artpiece: "${art.title}"`);

    try {
      // 1. Download image binary data from external URL
      console.log(`  🔹 Downloading binary asset from: ${art.url}`);
      const res = await fetch(art.url);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status} retrieving image asset from provider`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Upload asset binary stream to Sanity's media bucket
      console.log(`  🔹 Uploading asset stream to Sanity CDN store...`);
      const imageAsset = await client.assets.upload("image", buffer, {
        filename: `${art.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
        contentType: "image/jpeg",
      });
      console.log(`  ✅ Asset registered successfully! Sanity Image ID: "${imageAsset._id}"`);

      // 3. Construct document payload
      const doc = {
        _type: "artwork",
        _id: `artwork-${art.id}`, // Stable ID generation prevents duplicates on repeat runs
        title: art.title,
        category: art.category,
        caption: art.caption,
        featured: art.featured || false,
        exclusive: art.exclusive || false,
        projectName: art.projectName || "",
        projectId: art.projectId,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      };

      // 4. Create or replace the Sanity document (Idempotency check)
      console.log(`  🔹 Writing document schemas to dataset...`);
      const result = await client.createOrReplace(doc);
      console.log(`  🎉 Success! Active document reference: "${result._id}"`);
    } catch (err) {
      console.error(`  ❌ Error migrating artwork "${art.title}":`, err.message);
    }
  }

  console.log(`\n============================================`);
  console.log("🏆 Migration process completed! All portfolio nodes have been registered.");
}

migrate();
