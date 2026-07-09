:root {
  color-scheme: light;
  --bg: #fbf8ff;
  --bg-2: #f1e9ff;
  --ink: #35264d;
  --muted: #7a6a94;
  --line: #ded0f7;
  --panel: rgba(255, 253, 255, 0.92);
  --panel-solid: #fffafd;
  --lavender: #9b7de3;
  --lavender-dark: #6f51bf;
  --lavender-soft: #efe7ff;
  --pink: #ff9acb;
  --mint: #8dd8c7;
  --yellow: #ffd36e;
  --danger: #c84d7b;
  --shadow: 0 22px 55px rgba(102, 74, 150, 0.18);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 8%, rgba(255, 154, 203, 0.22), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(141, 216, 199, 0.24), transparent 26%),
    linear-gradient(180deg, #f8f1ff 0%, #fbf8ff 42%, #fff8fb 100%);
  color: var(--ink);
  font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", system-ui, sans-serif;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(155, 125, 227, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(155, 125, 227, 0.08) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.58), transparent 72%);
}

button,
input,
select {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

.app {
  position: relative;
  width: min(1120px, calc(100% - 28px));
  margin: 0 auto;
  padding: 28px 0 36px;
}

.view {
  display: none;
}

.view.active {
  display: block;
}

.masthead {
  position: relative;
  min-height: 260px;
  display: flex;
  align-items: end;
  overflow: hidden;
  padding: 30px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(82, 50, 139, 0.62), rgba(155, 125, 227, 0.12)),
    url("data:image/svg+xml,%3Csvg width='1400' height='560' viewBox='0 0 1400 560' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1400' height='560' fill='%23c5b2f4'/%3E%3Cpath d='M0 385 C190 280 320 455 510 342 S830 245 1020 338 S1240 430 1400 318 V560 H0Z' fill='%23fbf8ff' opacity='.62'/%3E%3Cpath d='M0 130 C175 30 338 185 505 92 S812 -6 1008 98 S1226 206 1400 104 V0 H0Z' fill='%23ff9acb' opacity='.34'/%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='8' opacity='.72'%3E%3Cpath d='M206 106h126v126H206zM332 106h126v126H332zM458 106h126v126H458zM206 232h126v126H206zM332 232h126v126H332zM458 232h126v126H458z'/%3E%3Cpath d='M840 118h96v96H840zM936 118h96v96H936zM1032 118h96v96H1032zM840 214h96v96H840zM936 214h96v96H936zM1032 214h96v96H1032z'/%3E%3C/g%3E%3Cg fill='%23ffd36e' opacity='.8'%3E%3Ccircle cx='705' cy='115' r='15'/%3E%3Ccircle cx='1194' cy='338' r='12'/%3E%3Ccircle cx='134' cy='330' r='10'/%3E%3C/g%3E%3C/svg%3E")
      center/cover;
  box-shadow: var(--shadow);
  color: #fff;
}

.brand-badge {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 8px 13px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  font-size: 0.86rem;
  font-weight: 900;
}

.hero-copy {
  width: min(760px, 100%);
  text-shadow: 0 2px 14px rgba(53, 38, 77, 0.32);
}

h1,
h2 {
  margin: 0;
  line-height: 1.08;
  letter-spacing: 0;
}

h1 {
  font-size: clamp(2.45rem, 7vw, 5.5rem);
  font-weight: 950;
}

h2 {
  font-size: 1.85rem;
}

.lead {
  width: min(660px, 100%);
  margin: 15px 0 0;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.75;
}

.eyebrow {
  margin: 0 0 8px;
  color: inherit;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.split,
.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 18px;
  margin-top: 18px;
}

.panel,
.result-panel,
.side-panel {
  background: var(--panel);
  border: 1px solid rgba(222, 208, 247, 0.92);
  border-radius: 8px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.panel,
.result-panel {
  padding: 22px;
}

.host-panel {
  border-top: 7px solid var(--lavender);
}

.join-panel {
  border-top: 7px solid var(--pink);
}

.panel-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  font-size: 1.28rem;
  font-weight: 950;
}

.panel-title small {
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 900;
}

label {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 900;
}

input,
select {
  width: 100%;
  min-height: 48px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  padding: 10px 13px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

input:focus,
select:focus,
button:focus-visible {
  outline: 3px solid rgba(155, 125, 227, 0.26);
  outline-offset: 2px;
}

.preview-shell {
  position: relative;
  width: 100%;
  margin-top: 14px;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px dashed #cbb8f3;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(155, 125, 227, 0.12), rgba(255, 154, 203, 0.12)),
    #fff;
  color: var(--muted);
  font-weight: 950;
}

.preview-shell img,
.side-panel img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-shell img {
  display: none;
}

.preview-shell.has-image img {
  display: block;
}

.preview-shell.has-image span {
  display: none;
}

.join-illustration {
  width: min(220px, 80%);
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 8px auto 20px;
  transform: rotate(-3deg);
}

.join-illustration span {
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(102, 74, 150, 0.16);
}

.join-illustration span:nth-child(1) {
  background: #c5b2f4;
}

.join-illustration span:nth-child(2) {
  background: #ffb7d9;
}

.join-illustration span:nth-child(3) {
  background: #b8eadf;
}

.join-illustration span:nth-child(4) {
  background: #ffe29a;
}

.primary,
.secondary,
.ghost {
  min-height: 48px;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 950;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.primary {
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, var(--lavender), var(--lavender-dark));
  color: #fff;
  box-shadow: 0 12px 26px rgba(111, 81, 191, 0.28);
}

.primary:hover,
.secondary:hover,
.ghost:hover {
  transform: translateY(-1px);
}

.secondary {
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, var(--yellow), #ffb4d5);
  color: #4d315f;
  box-shadow: 0 12px 24px rgba(255, 154, 203, 0.2);
}

.ghost {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
}

.message {
  min-height: 22px;
  margin: 12px 0 0;
  color: var(--muted);
  line-height: 1.5;
}

.message.error {
  color: var(--danger);
  font-weight: 900;
}

.hidden {
  display: none;
}

.result-panel {
  width: min(560px, 100%);
  margin: 14vh auto 0;
  text-align: center;
  border-top: 8px solid var(--lavender);
}

.result-panel .eyebrow {
  color: var(--lavender-dark);
}

.result-panel h2 {
  margin: 10px 0;
  font-size: clamp(3rem, 12vw, 6rem);
  color: var(--lavender-dark);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
}

.actions .primary,
.actions .secondary {
  width: auto;
  margin-top: 0;
}

.vertical {
  flex-direction: column;
}

.game-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
}

.game-bar .eyebrow {
  color: var(--lavender-dark);
}

.stats {
  display: flex;
  gap: 10px;
}

.stats div {
  min-width: 92px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel-solid);
  text-align: center;
  box-shadow: 0 10px 24px rgba(102, 74, 150, 0.12);
}

.stats span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 900;
}

.stats strong {
  display: block;
  margin-top: 4px;
  font-size: 1.12rem;
}

.puzzle-board {
  width: min(100%, 72vh);
  aspect-ratio: 1;
  display: grid;
  gap: 3px;
  align-self: start;
  border: 8px solid #fff;
  border-radius: 8px;
  overflow: hidden;
  background: #7a5ed0;
  box-shadow: var(--shadow), 0 0 0 1px var(--line);
  touch-action: manipulation;
}

.tile {
  border: 0;
  border-radius: 0;
  background-repeat: no-repeat;
  background-color: var(--lavender-soft);
  cursor: grab;
  min-width: 0;
  min-height: 0;
}

.tile:active,
.tile.dragging {
  cursor: grabbing;
  filter: brightness(1.09) saturate(1.08);
}

.tile.selected {
  box-shadow: inset 0 0 0 5px var(--yellow);
}

.side-panel {
  padding: 16px;
  align-self: start;
}

.side-panel img {
  aspect-ratio: 1;
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(155, 125, 227, 0.1), rgba(141, 216, 199, 0.16)),
    #fff;
}

dialog {
  width: min(480px, calc(100% - 32px));
  border: 0;
  border-radius: 8px;
  padding: 0;
  box-shadow: var(--shadow);
}

dialog::backdrop {
  background: rgba(53, 38, 77, 0.52);
}

.dialog-body {
  padding: 24px;
  text-align: center;
  background: var(--panel-solid);
  border-top: 8px solid var(--pink);
}

.dialog-body .eyebrow {
  color: var(--lavender-dark);
}

.secret-word {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: linear-gradient(135deg, #fff, var(--lavender-soft));
  color: var(--lavender-dark);
  font-size: 1.7rem;
  font-weight: 950;
  overflow-wrap: anywhere;
}

@media (max-width: 860px) {
  .app {
    width: min(100% - 20px, 680px);
    padding: 16px 0 24px;
  }

  .masthead {
    min-height: 250px;
    padding: 22px;
  }

  .brand-badge {
    top: 14px;
    left: 14px;
  }

  .split,
  .game-layout {
    grid-template-columns: 1fr;
  }

  .game-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats {
    width: 100%;
  }

  .stats div {
    flex: 1;
  }

  .puzzle-board {
    width: 100%;
  }
}
