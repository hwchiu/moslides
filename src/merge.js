/**
 * merge.js — Merge all 6 PPTX parts into a final combined deck.
 * Runs each part script then uses python-pptx to concatenate slides.
 * Usage: node src/merge.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PARTS = [
  "src/part1.js",
  "src/part2.js",
  "src/part3.js",
  "src/part4.js",
  "src/part5.js",
  "src/part6.js",
  "src/part7_metrics.js",
  "src/part8_logs.js",
  "src/part9_tracing.js",
  "src/part10_sre.js",
];

const OUTPUT_DIR = "output";
const FINAL_OUTPUT = path.join(OUTPUT_DIR, "cloud_native_slides_final.pptx");

function run(label, cmd) {
  console.log(`\n▶  ${label}`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`✅  ${label} done`);
  } catch (err) {
    console.error(`❌  ${label} failed`);
    process.exit(1);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Generate all part PPTX files
  for (const part of PARTS) {
    run(`Generate ${part}`, `node ${part}`);
  }

  // Step 2: Merge using python-pptx
  const partFiles = [
    "output/part1.pptx",
    "output/part2.pptx",
    "output/part3.pptx",
    "output/part4.pptx",
    "output/part5.pptx",
    "output/part6.pptx",
    "output/part7_metrics.pptx",
    "output/part8_logs.pptx",
    "output/part9_tracing.pptx",
    "output/part10_sre.pptx",
  ];

  const pythonScript = `
import copy
from pptx import Presentation
from pptx.util import Emu

inputs = ${JSON.stringify(partFiles)}
output = "${FINAL_OUTPUT}"

def copy_slide(dest_prs, src_slide):
    # Use first available layout
    layout = dest_prs.slide_layouts[0]
    new_slide = dest_prs.slides.add_slide(layout)

    # Clear all auto-added placeholder shapes
    sp_tree = new_slide.shapes._spTree
    for el in list(sp_tree):
        sp_tree.remove(el)

    # Copy shapes from source
    src_tree = src_slide.shapes._spTree
    for el in src_tree:
        sp_tree.append(copy.deepcopy(el))

    # Copy background XML
    src_bg_el = src_slide.background._element
    dst_bg_el = new_slide.background._element
    for child in list(dst_bg_el):
        dst_bg_el.remove(child)
    for child in src_bg_el:
        dst_bg_el.append(copy.deepcopy(child))

merged = Presentation(inputs[0])
total = len(merged.slides)

for filepath in inputs[1:]:
    prs = Presentation(filepath)
    for slide in prs.slides:
        copy_slide(merged, slide)
        total += 1

merged.save(output)
print(f"✅  Merged {total} slides → {output}")
`;

  const tmpScript = path.join(OUTPUT_DIR, "_merge_tmp.py");
  fs.writeFileSync(tmpScript, pythonScript);

  console.log("\n▶  Merging all parts with python-pptx...");
  try {
    execSync(`python3 ${tmpScript}`, { stdio: "inherit" });
    console.log(`\n🎉  Final deck: ${FINAL_OUTPUT}`);
  } catch (err) {
    console.error("❌  Merge failed. Trying alternative approach...");

    // Fallback: use pptx-merge npm package if available, or report paths
    console.log("\n📦  Individual part files are available:");
    for (const f of partFiles) {
      const size = fs.existsSync(f)
        ? `${(fs.statSync(f).size / 1024).toFixed(0)} KB`
        : "not found";
      console.log(`   ${f} (${size})`);
    }
  }

  // Cleanup temp file
  try {
    fs.unlinkSync(tmpScript);
  } catch (_) {}
}

main();
