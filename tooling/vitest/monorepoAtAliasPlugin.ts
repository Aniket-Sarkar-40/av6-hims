import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";

function findPackageRoot(filePath: string): string | null {
  let dir = dirname(filePath);
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

function resolveAtAlias(pkgRoot: string, specifier: string): string | null {
  const subpath = specifier.slice(2);
  const withoutJs = subpath.replace(/\.js$/, "");
  const candidates = [
    join(pkgRoot, "src", subpath),
    join(pkgRoot, "src", `${withoutJs}.ts`),
    join(pkgRoot, "src", `${withoutJs}.tsx`),
    join(pkgRoot, "src", withoutJs, "index.ts"),
    join(pkgRoot, "src", withoutJs, "index.tsx"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Resolves `@/*` against the *importing* package's `src/`, matching
 * `tooling/monorepo-at-alias-loader.mjs`. A single static alias would break
 * when `@repo/shared` (which uses `@/`) is pulled into another package's tests.
 */
export function monorepoAtAliasPlugin(): Plugin {
  return {
    name: "monorepo-at-alias",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.startsWith("@/") || !importer) {
        return null;
      }

      const pkgRoot = findPackageRoot(importer);
      if (!pkgRoot) {
        return null;
      }

      return resolveAtAlias(pkgRoot, source);
    },
  };
}
