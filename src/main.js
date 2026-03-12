import "./style.css";
import { initTheme } from "./components/theme.js";
import { initLightbox } from "./components/lightbox.js";
import { renderGrid } from "./components/grid.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLightbox();
    renderGrid();
});
