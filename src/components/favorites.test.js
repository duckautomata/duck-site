import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStarredIds, isStarred, toggleStarred, clearStarred, resetStarredCache } from "./favorites.js";

describe("favorites", () => {
    beforeEach(() => {
        localStorage.clear();
        resetStarredCache();
    });

    afterEach(() => {
        localStorage.clear();
        resetStarredCache();
    });

    it("starts empty when nothing is stored", () => {
        expect(getStarredIds()).toEqual([]);
        expect(isStarred("dokisnake")).toBe(false);
    });

    it("toggles a site on and off, persisting each change", () => {
        expect(toggleStarred("dokisnake")).toBe(true);
        expect(isStarred("dokisnake")).toBe(true);
        expect(JSON.parse(localStorage.getItem("starredSites"))).toEqual(["dokisnake"]);

        expect(toggleStarred("dokisnake")).toBe(false);
        expect(isStarred("dokisnake")).toBe(false);
        expect(JSON.parse(localStorage.getItem("starredSites"))).toEqual([]);
    });

    it("reads previously stored ids", () => {
        localStorage.setItem("starredSites", JSON.stringify(["dokimotes", "dokisnake"]));
        resetStarredCache();

        expect(getStarredIds()).toEqual(["dokimotes", "dokisnake"]);
        expect(isStarred("dokimotes")).toBe(true);
    });

    it("ignores malformed stored values", () => {
        localStorage.setItem("starredSites", "{not json");
        resetStarredCache();
        expect(getStarredIds()).toEqual([]);

        localStorage.setItem("starredSites", JSON.stringify({ id: "nope" }));
        resetStarredCache();
        expect(getStarredIds()).toEqual([]);

        localStorage.setItem("starredSites", JSON.stringify(["ok", 42, null]));
        resetStarredCache();
        expect(getStarredIds()).toEqual(["ok"]);
    });

    it("clears every starred site", () => {
        toggleStarred("a");
        toggleStarred("b");
        clearStarred();

        expect(getStarredIds()).toEqual([]);
        expect(JSON.parse(localStorage.getItem("starredSites"))).toEqual([]);
    });

    it("keeps working when localStorage throws", () => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = () => {
            throw new Error("QuotaExceeded");
        };

        try {
            expect(() => toggleStarred("dokimosaic")).not.toThrow();
            expect(isStarred("dokimosaic")).toBe(true);
        } finally {
            Storage.prototype.setItem = original;
        }
    });
});
