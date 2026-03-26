import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initTheme } from "./theme.js";

describe("theme", () => {
    beforeEach(() => {
        document.documentElement.innerHTML = `
            <head></head>
            <body>
                <input type="checkbox" id="theme-toggle" />
                <img id="lightbox-img" data-light-src="light.webp" data-dark-src="dark.webp" />
            </body>
        `;
        document.documentElement.setAttribute("data-theme", "dark");
        // Use jsdom's localStorage
        localStorage.clear();
    });

    afterEach(() => {
        document.documentElement.innerHTML = "";
        localStorage.clear();
    });

    it("syncs theme toggle with current data-theme on init", () => {
        // We set data-theme to dark in beforeEach
        initTheme();
        const toggle = document.getElementById("theme-toggle");
        expect(toggle.checked).toBe(true);
    });

    it("defaults to light theme if no data-theme is set", () => {
        document.documentElement.removeAttribute("data-theme");
        initTheme();
        const toggle = document.getElementById("theme-toggle");
        expect(toggle.checked).toBe(false);
    });

    it("changes theme to dark on toggle true", () => {
        document.documentElement.setAttribute("data-theme", "light");
        initTheme();
        const toggle = document.getElementById("theme-toggle");
        expect(toggle.checked).toBe(false);

        toggle.checked = true;
        toggle.dispatchEvent(new Event("change"));

        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
        expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("changes theme to light on toggle false", () => {
        document.documentElement.setAttribute("data-theme", "dark");
        initTheme();
        const toggle = document.getElementById("theme-toggle");
        expect(toggle.checked).toBe(true); // Should be checked since it's dark

        toggle.checked = false;
        toggle.dispatchEvent(new Event("change"));

        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
        expect(localStorage.getItem("theme")).toBe("light");
    });

    it("updates modal image src when theme changes", () => {
        document.documentElement.setAttribute("data-theme", "light");
        initTheme();
        const toggle = document.getElementById("theme-toggle");
        const modalImg = document.getElementById("lightbox-img");

        modalImg.src = modalImg.getAttribute("data-light-src"); // initially light

        toggle.checked = true;
        toggle.dispatchEvent(new Event("change"));

        expect(modalImg.src).toContain("dark.webp");
    });
});
