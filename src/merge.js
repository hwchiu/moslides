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
import copy, zipfile, shutil, os, re
from lxml import etree

inputs = ${JSON.stringify(partFiles)}
output = "${FINAL_OUTPUT}"

# ZIP-level merge: directly copy slide XML files to avoid python-pptx relationship issues
def get_slide_count(pptx_path):
    with zipfile.ZipFile(pptx_path) as z:
        return len([f for f in z.namelist()
                    if re.match(r'ppt/slides/slide[0-9]+\\.xml$', f)])

def read_presentation_rels(pptx_path):
    with zipfile.ZipFile(pptx_path) as z:
        return z.read('ppt/_rels/presentation.xml.rels').decode()

# Start with part1 as base, extract to temp dir
import tempfile
tmpdir = tempfile.mkdtemp()
base = inputs[0]

# Extract base
with zipfile.ZipFile(base, 'r') as z:
    z.extractall(tmpdir)

total_slides = get_slide_count(base)

# For each additional part, copy slide XMLs renumbered into the base
for pptx_path in inputs[1:]:
    src_count = get_slide_count(pptx_path)
    with zipfile.ZipFile(pptx_path) as src_zip:
        for i in range(1, src_count + 1):
            new_i = total_slides + i
            slide_src  = f'ppt/slides/slide{i}.xml'
            slide_rels_src = f'ppt/slides/_rels/slide{i}.xml.rels'
            slide_dst  = os.path.join(tmpdir, f'ppt/slides/slide{new_i}.xml')
            slide_rels_dst = os.path.join(tmpdir, f'ppt/slides/_rels/slide{new_i}.xml.rels')

            # Copy slide XML
            os.makedirs(os.path.dirname(slide_dst), exist_ok=True)
            with src_zip.open(slide_src) as f:
                data = f.read()
            with open(slide_dst, 'wb') as f:
                f.write(data)

            # Copy slide rels (strip notes slide rel to avoid broken references)
            os.makedirs(os.path.dirname(slide_rels_dst), exist_ok=True)
            try:
                with src_zip.open(slide_rels_src) as f:
                    rels_data = f.read().decode()
                # Remove notes slide relationships (cause repair warnings)
                rels_data = re.sub(
                    r'<Relationship[^/]*/notesSlide[^/]*/[^>]*/>', '', rels_data)
                with open(slide_rels_dst, 'w', encoding='utf-8') as f:
                    f.write(rels_data)
            except KeyError:
                # No rels file; create minimal one pointing to slideLayout1
                minimal = ('<?xml version=\\'1.0\\' encoding=\\'UTF-8\\' standalone=\\'yes\\'?>\\n'
                           '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                           '<Relationship Id="rId1" '
                           'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" '
                           'Target="../slideLayouts/slideLayout1.xml"/>'
                           '</Relationships>')
                with open(slide_rels_dst, 'w', encoding='utf-8') as f:
                    f.write(minimal)

    total_slides += src_count

# Update presentation.xml to include all slides
pres_xml_path = os.path.join(tmpdir, 'ppt/presentation.xml')
with open(pres_xml_path, 'rb') as f:
    pres_tree = etree.parse(f)

ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
sldIdLst = pres_tree.find('.//p:sldIdLst', ns)
if sldIdLst is None:
    raise RuntimeError("Cannot find sldIdLst in presentation.xml")

# Remove existing entries and rebuild
for child in list(sldIdLst):
    sldIdLst.remove(child)

# Read presentation.xml.rels to get existing rId mappings
pres_rels_path = os.path.join(tmpdir, 'ppt/_rels/presentation.xml.rels')
with open(pres_rels_path, 'rb') as f:
    rels_tree = etree.parse(f)

rels_ns = 'http://schemas.openxmlformats.org/package/2006/relationships'
existing_rels = {}
for rel in rels_tree.getroot():
    target = rel.get('Target', '')
    if 'slides/slide' in target and 'Layout' not in target and 'Master' not in target:
        m = re.search(r'slides/slide(\\d+)\\.xml', target)
        if m:
            existing_rels[int(m.group(1))] = rel.get('Id')

# Add rId entries for slides not yet in rels
max_rid = 0
for rel in rels_tree.getroot():
    rid = rel.get('Id', 'rId0')
    m = re.match(r'rId(\\d+)', rid)
    if m:
        max_rid = max(max_rid, int(m.group(1)))

slide_rid_map = dict(existing_rels)
for slide_num in range(1, total_slides + 1):
    if slide_num not in slide_rid_map:
        max_rid += 1
        new_rid = f'rId{max_rid}'
        slide_rid_map[slide_num] = new_rid
        new_rel = etree.SubElement(rels_tree.getroot(), 'Relationship')
        new_rel.set('Id', new_rid)
        new_rel.set('Type',
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide')
        new_rel.set('Target', f'slides/slide{slide_num}.xml')

# Rebuild sldIdLst
P_NS = 'http://schemas.openxmlformats.org/presentationml/2006/main'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
for i, slide_num in enumerate(range(1, total_slides + 1)):
    sld_id = etree.SubElement(sldIdLst, f'{{{P_NS}}}sldId')
    sld_id.set('id', str(256 + i))
    sld_id.set(f'{{{R_NS}}}id', slide_rid_map[slide_num])

# Save updated XMLs
with open(pres_xml_path, 'wb') as f:
    pres_tree.write(f, xml_declaration=True, encoding='UTF-8', standalone=True)
with open(pres_rels_path, 'wb') as f:
    rels_tree.write(f, xml_declaration=True, encoding='UTF-8', standalone=True)

# Also strip notes slide rels from base presentation's slides
slides_rels_dir = os.path.join(tmpdir, 'ppt/slides/_rels')
if os.path.exists(slides_rels_dir):
    for fn in os.listdir(slides_rels_dir):
        fp = os.path.join(slides_rels_dir, fn)
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        cleaned = re.sub(
            r'<Relationship[^>]*/notesSlide[^>]*/>[\\s]*', '', content)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(cleaned)

# Remove notes slide files from the merged package (avoid orphaned refs)
notes_dir = os.path.join(tmpdir, 'ppt/notesSlides')
if os.path.exists(notes_dir):
    shutil.rmtree(notes_dir)

# Repack to PPTX
if os.path.exists(output):
    os.remove(output)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zout:
    for root, dirs, files in os.walk(tmpdir):
        for file in files:
            abs_path = os.path.join(root, file)
            arcname = os.path.relpath(abs_path, tmpdir)
            zout.write(abs_path, arcname)

shutil.rmtree(tmpdir)
print(f"✅  Merged {total_slides} slides → {output}")
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
