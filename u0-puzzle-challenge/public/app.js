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
let moves = 0;
let timerId = null;
let remainingSeconds = 0;
let gameLocked = false;

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

function renderBoard() {
  if (!currentRoom) return;

  const size = currentRoom.difficulty;
  puzzleBoard.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  puzzleBoard.innerHTML = "";

  tiles.forEach((tileValue, boardIndex) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.draggable = !gameLocked;
    tile.dataset.index = String(boardIndex);
    tile.setAttribute("aria-label", `拼圖第 ${boardIndex + 1} 格`);

    const row = Math.floor(tileValue / size);
    const col = tileValue % size;
    tile.style.backgroundImage = `url("${currentRoom.imageData}")`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;

    if (selectedIndex === boardIndex) tile.classList.add("selected");

    tile.addEventListener("click", () => handleTileClick(boardIndex));
    tile.addEventListener("dragstart", (event) => {
      if (gameLocked) return;
      draggedIndex = boardIndex;
      tile.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
    });
    tile.addEventListener("dragend", () => {
      draggedIndex = null;
      tile.classList.remove("dragging");
    });
    tile.addEventListener("dragover", (event) => {
      if (!gameLocked) event.preventDefault();
    });
    tile.addEventListener("drop", (event) => {
      event.preventDefault();
      if (draggedIndex !== null) swapTiles(draggedIndex, boardIndex);
    });

    puzzleBoard.appendChild(tile);
  });
}

function handleTileClick(index) {
  if (gameLocked) return;

  if (selectedIndex === null) {
    selectedIndex = index;
    renderBoard();
    return;
  }

  if (selectedIndex === index) {
    selectedIndex = null;
    renderBoard();
    return;
  }

  swapTiles(selectedIndex, index);
  selectedIndex = null;
}

function swapTiles(fromIndex, toIndex) {
  if (fromIndex === toIndex || gameLocked) return;
  [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];
  moves += 1;
  moveCount.textContent = String(moves);
  renderBoard();
  checkWin();
}

function checkWin() {
  const solved = tiles.every((value, index) => value === index);
  if (!solved) return;

  gameLocked = true;
  clearInterval(timerId);
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
      setMessage(gameMessage, "時間到，這次挑戰失敗。可以重新打散再挑戰一次。", true);
      renderBoard();
    }
  }, 1000);
}

function startGame(room) {
  currentRoom = room;
  tiles = makeShuffledTiles(room.difficulty);
  selectedIndex = null;
  draggedIndex = null;
  moves = 0;
  gameLocked = false;
  moveCount.textContent = "0";
  gameMessage.textContent = "";
  referenceImage.src = room.imageData;
  gameRoomCode.textContent = `房號 ${room.code}`;
  gameTitle.textContent = room.title || "小U0拼圖闖關";
  showView("game");
  renderBoard();
  startTimer();
}

async function fetchRoom(code) {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "讀取房間失敗。");
  return payload;
}

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
    uploadedImageData = await fileToDataUrl(file);
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
  const invitationMessage = `現在打開小u0拼圖🧩遊戲連結，輸入這個房號：${createdCode.textContent}
就可以開始挑戰囉！💕`;
  await navigator.clipboard.writeText(invitationMessage);
  setMessage(copyMessage, "已複製邀請訊息。");
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
  moves = 0;
  gameLocked = false;
  moveCount.textContent = "0";
  setMessage(gameMessage, "");
  renderBoard();
  startTimer();
});

backHomeBtn.addEventListener("click", () => {
  clearInterval(timerId);
  showView("home");
});

copySecretBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(secretWord.textContent);
  setMessage(secretCopyMessage, "已複製暗號詞。");
});

closeWinBtn.addEventListener("click", () => {
  winDialog.close();
});
