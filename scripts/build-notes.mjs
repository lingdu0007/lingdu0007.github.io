import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const notesMdDir = path.join(rootDir, "notes-md");
const notesOutDir = path.join(rootDir, "notes");
const templatePath = path.join(rootDir, "templates", "note-shell.html");
const indexPath = path.join(rootDir, "index.html");
const notFoundPath = path.join(rootDir, "404.html");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const siteBase = "https://lingdu0007.github.io";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseFrontmatter(source, filePath) {
  const normalized = source.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    throw new Error(`${filePath} is missing frontmatter`);
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`${filePath} has unclosed frontmatter`);
  }
  const rawFrontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const data = {};
  let currentArrayKey = null;

  for (const rawLine of rawFrontmatter.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;
    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch) {
      if (!currentArrayKey) {
        throw new Error(`${filePath} has array item without key`);
      }
      data[currentArrayKey].push(arrayMatch[1].trim());
      continue;
    }
    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!keyValueMatch) {
      throw new Error(`${filePath} has invalid frontmatter line: ${line}`);
    }
    const [, key, rawValue = ""] = keyValueMatch;
    if (rawValue === "") {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }
    data[key] = rawValue.trim();
    currentArrayKey = null;
  }

  return { data, body };
}

function applyInlineMarkdown(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return output;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`          <p>${applyInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!listType) return;
    html.push(`          </${listType}>`);
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      closeList();
      html.push(`          <h2>${applyInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      closeList();
      html.push(`          <h3>${applyInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (/^-\s+/.test(line)) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("          <ul>");
      }
      html.push(`            <li>${applyInlineMarkdown(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("          <ol>");
      }
      html.push(`            <li>${applyInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();

  return html.join("\n");
}

function replaceRegion(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing marker pair: ${startMarker} / ${endMarker}`);
  }
  const before = source.slice(0, start + startMarker.length);
  const after = source.slice(end);
  return `${before}\n${replacement}\n${after}`;
}

function indentBlock(text, prefix) {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function renderRelatedLinks(note, allNotes) {
  return note.related
    .map((slug) => {
      const related = allNotes.find((item) => item.slug === slug);
      if (!related) {
        throw new Error(`Unknown related slug "${slug}" referenced by ${note.slug}`);
      }
      return [
        `            <a class="article-nav-link" href="${related.slug}.html">`,
        `              <strong>${escapeHtml(related.title)}</strong>`,
        `              <span>${escapeHtml(related.eyebrow)}</span>`,
        "            </a>",
      ].join("\n");
    })
    .join("\n");
}

function renderIndexCards(notes) {
  return notes
    .map((note) =>
      [
        `          <a class="note-card reveal" href="notes/${note.slug}.html">`,
        `            <span class="note-meta">${escapeHtml(note.cardEyebrow)}</span>`,
        `            <h3>${escapeHtml(note.cardTitle)}</h3>`,
        `            <p>`,
        `              ${escapeHtml(note.cardSummary)}`,
        `            </p>`,
        `            <div class="note-arrow">继续阅读 →</div>`,
        "          </a>",
      ].join("\n"),
    )
    .join("\n\n");
}

function render404Cards(notes) {
  return notes
    .map((note, index) =>
      [
        `            <a class="entry-card" href="notes/${note.slug}.html">`,
        `              <span class="entry-meta">Notes ${String(index + 1).padStart(2, "0")}</span>`,
        `              <strong>${escapeHtml(note.title)}</strong>`,
        `              <p>${escapeHtml(note.notFoundSummary)}</p>`,
        "            </a>",
      ].join("\n"),
    )
    .join("\n");
}

function renderSitemap(notes) {
  const urls = [
    { loc: `${siteBase}/`, changefreq: "weekly", priority: "1.0" },
    ...notes.map((note) => ({
      loc: `${siteBase}/notes/${note.slug}.html`,
      changefreq: "monthly",
      priority: "0.8",
    })),
  ];

  const body = urls
    .map(
      ({ loc, changefreq, priority }) => [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
      ].join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  const [template, indexSource, notFoundSource] = await Promise.all([
    fs.readFile(templatePath, "utf8"),
    fs.readFile(indexPath, "utf8"),
    fs.readFile(notFoundPath, "utf8"),
  ]);

  const noteFiles = (await fs.readdir(notesMdDir))
    .filter((name) => name.endsWith(".md"))
    .sort();

  const notes = [];

  for (const fileName of noteFiles) {
    const filePath = path.join(notesMdDir, fileName);
    const source = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(source, fileName);
    const required = [
      "slug",
      "title",
      "description",
      "date",
      "theme",
      "readingTime",
      "eyebrow",
      "intro",
      "callout",
      "cardEyebrow",
      "cardTitle",
      "cardSummary",
      "notFoundSummary",
    ];
    for (const key of required) {
      if (!data[key] || (Array.isArray(data[key]) && data[key].length === 0)) {
        throw new Error(`${fileName} missing required frontmatter key "${key}"`);
      }
    }
    notes.push({
      ...data,
      related: Array.isArray(data.related) ? data.related : [],
      bodyHtml: markdownToHtml(body),
    });
  }

  for (const note of notes) {
    const html = template
      .replaceAll("{{title}}", escapeHtml(note.title))
      .replaceAll("{{description}}", escapeHtml(note.description))
      .replaceAll("{{canonicalUrl}}", `${siteBase}/notes/${note.slug}.html`)
      .replaceAll("{{eyebrow}}", escapeHtml(note.eyebrow))
      .replaceAll("{{intro}}", escapeHtml(note.intro))
      .replaceAll("{{date}}", escapeHtml(note.date))
      .replaceAll("{{theme}}", escapeHtml(note.theme))
      .replaceAll("{{readingTime}}", escapeHtml(note.readingTime))
      .replaceAll("{{callout}}", escapeHtml(note.callout))
      .replaceAll("{{bodyHtml}}", note.bodyHtml)
      .replaceAll("{{relatedLinks}}", renderRelatedLinks(note, notes));

    const outputPath = path.join(notesOutDir, `${note.slug}.html`);
    const generated = `<!-- Generated from notes-md/${note.slug}.md by scripts/build-notes.mjs -->\n${html}\n`;
    await fs.writeFile(outputPath, generated, "utf8");
  }

  const nextIndex = replaceRegion(
    indexSource,
    "<!-- NOTES_GRID_START -->",
    "<!-- NOTES_GRID_END -->",
    renderIndexCards(notes),
  );
  const next404 = replaceRegion(
    notFoundSource,
    "<!-- NOTES_404_CARDS_START -->",
    "<!-- NOTES_404_CARDS_END -->",
    render404Cards(notes),
  );

  await Promise.all([
    fs.writeFile(indexPath, nextIndex, "utf8"),
    fs.writeFile(notFoundPath, next404, "utf8"),
    fs.writeFile(sitemapPath, renderSitemap(notes), "utf8"),
  ]);

  const summary = {
    notes: notes.map((note) => ({
      slug: note.slug,
      html: `notes/${note.slug}.html`,
      source: `notes-md/${note.slug}.md`,
    })),
    updated: ["index.html", "404.html", "sitemap.xml"],
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
