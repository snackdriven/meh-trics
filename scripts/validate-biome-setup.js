#!/usr/bin/env node

/**
 * Biome Setup Validation Script
 * Ensures the project is properly configured for Biome-only linting and formatting
 */

const fs = require("node:fs");
const _path = require("node:path");
const { execSync } = require("node:child_process");

console.log("🔍 Validating Biome-only setup...\n");

const issues = [];
const warnings = [];

// 1. Check if Biome is installed
try {
  const rootPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (!rootPkg.devDependencies?.["@biomejs/biome"]) {
    issues.push("❌ @biomejs/biome not found in root devDependencies");
  } else {
    console.log("✅ Biome is installed");
  }
} catch (_error) {
  issues.push("❌ Could not read root package.json");
}

// 2. Check for blocked packages
const blockedPackages = [
  "eslint",
  "prettier",
  "@typescript-eslint/parser",
  "@typescript-eslint/eslint-plugin",
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
  "eslint-config-prettier",
];

const packagePaths = ["package.json", "frontend/package.json", "backend/package.json"];

for (const pkgPath of packagePaths) {
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };

      const foundBlocked = Object.keys(allDeps).filter((dep) =>
        blockedPackages.some((blocked) => dep.includes(blocked))
      );

      if (foundBlocked.length > 0) {
        issues.push(`❌ Blocked packages found in ${pkgPath}: ${foundBlocked.join(", ")}`);
      } else {
        console.log(`✅ No blocked packages in ${pkgPath}`);
      }
    } catch (_error) {
      warnings.push(`⚠️  Could not read ${pkgPath}`);
    }
  }
}

// 3. Check for blocked config files
const blockedConfigs = [
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.json",
  ".prettierrc",
  ".prettierrc.js",
  ".prettierrc.json",
  "prettier.config.js",
  "eslint.config.js",
];

for (const config of blockedConfigs) {
  if (fs.existsSync(config)) {
    issues.push(`❌ Found blocked config file: ${config}`);
  }
}

if (blockedConfigs.every((config) => !fs.existsSync(config))) {
  console.log("✅ No blocked config files found");
}

// 4. Check if biome.json exists and is valid
if (fs.existsSync("biome.json")) {
  try {
    const biomeConfig = JSON.parse(fs.readFileSync("biome.json", "utf8"));
    if (biomeConfig.linter?.enabled && biomeConfig.formatter?.enabled) {
      console.log("✅ biome.json is properly configured");
    } else {
      warnings.push("⚠️  biome.json may not have linter/formatter enabled");
    }
  } catch (_error) {
    issues.push("❌ biome.json is invalid JSON");
  }
} else {
  issues.push("❌ biome.json not found");
}

// 5. Check VS Code settings
if (fs.existsSync(".vscode/settings.json")) {
  try {
    const vscodeSettings = JSON.parse(fs.readFileSync(".vscode/settings.json", "utf8"));
    if (vscodeSettings["editor.defaultFormatter"] === "biomejs.biome") {
      console.log("✅ VS Code configured for Biome");
    } else {
      warnings.push("⚠️  VS Code default formatter is not set to Biome");
    }
  } catch (_error) {
    warnings.push("⚠️  Could not read VS Code settings");
  }
} else {
  warnings.push("⚠️  No VS Code settings found");
}

// 6. Check scripts in package.json files
for (const pkgPath of packagePaths) {
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const scripts = pkg.scripts || {};

      const biomeScripts = ["lint", "format", "check"];
      const hasBiomeScripts = biomeScripts.some(
        (script) =>
          scripts[script]?.includes("biome") || scripts[script]?.includes("@biomejs/biome")
      );

      if (hasBiomeScripts) {
        console.log(`✅ Biome scripts found in ${pkgPath}`);
      } else {
        warnings.push(`⚠️  No Biome scripts found in ${pkgPath}`);
      }
    } catch (_error) {
      // Already handled above
    }
  }
}

// 7. Test Biome functionality
try {
  console.log("\n🧪 Testing Biome functionality...");
  const output = execSync("npx @biomejs/biome --version", { encoding: "utf8" });
  console.log(`✅ Biome version: ${output.trim()}`);
} catch (_error) {
  issues.push("❌ Biome is not working properly");
}

// 8. Check prevention mechanisms
if (fs.existsSync("scripts/prevent-linters.js")) {
  console.log("✅ Linter prevention script exists");
} else {
  warnings.push("⚠️  Linter prevention script not found");
}

if (fs.existsSync(".npmrc")) {
  console.log("✅ .npmrc file exists");
} else {
  warnings.push("⚠️  .npmrc file not found");
}

// Summary
console.log("\n📋 VALIDATION SUMMARY\n");

if (issues.length === 0) {
  console.log("🎉 All checks passed! Your project is properly configured for Biome-only linting.");
} else {
  console.log("❌ Issues found:");
  for (const issue of issues) {
    console.log(`   ${issue}`);
  }
}

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  for (const warning of warnings) {
    console.log(`   ${warning}`);
  }
}

console.log("\n🚀 Available commands:");
console.log("   npm run lint       # Check for linting issues");
console.log("   npm run lint:fix   # Fix linting issues");
console.log("   npm run format     # Format code");
console.log("   npm run check      # Check both linting and formatting");
console.log("   npm run check:fix  # Fix both linting and formatting");

if (issues.length > 0) {
  process.exit(1);
}
