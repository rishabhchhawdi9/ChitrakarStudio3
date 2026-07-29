import { createServerFn } from "@tanstack/react-start";

export type PinterestPin = {
  id: string;
  title: string;
  url: string;
  image: string;
  caption: string;
  pubDate: string;
};

// Helper to extract content inside XML tags
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

// Helper to unescape HTML entities
function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Parse RSS XML text into PinterestPin objects
export function parsePinterestRss(xmlText: string): PinterestPin[] {
  const pins: PinterestPin[] = [];
  const items = xmlText.split("<item>");

  // Skip index 0 as it's the feed header, parse the rest
  for (let i = 1; i < items.length; i++) {
    const itemXml = items[i];

    const title = extractTag(itemXml, "title").trim();
    const link = extractTag(itemXml, "link").trim();
    const description = extractTag(itemXml, "description").trim();
    const pubDate = extractTag(itemXml, "pubDate").trim();
    const guid = extractTag(itemXml, "guid").trim();

    // Extract image URL from the description
    let image = "";
    const imgRegex = /src=(?:&quot;|"|')([^&"']+)/i;
    const imgMatch = description.match(imgRegex);
    if (imgMatch) {
      image = imgMatch[1];
      // Upgrade resolution from 236x (thumbnail) to 736x (large presentation size)
      image = image.replace("/236x/", "/736x/");
    }

    // Extract caption text by removing any links/images at the start of description
    let caption = description;
    caption = caption.replace(/<a[\s\S]*?<\/a>/gi, "");
    caption = caption.replace(/<[^>]*>/g, "");
    caption = unescapeHtml(caption).trim();

    const idMatch = link.match(/\/pin\/(\d+)/);
    const id = idMatch ? idMatch[1] : guid || `pin-${i}`;

    if (image) {
      // Use clean title if available, fallback to caption or generic name
      let cleanTitle = title;
      if (!cleanTitle || cleanTitle.length < 3) {
        cleanTitle = caption.substring(0, 40);
        if (caption.length > 40) cleanTitle += "...";
      }

      pins.push({
        id,
        title: cleanTitle || "Mural Artwork",
        url: link,
        image,
        caption: caption || title || "Custom commissioned mural artwork by Chitrakar Finearts.",
        pubDate,
      });
    }
  }

  return pins;
}

// Server Function to fetch Pinterest feed securely (bypass CORS)
export const getPinterestFeed = createServerFn({ method: "GET" }).handler(async () => {
  const feedUrl = "https://www.pinterest.com/chitrakarartwork/feed.rss";
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Pinterest feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const pins = parsePinterestRss(xmlText);
    return { success: true, pins };
  } catch (error) {
    console.error("Error fetching Pinterest feed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      pins: [],
    };
  }
});
