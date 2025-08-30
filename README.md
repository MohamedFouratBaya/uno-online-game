# UNO Online Backend

A complete real-time multiplayer UNO card game backend built with Node.js, Express, and Socket.io. This server provides both REST API endpoints for room management and WebSocket connections for real-time gameplay.

## Features

- **Complete UNO Game Logic**: Full implementation of official UNO rules with 108-card deck
- **Official "Play After Draw" Rule**: Limbo state implementation allowing players to play or pass drawn cards
- **Real-time Multiplayer**: WebSocket-based gameplay supporting 2-10 players per room
- **Room Management**: Create and join game rooms with manual game initialization
- **Player Authentication**: User registration and login system with avatar selection
- **Player Disconnect Handling**: Robust disconnect/reconnect logic with game state preservation
- **RESTful API**: HTTP endpoints for room creation and status checking
- **Scalable Architecture**: Modular design with separate game engine and server logic

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uno-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

The server will start on port 3001 by default.

## 🆕 What's New

### Latest Updates
- **Limbo State Feature**: Official UNO "play after draw" rule implementation
- **User Authentication**: Registration and login system with avatar selection
- **Enhanced Game State**: Player names and avatars included in all responses
- **New WebSocket Events**: `playDrawnCard` and `passDrawnCard` for limbo state
- **Comprehensive Testing**: Full test suite for all features

### Available Endpoints
- **Authentication**: `/api/auth/register`, `/api/auth/login`
- **Room Management**: `/api/rooms/create`, `/api/rooms/:id/join`, `/api/rooms/:id`
- **WebSocket Events**: `joinRoom`, `startGame`, `playCard`, `drawCard`, `playDrawnCard`, `passDrawnCard`

## Project Structure

```
uno-backend/
├── package.json          # Project dependencies and scripts
├── server.js             # Main server file with HTTP API and WebSocket handlers
├── game-logic/
│   └── GameEngine.js     # Complete UNO game logic engine with limbo state support
├── tests/                # Comprehensive test suite
│   ├── test-limbo-state.js       # Limbo state feature tests
│   ├── test-e2e-limbo.js         # End-to-end limbo state tests
│   ├── test-focused-limbo.js     # Focused integration tests
│   └── FINAL-LIMBO-TEST.js       # Complete implementation validation
└── README.md            # This documentation file
```

## API Documentation

### HTTP Endpoints

#### GET /api/status
Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "activeRooms": 2
}
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe", 
  "password": "password123",
  "avatar": "public/assets/images/avatar/a1.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Authenticate a user and return profile data.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "johndoe",
    "name": "John Doe", 
    "avatar": "public/assets/images/avatar/a1.jpg"
  }
}
```

### Room Management Endpoints

#### POST /api/rooms/create
Creates a new game room.

**Request Body:**
```json
{
  "playerId": "player1"
}
```

**Response:**
```json
{
  "roomId": "ABC123"
}
```

#### POST /api/rooms/:roomId/join
Joins an existing game room.

**Request Body:**
```json
{
  "playerId": "player2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Player joined successfully",
  "gameStarted": false,
  "canStart": true
}
```

#### GET /api/rooms/:roomId
Gets current room information and game state.

**Response (Waiting for players):**
```json
{
  "roomId": "ABC123",
  "status": "waiting",
  "host": "player1",
  "players": [
    {
      "id": "player1"
    },
    {
      "id": "player2" 
    }
  ],
  "playerCount": 2,
  "maxPlayers": 10,
  "canStart": true
}
```

**Response (Game in progress):**
```json
{
  "roomId": "ABC123",
  "status": "playing",
  "host": "player1",
  "players": [
    {
      "id": "player1",
      "name": "John Doe",
      "avatar": "public/assets/images/avatar/a1.jpg",
      "handSize": 6,
      "isActive": true
    },
    {
      "id": "player2",
      "name": "Jane Smith", 
      "avatar": "public/assets/images/avatar/a2.jpg",
      "handSize": 7,
      "isActive": true
    }
  ],
  "currentPlayerIndex": 0,
  "currentPlayer": "player1",
  "directionOfPlay": 1,
  "currentColor": "red",
  "topCard": {
    "color": "red",
    "value": "5",
    "type": "number"
  },
  "drawPileSize": 85,
  "isGameOver": false,
  "winner": null,
  "playableDrawnCard": null
}
```

**New Field: `playableDrawnCard`**
- `null`: Normal game state
- `Card Object`: Player is in "limbo state" and can choose to play or pass the drawn card

### WebSocket Events

Connect to the WebSocket server at `ws://localhost:3001` using Socket.io client.

#### Client → Server Events

##### `joinRoom`
Join a specific room for real-time updates.

**Payload:**
```json
{
  "roomId": "room_abc123",
  "playerId": "player_def456"
}
```

##### `startGame`
Start the game manually (host only). This event initializes the game, deals cards to all players, and begins gameplay.

**Payload:**
```json
{
  "roomId": "room_abc123"
}
```

**Requirements:**
- Only the room host can start the game
- Room must be in "waiting" status
- At least 2 players must have joined the room
```

##### `playCard`
Play a card from your hand.

**Payload:**
```json
{
  "roomId": "room_abc123",
  "playerId": "player_def456",
  "card": {
    "color": "red",
    "value": "5",
    "type": "number"
  },
  "chosenColor": "blue"  // Required only for wild cards
}
```

##### `drawCard`
Draw a card from the deck. If the drawn card is playable, the player enters "limbo state" and can choose to play or pass it.

**Payload:**
```json
{
  "roomId": "room_abc123",
  "playerId": "player_def456"
}
```

##### `playDrawnCard` 🆕
Play a card that was just drawn (from limbo state). Only available when player has a `playableDrawnCard`.

**Payload:**
```json
{
  "roomId": "room_abc123", 
  "playerId": "player_def456",
  "chosenColor": "blue"  // Required only for wild cards
}
```

**Requirements:**
- Player must be in limbo state (`playableDrawnCard` is not null)
- Must be the current player's turn
- For wild cards, `chosenColor` must be provided

##### `passDrawnCard` 🆕
Keep the drawn card in hand and pass the turn (from limbo state). Only available when player has a `playableDrawnCard`.

**Payload:**
```json
{
  "roomId": "room_abc123",
  "playerId": "player_def456"
}
```

**Requirements:**
- Player must be in limbo state (`playableDrawnCard` is not null)
- Must be the current player's turn

#### Server → Client Events

##### `gameUpdate`
**Primary event for frontend synchronization.** Sent whenever the game state changes (game start, card played, card drawn, turn changes, limbo state changes). This is the main event your frontend should listen to for real-time game updates.

**Payload:**
```json
{
  "roomId": "room_abc123",
  "status": "playing",
  "host": "player_def456",
  "players": [
    {
      "id": "player_def456",
      "name": "John Doe",
      "avatar": "public/assets/images/avatar/a1.jpg",
      "handSize": 7,
      "isActive": true
    },
    {
      "id": "player_ghi789",
      "name": "Jane Smith", 
      "avatar": "public/assets/images/avatar/a2.jpg",
      "handSize": 6,
      "isActive": true
    }
  ],
  "currentPlayerIndex": 0,
  "currentPlayer": "player_def456",
  "directionOfPlay": 1,
  "currentColor": "red",
  "topCard": {
    "color": "red",
    "value": "5", 
    "type": "number"
  },
  "drawPileSize": 85,
  "isGameOver": false,
  "winner": null,
  "playableDrawnCard": {
    "color": "red",
    "value": "7",
    "type": "number"
  }
}
```

**New Field: `playableDrawnCard`** 🆕
- When `null`: Normal game state
- When `Card Object`: Current player is in "limbo state" and can use `playDrawnCard` or `passDrawnCard` events

##### `gameStarted`
Sent when the game officially begins after host triggers startGame.

**Payload:**
```json
{
  "message": "Game has started! Cards have been dealt.",
  "currentPlayer": "player_def456",
  "topCard": {
    "color": "red",
    "value": "7",
    "type": "number"
  }
}
```

##### `gameOver`
Sent when a player wins the game or game ends due to disconnections.

**Payload:**
```json
{
  "winnerId": "player_def456",
  "message": "player_def456 wins the game!",
  "reason": "normal"
}
```
```

##### `error`
Sent when an invalid action is attempted.

**Payload:**
```json
{
  "message": "Not your turn"
}
```

##### `playerConnected`
Sent when a player joins the WebSocket room.

**Payload:**
```json
{
  "playerId": "player_ghi789"
}
```

##### `playerDisconnected`
Sent when a player disconnects from the game.

**Payload:**
```json
{
  "playerId": "player_ghi789",
  "message": "player_ghi789 has disconnected and will be skipped"
}
```

## 🆕 Limbo State Feature ("Play After Draw")

### Overview
The limbo state implements the official UNO rule where players can immediately play a card they just drew if it's playable. This adds strategic depth and follows tournament UNO rules.

### How It Works

1. **Normal Draw**: Player draws a card using `drawCard` event
2. **Limbo State**: If the drawn card is playable, `gameUpdate` includes `playableDrawnCard`
3. **Player Choice**: 
   - Use `playDrawnCard` to immediately play the card
   - Use `passDrawnCard` to keep the card and end turn
4. **State Reset**: After either choice, `playableDrawnCard` becomes `null`

### Frontend Implementation

```javascript
socket.on('gameUpdate', (gameState) => {
  if (gameState.playableDrawnCard && gameState.currentPlayer === currentUserId) {
    // Show limbo state UI
    showLimboButtons(); // Show "Play Drawn Card" and "Keep Card & Pass" buttons
    hideDrawButton();   // Hide normal draw button
    showMessage(`You drew a playable ${gameState.playableDrawnCard.color} ${gameState.playableDrawnCard.value}!`);
  } else {
    // Normal state UI
    hideLimboButtons(); // Hide limbo buttons
    showDrawButton();   // Show normal draw button
  }
});

// Handle playing drawn card
function playDrawnCard() {
  const chosenColor = gameState.playableDrawnCard.type === 'wild' ? 
    promptForColor() : null;
  
  socket.emit('playDrawnCard', {
    roomId: currentRoomId,
    playerId: currentUserId,
    chosenColor: chosenColor
  });
}

// Handle passing drawn card
function passDrawnCard() {
  socket.emit('passDrawnCard', {
    roomId: currentRoomId,
    playerId: currentUserId
  });
}
```

### Card Playability Rules
A drawn card is playable if:
- Color matches current color
- Number/value matches top card
- It's an action card that matches top card type
- It's a wild card (always playable)

## Game Setup Flow

This section explains the complete sequence for setting up and starting a UNO game using both HTTP API and WebSocket events.

### Frontend Implementation Steps

1. **Create Room (HTTP API)**
   ```javascript
   const response = await fetch('http://localhost:3001/api/rooms/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ playerId: 'player1' })
   });
   const { roomId } = await response.json();
   // roomId: "ABC123"
   ```

2. **Other Players Join Room (HTTP API)**
   ```javascript
   const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/join`, {
     method: 'POST', 
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ playerId: 'player2' })
   });
   const result = await response.json();
   // result: { success: true, message: "Player joined successfully", canStart: true }
   ```

3. **All Players Connect to WebSocket**
   ```javascript
   const socket = io('http://localhost:3001');
   
   // Each player joins the WebSocket room
   socket.emit('joinRoom', { 
     roomId: 'ABC123', 
     playerId: 'player1' // or player2, etc.
   });
   ```

4. **Listen for Game Updates (All Players)**
   ```javascript
   // Primary event - listen for all game state changes
   socket.on('gameUpdate', (gameState) => {
     console.log('Game state updated:', gameState);
     // Update your UI with current game state
     updateGameUI(gameState);
   });
   
   // Game start notification
   socket.on('gameStarted', (data) => {
     console.log('Game started!', data.message);
     console.log('First player:', data.currentPlayer);
   });
   ```

5. **Host Starts the Game (Host Only)**
   ```javascript
   // Only the room host can start the game
   socket.emit('startGame', { roomId: 'ABC123' });
   ```

6. **Game Begins**
   - All players receive `gameStarted` event
   - All players receive `gameUpdate` event with initial game state
   - Cards are dealt (7 per player)
   - First player can begin making moves

### Complete Integration Example

```javascript
// Frontend game setup example with limbo state support
class UnoGame {
  constructor() {
    this.socket = io('http://localhost:3001');
    this.currentUserId = null;
    this.currentRoomId = null;
    this.setupSocketListeners();
  }
  
  async createRoom(playerId) {
    const response = await fetch('http://localhost:3001/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    const { roomId } = await response.json();
    
    this.currentRoomId = roomId;
    this.currentUserId = playerId;
    
    // Join WebSocket room
    this.socket.emit('joinRoom', { roomId, playerId });
    return roomId;
  }
  
  async joinRoom(roomId, playerId) {
    const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    
    this.currentRoomId = roomId;
    this.currentUserId = playerId;
    
    // Join WebSocket room
    this.socket.emit('joinRoom', { roomId, playerId });
  }
  
  startGame(roomId) {
    this.socket.emit('startGame', { roomId });
  }
  
  // New: Play drawn card from limbo state
  playDrawnCard(chosenColor = null) {
    this.socket.emit('playDrawnCard', {
      roomId: this.currentRoomId,
      playerId: this.currentUserId,
      chosenColor: chosenColor
    });
  }
  
  // New: Pass drawn card from limbo state
  passDrawnCard() {
    this.socket.emit('passDrawnCard', {
      roomId: this.currentRoomId,
      playerId: this.currentUserId
    });
  }
  
  setupSocketListeners() {
    this.socket.on('gameUpdate', (gameState) => {
      // Handle limbo state
      if (gameState.playableDrawnCard && gameState.currentPlayer === this.currentUserId) {
        this.showLimboState(gameState.playableDrawnCard);
      } else {
        this.hideLimboState();
      }
      
      this.updateUI(gameState);
    });
    
    this.socket.on('gameStarted', (data) => {
      console.log('Game started:', data.message);
    });
    
    this.socket.on('error', (error) => {
      console.error('Game error:', error.message);
    });
  }
  
  showLimboState(drawnCard) {
    // Show "Play Drawn Card" and "Keep Card & Pass" buttons
    document.getElementById('play-drawn-card-btn').style.display = 'block';
    document.getElementById('pass-drawn-card-btn').style.display = 'block';
    document.getElementById('draw-card-btn').style.display = 'none';
    
    const message = `You drew a playable ${drawnCard.color} ${drawnCard.value}! Choose to play it or keep it.`;
    document.getElementById('game-message').textContent = message;
  }
  
  hideLimboState() {
    // Hide limbo buttons and show normal draw button
    document.getElementById('play-drawn-card-btn').style.display = 'none';
    document.getElementById('pass-drawn-card-btn').style.display = 'none';
    document.getElementById('draw-card-btn').style.display = 'block';
  }
}
```
```

## Game Rules

This implementation follows official UNO rules:

### Deck Composition (108 cards)
- **Number Cards**: 0-9 in four colors (red, yellow, green, blue)
  - One 0 card per color (4 total)
  - Two 1-9 cards per color (72 total)
- **Action Cards**: Skip, Reverse, Draw Two in four colors (24 total)
- **Wild Cards**: Wild and Wild Draw Four (8 total)

### Game Flow
1. Each player starts with 7 cards
2. First card is placed on discard pile (reshuffled if wild)
3. Players take turns matching color, number, or symbol
4. Wild cards can be played anytime
5. **New**: When drawing a card, if it's playable, player can immediately play it or keep it (limbo state)
6. First player to empty their hand wins

### Card Effects
- **Skip**: Next player loses their turn
- **Reverse**: Direction of play reverses
- **Draw Two**: Next player draws 2 cards and loses turn
- **Wild**: Player chooses new color
- **Wild Draw Four**: Next player draws 4 cards, loses turn, player chooses color

### Special Rules
- **Play After Draw**: If a drawn card is playable, player enters "limbo state" and can choose to play it immediately or keep it
- In 2-player games, Reverse acts like Skip
- When draw pile is empty, discard pile is reshuffled (except top card)
- Wild cards reset to no color when reshuffled
- Wild Draw 4 can only be played when player has no cards matching current color

## Development

### Running in Development Mode
```bash
npm run dev  # If you have nodemon installed
# OR
node server.js
```

### Testing the API
```bash
# Test server status
curl http://localhost:3001/api/status

# Create a room
curl -X POST http://localhost:3001/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"playerId": "TestPlayer"}'

# Join a room  
curl -X POST http://localhost:3001/api/rooms/ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerId": "Player2"}'
```

### WebSocket Testing
You can test WebSocket functionality using the Socket.io client:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

// Join a room (after joining via HTTP API)
socket.emit('joinRoom', { roomId: 'ABC123', playerId: 'player1' });

// Listen for game updates (main event)
socket.on('gameUpdate', (gameState) => {
  console.log('Game state updated:', gameState);
  
  // Check for limbo state
  if (gameState.playableDrawnCard) {
    console.log('Player in limbo state with:', gameState.playableDrawnCard);
  }
});

// Listen for game start
socket.on('gameStarted', (data) => {
  console.log('Game started:', data.message);
});

// Start a game (host only)
socket.emit('startGame', { roomId: 'ABC123' });

// Draw a card
socket.emit('drawCard', { roomId: 'ABC123', playerId: 'player1' });

// Play drawn card (if in limbo state)
socket.emit('playDrawnCard', { 
  roomId: 'ABC123', 
  playerId: 'player1',
  chosenColor: 'red'  // Only for wild cards
});

// Pass drawn card (if in limbo state)
socket.emit('passDrawnCard', { roomId: 'ABC123', playerId: 'player1' });
```

## Architecture

### Game Engine (`game-logic/GameEngine.js`)
- **Pure Functions**: All game logic functions are pure and stateless
- **Enhanced API**: 5 core functions - `createGameState`, `playCard`, `drawCard`, `playDrawnCard`, `passDrawnCard`
- **Limbo State Support**: Implements official "play after draw" rule with `playableDrawnCard` state
- **Immutable State**: Game state is never mutated directly
- **Complete Validation**: All moves are validated before applying
- **Error Handling**: Returns error objects for invalid moves

### Server (`server.js`)
- **Express HTTP API**: RESTful endpoints for room management
- **Socket.io WebSockets**: Real-time gameplay communication
- **Room Management**: In-memory storage of rooms and game states
- **Disconnect Handling**: Graceful handling of player disconnections

### Key Design Decisions
- **Separation of Concerns**: Game logic is completely separate from server logic
- **Real-time First**: Primary gameplay uses WebSockets for immediate feedback
- **RESTful Fallback**: HTTP endpoints available for room management
- **Memory Storage**: Suitable for demonstration; can be extended with database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

**Port 3001 already in use**
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill the process (Windows)
taskkill /PID <process_id> /F
```

**WebSocket connection failed**
- Ensure server is running on correct port
- Check firewall settings
- Verify Socket.io client version compatibility

**Game state not updating**
- Check that players are properly connected to WebSocket
- Verify room ID and player ID are correct
- Ensure player is joining room via WebSocket after HTTP room creation

For additional support, please create an issue in the repository.
