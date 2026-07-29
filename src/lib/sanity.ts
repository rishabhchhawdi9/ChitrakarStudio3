import { createClient } from "@sanity/client";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || "qexuod9x";
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
const token = import.meta.env.VITE_SANITY_TOKEN || 
  "skIMe6ZpPe3Luvv8rB0wykaqeEvAV4hqFCsGwPL4ddzK1DVb5QydNJHWMS4y9FpZGIxyqre5hLLneXnj6OZl6oCVkWV4Fmp4Y73dvhG4Skvzwwyr6UPaurU70aj4a4pqySqQqw0AMg1NZA86WDAEInPy4IMmQUErMHt1mBBBeiFddZKPXn7i";

export const sanityClient = createClient({
  projectId,
  dataset,
  token,
  useCdn: false, // CDN bypassed to ensure real-time edits are fetched instantly
  apiVersion: "2023-05-03",
});
