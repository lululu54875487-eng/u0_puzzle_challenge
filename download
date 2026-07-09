const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "u0-puzzle-playtest-"));

const { chromium } = require("playwright");
const { createServer } = require("../server");

const SAMPLE_IMAGE_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVR42mP8z8Dwn4ECwESJ5lEDRg0YNWDUBJqGgYGhEafVAwD6txQhQgF8SAAAAABJRU5ErkJggg==",
  "base64"
);

const rounds = [
  { title: "第一回合", difficulty: "3", timeMode: "0", secret: "第一回合暗號" },
  { title: "第二回合", difficulty: "4", timeMode: "180", secret: "第二回合暗號" },
  { title: "第三回合", difficulty: "5", timeMode: "custom", customTime: "600", secret: "第三回合暗號" }
];

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

async function createRoom(page, baseUrl, round, imagePath) {
  await page.goto(baseUrl);
  await page.fill("#titleInput", round.title);
  await page.setInputFiles("#imageInput", imagePath);
  await page.selectOption("#difficultyInput", round.difficulty);
  await page.selectOption("#timeModeInput", round.timeMode);
  if (round.timeMode === "custom") {
    await page.fill("#customTimeInput", round.customTime);
  }
  await page.fill("#secretInput", round.secret);
  await page.click("#hostForm button[type='submit']");
  await page.waitForSelector("#createdView.active #createdCode");
  return page.textContent("#createdCode");
}

async function solvePuzzle(page) {
  for (let guard = 0; guard < 200; guard += 1) {
    const state = await page.evaluate(() => {
      const board = document.querySelector("#puzzleBoard");
      const size = getComputedStyle(board).gridTemplateColumns.split(" ").filter(Boolean).length;
      const tileValues = Array.from(document.querySelectorAll(".tile")).map((tile) => {
        const [xRaw, yRaw] = tile.style.backgroundPosition.split(" ");
        const x = Number.parseFloat(xRaw);
        const y = Number.parseFloat(yRaw);
        const col = Math.round((x / 100) * (size - 1));
        const row = Math.round((y / 100) * (size - 1));
        return row * size + col;
      });

      const target = tileValues.findIndex((value, index) => value !== index);
      if (target === -1) return { solved: true };

      return {
        solved: false,
        target,
        source: tileValues.findIndex((value) => value === target)
      };
    });

    if (state.solved) return;
    await page.locator(".tile").nth(state.target).click();
    await page.locator(".tile").nth(state.source).click();
  }

  throw new Error("Puzzle did not solve within the safety limit.");
}

async function playRound(browser, baseUrl, round, imagePath) {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const code = await createRoom(hostPage, baseUrl, round, imagePath);
  await hostContext.close();

  const playerContext = await browser.newContext();
  const playerPage = await playerContext.newPage();
  await playerPage.goto(baseUrl);
  await playerPage.fill("#roomCodeInput", code.trim());
  await playerPage.click("#joinForm button[type='submit']");
  await playerPage.waitForSelector("#gameView.active .tile");
  await solvePuzzle(playerPage);
  await playerPage.waitForSelector("#winDialog[open]");
  const secret = await playerPage.textContent("#secretWord");
  await playerContext.close();

  if (secret !== round.secret) {
    throw new Error(`Expected secret "${round.secret}" but got "${secret}".`);
  }

  return { code: code.trim(), secret };
}

(async () => {
  const imagePath = path.join(process.env.DATA_DIR, "sample.png");
  fs.writeFileSync(imagePath, SAMPLE_IMAGE_BYTES);

  const server = createServer();
  const baseUrl = await listen(server);
  const executablePath = findBrowserExecutable();
  const browser = await chromium.launch({
    headless: true,
    executablePath
  });

  try {
    const results = [];
    for (const round of rounds) {
      results.push(await playRound(browser, baseUrl, round, imagePath));
    }
    console.log(JSON.stringify({ ok: true, rounds: results }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
