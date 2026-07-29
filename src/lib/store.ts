import { useState, useEffect } from "react";
import { works as defaultWorks, type Work } from "./works";
import { ABSTRACT_ARTS as defaultAbstracts, type AbstractArtProject } from "./abstract-data";
import { STUDIO as defaultStudio } from "./studio";
import { defaultClients, type Client } from "./clients";
import { sanityClient } from "./sanity";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  addedAt: string;
}

const defaultMedia: MediaItem[] = defaultWorks.map((w, index) => ({
  id: `m-init-${index}`,
  url: w.url,
  filename: `${w.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.jpg`,
  addedAt: new Date().toISOString(),
}));

// Observers for state changes
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => {
  listeners.forEach((l) => l());
};

// Memory-backed caches
let worksCache: Work[] = [...defaultWorks];
let abstractsCache: AbstractArtProject[] = [...defaultAbstracts];
let studioCache = { ...defaultStudio };
let mediaCache: MediaItem[] = [...defaultMedia];
let clientsCache: Client[] = [...defaultClients];

// Helper to extract a Sanity asset ID from a Sanity CDN URL
function getSanityAssetIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cdn.sanity.io/images/")) return null;
  const parts = url.split("/");
  const fileWithExt = parts[parts.length - 1]; // e.g. "hash-dimensions.ext"
  const dotIndex = fileWithExt.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const name = fileWithExt.substring(0, dotIndex);
  const ext = fileWithExt.substring(dotIndex + 1);
  return `image-${name}-${ext}`;
}

// Helper to upload a base64 image URL to Sanity's asset store
async function uploadBase64ToSanity(base64Str: string, filename: string): Promise<string> {
  try {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    const asset = await sanityClient.assets.upload("image", blob, {
      filename,
      contentType: blob.type || "image/jpeg",
    });
    return asset._id;
  } catch (err) {
    console.error("Failed to upload base64 image as Sanity asset:", err);
    return "";
  }
}

// Seeding Default Data to Sanity
async function seedDefaults() {
  console.log("Seeding Sanity dataset with defaults...");

  // 1. Seed Studio Info
  await sanityClient.createOrReplace({
    _type: "studioInfo",
    _id: "studio-info",
    ...defaultStudio,
  });

  // 2. Seed Artworks
  for (const w of defaultWorks) {
    let assetRef = null;
    try {
      const res = await fetch(w.url);
      if (res.ok) {
        const blob = await res.blob();
        const asset = await sanityClient.assets.upload("image", blob, {
          filename: `${w.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.jpg`,
        });
        assetRef = asset._id;
      }
    } catch (e) {
      console.error(`Failed to seed image asset for work ${w.title}:`, e);
    }

    const doc: any = {
      _type: "artwork",
      _id: `artwork-${w.id}`,
      title: w.title,
      category: w.category,
      caption: w.caption,
      description: w.description || "",
      featured: w.featured || false,
      exclusive: w.exclusive || false,
      projectName: w.projectName || "",
      projectId: w.projectId,
    };
    if (assetRef) {
      doc.image = { _type: "image", asset: { _type: "reference", _ref: assetRef } };
    } else {
      doc.url = w.url;
    }
    await sanityClient.createOrReplace(doc);
  }

  // 3. Seed Abstracts
  for (const abs of defaultAbstracts) {
    const photos = [];
    for (let i = 0; i < abs.photos.length; i++) {
      const photo = abs.photos[i];
      let assetRef = null;
      try {
        const res = await fetch(photo.url);
        if (res.ok) {
          const blob = await res.blob();
          const asset = await sanityClient.assets.upload("image", blob, {
            filename: `abstract_${abs.title}_${i}.jpg`,
          });
          assetRef = asset._id;
        }
      } catch (e) {
        console.error(`Failed to seed image asset for abstract photo:`, e);
      }
      photos.push({
        _key: `photo-${i}`,
        caption: photo.caption || "",
        image: assetRef ? { _type: "image", asset: { _type: "reference", _ref: assetRef } } : undefined,
        url: assetRef ? undefined : photo.url,
      });
    }

    await sanityClient.createOrReplace({
      _type: "abstractArtProject",
      _id: `abstract-${abs.id}`,
      series: abs.series,
      title: abs.title,
      year: abs.year,
      medium: abs.medium,
      dimensions: abs.dimensions,
      description: abs.description,
      photos,
    });
  }

  // 4. Seed Clients
  for (const c of defaultClients) {
    let logoAssetRef = null;
    let projectAssetRef = null;
    try {
      const logoRes = await fetch(c.logoUrl);
      if (logoRes.ok) {
        const blob = await logoRes.blob();
        const asset = await sanityClient.assets.upload("image", blob, {
          filename: `logo_${c.name}.jpg`,
        });
        logoAssetRef = asset._id;
      }
      const projRes = await fetch(c.projectImageUrl);
      if (projRes.ok) {
        const blob = await projRes.blob();
        const asset = await sanityClient.assets.upload("image", blob, {
          filename: `project_${c.name}.jpg`,
        });
        projectAssetRef = asset._id;
      }
    } catch (e) {
      console.error(`Failed to seed image asset for client ${c.name}:`, e);
    }

    const doc: any = {
      _type: "client",
      _id: `client-${c.id}`,
      name: c.name,
      order: c.order,
      published: c.published,
    };
    if (logoAssetRef) {
      doc.logo = { _type: "image", asset: { _type: "reference", _ref: logoAssetRef } };
    } else {
      doc.logoUrl = c.logoUrl;
    }
    if (projectAssetRef) {
      doc.projectImage = { _type: "image", asset: { _type: "reference", _ref: projectAssetRef } };
    } else {
      doc.projectImageUrl = c.projectImageUrl;
    }
    await sanityClient.createOrReplace(doc);
  }

  // 5. Seed Media Items
  for (const m of defaultMedia) {
    let assetRef = null;
    try {
      const res = await fetch(m.url);
      if (res.ok) {
        const blob = await res.blob();
        const asset = await sanityClient.assets.upload("image", blob, {
          filename: m.filename,
        });
        assetRef = asset._id;
      }
    } catch (e) {
      console.error(`Failed to seed image asset for media item:`, e);
    }
    const doc: any = {
      _type: "mediaItem",
      _id: `media-${m.id}`,
      filename: m.filename,
      addedAt: m.addedAt,
    };
    if (assetRef) {
      doc.image = { _type: "image", asset: { _type: "reference", _ref: assetRef } };
    } else {
      doc.url = m.url;
    }
    await sanityClient.createOrReplace(doc);
  }
}

// Single GROQ query dereferencing all image assets automatically
const ALL_DATA_QUERY = `{
  "works": *[_type == "artwork"] | order(_createdAt desc) {
    "id": _id,
    title,
    category,
    caption,
    description,
    "url": coalesce(image.asset->url, url, ""),
    projectId,
    projectName,
    featured,
    exclusive
  },
  "abstracts": *[_type == "abstractArtProject"] | order(_createdAt desc) {
    "id": _id,
    series,
    title,
    year,
    medium,
    dimensions,
    description,
    photos[]{
      "url": coalesce(image.asset->url, url, ""),
      caption
    }
  },
  "studio": *[_type == "studioInfo"][0] {
    name,
    artist,
    city,
    phone,
    phoneRaw,
    email,
    instagram,
    instagramHandle,
    pinterest,
    pinterestHandle,
    "portraitUrl": coalesce(image.asset->url, portraitUrl, "")
  },
  "media": *[_type == "mediaItem"] | order(_createdAt desc) {
    "id": _id,
    "url": coalesce(image.asset->url, url, ""),
    filename,
    addedAt
  },
  "clients": *[_type == "client"] | order(order asc) {
    "id": _id,
    name,
    "logoUrl": coalesce(logo.asset->url, logoUrl, ""),
    "projectImageUrl": coalesce(projectImage.asset->url, projectImageUrl, ""),
    order,
    published
  }
}`;

let isInitializing = false;

async function initSanityIfNeeded() {
  if (isInitializing) return;
  isInitializing = true;
  try {
    const studioInfo = await sanityClient.fetch(`*[_type == "studioInfo"][0]`);
    if (!studioInfo) {
      console.log("Fresh Sanity database detected. Initializing with defaults...");
      await seedDefaults();
      console.log("Sanity initialization complete.");
    } else {
      console.log("Sanity is already initialized. Skipping default seeding.");
    }
  } catch (err) {
    console.error("Failed to initialize Sanity collections:", err);
  }
}

// Sync all data from Sanity into memory caches
async function fetchAndSyncAll() {
  try {
    const data = await sanityClient.fetch(ALL_DATA_QUERY);

    // Map artworks
    if (data.works) {
      worksCache = data.works.map((w: any) => ({
        id: w.id,
        title: w.title,
        category: w.category,
        caption: w.caption,
        description: w.description || "",
        url: w.url || "",
        projectId: w.projectId || `p-${(w.projectName || w.category).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        projectName: w.projectName || "",
        featured: w.featured || false,
        exclusive: w.exclusive || false,
      }));
    }

    // Map abstracts
    if (data.abstracts) {
      abstractsCache = data.abstracts.map((abs: any) => ({
        id: abs.id,
        series: abs.series,
        title: abs.title,
        year: abs.year,
        medium: abs.medium,
        dimensions: abs.dimensions,
        description: abs.description,
        photos: (abs.photos || []).map((p: any) => ({
          url: p.url || "",
          caption: p.caption || "",
        })),
      }));
    }

    // Map studio
    if (data.studio) {
      studioCache = {
        name: data.studio.name || defaultStudio.name,
        artist: data.studio.artist || defaultStudio.artist,
        city: data.studio.city || defaultStudio.city,
        phone: data.studio.phone || defaultStudio.phone,
        phoneRaw: data.studio.phoneRaw || defaultStudio.phoneRaw,
        email: data.studio.email || defaultStudio.email,
        instagram: data.studio.instagram || defaultStudio.instagram,
        instagramHandle: data.studio.instagramHandle || defaultStudio.instagramHandle,
        pinterest: data.studio.pinterest || defaultStudio.pinterest,
        pinterestHandle: data.studio.pinterestHandle || defaultStudio.pinterestHandle,
        portraitUrl: data.studio.portraitUrl || defaultStudio.portraitUrl,
      };
    }

    // Map media
    if (data.media) {
      mediaCache = data.media.map((m: any) => ({
        id: m.id,
        url: m.url || "",
        filename: m.filename,
        addedAt: m.addedAt,
      }));
    }

    // Map clients
    if (data.clients) {
      clientsCache = data.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl || "",
        projectImageUrl: c.projectImageUrl || "",
        order: c.order || 0,
        published: c.published !== false,
      }));
    }

    notify();
  } catch (err) {
    console.error("Failed to fetch and sync from Sanity:", err);
  }
}

// Subscribe to real-time updates from Sanity
if (typeof window !== "undefined") {
  initSanityIfNeeded().then(() => {
    // Listen to changes on types associated with ChitrakarStudio
    sanityClient.listen(
      `*[_type in ["artwork", "abstractArtProject", "client", "mediaItem", "studioInfo"]]`
    ).subscribe({
      next: () => {
        fetchAndSyncAll();
      },
      error: (err) => {
        console.error("Sanity subscription error:", err);
      }
    });

    // Initial load
    fetchAndSyncAll();
  });
}

// React hooks to consume state reactively
export function useWorks(): Work[] {
  const [state, setState] = useState(worksCache);
  useEffect(() => {
    return subscribe(() => setState([...worksCache]));
  }, []);
  return state;
}

export function useAbstracts(): AbstractArtProject[] {
  const [state, setState] = useState(abstractsCache);
  useEffect(() => {
    return subscribe(() => setState([...abstractsCache]));
  }, []);
  return state;
}

export function useStudio(): typeof defaultStudio {
  const [state, setState] = useState(studioCache);
  useEffect(() => {
    return subscribe(() => setState({ ...studioCache }));
  }, []);
  return state;
}

export function useMediaLibrary(): MediaItem[] {
  const [state, setState] = useState(mediaCache);
  useEffect(() => {
    return subscribe(() => setState([...mediaCache]));
  }, []);
  return state;
}

export function useClients(): Client[] {
  const [state, setState] = useState(clientsCache);
  useEffect(() => {
    return subscribe(() => setState([...clientsCache]));
  }, []);
  return state;
}

// Utility to group related artworks by projectId
export function getRelatedWorksByProjectId(projectId: string, currentId: string): Work[] {
  if (!projectId) return [];
  return worksCache.filter((w) => w.projectId === projectId && w.id !== currentId);
}

// Utility to export current dynamic data
export function getExportData() {
  return {
    works: worksCache,
    abstracts: abstractsCache,
    studio: studioCache,
    media: mediaCache,
    clients: clientsCache,
  };
}

// Store actions
export const storeActions = {
  // Works Gallery actions
  addWork: async (work: Omit<Work, "id">) => {
    let imageAssetId = "";
    let urlString = work.url;

    if (work.url.startsWith("data:image/")) {
      const filename = `${work.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.jpg`;
      imageAssetId = await uploadBase64ToSanity(work.url, filename);
      if (imageAssetId) {
        urlString = "";
      }
    }

    const doc: any = {
      _type: "artwork",
      title: work.title,
      category: work.category,
      caption: work.caption,
      description: work.description || "",
      featured: work.featured || false,
      exclusive: work.exclusive || false,
      projectName: work.projectName || "",
      projectId: work.projectId,
    };

    const assetIdFromUrl = getSanityAssetIdFromUrl(urlString);
    if (imageAssetId) {
      doc.image = {
        _type: "image",
        asset: { _type: "reference", _ref: imageAssetId },
      };
    } else if (assetIdFromUrl) {
      doc.image = {
        _type: "image",
        asset: { _type: "reference", _ref: assetIdFromUrl },
      };
    } else {
      doc.url = urlString;
    }

    try {
      const created = await sanityClient.create(doc);
      const newWork: Work = { ...work, id: created._id };
      return newWork;
    } catch (error) {
      console.error("Sanity Add Work Error:", error);
      throw error;
    }
  },

  updateWork: async (id: string, updated: Partial<Work>) => {
    let patchData: any = { ...updated };
    delete patchData.id;

    if (updated.url) {
      if (updated.url.startsWith("data:image/")) {
        const title = updated.title || worksCache.find((w) => w.id === id)?.title || "artwork";
        const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.jpg`;
        const imageAssetId = await uploadBase64ToSanity(updated.url, filename);
        if (imageAssetId) {
          patchData.image = {
            _type: "image",
            asset: { _type: "reference", _ref: imageAssetId },
          };
          patchData.url = "";
        }
      } else {
        const assetIdFromUrl = getSanityAssetIdFromUrl(updated.url);
        if (assetIdFromUrl) {
          patchData.image = {
            _type: "image",
            asset: { _type: "reference", _ref: assetIdFromUrl },
          };
          patchData.url = "";
        }
      }
    }

    try {
      await sanityClient.patch(id).set(patchData).commit();
    } catch (error) {
      console.error("Sanity Update Work Error:", error);
      throw error;
    }
  },

  deleteWork: async (id: string) => {
    try {
      await sanityClient.delete(id);
    } catch (error) {
      console.error("Sanity Delete Work Error:", error);
      throw error;
    }
  },

  // Abstract Projects actions
  addAbstract: async (project: Omit<AbstractArtProject, "id">) => {
    const uploadedPhotos = [];
    for (let i = 0; i < project.photos.length; i++) {
      const photo = project.photos[i];
      let assetId = "";
      let url = photo.url;
      if (photo.url.startsWith("data:image/")) {
        assetId = await uploadBase64ToSanity(photo.url, `abstract_${project.title}_${i}.jpg`);
        if (assetId) url = "";
      } else {
        const assetIdFromUrl = getSanityAssetIdFromUrl(photo.url);
        if (assetIdFromUrl) {
          assetId = assetIdFromUrl;
          url = "";
        }
      }
      uploadedPhotos.push({
        _key: `photo-${i}-${Date.now()}`,
        caption: photo.caption || "",
        image: assetId ? { _type: "image", asset: { _type: "reference", _ref: assetId } } : undefined,
        url: assetId ? undefined : url,
      });
    }

    const doc = {
      _type: "abstractArtProject",
      series: project.series,
      title: project.title,
      year: project.year,
      medium: project.medium,
      dimensions: project.dimensions,
      description: project.description,
      photos: uploadedPhotos,
    };

    try {
      const created = await sanityClient.create(doc);
      const newProj: AbstractArtProject = { ...project, id: created._id };
      return newProj;
    } catch (error) {
      console.error("Sanity Add Abstract Error:", error);
      throw error;
    }
  },

  updateAbstract: async (id: string, updated: Partial<AbstractArtProject>) => {
    let patchData: any = { ...updated };
    delete patchData.id;

    if (updated.photos) {
      const uploadedPhotos = [];
      for (let i = 0; i < updated.photos.length; i++) {
        const photo = updated.photos[i];
        let assetId = "";
        let url = photo.url;
        if (photo.url.startsWith("data:image/")) {
          assetId = await uploadBase64ToSanity(photo.url, `abstract_update_${id}_${i}.jpg`);
          if (assetId) url = "";
        } else {
          const assetIdFromUrl = getSanityAssetIdFromUrl(photo.url);
          if (assetIdFromUrl) {
            assetId = assetIdFromUrl;
            url = "";
          }
        }
        uploadedPhotos.push({
          _key: `photo-${i}-${Date.now()}`,
          caption: photo.caption || "",
          image: assetId ? { _type: "image", asset: { _type: "reference", _ref: assetId } } : undefined,
          url: assetId ? undefined : url,
        });
      }
      patchData.photos = uploadedPhotos;
    }

    try {
      await sanityClient.patch(id).set(patchData).commit();
    } catch (error) {
      console.error("Sanity Update Abstract Error:", error);
      throw error;
    }
  },

  deleteAbstract: async (id: string) => {
    try {
      await sanityClient.delete(id);
    } catch (error) {
      console.error("Sanity Delete Abstract Error:", error);
      throw error;
    }
  },

  // Media Library actions
  addMedia: async (url: string, filename: string) => {
    let assetId = "";
    let mediaUrl = url;

    if (url.startsWith("data:image/")) {
      assetId = await uploadBase64ToSanity(url, filename);
      if (assetId) mediaUrl = "";
    }

    const doc: any = {
      _type: "mediaItem",
      filename,
      addedAt: new Date().toISOString(),
    };

    if (assetId) {
      doc.image = { _type: "image", asset: { _type: "reference", _ref: assetId } };
    } else {
      doc.url = mediaUrl;
    }

    try {
      const created = await sanityClient.create(doc);
      const newItem: MediaItem = {
        id: created._id,
        url: url,
        filename,
        addedAt: doc.addedAt,
      };
      return newItem;
    } catch (error) {
      console.error("Sanity Add Media Error:", error);
      throw error;
    }
  },

  deleteMedia: async (id: string) => {
    try {
      await sanityClient.delete(id);
    } catch (error) {
      console.error("Sanity Delete Media Error:", error);
      throw error;
    }
  },

  addClient: async (client: Omit<Client, "id">) => {
    let logoAssetId = "";
    let projectAssetId = "";
    let logoUrl = client.logoUrl;
    let projectImageUrl = client.projectImageUrl;

    if (client.logoUrl.startsWith("data:image/")) {
      logoAssetId = await uploadBase64ToSanity(client.logoUrl, `logo_${Date.now()}.jpg`);
      if (logoAssetId) logoUrl = "";
    } else {
      const assetIdFromUrl = getSanityAssetIdFromUrl(client.logoUrl);
      if (assetIdFromUrl) {
        logoAssetId = assetIdFromUrl;
        logoUrl = "";
      }
    }
    if (client.projectImageUrl.startsWith("data:image/")) {
      projectAssetId = await uploadBase64ToSanity(client.projectImageUrl, `project_${Date.now()}.jpg`);
      if (projectAssetId) projectImageUrl = "";
    } else {
      const assetIdFromUrl = getSanityAssetIdFromUrl(client.projectImageUrl);
      if (assetIdFromUrl) {
        projectAssetId = assetIdFromUrl;
        projectImageUrl = "";
      }
    }

    const doc: any = {
      _type: "client",
      name: client.name,
      order: client.order,
      published: client.published,
    };

    if (logoAssetId) {
      doc.logo = { _type: "image", asset: { _type: "reference", _ref: logoAssetId } };
    } else {
      doc.logoUrl = logoUrl;
    }

    if (projectAssetId) {
      doc.projectImage = { _type: "image", asset: { _type: "reference", _ref: projectAssetId } };
    } else {
      doc.projectImageUrl = projectImageUrl;
    }

    try {
      const created = await sanityClient.create(doc);
      const newClient: Client = { ...client, id: created._id };
      return newClient;
    } catch (error) {
      console.error("Sanity Add Client Error:", error);
      throw error;
    }
  },

  updateClient: async (id: string, updated: Partial<Client>) => {
    let patchData: any = { ...updated };
    delete patchData.id;

    if (updated.logoUrl) {
      if (updated.logoUrl.startsWith("data:image/")) {
        const logoAssetId = await uploadBase64ToSanity(updated.logoUrl, `logo_${id}.jpg`);
        if (logoAssetId) {
          patchData.logo = { _type: "image", asset: { _type: "reference", _ref: logoAssetId } };
          patchData.logoUrl = "";
        }
      } else {
        const assetIdFromUrl = getSanityAssetIdFromUrl(updated.logoUrl);
        if (assetIdFromUrl) {
          patchData.logo = { _type: "image", asset: { _type: "reference", _ref: assetIdFromUrl } };
          patchData.logoUrl = "";
        }
      }
    }
    if (updated.projectImageUrl) {
      if (updated.projectImageUrl.startsWith("data:image/")) {
        const projectAssetId = await uploadBase64ToSanity(updated.projectImageUrl, `project_${id}.jpg`);
        if (projectAssetId) {
          patchData.projectImage = { _type: "image", asset: { _type: "reference", _ref: projectAssetId } };
          patchData.projectImageUrl = "";
        }
      } else {
        const assetIdFromUrl = getSanityAssetIdFromUrl(updated.projectImageUrl);
        if (assetIdFromUrl) {
          patchData.projectImage = { _type: "image", asset: { _type: "reference", _ref: assetIdFromUrl } };
          patchData.projectImageUrl = "";
        }
      }
    }

    try {
      await sanityClient.patch(id).set(patchData).commit();
    } catch (error) {
      console.error("Sanity Update Client Error:", error);
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    try {
      await sanityClient.delete(id);
    } catch (error) {
      console.error("Sanity Delete Client Error:", error);
      throw error;
    }
  },

  // General settings actions
  updateStudio: async (updated: Partial<typeof defaultStudio>) => {
    let patchData: any = { ...updated };
    delete patchData.portraitUrl;

    if (updated.portraitUrl) {
      if (updated.portraitUrl.startsWith("data:image/")) {
        const imageAssetId = await uploadBase64ToSanity(updated.portraitUrl, `portrait_${Date.now()}.jpg`);
        if (imageAssetId) {
          patchData.image = {
            _type: "image",
            asset: { _type: "reference", _ref: imageAssetId },
          };
          patchData.portraitUrl = "";
        }
      } else {
        const assetIdFromUrl = getSanityAssetIdFromUrl(updated.portraitUrl);
        if (assetIdFromUrl) {
          patchData.image = {
            _type: "image",
            asset: { _type: "reference", _ref: assetIdFromUrl },
          };
          patchData.portraitUrl = "";
        }
      }
    }

    try {
      await sanityClient.createIfNotExists({
        _type: "studioInfo",
        _id: "studio-info",
        ...defaultStudio,
      });
      await sanityClient.patch("studio-info").set(patchData).commit();
    } catch (error) {
      console.error("Sanity Update Studio Error:", error);
      throw error;
    }
  },

  // Import / Reset settings
  importAll: async (data: {
    works?: Work[];
    abstracts?: AbstractArtProject[];
    studio?: typeof defaultStudio;
    media?: MediaItem[];
    clients?: Client[];
  }) => {
    try {
      const transaction = sanityClient.transaction();

      if (data.works && Array.isArray(data.works)) {
        for (const w of data.works) {
          transaction.createOrReplace({
            _type: "artwork",
            _id: w.id,
            title: w.title,
            category: w.category,
            caption: w.caption,
            description: w.description || "",
            url: w.url,
            projectId: w.projectId,
            projectName: w.projectName || "",
            featured: w.featured || false,
            exclusive: w.exclusive || false,
          });
        }
      }

      if (data.abstracts && Array.isArray(data.abstracts)) {
        for (const abs of data.abstracts) {
          transaction.createOrReplace({
            _type: "abstractArtProject",
            _id: abs.id,
            series: abs.series,
            title: abs.title,
            year: abs.year,
            medium: abs.medium,
            dimensions: abs.dimensions,
            description: abs.description,
            photos: abs.photos.map((p, index) => ({
              _key: `photo-${index}`,
              url: p.url,
              caption: p.caption || "",
            })),
          });
        }
      }

      if (data.studio && typeof data.studio === "object") {
        transaction.createOrReplace({
          _type: "studioInfo",
          _id: "studio-info",
          ...data.studio,
        });
      }

      if (data.media && Array.isArray(data.media)) {
        for (const m of data.media) {
          transaction.createOrReplace({
            _type: "mediaItem",
            _id: m.id,
            url: m.url,
            filename: m.filename,
            addedAt: m.addedAt,
          });
        }
      }

      if (data.clients && Array.isArray(data.clients)) {
        for (const c of data.clients) {
          transaction.createOrReplace({
            _type: "client",
            _id: c.id,
            name: c.name,
            logoUrl: c.logoUrl,
            projectImageUrl: c.projectImageUrl,
            order: c.order,
            published: c.published,
          });
        }
      }

      await transaction.commit();
    } catch (error) {
      console.error("Sanity Import All Error:", error);
      throw error;
    }
  },

  resetToDefaults: async () => {
    try {
      const docs = await sanityClient.fetch(
        `*[_type in ["artwork", "abstractArtProject", "client", "mediaItem", "studioInfo"]]`
      );
      const transaction = sanityClient.transaction();
      docs.forEach((doc: any) => {
        transaction.delete(doc._id);
      });
      await transaction.commit();

      await seedDefaults();
    } catch (error) {
      console.error("Sanity Reset Defaults Error:", error);
      throw error;
    }
  },
};
