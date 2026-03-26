import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderGrid } from "./grid.js";

vi.mock("../data/sites.js", () => ({
    sites: [
        {
            title: "Test Site",
            url: "./test/",
            description: "A test site description.",
            displayImageLight: "test_light_img",
            displayImageDark: "test_dark_img",
            exampleImages: [{ light: "ex_light_1", dark: "ex_dark_1" }],
        },
    ],
}));

describe("grid", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="site-grid"></div>';
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("renders grid successfully if element exists", () => {
        renderGrid();
        const grid = document.getElementById("site-grid");

        expect(grid.innerHTML).toContain("Test Site");
        expect(grid.innerHTML).toContain("A test site description.");
        expect(grid.innerHTML).toContain("./test/");

        // Check display image
        expect(grid.innerHTML).toContain("test_light_img_p.webp");
        expect(grid.innerHTML).toContain("test_dark_img_p.webp");

        // Check example images
        expect(grid.innerHTML).toContain("Examples");
        expect(grid.innerHTML).toContain("ex_light_1_t.webp");
        expect(grid.innerHTML).toContain("ex_dark_1_t.webp");
    });

    it("does nothing if grid element is missing", () => {
        document.body.innerHTML = "";
        expect(() => renderGrid()).not.toThrow();
    });
});
