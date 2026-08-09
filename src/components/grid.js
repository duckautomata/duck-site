import { sites } from "../data/sites.js";
import { isStarred, toggleStarred } from "./favorites.js";
import { openLightbox } from "./lightbox.js";

const CDN_BASE = "https://content.duck-automata.com/home";

// Past this many examples we collapse the tail into a single "+N" tile so cards
// keep a predictable height no matter how many screenshots a site has.
const MAX_VISIBLE_THUMBS = 4;

const STAR_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.1l2.72 5.51 6.08.89-4.4 4.29 1.04 6.05L12 16.98l-5.44 2.86 1.04-6.05-4.4-4.29 6.08-.89z" stroke-linejoin="round"/></svg>`;
const CHEVRON_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9.5l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// "all" | "starred" | a tag name
const state = { query: "", filter: "all" };

// Per-site "compact" / "full" overrides for starred sites only. Deliberately not
// persisted: every load starts fresh with every starred site collapsed.
const sizeOverrides = new Map();

/**
 * Only starred sites can collapse. Everything else is always full size.
 * @param {object} site A site from the data file.
 * @returns {boolean} Whether the card should render in its collapsed form.
 */
function isCompact(site) {
    if (!isStarred(site.id)) return false;
    return (sizeOverrides.get(site.id) || "compact") === "compact";
}

function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
}

/**
 * @returns {string[]} Every tag used by at least one site, alphabetically.
 */
export function getAllTags() {
    const tags = new Set();
    sites.forEach((site) => (site.tags || []).forEach((tag) => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b));
}

function matchesQuery(site, query) {
    if (!query) return true;

    const haystack = [site.title, site.description, ...(site.tags || [])].join(" ").toLowerCase();
    // Every word has to appear somewhere, so "live graph" finds Live-Transcripts.
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word));
}

function matchesFilter(site, filter) {
    if (filter === "all") return true;
    if (filter === "starred") return isStarred(site.id);
    return (site.tags || []).includes(filter);
}

function getVisibleSites() {
    return sites.filter((site) => matchesFilter(site, state.filter) && matchesQuery(site, state.query));
}

function thumbsHTML(site) {
    const examples = site.exampleImages || [];
    if (examples.length === 0) return "";

    const overflows = examples.length > MAX_VISIBLE_THUMBS;
    const shown = overflows ? examples.slice(0, MAX_VISIBLE_THUMBS - 1) : examples;

    const tiles = shown
        .map((img, index) => {
            const style = `--light-image: url('${CDN_BASE}/${img.light}_t.webp'); --dark-image: url('${CDN_BASE}/${img.dark}_t.webp');`;
            return `<button type="button" class="example-thumb" style="${escapeHtml(style)}" data-example-index="${index}" aria-label="View example ${index + 1} of ${escapeHtml(site.title)}"></button>`;
        })
        .join("");

    const overflowTile = overflows
        ? `<button type="button" class="example-thumb example-more" data-example-index="${shown.length}" aria-label="View the remaining ${examples.length - shown.length} examples of ${escapeHtml(site.title)}">+${examples.length - shown.length}</button>`
        : "";

    return `
        <div class="card-examples">
            <span class="examples-label">Examples</span>
            <div class="example-images">${tiles}${overflowTile}</div>
        </div>
    `;
}

function imageStyle(site, variant) {
    return `--light-image: url('${CDN_BASE}/${site.displayImageLight}${variant}.webp'); --dark-image: url('${CDN_BASE}/${site.displayImageDark}${variant}.webp');`;
}

function cardActionsHTML(site, compact) {
    const starred = isStarred(site.id);
    const id = escapeHtml(site.id);
    const title = escapeHtml(site.title);
    const toggleLabel = `${compact ? "Expand" : "Collapse"} ${title}`;
    const starLabel = `${starred ? "Unstar" : "Star"} ${title}`;

    // Collapsing is a starred-site affordance, so unstarred cards get no chevron.
    const toggle = starred
        ? `<button
                type="button"
                class="card-action card-toggle"
                data-toggle-id="${id}"
                aria-expanded="${!compact}"
                title="${toggleLabel}"
                aria-label="${toggleLabel}"
            >${CHEVRON_ICON}</button>`
        : "";

    return `
        <div class="card-actions${compact ? "" : " on-media"}">
            ${toggle}
            <button
                type="button"
                class="card-action star-button${starred ? " is-starred" : ""}"
                data-star-id="${id}"
                aria-pressed="${starred}"
                title="${starLabel}"
                aria-label="${starLabel}"
            >${STAR_ICON}</button>
        </div>
    `;
}

function compactCardHTML(site) {
    const description = escapeHtml(site.description || "");

    return `
        <article class="site-card is-compact" data-site-id="${escapeHtml(site.id)}">
            <a href="${escapeHtml(site.url)}" class="compact-thumb" style="${escapeHtml(imageStyle(site, "_t"))}" aria-hidden="true" tabindex="-1"></a>
            <div class="compact-text">
                <h3><a href="${escapeHtml(site.url)}">${escapeHtml(site.title)}</a></h3>
                <p class="compact-description" title="${description}">${description}</p>
            </div>
            ${cardActionsHTML(site, true)}
        </article>
    `;
}

function fullCardHTML(site) {
    const tags = (site.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const description = escapeHtml(site.description || "");

    return `
        <article class="site-card" data-site-id="${escapeHtml(site.id)}">
            <div class="card-media">
                <a href="${escapeHtml(site.url)}" class="display-image-link" style="${escapeHtml(imageStyle(site, "_p"))}" aria-label="Open ${escapeHtml(site.title)}"></a>
                ${cardActionsHTML(site, false)}
            </div>
            <div class="card-content">
                <h3><a href="${escapeHtml(site.url)}">${escapeHtml(site.title)}</a></h3>
                ${tags ? `<div class="tag-list">${tags}</div>` : ""}
                <p class="description" title="${description}">${description}</p>
                ${thumbsHTML(site)}
            </div>
        </article>
    `;
}

function cardHTML(site) {
    return isCompact(site) ? compactCardHTML(site) : fullCardHTML(site);
}

function sectionHTML(title, sectionSites, modifier = "") {
    if (sectionSites.length === 0) return "";

    return `
        <section class="grid-section${modifier ? ` ${modifier}` : ""}">
            <h2 class="section-heading">${title}<span class="section-count">${sectionSites.length}</span></h2>
            <div class="card-grid">${sectionSites.map(cardHTML).join("")}</div>
        </section>
    `;
}

function emptyStateHTML() {
    if (state.filter === "starred") {
        return `
            <div class="empty-state">
                <p class="empty-title">No starred sites yet</p>
                <p>Hit the ☆ on any card to pin it to the top of the page.</p>
            </div>
        `;
    }

    return `
        <div class="empty-state">
            <p class="empty-title">No sites match ${state.query ? `“${escapeHtml(state.query)}”` : "that filter"}</p>
            <p>Try a different search or clear the filters.</p>
        </div>
    `;
}

function updateResultCount(visibleCount) {
    const counter = document.getElementById("result-count");
    if (!counter) return;

    const noun = sites.length === 1 ? "site" : "sites";
    counter.textContent =
        visibleCount === sites.length ? `${sites.length} ${noun}` : `${visibleCount} of ${sites.length} ${noun}`;
}

function bindCardEvents(grid) {
    grid.querySelectorAll(".star-button").forEach((button) => {
        button.addEventListener("click", () => {
            const id = button.dataset.starId;
            // Unstarring takes the toggle away, so drop any sizing the user picked
            // while it was starred. Starring it again starts collapsed as usual.
            if (!toggleStarred(id)) sizeOverrides.delete(id);
            renderGrid();
            // The card moved between sections, so hand focus back to its new star button.
            document.querySelector(`.star-button[data-star-id="${CSS.escape(id)}"]`)?.focus();
        });
    });

    grid.querySelectorAll(".card-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const id = button.dataset.toggleId;
            const site = sites.find((entry) => entry.id === id);
            if (!site) return;

            sizeOverrides.set(id, isCompact(site) ? "full" : "compact");
            renderGrid();
            // The card was rebuilt from scratch, so put focus back on its toggle.
            document.querySelector(`.card-toggle[data-toggle-id="${CSS.escape(id)}"]`)?.focus();
        });
    });

    grid.querySelectorAll(".example-thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
            const card = thumb.closest(".site-card");
            const site = sites.find((entry) => entry.id === card?.dataset.siteId);
            const examples = site?.exampleImages || [];
            const image = examples[Number(thumb.dataset.exampleIndex)];
            if (image) openLightbox(image.light, image.dark, examples);
        });
    });
}

export function renderGrid() {
    const grid = document.getElementById("site-grid");
    if (!grid) return;

    const visible = getVisibleSites();
    updateResultCount(visible.length);

    if (visible.length === 0) {
        grid.innerHTML = emptyStateHTML();
        return;
    }

    // Starred sites get their own section at the top. When the user is already
    // looking at only starred sites, a second section would be noise.
    const starred = visible.filter((site) => isStarred(site.id));
    const rest = visible.filter((site) => !isStarred(site.id));

    if (state.filter === "starred" || starred.length === 0) {
        grid.innerHTML = sectionHTML(state.filter === "starred" ? "★ Starred" : "All Sites", visible);
    } else {
        grid.innerHTML = sectionHTML("★ Starred", starred, "starred-section") + sectionHTML("Everything Else", rest);
    }

    bindCardEvents(grid);
}

function renderFilters() {
    const container = document.getElementById("tag-filters");
    if (!container) return;

    const options = [
        { value: "all", label: "All" },
        { value: "starred", label: "★ Starred" },
        ...getAllTags().map((tag) => ({ value: tag, label: tag })),
    ];

    container.innerHTML = options
        .map(
            (option) =>
                `<button type="button" class="filter-chip${option.value === state.filter ? " is-active" : ""}" data-filter="${escapeHtml(option.value)}" aria-pressed="${option.value === state.filter}">${escapeHtml(option.label)}</button>`,
        )
        .join("");

    container.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            state.filter = chip.dataset.filter;
            renderFilters();
            renderGrid();
        });
    });
}

// The "/" shortcut lives on the document, so it is bound once for the page.
let searchShortcutBound = false;

function initSearch() {
    const input = document.getElementById("site-search");
    const clearBtn = document.getElementById("search-clear");

    if (input) {
        input.addEventListener("input", () => {
            state.query = input.value.trim();
            if (clearBtn) clearBtn.hidden = state.query === "";
            renderGrid();
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && input.value !== "") {
                input.value = "";
                input.dispatchEvent(new Event("input"));
            }
        });

        // "/" jumps straight to the search box, like every other search-first UI.
        if (!searchShortcutBound) {
            searchShortcutBound = true;
            document.addEventListener("keydown", (event) => {
                const searchBox = document.getElementById("site-search");
                const typingElsewhere = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
                if (event.key === "/" && searchBox && !typingElsewhere) {
                    event.preventDefault();
                    searchBox.focus();
                }
            });
        }
    }

    if (clearBtn) {
        clearBtn.hidden = true;
        clearBtn.addEventListener("click", () => {
            if (!input) return;
            input.value = "";
            input.dispatchEvent(new Event("input"));
            input.focus();
        });
    }
}

export function initGrid() {
    state.query = "";
    state.filter = "all";
    sizeOverrides.clear();
    renderFilters();
    initSearch();
    renderGrid();
}
