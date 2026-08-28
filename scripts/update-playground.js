/**
 * Updates all examples' @thednp/rpc dependency to the latest published
 * (npm dist-tags.latest) version. Only touches the examples' package.json,
 * never the root package.
 *
 * Usage:
 *   node scripts/update-examples.js
 *   pnpm up:examples:lib
 */

import fs from "node:fs";
import path from "node:path";
import mainPkg from "../package.json" with { type: "json" };

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const EXAMPLES_DIR = path.join(ROOT, "playground");
const NAME = "@thednp/tween";

async function latestPublished(name) {
  const res = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}`);
  if (!res.ok) throw new Error(`registry fetch failed: ${res.status}`);
  const doc = await res.json();
  return doc["dist-tags"]?.latest;
}

async function main() {
  const latest = await latestPublished(NAME);
  // const latest = mainPkg.version;
  const dep = `^${latest}`;
  let updated = 0;

  for (const dir of fs.readdirSync(EXAMPLES_DIR)) {
    const file = path.join(EXAMPLES_DIR, dir, "package.json");
    if (!fs.existsSync(file)) continue;
    const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));

    for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
      if (pkg[section]?.[NAME] && pkg[section][NAME] !== dep) {
        pkg[section][NAME] = dep;
        fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`[update-examples] ${dir}: ${NAME} -> ${dep}`);
        updated += 1;
      }
    }
  }

  if (!updated) {
    console.log(`[update-examples] ${NAME} already at ${dep} in all examples`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});