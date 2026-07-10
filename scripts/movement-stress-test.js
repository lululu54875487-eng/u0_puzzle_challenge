const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "u0-puzzle-stress-"));

const { chromium } = require("playwright");
const { createServer } = require("../server");

const SAMPLE_IMAGE_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVR42mP8z8Dwn4ECwESJ5lEDRg0YNWDUBJqGgYGhEafVAwD6txQhQgF8SAAAAABJRU5ErkJggg==",
  "base64"
);

function findBrowserExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

(async () => {
  const imagePath = path.join(process.env.DATA_DIR, "sample.png");
  fs.writeFileSync(imagePath, SAMPLE_IMAGE_BYTES);

  const server = createServer();
  const baseUrl = await listen(server);
  const browser = await chromium.launch({
    headless: true,
    executablePath: findBrowserExecutable()
  });

  const pageErrors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") pageErrors.push(message.text());
    });

    await page.goto(baseUrl);
    await page.fill("#titleInput", "壓力測試");
    await page.setInputFiles("#imageInput", imagePath);
    await page.selectOption("#difficultyInput", "5");
    await page.selectOption("#timeModeInput", "0");
    await page.fill("#secretInput", "壓力測試暗號");
    await page.click("#hostForm button[type='submit']");
    await page.waitForSelector("#createdView.active #createdCode");
    const code = (await page.textContent("#createdCode")).trim();

    await page.goto(baseUrl);
    await page.fill("#roomCodeInput", code);
    await page.click("#joinForm button[type='submit']");
    await page.waitForSelector("#gameView.active .tile");

    for (let i = 0; i < 180; i += 1) {
      const from = i % 25;
      const to = (i * 7 + 3) % 25;
      await page.locator(".tile").nth(from).click();
      await page.locator(".tile").nth(to).click();
    }

    const state = await page.evaluate(() => ({
      tileCount: document.querySelectorAll(".tile").length,
      moveCount: Number(document.querySelector("#moveCount").textContent),
      activeView: document.querySelector(".view.active")?.id,
      bodyText: document.body.textContent
    }));

    if (pageErrors.length) {
      throw new Error(`Page errors: ${pageErrors.join(" | ")}`);
    }
    if (state.tileCount !== 25 || state.moveCount < 170 || state.activeView !== "gameView") {
      throw new Error(`Unexpected puzzle state: ${JSON.stringify(state)}`);
    }

    console.log(JSON.stringify({ ok: true, code, tileCount: state.tileCount, moveCount: state.moveCount }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
