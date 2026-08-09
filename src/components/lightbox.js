const CDN_BASE = "https://content.duck-automata.com/home";

// The set of images the lightbox can page through, plus where we currently are.
let gallery = [];
let position = 0;

function fullSrc(id) {
    return `${CDN_BASE}/${id}.png`;
}

function updateControls() {
    const counter = document.getElementById("lightbox-counter");
    const prevBtn = document.querySelector(".lightbox-prev");
    const nextBtn = document.querySelector(".lightbox-next");
    const multiple = gallery.length > 1;

    if (counter) {
        counter.textContent = multiple ? `${position + 1} / ${gallery.length}` : "";
        counter.hidden = !multiple;
    }
    [prevBtn, nextBtn].forEach((btn) => {
        if (btn) btn.hidden = !multiple;
    });
}

function show(index) {
    const modalImg = document.getElementById("lightbox-img");
    if (!modalImg || gallery.length === 0) return;

    position = (index + gallery.length) % gallery.length;
    const { light, dark } = gallery[position];

    modalImg.setAttribute("data-light-src", fullSrc(light));
    modalImg.setAttribute("data-dark-src", fullSrc(dark));
    modalImg.src = document.documentElement.getAttribute("data-theme") === "dark" ? fullSrc(dark) : fullSrc(light);
    updateControls();
}

/**
 * Opens the lightbox on a single image, optionally as part of a navigable set.
 * @param {string} imgIdLight Light theme image id.
 * @param {string} imgIdDark Dark theme image id.
 * @param {{light: string, dark: string}[]} [group] Every image the arrows can reach.
 */
export function openLightbox(imgIdLight, imgIdDark, group) {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    if (!modal || !modalImg) return;

    gallery = Array.isArray(group) && group.length > 0 ? group : [{ light: imgIdLight, dark: imgIdDark }];
    const startIndex = gallery.findIndex((img) => img.light === imgIdLight && img.dark === imgIdDark);

    show(startIndex === -1 ? 0 : startIndex);
    modal.style.display = "flex";
    document.body.classList.add("lightbox-open");
}

export function closeLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    if (!modal || !modalImg) return;

    modal.style.display = "none";
    modalImg.src = "";
    modalImg.removeAttribute("data-light-src");
    modalImg.removeAttribute("data-dark-src");
    gallery = [];
    position = 0;
    document.body.classList.remove("lightbox-open");
}

/**
 * Moves to another image in the current set. Wraps around at both ends.
 * @param {number} step How many images to move by.
 */
export function stepLightbox(step) {
    if (gallery.length > 1) show(position + step);
}

function isOpen() {
    const modal = document.getElementById("lightbox-modal");
    return !!modal && modal.style.display === "flex";
}

// Bound once for the lifetime of the page so a second init can't double-handle keys.
let keysBound = false;

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

    document.querySelector(".lightbox-prev")?.addEventListener("click", (event) => {
        event.stopPropagation();
        stepLightbox(-1);
    });
    document.querySelector(".lightbox-next")?.addEventListener("click", (event) => {
        event.stopPropagation();
        stepLightbox(1);
    });

    if (!keysBound) {
        keysBound = true;
        document.addEventListener("keydown", (event) => {
            if (!isOpen()) return;

            if (event.key === "Escape") closeLightbox();
            else if (event.key === "ArrowLeft") stepLightbox(-1);
            else if (event.key === "ArrowRight") stepLightbox(1);
        });
    }

    // Make openLightbox available globally since inline HTML uses onclick=""
    window.openLightbox = openLightbox;
}
