# ChitrakarStudio - Setup & Deployment Guide

## Current Status

Your ChitrakarStudio app is a **Google AI Studio** React application built with:

- **TanStack Start** (full-stack React framework)
- **Vite** (build tool)
- **React 19** with Framer Motion animations
- **TailwindCSS** for styling

The index page (`/src/routes/index.tsx`) is already configured to load when the app opens.

---

## 📁 Project Structure

```
ChitrakarStudio/
├── src/
│   ├── routes/
│   │   ├── __root.tsx        (Root layout - wraps all pages)
│   │   ├── index.tsx         (Homepage - loads at / ✓)
│   │   ├── gallery.tsx       (Gallery page)
│   │   ├── about.tsx         (About page)
│   │   ├── services.tsx      (Services page)
│   │   ├── contact.tsx       (Contact page)
│   │   ├── abstract.tsx      (Abstract art page)
│   │   ├── admin.tsx         (Admin page)
│   │   └── README.md         (Routing docs)
│   ├── components/           (Reusable React components)
│   ├── lib/                  (Utilities, store, studio config)
│   ├── assets/               (Images, icons)
│   ├── styles.css            (Global styles)
│   ├── __root.tsx            (App shell)
│   ├── router.tsx            (Router config)
│   ├── start.ts              (Server middleware)
│   └── server.ts             (SSR error handling)
├── public/                   (Static assets)
├── dist/                     (Build output - generated)
├── vite.config.ts            (Vite configuration ✓ Updated)
├── tsconfig.json             (TypeScript config)
├── package.json              (Dependencies)
└── README.md                 (Project readme)
```

---

## ✅ What's Already Configured

1. **Index Page** - Your homepage is set at `src/routes/index.tsx`
2. **Vite Config** - Updated to build to `dist` folder with proper entry points
3. **File-Based Routing** - TanStack Router automatically routes based on file names
4. **Responsive Design** - All pages are mobile-friendly

---

## 🚀 Steps to Run Your App Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/rishabhchhawdi9/ChitrakarStudio.git
cd ChitrakarStudio
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Environment Variables (if needed)

Create a `.env.local` file in the root directory:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

### Step 4: Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or another port if 5173 is in use).

**The index page will automatically load when you open the link!** ✓

---

## 🏗️ Build for Production

### Build the Project

```bash
npm run build
```

This generates a production-ready build in the `dist/` folder.

### Preview the Build Locally

```bash
npm run preview
```

This serves the production build locally so you can test it.

---

## 📂 Folder Structure Summary

| Folder/File       | Purpose                        |
| ----------------- | ------------------------------ |
| `src/routes/`     | Route components (auto-routed) |
| `src/components/` | Reusable UI components         |
| `src/lib/`        | Utilities, data store, config  |
| `src/assets/`     | Images and static files        |
| `public/`         | Static assets served as-is     |
| `dist/`           | Production build output        |
| `vite.config.ts`  | Build configuration ✓          |
| `tsconfig.json`   | TypeScript settings            |
| `package.json`    | Dependencies & scripts         |

---

## 🔗 Available Routes

| Route       | File           | Purpose                           |
| ----------- | -------------- | --------------------------------- |
| `/`         | `index.tsx`    | **Homepage** (loads by default) ✓ |
| `/gallery`  | `gallery.tsx`  | Gallery of works                  |
| `/about`    | `about.tsx`    | About the studio                  |
| `/services` | `services.tsx` | Services offered                  |
| `/contact`  | `contact.tsx`  | Contact form                      |
| `/abstract` | `abstract.tsx` | Abstract art collection           |
| `/admin`    | `admin.tsx`    | Admin dashboard                   |

---

## 💻 Useful npm Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run deploy       # Build and prepare for deployment
```

---

## 📝 Key Configuration Files Updated

### vite.config.ts ✓ Updated

```typescript
- Configured output directory to 'dist'
- Added rollupOptions for proper SPA entry
- Ensures index page loads on app start
```

### vite.config.ts Details

```typescript
vite: {
  build: {
    outDir: 'dist',           // Output folder
    emptyOutDir: true,        // Clear before build
  }
}
```

---

## 🎯 How the Index Page Loads

1. **TanStack Router** (file-based routing) automatically creates routes
2. **`src/routes/index.tsx`** = `/` (root path)
3. When user visits `https://yourdomain.com/`, the index page loads immediately ✓
4. **No additional configuration needed!**

---

## 📱 Responsive Features

Your index page includes:

- Hero section with animations
- Featured work gallery
- Abstract art teaser
- Testimonials section
- Call-to-action buttons
- Mobile-optimized layout

All responsive and ready to use!

---

## 🔧 Troubleshooting

### Issue: Port 5173 is already in use

**Solution:**

```bash
npm run dev -- --port 3000
```

### Issue: Module not found errors

**Solution:**

```bash
npm install
npm run dev
```

### Issue: Vite cache issues

**Solution:**

```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 📖 Next Steps

1. ✅ **Run locally** - `npm run dev`
2. ✅ **Customize content** - Edit `src/lib/studio.ts` for studio info
3. ✅ **Add your data** - Update `src/lib/works.ts` with your work
4. ✅ **Update components** - Modify files in `src/components/`
5. ✅ **Build for production** - `npm run build`

---

## 🎨 Customization Tips

### Update Studio Info

File: `src/lib/studio.ts`

```typescript
export const STUDIO = {
  name: "Chitrakar Studio",
  artist: "Tarun",
  city: "Faridabad",
  // ... more settings
};
```

### Add More Routes

1. Create new file in `src/routes/` (e.g., `newpage.tsx`)
2. Export a route component
3. It automatically becomes a route!

Example:

```typescript
// src/routes/newpage.tsx
export const Route = createFileRoute('/newpage')({
  component: () => <div>New Page Content</div>,
});
```

---

## 📞 Support

For issues with:

- **TanStack Start**: https://tanstack.com/start/latest
- **Vite**: https://vitejs.dev/
- **React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/

---

## ✨ Your App is Ready!

**Everything is configured to automatically load the index page when the app opens.**

Just run:

```bash
npm run dev
```

And visit the provided URL. Your homepage will load immediately! 🎉
