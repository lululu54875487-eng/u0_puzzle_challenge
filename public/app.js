const views = {
  home: document.querySelector("#homeView"),
  created: document.querySelector("#createdView"),
  game: document.querySelector("#gameView")
};

const hostForm = document.querySelector("#hostForm");
const joinForm = document.querySelector("#joinForm");
const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");
const previewShell = document.querySelector(".preview-shell");
const timeModeInput = document.querySelector("#timeModeInput");
const customTimeWrap = document.querySelector("#customTimeWrap");
const customTimeInput = document.querySelector("#customTimeInput");
const hostMessage = document.querySelector("#hostMessage");
const joinMessage = document.querySelector("#joinMessage");
const createdCode = document.querySelector("#createdCode");
const copyMessage = document.querySelector("#copyMessage");
const copyCodeBtn = document.querySelector("#copyCodeBtn");
const createAnotherBtn = document.querySelector("#createAnotherBtn");
const roomCodeInput = document.querySelector("#roomCodeInput");
const puzzleBoard = document.querySelector("#puzzleBoard");
const referenceImage = document.querySelector("#referenceImage");
const gameRoomCode = document.querySelector("#gameRoomCode");
const gameTitle = document.querySelector("#gameTitle");
const moveCount = document.querySelector("#moveCount");
const timerText = document.querySelector("#timerText");
const shuffleBtn = document.querySelector("#shuffleBtn");
const backHomeBtn = document.querySelector("#backHomeBtn");
const gameMessage = document.querySelector("#gameMessage");
const winDialog = document.querySelector("#winDialog");
const secretWord = document.querySelector("#secretWord");
const copySecretBtn = document.querySelector("#copySecretBtn");
const closeWinBtn = document.querySelector("#closeWinBtn");
const secretCopyMessage = document.querySelector("#secretCopyMessage");

let uploadedImageData = "";
let currentRoom = null;
let tiles = [];
let selectedIndex = null;
let draggedIndex = null;
let pointerStartIndex = null;
let pointerMoved = false;
let suppressNextClick = false;
let moves = 0;
let timerId = null;
let remainingSeconds = 0;
let gameLocked = false;
let puzzleImageUrl = "";
let hintLevelShown = 0;

const MOVE_HINTS = {
  2: [
    { moves: 6, text: "小提示：先找角落的位置，2x2 很快就能完成。" },
    { moves: 10, text: "再試試把兩格互換，觀察原圖的方向和邊緣。" }
  ],
  3: [
    { moves: 16, text: "小提示：先完成第一排或四個角落，會比較好拼。" },
    { moves: 26, text: "可以看右側原圖，從顏色最明顯的區塊開始交換。" }
  ],
  4: [
    { moves: 32, text: "小提示：高難度建議先拼外框，再處理中間區塊。" },
    { moves: 50, text: "別急，先鎖定一個角落，把相鄰顏色慢慢排回去。" }
  ],
  5: [
    { moves: 55, text: "魔王級提示：先不要急著拼中間，先把四邊外框整理出來。" },
    { moves: 85, text: "再看右側原圖，挑一個顏色最明顯的區塊慢慢完成。" }
  ]
};

function showView(name) {
  Object.values(views).forEach((view) => view.classList.remove("active"));
  views[name].classList.add("active");
}

function setMessage(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", isError);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

async function resizeImageDataUrl(dataUrl, maxSize = 1400, quality = 0.86) {
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));

  if (scale >= 1 && dataUrl.length < 3 * 1024 * 1024) {
    return dataUrl;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { alpha: false });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function formatTime(seconds) {
  if (!seconds) return "不限時";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function getTimeLimit() {
  if (timeModeInput.value === "custom") {
    return Number.parseInt(customTimeInput.value || "0", 10);
  }
  return Number.parseInt(timeModeInput.value, 10);
}

function shuffleArray(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeShuffledTiles(size) {
  const ordered = Array.from({ length: size * size }, (_, index) => index);
  let shuffled = shuffleArray(ordered);
  let guard = 0;
  while (shuffled.every((value, index) => value === index) && guard < 20) {
    shuffled = shuffleArray(ordered);
    guard += 1;
  }
  return shuffled;
}

function dataUrlToObjectUrl(dataUrl) {
  try {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return dataUrl;
  }
}

function setPuzzleImage(imageData) {
  if (puzzleImageUrl && puzzleImageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(puzzleImageUrl);
  }
  puzzleImageUrl = dataUrlToObjectUrl(imageData);
  puzzleBoard.style.setProperty("--puzzle-image", `url("${puzzleImageUrl}")`);
}

function getTilePosition(tileValue, size) {
  const row = Math.floor(tileValue / size);
  const col = tileValue % size;
  return {
    x: size === 1 ? 0 : (col / (size - 1)) * 100,
    y: size === 1 ? 0 : (row / (size - 1)) * 100
  };
}

function updateTileElement(boardIndex) {
  const tile = puzzleBoard.children[boardIndex];
  if (!tile || !currentRoom) return;

  const size = currentRoom.difficulty;
  const tileValue = tiles[boardIndex];
  const position = getTilePosition(tileValue, size);

  tile.dataset.index = String(boardIndex);
  tile.dataset.value = String(tileValue);
  tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
  tile.style.backgroundPosition = `${position.x}% ${position.y}%`;
  tile.classList.toggle("selected", selectedIndex === boardIndex);
  tile.draggable = !gameLocked;
  tile.setAttribute("aria-label", `拼圖第 ${boardIndex + 1} 格`);
}

function updateAllTiles() {
  for (let i = 0; i < tiles.length; i += 1) {
    updateTileElement(i);
  }
}

function buildBoard() {
  if (!currentRoom) return;

  const size = currentRoom.difficulty;
  puzzleBoard.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  puzzleBoard.innerHTML = "";

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    fragment.appendChild(tile);
  }
  puzzleBoard.appendChild(fragment);
  updateAllTiles();
}

function getTileIndexFromEventTarget(target) {
  const tile = target.closest?.(".tile");
  if (!tile || !puzzleBoard.contains(tile)) return null;
  return Number.parseInt(tile.dataset.index, 10);
}

function handleTileClick(index) {
  if (gameLocked || !Number.isInteger(index)) return;

  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }

  if (selectedIndex === null) {
    selectedIndex = index;
    updateTileElement(index);
    return;
  }

  if (selectedIndex === index) {
    const previousIndex = selectedIndex;
    selectedIndex = null;
    updateTileElement(previousIndex);
    return;
  }

  const previousIndex = selectedIndex;
  selectedIndex = null;
  updateTileElement(previousIndex);
  swapTiles(previousIndex, index);
}

function swapTiles(fromIndex, toIndex) {
  if (fromIndex === toIndex || gameLocked) return;
  [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];
  moves += 1;
  moveCount.textContent = String(moves);
  updateTileElement(fromIndex);
  updateTileElement(toIndex);
  showMoveHintIfNeeded();
  checkWin();
}

function showMoveHintIfNeeded() {
  const hints = MOVE_HINTS[currentRoom?.difficulty] || [];
  const nextHint = hints[hintLevelShown];
  if (!nextHint || moves < nextHint.moves) return;
  hintLevelShown += 1;
  setMessage(gameMessage, nextHint.text);
}

function checkWin() {
  const solved = tiles.every((value, index) => value === index);
  if (!solved) return;

  gameLocked = true;
  clearInterval(timerId);
  updateAllTiles();
  secretWord.textContent = currentRoom.secret;
  secretCopyMessage.textContent = "";
  winDialog.showModal();
}

function startTimer() {
  clearInterval(timerId);
  remainingSeconds = currentRoom.timeLimit || 0;
  timerText.textContent = formatTime(remainingSeconds);

  if (!remainingSeconds) return;

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    timerText.textContent = formatTime(remainingSeconds);

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      gameLocked = true;
      selectedIndex = null;
      setMessage(gameMessage, "時間到，這次挑戰失敗。可以重新打散再挑戰一次。", true);
      updateAllTiles();
    }
  }, 1000);
}

function startGame(room) {
  currentRoom = room;
  tiles = makeShuffledTiles(room.difficulty);
  selectedIndex = null;
  draggedIndex = null;
  pointerStartIndex = null;
  pointerMoved = false;
  suppressNextClick = false;
  moves = 0;
  hintLevelShown = 0;
  gameLocked = false;
  moveCount.textContent = "0";
  setMessage(gameMessage, "移動拼圖格來交換位置；步數太多時會出現小提示。");
  referenceImage.src = room.imageData;
  setPuzzleImage(room.imageData);
  gameRoomCode.textContent = `房號 ${room.code}`;
  gameTitle.textContent = room.title || "小U0拼圖闖關";
  showView("game");
  buildBoard();
  startTimer();
}

async function fetchRoom(code) {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "讀取房間失敗。");
  return payload;
}

puzzleBoard.addEventListener("click", (event) => {
  const index = getTileIndexFromEventTarget(event.target);
  if (index !== null) handleTileClick(index);
});

puzzleBoard.addEventListener("dragstart", (event) => {
  const index = getTileIndexFromEventTarget(event.target);
  if (gameLocked || index === null) {
    event.preventDefault();
    return;
  }
  draggedIndex = index;
  event.target.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
});

puzzleBoard.addEventListener("dragend", (event) => {
  draggedIndex = null;
  event.target.classList.remove("dragging");
});

puzzleBoard.addEventListener("dragover", (event) => {
  if (!gameLocked) event.preventDefault();
});

puzzleBoard.addEventListener("drop", (event) => {
  event.preventDefault();
  const index = getTileIndexFromEventTarget(event.target);
  if (draggedIndex !== null && index !== null) {
    selectedIndex = null;
    swapTiles(draggedIndex, index);
  }
});

puzzleBoard.addEventListener("pointerdown", (event) => {
  const index = getTileIndexFromEventTarget(event.target);
  if (gameLocked || index === null) return;
  pointerStartIndex = index;
  pointerMoved = false;
});

puzzleBoard.addEventListener("pointermove", () => {
  if (pointerStartIndex !== null) pointerMoved = true;
});

puzzleBoard.addEventListener("pointerup", (event) => {
  if (gameLocked || pointerStartIndex === null) return;

  const target = document.elementFromPoint(event.clientX, event.clientY);
  const endIndex = getTileIndexFromEventTarget(target);
  if (pointerMoved && endIndex !== null && endIndex !== pointerStartIndex) {
    selectedIndex = null;
    suppressNextClick = true;
    swapTiles(pointerStartIndex, endIndex);
  }

  pointerStartIndex = null;
  pointerMoved = false;
});

puzzleBoard.addEventListener("pointercancel", () => {
  pointerStartIndex = null;
  pointerMoved = false;
});

imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  uploadedImageData = "";
  previewShell.classList.remove("has-image");

  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
    setMessage(hostMessage, "請選擇 10MB 以內的圖片。", true);
    imageInput.value = "";
    return;
  }

  try {
    const originalImageData = await fileToDataUrl(file);
    uploadedImageData = await resizeImageDataUrl(originalImageData);
    imagePreview.src = uploadedImageData;
    previewShell.classList.add("has-image");
    setMessage(hostMessage, "");
  } catch {
    setMessage(hostMessage, "圖片讀取失敗，請換一張試試。", true);
  }
});

timeModeInput.addEventListener("change", () => {
  customTimeWrap.classList.toggle("hidden", timeModeInput.value !== "custom");
});

hostForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(hostMessage, "建立中...");

  const timeLimit = getTimeLimit();
  const payload = {
    title: document.querySelector("#titleInput").value,
    imageData: uploadedImageData,
    difficulty: document.querySelector("#difficultyInput").value,
    timeLimit,
    secret: document.querySelector("#secretInput").value
  };

  if (!payload.imageData) {
    setMessage(hostMessage, "請先上傳圖片。", true);
    return;
  }

  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "建立失敗。");
    createdCode.textContent = result.code;
    showView("created");
    setMessage(copyMessage, "");
  } catch (error) {
    setMessage(hostMessage, error.message, true);
  }
});

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = roomCodeInput.value.trim().toUpperCase();
  if (!code) return;

  setMessage(joinMessage, "讀取房間中...");
  try {
    const room = await fetchRoom(code);
    setMessage(joinMessage, "");
    startGame(room);
  } catch (error) {
    setMessage(joinMessage, error.message, true);
  }
});

copyCodeBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(createdCode.textContent);
  setMessage(copyMessage, "已複製房號。");
});

createAnotherBtn.addEventListener("click", () => {
  hostForm.reset();
  uploadedImageData = "";
  previewShell.classList.remove("has-image");
  customTimeWrap.classList.add("hidden");
  setMessage(hostMessage, "");
  showView("home");
});

shuffleBtn.addEventListener("click", () => {
  if (!currentRoom) return;
  tiles = makeShuffledTiles(currentRoom.difficulty);
  selectedIndex = null;
  draggedIndex = null;
  pointerStartIndex = null;
  pointerMoved = false;
  suppressNextClick = false;
  moves = 0;
  hintLevelShown = 0;
  gameLocked = false;
  moveCount.textContent = "0";
  setMessage(gameMessage, "已重新打散，試著先從角落開始。");
  buildBoard();
  startTimer();
});

backHomeBtn.addEventListener("click", () => {
  clearInterval(timerId);
  showView("home");
});

copySecretBtn.addEventListener("click", async () => {
  const invitationMessage = `現在打開小u0拼圖🧩遊戲連結，輸入這個房號：${currentRoom.code}
就可以開始挑戰囉！💕`;
  
  await navigator.clipboard.writeText(invitationMessage);
  setMessage(secretCopyMessage, "已複製邀請訊息。");
});

closeWinBtn.addEventListener("click", () => {
  winDialog.close();
});
