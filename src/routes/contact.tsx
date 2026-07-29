import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { STUDIO } from "../lib/studio";
import { heroImage } from "../lib/works";

type ContactSearch = {
  subject?: string;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    return {
      subject: search.subject ? String(search.subject) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: `Contact — ${STUDIO.name}` },
      {
        name: "description",
        content: `Commission a mural, wall art or canvas from ${STUDIO.artist}. Based in ${STUDIO.city}, painting across India.`,
      },
      { property: "og:title", content: `Contact — ${STUDIO.name}` },
      {
        property: "og:description",
        content: `Reach ${STUDIO.artist} to plan your mural, wall art or canvas commission.`,
      },
      { property: "og:image", content: heroImage },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: STUDIO.name,
          founder: STUDIO.artist,
          telephone: STUDIO.phoneRaw,
          email: STUDIO.email,
          address: { "@type": "PostalAddress", addressLocality: "Faridabad", addressCountry: "IN" },
          sameAs: [STUDIO.instagram, STUDIO.pinterest],
        }),
      },
    ],
  }),
  component: ContactPage,
});

const projectTypes = [
  "Mural",
  "Wall Art",
  "Restaurant / Interior",
  "Canvas / Portrait",
  "Commercial",
  "Other",
] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Please share your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  projectType: z.enum(projectTypes),
  message: z.string().trim().min(10, "Tell us a little about your space").max(2000),
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  projectType: (typeof projectTypes)[number];
  message: string;
};

const initial: FormState = { name: "", email: "", phone: "", projectType: "Mural", message: "" };

function ContactPage() {
  const search = Route.useSearch();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (search.subject) {
      setForm((f) => ({
        ...f,
        projectType: "Canvas / Portrait",
        message: `Hi Tarun,\n\nI am writing to inquire about the abstract series: "${search.subject}". Please share more details regarding availability, pricing, and shipping for this artwork.\n\nThank you!`,
      }));
    }
  }, [search.subject]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as keyof FormState] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      `Project: ${form.projectType}`,
      "",
      form.message,
    ]
      .filter(Boolean)
      .join("\n");
    const url = `mailto:${STUDIO.email}?subject=${encodeURIComponent(`New enquiry — ${form.projectType} (${form.name})`)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setSent(true);
  }

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4">Get In Touch</p>
        <h1 className="font-[family-name:var(--font-display)] text-primary text-6xl md:text-9xl -rotate-1 leading-[0.9]">
          Let's work together
        </h1>

        <div className="mt-14 grid md:grid-cols-12 gap-10">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={onSubmit}
            className="md:col-span-7 space-y-5 p-8 rounded-2xl border-2 border-primary/25 bg-card"
          >
            <Field label="Your name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={100}
                className={inputCls}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={200}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone (optional)" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  maxLength={30}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Project type" error={errors.projectType}>
              <select
                value={form.projectType}
                onChange={(e) => update("projectType", e.target.value as FormState["projectType"])}
                className={inputCls}
              >
                {projectTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tell me about your space" error={errors.message}>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                maxLength={2000}
                rows={6}
                className={inputCls}
              />
            </Field>
            <button
              type="submit"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-[0.25em] hover:scale-105 transition-transform"
            >
              Send enquiry
            </button>
            {sent && (
              <p className="text-sm opacity-80">
                Your email client should have opened. If not, email{" "}
                <a className="underline" href={`mailto:${STUDIO.email}`}>
                  {STUDIO.email}
                </a>{" "}
                directly.
              </p>
            )}
          </motion.form>

          <aside className="md:col-span-5 space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-3">Studio</p>
              <p className="text-lg">{STUDIO.name}</p>
              <p className="text-sm opacity-80">
                {STUDIO.artist} · {STUDIO.city}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-3">Direct</p>
              <ul className="space-y-2 text-base">
                <li>
                  <a href={`mailto:${STUDIO.email}`} className="hover:opacity-70 break-all">
                    {STUDIO.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${STUDIO.phoneRaw}`} className="hover:opacity-70">
                    {STUDIO.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${STUDIO.phoneRaw.replace("+", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-70"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-3">Follow</p>
              <ul className="space-y-2 text-base">
                <li>
                  <a
                    href={STUDIO.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-70"
                  >
                    Instagram · {STUDIO.instagramHandle}
                  </a>
                </li>
                <li>
                  <a
                    href={STUDIO.pinterest}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-70"
                  >
                    Pinterest · {STUDIO.pinterestHandle}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg border-2 border-primary/25 bg-background focus:outline-none focus:border-primary text-base";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.25em] text-primary/70 mb-2">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-destructive">{error}</span>}
    </label>
  );
}
