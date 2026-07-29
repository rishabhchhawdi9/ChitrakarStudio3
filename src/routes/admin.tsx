import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useWorks,
  useAbstracts,
  useStudio,
  useMediaLibrary,
  useClients,
  storeActions,
  getExportData,
  type MediaItem,
} from "../lib/store";
import { CATEGORIES, type Category, type Work } from "../lib/works";
import { type AbstractArtProject, type AbstractPhoto } from "../lib/abstract-data";
import { type Client } from "../lib/clients";
import {
  Lock,
  Settings,
  Image as ImageIcon,
  Sparkles,
  Folder,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertCircle,
  X,
  ArrowLeft,
  CheckSquare,
  Eye,
  Compass,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  RefreshCw,
  Users,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Chitrakar Studio — Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type ToastType = "success" | "error" | "info";
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

function AdminPage() {
  const navigate = useNavigate();
  const works = useWorks();
  const abstracts = useAbstracts();
  const studio = useStudio();
  const mediaLibrary = useMediaLibrary();
  const clients = useClients();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState<
    "studio" | "works" | "abstracts" | "media" | "backup" | "clients"
  >("studio");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<{
    type: "work" | "abstract" | "client-logo" | "client-project";
    index?: number;
  } | null>(null);
  const [mediaSearch, setMediaSearch] = useState("");

  // Search, Filtering & Sorting states for Admin view
  const [worksSearch, setWorksSearch] = useState("");
  const [worksSort, setWorksSort] = useState<"default" | "newest" | "oldest" | "alphabetical">(
    "default",
  );
  const [worksFilterCategory, setWorksFilterCategory] = useState<Category | "All">("All");

  const [abstractsSearch, setAbstractsSearch] = useState("");
  const [abstractsSort, setAbstractsSort] = useState<
    "default" | "newest" | "oldest" | "alphabetical"
  >("default");

  // Modals / Editing state
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [isAddingWork, setIsAddingWork] = useState(false);

  const [editingAbstract, setEditingAbstract] = useState<AbstractArtProject | null>(null);
  const [isAddingAbstract, setIsAddingAbstract] = useState(false);

  // Form states - Work
  const [workForm, setWorkForm] = useState({
    title: "",
    category: "Mural" as Category,
    description: "",
    url: "",
    featured: false,
    exclusive: false,
  });

  // Form states - Client
  const [clientForm, setClientForm] = useState({
    name: "",
    logoUrl: "",
    projectImageUrl: "",
    order: 1,
    published: true,
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientsSearch, setClientsSearch] = useState("");
  const [clientsSort, setClientsSort] = useState<"order" | "alphabetical">("order");

  // Form states - Abstract Project
  const [abstractForm, setAbstractForm] = useState({
    series: "",
    title: "",
    year: new Date().getFullYear().toString(),
    medium: "",
    dimensions: "",
    description: "",
    photos: [] as AbstractPhoto[],
  });

  // Form states - Studio Info
  const [studioForm, setStudioForm] = useState({
    name: "",
    artist: "",
    city: "",
    email: "",
    phone: "",
    phoneRaw: "",
    instagram: "",
    instagramHandle: "",
    pinterest: "",
    portraitUrl: "",
  });

  // Drag and drop / upload state
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    current: number;
    total: number;
    filename: string;
  }>({
    isUploading: false,
    current: 0,
    total: 0,
    filename: "",
  });

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const triggerConfirm = (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...params,
    });
  };

  // Helper to trigger toast notifications
  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper function to parse ID for sorting
  const parseIdToValue = (id: string) => {
    if (id.startsWith("w-")) {
      return parseInt(id.split("-")[1]) || 0;
    }
    const match = id.match(/^w(\d+)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  };

  // Helper function to parse Abstract ID for sorting
  const parseAbstractIdToValue = (id: string) => {
    if (id.startsWith("abs-")) {
      return parseInt(id.split("-")[1]) || 0;
    }
    const match = id.match(/^abs(\d+)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  };

  // Computed and sorted works for Admin list
  const processedWorks = useMemo(() => {
    let result = [...works];
    if (worksFilterCategory !== "All") {
      result = result.filter((w) => w.category === worksFilterCategory);
    }
    if (worksSearch.trim() !== "") {
      const q = worksSearch.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.caption.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q),
      );
    }
    if (worksSort === "newest") {
      result.sort((a, b) => parseIdToValue(b.id) - parseIdToValue(a.id));
    } else if (worksSort === "oldest") {
      result.sort((a, b) => parseIdToValue(a.id) - parseIdToValue(b.id));
    } else if (worksSort === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [works, worksFilterCategory, worksSearch, worksSort]);

  // Computed and sorted abstracts for Admin list
  const processedAbstracts = useMemo(() => {
    let result = [...abstracts];
    if (abstractsSearch.trim() !== "") {
      const q = abstractsSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.medium.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (abstractsSort === "newest") {
      result.sort((a, b) => parseAbstractIdToValue(b.id) - parseAbstractIdToValue(a.id));
    } else if (abstractsSort === "oldest") {
      result.sort((a, b) => parseAbstractIdToValue(a.id) - parseAbstractIdToValue(b.id));
    } else if (abstractsSort === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [abstracts, abstractsSearch, abstractsSort]);

  // Check login on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("chitrakar_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Sync studio form when studio state loads
  useEffect(() => {
    if (studio) {
      setStudioForm({
        name: studio.name || "",
        artist: studio.artist || "",
        city: studio.city || "",
        email: studio.email || "",
        phone: studio.phone || "",
        phoneRaw: studio.phoneRaw || "",
        instagram: studio.instagram || "",
        instagramHandle: studio.instagramHandle || "",
        pinterest: studio.pinterest || "",
        portraitUrl: (studio as { portraitUrl?: string }).portraitUrl || "",
      });
    }
  }, [studio]);

  // Handle Authenticate
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "Chitrakar2026!") {
      setIsAuthenticated(true);
      setAuthError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("chitrakar_admin_auth", "true");
      }
      showToast("Access granted. Welcome to your Studio Space.");
    } else {
      setAuthError("Invalid passcode. Please enter 'admin'.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chitrakar_admin_auth");
    }
    showToast("Logged out successfully.", "info");
  };

  // HTML5 Image compressor helper (resizes and compresses images to keep base64 light)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as compressed jpeg
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Image upload handler for Work items
  const handleWorkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("Compressing image...", "info");
      const base64 = await compressImage(file);
      setWorkForm((prev) => ({ ...prev, url: base64 }));
      showToast("Image compressed & ready!");
    } catch (err) {
      console.error(err);
      showToast("Failed to process image.", "error");
    }
  };

  // Image upload handler for Media Library (bulk upload)
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ("dataTransfer" in e) {
      files = e.dataTransfer.files;
    } else {
      files = e.target.files;
    }
    if (!files || files.length === 0) return;

    setUploadState({
      isUploading: true,
      current: 0,
      total: files.length,
      filename: files[0].name,
    });

    try {
      showToast(`Compressing & adding ${files.length} image(s)...`, "info");
      let addedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          showToast(`Skipped non-image file: ${file.name}`, "error");
          continue;
        }
        setUploadState((prev) => ({ ...prev, current: i + 1, filename: file.name }));
        const base64 = await compressImage(file);
        await storeActions.addMedia(base64, file.name);
        addedCount++;
      }
      showToast(`Successfully imported ${addedCount} image(s) to Artwork Folder!`);
    } catch (err) {
      console.error(err);
      showToast("Failed to process some images.", "error");
    } finally {
      setUploadState({
        isUploading: false,
        current: 0,
        total: 0,
        filename: "",
      });
    }
  };

  // Submit Work creation / modification
  const handleWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workForm.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    if (!workForm.url.trim()) {
      showToast("Image URL or uploaded file is required.", "error");
      return;
    }

    if (editingWork) {
      storeActions.updateWork(editingWork.id, workForm);
      showToast(`Successfully updated work "${workForm.title}".`);
      setEditingWork(null);
    } else {
      storeActions.addWork(workForm);
      showToast(`Successfully added work "${workForm.title}" to gallery.`);
      setIsAddingWork(false);
    }

    // Reset Form
    setWorkForm({
      title: "",
      category: "Mural" as Category,
      description: "",
      url: "",
      featured: false,
      exclusive: false,
    });
  };

  // Trigger editing a work
  const startEditWork = (w: Work) => {
    setEditingWork(w);
    setWorkForm({
      title: w.title,
      category: w.category,
      description: w.description || "",
      url: w.url,
      featured: !!w.featured,
      exclusive: !!w.exclusive,
    });
    setIsAddingWork(true);
  };

  const cancelWorkEdit = () => {
    setEditingWork(null);
    setIsAddingWork(false);
    setWorkForm({
      title: "",
      category: "Mural" as Category,
      description: "",
      url: "",
      featured: false,
      exclusive: false,
    });
  };

  const deleteWork = (id: string, title: string) => {
    triggerConfirm({
      title: "Delete Artwork",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => {
        storeActions.deleteWork(id);
        showToast(`Deleted "${title}".`);
      },
    });
  };

  // SUBMIT STUDIO INFO
  const handleStudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeActions.updateStudio(studioForm);
    showToast("Studio settings saved successfully.");
  };

  // ABSTRACT PHOTO HANDLING IN FORM
  const addPhotoToAbstractForm = () => {
    setAbstractForm((prev) => ({
      ...prev,
      photos: [...prev.photos, { url: "", caption: "" }],
    }));
  };

  const updateAbstractPhotoInForm = (index: number, field: keyof AbstractPhoto, value: string) => {
    setAbstractForm((prev) => {
      const photos = [...prev.photos];
      photos[index] = { ...photos[index], [field]: value };
      return { ...prev, photos };
    });
  };

  const handleAbstractPhotoUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("Compressing project photo...", "info");
      const base64 = await compressImage(file);
      updateAbstractPhotoInForm(index, "url", base64);
      showToast("Photo processed successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to process photo.", "error");
    }
  };

  const removePhotoFromAbstractForm = (index: number) => {
    setAbstractForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // SUBMIT ABSTRACT SERIES
  const handleAbstractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abstractForm.series.trim() || !abstractForm.title.trim()) {
      showToast("Series name and Title are required.", "error");
      return;
    }
    if (abstractForm.photos.length === 0 || !abstractForm.photos[0].url) {
      showToast("At least one project photo with a valid image is required.", "error");
      return;
    }

    if (editingAbstract) {
      storeActions.updateAbstract(editingAbstract.id, abstractForm);
      showToast(`Successfully updated abstract series "${abstractForm.title}".`);
      setEditingAbstract(null);
      setIsAddingAbstract(false);
    } else {
      storeActions.addAbstract(abstractForm);
      showToast(`Successfully created abstract series "${abstractForm.title}".`);
      setIsAddingAbstract(false);
    }

    // Reset Form
    setAbstractForm({
      series: "",
      title: "",
      year: new Date().getFullYear().toString(),
      medium: "",
      dimensions: "",
      description: "",
      photos: [],
    });
  };

  const startEditAbstract = (p: AbstractArtProject) => {
    setEditingAbstract(p);
    setAbstractForm({
      series: p.series,
      title: p.title,
      year: p.year,
      medium: p.medium,
      dimensions: p.dimensions,
      description: p.description,
      photos: [...p.photos],
    });
    setIsAddingAbstract(true);
  };

  const cancelAbstractEdit = () => {
    setEditingAbstract(null);
    setIsAddingAbstract(false);
    setAbstractForm({
      series: "",
      title: "",
      year: new Date().getFullYear().toString(),
      medium: "",
      dimensions: "",
      description: "",
      photos: [],
    });
  };

  const deleteAbstract = (id: string, title: string) => {
    triggerConfirm({
      title: "Delete Abstract Series",
      message: `Are you sure you want to delete the abstract series "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => {
        storeActions.deleteAbstract(id);
        showToast(`Deleted abstract series "${title}".`);
      },
    });
  };

  // CLIENT CRUD OPERATIONS
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      showToast("Client / Brand Name is required.", "error");
      return;
    }
    if (editingClient) {
      storeActions.updateClient(editingClient.id, clientForm);
      showToast(`Successfully updated client "${clientForm.name}".`);
      setEditingClient(null);
    } else {
      storeActions.addClient(clientForm);
      showToast(`Successfully added client "${clientForm.name}".`);
      setIsAddingClient(false);
    }
    setClientForm({
      name: "",
      logoUrl: "",
      projectImageUrl: "",
      order: clients.length + 1,
      published: true,
    });
  };

  const startEditClient = (c: Client) => {
    setEditingClient(c);
    setClientForm({
      name: c.name,
      logoUrl: c.logoUrl,
      projectImageUrl: c.projectImageUrl,
      order: c.order || 1,
      published: !!c.published,
    });
    setIsAddingClient(true);
  };

  const cancelClientEdit = () => {
    setEditingClient(null);
    setIsAddingClient(false);
    setClientForm({
      name: "",
      logoUrl: "",
      projectImageUrl: "",
      order: clients.length + 1,
      published: true,
    });
  };

  const deleteClient = (id: string, name: string) => {
    triggerConfirm({
      title: "Delete Client Record",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => {
        storeActions.deleteClient(id);
        showToast(`Deleted client "${name}".`);
      },
    });
  };

  // BACKUP OPERATIONS
  const triggerDownloadBackup = () => {
    const data = getExportData();
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chitrakar_studio_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup file downloaded.");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.works || parsed.abstracts || parsed.studio) {
          storeActions.importAll(parsed);
          showToast("Data imported successfully!");
        } else {
          showToast("Invalid backup file. Missing critical fields.", "error");
        }
      } catch (err) {
        showToast("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const resetStoreToDefaults = () => {
    triggerConfirm({
      title: "Restore Original Templates",
      message:
        "Are you absolutely sure? This will wipe out all of your custom edits, uploaded images, and custom studio text, resetting the site back to original hardcoded templates.",
      confirmText: "Restore Defaults",
      isDestructive: true,
      onConfirm: () => {
        storeActions.resetToDefaults();
        showToast("Restored original site templates.", "info");
      },
    });
  };

  // Gated login rendering
  if (!isAuthenticated) {
    return (
      <div className="bg-background text-primary min-h-screen flex items-center justify-center p-6 relative overflow-hidden grain">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/2 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full border-2 border-primary/25 rounded-2xl bg-card p-8 shadow-2xl relative z-10 text-center"
        >
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/15">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-2">
            Studio Entrance
          </h1>
          <p className="text-sm opacity-70 mb-8">
            Access the content engine for <strong>{studio?.name || "Chitrakar Studio"}</strong>.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="passcode"
                className="text-xs uppercase tracking-widest text-primary/60 font-semibold block mb-2"
              >
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                placeholder="••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-primary/20 bg-background focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:opacity-90 active:scale-98 transition-all cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <p className="text-[11px] text-primary/50 mt-6 bg-primary/5 p-3 rounded-lg border border-primary/10">
            Developer Notice: The default system access passcode is{" "}
            <strong className="text-primary font-bold">admin</strong>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen pb-24">
      {/* Dynamic Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                  : toast.type === "error"
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300"
                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300"
              }`}
            >
              {toast.type === "success" && <Check className="h-4 w-4 shrink-0 mt-0.5" />}
              {toast.type === "error" && <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              {toast.type === "info" && <CheckSquare className="h-4 w-4 shrink-0 mt-0.5" />}
              <div className="flex-1">{toast.message}</div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ADMIN HEADER */}
      <header className="px-6 py-6 border-b border-primary/10 sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-75 text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight leading-none text-primary">
                {studioForm.name} Portal
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-primary/50 font-bold mt-1">
                Studio Management Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/gallery"
              className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-2"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-primary/60 hover:text-primary transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SIDE NAVIGATION */}
          <aside className="lg:col-span-3 space-y-2">
            <button
              onClick={() => {
                setActiveTab("studio");
                cancelWorkEdit();
                cancelAbstractEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "studio"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>1. Studio Identity</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("works");
                cancelWorkEdit();
                cancelAbstractEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "works"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <ImageIcon className="h-4 w-4 shrink-0" />
              <span>2. Works Gallery ({works.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("abstracts");
                cancelWorkEdit();
                cancelAbstractEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "abstracts"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>3. Abstract Series ({abstracts.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("media");
                cancelWorkEdit();
                cancelAbstractEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "media"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span>4. Artwork Folder ({mediaLibrary.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("backup");
                cancelWorkEdit();
                cancelAbstractEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "backup"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>5. Data Backup &amp; Reset</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("clients");
                cancelWorkEdit();
                cancelAbstractEdit();
                cancelClientEdit();
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-3 border transition-all cursor-pointer ${
                activeTab === "clients"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary/80"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>6. Corporate Clients ({clients.length})</span>
            </button>

            <div className="mt-8 bg-card border border-primary/15 p-4 rounded-xl text-xs space-y-2 opacity-80">
              <p className="font-mono font-bold text-primary/60 uppercase">Data Engine Notes</p>
              <p className="leading-relaxed">
                All changes made on this board update the local state. Changes persist across tab
                sessions and browser reloads.
              </p>
            </div>
          </aside>

          {/* MAIN FORM / WORKSPACE CONTENT */}
          <section className="lg:col-span-9">
            {/* TAB 1: STUDIO IDENTITY */}
            {activeTab === "studio" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                    Studio Identity
                  </h2>
                  <p className="text-sm opacity-70">
                    Update the general text and contact links rendered on the website's headers,
                    footers, and contact forms.
                  </p>
                </div>

                <form
                  onSubmit={handleStudioSubmit}
                  className="bg-card border border-primary/15 rounded-xl p-6 md:p-8 space-y-6 shadow-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Studio / Brand Name
                      </label>
                      <input
                        type="text"
                        value={studioForm.name}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Lead Artist
                      </label>
                      <input
                        type="text"
                        value={studioForm.artist}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, artist: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Base City
                      </label>
                      <input
                        type="text"
                        value={studioForm.city}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={studioForm.email}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Phone (Display)
                      </label>
                      <input
                        type="text"
                        value={studioForm.phone}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Phone (Raw, for tel links)
                      </label>
                      <input
                        type="text"
                        value={studioForm.phoneRaw}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, phoneRaw: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Instagram Username (Handle)
                      </label>
                      <input
                        type="text"
                        value={studioForm.instagramHandle}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, instagramHandle: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Instagram Link URL
                      </label>
                      <input
                        type="url"
                        value={studioForm.instagram}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, instagram: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                        Pinterest Profile Link
                      </label>
                      <input
                        type="url"
                        value={studioForm.pinterest}
                        onChange={(e) =>
                          setStudioForm((prev) => ({ ...prev, pinterest: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 border-t border-primary/10 pt-6">
                      <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-primary mb-4">
                        About Page Portrait Photo
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Preview */}
                        <div className="md:col-span-3 flex justify-center">
                          <div className="relative h-32 w-28 rounded-lg overflow-hidden border-2 border-primary/15 bg-primary/5 shadow-sm">
                            {studioForm.portraitUrl ? (
                              <img
                                src={studioForm.portraitUrl}
                                alt="About Portrait Preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-primary/30 text-xs font-mono">
                                No Photo
                              </div>
                            )}
                          </div>
                        </div>
                        {/* URL and File Selectors */}
                        <div className="md:col-span-9 space-y-4">
                          <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold text-primary/60 block mb-1">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={studioForm.portraitUrl}
                              onChange={(e) =>
                                setStudioForm((prev) => ({ ...prev, portraitUrl: e.target.value }))
                              }
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full px-4 py-2 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none text-xs transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold text-primary/60 block mb-1">
                              Or Upload From Device
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  showToast("Processing profile photo...", "info");
                                  const base64 = await compressImage(file);
                                  setStudioForm((prev) => ({ ...prev, portraitUrl: base64 }));
                                  showToast("Profile photo loaded successfully!");
                                } catch (err) {
                                  showToast("Failed to process profile photo.", "error");
                                }
                              }}
                              className="w-full text-xs text-primary/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/5 file:text-primary file:cursor-pointer hover:file:bg-primary/10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-primary/10 pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Studio Settings</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: WORKS GALLERY */}
            {activeTab === "works" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                      Works Gallery
                    </h2>
                    <p className="text-sm opacity-70">
                      Add, modify, or remove hand-painted murals, wall art, and canvas commissions.
                    </p>
                  </div>

                  {!isAddingWork && (
                    <button
                      onClick={() => setIsAddingWork(true)}
                      className="px-5 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Work</span>
                    </button>
                  )}
                </div>

                {/* ADD/EDIT FORM CONTROLS */}
                {isAddingWork && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-card border-2 border-primary/20 rounded-xl p-6 md:p-8 space-y-6 shadow-md"
                  >
                    <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                      <h3 className="font-[family-name:var(--font-display)] text-xl text-primary flex items-center gap-2">
                        <Edit3 className="h-5 w-5" />
                        <span>
                          {editingWork ? `Edit Work: ${editingWork.title}` : "Create New Work Item"}
                        </span>
                      </h3>
                      <button
                        onClick={cancelWorkEdit}
                        className="h-8 w-8 rounded-full border border-primary/20 hover:border-primary text-primary/70 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleWorkSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Art Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Earth Gesso Canvas"
                            value={workForm.title}
                            onChange={(e) =>
                              setWorkForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Category Selection
                          </label>
                          <select
                            value={workForm.category}
                            onChange={(e) =>
                              setWorkForm((prev) => ({
                                ...prev,
                                category: e.target.value as Category,
                              }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Creative Description (Optional)
                          </label>
                          <textarea
                            placeholder="Briefly describe the story, medium details, or customer commission notes..."
                            value={workForm.description}
                            onChange={(e) =>
                              setWorkForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            rows={3}
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Featured Item Toggle
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-primary/10 rounded-lg bg-primary/2">
                            <input
                              type="checkbox"
                              checked={workForm.featured}
                              onChange={(e) =>
                                setWorkForm((prev) => ({ ...prev, featured: e.target.checked }))
                              }
                              className="h-4 w-4 text-primary focus:ring-primary rounded"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-primary block">
                                Display on Home Page
                              </span>
                              <span className="text-primary/70">
                                Check this box to highlight this artwork in the Home page carousel.
                              </span>
                            </div>
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Exclusive &amp; On-Demand Toggle
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-primary/10 rounded-lg bg-primary/2">
                            <input
                              type="checkbox"
                              checked={workForm.exclusive || false}
                              onChange={(e) =>
                                setWorkForm((prev) => ({ ...prev, exclusive: e.target.checked }))
                              }
                              className="h-4 w-4 text-primary focus:ring-primary rounded"
                            />
                            <div className="text-xs text-left">
                              <span className="font-bold text-primary block">
                                Premium / Bespoke Item
                              </span>
                              <span className="text-primary/70">
                                Check this to show it in the 'Exclusive &amp; On-Demand' bespoke
                                section.
                              </span>
                            </div>
                          </label>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block">
                            Artwork Image Source
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Option A: Image file upload */}
                            <div className="border border-primary/15 rounded-lg p-5 flex flex-col justify-center items-center text-center bg-card">
                              <Upload className="h-8 w-8 text-primary/50 mb-3" />
                              <span className="text-xs font-bold block mb-1 text-primary">
                                Upload Local Image
                              </span>
                              <span className="text-[10px] text-primary/60 mb-4 max-w-xs">
                                Supports JPG, PNG, GIF. Canvas automatic compression is applied.
                              </span>
                              <label className="px-4 py-2 bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary font-semibold text-xs rounded-md cursor-pointer transition-all">
                                <span>Choose Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleWorkImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Option B: Direct URL */}
                            <div className="border border-primary/15 rounded-lg p-5 flex flex-col justify-center bg-card text-center">
                              <span className="text-xs font-bold block mb-1 text-primary">
                                Paste Image URL
                              </span>
                              <span className="text-[10px] text-primary/60 mb-4">
                                Link any static image hosted on Unsplash, Pinterest, Imgur, etc.
                              </span>
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/photo-..."
                                value={workForm.url}
                                onChange={(e) =>
                                  setWorkForm((prev) => ({ ...prev, url: e.target.value }))
                                }
                                className="w-full px-4 py-2 text-xs border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                              />
                            </div>

                            {/* Option C: Select from Artwork Folder */}
                            <div className="border border-primary/15 rounded-lg p-5 flex flex-col justify-center items-center text-center bg-card">
                              <Folder className="h-8 w-8 text-primary/50 mb-3" />
                              <span className="text-xs font-bold block mb-1 text-primary">
                                Artwork Folder
                              </span>
                              <span className="text-[10px] text-primary/60 mb-4 max-w-xs">
                                Select from your local repository folder containing all downloaded
                                artworks.
                              </span>
                              <button
                                type="button"
                                onClick={() => setMediaSelectorTarget({ type: "work" })}
                                className="px-4 py-2 bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary font-semibold text-xs rounded-md cursor-pointer transition-all"
                              >
                                <span>Select Photo ({mediaLibrary.length})</span>
                              </button>
                            </div>
                          </div>

                          {/* Image preview rendering */}
                          {workForm.url && (
                            <div className="mt-4 border border-primary/20 rounded-lg p-3 bg-background flex flex-col items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-primary/50">
                                Image Preview
                              </span>
                              <img
                                src={workForm.url}
                                alt="Form artwork preview"
                                className="max-h-48 rounded object-contain border"
                                onError={() =>
                                  showToast("Warning: Image URL appears invalid.", "error")
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-primary/10 pt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelWorkEdit}
                          className="px-5 py-3 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/5 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Save className="h-4 w-4" />
                          <span>{editingWork ? "Update Artwork" : "Publish Artwork"}</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* CURRENT GALLERY LIST TABLE */}
                <div className="bg-card border border-primary/15 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-primary/10 bg-primary/2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-wider font-bold text-primary/70">
                      Published Gallery Items ({processedWorks.length} of {works.length})
                    </span>

                    {/* SEARCH & SORT TOOLBAR */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search artworks..."
                        value={worksSearch}
                        onChange={(e) => setWorksSearch(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary focus:outline-none focus:border-primary max-w-xs"
                      />

                      {/* Filter category */}
                      <select
                        value={worksFilterCategory}
                        onChange={(e) => setWorksFilterCategory(e.target.value as Category | "All")}
                        className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary font-semibold focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      {/* Sort dropdown */}
                      <select
                        value={worksSort}
                        onChange={(e) =>
                          setWorksSort(
                            e.target.value as "default" | "newest" | "oldest" | "alphabetical",
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary font-semibold focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="default">Default Order</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="alphabetical">Title (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-primary/10">
                    {processedWorks.map((w) => (
                      <div
                        key={w.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-primary/1 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md overflow-hidden border border-primary/20 shrink-0 bg-primary/5">
                            <img
                              src={w.url}
                              alt={w.title}
                              className="h-full w-full object-contain bg-primary/5"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-[family-name:var(--font-display)] text-lg text-primary leading-tight">
                                {w.title}
                              </span>
                              {w.featured && (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-primary/60 mt-1">
                              Category:{" "}
                              <strong className="text-primary font-bold">{w.category}</strong>
                            </p>
                            {w.description && (
                              <p className="text-xs italic text-primary/50 mt-1 line-clamp-1 max-w-md">
                                "{w.description}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => startEditWork(w)}
                            className="p-2 border border-primary/15 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteWork(w.id, w.title)}
                            className="p-2 border border-red-500/15 text-red-500 hover:text-red-600 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                            title="Remove artwork"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {works.length === 0 && (
                      <div className="p-8 text-center text-sm text-primary/50">
                        No artwork published. Click "Create New Work" to build your gallery.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ABSTRACT ARTS */}
            {activeTab === "abstracts" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                      Abstract Art Series
                    </h2>
                    <p className="text-sm opacity-70">
                      Manage dynamic multi-photo abstract art projects, dimensions, mediums, and
                      descriptions.
                    </p>
                  </div>

                  {!isAddingAbstract && (
                    <button
                      onClick={() => setIsAddingAbstract(true)}
                      className="px-5 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Abstract Series</span>
                    </button>
                  )}
                </div>

                {/* ADD/EDIT ABSTRACT SERIES */}
                {isAddingAbstract && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-card border-2 border-primary/20 rounded-xl p-6 md:p-8 space-y-6 shadow-md"
                  >
                    <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                      <h3 className="font-[family-name:var(--font-display)] text-xl text-primary flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span>
                          {editingAbstract
                            ? `Edit Series: ${editingAbstract.title}`
                            : "Create New Abstract Series"}
                        </span>
                      </h3>
                      <button
                        onClick={cancelAbstractEdit}
                        className="h-8 w-8 rounded-full border border-primary/20 hover:border-primary text-primary/70 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAbstractSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Series Index / Identifier Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Relief Dust Series 01"
                            value={abstractForm.series}
                            onChange={(e) =>
                              setAbstractForm((prev) => ({ ...prev, series: e.target.value }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Main Display Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Tactile Resonance"
                            value={abstractForm.title}
                            onChange={(e) =>
                              setAbstractForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Year Released
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2026"
                            value={abstractForm.year}
                            onChange={(e) =>
                              setAbstractForm((prev) => ({ ...prev, year: e.target.value }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Physical Medium details
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Italian marble dust, raw iron-oxides, soot on canvas board"
                            value={abstractForm.medium}
                            onChange={(e) =>
                              setAbstractForm((prev) => ({ ...prev, medium: e.target.value }))
                            }
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                            Conceptual Story &amp; Philosophy Notes
                          </label>
                          <textarea
                            placeholder="Describe the aesthetic, raw elements, or visual journey of this abstract..."
                            value={abstractForm.description}
                            onChange={(e) =>
                              setAbstractForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            rows={4}
                            className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        {/* PROJECT PHOTOS SUBFORM */}
                        <div className="md:col-span-2 border border-primary/10 rounded-xl p-5 bg-primary/2 space-y-4">
                          <div className="flex justify-between items-center border-b border-primary/15 pb-2">
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-1.5">
                              <ImageIcon className="h-4 w-4" />
                              <span>
                                Series Perspectives / Photos ({abstractForm.photos.length})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={addPhotoToAbstractForm}
                              className="px-3 py-1.5 bg-primary/10 border border-primary/25 hover:bg-primary/15 text-primary text-[10px] uppercase font-bold rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Perspective</span>
                            </button>
                          </div>

                          {abstractForm.photos.map((photo, index) => (
                            <div
                              key={index}
                              className="p-4 border border-primary/15 rounded-lg bg-background grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative"
                            >
                              <button
                                type="button"
                                onClick={() => removePhotoFromAbstractForm(index)}
                                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded border border-red-500/10 cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              <div className="md:col-span-4 flex flex-col justify-center items-center gap-2 border-2 border-dashed border-primary/10 rounded p-3 h-full">
                                {photo.url ? (
                                  <div className="h-24 w-24 overflow-hidden rounded bg-primary/5 relative group border">
                                    <img
                                      src={photo.url}
                                      alt="Perspective"
                                      className="h-full w-full object-contain bg-primary/5"
                                    />
                                  </div>
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-primary/30" />
                                )}

                                <label className="w-full px-2.5 py-1 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase rounded cursor-pointer text-center">
                                  <span>Upload Local File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleAbstractPhotoUpload(index, e)}
                                    className="hidden"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setMediaSelectorTarget({ type: "abstract", index })
                                  }
                                  className="w-full px-2.5 py-1 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase rounded cursor-pointer text-center text-primary"
                                >
                                  Select from Library
                                </button>
                              </div>

                              <div className="md:col-span-8 space-y-3">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider font-bold text-primary/50 block mb-1">
                                    Or Paste Photo URL
                                  </label>
                                  <input
                                    type="url"
                                    placeholder="https://..."
                                    value={photo.url}
                                    onChange={(e) =>
                                      updateAbstractPhotoInForm(index, "url", e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 text-xs border border-primary/20 bg-background rounded focus:border-primary focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {abstractForm.photos.length === 0 && (
                            <p className="text-center text-xs text-primary/50 italic py-4">
                              No photo perspectives added. Create at least one photo with details
                              below.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-primary/10 pt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelAbstractEdit}
                          className="px-5 py-3 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/5 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {editingAbstract ? "Update Abstract Series" : "Publish Abstract Series"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* CURRENT ABSTRACT SERIES LIST */}
                <div className="bg-card border border-primary/15 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-primary/10 bg-primary/2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-wider font-bold text-primary/70">
                      Active Abstract Series ({processedAbstracts.length} of {abstracts.length})
                    </span>

                    {/* SEARCH & SORT TOOLBAR */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search series..."
                        value={abstractsSearch}
                        onChange={(e) => setAbstractsSearch(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary focus:outline-none focus:border-primary max-w-xs"
                      />

                      {/* Sort dropdown */}
                      <select
                        value={abstractsSort}
                        onChange={(e) =>
                          setAbstractsSort(
                            e.target.value as "default" | "newest" | "oldest" | "alphabetical",
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary font-semibold focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="default">Default Order</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="alphabetical">Title (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-primary/10">
                    {processedAbstracts.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-primary/1 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md overflow-hidden border border-primary/20 shrink-0 bg-primary/5">
                            <img
                              src={p.photos?.[0]?.url || ""}
                              alt={p.title}
                              className="h-full w-full object-contain bg-primary/5"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-[family-name:var(--font-display)] text-lg text-primary leading-tight">
                                {p.title}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                                {p.series}
                              </span>
                            </div>
                            <p className="text-xs text-primary/60 mt-1">
                              Medium: <strong className="text-primary font-bold">{p.medium}</strong>{" "}
                              | Scale:{" "}
                              <strong className="text-primary font-bold">{p.dimensions}</strong>
                            </p>
                            <p className="text-xs text-primary/50 mt-1 font-semibold">
                              Perspectives loaded:{" "}
                              <strong className="text-primary font-bold">
                                {p.photos?.length || 0}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => startEditAbstract(p)}
                            className="p-2 border border-primary/15 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit project details & photos"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteAbstract(p.id, p.title)}
                            className="p-2 border border-red-500/15 text-red-500 hover:text-red-600 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                            title="Delete series"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {abstracts.length === 0 && (
                      <div className="p-8 text-center text-sm text-primary/50">
                        No abstract series published yet. Click "Create Abstract Series" to build
                        your canvas space.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: ARTWORK FOLDER / MEDIA LIBRARY */}
            {activeTab === "media" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                    Artwork Folder (Media Library)
                  </h2>
                  <p className="text-sm opacity-70">
                    Upload and manage downloaded paintings, photos, and assets. Select them
                    instantly when creating or editing artworks in your Gallery.
                  </p>
                </div>

                {/* BULK UPLOAD DROPZONE */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    handleMediaUpload(e);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-300 ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[1.01] shadow-inner"
                      : "border-primary/15 bg-card hover:border-primary/35"
                  }`}
                >
                  {uploadState.isUploading ? (
                    <div className="space-y-4 py-4 w-full max-w-md">
                      <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center border text-primary border-primary/20 mx-auto">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-primary text-base">
                          Processing &amp; Storing Images...
                        </h3>
                        <p className="text-xs text-primary/70 truncate px-4">
                          File {uploadState.current} of {uploadState.total}:{" "}
                          <strong className="font-mono text-primary font-semibold">
                            {uploadState.filename}
                          </strong>
                        </p>
                        <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{ width: `${(uploadState.current / uploadState.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center border text-primary border-primary/20">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-primary text-base">
                          Bulk Upload Artwork Images
                        </h3>
                        <p className="text-xs opacity-75 max-w-lg leading-relaxed">
                          Drag and drop files directly here, or click to browse. Selected images are
                          automatically optimized, compressed, and saved locally in your repository
                          cache.
                        </p>
                      </div>
                      <label className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-95 cursor-pointer transition-all inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Upload Image Files</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMediaUpload}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* MEDIA LIBRARY GRID */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                    <h3 className="font-bold text-primary text-lg">
                      Stored Photos ({mediaLibrary.length})
                    </h3>
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search folder..."
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        className="w-full px-4 py-2 text-xs border border-primary/20 bg-background rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {mediaLibrary
                      .filter((m) => m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                      .map((m) => {
                        const isUsedInWorks = works.some((w) => w.url === m.url);
                        return (
                          <div
                            key={m.id}
                            className="group bg-card border border-primary/10 hover:border-primary/25 rounded-2xl overflow-hidden p-3 transition-all flex flex-col justify-between"
                          >
                            <div className="aspect-square w-full overflow-hidden rounded-xl bg-primary/5 border border-primary/5 relative">
                              <img
                                src={m.url}
                                alt={m.filename}
                                className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="mt-3 space-y-1 text-left">
                              <p
                                className="text-xs font-mono font-bold text-primary truncate"
                                title={m.filename}
                              >
                                {m.filename}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-primary/50">
                                  {new Date(m.addedAt).toLocaleDateString()}
                                </span>
                                {isUsedInWorks ? (
                                  <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                    In Gallery
                                  </span>
                                ) : (
                                  <span className="text-[8px] bg-primary/5 text-primary/40 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Unused
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button
                                onClick={() => {
                                  setWorkForm({
                                    title: m.filename
                                      .replace(/\.[^/.]+$/, "")
                                      .replace(/[_-]/g, " "),
                                    category: "Mural" as Category,
                                    description: "",
                                    url: m.url,
                                    featured: false,
                                  });
                                  setIsAddingWork(true);
                                  setEditingWork(null);
                                  setActiveTab("works");
                                  showToast("Draft loaded with selected photo!");
                                }}
                                className="px-2 py-2 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                title="Publish as new Artwork item"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Publish</span>
                              </button>
                              <button
                                onClick={() => {
                                  triggerConfirm({
                                    title: "Delete Stored Photo",
                                    message: `Are you sure you want to delete "${m.filename}"? This will remove it from your storage folder.`,
                                    confirmText: "Delete",
                                    isDestructive: true,
                                    onConfirm: () => {
                                      storeActions.deleteMedia(m.id);
                                      showToast("Deleted from Artwork Folder.");
                                    },
                                  });
                                }}
                                className="px-2 py-2 border border-red-500/10 hover:border-red-500/20 text-red-500 hover:bg-red-500/5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {mediaLibrary.length === 0 && (
                      <div className="col-span-full py-16 text-center text-sm text-primary/50 bg-primary/2 rounded-2xl border border-dashed border-primary/10">
                        Your artwork folder is currently empty. Drag or select downloaded images to
                        upload!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: BACKUP & SYSTEM INFO */}
            {activeTab === "backup" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                    Backup Operations &amp; Tools
                  </h2>
                  <p className="text-sm opacity-70">
                    Export your custom artwork edits, site properties, and settings to a JSON file,
                    or restore them safely.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* EXPORT SITE DATA */}
                  <div className="border border-primary/15 bg-card rounded-xl p-6 space-y-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border text-primary mb-2">
                      <Download className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-primary text-base">Export Site Data</h3>
                    <p className="text-xs opacity-75 leading-relaxed">
                      Wrote custom artwork uploads or descriptions and want to make sure they are
                      never lost? Save your full dynamic studio data into a `.json` backup file
                      right to your computer.
                    </p>
                    <button
                      onClick={triggerDownloadBackup}
                      className="w-full sm:w-auto px-5 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  {/* IMPORT SITE DATA */}
                  <div className="border border-primary/15 bg-card rounded-xl p-6 space-y-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border text-primary mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-primary text-base">Import Backup File</h3>
                    <p className="text-xs opacity-75 leading-relaxed">
                      Reload custom uploads into another browser or restore your library after a
                      hard cache reset. Load a valid `.json` backup file to instantly override
                      current settings.
                    </p>
                    <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all">
                      <Upload className="h-4 w-4" />
                      <span>Upload JSON File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* EMERGENCY FACTORY RESET */}
                  <div className="md:col-span-2 border-2 border-red-500/20 bg-red-500/2 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <RotateCcw className="h-5 w-5" />
                      <h3 className="font-bold text-base">Emergency Factory Reset</h3>
                    </div>
                    <p className="text-xs opacity-75 leading-relaxed">
                      Want to erase all browser edits, custom uploaded images, or contact changes
                      and return to the hardcoded baseline static site templates? This action cannot
                      be undone. We recommend downloading a backup first!
                    </p>
                    <button
                      onClick={resetStoreToDefaults}
                      className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Wipe State &amp; Reset to Templates</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: CORPORATE CLIENTS */}
            {activeTab === "clients" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-left"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-primary text-4xl mb-1 leading-none">
                      Corporate Clients &amp; Partners
                    </h2>
                    <p className="text-sm opacity-70">
                      Manage trust logos, names, and featured project images displayed in the
                      "Trusted By" homepage band.
                    </p>
                  </div>
                  {!isAddingClient && (
                    <button
                      onClick={() => {
                        setIsAddingClient(true);
                        setEditingClient(null);
                        setClientForm({
                          name: "",
                          logoUrl: "",
                          projectImageUrl: "",
                          order: clients.length + 1,
                          published: true,
                        });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Brand Partner</span>
                    </button>
                  )}
                </div>

                {/* FORM PANEL */}
                {isAddingClient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-2 border-primary/20 bg-primary/2 p-6 rounded-2xl space-y-6"
                  >
                    <div className="border-b border-primary/10 pb-3 flex justify-between items-center">
                      <h3 className="font-semibold text-primary text-lg">
                        {editingClient
                          ? `Edit Brand Partner: ${editingClient.name}`
                          : "Create Brand Partner Profile"}
                      </h3>
                      <button
                        onClick={cancelClientEdit}
                        className="text-xs uppercase tracking-wider text-primary/60 hover:text-primary font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <form
                      onSubmit={handleClientSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                          Client / Brand Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Café de L'Amour — Interior Wall"
                          value={clientForm.name}
                          onChange={(e) =>
                            setClientForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      {/* BRAND LOGO URL + SELECTOR */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                          Brand Logo Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={clientForm.logoUrl}
                            onChange={(e) =>
                              setClientForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                            }
                            className="flex-1 px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors text-xs"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setMediaSelectorTarget({ type: "client-logo" })}
                            className="px-4 bg-primary/10 border border-primary/25 hover:bg-primary/20 rounded-lg text-xs font-semibold text-primary cursor-pointer transition-colors"
                          >
                            Browse
                          </button>
                        </div>
                        {clientForm.logoUrl && (
                          <div className="mt-3 h-16 w-32 border border-primary/10 rounded-lg overflow-hidden bg-primary/2 p-2 flex items-center justify-center">
                            <img
                              src={clientForm.logoUrl}
                              alt="Logo preview"
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>

                      {/* PROJECT IMAGE URL + SELECTOR */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                          Project Case-Study Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={clientForm.projectImageUrl}
                            onChange={(e) =>
                              setClientForm((prev) => ({
                                ...prev,
                                projectImageUrl: e.target.value,
                              }))
                            }
                            className="flex-1 px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors text-xs"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setMediaSelectorTarget({ type: "client-project" })}
                            className="px-4 bg-primary/10 border border-primary/25 hover:bg-primary/20 rounded-lg text-xs font-semibold text-primary cursor-pointer transition-colors"
                          >
                            Browse
                          </button>
                        </div>
                        {clientForm.projectImageUrl && (
                          <div className="mt-3 h-20 w-28 border border-primary/10 rounded-lg overflow-hidden bg-primary/2 p-1 flex items-center justify-center">
                            <img
                              src={clientForm.projectImageUrl}
                              alt="Project preview"
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>

                      {/* SORT ORDER */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                          Display Position Order
                        </label>
                        <input
                          type="number"
                          value={clientForm.order}
                          onChange={(e) =>
                            setClientForm((prev) => ({
                              ...prev,
                              order: parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-full px-4 py-3 border border-primary/20 bg-background rounded-lg focus:border-primary focus:outline-none transition-colors"
                          min="1"
                          required
                        />
                      </div>

                      {/* PUBLISHED TOGGLE */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-primary/60 block mb-2">
                          Status Toggle
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-primary/10 rounded-lg bg-background">
                          <input
                            type="checkbox"
                            checked={clientForm.published}
                            onChange={(e) =>
                              setClientForm((prev) => ({ ...prev, published: e.target.checked }))
                            }
                            className="h-4 w-4 text-primary focus:ring-primary rounded"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-primary block">Published Live</span>
                            <span className="text-primary/70">
                              Show this client and their project case on home page.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* ACTIONS */}
                      <div className="md:col-span-2 pt-4 border-t border-primary/10 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelClientEdit}
                          className="px-5 py-3 border border-primary/20 hover:bg-primary/5 text-primary rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Save className="h-4 w-4" />
                          <span>{editingClient ? "Update Brand" : "Save Brand Partner"}</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* LIST OF CLIENTS */}
                <div className="border border-primary/15 bg-card rounded-2xl overflow-hidden shadow-sm">
                  {/* List Filters */}
                  <div className="p-4 bg-primary/2 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full sm:max-w-xs">
                      <input
                        type="text"
                        placeholder="Search partners..."
                        value={clientsSearch}
                        onChange={(e) => setClientsSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-primary"
                      />
                      <svg
                        className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-primary/40"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Sorting dropdown */}
                    <select
                      value={clientsSort}
                      onChange={(e) => setClientsSort(e.target.value as "order" | "alphabetical")}
                      className="px-3 py-1.5 text-xs bg-background border border-primary/20 rounded-lg text-primary font-semibold focus:outline-none focus:border-primary cursor-pointer self-stretch sm:self-auto"
                    >
                      <option value="order">Sort by Position Order</option>
                      <option value="alphabetical">Sort Alphabetically (A-Z)</option>
                    </select>
                  </div>

                  {/* List items */}
                  <div className="divide-y divide-primary/10">
                    {clients
                      .filter((c) => c.name.toLowerCase().includes(clientsSearch.toLowerCase()))
                      .sort((a, b) => {
                        if (clientsSort === "alphabetical") {
                          return a.name.localeCompare(b.name);
                        }
                        return (a.order || 0) - (b.order || 0);
                      })
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-primary/1 transition-colors"
                        >
                          <div className="flex items-center gap-4 text-left">
                            {/* Logo */}
                            <div className="h-12 w-16 bg-primary/2 border border-primary/10 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                              <img
                                src={c.logoUrl}
                                alt="Client Logo"
                                className="max-h-full max-w-full object-contain bg-background"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {/* Project Image */}
                            <div className="h-12 w-12 bg-primary/2 border border-primary/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                              <img
                                src={c.projectImageUrl}
                                alt="Case project"
                                className="h-full w-full object-contain bg-background"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-[family-name:var(--font-display)] text-lg text-primary leading-tight">
                                  {c.name}
                                </span>
                                {c.published ? (
                                  <span className="text-[8px] bg-green-100 text-green-800 border border-green-200 px-1.5 py-0.5 rounded font-semibold uppercase">
                                    Published
                                  </span>
                                ) : (
                                  <span className="text-[8px] bg-primary/5 text-primary/40 border border-primary/10 px-1.5 py-0.5 rounded font-semibold uppercase">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-primary/60 mt-1">
                                Position Order:{" "}
                                <strong className="text-primary font-bold">{c.order}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-primary/10">
                            <button
                              onClick={() => startEditClient(c)}
                              className="px-3.5 py-1.5 border border-primary/15 hover:border-primary/40 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => deleteClient(c.id, c.name)}
                              className="px-3.5 py-1.5 border border-red-200 hover:border-red-500 hover:bg-red-500/5 text-red-600 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}

                    {clients.length === 0 && (
                      <p className="text-center text-xs text-primary/50 italic py-12">
                        No corporate clients or brands registered. Create one using the form above!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* Universal Media Selector Overlay Modal */}
      <AnimatePresence>
        {mediaSelectorTarget !== null && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border-2 border-primary/25 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setMediaSelectorTarget(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full border border-primary/20 hover:border-primary text-primary/70 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-[family-name:var(--font-display)] text-2xl text-primary mb-2 flex items-center gap-2">
                <Folder className="h-6 w-6 text-primary" />
                <span>Select From Artwork Folder</span>
              </h3>
              <p className="text-xs text-primary/70 mb-6">
                Click on any photo in your media library to instantly select it for this{" "}
                {mediaSelectorTarget.type === "work" ? "artwork" : "abstract perspective"}.
              </p>

              {/* SEARCH FILTER */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search files by name..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 bg-background rounded-lg text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* IMAGES GRID */}
              <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaLibrary
                    .filter((m) => m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                    .map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (mediaSelectorTarget.type === "work") {
                            setWorkForm((prev) => ({ ...prev, url: m.url }));
                          } else if (
                            mediaSelectorTarget.type === "abstract" &&
                            mediaSelectorTarget.index !== undefined
                          ) {
                            updateAbstractPhotoInForm(mediaSelectorTarget.index, "url", m.url);
                          } else if (mediaSelectorTarget.type === "client-logo") {
                            setClientForm((prev) => ({ ...prev, logoUrl: m.url }));
                          } else if (mediaSelectorTarget.type === "client-project") {
                            setClientForm((prev) => ({ ...prev, projectImageUrl: m.url }));
                          }
                          setMediaSelectorTarget(null);
                          showToast(`Selected image: ${m.filename}`);
                        }}
                        className="group flex flex-col text-left border border-primary/10 hover:border-primary/50 bg-background rounded-xl p-2 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden border border-primary/10 bg-primary/2 w-full relative">
                          <img
                            src={m.url}
                            alt={m.filename}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span
                          className="text-[10px] font-mono font-bold mt-2 text-primary/80 block truncate max-w-full"
                          title={m.filename}
                        >
                          {m.filename}
                        </span>
                        <span className="text-[8px] text-primary/50 block font-semibold">
                          Added: {new Date(m.addedAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))}

                  {mediaLibrary.length === 0 && (
                    <div className="col-span-full py-12 text-center text-sm text-primary/50">
                      No images found. Please upload images to the "Artwork Folder" tab first!
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-primary/10 pt-4 mt-4 flex justify-between items-center text-xs">
                <span className="text-primary/60">
                  Total items in library: <strong>{mediaLibrary.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMediaSelectorTarget(null);
                    setActiveTab("media");
                  }}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Manage Artwork Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card border-2 border-primary/20 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="absolute top-4 right-4 text-primary/55 hover:text-primary transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-primary mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-sm opacity-75 leading-relaxed mb-6">{confirmModal.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-primary/15 hover:bg-primary/5 text-primary rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {confirmModal.cancelText || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className={`px-4 py-2 text-white rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    confirmModal.isDestructive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary hover:opacity-90 text-primary-foreground"
                  }`}
                >
                  {confirmModal.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
