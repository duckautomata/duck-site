import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initLightbox, openLightbox, closeLightbox } from "./lightbox.js";

describe("lightbox", () => {
    beforeEach(() => {
        document.documentElement.innerHTML = `
            <body>
                <div id="lightbox-modal" style="display: none;">
                    <img id="lightbox-img" />
                    <button class="lightbox-close">Close</button>
                </div>
            </body>
        `;
        document.documentElement.setAttribute("data-theme", "light");
    });

    afterEach(() => {
        document.documentElement.innerHTML = "";
        delete window.openLightbox;
    });

    it("initLightbox binds close button, modal click, and window scope", () => {
        initLightbox();

        expect(typeof window.openLightbox).toBe("function");

        const modal = document.getElementById("lightbox-modal");
        const modalImg = document.getElementById("lightbox-img");
        const closeBtn = document.querySelector(".lightbox-close");

        // Open it first to test closing
        openLightbox("site_light", "site_dark");
        expect(modal.style.display).toBe("flex");

        // Click close
        closeBtn.onclick();
        expect(modal.style.display).toBe("none");
        expect(modalImg.getAttribute("src")).toBe("");

        // Open again to test modal click
        openLightbox("site_light", "site_dark");
        expect(modal.style.display).toBe("flex");

        // Click modal background
        modal.onclick({ target: modal });
        expect(modal.style.display).toBe("none");
    });

    it("openLightbox sets proper sources based on light theme", () => {
        document.documentElement.setAttribute("data-theme", "light");
        openLightbox("site_light", "site_dark");

        const modal = document.getElementById("lightbox-modal");
        const modalImg = document.getElementById("lightbox-img");

        expect(modal.style.display).toBe("flex");
        expect(modalImg.getAttribute("data-light-src")).toContain("site_light.png");
        expect(modalImg.getAttribute("data-dark-src")).toContain("site_dark.png");
        expect(modalImg.src).toContain("site_light.png");
    });

    it("openLightbox sets proper sources based on dark theme", () => {
        document.documentElement.setAttribute("data-theme", "dark");
        openLightbox("site_light", "site_dark");

        const modalImg = document.getElementById("lightbox-img");

        expect(modalImg.src).toContain("site_dark.png");
    });

    it("closeLightbox hides modal and clears sources", () => {
        openLightbox("site_light", "site_dark");
        closeLightbox();

        const modal = document.getElementById("lightbox-modal");
        const modalImg = document.getElementById("lightbox-img");

        expect(modal.style.display).toBe("none");
        expect(modalImg.getAttribute("src")).toBe("");
        expect(modalImg.hasAttribute("data-light-src")).toBe(false);
        expect(modalImg.hasAttribute("data-dark-src")).toBe(false);
    });
});
