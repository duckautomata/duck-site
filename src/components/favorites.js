const STORAGE_KEY = "starredSites";

// In-memory mirror of localStorage so the UI keeps working even when storage is
// unavailable (private browsing, disabled cookies, quota errors, ...).
let starred = null;

function read() {
    if (starred) return starred;

    starred = new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
            parsed.filter((id) => typeof id === "string").forEach((id) => starred.add(id));
        }
    } catch (e) {
        // Corrupt or inaccessible storage. Start from an empty set.
    }
    return starred;
}

function write() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...read()]));
    } catch (e) {
        // Storage is unavailable. The in-memory set still drives this session.
    }
}

/**
 * @returns {string[]} The ids of every starred site.
 */
export function getStarredIds() {
    return [...read()];
}

/**
 * @param {string} id Site id.
 * @returns {boolean} Whether the site is starred.
 */
export function isStarred(id) {
    return read().has(id);
}

/**
 * Flips the starred state of a site and persists the result.
 * @param {string} id Site id.
 * @returns {boolean} The new starred state.
 */
export function toggleStarred(id) {
    const set = read();
    if (set.has(id)) {
        set.delete(id);
    } else {
        set.add(id);
    }
    write();
    return set.has(id);
}

/**
 * Drops every starred site. Mainly useful for tests.
 */
export function clearStarred() {
    starred = new Set();
    write();
}

/**
 * Forgets the cached set so the next read comes from localStorage again.
 * Mainly useful for tests.
 */
export function resetStarredCache() {
    starred = null;
}
