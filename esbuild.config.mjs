import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const common = {
    bundle: true,
    format: "iife",
    target: "chrome100",
    platform: "browser",
    sourcemap: false,
    minify: !watch,
    logLevel: "info",
};

const shared = await esbuild.context({
    ...common,
    entryPoints: ["src/shared/index.ts"],
    outfile: "web/shared.js",
});

const levelup = await esbuild.context({
    ...common,
    entryPoints: ["src/levelup/index.ts"],
    outfile: "web/levelup.js",
});

const stats = await esbuild.context({
    ...common,
    entryPoints: ["src/stats/index.ts"],
    outfile: "web/stats.js",
});

if (watch) {
    await Promise.all([shared.watch(), levelup.watch(), stats.watch()]);
    console.log("Watching for changes...");
} else {
    await Promise.all([shared.rebuild(), levelup.rebuild(), stats.rebuild()]);
    console.log("Build complete.");
}
