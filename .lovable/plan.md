## Plan — Chitrakar Finearts v2

Goal: Split the current single page into real routes, plug in Tarun's actual details, add a working email contact form, make the gallery filterable, and elevate the visual craft.

### 1. Real content everywhere

- Studio: **Chitrakar Finearts** · Artist/Founder: **Tarun Sharma** · Based in **Faridabad, India**
- Contact: **+91 87449 07920** · **chitrakar.artwork@gmail.com**
- Socials: Instagram [@chitrakar_finearts](https://www.instagram.com/chitrakar_finearts/) · Pinterest [chitrakarartwork](https://in.pinterest.com/chitrakarartwork/_created/)
- Replace all placeholder emails/handles across nav, hero, about, contact, footer, and meta tags.

### 2. Route architecture (separate pages, each SEO-ready)

```
src/routes/
  __root.tsx      shared nav + footer + brand meta
  index.tsx       landing: hero, featured 6 works, teaser strips
  gallery.tsx     full filterable grid (all 20 works)
  about.tsx       Tarun's story, portrait, timeline, press
  services.tsx    services + process + pricing
  contact.tsx     contact form + details
```

Each route gets its own `head()` with unique title / description / og tags. Nav updates to real `<Link>` routes (no more `#anchors`).

### 3. Filterable gallery

- Tag every image with a category: Mural / Wall Art / Canvas / Interior / Portrait / Commercial
- Filter chips at the top; masonry re-lays out on change
- Click a work → lightbox with title, category, caption

### 4. Contact form (email-only, no database)

- Fields: name, email, phone (optional), project type, message
- Zod validation client-side, max lengths, trimmed inputs
- Submit opens the user's mail client via a pre-filled `mailto:chitrakar.artwork@gmail.com` (zero backend, matches "Email only" choice). Also show phone/WhatsApp button and social links alongside.

### 5. New sections

- **Process** (on Services): 4 steps — Enquiry → Concept sketch → On-site painting → Reveal
- **Pricing / Packages**: 3 tiers — Wall Accent, Full Mural, Commercial Interior — each with "starting from / on request"
- **Testimonials**: 3–4 client quote cards on landing + services
- **Press / Features**: logo strip + short mentions on About

### 6. Artistic redesign (keep paper + red-ink direction, push craft)

- Textured paper background with subtle grain overlay
- Torn-paper section dividers, tape accents on portraits
- Hand-drawn arrow / underline SVGs pointing at CTAs
- Marquee strip of studio words ("murals · walls · stories · faridabad")
- Hover: images tilt slightly + reveal handwritten label
- Framer-motion for hero entrance, scroll-reveal on gallery tiles, page transitions
- Refined type scale (Permanent Marker only for headlines/accents, Rubik for everything else — currently overused)

### 7. SEO + polish

- Unique `head()` per route (title, description, og:title/description, og:image drawn from a hero artwork on each leaf route)
- JSON-LD `LocalBusiness` on contact page (name, phone, city Faridabad, sameAs socials)
- Alt text on every artwork referencing category + studio
- Favicon + og image derived from a signature piece

### Technical notes

- `bun add framer-motion` for animation
- Zod for form validation
- No backend / Cloud needed — mailto keeps it zero-infra
- New route files register automatically via the router plugin (don't touch `routeTree.gen.ts`)

### Out of scope (ask later)

- Blog / journal
- Real-time inquiry dashboard (would need Cloud)
- Multi-language
