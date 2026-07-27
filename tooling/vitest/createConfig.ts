import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vitest/config";
import { monorepoAtAliasPlugin } from "./monorepoAtAliasPlugin.js";

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const setupEnv = path.join(toolingDir, "setup-env.ts");

/**
 * Shared Vitest config factory for workspace packages/apps.
 */
export function createVitestConfig(
  packageRoot: string,
  overrides: UserConfig = {},
): UserConfig {
  const { test: testOverrides, plugins: pluginOverrides, ...rest } = overrides;

  return defineConfig({
    ...rest,
    root: packageRoot,
    plugins: [monorepoAtAliasPlugin(), ...(pluginOverrides ?? [])],
    test: {
      environment: "node",
      globals: false,
      setupFiles: [setupEnv],
      include: ["src/**/*.{test,spec}.ts"],
      passWithNoTests: true,
      ...testOverrides,
    },
    resolve: {
      // Prefer workspace "development" export conditions (source .ts over dist).
      conditions: ["development", "import", "module", "default"],
      ...overrides.resolve,
    },
  });
}
