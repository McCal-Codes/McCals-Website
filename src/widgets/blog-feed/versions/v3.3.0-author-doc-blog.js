(function () {
  "use strict";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const truncate = (s, n) =>
    (s || "").length <= n ? s || "" : (s || "").slice(0, n) + "…";
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const AuthorDocParser = {
    sanitizeHTML: function (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      // remove problematic nodes
      ["script", "style", "link", "noscript", "meta", "iframe"].forEach((tag) =>
        doc.querySelectorAll(tag).forEach((n) => n.remove())
      );
      // hr -> --- , br -> \n
      doc.querySelectorAll("hr").forEach((hr) => {
        hr.replaceWith(doc.createTextNode("\n---\n"));
      });
      doc.querySelectorAll("br").forEach((br) => {
        br.replaceWith(doc.createTextNode("\n"));
      });
      const text = (doc.body && doc.body.textContent) || html;
      return String(text).replace(/\r\n/g, "\n");
    },
    parseAuthorMetadata: function (text) {
      const meta = { author: "Unknown Author", avatar: "", bio: "" };
      const block = text.match(/---\s*([\s\S]*?)\s*---/);
      if (block) {
        const lines = block[1].split(/\n/);
        lines.forEach((line) => {
          const i = line.indexOf(":");
          if (i === -1) return;
          const key = line.slice(0, i).trim().toUpperCase();
          const val = line.slice(i + 1).trim();
          if (key === "AUTHOR") meta.author = val;
          else if (key === "AVATAR")
            meta.avatar = val; // ignored for rendering per request
          else if (key === "BIO") meta.bio = val;
        });
        const content = text.replace(block[0], "").trim();
        return { metadata: meta, content };
      }
      return { metadata: meta, content: text };
    },
    splitPosts: function (text) {
      const results = [];
      const markers = [];
      let m;
      const re = /POST:\s*([^\n]+)/gi;
      while ((m = re.exec(text)) !== null) {
        markers.push({ index: m.index, title: m[1].trim(), full: m[0] });
      }
      if (markers.length) {
        for (let i = 0; i < markers.length; i++) {
          const start = markers[i].index;
          const end =
            i < markers.length - 1 ? markers[i + 1].index : text.length;
          let section = text
            .slice(start, end)
            .replace(markers[i].full, "")
            .trim();
          results.push({ title: markers[i].title, content: section });
        }
        return results;
      }
      text.split(/\n\s*---\s*\n|\n{3,}/).forEach((sec) => {
        const s = sec.trim();
        if (s.length > 80) results.push({ title: null, content: s });
      });
      return results;
    },
    parsePostMetadata: function (content) {
      const meta = {
        date: new Date().toISOString().split("T")[0],
        category: "Uncategorized",
        tags: [],
        image: "",
        excerpt: "",
        sources: [],
      };
      const lines = content.split(/\n/);
      let end = 0;
      for (let i = 0; i < Math.min(lines.length, 12); i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#")) break;
        const k = line.indexOf(":");
        if (k === -1) continue;
        const key = line.slice(0, k).trim().toLowerCase();
        const val = line.slice(k + 1).trim();
        if (key === "date") {
          meta.date = AuthorDocParser.normalizeDate(val);
          end = i + 1;
        } else if (key === "category") {
          meta.category = val;
          end = i + 1;
        } else if (key === "tags") {
          meta.tags = val.split(",").map((t) => t.trim());
          end = i + 1;
        } else if (key === "image") {
          meta.image = val;
          end = i + 1;
        } else if (key === "excerpt") {
          meta.excerpt = val;
          end = i + 1;
        } else if (key === "sources") {
          meta.sources.push(val);
          end = i + 1;
        }
      }
      // detect multi-line Sources block
      const srcBlock = content.match(
        /(?:^|\n)(Sources|References|Works Cited|Bibliography):\s*\n([\s\S]*?)\n(?=\n|$)/i
      );
      if (srcBlock) {
        srcBlock[2]
          .split(/\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((l) => meta.sources.push(l));
      }
      const body =
        end > 0 ? lines.slice(end).join("\n").trim() : content.trim();
      return { metadata: meta, content: body };
    },
    normalizeDate: function (s) {
      if (!s) return new Date().toISOString().split("T")[0];
      s = String(s).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);
      if (m)
        return `${m[1].padStart(4, "0")}-${String(m[2]).padStart(
          2,
          "0"
        )}-${String(m[3]).padStart(2, "0")}`;
      const m2 = s.match(/^(\d{1,2})[-\/–](\d{1,2})[-\/–](\d{2,4})$/);
      if (m2) {
        let y = +m2[3];
        if (y < 100) y += y < 50 ? 2000 : 1900;
        const a = +m2[1],
          b = +m2[2];
        const mm = a >= 1 && a <= 12 ? a : b;
        const dd = a >= 1 && a <= 12 ? b : a;
        return `${String(y).padStart(4, "0")}-${String(mm).padStart(
          2,
          "0"
        )}-${String(dd).padStart(2, "0")}`;
      }
      const d = new Date(s);
      return isNaN(d.getTime())
        ? new Date().toISOString().split("T")[0]
        : d.toISOString().split("T")[0];
    },
    estimateRead: function (html) {
      const text =
        new DOMParser().parseFromString(html, "text/html").body.textContent ||
        "";
      const words = text.split(/\s+/).length;
      return `${Math.ceil(words / 200)} min read`;
    },
  };

  const Cache = {
    pfx: "mcc-blog-cache-",
    set(k, v, ttl) {
      try {
        localStorage.setItem(
          this.pfx + k,
          JSON.stringify({ data: v, expiry: Date.now() + ttl * 60 * 1000 })
        );
      } catch (e) {}
    },
    get(k) {
      try {
        const j = localStorage.getItem(this.pfx + k);
        if (!j) return null;
        const { data, expiry } = JSON.parse(j);
        if (Date.now() > expiry) {
          localStorage.removeItem(this.pfx + k);
          return null;
        }
        return data;
      } catch (e) {
        return null;
      }
    },
    clear() {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(this.pfx))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) {}
    },
  };

  const BlogWidget = {
    config: { authorsSource: [], cacheTTL: 60, maxPosts: 12, pageSize: 12 },
    state: { posts: [], filtered: [], page: 1 },
    init() {
      this.loadConfig();
      this.loadData().then(() => {
        this.apply();
        this.render();
      });
    },
    loadConfig() {
      const el = $("#blogWidget");
      if (!el) return;
      const src = el.dataset.authorsSource || "[]";
      try {
        this.config.authorsSource = JSON.parse(src);
      } catch (e) {
        this.config.authorsSource = src ? [src] : [];
      }
      this.config.cacheTTL = parseInt(el.dataset.cacheTtl) || 60;
      this.config.maxPosts = parseInt(el.dataset.maxPosts) || 12;
      this.config.pageSize = this.config.maxPosts;
    },
    async loadData() {
      const urls = this.config.authorsSource;
      const all = [];
      for (const url of urls) {
        const normalized =
          typeof url === "string" && url.includes("/pub")
            ? url.replace(/\/pub(?:\?.*)?$/i, "/export?format=html")
            : url;
        const cacheKey = `author-${normalized}`;
        let posts = Cache.get(cacheKey);
        if (!posts) {
          posts = await this.fetchAuthorPosts(normalized);
          Cache.set(cacheKey, posts, this.config.cacheTTL);
        }
        all.push(...posts);
      }
      this.state.posts = all;
    },
    async fetchAuthorPosts(url) {
      try {
        const res = await fetch(url, { mode: "cors", credentials: "omit" });
        if (!res.ok) return [];
        const html = await res.text();
        const text = AuthorDocParser.sanitizeHTML(html);
        const { metadata: authorMeta, content } =
          AuthorDocParser.parseAuthorMetadata(text);
        const sections = AuthorDocParser.splitPosts(content);
        const posts = [];
        for (const sec of sections) {
          const { metadata: meta, content: bodyText } =
            AuthorDocParser.parsePostMetadata(sec.content);
          // paragraphs -> HTML
          const paragraphs = bodyText
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
          const escape = (s) =>
            String(s).replace(
              /[&<>"]/g,
              (c) =>
                ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
            );
          const htmlBody = paragraphs.length
            ? paragraphs.map((p) => `<p>${escape(p)}</p>`).join("")
            : `<p>${escape(bodyText)}</p>`;
          if (!meta.excerpt) {
            const fp = new DOMParser()
              .parseFromString(htmlBody, "text/html")
              .querySelector("p");
            meta.excerpt = fp ? truncate(fp.textContent.trim(), 150) : "";
          }
          const title =
            sec.title ||
            truncate(
              (
                bodyText.split("\n").find((l) => l.trim().length > 0) ||
                "Untitled Post"
              ).trim(),
              80
            );
          posts.push({
            id: `${authorMeta.author
              .toLowerCase()
              .replace(/\s+/g, "-")}-${Date.now()}-${posts.length}`,
            title,
            author: authorMeta.author,
            date: meta.date,
            excerpt: meta.excerpt,
            content: htmlBody,
            readTime: AuthorDocParser.estimateRead(htmlBody),
            tags: meta.tags,
            category: meta.category,
            sources: meta.sources || [],
          });
        }
        return posts;
      } catch (e) {
        return [];
      }
    },
    apply() {
      this.state.filtered = [...this.state.posts];
    },
    render() {
      const feed = $("#blogFeed");
      if (!feed) return;
      const grid = document.createElement("div");
      grid.className = "mcc-grid";
      const start = (this.state.page - 1) * this.config.pageSize;
      const end = start + this.config.pageSize;
      const list = this.state.filtered.slice(start, end);
      list.forEach((p) => {
        grid.appendChild(this.card(p));
      });
      feed.innerHTML = "";
      feed.appendChild(grid);
      const totalPages = Math.ceil(
        this.state.filtered.length / this.config.pageSize
      );
      const pag = $("#blogPagination");
      const prev = $("#prevPage");
      const next = $("#nextPage");
      const info = $("#pageInfo");
      if (totalPages > 1 && pag && prev && next && info) {
        pag.hidden = false;
        prev.onclick = () => {
          if (this.state.page > 1) {
            this.state.page--;
            this.render();
          }
        };
        next.onclick = () => {
          if (this.state.page < totalPages) {
            this.state.page++;
            this.render();
          }
        };
        info.textContent = `Page ${this.state.page} of ${totalPages}`;
      } else if (pag) {
        pag.hidden = true;
      }
    },
    card(post) {
      const el = document.createElement("article");
      el.className = "mcc-card";
      el.setAttribute("role", "listitem");
      el.innerHTML = `
        <div class="mcc-card__content">
          <div class="mcc-card__meta">
            <svg class="mcc-card__avatar" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" aria-hidden="true" focusable="false"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#2e3436"></path> </g></svg>
            <div>
              <p class="mcc-card__author">${post.author}</p>
              <p class="mcc-card__date">${formatDate(post.date)}</p>
            </div>
          </div>
          <h3 class="mcc-card__title">${post.title}</h3>
          <p class="mcc-card__excerpt">${post.excerpt}</p>
        </div>`;
      el.addEventListener("click", () => this.open(post));
      return el;
    },
    open(post) {
      const modal = $("#postModal");
      const body = $("#modalPost");
      if (!modal || !body) return;
      body.innerHTML = `
        <div class="mcc-modal__post-header">
          <h2 class="mcc-modal__post-title" id="modalPostTitle">${
            post.title
          }</h2>
          <div class="mcc-modal__post-meta">
            <svg class="mcc-card__avatar" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" aria-hidden="true" focusable="false"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#2e3436"></path> </g></svg>
            <span>${post.author}</span>
            <span>·</span>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span>·</span>
            <span>${post.readTime}</span>
          </div>
        </div>
        <div class="mcc-modal__post-content">${post.content}</div>
        ${
          post.sources && post.sources.length
            ? `
          <section class="mcc-sources" aria-labelledby="sourcesHeader">
            <div class="mcc-sources__header">
              <h3 id="sourcesHeader" style="margin:0;font-size:16px;font-weight:700;">Sources</h3>
              <button class="mcc-copy-btn" id="copySourcesBtn">Copy</button>
            </div>
            <ul>${post.sources.map((s) => `<li>${s}</li>`).join("")}</ul>
          </section>`
            : ""
        }
      `;
      modal.classList.add("mcc-modal--active");
      document.body.style.overflow = "hidden";
      const copyBtn = $("#copySourcesBtn", body);
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          try {
            const text = post.sources.join("\n");
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = "Copied";
            setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
          } catch (e) {
            copyBtn.textContent = "Copy failed";
            setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
          }
        });
      }
      document.addEventListener("keydown", this.handleKey);
    },
    closeModal() {
      const modal = $("#postModal");
      if (!modal) return;
      modal.classList.remove("mcc-modal--active");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleKey);
    },
    handleKey(e) {
      if (e.key === "Escape") BlogWidget.closeModal();
    },
  };

  window.BlogWidget = BlogWidget;
  window.CacheManager = Cache;
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => BlogWidget.init());
  else BlogWidget.init();
})();
