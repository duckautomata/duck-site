import "./style.css";
import { initTheme } from "./components/theme.js";
import { initLightbox } from "./components/lightbox.js";
import { renderGrid } from "./components/grid.js";
import { initEnvironmentBadge } from "./components/badge.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLightbox();
    renderGrid();
    initEnvironmentBadge();
});
