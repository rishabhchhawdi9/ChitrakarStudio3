import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EyeOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
  loading?: "lazy" | "eager";
  fallbackText?: string;
}

export function SafeImage({
  src,
  alt,
  className = "",
  referrerPolicy = "no-referrer",
  loading = "lazy",
  fallbackText = "Artwork Surface",
}: SafeImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const cleanSrc = src && !src.includes("/__l5e/") ? src : "";

  // If source is empty, treat as error immediately
  if (!cleanSrc) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-neutral-900 border border-neutral-850 p-4 text-center ${className}`}
      >
        <EyeOff className="h-6 w-6 text-neutral-600 mb-1" />
        <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Fallback shimmer/loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <div className="h-1 w-12 bg-neutral-800 rounded" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800/20 p-4 text-center">
          <EyeOff className="h-5 w-5 text-neutral-700 mb-1" />
          <span className="text-[9px] font-mono tracking-widest text-neutral-600 uppercase">
            {fallbackText}
          </span>
        </div>
      ) : (
        <motion.img
          src={cleanSrc}
          alt={alt}
          loading={loading}
          referrerPolicy={referrerPolicy}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full h-full object-cover ${className}`}
        />
      )}
    </div>
  );
}
