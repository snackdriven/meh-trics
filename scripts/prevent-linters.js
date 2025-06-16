#!/usr/bin/env node

/**
 * Linter Prevention Script
 * This script prevents installation of ESLint, Prettier, and other linters
 * to ensure we only use Biome for linting and formatting.
 */

const fs = require("fs");
const path = require("path");

const BLOCKED_PACKAGES = [
  "eslint",
  "prettier",
  "@typescript-eslint/parser",
  "@typescript-eslint/eslint-plugin",
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
  "eslint-plugin-import",
  "eslint-config-prettier",
  "prettier-plugin-tailwindcss",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-node",
  "eslint-plugin-promise",
  "eslint-plugin-standard",
  "@eslint/js",
  "eslint-config-standard",
  "eslint-plugin-n",
];

// Check if we're trying to install a blocked package
const packageName = process.env.npm_package_name || "";
const commandLine = process.argv.join(" ");

// Check for blocked packages in command line or package name
const blockedPackage = BLOCKED_PACKAGES.find(
  (pkg) => packageName.includes(pkg) || commandLine.includes(pkg)
);

if (blockedPackage) {
  console.error(`
❌ BLOCKED: ${blockedPackage}

This project uses Biome for linting and formatting.
Please use these commands instead:

  bun run lint          # Check for linting issues
  bun run lint:fix      # Fix linting issues
  bun run format        # Format code
  bun run check         # Check both linting and formatting
  bun run check:fix     # Fix both linting and formatting

For more info, see: https://biomejs.dev/
`);
  process.exit(1);
}

// Check package.json files for blocked dependencies
function checkPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return;

  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    const foundBlocked = Object.keys(allDeps).filter((dep) =>
      BLOCKED_PACKAGES.some((blocked) => dep.includes(blocked))
    );

    if (foundBlocked.length > 0) {
      console.error(`
❌ Found blocked packages in ${filePath}:
${foundBlocked.map((dep) => `  - ${dep}`).join("\n")}

Please remove these and use Biome instead.
`);
      process.exit(1);
    }
  } catch (error) {
    // Ignore JSON parse errors
  }
}

// Check all package.json files in the project
const packagePaths = ["package.json", "frontend/package.json", "backend/package.json"];

packagePaths.forEach((p) => checkPackageJson(path.join(process.cwd(), p)));

console.log("✅ Linter prevention check passed - only Biome is allowed!");
