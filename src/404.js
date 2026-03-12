import "./style.css";
import { initTheme } from "./components/theme.js";

// The 404 page only needs the theme logic
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
});
