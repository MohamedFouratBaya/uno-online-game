const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const rooms = new Map();

app.get("/api/status", (req, res) => {
  res.json({ status: "UNO backend running" });
});

app.post("/api/rooms/create", (req, res) => {
  const roomId = randomUUID().slice(0, 6).toUpperCase();
  rooms.set(roomId, { createdAt: Date.now() });
  res.json({ roomId });
});

app.listen(PORT, () => {
  console.log(`UNO backend listening on ${PORT}`);
});
