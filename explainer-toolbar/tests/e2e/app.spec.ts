import { expect, test, type Page } from "@playwright/test";

const errors: string[] = [];

async function open(page: Page, ui: Record<string, unknown> = {}) {
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate((ui) => {
    localStorage.clear();
    if (Object.keys(ui).length) localStorage.setItem("fake.settings", JSON.stringify({ revision: 1, doc: { ui } }));
  }, ui);
  await page.reload();
  const tb = page.frameLocator("iframe[title=toolbar]");
  await expect(tb.getByRole("toolbar")).toBeVisible();
  return tb;
}

const scene = (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem("fake.scene.default.DISPLAY1");
    return raw ? JSON.parse(JSON.parse(raw)) : { objects: [] };
  });
const mode = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("fake.mode") ?? "{}").mode);
const ui = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("fake.settings") ?? "{}").doc?.ui ?? {});

async function stroke(page: Page, pts: [number, number][]) {
  await page.mouse.move(pts[0][0], pts[0][1]);
  await page.mouse.down();
  for (const [x, y] of pts.slice(1)) await page.mouse.move(x, y, { steps: 5 });
  await page.mouse.up();
}

test.afterEach(() => {
  expect(errors, "no page errors").toEqual([]);
  errors.length = 0;
});

test("starts in desktop mode: overlay does not take clicks", async ({ page }) => {
  const tb = await open(page);
  expect(await mode(page)).toBe("desktop");
  await expect(tb.getByRole("button", { name: "Start drawing" })).toBeVisible();
  await expect(page.locator("iframe[title=overlay]")).toHaveCSS("pointer-events", "none");
});

test("picking a tool enters drawing mode; a stroke is one undoable step", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "Pen", exact: true }).click();
  await expect.poll(() => mode(page)).toBe("annotating");
  await stroke(page, [[500, 400], [560, 380], [620, 420]]);
  await expect.poll(async () => (await scene(page)).objects.length).toBe(1);
  await tb.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await scene(page)).objects.length).toBe(0);
  await tb.getByRole("button", { name: "Redo" }).click();
  await expect.poll(async () => (await scene(page)).objects.length).toBe(1);
});

test("typing into a text label never triggers tool shortcuts (regression)", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "Text", exact: true }).click();
  await expect.poll(() => mode(page)).toBe("annotating");
  await page.waitForTimeout(150);
  await page.mouse.click(600, 220);
  await page.keyboard.type("Rather far");
  await page.keyboard.press("Enter");
  await page.keyboard.type("مرحبا");
  await page.mouse.click(600, 600);
  await expect.poll(async () => (await scene(page)).objects.map((o: { text?: string }) => o.text)).toEqual(["Rather far\nمرحبا"]);
  expect((await ui(page)).tool).toBe("text");
});

test("Escape is layered: deselect first, then leave drawing mode, never clear", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "Rectangle", exact: true }).click();
  await stroke(page, [[400, 300], [600, 450]]);
  await tb.getByRole("button", { name: "Select & move", exact: true }).click();
  await page.waitForTimeout(150);
  await page.mouse.click(400, 380);
  const ov = page.frameLocator("iframe[title=overlay]");
  await expect(ov.getByRole("toolbar")).toBeVisible(); // inspector
  await page.keyboard.press("Escape");
  await expect(ov.getByRole("toolbar")).toHaveCount(0);
  expect(await mode(page)).toBe("annotating");
  await page.keyboard.press("Escape");
  await expect.poll(() => mode(page)).toBe("desktop");
  expect((await scene(page)).objects).toHaveLength(1);
});

test("clear needs a second click and can be undone", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "Pen", exact: true }).click();
  await stroke(page, [[500, 400], [600, 420]]);
  await stroke(page, [[500, 500], [600, 520]]);
  await expect.poll(async () => (await scene(page)).objects.length).toBe(2);
  await tb.getByRole("button", { name: "Clear all drawings" }).click();
  await page.waitForTimeout(700);
  expect((await scene(page)).objects).toHaveLength(2);
  await tb.getByRole("button", { name: "Click again to clear" }).click();
  await expect.poll(async () => (await scene(page)).objects.length).toBe(0);
  await tb.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await scene(page)).objects.length).toBe(2);
});

test("colour panel changes the next stroke and keeps shape fill", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "Rectangle", exact: true }).click();
  await tb.getByRole("button", { name: "Colour and size" }).click();
  const panel = tb.getByRole("dialog", { name: "Colour and size" });
  await panel.getByRole("button", { name: "#2BD47D" }).first().click();
  await panel.getByRole("button", { name: "#FFC43D" }).last().click(); // fill row
  await tb.getByRole("button", { name: "Colour and size" }).click();
  await stroke(page, [[400, 300], [600, 450]]);
  await expect.poll(async () => (await scene(page)).objects.length).toBe(1);
  const o = (await scene(page)).objects[0];
  expect(o.color.toUpperCase()).toBe("#2BD47D");
  expect(o.fill.toUpperCase()).toBe("#FFC43D");
});

test("library: search, pin and unpin", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  const tb = await open(page);
  await tb.getByRole("button", { name: "All tools" }).click();
  const lib = tb.getByRole("dialog", { name: "All tools" });
  await lib.getByPlaceholder("Search tools…").fill("laser");
  await expect(lib.getByRole("option")).toHaveCount(1);
  await lib.getByRole("button", { name: "Add to toolbar: Laser pointer" }).click();
  await expect(tb.getByRole("toolbar").getByRole("button", { name: "Laser pointer", exact: true })).toBeVisible();
  await lib.getByRole("button", { name: "Remove from toolbar: Laser pointer" }).click();
  await expect(tb.getByRole("toolbar").getByRole("button", { name: "Laser pointer", exact: true })).toHaveCount(0);
});

test("toolbar always fits the screen; extra tools move to the library", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 560 });
  const tb = await open(page, { iconSize: "large", pinned: ["select", "pen", "highlighter", "laser", "arrow", "line", "rect", "ellipse", "text", "marker", "eraser"] });
  const frame = page.locator("iframe[title=toolbar]");
  await expect(tb.getByRole("button", { name: /All tools \(\+\d+\)/ })).toBeVisible();
  const box = (await frame.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(560 - 40 + 1);
});

test("dark theme keeps the overlay transparent (regression: opaque page)", async ({ page }) => {
  await open(page, { theme: "dark" });
  const ov = page.frameLocator("iframe[title=overlay]");
  await expect(ov.locator(".ov-root")).toHaveAttribute("data-ready", "true");
  const scheme = await page.frames().find((f) => f.url().includes("view=overlay"))!.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  expect(scheme).toBe("normal");
  // The mock application's white window must still be visible through it.
  const shot = await page.screenshot({ clip: { x: 700, y: 600, width: 4, height: 4 } });
  expect(shot.length).toBeGreaterThan(0);
  const px = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0);
    return Array.from(g.getImageData(1, 1, 1, 1).data);
  }, shot.toString("base64"));
  expect(px[0]).toBeGreaterThan(240); // white, not black
});

test("Arabic interface is right-to-left", async ({ page }) => {
  const tb = await open(page, { language: "ar" });
  await expect(tb.getByRole("button", { name: "ابدأ الرسم" })).toBeVisible();
  const dir = await page.frames().find((f) => f.url().includes("view=toolbar"))!.evaluate(() => document.documentElement.dir);
  expect(dir).toBe("rtl");
});

test("settings open from the library header", async ({ page }) => {
  const tb = await open(page);
  await tb.getByRole("button", { name: "All tools" }).click();
  await expect(tb.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: "Settings" })).toBeVisible();
});

test("settings window: sections render and invalid shortcuts are refused", async ({ page }) => {
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?view=settings");
  for (const s of ["General", "Toolbar", "Drawing", "Shortcuts", "Workspaces", "Backup & data", "Help & diagnostics"]) {
    await page.getByRole("button", { name: s, exact: true }).click();
    await expect(page.getByRole("heading", { name: s })).toBeVisible();
  }
  await expect(page.getByText(/Ctrl\+Shift\+Esc/)).toBeVisible();
  await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  await page.getByRole("button", { name: "Change" }).first().click();
  await page.keyboard.press("Shift+D");
  await expect(page.getByText(/include Ctrl or Alt/)).toBeVisible();
});
