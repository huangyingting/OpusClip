import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "exploration",
  "implemented_screenshots"
);

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe("OpusClip Full-Parity E2E Verification Suite", () => {
  test("1. Public Marketing Routes, Responsive Viewports & Free AI Creator Tools", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("1 long video");
    const overflowDesktop = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    );
    expect(overflowDesktop).toBe(true);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_landing_desktop.png"),
    });

    // Mobile responsive check on landing page
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const overflowMobile = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    );
    expect(overflowMobile).toBe(true);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01b_landing_mobile.png"),
    });

    // Product marketing pages
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of [
      "/clip-anything",
      "/captions",
      "/ai-b-roll",
      "/reframe",
      "/pricing",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
    }

    // Free AI Creator Tool (/tools/youtube-title-generator)
    await page.goto("/tools/youtube-title-generator");
    await expect(page.locator("h1")).toContainText("YouTube Title Generator");
    await page.getByRole("button", { name: /Generate with AI/i }).click();
    await expect(page.getByTestId("tool-results-list")).toBeVisible();
  });

  test("2. Invite-Only Admission, Single-Use Codes, Revocation, RBAC & Audit Logs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Unauthenticated access to /dashboard redirects to /auth/login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);

    // Verify open self-registration is blocked with 403
    await page
      .getByRole("button", {
        name: /Need an account\? Check public sign-up policy/i,
      })
      .click();
    await expect(page.getByTestId("direct-reg-policy-banner")).toContainText(
      /invitation is required|disabled/i
    );
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_login_invite_only.png"),
    });

    // Sign in as bootstrapped Admin
    await page
      .getByPlaceholder("you@opusclip.local")
      .fill("admin@opusclip.local");
    await page.getByPlaceholder("••••••••••••").fill("AdminPassword123!");
    await page.getByRole("button", { name: /Continue to Studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Admin Invitations & RBAC Console
    await page.goto("/admin/invitations");
    await expect(page.locator("h1")).toContainText(
      "Invite-Only Access & Role-Based Authorization"
    );

    // Issue a single-use invitation for a new creator
    const invitedEmail = `e2e-creator-${Date.now()}@opusclip.local`;
    await page.getByPlaceholder("editor@opusclip.local").fill(invitedEmail);
    await page.getByRole("button", { name: /Generate Invite/i }).click();

    const urlInput = page.getByTestId("generated-invite-url");
    await expect(urlInput).toBeVisible();
    const inviteUrlText = await urlInput.inputValue();
    expect(inviteUrlText).toContain("/invite/");
    const invitePath = new URL(inviteUrlText, "http://127.0.0.1:3000").pathname;

    // Issue a second invitation and immediately revoke it
    const revokedEmail = `e2e-revoked-${Date.now()}@opusclip.local`;
    await page.getByPlaceholder("editor@opusclip.local").fill(revokedEmail);
    await page.getByRole("button", { name: /Generate Invite/i }).click();
    await expect(page.locator("tr", { hasText: revokedEmail })).toBeVisible();
    const revokedUrlText = await page
      .getByTestId("generated-invite-url")
      .inputValue();
    const revokedPath = new URL(revokedUrlText, "http://127.0.0.1:3000")
      .pathname;

    // Click Revoke on the newly created row for revokedEmail
    const row = page.locator("tr", { hasText: revokedEmail });
    await row.getByRole("button", { name: /Revoke/i }).click();
    await expect(row).toContainText("REVOKED");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_admin_invitations_rbac.png"),
    });

    // Check Security Audit Logs page
    await page.goto("/admin/audit-logs");
    await expect(page.locator("h1")).toContainText(
      "Security & Operational Audit Logs"
    );
    await expect(page.locator("table")).toContainText("INVITATION_CREATED");
    await expect(page.locator("table")).toContainText("INVITATION_REVOKED");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_admin_audit_logs.png"),
    });

    // Verify revoked invitation cannot be accepted
    await page.goto(revokedPath);
    await expect(page.locator("body")).toContainText(
      /single-use invitation link is either invalid, expired, revoked/i
    );

    // Accept the valid single-use invitation
    await page.goto(invitePath);
    await expect(page.getByPlaceholder("Taylor Brooks")).toBeVisible();
    await page.getByPlaceholder("Taylor Brooks").fill("E2E Invited Creator");
    await page.getByPlaceholder("••••••••••••").fill("CreatorPass123!");
    await page
      .getByRole("button", { name: /Accept Invite & Join Studio/i })
      .click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Re-visiting the consumed single-use invitation link must now reject it!
    await page.goto(invitePath);
    await expect(page.locator("body")).toContainText(
      /single-use invitation link is either invalid, expired, revoked/i
    );
  });

  test("3. Studio Dashboard, Real MP4 Upload, ClipAnything™ Curation, Project Grid/List Views, Multi-Track Editor & Brand Templates", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Log in as Admin
    await page.goto("/auth/login");
    await page
      .getByPlaceholder("you@opusclip.local")
      .fill("admin@opusclip.local");
    await page.getByPlaceholder("••••••••••••").fill("AdminPassword123!");
    await page.getByRole("button", { name: /Continue to Studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05_studio_dashboard.png"),
    });

    // Upload real MP4 video on /dashboard to open inline ClipAnything configurator
    const sampleVideoPath = path.join(
      process.cwd(),
      "public",
      "videos",
      "sample_podcast.mp4"
    );
    await page.getByTestId("video-file-input").setInputFiles(sampleVideoPath);
    await expect(page.getByTestId("clip-anything-configurator")).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06_clip_anything_configurator.png"),
    });

    // Submit ClipAnything curation and verify redirect to newly curated project
    await page
      .getByRole("button", { name: /Get clips in 1 click/i })
      .last()
      .click();
    await expect(page).toHaveURL(/\/clip\//);

    // Navigate to authentic 18-clip demo-danny project
    await page.goto("/clip/demo-danny");
    await expect(page.getByTestId("clips-grid-view")).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "24 Hours with Danny Duncan"
    );
    await expect(page.getByTestId("clip-score-1")).toContainText(/92|99/);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07_demo_danny_grid_view.png"),
    });

    // Verify real MP4 and XML export endpoints return 200 OK with valid headers
    const mp4ExportRes = await page.request.get(
      "/api/exportable-clips/demo-danny-clip-1/export?format=mp4"
    );
    expect(mp4ExportRes.status()).toBe(200);
    expect(mp4ExportRes.headers()["content-type"]).toContain("video/mp4");

    const xmlExportRes = await page.request.get(
      "/api/exportable-clips/demo-danny-clip-1/export?format=xml"
    );
    expect(xmlExportRes.status()).toBe(200);
    expect(xmlExportRes.headers()["content-type"]).toContain("application/xml");

    // Toggle List View using exact button[aria-label="list"]
    await page.locator('button[aria-label="list"]').click();
    await expect(page.getByTestId("clips-list-view")).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08_demo_danny_list_view.png"),
    });

    // Toggle back to Grid View
    await page.locator('button[aria-label="grid"]').click();
    await expect(page.getByTestId("clips-grid-view")).toBeVisible();

    // Open Multi-Track Editor (/editor/demo-danny-clip-1)
    await page.goto("/editor/demo-danny-clip-1");
    await expect(
      page.getByRole("button", { name: /Save Changes/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Save Changes/i }).click();
    await expect(page.getByRole("status")).toContainText(/Changes saved/i);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09_multitrack_editor.png"),
    });

    // Brand Templates Studio (/brand-templates-ux)
    await page.goto("/brand-templates-ux");
    await expect(page.getByTestId("brand-template-setting-tab")).toBeVisible();
    await page.getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.getByTestId("brand-template-style-tab")).toBeVisible();
    await page.getByRole("button", { name: /Save Template/i }).click();
    await expect(page.getByRole("status")).toContainText(/Template saved/i);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10_brand_templates.png"),
    });

    // Social Calendar, Social Hub, Analytics, Asset Library, AI Search & Subscription
    await page.goto("/auto-post/calendar");
    await expect(
      page.getByRole("button", { name: /Schedule post/i })
    ).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "11_social_calendar.png"),
    });

    await page.goto("/post/plansocial");
    await expect(page.locator("h1")).toContainText("Connected Social Accounts");

    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText(
      "Cross-Platform Short-Form Analytics"
    );

    await page.goto("/collections");
    await expect(page.locator("h1")).toContainText("Workspace Asset Library");

    await page.goto("/search");
    await expect(page.locator("h1")).toContainText(
      "Multimodal Video Scene & Dialogue Search"
    );

    await page.goto("/subscription");
    await expect(page.locator("h1")).toContainText(
      "Workspace Plans & Credit Allocation"
    );
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "12_subscription_plans.png"),
    });
  });
});
