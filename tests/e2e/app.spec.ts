import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("onboarded", "yes"));
  await page.goto("./");
});
test("responsive home and journal CRUD", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Explore more. Scroll less." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await page.getByRole("button", { name: "New observation" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Garden fern");
  await page.getByLabel("Notes", { exact: true }).fill("Fresh green fronds");
  await page.getByRole("button", { name: "Save discovery" }).click();
  await expect(
    page.getByRole("heading", { name: "Garden fern" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Garden fern" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Garden fern/ }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Shaded fern");
  await page.getByRole("button", { name: "Save discovery" }).click();
  await expect(
    page.getByRole("heading", { name: "Shaded fern" }),
  ).toBeVisible();
});
test("missions timer persists and completion is confirmed", async ({
  page,
}) => {
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Missions", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Start mission" })).toHaveCount(
    20,
  );
  await page.getByRole("button", { name: "Start mission" }).first().click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Finish & confirm" }).click();
  await expect(page.getByRole("status")).toContainText("Adventure complete");
});
test("offline shell reload, missions and journal", async ({
  page,
  context,
}) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), {
      timeout: 45000,
    })
    .toBe(true);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await page.getByRole("button", { name: "New observation" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Offline discovery");
  await page.getByRole("button", { name: "Save discovery" }).click();
  await expect(
    page.getByRole("heading", { name: "Offline discovery" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Offline discovery" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Missions", exact: true })
    .click();
  await page.getByRole("button", { name: "Start mission" }).first().click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
});
test("missing model and denied location handled", async ({ page, context }) => {
  await context.clearPermissions();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await page.getByRole("button", { name: "New observation" }).click();
  await page.getByRole("button", { name: "Use approximate location" }).click();
  await expect(page.getByRole("alert")).toContainText("Location denied");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "AI Explorer" })
    .click();
  await page
    .getByLabel("Upload photo")
    .setInputFiles("tests/fixtures/nature.png");
  await page.getByRole("button", { name: "Explore with local AI" }).click();
  await expect(page.getByRole("status")).toContainText("Download AI");
});
test("real CLIP provisioning then offline inference", async ({
  page,
  context,
}, info) => {
  test.skip(
    !process.env.REAL_AI || info.project.name !== "desktop",
    "Opt in REAL_AI=1; downloads actual 154 MB model, no mocks.",
  );
  test.setTimeout(600000);
  page.on("requestfailed", (r) =>
    console.log("FAILED REQUEST", r.url(), r.failure()),
  );
  page.on("console", (m) => {
    if (m.type() === "error") console.log("BROWSER ERROR", m.text());
  });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Download AI for Offline Use" })
    .click();
  await expect(page.getByRole("status")).toContainText("AI ready", {
    timeout: 450000,
  });
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "AI Explorer" })
    .click();
  await page
    .getByLabel("Upload photo")
    .setInputFiles("tests/fixtures/nature.png");
  await page.getByRole("button", { name: "Explore with local AI" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Local comparison complete",
    { timeout: 120000 },
  );
  await expect(page.locator(".similarity")).toHaveCount(3);
  await page.getByRole("button", { name: "Save observation" }).click();
  await expect(page.locator(".journal-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".journal-card")).toHaveCount(1);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Missions", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Start mission" })).toHaveCount(
    20,
  );
});
test("backup export, explicit deletion, validated import and theme", async ({
  page,
}) => {
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await page.getByRole("button", { name: "New observation" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Backup leaf");
  await page.getByLabel("Notes", { exact: true }).fill("Saved locally");
  await page.getByRole("button", { name: "Save discovery" }).click();
  await expect(
    page.getByRole("heading", { name: "Backup leaf" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export journal" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page.getByLabel("Appearance").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await page.getByRole("button", { name: /Backup leaf/ }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your story starts outside." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Import journal").setInputFiles(path!);
  await expect(page.getByRole("status")).toContainText("Journal imported");
  await page
    .getByLabel("Import journal")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":2,"observations":[]}'),
    });
  await expect(page.getByRole("status")).toContainText(
    "Invalid journal format",
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Backup leaf" }),
  ).toBeVisible();
});

test("journal dialog preserves keyboard focus", async ({page}) => {
  await page.getByRole("navigation").getByRole("link", {name:"Journal"}).click();
  await page.getByRole("button",{name:"New observation"}).click();
  const title=page.getByLabel("Title",{exact:true});
  await title.focus();
  await title.pressSequentially("Quiet garden",{delay:30});
  await expect(title).toHaveValue("Quiet garden");
  await expect(title).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
