(function () {
  "use strict";

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) =>
    Array.from(ctx.querySelectorAll(selector));

  const debounce = (fn, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const AuthorDocParser = {
    parseAuthorMetadata: function (html) {
      const metadata = {
        author: "Unknown Author",
        avatar: "/images/authors/default.jpg",
        bio: "",
      };
      const metaRegex = /---\s*([\s\S]*?)\s*---/;
      const match = String(html).match(metaRegex);
      if (match) {
        const metaBlock = match[1];
        const lines = metaBlock.split("\n");
        lines.forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (!key || valueParts.length === 0) return;
          const value = valueParts.join(":").trim();
          const cleanKey = key.trim().toUpperCase();
          switch (cleanKey) {
            case "AUTHOR":
              metadata.author = value;
              break;
            case "AVATAR":
              metadata.avatar = value;
              break;
            case "BIO":
              metadata.bio = value;
              break;
          }
        });
        html = String(html).replace(metaRegex, "");
        return { metadata, content: html };
      }
      const lines = String(html).split(/\r?\n/).slice(0, 12);
      let found = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) break;
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;
        const key = line.substring(0, colonIndex).trim().toUpperCase();
        const value = line.substring(colonIndex + 1).trim();
        if (!value) continue;
        found = true;
        switch (key) {
          case "AUTHOR":
            metadata.author = value;
            break;
          case "AVATAR":
            metadata.avatar = value;
            break;
          case "BIO":
            metadata.bio = value;
            break;
        }
      }
      if (found) {
        const contentLines = String(html).split(/\r?\n/);
        let idx = 0;
        while (idx < contentLines.length) {
          if (!contentLines[idx].trim()) {
            idx++;
            break;
          }
          if (contentLines[idx].includes(":")) {
            idx++;
            continue;
          }
          break;
        }
        const remaining = contentLines.slice(idx).join("\n");
        return { metadata, content: remaining };
      }
      return { metadata, content: html };
    },

    splitIntoPosts: function (html) {
      const posts = [];
      const postMarkerRegex = /POST:\s*([^\n]+)/gi;
      const matches = [];
      let match;
      while ((match = postMarkerRegex.exec(html)) !== null) {
        matches.push({
          index: match.index,
          title: match[1].trim(),
          fullMatch: match[0],
        });
      }
      if (matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
          const start = matches[i].index;
          const end =
            i < matches.length - 1 ? matches[i + 1].index : html.length;
          let postContent = html.substring(start, end);
          postContent = postContent.replace(matches[i].fullMatch, "");
          posts.push({ title: matches[i].title, content: postContent.trim() });
        }
      } else {
        const sections = html.split(/\n\s*---\s*\n|\n\s*\n\s*\n\s*\n/);
        sections.forEach((section) => {
          const trimmed = section.trim();
          if (trimmed.length > 100) {
            posts.push({ title: null, content: trimmed });
          }
        });
      }
      return posts;
    },

    parsePostMetadata: function (content) {
      // Remove any stray author-level metadata lines that may have leaked
      // into post sections (e.g., "Author:", "Avatar:", "BIO:")
      content = content
        .split("\n")
        .filter((line) => !/^\s*(author|avatar|bio)\s*:/i.test(line))
        .map((line) => {
          // Strip common Google Docs export artifacts and odd tokens observed in the screenshot
          return line
            .replace(/\b(enacteduf|wordt2|_cl|Amer|kus)\b/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim();
        })
        .join("\n")
        .replace(/\n{3,}/g, "\n\n");

      const metadata = {
        date: new Date().toISOString().split("T")[0],
        category: "Uncategorized",
        tags: [],
        image: "/images/blog/default.jpg",
        excerpt: "",
        sources: null,
      };
      const lines = content.split("\n");
      let metadataEndIndex = 0;
      let sourcesStartIndex = -1;
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#")) break;
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        switch (key) {
          case "date":
            metadata.date = this.normalizeDate(value);
            metadataEndIndex = i + 1;
            break;
          case "category":
            metadata.category = value;
            metadataEndIndex = i + 1;
            break;
          case "tags":
            metadata.tags = value.split(",").map((t) => t.trim());
            metadataEndIndex = i + 1;
            break;
          case "image":
            metadata.image = value;
            metadataEndIndex = i + 1;
            break;
          case "excerpt":
            metadata.excerpt = value;
            metadataEndIndex = i + 1;
            break;
        }
      }
      if (metadataEndIndex > 0) {
        const contentLines = lines.slice(metadataEndIndex);
        content = contentLines.join("\n").trim();
      }

      // Detect a Sources/References section at the end of the content
      // Supported headings: "Sources:", "References:", "Works Cited:", "Bibliography:"
      const sourcesHeadingRegex =
        /^(sources|references|works\s+cited|bibliography)\s*:\s*$/i;
      const contentLinesAll = content.split("\n");
      for (let i = contentLinesAll.length - 1; i >= 0; i--) {
        const line = contentLinesAll[i].trim();
        if (!line) continue;
        if (sourcesHeadingRegex.test(line)) {
          sourcesStartIndex = i;
          break;
        }
      }
      if (sourcesStartIndex !== -1) {
        const sourcesLines = contentLinesAll
          .slice(sourcesStartIndex + 1)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        if (sourcesLines.length > 0) {
          metadata.sources = sourcesLines;
          content = contentLinesAll
            .slice(0, sourcesStartIndex)
            .join("\n")
            .trim();
        }
      }
      return { metadata, content };
    },

    normalizeDate: function (dateStr) {
      if (!dateStr) return new Date().toISOString().split("T")[0];
      const s = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      if (/^\d{4}[\/.\s]\d{1,2}[\/.\s]\d{1,2}$/.test(s)) {
        const parts = s.split(/[^\d]+/);
        const [y, m, d] = parts.map(Number);
        return `${String(y).padStart(4, "0")}-${String(m).padStart(
          2,
          "0"
        )}-${String(d).padStart(2, "0")}`;
      }
      const m3 = s.match(/^(\d{1,2})[-\/–](\d{1,2})[-\/–](\d{2,4})$/);
      if (m3) {
        let a = Number(m3[1]);
        let b = Number(m3[2]);
        let y = Number(m3[3]);
        if (y < 100) y += y < 50 ? 2000 : 1900;
        let month, day;
        if (a >= 1 && a <= 12) {
          month = a;
          day = b;
        } else {
          month = b;
          day = a;
        }
        return `${String(y).padStart(4, "0")}-${String(month).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
      }
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
      return new Date().toISOString().split("T")[0];
    },

    cleanHTML: function (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      $$("[class]", doc).forEach((el) => el.removeAttribute("class"));
      $$("[id]", doc).forEach((el) => el.removeAttribute("id"));
      $$("[style]", doc).forEach((el) => el.removeAttribute("style"));
      $$("span:empty, p:empty", doc).forEach((el) => el.remove());
      return doc.body.innerHTML;
    },

    estimateReadTime: function (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent || "";
      const words = text.split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      return `${minutes} min read`;
    },

    fetchAuthorDoc: async function (url) {
      // Build candidate list: prefer /pub, then /export?format=html, then inferred from doc id
      const makeCandidates = (u) => {
        const list = [];
        try {
          const parsed = new URL(u);
          const path = parsed.pathname;
          const isPub =
            /\/pub$/.test(path) || parsed.searchParams.has("embedded");
          const isExport =
            /\/export$/.test(path) ||
            parsed.searchParams.get("format") === "html";
          if (isPub) list.push(u);
          if (isExport) {
            // try pub first if not already included
            const pubCandidate = u.replace(
              /\/export\?format=html.*/i,
              "/pub?embedded=true"
            );
            if (!isPub) list.push(pubCandidate);
            list.push(u);
          }
          if (!isPub && !isExport) {
            const m = path.match(/\/document\/d\/e\/([^/]+)/);
            if (m && m[1]) {
              const base = `${parsed.origin}/document/d/e/${m[1]}`;
              list.push(`${base}/pub?embedded=true`);
              list.push(`${base}/export?format=html`);
            } else {
              list.push(
                u.endsWith("/pub") ? u : u.replace(/\/?$/, "/pub?embedded=true")
              );
            }
          }
        } catch (_) {
          list.push(u);
        }
        return [...new Set(list)];
      };

      const candidates = makeCandidates(url);
      let lastError = null;
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        try {
          console.log(
            `[BlogWidget] Trying URL candidate ${i + 1}/${
              candidates.length
            }: ${candidate}`
          );
          const response = await fetch(candidate, {
            mode: "cors",
            credentials: "omit",
            cache: "default",
          });
          if (!response.ok) {
            console.error(
              `[BlogWidget] HTTP ${response.status} for ${candidate}`
            );
            lastError = new Error(`HTTP ${response.status}`);
            if (response.status === 404) continue; // try next
            throw lastError;
          }
          const html = await response.text();
          console.log(
            `[BlogWidget] Fetched ${html.length} bytes from ${candidate}`
          );
          if (!html || html.length < 100) {
            console.warn(
              `[BlogWidget] Response too short (${html.length} bytes) from ${candidate}`
            );
            lastError = new Error("Short response");
            continue;
          }
          const lowered = html.toLowerCase();
          if (
            lowered.includes("sign in") ||
            lowered.includes("you need permission") ||
            lowered.includes("access denied") ||
            lowered.includes("<form action=")
          ) {
            console.error(
              `[BlogWidget] Likely permission/sign-in HTML returned for ${candidate}`
            );
            lastError = new Error("Restricted or unpublished");
            continue;
          }
          const parsed = new DOMParser().parseFromString(html, "text/html");
          const cloned = parsed.cloneNode(true);
          // Aggressive sanitizer: drop script/style and known Google Docs boilerplate nodes
          cloned
            .querySelectorAll("script, style, link, noscript")
            .forEach((el) => el.remove());
          // Remove inline blocks that often carry Google injected data
          cloned
            .querySelectorAll("[data-sanitize], meta, iframe")
            .forEach((el) => el.remove());
          cloned.querySelectorAll("hr").forEach((hr) => {
            const marker = parsed.createTextNode("\n---\n");
            hr.parentNode.replaceChild(marker, hr);
          });
          cloned.querySelectorAll("br").forEach((br) => {
            br.parentNode.replaceChild(parsed.createTextNode("\n"), br);
          });
          let textOnly =
            (cloned.body && cloned.body.textContent) ||
            parsed.body.textContent ||
            html;
          // Strip well-known Google Docs injected markers and minified code fragments observed in pub pages
          const garbagePatterns = [
            /DOCS_installLinkReferrerSanitizer[\s\S]*?Google Inc\./g,
            /WIZ_global_data[\s\S]*?;\s*DOCS_timing/g,
            /this\._pubi[\s\S]*?DOCS_initPublishImpressionTracker[\s\S]*?;/g,
            /\/\*\s*Copyright The Closure Library Authors[\s\S]*?\*\//g,
          ];
          garbagePatterns.forEach((re) => {
            try {
              textOnly = textOnly.replace(re, "\n");
            } catch (_) {}
          });
          // Also remove any extremely long single lines (likely code) to prevent modal noise
          textOnly = textOnly
            .split("\n")
            .filter(
              (line) =>
                line.length < 5000 &&
                !/^\s*var\s+/.test(line) &&
                !/^\s*function\s+/.test(line)
            )
            .join("\n");
          const normalizedText = String(textOnly).replace(/\r\n/g, "\n").trim();
          const { metadata: authorMeta, content: authorContent } =
            this.parseAuthorMetadata(normalizedText);
          const postSections = this.splitIntoPosts(authorContent);
          console.log(
            `[BlogWidget] Found ${postSections.length} post sections in author doc`
          );
          const posts = [];
          for (const section of postSections) {
            const { metadata: postMeta, content: postContent } =
              this.parsePostMetadata(section.content);
            let title = section.title;
            let postBodyText = postContent || "";
            if (!title) {
              const firstLine =
                postBodyText.split("\n").find((l) => l.trim().length > 0) ||
                "Untitled Post";
              title = truncate(firstLine.trim(), 80);
              const idx = postBodyText.indexOf(firstLine);
              if (idx === 0)
                postBodyText = postBodyText.slice(firstLine.length).trim();
            }
            // Clean up title: remove leftover markers, excessive whitespace, and overly long raw text
            title = String(title)
              .replace(/^\s*POST:\s*/i, "")
              .replace(/\s+/g, " ")
              .trim();
            if (title.length > 120) title = truncate(title, 120);
            const paragraphs = postBodyText
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean);
            const escapeHtml = (s) =>
              s.replace(
                /[&<>"]/g,
                (c) =>
                  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
              );
            const finalContent =
              paragraphs.length > 0
                ? paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
                : `<p>${escapeHtml(postBodyText)}</p>`;
            if (!postMeta.excerpt) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(finalContent, "text/html");
              const firstP = doc.querySelector("p");
              postMeta.excerpt = firstP
                ? truncate(firstP.textContent.trim(), 150)
                : "";
            }
            const postId = `${authorMeta.author
              .toLowerCase()
              .replace(/\s+/g, "-")}-${Date.now()}-${posts.length}`;
            posts.push({
              id: postId,
              title,
              content: finalContent,
              author: authorMeta.author,
              authorAvatar: authorMeta.avatar,
              authorBio: authorMeta.bio,
              date: postMeta.date,
              category: postMeta.category,
              tags: postMeta.tags,
              image: postMeta.image,
              excerpt: postMeta.excerpt,
              readTime: this.estimateReadTime(finalContent),
              sourceUrl: candidate,
              sources: postMeta.sources,
            });
          }
          console.log(
            `[BlogWidget] Parsed ${posts.length} posts from ${candidate}`
          );
          return posts;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      console.error(
        `[BlogWidget] All URL candidates failed for ${url}`,
        lastError
      );
      if (
        lastError &&
        lastError.message &&
        lastError.message.includes("HTTP")
      ) {
        console.error(
          "[BlogWidget] HTTP error - the document may be unpublished or deleted"
        );
      }
      return [];
    },
  };

  const CacheManager = {
    prefix: "mcc-blog-cache-",
    set: function (key, data, ttlMinutes) {
      const expiry = Date.now() + ttlMinutes * 60 * 1000;
      const cacheData = { data, expiry };
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
      } catch (e) {
        console.warn("Cache write failed:", e);
      }
    },
    get: function (key) {
      try {
        const cached = localStorage.getItem(this.prefix + key);
        if (!cached) return null;
        const { data, expiry } = JSON.parse(cached);
        if (Date.now() > expiry) {
          this.remove(key);
          return null;
        }
        return data;
      } catch (e) {
        console.warn("Cache read failed:", e);
        return null;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (e) {
        console.warn("Cache remove failed:", e);
      }
    },
    clear: function () {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(this.prefix))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.warn("Cache clear failed:", e);
      }
    },
  };

  const BlogWidget = {
    config: {
      authorsSource: [],
      cacheTTL: 60,
      maxPosts: 12,
      authorFilter: true,
      categoryFilter: true,
      search: true,
      pageSize: 12,
      defaultImage: "",
    },
    state: {
      posts: [],
      filteredPosts: [],
      page: 1,
      currentFilters: { author: "", category: "", search: "", sort: "newest" },
      loading: false,
    },
    init: async function () {
      this.loadConfig();
      console.log("[BlogWidget] Config after loadConfig:", this.config);
      await this.loadData();
      this.setupFilters();
      this.applyFilters();
      this.render();
    },
    loadConfig: function () {
      const widget = $("#blogWidget");
      if (!widget) return;
      try {
        const sourceAttr = widget.dataset.authorsSource;
        console.log("[BlogWidget] Raw data-authors-source:", sourceAttr);
        let parsed;
        if (sourceAttr && sourceAttr.trim().startsWith("[")) {
          parsed = JSON.parse(sourceAttr);
        } else if (sourceAttr && sourceAttr.trim().startsWith("{")) {
          parsed = [JSON.parse(sourceAttr)];
        } else if (
          typeof sourceAttr === "string" &&
          sourceAttr.trim().length > 0
        ) {
          parsed = [sourceAttr.trim()];
        } else {
          parsed = [];
        }
        this.config.authorsSource = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.warn("Invalid authors-source, using empty array", e);
        console.warn(
          "[BlogWidget] data-authors-source attribute raw value:",
          widget.getAttribute("data-authors-source")
        );
        this.config.authorsSource = [];
      }
      try {
        if (
          (!this.config.authorsSource ||
            this.config.authorsSource.length === 0) &&
          window.__BLOG_WIDGET_AUTHORS
        ) {
          console.warn(
            "[BlogWidget] Using global fallback window.__BLOG_WIDGET_AUTHORS for authorsSource"
          );
          this.config.authorsSource = Array.isArray(
            window.__BLOG_WIDGET_AUTHORS
          )
            ? window.__BLOG_WIDGET_AUTHORS
            : [window.__BLOG_WIDGET_AUTHORS];
        }
      } catch (e) {}
      this.config.cacheTTL = parseInt(widget.dataset.cacheTtl) || 60;
      this.config.maxPosts = parseInt(widget.dataset.maxPosts) || 12;
      this.config.pageSize = this.config.maxPosts;
      this.config.authorFilter = widget.dataset.authorFilter !== "false";
      this.config.categoryFilter = widget.dataset.categoryFilter !== "false";
      this.config.search = widget.dataset.search !== "false";
      // Optional default image for posts when none provided in metadata
      this.config.defaultImage =
        widget.dataset.defaultImage || this.config.defaultImage;
    },
    loadData: async function () {
      this.state.loading = true;
      if (
        this.config.authorsSource.length === 1 &&
        this.config.authorsSource[0].endsWith(".json")
      ) {
        await this.loadFromManifest(this.config.authorsSource[0]);
      } else {
        await this.loadFromUrls(this.config.authorsSource);
      }
      this.state.loading = false;
    },
    loadFromManifest: async function (manifestUrl) {
      const cacheKey = `manifest-${manifestUrl}`;
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        this.state.posts = cached;
        return;
      }
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const manifest = await response.json();
        const urls = manifest.authors || manifest.urls || [];
        await this.loadFromUrls(urls);
        CacheManager.set(cacheKey, this.state.posts, this.config.cacheTTL);
      } catch (error) {
        console.error("Failed to load manifest:", error);
        this.showError("Failed to load author documents manifest");
      }
    },
    loadFromUrls: async function (urls) {
      if (!urls || urls.length === 0) {
        this.showError(
          "No author documents configured. Please add Google Docs URLs to data-authors-source."
        );
        return;
      }
      const allPosts = [];
      const diagnostics = [];
      for (const url of urls) {
        // Do not force /export; let fetchAuthorDoc try multiple candidates (pub/export).
        const normalizedUrl = url;
        const cacheKey = `author-${url}`;
        let posts = CacheManager.get(cacheKey);
        if (!posts) {
          let fetchedPosts = [];
          try {
            fetchedPosts = await AuthorDocParser.fetchAuthorDoc(normalizedUrl);
            if (fetchedPosts && fetchedPosts.length > 0) {
              CacheManager.set(cacheKey, fetchedPosts, this.config.cacheTTL);
              posts = fetchedPosts;
            } else {
              posts = [];
            }
            diagnostics.push({
              url,
              normalizedUrl,
              fetched: fetchedPosts.length,
            });
          } catch (err) {
            diagnostics.push({ url, normalizedUrl, error: String(err) });
            posts = [];
          }
        }
        if (posts) {
          allPosts.push(...posts);
        }
      }
      this.state.posts = allPosts;
      if (!this.state.posts || this.state.posts.length === 0) {
        console.warn("[BlogWidget] No posts parsed.", {
          authorsSource: this.config.authorsSource,
          normalizedUrls: urls.map((u) => u),
          rawUrls: urls,
          diagnostics,
        });
        console.warn("[BlogWidget] Troubleshooting steps:");
        console.warn(
          "  1. Ensure Google Docs are Published to Web (File → Share → Publish to web)"
        );
        console.warn(
          "  2. Check browser console Network tab for failed requests"
        );
        console.warn(
          "  3. Verify docs contain POST: markers or --- separators between posts"
        );
        console.warn("  4. Try clearing cache: CacheManager.clear()");
        this.showError(
          `No articles found. Check console for details. Diagnostics: ${JSON.stringify(
            diagnostics
          )}`
        );
      } else {
        console.log(
          `[BlogWidget] Successfully loaded ${this.state.posts.length} posts from ${urls.length} author doc(s)`
        );
      }
    },
    showError: function (message) {
      const container = $("#blogFeed");
      if (!container) return;
      container.innerHTML = `
        <div class="mcc-loading" style="color: #cc0000;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          ${message}
        </div>
      `;
    },
    setupFilters: function () {
      const authorFilter = $("#authorFilter");
      if (authorFilter && this.config.authorFilter) {
        const authors = [...new Set(this.state.posts.map((p) => p.author))];
        authors.forEach((author) => {
          const option = document.createElement("option");
          option.value = author;
          option.textContent = author;
          authorFilter.appendChild(option);
        });
        authorFilter.addEventListener("change", (e) => {
          this.state.currentFilters.author = e.target.value;
          this.state.page = 1;
          this.applyFilters();
          this.render();
        });
      }
      const categoryFilter = $("#categoryFilter");
      if (categoryFilter && this.config.categoryFilter) {
        const categories = [
          ...new Set(this.state.posts.map((p) => p.category)),
        ];
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          option.textContent = category;
          categoryFilter.appendChild(option);
        });
        categoryFilter.addEventListener("change", (e) => {
          this.state.currentFilters.category = e.target.value;
          this.state.page = 1;
          this.applyFilters();
          this.render();
        });
      }
      const searchInput = $("#blogSearch");
      if (searchInput && this.config.search) {
        searchInput.addEventListener(
          "input",
          debounce((e) => {
            this.state.currentFilters.search = e.target.value.toLowerCase();
            this.state.page = 1;
            this.applyFilters();
            this.render();
          }, 300)
        );
      }
      const sortFilter = $("#sortFilter");
      if (sortFilter) {
        sortFilter.addEventListener("change", (e) => {
          this.state.currentFilters.sort = e.target.value;
          this.state.page = 1;
          this.applyFilters();
          this.render();
        });
      }
      const prev = $("#prevPage");
      const next = $("#nextPage");
      if (prev && next) {
        prev.addEventListener("click", () => {
          if (this.state.page > 1) {
            this.state.page--;
            this.render();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
        next.addEventListener("click", () => {
          const totalPages = Math.ceil(
            this.state.filteredPosts.length / this.config.pageSize
          );
          if (this.state.page < totalPages) {
            this.state.page++;
            this.render();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
        document.addEventListener("keydown", (e) => {
          const modal = $("#postModal");
          if (modal && modal.classList.contains("mcc-modal--active")) return;
          if (e.key === "ArrowRight") next.click();
          if (e.key === "ArrowLeft") prev.click();
        });
      }
    },
    applyFilters: function () {
      let filtered = [...this.state.posts];
      if (this.state.currentFilters.author) {
        filtered = filtered.filter(
          (post) => post.author === this.state.currentFilters.author
        );
      }
      if (this.state.currentFilters.category) {
        filtered = filtered.filter(
          (post) => post.category === this.state.currentFilters.category
        );
      }
      if (this.state.currentFilters.search) {
        const query = this.state.currentFilters.search;
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      const sort = this.state.currentFilters.sort;
      if (sort === "newest") {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sort === "oldest") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sort === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      }
      this.state.filteredPosts = filtered;
    },
    render: function () {
      const container = $("#blogFeed");
      if (!container) return;
      if (this.state.filteredPosts.length === 0) {
        container.innerHTML = `
          <div class="mcc-loading">No articles found. Try adjusting your filters.</div>
        `;
        return;
      }
      const grid = document.createElement("div");
      grid.className = "mcc-blog__grid";
      grid.setAttribute("role", "list");
      const start = (this.state.page - 1) * this.config.pageSize;
      const end = start + this.config.pageSize;
      const pagePosts = this.state.filteredPosts.slice(start, end);
      pagePosts.forEach((post) => {
        const card = this.createCard(post);
        grid.appendChild(card);
      });
      container.innerHTML = "";
      container.appendChild(grid);
      const totalPages = Math.ceil(
        this.state.filteredPosts.length / this.config.pageSize
      );
      const pagination = $("#blogPagination");
      const prev = $("#prevPage");
      const next = $("#nextPage");
      const info = $("#pageInfo");
      if (totalPages > 1 && pagination && prev && next && info) {
        pagination.hidden = false;
        prev.setAttribute("aria-disabled", String(this.state.page <= 1));
        next.setAttribute(
          "aria-disabled",
          String(this.state.page >= totalPages)
        );
        info.textContent = `Page ${this.state.page} of ${totalPages}`;
      } else if (pagination) {
        pagination.hidden = true;
      }
      requestAnimationFrame(() => {
        grid.classList.add("mcc-blog__grid--loaded");
      });
    },
    createCard: function (post) {
      const card = document.createElement("article");
      card.className = "mcc-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("itemscope", "");
      card.setAttribute("itemtype", "https://schema.org/BlogPosting");
      card.innerHTML = `
        <div class="mcc-card__image">
          <img src="${
            post.image || this.config.defaultImage || "/images/blog/default.jpg"
          }" alt="${post.title}" itemprop="image" loading="lazy">
        </div>
        <div class="mcc-card__content">
          <div class="mcc-card__meta">
            <img class="mcc-card__avatar" src="${post.authorAvatar}" alt="${
        post.author
      }" loading="lazy">
            <div>
              <p class="mcc-card__author" itemprop="author">${post.author}</p>
              <p class="mcc-card__date"><time datetime="${
                post.date
              }" itemprop="datePublished">${formatDate(post.date)}</time> · ${
        post.readTime
      }</p>
            </div>
          </div>
          <h3 class="mcc-card__title" itemprop="headline">${post.title}</h3>
          <p class="mcc-card__excerpt" itemprop="description">${
            post.excerpt
          }</p>
          ${
            post.tags && post.tags.length > 0
              ? `<div class="mcc-card__tags">${post.tags
                  .map((tag) => `<span class=\"mcc-tag\">#${tag}</span>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      `;
      card.addEventListener("click", () => this.openModal(post));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.openModal(post);
        }
      });
      card.setAttribute("tabindex", "0");
      card.classList.add("mcc-focus-ring");
      return card;
    },
    openModal: function (post) {
      const modal = $("#postModal");
      const modalPost = $("#modalPost");
      if (!modal || !modalPost) return;
      modalPost.innerHTML = `
        <div class="mcc-modal__post-header">
          <h2 class="mcc-modal__post-title" id="modalPostTitle" itemprop="headline">${
            post.title
          }</h2>
          <div class="mcc-modal__post-meta">
            <img class="mcc-card__avatar" src="${post.authorAvatar}" alt="${
        post.author
      }">
            <span itemprop="author">${post.author}</span>
            <span>·</span>
            <time datetime="${post.date}" itemprop="datePublished">${formatDate(
        post.date
      )}</time>
            <span>·</span>
            <span>${post.readTime}</span>
          </div>
        </div>
        <div class="mcc-modal__post-content" itemprop="articleBody">${
          post.content
        }</div>
        ${
          Array.isArray(post.sources) && post.sources.length > 0
            ? `
          <div class="mcc-modal__sources">
            <h3 class="mcc-modal__sources-title">Sources</h3>
            <ul class="mcc-modal__sources-list">
              ${post.sources
                .map(
                  (s) =>
                    `<li>${s.replace(
                      /[&<>"]/g,
                      (c) =>
                        ({
                          "&": "&amp;",
                          "<": "&lt;",
                          ">": "&gt;",
                          '"': "&quot;",
                        }[c])
                    )}</li>`
                )
                .join("")}
            </ul>
            <button class="mcc-button mcc-button--copy" type="button" aria-label="Copy sources" id="copySourcesBtn">Copy Sources</button>
          </div>
        `
            : ""
        }
      `;
      modal.classList.add("mcc-modal--active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const closeBtn = $(".mcc-modal__close", modal);
      if (closeBtn) closeBtn.focus();
      // Wire up copy button if sources exist
      const copyBtn = $("#copySourcesBtn");
      if (copyBtn && Array.isArray(post.sources)) {
        copyBtn.addEventListener("click", async () => {
          const text = post.sources.join("\n");
          try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = "Copied!";
            setTimeout(() => {
              copyBtn.textContent = "Copy Sources";
            }, 1500);
          } catch (err) {
            console.warn("Clipboard copy failed", err);
          }
        });
      }
      document.addEventListener("keydown", this.handleModalKeydown);
    },
    closeModal: function () {
      const modal = $("#postModal");
      if (!modal) return;
      modal.classList.remove("mcc-modal--active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleModalKeydown);
    },
    handleModalKeydown: function (e) {
      if (e.key === "Escape") {
        BlogWidget.closeModal();
      }
    },
  };

  window.BlogWidget = BlogWidget;
  window.CacheManager = CacheManager;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => BlogWidget.init());
  } else {
    BlogWidget.init();
  }
})();
