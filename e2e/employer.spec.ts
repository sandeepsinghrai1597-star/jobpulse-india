import { expect, test } from "@playwright/test";
import {
  createJobAndGetId,
  fillEmployerOnboarding,
  getFixtures,
  login,
  saveDebugScreenshot,
} from "./utils";

test.describe("Employer flows", () => {
  test("employer signup/login, onboarding, posting, editing, and applicants work", async ({
    page,
  }) => {
    const fixtures = getFixtures();

    await page.goto("/signup");
    const employerEmail = `employer.signup.${Date.now()}@example.com`;
    await page.getByRole("button", { name: /employer/i }).click();
    await page.getByLabel("Full Name").fill("Signup Employer");
    await page.getByLabel("Email Address").fill(employerEmail);
    await page.getByLabel("Phone Number").fill("+91 9000005678");
    await page.getByLabel("Password").fill("JobPulse123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/check your email|employer dashboard|workspace overview/i)).toBeVisible();

    await login(page, fixtures.users.employer.email, fixtures.users.employer.password);
    await expect(page).toHaveURL(/\/employer/);

    await fillEmployerOnboarding(page);
    await page.goto("/employer");
    await expect(page.getByRole("heading", { name: /employer dashboard/i })).toBeVisible();
    await saveDebugScreenshot(page, "employer-dashboard");

    const newJobTitle = `QA Employer Posted Role ${Date.now()}`;
    const createdJobId = await createJobAndGetId(page, newJobTitle);
    await expect(page.getByText(newJobTitle)).toBeVisible();

    await page.goto(`/employer/jobs/${createdJobId}/edit`);
    await expect(page.getByRole("heading", { name: /edit job/i })).toBeVisible();
    await page.getByLabel("Job title").fill(`${newJobTitle} Updated`);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/job updated successfully|job updated and sent for approval/i)).toBeVisible();

    const altEmployerPage = await page.context().browser()?.newPage();
    if (!altEmployerPage) {
      throw new Error("Could not create browser page for alternate employer.");
    }
    await login(altEmployerPage, fixtures.users.employerAlt.email, fixtures.users.employerAlt.password);
    await fillEmployerOnboarding(altEmployerPage);
    const altJobId = await createJobAndGetId(altEmployerPage, `QA Alt Employer Role ${Date.now()}`);
    await altEmployerPage.close();

    await page.goto(`/employer/jobs/${altJobId}/edit`);
    await expect(page).not.toHaveURL(new RegExp(`/employer/jobs/${altJobId}/edit$`));

    await page.goto("/employer/applicants");
    await expect(page.getByRole("heading", { name: /applicants/i })).toBeVisible();
    await expect(page.getByText(/candidate|applicants will appear here/i)).toBeVisible();

    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
    await expect(page).toHaveURL(/\/employer/);
  });
});
