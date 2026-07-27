import path from "node:path";
import { fileURLToPath } from "node:url";
import { createVitestConfig } from "../../tooling/vitest/createConfig.js";

const root = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig(root);
