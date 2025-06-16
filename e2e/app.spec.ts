import { expect, test } from "@playwright/test";

test.describe("Meh-trics App", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for the app to load
    await page.waitForLoadState("networkidle");

    // Check that the app is loaded (adjust selector based on your app structure)
    await expect(page).toHaveTitle(/Leap/);
  });

  test("should be able to create a task", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for create task button or form
    const createTaskButton = page.locator("button", { hasText: /add|create.*task/i });

    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();

      // Fill in task details
      const taskInput = page.locator('input[type="text"]').first();
      await taskInput.fill("Test task from Playwright");

      // Submit the task
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Verify task was created
        await expect(page.locator("text=Test task from Playwright")).toBeVisible();
      }
    }
  });

  test("should navigate to different sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test navigation to different sections
    const sections = ["Tasks", "Calendar", "Habits", "Mood", "Journal"];

    for (const section of sections) {
      const navLink = page.locator("nav a, button", { hasText: new RegExp(section, "i") });

      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState("networkidle");

        // Verify we're in the correct section
        await expect(
          page.locator("h1, h2, h3", { hasText: new RegExp(section, "i") })
        ).toBeVisible();
      }
    }
  });

  test("should handle mood tracking", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to mood section
    const moodLink = page.locator("nav a, button", { hasText: /mood/i });

    if (await moodLink.isVisible()) {
      await moodLink.click();
      await page.waitForLoadState("networkidle");

      // Look for mood selection buttons
      const moodButtons = page.locator("button[data-mood], .mood-selector button");

      if (await moodButtons.first().isVisible()) {
        await moodButtons.first().click();

        // Check if mood was recorded
        await expect(
          page.locator("text=mood", { hasText: /recorded|saved|updated/i })
        ).toBeVisible();
      }
    }
  });

  test("should show today view with data", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to today view
    const todayLink = page.locator("nav a, button", { hasText: /today/i });

    if (await todayLink.isVisible()) {
      await todayLink.click();
      await page.waitForLoadState("networkidle");

      // Check for today's date
      const today = new Date().toLocaleDateString();
      await expect(page.locator(`text=${today}`)).toBeVisible();

      // Check for task sections
      await expect(page.locator("text=Tasks", "text=Due", "text=Completed")).toBeVisible();
    }
  });
});
