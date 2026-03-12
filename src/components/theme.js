export function initTheme() {
    // The initial theme is already set by the inline script in <head>.
    // We just need to read what it set so we can update the toggle UI.
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const themeToggle = document.getElementById("theme-toggle");

    if (themeToggle) {
        // Sync the toggle switch with the current theme
        if (currentTheme === "dark") {
            themeToggle.checked = true;
        }

        // Listen for the user clicking the toggle switch
        themeToggle.addEventListener("change", function () {
            const newTheme = this.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);

            // Update the lightbox image if it happens to be open
            const modalImg = document.getElementById("lightbox-img");
            if (modalImg && modalImg.hasAttribute("data-light-src")) {
                modalImg.src = modalImg.getAttribute(newTheme === "dark" ? "data-dark-src" : "data-light-src");
            }
        });
    }
}
