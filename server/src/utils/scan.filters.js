// Shared heuristics for deciding which repository files are worth reading when
// building LLM context. Kept in one place so the repo-structure renderer and
// the full-codebase scan agree on what counts as noise.

// Root-anchored directories that never carry project signal — dependencies,
// build output, VCS internals, caches.
export const IGNORED_DIR_PATTERNS = [
  /^node_modules\//,
  /^\.git\//,
  /^dist\//,
  /^build\//,
  /^coverage\//,
  /^\.next\//,
  /^\.cache\//,
  /^__pycache__\//,
  /^venv\//,
  /^\.venv\//,
  /^vendor\//,
  /^target\//,
  /^out\//,
  /^bin\//,
  /^obj\//,
  /^\.turbo\//,
  /^tmp\//,
];

// Lockfiles: huge, machine-generated, and say nothing a README should mention.
// The manifest beside them (package.json, Cargo.toml, …) carries the real info.
export const LOCKFILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "composer.lock",
  "poetry.lock",
  "Gemfile.lock",
  "go.sum",
]);

// Code file extensions. Drives the broad Tier 2/3 sweep, so shell install
// scripts are in but config/doc files are not (those only ride in via Tier 1).
export const SOURCE_EXTENSIONS = new Set([
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "java",
  "cpp",
  "c",
  "h",
  "hpp",
  "cs",
  "go",
  "rs",
  "rb",
  "php",
  "swift",
  "kt",
  "scala",
  "sh",
  "bash",
]);

// Everything we are willing to fetch content for — source plus the config/doc
// formats that curated Tier 1 entries use. Acts as the binary guard.
export const SCANNABLE_EXTENSIONS = new Set([
  ...SOURCE_EXTENSIONS,
  "json",
  "yaml",
  "yml",
  "toml",
  "md",
]);

// Basename -> priority. Lower wins. Dependency/manifest files first, then
// entry points, then runtime config, then docs.
export const CURATED_PRIORITIES = {
  // dependency/config manifests
  "package.json": 1,
  "requirements.txt": 1,
  "setup.py": 1,
  "pyproject.toml": 1,
  "Cargo.toml": 1,
  "go.mod": 1,
  "pom.xml": 1,
  "build.gradle": 1,
  "composer.json": 1,
  Gemfile: 1,
  "CMakeLists.txt": 1,

  // entry points
  "index.js": 2,
  "index.ts": 2,
  "main.js": 2,
  "main.ts": 2,
  "main.py": 2,
  "main.rs": 2,
  "lib.rs": 2,
  "mod.rs": 2,
  "app.js": 2,
  "app.ts": 2,
  "server.js": 2,
  "server.ts": 2,

  // runtime / build config
  ".env.example": 3,
  "config.js": 3,
  "config.json": 3,
  "tsconfig.json": 3,
  "deno.json": 3,
  Makefile: 3,
  Dockerfile: 3,

  // docs
  "CHANGELOG.md": 4,
  "CONTRIBUTING.md": 4,
};

// Source files living under a conventionally named directory.
export const IMPORTANT_DIR_PATTERNS = [
  /^src\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^lib\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^app\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^api\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^routes\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^controllers\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^models\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^services\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^utils\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
  /^components\/.*\.(js|ts|jsx|tsx)$/,
  /^pages\/.*\.(js|ts|jsx|tsx)$/,
];

export function basenameOf(path) {
  return path.split("/").pop() || path;
}

export function extensionOf(path) {
  const base = basenameOf(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

// Number of path separators — 0 for a root-level file.
export function depthOf(path) {
  let depth = 0;
  for (const ch of path) if (ch === "/") depth++;
  return depth;
}

export function isIgnoredPath(path) {
  return IGNORED_DIR_PATTERNS.some((pattern) => pattern.test(path));
}

export function isLockfile(path) {
  return LOCKFILES.has(basenameOf(path));
}

export function isSourceFile(path) {
  return SOURCE_EXTENSIONS.has(extensionOf(path));
}

// A file we will actually fetch: known-good extension, not a lockfile, not in a
// junk directory.
export function isScannable(path) {
  if (isIgnoredPath(path) || isLockfile(path)) return false;
  return SCANNABLE_EXTENSIONS.has(extensionOf(path));
}

// Pick the repository files worth feeding to the LLM, most useful first.
//
// Three widening passes all run, then their results are merged by rank and
// capped at `limit`. Widening can only add files, never drop a good one; when
// the cap trims the list, curated Tier 1 files outrank a deep Tier 3 match.
//
//   Tier 1  curated manifests/entry points + source under a conventional dir
//   Tier 2  any source file at repo root or one/two levels deep
//   Tier 3  any source file at any depth
//
// `tree` is the GitHub recursive tree (`{ path, type }[]`). Returns a path[].
export function selectImportantFiles(tree, limit = 50) {
  const blobs = tree.filter((item) => {
    if (item.type !== "blob") return false;
    if (isIgnoredPath(item.path) || isLockfile(item.path)) return false;
    // Curated basenames (Makefile, Dockerfile, …) have no scannable extension
    // but are still worth reading.
    if (CURATED_PRIORITIES[basenameOf(item.path)] !== undefined) return true;
    return SCANNABLE_EXTENSIONS.has(extensionOf(item.path));
  });

  // path -> { rank, order }. Lower rank is kept first when the cap bites;
  // `order` (tree position) breaks ties. First tier to claim a path wins.
  const chosen = new Map();
  const consider = (path, rank, order) => {
    if (!chosen.has(path)) chosen.set(path, { rank, order });
  };

  // Tier 1 — curated basename (ranked by its priority) or recognized source dir.
  blobs.forEach((item, i) => {
    const priority = CURATED_PRIORITIES[basenameOf(item.path)];
    if (priority !== undefined) {
      consider(item.path, 100 + priority, i);
    } else if (IMPORTANT_DIR_PATTERNS.some((p) => p.test(item.path))) {
      consider(item.path, 200, i);
    }
  });

  // Tier 2 — source file at root / shallow depth (catches flat repos).
  blobs.forEach((item, i) => {
    if (isSourceFile(item.path) && depthOf(item.path) <= 2) {
      consider(item.path, 300 + depthOf(item.path), i);
    }
  });

  // Tier 3 — any source file, any depth.
  blobs.forEach((item, i) => {
    if (isSourceFile(item.path)) {
      consider(item.path, 400 + depthOf(item.path), i);
    }
  });

  return [...chosen.entries()]
    .sort((a, b) => a[1].rank - b[1].rank || a[1].order - b[1].order)
    .slice(0, limit)
    .map(([path]) => path);
}
