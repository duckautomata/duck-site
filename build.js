import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

async function runBuild() {
    console.log("Building index.html...");
    await build({
        plugins: [viteSingleFile()],
        build: {
            emptyOutDir: true, // Wipe the dist folder clean on the first run
            rollupOptions: {
                input: "index.html",
            },
        },
    });

    console.log("Building 404.html...");
    await build({
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
