import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
    appType: "mpa",
    test: {
        environment: "jsdom",
    },
    plugins: [
        {
            name: "static-404",
            configureServer(server) {
                return () => {
                    server.middlewares.use(async (req, res, next) => {
                        if (!req.headers.accept?.includes("text/html")) return next();

                        let file = (req.url === "/" ? "/index.html" : req.url.split("?")[0]).slice(1);
                        if (!fs.existsSync(file)) file += ".html"; // support extensionless routes

                        const is404 = !fs.existsSync(file) || !fs.statSync(file).isFile();
                        res.statusCode = is404 ? 404 : 200;
                        res.setHeader("Content-Type", "text/html");

                        const html = fs.readFileSync(is404 ? "404.html" : file, "utf-8");
                        res.end(await server.transformIndexHtml(req.url, html));
                    });
                };
            },
            configurePreviewServer(server) {
                return () => {
                    server.middlewares.use((req, res, next) => {
                        if (!req.headers.accept?.includes("text/html")) return next();

                        let file = (req.url === "/" ? "/index.html" : req.url.split("?")[0]).slice(1);
                        if (!fs.existsSync(path.resolve("dist", file))) file += ".html";

                        const filePath = path.resolve("dist", file);
                        const is404 = !fs.existsSync(filePath) || !fs.statSync(filePath).isFile();
                        res.statusCode = is404 ? 404 : 200;
                        res.setHeader("Content-Type", "text/html");

                        res.end(fs.readFileSync(is404 ? "dist/404.html" : filePath, "utf-8"));
                    });
                };
            },
        },
    ],
});
