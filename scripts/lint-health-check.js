#!/usr/bin/env node

/**
 * Lint Health Check Script
 *
 * Provides detailed reporting on lint status and trends
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");

console.log("📊 Lint Health Check Report");
console.log("=".repeat(50));

let lintOutput = "";
let summaryOutput = "";

try {
  // Get current lint status - handle non-zero exit codes gracefully
  try {
    lintOutput = execSync("npx @biomejs/biome check --reporter=github . 2>&1", {
      encoding: "utf8",
    });
  } catch (error) {
    // Biome returns non-zero exit code when there are issues, but we still want the output
    lintOutput = error.stdout || "";
  }

  try {
    summaryOutput = execSync("npx @biomejs/biome check --reporter=summary . 2>&1", {
      encoding: "utf8",
    });
  } catch (error) {
    summaryOutput = error.stdout || "";
  }

  const errorLines = lintOutput.split("\n").filter((line) => line.includes("::error"));
  const warningLines = lintOutput.split("\n").filter((line) => line.includes("::warning"));

  console.log(`✅ Status: ${errorLines.length === 0 ? "HEALTHY" : "NEEDS ATTENTION"}`);
  console.log(`🚫 Errors: ${errorLines.length}`);
  console.log(`⚠️  Warnings: ${warningLines.length}`);

  if (errorLines.length > 0) {
    console.log("\n🔍 Error Breakdown:");
    const errorTypes = {};
    for (const line of errorLines) {
      const match = line.match(/title=([^,]+)/);
      if (match) {
        const type = match[1];
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      }
    }

    for (const [type, count] of Object.entries(errorTypes)) {
      console.log(`   ${type}: ${count}`);
    }
  }

  if (warningLines.length > 0) {
    console.log("\n⚠️  Warning Breakdown:");
    const warningTypes = {};
    for (const line of warningLines) {
      const match = line.match(/title=([^,]+)/);
      if (match) {
        const type = match[1];
        warningTypes[type] = (warningTypes[type] || 0) + 1;
      }
    }

    for (const [type, count] of Object.entries(warningTypes)) {
      console.log(`   ${type}: ${count}`);
    }
  }

  // File statistics
  const fileCountMatch = summaryOutput.match(/Checked (\d+) files/);
  if (fileCountMatch) {
    console.log(`\n📁 Files checked: ${fileCountMatch[1]}`);
  }

  // Recommendations
  console.log("\n💡 Recommendations:");
  if (errorLines.length === 0 && warningLines.length === 0) {
    console.log("   🎉 Excellent! No issues found.");
    console.log("   🔄 Consider running this check daily to maintain quality.");
  } else {
    if (errorLines.length > 0) {
      console.log("   🚨 Fix errors immediately with: npm run lint:fix");
    }
    if (warningLines.length > 5) {
      console.log("   📈 High warning count. Consider addressing systematically.");
    }
    console.log("   ⚡ Set up pre-commit hooks to prevent future issues.");
  }

  // Save historical data
  const healthData = {
    timestamp: new Date().toISOString(),
    errors: errorLines.length,
    warnings: warningLines.length,
    filesChecked: fileCountMatch ? Number.parseInt(fileCountMatch[1]) : 0,
  };

  const healthFile = ".lint-health-history.json";
  let history = [];
  if (fs.existsSync(healthFile)) {
    try {
      history = JSON.parse(fs.readFileSync(healthFile, "utf8"));
    } catch (_e) {
      // Start fresh if file is corrupted
      history = [];
    }
  }

  history.push(healthData);
  // Keep only last 30 entries
  if (history.length > 30) {
    history = history.slice(-30);
  }

  fs.writeFileSync(healthFile, JSON.stringify(history, null, 2));
  console.log(`\n📈 Historical data saved to ${healthFile}`);
} catch (error) {
  console.error("❌ Failed to run lint health check:", error.message);
  process.exit(1);
}

console.log("\n🔗 Quick Commands:");
console.log("   npm run lint        - Check for issues");
console.log("   npm run lint:fix    - Auto-fix issues");
console.log("   npm run pre-commit  - Run pre-commit checks");
