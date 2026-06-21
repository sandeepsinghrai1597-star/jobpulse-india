import { expect, test } from "@playwright/test";
import { firstPublicJob, saveDebugScreenshot, searchJob } from "./utils";

test.describe("Guest journeys", () => {
  test("homepage loads and public job search works", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /awesome companies hiring for remote jobs/i }),
    ).toBeVisible();

    const job = await firstPublicJob(page);
    await searchJob(page, job.title.split(" ").slice(0, 2).join(" "));
    await expect(page.getByText(job.title)).toBeVisible();
    await saveDebugScreenshot(page, "guest-search-results");
  });

  test("job detail opens and guest save/apply redirect to login", async ({ page }) => {
    const job = await firstPublicJob(page);
    await page.goto(job.href);

    await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
    await saveDebugScreenshot(page, "guest-job-detail");

    await page.getByRole("button", { name: /save job/i }).click();
    await expect(page).toHaveURL(/\/login\?next=\/jobs\//);

    await page.goto(job.href);
    await page.getByRole("button", { name: /apply now/i }).click();
    await expect(page).toHaveURL(/\/login\?next=\/jobs\//);
  });
});
