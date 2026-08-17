import { expect, test, type Page } from "@playwright/test";

function captureRuntimeFailures(page: Page) {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));

  return failures;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      ),
    )
    .toBe(true);
}

test("desktop landing renders without runtime failures", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Booking live talent has never been this simple" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Meet the music out in the world." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ready to find your perfect performer?" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("mobile search supports reduced motion and navigation", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/search?location=Pune", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Find your next performer" }),
  ).toBeVisible();
  await expect(page.getByText("4 performers")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("tablet discovery and light theme render cleanly", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);
  await page.addInitScript(() => window.localStorage.setItem("theme", "light"));

  await page.goto("/discover", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(
    page.getByRole("heading", { name: "Live talent for every kind of moment" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore categories" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("profile booking CTA resolves to the structured booking experience", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/artist/ananya-rao?intent=book", { waitUntil: "domcontentloaded" });
  await Promise.all([
    page.waitForURL(/\/bookings\/new\?/, { timeout: 60_000 }),
    page.getByRole("link", { name: "Enquire about this performer" }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "New booking request" })).toBeVisible();
  await page.getByRole("grid").locator("button:enabled").first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByLabel("Start time")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Venue").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Event type").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Expected audience size").fill("250");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Special requirements").fill("Stage power and a sound check.");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Continue to submit" }).click();
  await page.getByRole("button", { name: "Submit booking request" }).click();
  await expect(page.getByText("Request sent to Ananya Rao")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("performer profile actions and dashboard applications work on tablet", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/artist/ananya-rao", { waitUntil: "domcontentloaded" });
  const favourite = page.getByRole("button", { name: "Favourite" });
  await favourite.click();
  await expect(page.getByRole("button", { name: "Favourited" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("link", { name: "Report" })).toHaveAttribute(
    "href",
    /\/contact\?/,
  );

  await expect(
    page.getByRole("tablist", { name: "Performer portfolio sections" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Videos" }).click();
  await expect(page.getByRole("heading", { name: "Video showcase" })).toBeVisible();
  await page.getByRole("button", { name: "Wedding" }).click();
  await page.getByRole("tab", { name: "Packages" }).click();
  await expect(page.getByRole("heading", { name: "Artist packages" })).toBeVisible();
  await expect(page.getByText("Wedding Package").first()).toBeVisible();
  await page.getByRole("tab", { name: "Equipment" }).click();
  await expect(page.getByRole("heading", { name: "Equipment" })).toBeVisible();
  await expect(page.getByText(/PRS|Taylor|Fender/i).first()).toBeVisible();

  await page.goto("/dashboard/performer/applications", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "My Applications" })).toBeVisible();
  await page.getByRole("tab", { name: /Completed/ }).click();
  await expect(page.getByRole("tabpanel")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("organizer dashboard navigation and application triage work on mobile", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/dashboard/organizer", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/dashboard/organizer/applications", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  const shortlist = page.getByRole("button", { name: "Shortlist" }).first();
  if (await shortlist.isVisible()) {
    await shortlist.click();
    await expect(page.getByText("Shortlisted", { exact: true }).first()).toBeVisible();
  }
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("marketplace venue and opportunity flows render cleanly", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/venue/amber-palace-hotel", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: "Amber Palace Hotel" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/opportunities/event-sharma-reception", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Sharma Family Reception" }),
  ).toBeVisible();
  await page
    .getByLabel("Proposal message")
    .fill("A tailored reception set with coordinated sound check and guest requests.");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Application submitted", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("booking lifecycle advances through payment, completion, and review", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/bookings/booking-groove-reception", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("button", { name: "Simulate advance paid" }).click();
  await page.getByRole("button", { name: "Mark event completed" }).click();
  await page.getByLabel("Review").fill("Professional coordination and a memorable set.");
  await page.getByRole("button", { name: "Submit verified review" }).click();

  await expect(page.getByText("Verified-booking review submitted.")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("organizer event management and analytics render cleanly", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);

  await page.goto("/dashboard/organizer/events", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "My Events" })).toBeVisible();
  await page.getByRole("link", { name: "Create event" }).click();
  await expect(
    page.getByRole("heading", { name: /Create event|New event/i }),
  ).toBeVisible();
  await expect(page.getByText(/Timeline|Setup|Sound Check/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/dashboard/organizer/analytics", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Programme performance" }),
  ).toBeVisible();
  await expect(page.getByText("Upcoming events", { exact: true })).toBeVisible();
  await expect(page.getByText("Budget used", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});

test("recommendations, sounds, and experiences work across breakpoints", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const failures = captureRuntimeFailures(page);
  await page.addInitScript(() => window.localStorage.setItem("theme", "light"));

  await page.goto("/recommendations", { waitUntil: "domcontentloaded" });
  const recommendButton = page.getByRole("button", { name: "Get recommendations" });
  await recommendButton.scrollIntoViewIfNeeded();
  await recommendButton.click();
  await expect(
    page.getByText(/Recommendation summary|No strong matches yet|avg match/i).first(),
  ).toBeVisible({ timeout: 15_000 });
  await expectNoHorizontalOverflow(page);

  await page.goto("/sounds/tabla", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Tabla/i }).first()).toBeVisible();
  await expect(page.getByText("History", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book Now" }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/experiences/punjabi-wedding", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /Punjabi Wedding/i }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Book entire experience" }).click();
  await expect(page.getByText("Experience request received")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/dashboard/performer/analytics", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Booking and profile insights" }),
  ).toBeVisible();
  await expect(page.getByText("Profile views")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);

  await context.close();
});
