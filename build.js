import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const args = process.argv.slice(2);
const modeIndex = args.indexOf("--mode");
const mode = modeIndex !== -1 ? args[modeIndex + 1] : "production";

async function runBuild() {
    console.log(`Building index.html (mode: ${mode})...`);
    await build({
        mode,
        plugins: [viteSingleFile()],
        build: {
            emptyOutDir: true, // Wipe the dist folder clean on the first run
            rollupOptions: {
                input: "index.html",
            },
        },
    });

    console.log(`Building 404.html (mode: ${mode})...`);
    await build({
        mode,
        plugins: [viteSingleFile()],
        build: {
            emptyOutDir: false, // VERY IMPORTANT: Don't wipe the index.html we just built!
            rollupOptions: {
                input: "404.html",
            },
        },
    });

    console.log("Build complete!");
}

runBuild();
