export async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export async function loadWithFallbacks(urls = []) {
  let lastErr;
  for (const u of urls) {
    try {
      return await fetchJSON(u);
    } catch (e) {
      lastErr = e;
      console.warn("[unified] fallback failed:", u, e?.message || e);
    }
  }
  throw lastErr || new Error("No manifest sources succeeded.");
}

export function normalizePortfolioManifest(raw) {
  if (!raw) return { version: "1.0", items: [] };

  const sourceItems = raw.items || raw.events || raw.entries || [];
  const items = sourceItems.map((it, i) => {
    const id = it.id || it.slug || it.uid || `item-${i}`;
    const title = it.title || it.name || it.headline || "";
    const folderPath = cleanPath(it.folderPath || it.folder || it.path || it.source || "");
    const coverImage = it.coverImage || it.cover || it.heroImage || it.thumbnail || null;
    const typeCandidate = it.type || it.category || inferTypeFromPath(folderPath) || "portfolio";
    const { type, label: typeLabel } = normalizeType(typeCandidate, folderPath);
    const tags = normalizeTags(it.tags || it.keywords || it.topics || []);
    const location = normalizeLocation(it.location, it);
    const credits = normalizeCredits(it.credits, it);
    const { date, dateISO, dateDisplay } = normalizeDate(it);
    const images = normalizeImages(it, coverImage, title);

    return {
      id,
      title,
      folderPath,
      coverImage,
      type,
      typeLabel,
      tags,
      location,
      credits,
      images,
      date,
      dateISO,
      dateDisplay
    };
  });

  const generatedAt = raw.generatedAt || raw.generated || raw.updatedAt || new Date().toISOString();
  const version = raw.version ? String(raw.version) : "1.0";

  return { version, generatedAt, items };
}

export function filterByType(data, type) {
  if (!type || type === "all") return data.items || [];
  const desired = canonicalizeType(type);
  return (data.items || []).filter(x => canonicalizeType(x.type) === desired);
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags)
    .split(/[,|]/)
    .map(part => part.trim())
    .filter(Boolean);
}

function normalizeLocation(location, fallback = {}) {
  if (location && typeof location === "object") {
    return {
      city: location.city || fallback.city || null,
      venue: location.venue || fallback.venue || null,
      country: location.country || fallback.country || null,
      region: location.region || location.state || fallback.state || null
    };
  }

  return {
    city: fallback.city || null,
    venue: fallback.venue || null,
    country: fallback.country || null,
    region: fallback.state || null
  };
}

function normalizeCredits(credits, fallback = {}) {
  const normalized = credits && typeof credits === "object" ? { ...credits } : {};
  if (!normalized.photographer) {
    normalized.photographer = fallback.photographer || fallback.author || "McCal";
  }
  if (!normalized.editor && fallback.editor) normalized.editor = fallback.editor;
  if (!normalized.agency && fallback.agency) normalized.agency = fallback.agency;
  return normalized;
}

function normalizeDate(entry) {
  const rawCandidate = entry.date ?? entry.eventDate ?? entry.published ?? entry.releaseDate ?? entry.dateISO ?? entry.datetime ?? null;
  let dateISO = null;
  let dateDisplay = entry.dateDisplay || entry.displayDate || entry.dateText || entry.prettyDate || "";

  if (typeof rawCandidate === "string" && rawCandidate.trim()) {
    dateISO = rawCandidate.trim();
  } else if (rawCandidate && typeof rawCandidate === "object") {
    if (rawCandidate.iso) dateISO = rawCandidate.iso;
    else if (rawCandidate.value) dateISO = rawCandidate.value;
    else if (rawCandidate.date) dateISO = rawCandidate.date;
    else if (rawCandidate.utc) dateISO = rawCandidate.utc;
    else if (rawCandidate.timestamp) dateISO = rawCandidate.timestamp;

    if (!dateISO && rawCandidate.year && rawCandidate.month) {
      const day = rawCandidate.day || 1;
      dateISO = `${rawCandidate.year}-${String(rawCandidate.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    if (!dateDisplay) {
      const parts = [rawCandidate.monthName, rawCandidate.year].filter(Boolean);
      if (parts.length) {
        dateDisplay = parts.join(" ");
      }
    }
  }

  let parsedDate = null;
  if (dateISO) {
    const normalizedISO = dateISO.replace(/\//g, "-");
    const parsed = Date.parse(normalizedISO);
    if (!Number.isNaN(parsed)) {
      parsedDate = new Date(parsed);
      if (!dateDisplay) {
        const hasDay = /\d{1,2}$/.test(normalizedISO.replace(/[^0-9]/g, ""));
        const options = { year: "numeric", month: "long", ...(hasDay ? { day: "numeric" } : {}) };
        try {
          dateDisplay = parsedDate.toLocaleDateString(undefined, options);
        } catch {
          dateDisplay = normalizedISO;
        }
      }
    }
  }

  if (!dateDisplay) dateDisplay = "";

  return {
    date: dateISO || (parsedDate ? parsedDate.toISOString() : dateDisplay || null),
    dateISO: dateISO || (parsedDate ? parsedDate.toISOString() : null),
    dateDisplay
  };
}

function normalizeImages(entry, coverImage, title) {
  const rawImages = Array.isArray(entry.images)
    ? entry.images
    : Array.isArray(entry.photos)
      ? entry.photos
      : Array.isArray(entry.media)
        ? entry.media
        : Array.isArray(entry.gallery)
          ? entry.gallery
          : [];

  const images = rawImages
    .map(img => {
      if (!img) return null;
      if (typeof img === "string") {
        return {
          src: img,
          thumb: img,
          fileName: img,
          alt: title || ""
        };
      }

      const src = img.src || img.url || img.path || img.file || img.filename || null;
      const thumb = img.thumb || img.thumbnail || img.preview || src;
      const w = img.w ?? img.width ?? null;
      const h = img.h ?? img.height ?? null;
      const alt = img.alt || img.caption || img.title || title || "";
      return {
        src,
        thumb,
        w,
        h,
        alt,
        caption: img.caption || img.title || "",
        credit: img.credit || "",
        exif: img.exif || null,
        fileName: img.file || img.filename || null
      };
    })
    .filter(Boolean);

  if (!images.length && coverImage) {
    images.push({
      src: coverImage,
      thumb: coverImage,
      fileName: coverImage,
      alt: title || ""
    });
  }

  return images;
}

function cleanPath(p) {
  if (!p) return "";
  return String(p).replace(/\\+/g, "/").replace(/^\/+/, "").trim();
}

function normalizeType(value, fallbackPath) {
  const candidate = Array.isArray(value) ? value[0] : value;
  let label = "";
  if (typeof candidate === "string") {
    label = candidate.trim();
  }

  const inferred = inferTypeFromPath(fallbackPath);
  const canonical = canonicalizeType(label || inferred);

  if (!label && canonical) {
    label = canonical.charAt(0).toUpperCase() + canonical.slice(1);
  }

  return { type: canonical || "portfolio", label };
}

function canonicalizeType(value) {
  if (!value) return "portfolio";
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return "portfolio";

  if (["concert", "concerts", "music", "music photography"].includes(normalized)) return "concert";
  if (["event", "events", "event photography", "corporate", "events photography"].includes(normalized)) return "event";
  if (["journalism", "photojournalism", "photo journalism", "documentary"].includes(normalized)) return "journalism";
  if (["portfolio", "work", "projects"].includes(normalized)) return "portfolio";

  return normalized;
}

function inferTypeFromPath(p) {
  const s = (p || "").toLowerCase();
  if (s.includes("concert")) return "concert";
  if (s.includes("event")) return "event";
  if (s.includes("journalism") || s.includes("photo")) return "journalism";
  return "portfolio";
}
