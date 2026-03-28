/**
 * coffee.nebula() — Lightweight multi-source search.
 * Wikipedia + DuckDuckGo. No API keys. No AI.
 *
 * const { results } = await coffee.nebula('coffee');
 * coffee.nebula('coffee', { target: '#results' });
 *
 * Wikipedia full-text hit list (Frugal-style):
 *   const { results } = await coffee.nebula.wikiSearch('coffee plant');
 *   coffee.nebula.wikiSearch('query', { target: '#list', limit: 15, wiki: 'en', images: true });
 *
 * Depends: coffee.request
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /**
   * Strip Wikipedia search snippet HTML to plain text (safe for textContent).
   */
  function stripWikiSnippet(html) {
    if (html == null || html === '') return '';
    const d = document.createElement('div');
    d.innerHTML = String(html);
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function wikiArticleUrl(title, wiki) {
    const slug = String(title || '').replace(/ /g, '_');
    return `https://${wiki}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
  }

  /**
   * Batch-fetch lead thumbnails for article titles (prop=pageimages). No API key.
   * @param {string[]} titles
   * @param {string} wiki - language code, default en
   * @param {number} thumbSize - max width in px
   * @returns {Promise<Record<string, string>>} map title → thumbnail URL
   */
  async function fetchWikiThumbnailsForTitles(titles, wiki, thumbSize) {
    const w = String(wiki || 'en').replace(/[^a-z-]/gi, '') || 'en';
    const size = Math.min(640, Math.max(80, Number(thumbSize) || 220));
    const unique = [...new Set((titles || []).map((t) => String(t || '').trim()).filter(Boolean))];
    if (!unique.length || !coffee.request) return {};

    const map = {};
    for (let i = 0; i < unique.length; i += 50) {
      const batch = unique.slice(i, i + 50);
      const titlesParam = batch.map((t) => encodeURIComponent(t)).join('%7C');
      const endpoint =
        `https://${w}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
        `&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&titles=${titlesParam}`;
      try {
        const data = await coffee.request(endpoint, { json: true });
        const pages = data?.query?.pages;
        if (!pages) continue;
        Object.values(pages).forEach((p) => {
          const url = p.thumbnail?.source;
          if (p.title && url) map[p.title] = url;
        });
      } catch (_) {
        /* ignore batch */
      }
    }
    return map;
  }

  async function fetchWikiImages(query) {
    try {
      const data = await coffee.request(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=images&titles=${encodeURIComponent(query)}&gimlimit=24&iiprop=url`,
        { json: true }
      );
      if (!data.query?.pages) return [];
      return Object.values(data.query.pages)
        .map((p) => p.imageinfo?.[0]?.url)
        .filter((u) => u && /\.(jpg|jpeg|png|webp)$/i.test(u));
    } catch (_) {
      return [];
    }
  }

  /**
   * Search Wikipedia + DuckDuckGo. Returns { results } or renders to target.
   * @param {string} query - Search query
   * @param {object} opts - { target: string|Element, gallery: true } render into target; set gallery:false to skip Commons-style image strip fetch
   * @returns {Promise<{ results: Array }>}
   */
  coffee.nebula = async function (query, opts = {}) {
    const q = String(query || '').trim();
    if (!q) return { results: [] };

    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`;

    let wikiData = null;
    let ddgData = null;

    try {
      [wikiData, ddgData] = await Promise.all([
        coffee.request(wikiUrl, { json: true }).catch(() => null),
        coffee.request(ddgUrl, { json: true }).catch(() => null)
      ]);
    } catch (_) {
      wikiData = ddgData = null;
    }

    const wantGallery = opts.gallery !== false;
    const galleryPromise = wantGallery ? fetchWikiImages(q) : Promise.resolve([]);
    const results = [];

    if (wikiData && wikiData.type !== 'no-outbound-proxy' && wikiData.extract) {
      const gallery = await galleryPromise;
      results.push({
        title: wikiData.title || q,
        content: wikiData.extract,
        source: 'Wikipedia',
        image: wikiData.originalimage?.source || null,
        tags: ['Encyclopedia', wikiData.description || 'General'].filter(Boolean),
        gallery
      });
    }

    if (results.length === 0 && ddgData?.AbstractText) {
      const gallery = await galleryPromise;
      results.push({
        title: ddgData.Heading || q,
        content: ddgData.AbstractText,
        source: 'DuckDuckGo',
        image: ddgData.Image || null,
        tags: ['Instant Answer'],
        gallery
      });
    }

    if (opts.target) {
      const el = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
      if (el && coffee.nebula.render) {
        coffee.nebula.render(results, el);
      }
    }

    return { results };
  };

  /**
   * Wikipedia full-text search (action=query&list=search). Multiple titles + snippets.
   * Same family as MediaWiki open search; no API key. Snippets are returned as plain text.
   *
   * @param {string} query
   * @param {object} [opts] - { limit: 15, wiki: 'en', images: true, thumbSize: 220, target: string|Element }
   * @returns {Promise<{ results: Array<{ title, snippet, url, thumbnail? }> }>}
   */
  coffee.nebula.wikiSearch = async function (query, opts = {}) {
    if (!coffee.request) {
      throw new Error('coffee.nebula.wikiSearch requires coffee.request (load coffee-request.js first)');
    }
    const q = String(query || '').trim();
    if (!q) return { results: [] };

    const wiki = String(opts.wiki || 'en').replace(/[^a-z-]/gi, '') || 'en';
    const limit = Math.min(50, Math.max(1, Number(opts.limit) || 15));
    const wantImages = opts.images !== false;
    const thumbSize = Number(opts.thumbSize) || 220;
    const endpoint =
      `https://${wiki}.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*` +
      `&srsearch=${encodeURIComponent(q)}&srlimit=${limit}`;

    let data;
    try {
      data = await coffee.request(endpoint, { json: true });
    } catch (e) {
      return { results: [], error: e };
    }

    const raw = data?.query?.search;
    if (!Array.isArray(raw)) return { results: [] };

    const results = raw.map((r) => ({
      title: r.title,
      snippet: stripWikiSnippet(r.snippet),
      url: wikiArticleUrl(r.title, wiki),
      thumbnail: null
    }));

    if (wantImages && results.length) {
      const thumbs = await fetchWikiThumbnailsForTitles(
        results.map((r) => r.title),
        wiki,
        thumbSize
      );
      results.forEach((r) => {
        r.thumbnail = thumbs[r.title] || null;
      });
    }

    if (opts.target) {
      const el = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
      if (el && coffee.nebula.renderWikiSearch) {
        coffee.nebula.renderWikiSearch(results, el);
      }
    }

    return { results };
  };

  /**
   * Render wikiSearch() results as a vertical list (title link + snippet).
   */
  coffee.nebula.renderWikiSearch = function (results, target) {
    if (!target) return;
    target.innerHTML = '';

    const esc = (s) => {
      const d = document.createElement('div');
      d.textContent = s ?? '';
      return d.innerHTML;
    };

    if (!results.length) {
      const msg = coffee.msg ? coffee.msg('No Wikipedia results. Try different keywords.', 'info') : document.createElement('div');
      const el = msg?.nodeType ? msg : document.createElement('div');
      if (!el.nodeType) el.textContent = 'No results.';
      target.appendChild(el);
      return;
    }

    results.forEach((r) => {
      const card = document.createElement('div');
      card.style.cssText =
        'padding-bottom:var(--coffee-space-md,16px);margin-bottom:var(--coffee-space-md,16px);' +
        'border-bottom:1px solid var(--coffee-panel,#333)';
      const thumbHtml = r.thumbnail
        ? `<div class="nebula-wiki-thumb" style="flex-shrink:0;width:100%;max-width:120px"><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${esc(r.thumbnail)}" alt="" style="width:100%;height:72px;object-fit:cover;border-radius:var(--coffee-radius-sm,8px);border:1px solid var(--coffee-panel,#333)" loading="lazy" onerror="this.parentElement.parentElement.style.display='none'"></a></div>`
        : '';
      card.innerHTML = `
        <div style="display:flex;flex-direction:row;gap:12px;align-items:flex-start">
          ${thumbHtml}
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--coffee-text-muted,#9ca3af);margin-bottom:4px;word-break:break-all">${esc(r.url)}</div>
            <h3 style="margin:0 0 6px 0;font-size:1.15rem">
              <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--coffee-accent,#4c9aff);text-decoration:none">${esc(r.title)}</a>
            </h3>
            <p style="margin:0;font-size:13px;line-height:1.5;color:var(--coffee-text-primary,#eee)">${esc(r.snippet)}${r.snippet ? '…' : ''}</p>
          </div>
        </div>
      `;
      target.appendChild(card);
    });
  };

  /**
   * Render results into an element. Uses Coffee UI if available.
   */
  coffee.nebula.render = function (results, target) {
    if (!target) return;
    target.innerHTML = '';

    if (results.length === 0) {
      const msg = coffee.msg ? coffee.msg('No results. Try a different query.', 'info') : document.createElement('div');
      const el = msg?.nodeType ? msg : document.createElement('div');
      if (!el.nodeType) el.textContent = 'No results.';
      target.appendChild(el);
      return;
    }

    results.forEach((r) => {
      const card = buildResultCard(r);
      target.appendChild(card);
    });
  };

  function buildResultCard(r) {
    const esc = (s) => {
      const d = document.createElement('div');
      d.textContent = s ?? '';
      return d.innerHTML;
    };
    const card = document.createElement('div');
    card.style.cssText = 'padding:var(--coffee-space-md,16px);background:var(--coffee-bg-elev,#252525);border-radius:var(--coffee-radius-md,12px);border:1px solid var(--coffee-panel,#333);margin-bottom:var(--coffee-space-md,16px);overflow:hidden';
    const inner = document.createElement('div');
    inner.style.cssText = 'display:flex;flex-direction:column;gap:12px';
    if (window.matchMedia('(min-width:600px)').matches) inner.style.flexDirection = 'row';
    inner.innerHTML = `
      ${r.image ? `<img class="nebula-lead-image" src="${esc(r.image)}" alt="" style="flex-shrink:0;width:100%;max-width:200px;height:150px;object-fit:cover;border-radius:var(--coffee-radius-sm,8px)" onerror="this.remove()">` : ''}
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;margin-bottom:8px">
          <h3 style="margin:0;font-size:1.25rem;color:var(--coffee-text-primary,#eee)">${esc(r.title)}</h3>
          <span style="font-size:12px;color:var(--coffee-text-muted,#9ca3af)">${esc(r.source)}</span>
        </div>
        <p style="margin:0;line-height:1.5;color:var(--coffee-text-primary,#eee)">${esc(r.content)}</p>
        ${r.tags?.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${r.tags.map((t) => `<span style="font-size:11px;padding:2px 8px;background:var(--coffee-bg-surface,#1a1a1a);border-radius:4px;color:var(--coffee-text-muted,#9ca3af)">${esc(t)}</span>`).join('')}</div>` : ''}
        ${r.gallery?.length ? `<div data-nebula-gallery="1" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--coffee-panel,#333)">${r.gallery.slice(0, 16).map((u) => `<img src="${esc(u)}" alt="" style="width:100%;height:60px;object-fit:cover;border-radius:6px" onerror="this.remove()">`).join('')}</div>` : ''}
      </div>
    `;
    card.appendChild(inner);
    return card;
  }

  window.coffee = coffee;
})();
