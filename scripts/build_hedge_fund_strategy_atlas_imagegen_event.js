const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "hedge-fund-strategy-atlas-imagegen-event";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const ORIGINALS_DIR = path.join(IMG_DIR, "originals");
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const slides = [
  {
    no: 1,
    title: "HEDGE FUND STRATEGY ATLAS",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133b6dfe748191b0ed744036756bc1.png",
  },
  {
    no: 2,
    title: "NOT ONE ASSET CLASS",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133bfe82848191b3755ec78c7ca932.png",
  },
  {
    no: 3,
    title: "STRATEGY MAP",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133c55b888819187944d313a9c1bc5.png",
  },
  {
    no: 4,
    title: "FIVE-YEAR REGIME READOUT",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a1337facbe88191ab612266e18f5468.png",
  },
  {
    no: 5,
    title: "EQUITY HEDGE",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133834eba48191880429fc94cb21af.png",
  },
  {
    no: 6,
    title: "EVENT-DRIVEN",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133873b310819181afa853d71548df.png",
  },
  {
    no: 7,
    title: "RELATIVE VALUE",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a1338fa3fc481919d2f53b582ae6e66.png",
  },
  {
    no: 8,
    title: "MACRO / CTA",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a13393ccf6c8191a0bf617a28307112.png",
  },
  {
    no: 9,
    title: "MULTI-STRATEGY PODS",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a13399048bc8191909771095cbd02ff.png",
  },
  {
    no: 10,
    title: "SPECIALIST SLEEVES",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a1339d2a6948191815ced38e07182b3.png",
  },
  {
    no: 11,
    title: "ALLOCATOR PLAYBOOK",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133a14ce448191a5f7888a9d68da01.png",
  },
  {
    no: 12,
    title: "FINAL TAKEAWAY",
    source:
      "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a133a7398588191aba00e2632abe14b.png",
  },
];

async function buildContactSheet(imagePaths, outPath) {
  const thumbW = 480;
  const thumbH = 270;
  const cols = 3;
  const rows = Math.ceil(imagePaths.length / cols);
  const composites = [];
  for (let i = 0; i < imagePaths.length; i += 1) {
    const input = await sharp(imagePaths[i]).resize(thumbW, thumbH, { fit: "cover" }).png().toBuffer();
    composites.push({ input, left: (i % cols) * thumbW, top: Math.floor(i / cols) * thumbH });
  }
  await sharp({
    create: { width: cols * thumbW, height: rows * thumbH, channels: 4, background: "#050707" },
  })
    .composite(composites)
    .png()
    .toFile(outPath);
}

async function main() {
  [IMG_DIR, ORIGINALS_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const finalImages = [];
  for (const slide of slides) {
    if (!fs.existsSync(slide.source)) {
      throw new Error(`Missing generated source for slide ${slide.no}: ${slide.source}`);
    }
    const name = `slide-${String(slide.no).padStart(2, "0")}.png`;
    const originalOut = path.join(ORIGINALS_DIR, name);
    const finalOut = path.join(IMG_DIR, name);
    fs.copyFileSync(slide.source, originalOut);
    await sharp(slide.source).resize(1920, 1080, { fit: "cover", position: "center" }).png().toFile(finalOut);
    finalImages.push(finalOut);
  }

  const contactPath = path.join(IMG_DIR, "contact-sheet.png");
  await buildContactSheet(finalImages, contactPath);

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "QuantSeras";
  pptx.subject = "Hedge fund strategy atlas event edition generated with image generator slide images";
  pptx.title = "Hedge Fund Strategy Atlas - Imagegen Event Edition";
  pptx.lang = "en-US";
  for (const img of finalImages) {
    const page = pptx.addSlide();
    page.background = { color: "050707" };
    page.addImage({ path: img, x: 0, y: 0, w: 13.333333, h: 7.5 });
  }
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });

  fs.writeFileSync(
    path.join(NOTES_DIR, `${OUT_NAME}-outline.md`),
    [
      "# Hedge Fund Strategy Atlas - Image Generator Event Edition",
      "",
      "All 12 slides are generated presentation slide images. Code is used only to copy, resize, create a contact sheet, and package the PPTX.",
      "",
      ...slides.map((s) => `${String(s.no).padStart(2, "0")}. ${s.title}`),
      "",
      `PPTX: outputs/${OUT_NAME}.pptx`,
      `Images: assets/images/${OUT_NAME}/slide-01.png ... slide-${String(slides.length).padStart(2, "0")}.png`,
      `Contact sheet: assets/images/${OUT_NAME}/contact-sheet.png`,
    ].join("\n")
  );

  console.log(`Saved PPTX: ${path.join(OUT_DIR, `${OUT_NAME}.pptx`)}`);
  console.log(`Saved contact sheet: ${contactPath}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
