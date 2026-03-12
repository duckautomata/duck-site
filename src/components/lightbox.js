export function openLightbox(imgIdLight, imgIdDark) {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");

    if (modal && modalImg) {
        const srcLight = `https://content.duck-automata.com/home/${imgIdLight}.png`;
        const srcDark = `https://content.duck-automata.com/home/${imgIdDark}.png`;

        modalImg.setAttribute("data-light-src", srcLight);
        modalImg.setAttribute("data-dark-src", srcDark);

        const currentTheme = document.documentElement.getAttribute("data-theme");
        modalImg.src = currentTheme === "dark" ? srcDark : srcLight;
        modal.style.display = "flex";
    }
}

export function closeLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    if (modal && modalImg) {
        modal.style.display = "none";
        modalImg.src = "";
        modalImg.removeAttribute("data-light-src");
        modalImg.removeAttribute("data-dark-src");
    }
}

export function initLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const closeBtn = document.querySelector(".lightbox-close");

    if (modal && closeBtn) {
        closeBtn.onclick = closeLightbox;
        modal.onclick = function (event) {
            if (event.target === modal) {
                closeLightbox();
            }
        };
    }

    // Make openLightbox available globally since inline HTML uses onclick=""
    window.openLightbox = openLightbox;
}
