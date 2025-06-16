#!/usr/bin/env node

/**
 * Post-install setup script for Biome
 * Provides guidance for completing the Biome setup
 */

console.log("\n🎨 Biome Setup Complete!\n");

console.log("📝 Next steps to finish your setup:");
console.log("   1. Install the Biome VS Code extension:");
console.log('      Command Palette → "Extensions: Install Extensions" → Search "Biome"');
console.log("      Or: code --install-extension biomejs.biome");
console.log("");
console.log("   2. Restart VS Code to apply the new settings");
console.log("");
console.log("   3. Test the setup:");
console.log("      bun run check      # Check linting and formatting");
console.log("      bun run format     # Format your code");
console.log("");
console.log("🚫 Blocked linters/formatters:");
console.log("   - ESLint and all plugins");
console.log("   - Prettier and all plugins");
console.log("   - Any related configuration files");
console.log("");
console.log("✅ Prevention mechanisms active:");
console.log("   - Preinstall script blocks banned packages");
console.log("   - .gitignore prevents committing linter configs");
console.log("   - VS Code settings disable other formatters");
console.log("");
console.log("📖 For more info, see: docs/BIOME_SETUP.md");
console.log("");
