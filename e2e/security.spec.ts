import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createJobAndGetId, fillCandidateOnboarding, fillEmployerOnboarding, getFixtures, login } from "./utils";

test.describe("Security boundaries", () => {
  test("candidate cannot read another candidate profile over Supabase RLS", async () => {
    const fixtures = getFixtures();
    const altClient = createClient(fixtures.supabaseUrl, fixtures.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const altSignIn = await altClient.auth.signInWithPassword({
      email: fixtures.users.candidateAlt.email,
      password: fixtures.users.candidateAlt.password,
    });

    expect(altSignIn.error).toBeNull();

    const altUpdate = await altClient.from("candidate_profiles").upsert(
      {
        user_id: altSignIn.data.user?.id,
        full_name: "Alt Candidate",
        skills: ["Security Testing"],
      },
      { onConflict: "user_id" },
    );

    expect(altUpdate.error).toBeNull();

    const client = createClient(fixtures.supabaseUrl, fixtures.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const signIn = await client.auth.signInWithPassword({
      email: fixtures.users.candidate.email,
      password: fixtures.users.candidate.password,
    });

    expect(signIn.error).toBeNull();

    const response = await client
      .from("candidate_profiles")
      .select("user_id, full_name")
      .eq("user_id", altSignIn.data.user?.id ?? "");

    expect(response.error).toBeNull();
    expect(response.data ?? []).toHaveLength(0);
  });

  test("employer cannot mutate another employer's job", async ({ page }) => {
    const fixtures = getFixtures();
    const altEmployerPage = await page.context().browser()?.newPage();
    if (!altEmployerPage) {
      throw new Error("Could not create alternate employer page.");
    }
    await login(altEmployerPage, fixtures.users.employerAlt.email, fixtures.users.employerAlt.password);
    await fillEmployerOnboarding(altEmployerPage);
    const altJobId = await createJobAndGetId(
      altEmployerPage,
      `QA Security Alt Employer Role ${Date.now()}`,
    );
    await altEmployerPage.close();

    await login(page, fixtures.users.employer.email, fixtures.users.employer.password);
    await fillEmployerOnboarding(page);

    const response = await page.request.fetch(
      `/api/employer/jobs/${altJobId}`,
      {
        method: "PATCH",
        data: { action: "pause" },
      },
    );

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toMatch(/not found|permission/i);
  });

  test("admin routes are protected for unauthenticated and non-admin users", async ({ browser, page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);

    const fixtures = getFixtures();
    const candidatePage = await browser.newPage();
    await login(candidatePage, fixtures.users.candidate.email, fixtures.users.candidate.password);
    await fillCandidateOnboarding(candidatePage);
    await candidatePage.goto("/admin");
    await expect(candidatePage).toHaveURL(/\/dashboard/);
    await candidatePage.close();

    const employerPage = await browser.newPage();
    await login(employerPage, fixtures.users.employer.email, fixtures.users.employer.password);
    await employerPage.goto("/admin");
    await expect(employerPage).toHaveURL(/\/employer/);
    await employerPage.close();
  });
});
