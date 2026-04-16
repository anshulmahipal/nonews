const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Monorepo: npm can place multiple `react` copies (web vs Expo). RN must use the same instance as
 * your app code or ReactSharedInternals / ReactFabric break (e.g. ReactSharedInternals.S undefined).
 * Overrides in repo root package.json pin a single react version; Metro aliases every `react` import
 * to that install (hoisted under the workspace root after install).
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

const reactCandidates = [
  path.join(workspaceRoot, "node_modules", "react"),
  path.join(projectRoot, "node_modules", "react"),
];
const singleReact = reactCandidates.find((dir) => fs.existsSync(dir));
if (singleReact) {
  config.resolver.extraNodeModules = {
    react: singleReact,
  };
}

module.exports = config;
