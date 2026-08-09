import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderGrid, initGrid, getAllTags } from "./grid.js";
import { clearStarred, isStarred, resetStarredCache } from "./favorites.js";

vi.mock("../data/sites.js", () => ({
    sites: [
        {
            id: "test-site",
            title: "Test Site",
            url: "./test/",
            description: "A test site description.",
            tags: ["Archives"],
            displayImageLight: "test_light_img",
            displayImageDark: "test_dark_img",
            exampleImages: [{ light: "ex_light_1", dark: "ex_dark_1" }],
        },
        {
            id: "other-site",
            title: "Other Site",
            url: "./other/",
            description: "Something completely different.",
            tags: ["Games"],
            displayImageLight: "other_light_img",
            displayImageDark: "other_dark_img",
            exampleImages: [
                { light: "o1", dark: "o1" },
                { light: "o2", dark: "o2" },
                { light: "o3", dark: "o3" },
                { light: "o4", dark: "o4" },
                { light: "o5", dark: "o5" },
            ],
        },
    ],
}));

const TOOLBAR_HTML = `
    <input id="site-search" />
    <button id="search-clear" hidden></button>
    <div id="tag-filters"></div>
    <span id="result-count"></span>
    <div id="site-grid"></div>
`;

function chip(label) {
    return [...document.querySelectorAll(".filter-chip")].find((button) => button.textContent === label);
}

describe("grid", () => {
    beforeEach(() => {
        document.body.innerHTML = TOOLBAR_HTML;
        localStorage.clear();
        resetStarredCache();
        // Mimics a page load: clears the query, the filter and any size overrides.
        initGrid();
    });

    afterEach(() => {
        document.body.innerHTML = "";
        localStorage.clear();
        resetStarredCache();
        vi.clearAllMocks();
    });

    it("renders every site with its images, tags and description", () => {
        renderGrid();
        const grid = document.getElementById("site-grid");

        expect(grid.innerHTML).toContain("Test Site");
        expect(grid.innerHTML).toContain("A test site description.");
        expect(grid.innerHTML).toContain("./test/");
        expect(grid.innerHTML).toContain("Archives");

        // Display images
        expect(grid.innerHTML).toContain("test_light_img_p.webp");
        expect(grid.innerHTML).toContain("test_dark_img_p.webp");

        // Example thumbnails
        expect(grid.innerHTML).toContain("Examples");
        expect(grid.innerHTML).toContain("ex_light_1_t.webp");
        expect(grid.innerHTML).toContain("ex_dark_1_t.webp");

        expect(grid.querySelectorAll(".site-card")).toHaveLength(2);
    });

    it("does nothing if grid element is missing", () => {
        document.body.innerHTML = "";
        expect(() => renderGrid()).not.toThrow();
    });

    it("collapses example thumbnails past the visible limit into a +N tile", () => {
        renderGrid();

        const otherCard = document.querySelector('.site-card[data-site-id="other-site"]');
        // 5 examples => 3 thumbnails plus a "+2" tile.
        expect(otherCard.querySelectorAll(".example-thumb")).toHaveLength(4);
        expect(otherCard.querySelector(".example-more").textContent).toBe("+2");
    });

    it("collects the tags used across every site", () => {
        expect(getAllTags()).toEqual(["Archives", "Games"]);
    });

    describe("collapsing", () => {
        function star(id) {
            localStorage.setItem("starredSites", JSON.stringify([id]));
            resetStarredCache();
        }

        it("renders unstarred sites full size, with no collapse toggle", () => {
            renderGrid();

            const card = document.querySelector('.site-card[data-site-id="test-site"]');
            expect(card.classList.contains("is-compact")).toBe(false);
            expect(card.querySelector(".card-media")).not.toBeNull();
            expect(card.querySelector(".card-toggle")).toBeNull();
            expect(card.querySelector(".star-button")).not.toBeNull();
        });

        it("renders starred sites compact on load", () => {
            localStorage.setItem("starredSites", JSON.stringify(["test-site"]));
            resetStarredCache();
            renderGrid();

            const card = document.querySelector('.site-card[data-site-id="test-site"]');
            expect(card.classList.contains("is-compact")).toBe(true);
            expect(card.querySelector(".card-media")).toBeNull();
            expect(card.querySelector(".description")).toBeNull();
            expect(card.querySelector(".compact-thumb")).not.toBeNull();
            expect(card.querySelector(".card-toggle").getAttribute("aria-expanded")).toBe("false");
        });

        it("uses the thumbnail image for the compact card", () => {
            localStorage.setItem("starredSites", JSON.stringify(["test-site"]));
            resetStarredCache();
            renderGrid();

            const thumb = document.querySelector('.site-card[data-site-id="test-site"] .compact-thumb');
            expect(thumb.getAttribute("style")).toContain("test_light_img_t.webp");
            expect(thumb.getAttribute("style")).toContain("test_dark_img_t.webp");
        });

        it("expands a compact card on demand", () => {
            localStorage.setItem("starredSites", JSON.stringify(["test-site"]));
            resetStarredCache();
            renderGrid();

            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click();

            const card = document.querySelector('.site-card[data-site-id="test-site"]');
            expect(card.classList.contains("is-compact")).toBe(false);
            expect(card.querySelector(".description").textContent).toBe("A test site description.");
            // Still starred, so it stays in the starred section.
            expect(document.querySelector(".grid-section.starred-section .site-card").dataset.siteId).toBe("test-site");
        });

        it("collapses an expanded starred card again", () => {
            star("test-site");
            renderGrid();

            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click(); // -> full
            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click(); // -> compact

            expect(document.querySelector('.site-card[data-site-id="test-site"]').classList).toContain("is-compact");
        });

        it("keeps focus on the toggle after it is used", () => {
            star("test-site");
            renderGrid();
            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click();

            expect(document.activeElement.dataset.toggleId).toBe("test-site");
        });

        it("leaves other cards untouched when one is toggled", () => {
            star("test-site");
            renderGrid();
            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click();

            const other = document.querySelector('.site-card[data-site-id="other-site"]');
            expect(other.classList.contains("is-compact")).toBe(false);
            expect(other.querySelector(".card-toggle")).toBeNull();
        });

        it("forgets manual sizing on the next load", () => {
            star("test-site");
            renderGrid();
            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click();
            expect(document.querySelector('.site-card[data-site-id="test-site"]').classList).not.toContain(
                "is-compact",
            );

            initGrid();

            expect(document.querySelector('.site-card[data-site-id="test-site"]').classList).toContain("is-compact");
        });

        it("collapses a site as soon as it is starred", () => {
            renderGrid();
            document.querySelector('.star-button[data-star-id="test-site"]').click();

            expect(document.querySelector('.site-card[data-site-id="test-site"]').classList).toContain("is-compact");
        });

        it("forces a site back to full size when it is unstarred", () => {
            star("test-site");
            renderGrid();

            document.querySelector('.star-button[data-star-id="test-site"]').click(); // unstar

            const card = document.querySelector('.site-card[data-site-id="test-site"]');
            expect(card.classList.contains("is-compact")).toBe(false);
            expect(card.querySelector(".card-toggle")).toBeNull();
        });

        it("starts collapsed again when a site is re-starred after being expanded", () => {
            star("test-site");
            renderGrid();

            document.querySelector('.card-toggle[data-toggle-id="test-site"]').click(); // expand
            document.querySelector('.star-button[data-star-id="test-site"]').click(); // unstar
            document.querySelector('.star-button[data-star-id="test-site"]').click(); // star again

            expect(document.querySelector('.site-card[data-site-id="test-site"]').classList).toContain("is-compact");
        });
    });

    describe("starring", () => {
        it("moves a starred site into its own section and persists the choice", () => {
            renderGrid();
            document.querySelector('.star-button[data-star-id="other-site"]').click();

            expect(isStarred("other-site")).toBe(true);
            expect(JSON.parse(localStorage.getItem("starredSites"))).toEqual(["other-site"]);

            const sections = document.querySelectorAll(".grid-section");
            expect(sections).toHaveLength(2);
            expect(sections[0].querySelector(".section-heading").textContent).toContain("Starred");
            expect(sections[0].querySelectorAll(".site-card")).toHaveLength(1);
            expect(sections[0].querySelector(".site-card").dataset.siteId).toBe("other-site");
        });

        it("unstars on a second click and collapses back to a single section", () => {
            renderGrid();
            document.querySelector('.star-button[data-star-id="other-site"]').click();
            document.querySelector('.star-button[data-star-id="other-site"]').click();

            expect(isStarred("other-site")).toBe(false);
            expect(document.querySelectorAll(".grid-section")).toHaveLength(1);
            expect(document.querySelector(".section-heading").textContent).toContain("All Sites");
        });

        it("renders sites already starred in localStorage at the top", () => {
            localStorage.setItem("starredSites", JSON.stringify(["test-site"]));
            resetStarredCache();
            renderGrid();

            const firstSection = document.querySelector(".grid-section");
            expect(firstSection.classList.contains("starred-section")).toBe(true);
            expect(firstSection.querySelector(".site-card").dataset.siteId).toBe("test-site");
        });

        it("survives unparsable localStorage data", () => {
            localStorage.setItem("starredSites", "not json");
            resetStarredCache();

            expect(() => renderGrid()).not.toThrow();
            expect(document.querySelectorAll(".site-card")).toHaveLength(2);
        });
    });

    describe("filtering", () => {
        it("filters by search query across title, description and tags", () => {
            initGrid();
            const input = document.getElementById("site-search");

            input.value = "different";
            input.dispatchEvent(new Event("input"));

            const cards = document.querySelectorAll(".site-card");
            expect(cards).toHaveLength(1);
            expect(cards[0].dataset.siteId).toBe("other-site");
            expect(document.getElementById("result-count").textContent).toBe("1 of 2 sites");
        });

        it("matches every search word independently", () => {
            initGrid();
            const input = document.getElementById("site-search");

            input.value = "test description";
            input.dispatchEvent(new Event("input"));

            expect(document.querySelectorAll(".site-card")).toHaveLength(1);
        });

        it("shows an empty state when nothing matches", () => {
            initGrid();
            const input = document.getElementById("site-search");

            input.value = "nothing here";
            input.dispatchEvent(new Event("input"));

            expect(document.querySelectorAll(".site-card")).toHaveLength(0);
            expect(document.querySelector(".empty-state").textContent).toContain("nothing here");
        });

        it("clears the search from the clear button", () => {
            initGrid();
            const input = document.getElementById("site-search");
            const clearBtn = document.getElementById("search-clear");

            input.value = "different";
            input.dispatchEvent(new Event("input"));
            expect(clearBtn.hidden).toBe(false);

            clearBtn.click();

            expect(input.value).toBe("");
            expect(clearBtn.hidden).toBe(true);
            expect(document.querySelectorAll(".site-card")).toHaveLength(2);
        });

        it("filters by tag chip", () => {
            initGrid();
            expect(document.querySelectorAll(".filter-chip")).toHaveLength(4); // All, Starred, Archives, Games

            chip("Games").click();

            const cards = document.querySelectorAll(".site-card");
            expect(cards).toHaveLength(1);
            expect(cards[0].dataset.siteId).toBe("other-site");
            expect(chip("Games").classList.contains("is-active")).toBe(true);
        });

        it("filters to starred sites only, without a duplicate starred section", () => {
            initGrid();
            document.querySelector('.star-button[data-star-id="test-site"]').click();

            chip("★ Starred").click();

            expect(document.querySelectorAll(".grid-section")).toHaveLength(1);
            expect(document.querySelectorAll(".site-card")).toHaveLength(1);
            expect(document.querySelector(".site-card").dataset.siteId).toBe("test-site");
        });

        it("prompts the user to star something when the starred filter is empty", () => {
            initGrid();
            clearStarred();

            chip("★ Starred").click();

            expect(document.querySelector(".empty-state").textContent).toContain("No starred sites yet");
        });

        it("reports the full count when nothing is filtered", () => {
            initGrid();
            expect(document.getElementById("result-count").textContent).toBe("2 sites");
        });
    });
});
