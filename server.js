const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");
const MAX_BODY_BYTES = 16 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ROOMS_FILE)) {
    fs.writeFileSync(ROOMS_FILE, "{}", "utf8");
  }
}

function readRooms() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(ROOMS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeRooms(rooms) {
  ensureStore();
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), "utf8");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("BAD_JSON"));
      }
    });

    req.on("error", reject);
  });
}

function makeRoomCode(rooms) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let code = "";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i += 1) {
      code += alphabet[bytes[i] % alphabet.length];
    }
    if (!rooms[code]) return code;
  }
  return crypto.randomUUID().slice(0, 6).toUpperCase();
}

function validateRoomInput(input) {
  const title = String(input.title || "").trim().slice(0, 40);
  const secret = String(input.secret || "").trim();
  const imageData = String(input.imageData || "");
  const difficulty = Number.parseInt(input.difficulty, 10);
  const timeLimit = Number.parseInt(input.timeLimit || 0, 10);

  if (!secret || secret.length > 80) {
    return { error: "暗號詞必須介於 1 到 80 字之間。" };
  }

  if (!Number.isInteger(difficulty) || difficulty < 2 || difficulty > 8) {
    return { error: "難度必須是 2 到 8 之間。" };
  }

  if (!Number.isInteger(timeLimit) || timeLimit < 0 || timeLimit > 7200) {
    return { error: "限時秒數必須介於 0 到 7200 秒；0 代表不限時。" };
  }

  if (!imageData.startsWith("data:image/") || imageData.length > MAX_BODY_BYTES) {
    return { error: "請上傳 10MB 以內的圖片。" };
  }

  return {
    value: {
      title,
      secret,
      imageData,
      difficulty,
      timeLimit
    }
  };
}

async function handleApi(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/rooms") {
    let input;
    try {
      input = await readJsonBody(req);
    } catch (error) {
      const message = error.message === "PAYLOAD_TOO_LARGE" ? "圖片或資料太大。" : "資料格式不正確。";
      sendJson(res, 400, { error: message });
      return;
    }

    const validation = validateRoomInput(input);
    if (validation.error) {
      sendJson(res, 400, { error: validation.error });
      return;
    }

    const rooms = readRooms();
    const code = makeRoomCode(rooms);
    rooms[code] = {
      ...validation.value,
      code,
      createdAt: new Date().toISOString()
    };
    writeRooms(rooms);
    sendJson(res, 201, { code });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/rooms/")) {
    const code = decodeURIComponent(url.pathname.split("/").pop() || "").trim().toUpperCase();
    const rooms = readRooms();
    const room = rooms[code];
    if (!room) {
      sendJson(res, 404, { error: "找不到這個房號。" });
      return;
    }

    sendJson(res, 200, {
      code: room.code,
      title: room.title,
      secret: room.secret,
      imageData: room.imageData,
      difficulty: room.difficulty,
      timeLimit: room.timeLimit,
      createdAt: room.createdAt
    });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

function serveStatic(req, res, url) {
  let safePath = decodeURIComponent(url.pathname);
  if (safePath === "/") safePath = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallbackContent) => {
        if (fallbackError) {
          sendText(res, 404, "Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
        res.end(fallbackContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch(() => {
      sendJson(res, 500, { error: "伺服器發生錯誤。" });
    });
    return;
  }

  serveStatic(req, res, url);
});

ensureStore();
server.listen(PORT, () => {
  console.log(`Puzzle room game is running on port ${PORT}`);
});
