// UNO 5-player MVP frontend (Socket.IO)

const $ = (id) => document.getElementById(id);

const screenSetup = $("screen-setup");
const screenLobby = $("screen-lobby");
const screenGame = $("screen-game");

const backendUrlInput = $("backendUrl");
const usernameInput = $("username");
const avatarsWrap = $("avatars");
const btnContinue = $("btnContinue");
const setupMsg = $("setupMsg");

const lobbyRoom = $("lobbyRoom");
const lobbyCount = $("lobbyCount");
const playerList = $("playerList");
const lobbyMsg = $("lobbyMsg");

const topCard = $("topCard");
const curColor = $("curColor");
const turnName = $("turnName");
const pendingDraw = $("pendingDraw");
const handEl = $("hand");
const scoreboard = $("scoreboard");
const btnDraw = $("btnDraw");
const gameMsg = $("gameMsg");
const winnerEl = $("winner");

const AVATARS = ["A1", "A2", "A3", "A4", "A5", "A6"];
let selectedAvatar = localStorage.getItem("uno_avatar") || "A1";

let socket = null;
let roomId = null;
let playerId = null;
let youName = null;
let players = [];
let lastState = null;

function show(screen) {
  screenSetup.style.display = screen === "setup" ? "" : "none";
  screenLobby.style.display = screen === "lobby" ? "" : "none";
  screenGame.style.display = screen === "game" ? "" : "none";
}

function getRoomFromUrl() {
  const params = new URLSearchParams(location.search);
  const r = params.get("room");
  return r ? r.toUpperCase().trim() : null;
}

function renderAvatars() {
  avatarsWrap.innerHTML = "";
  for (const a of AVATARS) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = a;
    b.className = a === selectedAvatar ? "selected" : "";
    b.onclick = () => {
      selectedAvatar = a;
      localStorage.setItem("uno_avatar", a);
      renderAvatars();
    };
    avatarsWrap.appendChild(b);
  }
}

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function setMsg(el, msg) {
  el.textContent = msg || "";
}

function connectSocket(backendBase) {
  return new Promise((resolve, reject) => {
    try {
      socket = io(backendBase, {
        transports: ["websocket", "polling"]
      });

      const onErr = (e) => reject(e);

      socket.on("connect", () => resolve());
      socket.on("connect_error", onErr);
    } catch (e) {
      reject(e);
    }
  });
}

function renderLobby(info) {
  lobbyRoom.textContent = info.roomId;
  lobbyCount.textContent = `${info.players.length}/5`;
  playerList.innerHTML = info.players
    .map(p => `<div class="row"><span class="pill">${p.name}</span> <span class="muted">(${p.avatar})</span> ${p.connected ? "" : "<span class='muted'>(disconnected)</span>"}</div>`)
    .join("");

  if (!info.started) {
    lobbyMsg.textContent = info.players.length < 5
      ? `Waiting for players… (${info.players.length}/5)`
      : "Starting…";
  } else {
    lobbyMsg.textContent = "Game started!";
  }
}

function colorLabel(c) {
  return c === "R" ? "Red" : c === "G" ? "Green" : c === "B" ? "Blue" : c === "Y" ? "Yellow" : c;
}

function promptColor() {
  const c = prompt("Choose color: R, G, B, Y", "R");
  const cc = String(c || "").toUpperCase().trim();
  if (!["R", "G", "B", "Y"].includes(cc)) return null;
  return cc;
}

function renderGameState(state) {
  lastState = state;

  topCard.textContent = state.topCardLabel;
  curColor.textContent = colorLabel(state.currentColor);
  pendingDraw.textContent = String(state.pendingDraw || 0);

  const turnPid = state.turnPlayerId;
  const turnPlayer = players.find(p => p.id === turnPid);
  turnName.textContent = turnPlayer ? turnPlayer.name : turnPid;

  // scoreboard counts
  scoreboard.innerHTML = players.map(p => {
    const cnt = state.counts?.[p.id] ?? "?";
    const isTurn = p.id === turnPid;
    return `<div class="row" style="margin:6px 0;">
      <span class="pill">${isTurn ? "▶ " : ""}${p.name}</span>
      <span class="muted">(${p.avatar})</span>
      <span class="pill">${cnt} cards</span>
    </div>`;
  }).join("");

  // winner
  if (state.winner) {
    const w = players.find(p => p.id === state.winner);
    winnerEl.innerHTML = `<div class="pill" style="background:#12301a;border-color:#1f6b3b;">Winner: ${w ? w.name : state.winner}</div>`;
  } else {
    winnerEl.innerHTML = "";
  }

  // hand
  handEl.innerHTML = "";
  state.yourHandLabels.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "cardbtn";
    btn.textContent = label;
    btn.onclick = () => {
      // if wild, ask color
      const card = state.yourHand[idx];
      let chooseColor = null;
      if (card.t === "W" || card.t === "W4") {
        chooseColor = promptColor();
        if (!chooseColor) return;
      }
      socket.emit("play_card", { roomId, playerId, handIndex: idx, chooseColor });
      setMsg(gameMsg, "");
    };
    handEl.appendChild(btn);
  });

  // draw button enabled only on your turn & no winner
  btnDraw.disabled = state.winner || state.turnPlayerId !== playerId;
}

async function joinRoomFlow() {
  const backendBase = normalizeBaseUrl(backendUrlInput.value || localStorage.getItem("uno_backend") || "");
  youName = String(usernameInput.value || "").trim();

  if (!backendBase.startsWith("http")) {
    setMsg(setupMsg, "Paste your Render backend URL (https://...onrender.com)");
    return;
  }
  if (!youName) {
    setMsg(setupMsg, "Enter a username.");
    return;
  }

  localStorage.setItem("uno_backend", backendBase);
  localStorage.setItem("uno_name", youName);

  roomId = getRoomFromUrl();
  if (!roomId) {
    setMsg(setupMsg, "Missing ?room=ABCDE in the URL. (Use Discord link or add it manually.)");
    return;
  }

  btnContinue.disabled = true;
  setMsg(setupMsg, "Connecting…");

  try {
    await connectSocket(backendBase);

    socket.on("join_error", ({ message }) => {
      alert(message || "Join error");
      btnContinue.disabled = false;
      setMsg(setupMsg, message || "Join error");
      socket.disconnect();
    });

    socket.on("joined", (data) => {
      playerId = data.playerId;
      show("lobby");
      setMsg(setupMsg, "");
    });

    socket.on("room_update", (info) => {
      players = info.players;
      renderLobby(info);
      if (info.started) show("game");
    });

    socket.on("game_state", (state) => {
      show("game");
      renderGameState(state);
    });

    socket.emit("join_room", { roomId, name: youName, avatar: selectedAvatar });
  } catch (e) {
    console.error(e);
    btnContinue.disabled = false;
    setMsg(setupMsg, "Could not connect to backend. Check URL and try again.");
  } finally {
    btnContinue.disabled = false;
  }
}

btnDraw.onclick = () => {
  if (!socket || !roomId || !playerId) return;
  socket.emit("draw_card", { roomId, playerId });
};

function init() {
  renderAvatars();

  // restore
  const savedBackend = localStorage.getItem("uno_backend");
  if (savedBackend) backendUrlInput.value = savedBackend;
  const savedName = localStorage.getItem("uno_name");
  if (savedName) usernameInput.value = savedName;

  const r = getRoomFromUrl();
  if (r) {
    setMsg(setupMsg, `Room detected: ${r}. Enter name & click Continue.`);
  } else {
    setMsg(setupMsg, "Open with ?room=ABCDE (Discord link will provide it).");
  }

  btnContinue.onclick = joinRoomFlow;
  show("setup");
}

init();
