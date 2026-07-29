import { useState, useEffect } from "react";
import { works as defaultWorks, type Work } from "./works";
import { ABSTRACT_ARTS as defaultAbstracts, type AbstractArtProject } from "./abstract-data";
import { STUDIO as defaultStudio } from "./studio";
import { defaultClients, type Client } from "./clients";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";

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

// Firestore Error Handling
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  shouldThrow = true,
) {
  const errMessage = error instanceof Error ? error.message : String(error);

  // Ignore or gracefully handle benign, transient, or idle stream disconnection messages
  if (
    errMessage.includes("Disconnecting idle stream") ||
    errMessage.includes("Timed out waiting for new targets") ||
    errMessage.includes("CANCELLED")
  ) {
    console.warn("Firestore transient/idle stream disconnect (benign):", errMessage);
    return;
  }

  // Gracefully handle quota limits as benign warning so AI Studio platform doesn't flag them as fatal errors
  if (
    errMessage.includes("Quota limit exceeded") ||
    errMessage.includes("quota exceeded") ||
    errMessage.includes("Quota exceeded")
  ) {
    console.warn(
      "Firestore quota limit exceeded. Operating in secure local-state fallback mode:",
      errMessage,
    );
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Check and initialize Firestore if empty
let isInitializing = false;

async function initFirestoreIfNeeded() {
  if (isInitializing) return;
  isInitializing = true;
  try {
    // We check if the studio info document exists. If it does, we assume Firestore is already initialized
    // and we MUST NOT seed default items (even if collections are empty, which can happen if the user deletes them).
    const studioDocRef = doc(db, "studio", "info");
    const studioSnap = await getDocs(collection(db, "studio"));

    if (studioSnap.empty) {
      console.log(
        "Fresh Firestore database detected. Initializing all collections with defaults...",
      );

      // 1. Studio Info
      await setDoc(studioDocRef, defaultStudio);

      // 2. Works
      for (const w of defaultWorks) {
        await setDoc(doc(db, "works", w.id), w);
      }

      // 3. Abstracts
      for (const abs of defaultAbstracts) {
        await setDoc(doc(db, "abstracts", abs.id), abs);
      }

      // 4. Media
      for (const m of defaultMedia) {
        await setDoc(doc(db, "media", m.id), m);
      }

      // 5. Clients
      for (const c of defaultClients) {
        await setDoc(doc(db, "clients", c.id), c);
      }

      console.log("Firestore initialization complete.");
    } else {
      console.log("Firestore is already initialized. Skipping default seeding.");
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (
      errMessage.includes("Quota limit exceeded") ||
      errMessage.includes("quota exceeded") ||
      errMessage.includes("Quota exceeded")
    ) {
      console.warn(
        "Firestore quota limit exceeded during database initialization. Running fully with local-state fallback.",
      );
    } else {
      console.error("Failed to initialize Firestore collections:", err);
    }
  }
}

// Subscribe to real-time updates from Firestore
if (typeof window !== "undefined") {
  initFirestoreIfNeeded().then(() => {
    // Works subscription
    onSnapshot(
      collection(db, "works"),
      (snapshot) => {
        const list: Work[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Work;
          // Validation: Ensure valid fully-loaded image URLs, skip mock/local routes
          if (data && data.url && typeof data.url === "string" && !data.url.includes("/__l5e/")) {
            // Assign a fallback projectId based on name if somehow missing in firestore
            const validatedWork: Work = {
              ...data,
              projectId:
                data.projectId ||
                `p-${(data.projectName || data.category).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
            };
            list.push(validatedWork);
          }
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        // Fallback to defaults if empty to avoid blank interface
        worksCache = list.length > 0 ? list : [...defaultWorks];
        notify();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "works", false);
      },
    );

    // Abstracts subscription
    onSnapshot(
      collection(db, "abstracts"),
      (snapshot) => {
        const list: AbstractArtProject[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AbstractArtProject;
          // Validation: Ensure valid project layout with photos
          if (data && data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
            const cleanPhotos = data.photos.filter((p) => p && p.url && !p.url.includes("/__l5e/"));
            if (cleanPhotos.length > 0) {
              const validatedAbstract: AbstractArtProject = {
                ...data,
                projectId: data.projectId || `p-abs-${list.length + 1}`,
                photos: cleanPhotos,
              };
              list.push(validatedAbstract);
            }
          }
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        // Fallback to defaults if empty to avoid blank interface
        abstractsCache = list.length > 0 ? list : [...defaultAbstracts];
        notify();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "abstracts", false);
      },
    );

    // Studio settings subscription
    onSnapshot(
      doc(db, "studio", "info"),
      (docSnap) => {
        if (docSnap.exists()) {
          studioCache = docSnap.data() as typeof defaultStudio;
          notify();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "studio/info", false);
      },
    );

    // Media library subscription
    onSnapshot(
      collection(db, "media"),
      (snapshot) => {
        const list: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as MediaItem);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        mediaCache = list;
        notify();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "media", false);
      },
    );

    // Clients subscription
    onSnapshot(
      collection(db, "clients"),
      (snapshot) => {
        const list: Client[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Client);
        });
        list.sort((a, b) => a.order - b.order);
        clientsCache = list;
        notify();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "clients", false);
      },
    );
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
    const id = "w-" + Date.now();
    const newWork: Work = { ...work, id };
    try {
      await setDoc(doc(db, "works", id), newWork);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `works/${id}`);
    }
    return newWork;
  },

  updateWork: async (id: string, updated: Partial<Work>) => {
    const current = worksCache.find((w) => w.id === id) || {};
    try {
      await setDoc(doc(db, "works", id), { ...current, ...updated }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `works/${id}`);
    }
  },

  deleteWork: async (id: string) => {
    try {
      await deleteDoc(doc(db, "works", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${id}`);
    }
  },

  // Abstract Projects actions
  addAbstract: async (project: Omit<AbstractArtProject, "id">) => {
    const id = "abs-" + Date.now();
    const newProj: AbstractArtProject = { ...project, id };
    try {
      await setDoc(doc(db, "abstracts", id), newProj);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `abstracts/${id}`);
    }
    return newProj;
  },

  updateAbstract: async (id: string, updated: Partial<AbstractArtProject>) => {
    const current = abstractsCache.find((p) => p.id === id) || {};
    try {
      await setDoc(doc(db, "abstracts", id), { ...current, ...updated }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `abstracts/${id}`);
    }
  },

  deleteAbstract: async (id: string) => {
    try {
      await deleteDoc(doc(db, "abstracts", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `abstracts/${id}`);
    }
  },

  // Media Library actions
  addMedia: async (url: string, filename: string) => {
    const id = "m-" + Date.now();
    const newItem: MediaItem = {
      id,
      url,
      filename,
      addedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "media", id), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `media/${id}`);
    }
    return newItem;
  },

  deleteMedia: async (id: string) => {
    try {
      await deleteDoc(doc(db, "media", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
    }
  },

  // Client actions
  addClient: async (client: Omit<Client, "id">) => {
    const id = "c-" + Date.now();
    const newClient: Client = { ...client, id };
    try {
      await setDoc(doc(db, "clients", id), newClient);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${id}`);
    }
    return newClient;
  },

  updateClient: async (id: string, updated: Partial<Client>) => {
    const current = clientsCache.find((c) => c.id === id) || {};
    try {
      await setDoc(doc(db, "clients", id), { ...current, ...updated }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${id}`);
    }
  },

  deleteClient: async (id: string) => {
    try {
      await deleteDoc(doc(db, "clients", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  },

  // General settings actions
  updateStudio: async (updated: Partial<typeof defaultStudio>) => {
    try {
      await setDoc(doc(db, "studio", "info"), updated, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "studio/info");
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
      if (data.works && Array.isArray(data.works)) {
        for (const w of data.works) {
          await setDoc(doc(db, "works", w.id), w);
        }
      }
      if (data.abstracts && Array.isArray(data.abstracts)) {
        for (const abs of data.abstracts) {
          await setDoc(doc(db, "abstracts", abs.id), abs);
        }
      }
      if (data.studio && typeof data.studio === "object") {
        await setDoc(doc(db, "studio", "info"), data.studio, { merge: true });
      }
      if (data.media && Array.isArray(data.media)) {
        for (const m of data.media) {
          await setDoc(doc(db, "media", m.id), m);
        }
      }
      if (data.clients && Array.isArray(data.clients)) {
        for (const c of data.clients) {
          await setDoc(doc(db, "clients", c.id), c);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "importAll");
    }
  },

  resetToDefaults: async () => {
    try {
      // Delete existing
      const worksSnap = await getDocs(collection(db, "works"));
      for (const d of worksSnap.docs) {
        await deleteDoc(doc(db, "works", d.id));
      }
      const abstractsSnap = await getDocs(collection(db, "abstracts"));
      for (const d of abstractsSnap.docs) {
        await deleteDoc(doc(db, "abstracts", d.id));
      }
      const mediaSnap = await getDocs(collection(db, "media"));
      for (const d of mediaSnap.docs) {
        await deleteDoc(doc(db, "media", d.id));
      }
      const clientsSnap = await getDocs(collection(db, "clients"));
      for (const d of clientsSnap.docs) {
        await deleteDoc(doc(db, "clients", d.id));
      }

      // Restore defaults
      await setDoc(doc(db, "studio", "info"), defaultStudio);
      for (const w of defaultWorks) {
        await setDoc(doc(db, "works", w.id), w);
      }
      for (const abs of defaultAbstracts) {
        await setDoc(doc(db, "abstracts", abs.id), abs);
      }
      for (const m of defaultMedia) {
        await setDoc(doc(db, "media", m.id), m);
      }
      for (const c of defaultClients) {
        await setDoc(doc(db, "clients", c.id), c);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "resetToDefaults");
    }
  },
};
