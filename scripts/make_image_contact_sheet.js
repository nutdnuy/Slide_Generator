const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = path.resolve(__dirname, "..");
const project = process.argv[2];
const count = Number(process.argv[3] || 20);

if (!project) {
  console.error("Usage: node scripts/make_image_contact_sheet.js <project> [count]");
  process.exit(2);
}

const imageDir = path.join(ROOT, "assets", "images", project, "final");
const out = path.join(ROOT, "assets", "images", project, "contact-sheet.png");
const cols = 4;
const thumbW = 480;
const thumbH = 270;
const labelH = 34;
const rows = Math.ceil(count / cols);

async function main() {
  const composites = [];
  for (let i = 1; i <= count; i++) {
    const file = path.join(imageDir, `slide-${String(i).padStart(2, "0")}.png`);
    if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
    const left = ((i - 1) % cols) * thumbW;
    const top = Math.floor((i - 1) / cols) * (thumbH + labelH);
    composites.push({ input: await sharp(file).resize(thumbW, thumbH).png().toBuffer(), left, top: top + labelH });
    composites.push({
      input: Buffer.from(`<svg width="${thumbW}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="16" y="23" fill="#fff" font-size="20" font-family="Arial">Slide ${String(i).padStart(2, "0")}</text></svg>`),
      left,
      top,
    });
  }

  await sharp({
    create: {
      width: cols * thumbW,
      height: rows * (thumbH + labelH),
      channels: 4,
      background: "#080808",
    },
  })
    .composite(composites)
    .png()
    .toFile(out);
  console.log(out);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
