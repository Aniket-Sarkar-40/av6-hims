import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function findPackageRoot(filePath) {
  let dir = dirname(filePath);
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

function resolveAtAlias(pkgRoot, specifier) {
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

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  const parentPath = fileURLToPath(context.parentURL);
  const pkgRoot = findPackageRoot(parentPath);
  const resolvedPath = pkgRoot ? resolveAtAlias(pkgRoot, specifier) : null;

  if (resolvedPath) {
    return nextResolve(pathToFileURL(resolvedPath).href, context);
  }

  return nextResolve(specifier, context);
}
