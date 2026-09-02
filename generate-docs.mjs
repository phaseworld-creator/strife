import { readdir, readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { join } from "path";

const pluginsDir = "./plugins";
const docsDir = "./docs";
const distDir = "./dist";

const plugins = await readdir(pluginsDir);

for (const plug of plugins) {
    const manifestPath = join(pluginsDir, plug, "manifest.json");
    try {
        const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
        const pluginDir = join(docsDir, plug);
        await mkdir(pluginDir, { recursive: true });

        const author = manifest.authors?.[0];
        const authorName = author?.name ?? "Unknown";
        const authorId = author?.id ?? "";
        const description = manifest.description ?? "No description provided.";
        const icon = manifest.vendetta?.icon ?? "";

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${manifest.name} - Strife Plugins</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #1a1a2e;
            color: #eaeaea;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background: #16213e;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 8px;
            color: #fff;
        }
        .author {
            color: #888;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }
        .description {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #ccc;
            margin-bottom: 30px;
        }
        .back {
            display: inline-block;
            padding: 10px 20px;
            background: #0f3460;
            color: #e94560;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
        }
        .back:hover {
            background: #1a508b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${manifest.name}</h1>
        <p class="author">by ${authorName}${authorId ? ` (${authorId})` : ""}</p>
        <p class="description">${description}</p>
        <a href="/strife/" class="back">&larr; Back to all plugins</a>
    </div>
</body>
</html>`;

        await writeFile(join(pluginDir, "index.html"), html);

        const builtPluginDir = join(distDir, plug);
        try {
            const builtFiles = await readdir(builtPluginDir);
            for (const file of builtFiles) {
                await copyFile(join(builtPluginDir, file), join(pluginDir, file));
            }
            console.log(`Copied built files for ${manifest.name}`);
        } catch (e) {
            console.error(`Failed to copy built files for ${plug}:`, e);
        }

        console.log(`Generated page for ${manifest.name}`);
    } catch (e) {
        console.error(`Failed to generate page for ${plug}:`, e);
    }
}

// Generate main index
const pluginCards = plugins.map(plug => {
    const manifestPath = join(pluginsDir, plug, "manifest.json");
    return readFile(manifestPath, "utf-8").then(raw => {
        const manifest = JSON.parse(raw);
        const author = manifest.authors?.[0];
        const authorName = author?.name ?? "Unknown";
        return `
        <div class="plugin-card">
            <h2><a href="/strife/${plug}/">${manifest.name}</a></h2>
            <p class="plugin-desc">${manifest.description ?? "No description."}</p>
            <p class="plugin-author">by ${authorName}</p>
        </div>`;
    });
}).map(p => p.catch(() => ""));

const cardsHtml = (await Promise.all(pluginCards)).join("\n");

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strife Plugins</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #1a1a2e;
            color: #eaeaea;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 40px;
            color: #e94560;
        }
        .plugin-card {
            background: #16213e;
            border-radius: 10px;
            padding: 24px;
            margin-bottom: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .plugin-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(233, 69, 96, 0.2);
        }
        .plugin-card h2 {
            margin-bottom: 8px;
        }
        .plugin-card h2 a {
            color: #fff;
            text-decoration: none;
        }
        .plugin-card h2 a:hover {
            color: #e94560;
        }
        .plugin-desc {
            color: #aaa;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        .plugin-author {
            color: #666;
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Strife Plugins</h1>
        ${cardsHtml}
    </div>
</body>
</html>`;

await writeFile(join(docsDir, "index.html"), indexHtml);
console.log("Generated main index page");
