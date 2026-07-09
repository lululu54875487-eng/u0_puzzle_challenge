process.env.DATA_DIR = require("node:fs").mkdtempSync(
  require("node:path").join(require("node:os").tmpdir(), "u0-puzzle-test-")
);

const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer, makeRoomCode, validateRoomInput, readRooms } = require("../server");

const SAMPLE_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l4NfYQAAAABJRU5ErkJggg==";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

test("makeRoomCode returns a unique six-character room code", () => {
  const code = makeRoomCode({ ABC123: {} });
  assert.match(code, /^[A-Z2-9]{6}$/);
  assert.notEqual(code, "ABC123");
});

test("validateRoomInput accepts a valid room", () => {
  const result = validateRoomInput({
    title: "  測試房  ",
    secret: "薰衣草暗號",
    imageData: SAMPLE_IMAGE,
    difficulty: "4",
    timeLimit: "300"
  });

  assert.equal(result.error, undefined);
  assert.equal(result.value.title, "測試房");
  assert.equal(result.value.secret, "薰衣草暗號");
  assert.equal(result.value.difficulty, 4);
  assert.equal(result.value.timeLimit, 300);
});

test("validateRoomInput rejects missing data", () => {
  assert.match(validateRoomInput({}).error, /暗號詞/);
  assert.match(
    validateRoomInput({ secret: "ok", imageData: SAMPLE_IMAGE, difficulty: 9, timeLimit: 0 }).error,
    /難度/
  );
  assert.match(
    validateRoomInput({ secret: "ok", imageData: "not-image", difficulty: 3, timeLimit: 0 }).error,
    /圖片/
  );
});

test("rooms API creates and returns a room", async () => {
  const server = createServer();
  const baseUrl = await listen(server);
  test.after(() => server.close());

  const createResponse = await fetch(`${baseUrl}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "API 測試房",
      secret: "API暗號",
      imageData: SAMPLE_IMAGE,
      difficulty: 3,
      timeLimit: 0
    })
  });

  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.match(created.code, /^[A-Z2-9]{6}$/);

  const getResponse = await fetch(`${baseUrl}/api/rooms/${created.code.toLowerCase()}`);
  assert.equal(getResponse.status, 200);
  const room = await getResponse.json();
  assert.equal(room.code, created.code);
  assert.equal(room.title, "API 測試房");
  assert.equal(room.secret, "API暗號");
  assert.equal(room.difficulty, 3);

  const rooms = readRooms();
  assert.ok(rooms[created.code]);
});

test("rooms API returns 404 for an unknown room", async () => {
  const server = createServer();
  const baseUrl = await listen(server);
  test.after(() => server.close());

  const response = await fetch(`${baseUrl}/api/rooms/NOPE99`);
  assert.equal(response.status, 404);
});
