import { sites } from "../data/sites.js";

export function renderGrid() {
    const grid = document.getElementById("site-grid");
    if (!grid) return;

    sites.forEach((site) => {
        let exampleImagesHTML = "";
        if (site.exampleImages && site.exampleImages.length > 0) {
            exampleImagesHTML += `<div class="examples-label">Examples</div>`;
            exampleImagesHTML += `<div class="example-images">`;

            site.exampleImages.forEach((img) => {
                const thumbLightUrl = `https://content.duck-automata.com/home/${img.light}_t.webp`;
                const thumbDarkUrl = `https://content.duck-automata.com/home/${img.dark}_t.webp`;
                const thumbStyle = `style="--light-image: url('${thumbLightUrl}'); --dark-image: url('${thumbDarkUrl}');"`;
                const clickHandler = `onclick="openLightbox('${img.light}', '${img.dark}')"`;
                exampleImagesHTML += `<div class="example-thumb" ${thumbStyle} ${clickHandler} role="button" aria-label="View example image"></div>`;
            });
            exampleImagesHTML += `</div>`;
        }

        const displayLightUrl = `https://content.duck-automata.com/home/${site.displayImageLight}_p.webp`;
        const displayDarkUrl = `https://content.duck-automata.com/home/${site.displayImageDark}_p.webp`;
        const displayLinkStyle = `style="--light-image: url('${displayLightUrl}'); --dark-image: url('${displayDarkUrl}');"`;

        const cardHTML = `
            <article class="site-card">
                <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="display-image-link" ${displayLinkStyle}></a>
                <div class="card-content">
                    <h3><a href="${site.url}" target="_blank" rel="noopener noreferrer">${site.title}</a></h3>
                    <p class="description">${site.description || ""}</p>
                    ${exampleImagesHTML}
                </div>
            </article>
        `;
        grid.innerHTML += cardHTML;
    });
}
