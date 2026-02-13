const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// Allow your Cloudflare Pages domain. You can set FRONTEND_ORIGIN in Render.
// If empty, it allows all (fine for testing).
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get("/api/status", (_req, res) => {
  res.json({ ok: true, status: "UNO backend running" });
});

// Create a new room (5 players max)
app.post("/api/rooms/create", (_req, res) => {
  const roomId = crypto.randomUUID().slice(0, 5).toUpperCase();
  ensureRoom(roomId);
  res.json({ roomId });
});

const rooms = new Map();

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      players: [], // { id, name, avatar, socketId, connected }
      started: false,
      state: null // game state after start
    });
  }
  return rooms.get(roomId);
}

function makeDeck() {
  const colors = ["R", "G", "B", "Y"];
  const deck = [];

  // number cards: one 0, two of 1-9 per color
  for (const c of colors) {
    deck.push({ t: "N", c, n: 0 });
    for (let n = 1; n <= 9; n++) {
      deck.push({ t: "N", c, n });
      deck.push({ t: "N", c, n });
    }

    // action cards: two each per color
    for (let i = 0; i < 2; i++) {
      deck.push({ t: "S", c }); // Skip
      deck.push({ t: "R", c }); // Reverse
      deck.push({ t: "D2", c }); // Draw 2
    }
  }

  // wild cards: 4 wild, 4 wild+4
  for (let i = 0; i < 4; i++) {
    deck.push({ t: "W" });  // Wild
    deck.push({ t: "W4" }); // Wild +4
  }

  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardToString(card) {
  if (card.t === "N") return `${card.c}${card.n}`;
  if (card.t === "S") return `${card.c}⏭`;
  if (card.t === "R") return `${card.c}🔁`;
  if (card.t === "D2") return `${card.c}+2`;
  if (card.t === "W") return `WILD`;
  if (card.t === "W4") return `W+4`;
  return "???";
}

function isPlayable(card, topCard, currentColor) {
  // Wild always playable
  if (card.t === "W" || card.t === "W4") return true;

  // If top is wild, match currentColor or same action/number type?
  const topColor = topCard.t === "W" || topCard.t === "W4" ? currentColor : topCard.c;

  // Match color
  if (card.c && card.c === topColor) return true;

  // Match number
  if (card.t === "N" && topCard.t === "N" && card.n === topCard.n) return true;

  // Match action type
  if (card.t !== "N" && topCard.t === card.t) return true;

  return false;
}

function nextIndex(state, steps = 1) {
  const n = state.playersOrder.length;
  let idx = state.turnIndex;
  for (let i = 0; i < steps; i++) {
    idx = (idx + state.direction + n) % n;
  }
  return idx;
}

function dealAndStart(room) {
  const deck = makeDeck();

  // players order = join order
  const playersOrder = room.players.map(p => p.id);

  const hands = new Map();
  for (const pid of playersOrder) hands.set(pid, []);

  // deal 7 each
  for (let i = 0; i < 7; i++) {
    for (const pid of playersOrder) {
      hands.get(pid).push(deck.pop());
    }
  }

  // flip top card - avoid wild as first card for simplicity
  let top = deck.pop();
  while (top.t === "W" || top.t === "W4") {
    deck.unshift(top); // put back in front
    top = deck.pop();
  }

  const state = {
    playersOrder,
    hands, // Map(pid -> card[])
    drawPile: deck,
    discardPile: [top],
    currentColor: top.c || "R",
    turnIndex: 0,
    direction: 1,
    pendingDraw: 0,
    startedAt: Date.now(),
    winner: null
  };

  room.started = true;
  room.state = state;
}

function publicRoomInfo(room) {
  return {
    roomId: room.roomId,
    started: room.started,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      connected: p.connected
    }))
  };
}

function emitRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("room_update", publicRoomInfo(room));
}

function emitStateToRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.state) return;

  // send a masked state to everyone (no other hands)
  const state = room.state;
  const top = state.discardPile[state.discardPile.length - 1];

  const payloadBase = {
    roomId,
    started: room.started,
    topCard: top,
    topCardLabel: cardToString(top),
    currentColor: state.currentColor,
    turnPlayerId: state.playersOrder[state.turnIndex],
    direction: state.direction,
    pendingDraw: state.pendingDraw,
    counts: Object.fromEntries(state.playersOrder.map(pid => [pid, state.hands.get(pid).length])),
    winner: state.winner
  };

  for (const pid of state.playersOrder) {
    const sockId = room.players.find(p => p.id === pid)?.socketId;
    if (!sockId) continue;

    const hand = state.hands.get(pid) || [];
    io.to(sockId).emit("game_state", {
      ...payloadBase,
      you: pid,
      yourHand: hand,
      yourHandLabels: hand.map(cardToString)
    });
  }
}

function requireRoomAndPlayer(socket, roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, err: "Room not found" };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { ok: false, err: "Player not in room" };
  if (player.socketId !== socket.id) return { ok: false, err: "Socket mismatch" };
  return { ok: true, room, player };
}

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId, name, avatar }) => {
    try {
      if (!roomId || typeof roomId !== "string") return;
      roomId = roomId.toUpperCase().trim();

      const room = ensureRoom(roomId);

      // If room already started, allow reconnect only (same playerId)
      // We'll create playerId from socket + random for new join.
      if (room.started) {
        socket.emit("join_error", { message: "Game already started. Create a new room." });
        return;
      }

      if (room.players.length >= 5) {
        socket.emit("join_error", { message: "Room is full (5/5)." });
        return;
      }

      const playerId = crypto.randomUUID().slice(0, 8);
      const player = {
        id: playerId,
        name: String(name || "Player").slice(0, 16),
        avatar: String(avatar || "A1").slice(0, 16),
        socketId: socket.id,
        connected: true
      };

      room.players.push(player);

      socket.join(roomId);
      socket.emit("joined", { roomId, playerId });
      emitRoom(roomId);

      // auto start at 5 players
      if (room.players.length === 5 && !room.started) {
        dealAndStart(room);
        emitRoom(roomId);
        emitStateToRoom(roomId);
      }
    } catch (e) {
      socket.emit("join_error", { message: "Join failed." });
    }
  });

  socket.on("draw_card", ({ roomId, playerId }) => {
    const chk = requireRoomAndPlayer(socket, roomId, playerId);
    if (!chk.ok) return;
    const { room } = chk;
    if (!room.started || !room.state) return;

    const state = room.state;
    const currentPid = state.playersOrder[state.turnIndex];
    if (playerId !== currentPid) return;

    // ensure draw pile (simple reshuffle from discard if empty)
    if (state.drawPile.length === 0) {
      const top = state.discardPile.pop();
      const rest = state.discardPile;
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      state.drawPile = rest;
      state.discardPile = [top];
    }

    const hand = state.hands.get(playerId);
    if (!hand) return;

    // apply pending draw if exists
    const toDraw = state.pendingDraw > 0 ? state.pendingDraw : 1;
    state.pendingDraw = 0;

    for (let i = 0; i < toDraw; i++) {
      if (state.drawPile.length === 0) break;
      hand.push(state.drawPile.pop());
    }

    // end turn after drawing (UNO-like)
    state.turnIndex = nextIndex(state, 1);

    emitStateToRoom(roomId);
  });

  socket.on("play_card", ({ roomId, playerId, handIndex, chooseColor }) => {
    const chk = requireRoomAndPlayer(socket, roomId, playerId);
    if (!chk.ok) return;
    const { room } = chk;
    if (!room.started || !room.state) return;

    const state = room.state;
    const currentPid = state.playersOrder[state.turnIndex];
    if (playerId !== currentPid) return;

    const hand = state.hands.get(playerId);
    if (!hand) return;

    const idx = Number(handIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= hand.length) return;

    const card = hand[idx];
    const top = state.discardPile[state.discardPile.length - 1];

    if (!isPlayable(card, top, state.currentColor)) return;

    // remove from hand -> discard
    hand.splice(idx, 1);
    state.discardPile.push(card);

    // win check
    if (hand.length === 0) {
      state.winner = playerId;
      emitStateToRoom(roomId);
      return;
    }

    // apply card effects
    let advance = 1;

    if (card.t === "N") {
      state.currentColor = card.c;
    } else if (card.t === "S") {
      state.currentColor = card.c;
      advance = 2; // skip next
    } else if (card.t === "R") {
      state.currentColor = card.c;
      state.direction *= -1;
      advance = 1;
    } else if (card.t === "D2") {
      state.currentColor = card.c;
      state.pendingDraw += 2;
      advance = 1;
    } else if (card.t === "W") {
      // require chooseColor
      const cc = String(chooseColor || "").toUpperCase();
      if (!["R", "G", "B", "Y"].includes(cc)) return;
      state.currentColor = cc;
      advance = 1;
    } else if (card.t === "W4") {
      const cc = String(chooseColor || "").toUpperCase();
      if (!["R", "G", "B", "Y"].includes(cc)) return;
      state.currentColor = cc;
      state.pendingDraw += 4;
      advance = 1;
    }

    // next turn
    state.turnIndex = nextIndex(state, advance);

    emitStateToRoom(roomId);
  });

  socket.on("disconnect", () => {
    // mark disconnected
    for (const room of rooms.values()) {
      const p = room.players.find(x => x.socketId === socket.id);
      if (p) {
        p.connected = false;
        p.socketId = null;
        emitRoom(room.roomId);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`UNO backend listening on ${PORT}`);
  console.log(`FRONTEND_ORIGIN=${FRONTEND_ORIGIN}`);
});
