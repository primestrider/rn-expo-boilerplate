/**
 * Strips the boilerplate down to its core, and brings examples back on demand.
 *
 *   npm run reset-project                      move every example into .examples/
 *   npm run add-example                        list the examples
 *   npm run add-example -- camera features     restore examples + their packages
 *
 * Flags:
 *   --skip-install   edit package.json only; run `npm install` yourself
 *   --force          reset even with uncommitted changes
 *
 * What an example owns is declared in `modules.mjs`.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { modules, STORE_DIR, TEMPLATES } from "./modules.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * The commit reset ran on. Tracked, unlike the store, so a fresh clone of the
 * reset project can still restore examples out of git history.
 */
const SOURCE_FILE = "scripts/boilerplate/source.json";

const abs = (rel) => path.join(ROOT, rel);
const byId = new Map(modules.map((module) => [module.id, module]));

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

/** Repo-relative, forward-slashed paths of every file under `dir`. */
function walk(dir) {
  if (!fs.existsSync(abs(dir))) return [];
  if (fs.statSync(abs(dir)).isFile()) return [dir];

  return fs
    .readdirSync(abs(dir), { withFileTypes: true })
    .flatMap((entry) => walk(path.posix.join(dir, entry.name)));
}

/** The module with the most specific entry matching `file`, or null. */
function ownerOf(file) {
  let owner = null;
  let longest = -1;

  for (const module of modules) {
    for (const entry of module.files) {
      const hit = entry.endsWith("/") ? file.startsWith(entry) : file === entry;
      if (hit && entry.length > longest) {
        owner = module;
        longest = entry.length;
      }
    }
  }

  return owner;
}

/** Example files currently in the project, keyed by path. */
function projectFiles() {
  const files = new Map();

  for (const module of modules) {
    for (const entry of module.files) {
      for (const file of walk(entry.replace(/\/$/, ""))) {
        files.set(file, ownerOf(file));
      }
    }
  }

  return files;
}

const sameText = (a, b) =>
  a.toString("utf8").replace(/\r\n/g, "\n") === b.toString("utf8").replace(/\r\n/g, "\n");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), "utf8"));
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
}

// ---------------------------------------------------------------------------
// Line patches

function readLines(rel) {
  const text = fs.readFileSync(abs(rel), "utf8");
  return { lines: text.split(/\r?\n/), eol: text.includes("\r\n") ? "\r\n" : "\n" };
}

function removeLine({ file, line }) {
  const { lines, eol } = readLines(file);
  const index = lines.findIndex((current) => current.trim() === line.trim());
  if (index < 0) return false;

  lines.splice(index, 1);
  fs.writeFileSync(abs(file), lines.join(eol));
  return true;
}

function insertLine({ file, line, after }) {
  const { lines, eol } = readLines(file);
  if (lines.some((current) => current.trim() === line.trim())) return;

  const anchor = lines.findIndex((current) => current.trim() === after.trim());
  if (anchor < 0) {
    console.warn(`  ! ${file}: add this line by hand (anchor not found):\n      ${line}`);
    return;
  }

  lines.splice(anchor + 1, 0, line);
  fs.writeFileSync(abs(file), lines.join(eol));
}

// ---------------------------------------------------------------------------
// Packages

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Which of `packages` some remaining source or test file still imports. */
function stillImported(packages) {
  const sources = [...walk("src"), ...walk("tests")]
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
    .map((file) => fs.readFileSync(abs(file), "utf8"))
    .join("\n");

  return new Set(
    packages.filter((name) =>
      new RegExp(
        `\\b(?:from|import|require|mock)\\s*\\(?\\s*["']${escapeRegExp(name)}(?:/[^"']*)?["']`,
      ).test(sources),
    ),
  );
}

/** Runs an npm/npx command. Arguments are package names from `modules.mjs`. */
function run(command) {
  console.log(`\n$ ${command}`);
  // A shell resolves npm/npx to their .cmd shims on Windows.
  const result = spawnSync(command, { cwd: ROOT, stdio: "inherit", shell: true });
  if (result.status !== 0) fail(`\`${command}\` failed`);
}

// ---------------------------------------------------------------------------
// reset

function reset({ force, skipInstall }) {
  if (walk(STORE_DIR).length > 0) {
    fail(`${STORE_DIR}/ already holds examples — this project was already reset.`);
  }

  let commit = null;
  let dirty = "";
  try {
    commit = git(["rev-parse", "HEAD"]).toString().trim();
    dirty = git(["status", "--porcelain"]).toString().trim();
  } catch {
    console.warn(`  ! No git history: examples will only live in ${STORE_DIR}/.`);
  }
  if (dirty && !force) {
    fail("Commit or stash your changes first, so the reset can be undone with git (or pass --force).");
  }

  const files = projectFiles();
  if (files.size === 0) fail("No example files found — nothing to reset.");

  for (const file of files.keys()) {
    const target = path.join(abs(STORE_DIR), file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(abs(file), target);

    // Drop directories the move emptied, up to the project root.
    for (let dir = path.dirname(abs(file)); dir !== ROOT; dir = path.dirname(dir)) {
      if (fs.readdirSync(dir).length > 0) break;
      fs.rmdirSync(dir);
    }
  }

  for (const [file, template] of Object.entries(TEMPLATES)) {
    if (!files.has(file)) continue;
    fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
    fs.copyFileSync(abs(template), abs(file));
  }

  for (const patch of modules.flatMap((module) => module.lines ?? [])) {
    if (!removeLine(patch)) console.warn(`  ! ${patch.file}: line not found: ${patch.line.trim()}`);
  }

  if (commit) fs.writeFileSync(abs(SOURCE_FILE), JSON.stringify({ commit }, null, 2) + "\n");

  const { dependencies } = readJson("package.json");
  const candidates = [...new Set(modules.flatMap((module) => module.packages ?? []))].filter(
    (name) => name in dependencies,
  );
  const kept = stillImported(candidates);
  const removed = candidates.filter((name) => !kept.has(name));

  if (removed.length > 0) {
    if (skipInstall) {
      const pkg = readJson("package.json");
      for (const name of removed) delete pkg.dependencies[name];
      fs.writeFileSync(abs("package.json"), JSON.stringify(pkg, null, 2) + "\n");
    } else {
      run(`npm uninstall ${removed.join(" ")}`);
    }
  }

  console.log(`\n✔ Moved ${files.size} example files into ${STORE_DIR}/`);
  if (removed.length > 0) console.log(`✔ Removed ${removed.length} packages: ${removed.join(", ")}`);
  if (kept.size > 0) console.log(`  Kept (still imported): ${[...kept].join(", ")}`);
  if (skipInstall && removed.length > 0) console.log("  Run `npm install` to sync node_modules.");
  console.log("\n  Restore any of them with `npm run add-example -- <name>` (list: `npm run add-example`).");
  console.log("  Native projects are stale now — run `npx expo prebuild --clean` before the next native build.\n");
}

// ---------------------------------------------------------------------------
// add

/** The examples to restore, with everything they need, in manifest order. */
function resolveModules(ids) {
  const selected = new Set();

  const visit = (id) => {
    if (id === "all" || id === "*") {
      modules.filter((module) => !module.hidden).forEach((module) => visit(module.id));
      return;
    }

    const module = byId.get(id);
    if (!module) fail(`Unknown example "${id}". Run \`npm run add-example\` to see the list.`);
    if (selected.has(id)) return;

    selected.add(id);
    visit("base");
    (module.requires ?? []).forEach(visit);
  };

  ids.forEach(visit);
  return modules.filter((module) => selected.has(module.id));
}

/** The store, or — when it is gone, as in a fresh clone — the commit reset ran on. */
function openSource() {
  if (walk(STORE_DIR).length > 0) {
    const root = abs(STORE_DIR);
    return {
      files: walk(STORE_DIR).map((file) => file.slice(STORE_DIR.length + 1)),
      read: (file) => fs.readFileSync(path.join(root, file)),
    };
  }

  const commit = fs.existsSync(abs(SOURCE_FILE)) ? readJson(SOURCE_FILE).commit : null;
  if (!commit) fail(`${STORE_DIR}/ is missing and ${SOURCE_FILE} names no commit to restore from.`);

  try {
    git(["cat-file", "-e", `${commit}^{commit}`]);
  } catch {
    fail(`${STORE_DIR}/ is missing and commit ${commit} is not in this repository's history.`);
  }

  console.log(`  ${STORE_DIR}/ not found — restoring from commit ${commit.slice(0, 7)}.`);
  return {
    files: git(["ls-tree", "-r", "--name-only", commit]).toString().split("\n").filter(Boolean),
    read: (file) => git(["show", `${commit}:${file}`]),
  };
}

function add(ids, { skipInstall }) {
  const selected = resolveModules(ids);
  const selectedIds = new Set(selected.map((module) => module.id));
  const source = openSource();
  const files = source.files.filter((file) => selectedIds.has(ownerOf(file)?.id));

  const restored = [];
  for (const file of files) {
    const content = source.read(file);

    if (fs.existsSync(abs(file))) {
      const current = fs.readFileSync(abs(file));
      if (sameText(current, content)) continue;

      if (!isTemplate(file)) {
        console.warn(`  ! Skipped ${file}: it exists and has your changes.`);
        continue;
      }
    }

    fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
    fs.writeFileSync(abs(file), content);
    restored.push(file);
  }

  for (const patch of selected.flatMap((module) => module.lines ?? [])) insertLine(patch);

  const { dependencies } = readJson("package.json");
  const missing = [...new Set(selected.flatMap((module) => module.packages ?? []))].filter(
    (name) => !(name in dependencies),
  );

  if (missing.length > 0 && !skipInstall) run(`npx expo install ${missing.join(" ")}`);

  console.log(`\n✔ Restored ${restored.length} files for: ${selected.filter((m) => !m.hidden).map((m) => m.id).join(", ")}`);
  if (missing.length > 0) {
    console.log(
      skipInstall
        ? `  Install the packages yourself: npx expo install ${missing.join(" ")}`
        : `✔ Installed: ${missing.join(", ")}`,
    );
    console.log("  Native config changed — run `npx expo prebuild --clean` before the next native build.");
  }

  const routes = restored
    .filter((file) => file.startsWith("src/app/") && !/\/_layout\.tsx$/.test(file))
    .map((file) =>
      ("/" + file.replace(/^src\/app\//, "").replace(/\.tsx$/, ""))
        .replace(/\/\([^)]+\)/g, "")
        .replace(/\/index$/, "") || "/",
    );
  if (routes.length > 0) console.log(`  Routes: ${routes.join("  ")}`);
  console.log();
}

// ---------------------------------------------------------------------------
// list

const isTemplate = (file) =>
  file in TEMPLATES && sameText(fs.readFileSync(abs(file)), fs.readFileSync(abs(TEMPLATES[file])));

function list() {
  const installed = new Set(
    [...projectFiles()]
      .filter(([file]) => !isTemplate(file))
      .map(([, module]) => module.id),
  );
  const width = Math.max(...modules.map((module) => module.id.length));

  console.log("\nExamples (✔ = in the project):\n");
  for (const module of modules.filter((m) => !m.hidden)) {
    const mark = installed.has(module.id) ? "✔" : " ";
    console.log(`  ${mark} ${module.id.padEnd(width)}  ${module.description}`);
  }
  console.log("\n  npm run add-example -- <name> [<name>...]   (or `all`)\n");
}

// ---------------------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2);
const flags = {
  force: rest.includes("--force"),
  skipInstall: rest.includes("--skip-install"),
};
const ids = rest.filter((arg) => !arg.startsWith("--"));

if (command === "reset") reset(flags);
else if (command === "add" && ids.length > 0) add(ids, flags);
else if (command === "add" || command === "list") list();
else fail("Usage: node scripts/boilerplate/cli.mjs <reset | add [names...] | list>");
