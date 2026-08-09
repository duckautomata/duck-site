import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initLightbox, openLightbox, closeLightbox, stepLightbox } from "./lightbox.js";

const GROUP = [
    { light: "a_light", dark: "a_dark" },
    { light: "b_light", dark: "b_dark" },
    { light: "c_light", dark: "c_dark" },
];

describe("lightbox", () => {
    beforeEach(() => {
        document.documentElement.innerHTML = `
            <body>
                <div id="lightbox-modal" style="display: none;">
                    <img id="lightbox-img" />
                    <button class="lightbox-close">Close</button>
                    <button class="lightbox-prev" hidden>Prev</button>
                    <button class="lightbox-next" hidden>Next</button>
                    <span id="lightbox-counter" hidden></span>
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

    describe("gallery navigation", () => {
        it("hides the nav controls for a lone image", () => {
            openLightbox("site_light", "site_dark");

            expect(document.querySelector(".lightbox-prev").hidden).toBe(true);
            expect(document.querySelector(".lightbox-next").hidden).toBe(true);
            expect(document.getElementById("lightbox-counter").hidden).toBe(true);
        });

        it("opens on the clicked image within its group", () => {
            openLightbox("b_light", "b_dark", GROUP);

            expect(document.getElementById("lightbox-img").src).toContain("b_light.png");
            expect(document.getElementById("lightbox-counter").textContent).toBe("2 / 3");
            expect(document.querySelector(".lightbox-next").hidden).toBe(false);
        });

        it("steps through the group and wraps at both ends", () => {
            const modalImg = document.getElementById("lightbox-img");
            openLightbox("a_light", "a_dark", GROUP);

            stepLightbox(1);
            expect(modalImg.src).toContain("b_light.png");

            stepLightbox(-1);
            stepLightbox(-1);
            expect(modalImg.src).toContain("c_light.png");

            stepLightbox(1);
            expect(modalImg.src).toContain("a_light.png");
        });

        it("navigates and closes with the keyboard", () => {
            initLightbox();
            const modal = document.getElementById("lightbox-modal");
            const modalImg = document.getElementById("lightbox-img");
            openLightbox("a_light", "a_dark", GROUP);

            document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
            expect(modalImg.src).toContain("b_light.png");

            document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
            expect(modalImg.src).toContain("a_light.png");

            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
            expect(modal.style.display).toBe("none");
        });

        it("ignores keyboard input while closed", () => {
            initLightbox();
            const modal = document.getElementById("lightbox-modal");

            document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

            expect(modal.style.display).toBe("none");
        });

        it("locks page scrolling while open", () => {
            openLightbox("a_light", "a_dark", GROUP);
            expect(document.body.classList.contains("lightbox-open")).toBe(true);

            closeLightbox();
            expect(document.body.classList.contains("lightbox-open")).toBe(false);
        });
    });
});
