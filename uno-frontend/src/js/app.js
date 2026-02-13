// UNO Web Game Frontend Logic

document.addEventListener('DOMContentLoaded', function () {
    (function autoOpenJoinFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (!room) return;

    const roomInput = document.getElementById("room-code-input");
    if (roomInput) roomInput.value = room.toUpperCase();
  })();
    // --- UNO Themed Popup Utility ---
    function showUnoPopup(title, message, options = {}) {
        // Remove any existing popup
        const existing = document.getElementById('uno-popup-overlay');
        if (existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.className = 'uno-popup-overlay';
        overlay.id = 'uno-popup-overlay';
        overlay.innerHTML = `
          <div class="uno-popup">
            <div class="uno-popup-title">${title}</div>
            <div class="uno-popup-message">${message}</div>
            <button class="uno-popup-btn" id="uno-popup-ok-btn">OK</button>
          </div>
        `;
        document.body.appendChild(overlay);
        const okBtn = document.getElementById('uno-popup-ok-btn');
        okBtn.focus();
        okBtn.onclick = () => overlay.remove();
        if (options.autoClose) {
            setTimeout(() => overlay.remove(), options.autoClose);
        }
    }

    // --- UNO Color Picker Popup ---
    function showUnoColorPicker(title = 'Choose a Color') {
        return new Promise((resolve, reject) => {
            // Remove any existing popup
            const existing = document.getElementById('uno-color-picker-overlay');
            if (existing) existing.remove();
            
            const overlay = document.createElement('div');
            overlay.className = 'uno-popup-overlay';
            overlay.id = 'uno-color-picker-overlay';
            overlay.innerHTML = `
                <div class="uno-color-picker">
                    <div class="color-picker-title">${title}</div>
                    <div class="color-options">
                        <div class="uno-color-option red" data-color="red">
                            <div class="color-icon">🔴</div>
                            <div class="color-name">Red</div>
                        </div>
                        <div class="uno-color-option yellow" data-color="yellow">
                            <div class="color-icon">🟡</div>
                            <div class="color-name">Yellow</div>
                        </div>
                        <div class="uno-color-option green" data-color="green">
                            <div class="color-icon">🟢</div>
                            <div class="color-name">Green</div>
                        </div>
                        <div class="uno-color-option blue" data-color="blue">
                            <div class="color-icon">🔵</div>
                            <div class="color-name">Blue</div>
                        </div>
                    </div>
                    <button class="cancel-btn" id="color-picker-cancel">Cancel</button>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Add event listeners for color options
            const colorOptions = overlay.querySelectorAll('.uno-color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const selectedColor = option.getAttribute('data-color');
                    overlay.remove();
                    resolve(selectedColor);
                });
            });
            
            // Add cancel button listener
            const cancelBtn = overlay.querySelector('#color-picker-cancel');
            cancelBtn.addEventListener('click', () => {
                overlay.remove();
                reject(new Error('Color selection cancelled'));
            });
            
            // Close on overlay click (outside popup)
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    reject(new Error('Color selection cancelled'));
                }
            });
        });
    }
    // Screen elements
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const modeScreen = document.getElementById('mode-screen');
    const multiplayerOptions = document.getElementById('multiplayer-options');
    const createRoomFormSection = document.getElementById('create-room-form');
    const joinRoomFormSection = document.getElementById('join-room-form');
    // Login
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    // Register
    const showRegister = document.getElementById('show-register');
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    const backToLogin = document.getElementById('back-to-login');
    // Navigation
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const backToMode = document.getElementById('back-to-mode');
    const backToMultiplayer = document.getElementById('back-to-multiplayer');
    const backToMultiplayer2 = document.getElementById('back-to-multiplayer2');
    const logoutBtn = document.getElementById('logout-btn');
    // Room forms
    const roomCreateForm = document.getElementById('room-create-form');
    const roomCodeSection = document.getElementById('room-code-section');
    const roomCodeBox = document.getElementById('room-code');
    const roomJoinForm = document.getElementById('room-join-form');
    // How to Play
    const howToPlayBtn = document.getElementById('howtoplay-btn');
    const howToPlayScreen = document.getElementById('howtoplay-screen');
    const backToHome = document.getElementById('back-to-home');
    const okToHome = document.getElementById('ok-to-home');
    // Profile
    const profileBtn = document.getElementById('profile-btn');
    const profileScreen = document.getElementById('profile-screen');
    const backToHomeProfile = document.getElementById('back-to-home-profile');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileAvatarLarge = document.getElementById('profile-avatar-large');
    const profileName = document.getElementById('profile-name');
    const profileUsername = document.getElementById('profile-username');
    const profilePlayed = document.getElementById('profile-played');
    const profileWon = document.getElementById('profile-won');
    const profileLost = document.getElementById('profile-lost');
    const changeAvatarForm = document.getElementById('change-avatar-form');
    const profilePlayerName = document.getElementById('profile-player-name');
    // LOBBY LOGIC
    const lobbyScreen = document.getElementById('lobby-screen');
    const lobbyRoomCode = document.getElementById('lobby-room-code');
    const lobbyAdminAvatar = document.getElementById('lobby-admin-avatar');
    const lobbyAdminName = document.getElementById('lobby-admin-name');
    const lobbyEntryAmount = document.getElementById('lobby-entry-amount');
    const lobbyStartBtn = document.getElementById('lobby-start-btn');
    const copyRoomCodeBtn = document.getElementById('copy-room-code');
    // Remove share room url button if it exists
    const shareRoomUrlBtn = document.getElementById('share-room-url');
    if (shareRoomUrlBtn) shareRoomUrlBtn.remove();

    const lobbySlots = [
        document.getElementById('lobby-slot-2'),
        document.getElementById('lobby-slot-3'),
        document.getElementById('lobby-slot-4')
    ];
    // GAME SCREEN ELEMENTS
    const gameScreen = document.getElementById('game-screen');
    const gameExitBtn = document.getElementById('game-exit-btn');
    const gamePlayerAvatar = document.getElementById('game-player-avatar');
    const gamePlayerName = document.getElementById('game-player-name');
    const gameInfo = document.getElementById('game-info');
    const topCardImg = document.getElementById('top-card-img');
    const currentColorIndicator = document.getElementById('current-color-indicator');
    const playerHandDiv = document.getElementById('player-hand');
    const drawCardBtn = document.getElementById('draw-card-btn');
    const drawnCardOptions = document.getElementById('drawn-card-options');
    const drawnCardDisplay = document.getElementById('drawn-card-display');
    const drawnCardVisual = document.getElementById('drawn-card-visual');
    const playDrawnCardBtn = document.getElementById('play-drawn-card-btn');
    const passDrawnCardBtn = document.getElementById('pass-drawn-card-btn');
    const gameMessage = document.getElementById('game-message');
    
    // UNO Call elements
    const unoCallSection = document.getElementById('uno-call-section');
    const callUnoBtn = document.getElementById('call-uno-btn');
    const unoSelfSection = document.getElementById('uno-self-section');
    const callUnoSelfBtn = document.getElementById('call-uno-self-btn');

    // ============================================================================
    // AUTHENTICATION & USER MANAGEMENT
    // ============================================================================
    
    // Backend API base URL
    const API_BASE_URL = 'http://localhost:3001';
    
    // User state - backend is the source of truth
    let currentUser = null;
    let latestGameState = null; // Single source of truth from backend
    let isAdmin = false;

    // Login form submit - integrated with backend authentication
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Clear previous error
        loginError.textContent = '';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Login successful
                currentUser = data.user;
                
                updateProfileButton();
                showScreen(modeScreen);
                loginForm.reset();
            } else {
                // Login failed
                loginError.textContent = data.error || 'Login failed';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Network error. Please try again.';
        }
    });

    // Show register form
    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        showScreen(registerScreen);
        registerForm.reset();
        registerError.textContent = '';
    });

    // Register 'Sign in' link to go back to login
    const signInLink = document.getElementById('sign-in-link');
    if (signInLink) {
        signInLink.addEventListener('click', function (e) {
            e.preventDefault();
            showScreen(loginScreen);
            registerForm.reset();
            registerError.textContent = '';
        });
    }

    // Register form submit - integrated with backend authentication
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const avatar = registerForm.querySelector('input[name="reg-avatar"]:checked');
        
        // Clear previous error
        registerError.textContent = '';
        
        // Client-side validation
        if (!name || !username || !password || !confirm || !avatar) {
            registerError.textContent = 'All fields are required.';
            return;
        }
        if (password !== confirm) {
            registerError.textContent = 'Passwords do not match.';
            return;
        }
        
        try {
            // Register user with backend
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    full_name: name, 
                    username, 
                    password, 
                    avatar_url: avatar.value 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registration successful - automatically log in the user
                try {
                    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const loginData = await loginResponse.json();
                    
                    if (loginResponse.ok) {
                        // Auto-login successful
                        currentUser = loginData.user;
                        
                        updateProfileButton();
                        showScreen(modeScreen);
                        registerForm.reset();
                    } else {
                        // Registration succeeded but auto-login failed
                        registerError.textContent = 'Registration successful! Please log in.';
                        setTimeout(() => {
                            showScreen(loginScreen);
                            registerForm.reset();
                            registerError.textContent = '';
                        }, 2000);
                    }
                } catch (loginError) {
                    // Registration succeeded but auto-login had network error
                    registerError.textContent = 'Registration successful! Please log in.';
                    setTimeout(() => {
                        showScreen(loginScreen);
                        registerForm.reset();
                        registerError.textContent = '';
                    }, 2000);
                }
            } else {
                // Registration failed
                registerError.textContent = data.error || 'Registration failed';
            }
        } catch (error) {
            console.error('Registration error:', error);
            registerError.textContent = 'Network error. Please try again.';
        }
    });

    // Back to login from register
    if (backToLogin) {
        backToLogin.addEventListener('click', function () {
            showScreen(loginScreen);
        });
    }

    // Update profile button
    function updateProfileButton() {
        if (currentUser) {
            profilePlayerName.textContent = currentUser.name;
            
            // Set the avatar source
            if (currentUser.avatar) {
                profileAvatar.src = currentUser.avatar;
                
                // Simple error handler that only triggers on actual load failures
                profileAvatar.onerror = function() {
                    console.warn('Avatar image failed to load:', currentUser.avatar);
                    // Only set fallback if we haven't already set it
                    if (!this.src.includes('ava-1.svg')) {
                        this.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
                    }
                };
            } else {
                // No avatar set, use default
                profileAvatar.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
            }
        }
    }

    // Profile screen update
    function updateProfileScreen() {
        if (currentUser) {
            profileName.textContent = currentUser.name;
            profileUsername.textContent = currentUser.username;
            profilePlayed.textContent = currentUser.games_played || 0;
            profileWon.textContent = currentUser.games_won || 0;
            profileLost.textContent = (currentUser.games_played || 0) - (currentUser.games_won || 0);
            
            // Set the large avatar source
            if (currentUser.avatar) {
                profileAvatarLarge.src = currentUser.avatar;
                
                // Simple error handler that only triggers on actual load failures
                profileAvatarLarge.onerror = function() {
                    console.warn('Large avatar image failed to load:', currentUser.avatar);
                    // Only set fallback if we haven't already set it
                    if (!this.src.includes('ava-1.svg')) {
                        this.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
                    }
                };
            } else {
                // No avatar set, use default
                profileAvatarLarge.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
            }
            
            // Set avatar radio
            const radios = changeAvatarForm.querySelectorAll('input[name="profile-avatar"]');
            radios.forEach(r => { r.checked = (r.value === currentUser.avatar); });
        }
    }

    // Profile navigation
    profileBtn.addEventListener('click', function () {
        updateProfileScreen();
        showScreen(profileScreen);
    });
    backToHomeProfile.addEventListener('click', function () {
        showScreen(modeScreen);
    });

    // Change avatar form
    changeAvatarForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const avatar = changeAvatarForm.querySelector('input[name="profile-avatar"]:checked');
        if (avatar && currentUser) {
            try {
                // Update avatar on backend
                const response = await fetch(`${API_BASE_URL}/api/auth/update-avatar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: currentUser.username, 
                        avatar: avatar.value 
                    })
                });
                
                if (response.ok) {
                    // Update local user data
                    currentUser.avatar = avatar.value;
                    updateProfileButton();
                    updateProfileScreen();
                    
                    // Update game player info display if in game
                    updateGamePlayerInfo();
                    
                    // If we're in a room, emit an event to update the lobby
                    if (socket && backendRoomId) {
                        socket.emit('updatePlayerAvatar', {
                            roomId: backendRoomId,
                            playerId: currentUser.username,
                            avatar: avatar.value
                        });
                    }
                    
                    showUnoPopup('Avatar Updated', 'Your avatar has been updated successfully!', { autoClose: 2000 });
                } else {
                    const data = await response.json();
                    showUnoPopup('Update Failed', data.error || 'Failed to update avatar. Please try again.');
                }
            } catch (error) {
                console.error('Avatar update error:', error);
                showUnoPopup('Network Error', 'Unable to update avatar. Please check your connection and try again.');
            }
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        profilePlayerName.textContent = '';
        // Show login screen and reset UI
        showScreen(loginScreen);
        loginForm.reset();
    });

    // ============================================================================
    // GAME NAVIGATION & UI
    // ============================================================================

    // Game mode selection
    multiplayerBtn.addEventListener('click', function () {
        showScreen(multiplayerOptions);
    });

    // Multiplayer options
    createRoomBtn.addEventListener('click', function () {
        showScreen(createRoomFormSection);
        roomCodeSection.classList.add('hidden-screen');
    });
    joinRoomBtn.addEventListener('click', function () {
        showScreen(joinRoomFormSection);
    });

    // Back navigation
    backToMode.addEventListener('click', function () {
        showScreen(modeScreen);
    });
    backToMultiplayer.addEventListener('click', function () {
        showScreen(multiplayerOptions);
    });
    backToMultiplayer2.addEventListener('click', function () {
        showScreen(multiplayerOptions);
    });

    // How to Play navigation
    howToPlayBtn.addEventListener('click', function () {
        showScreen(howToPlayScreen);
    });
    backToHome.addEventListener('click', function () {
        showScreen(modeScreen);
    });
    okToHome.addEventListener('click', function () {
        showScreen(modeScreen);
    });

    // ============================================================================
    // SOCKET.IO INTEGRATION & GAME LOGIC
    // ============================================================================

    let socket = null;
    let backendRoomId = null;
    let backendPlayerId = null;

    // Helper to show/hide screens
    function showScreen(screen) {
        [loginScreen, registerScreen, modeScreen, multiplayerOptions, createRoomFormSection, joinRoomFormSection, howToPlayScreen, profileScreen, lobbyScreen, gameScreen].forEach(sec => {
            sec.classList.add('hidden-screen');
            sec.classList.remove('active-screen');
        });
        screen.classList.remove('hidden-screen');
        screen.classList.add('active-screen');
    }

    // Create room form (integrated with backend)
    roomCreateForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentUser) return;
        
        // Create room via backend API
        try {
            const maxPlayers = parseInt(document.getElementById('room-size').value) || 4;
            const res = await fetch(`${API_BASE_URL}/api/rooms/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: currentUser.username, maxPlayers })
            });
            const data = await res.json();
            if (!data.roomId) throw new Error(data.error || 'Failed to create room');
            
            backendRoomId = data.roomId;
            backendPlayerId = currentUser.username;
            isAdmin = true;
            
            // Join WebSocket room
            ensureSocket();
            socket.emit('joinRoom', { roomId: backendRoomId, playerId: backendPlayerId });
            
            // Show lobby screen - UI will be updated via gameUpdate event
            showScreen(lobbyScreen);
        } catch (err) {
            showUnoPopup('Room Creation Failed', err.message || 'Unable to create room. Please try again.');
        }
    });

    // Join room form (integrated with backend)
    roomJoinForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentUser) return;
        
        const code = document.getElementById('join-room-code').value.trim().toUpperCase();
        if (!code) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/rooms/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: currentUser.username })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to join room');
            
            backendRoomId = code;
            backendPlayerId = currentUser.username;
            isAdmin = false; // Will be updated via gameUpdate event
            
            // Join WebSocket room
            ensureSocket();
            socket.emit('joinRoom', { roomId: backendRoomId, playerId: backendPlayerId });
            
            // Show lobby screen - UI will be updated via gameUpdate event
            showScreen(lobbyScreen);
        } catch (err) {
            showUnoPopup('Join Room Failed', err.message || 'Unable to join room. Please check the room code and try again.');
        }
    });

    // Helper to ensure socket connection
    function ensureSocket() {
        if (!socket) {
            socket = io(`${API_BASE_URL}`);
            setupSocketListeners();
        }
    }

    // Setup socket listeners for lobby/game state
    function setupSocketListeners() {
        if (!socket) return;
        
        socket.on('connect', () => {
            // Optionally re-join room if needed
        });
        
        // CENTRAL STATE MANAGEMENT: All UI updates flow through this event
        socket.on('gameUpdate', (roomState) => {
            if (roomState && roomState.roomId === backendRoomId) {
                // Set backend state as the single source of truth
                latestGameState = roomState;
                
                // Update admin status based on backend data
                isAdmin = (roomState.host === currentUser.username);
                
                // Route to appropriate UI update based on game status
                if (roomState.status === 'waiting') {
                    updateLobbyUI(roomState);
                } else if (roomState.status === 'playing') {
                    showScreen(gameScreen);
                    renderGameScreen(roomState);
                    
                    // Handle "limbo state" for play after draw feature
                    if (roomState.playableDrawnCard && roomState.currentPlayer === currentUser.username) {
                        // We are in the limbo state!
                        
                        // 1. Show the drawn card visually
                        drawnCardVisual.innerHTML = ''; // Clear previous
                        const drawnCardImg = document.createElement('img');
                        drawnCardImg.src = getCardImage(roomState.playableDrawnCard.card);
                        drawnCardImg.alt = `${roomState.playableDrawnCard.card.color} ${roomState.playableDrawnCard.card.value}`;
                        // Remove inline styles - let CSS handle responsive sizing
                        drawnCardVisual.appendChild(drawnCardImg);
                        
                        // 2. Disable all cards in hand to prevent the "Ghost Card" bug
                        playerHandDiv.querySelectorAll('.card-btn').forEach(btn => {
                            btn.disabled = true;
                            btn.querySelector('img').style.opacity = 0.5;
                        });
                        
                        // 3. Show "Play/Pass" buttons and hide the normal "Draw" button
                        drawnCardOptions.classList.remove('hidden-screen');
                        drawnCardOptions.style.display = 'flex';
                        drawnCardOptions.style.flexDirection = 'column';
                        drawnCardOptions.style.alignItems = 'center';
                        drawnCardOptions.style.gap = '1rem';
                        drawCardBtn.classList.add('hidden-screen');
                        gameMessage.textContent = 'You drew a playable card! Choose to play it or keep it in your hand.';
                        
                    } else {
                        // Not in the limbo state.
                        drawnCardOptions.classList.add('hidden-screen');
                        drawnCardOptions.style.display = 'none';
                        drawnCardVisual.innerHTML = ''; // Clear drawn card display
                        drawCardBtn.classList.remove('hidden-screen');
                        
                        // Re-enable hand cards
                        playerHandDiv.querySelectorAll('.card-btn').forEach(btn => {
                            btn.disabled = false;
                            btn.querySelector('img').style.opacity = 1;
                        });
                    }
                    
                    // Handle UNO call button visibility and messaging
                    if (roomState.unoPlayerId && roomState.unoPlayerId !== currentUser.username) {
                        // Someone else is vulnerable to UNO call - show call button
                        unoCallSection.classList.remove('hidden-screen');
                        unoCallSection.style.display = 'block';
                        unoSelfSection.classList.add('hidden-screen');
                        unoSelfSection.style.display = 'none';
                        
                        // Update button text to show who is vulnerable
                        const vulnerablePlayer = roomState.players.find(p => p.id === roomState.unoPlayerId);
                        const playerName = vulnerablePlayer ? vulnerablePlayer.name || vulnerablePlayer.id : roomState.unoPlayerId;
                        callUnoBtn.innerHTML = `<span class="uno-call-text">⚡ Call UNO on ${playerName}! ⚡</span>`;
                    } else if (roomState.unoPlayerId === currentUser.username) {
                        // We are vulnerable - show self-UNO button
                        unoCallSection.classList.add('hidden-screen');
                        unoCallSection.style.display = 'none';
                        unoSelfSection.classList.remove('hidden-screen');
                        unoSelfSection.style.display = 'block';
                    } else {
                        // No one is vulnerable - hide both buttons
                        unoCallSection.classList.add('hidden-screen');
                        unoCallSection.style.display = 'none';
                        unoSelfSection.classList.add('hidden-screen');
                        unoSelfSection.style.display = 'none';
                        // Reset button text
                        callUnoBtn.innerHTML = `<span class="uno-call-text">⚡ Call UNO! ⚡</span>`;
                    }
                }
            }
        });
        
        socket.on('playerConnected', ({ playerId }) => {
            showUnoPopup('Player Joined', `Player <b>${playerId}</b> has joined the game!`, { autoClose: 2000 });
        });

        socket.on('playerDisconnected', ({ playerId, message }) => {
            // Show different styles based on whether it's a forfeit or disconnect
            let title = 'Player Left';
            let popupOptions = { autoClose: 3000 };
            
            if (message && message.includes('forfeited')) {
                title = '💥 Player Forfeited';
                popupOptions.autoClose = 4000;
            } else if (message && message.includes('disconnected')) {
                title = '📡 Player Disconnected';
            }
            
            showUnoPopup(title, message || `Player <b>${playerId}</b> has left the game.`, popupOptions);
        });

        socket.on('gameStarted', (data) => {
            showUnoPopup('Game Started!', data.message || 'Cards have been dealt. Good luck!');
            // Show game screen after game starts
            showScreen(gameScreen);
            
            // Update player info display when game starts
            updateGamePlayerInfo();
            
            gameMessage.textContent = '';
        });

        socket.on('gameOver', (data) => {
            // Show appropriate popup based on game end reason
            let title = 'Game Over';
            let message = data.message || 'Game over!';
            
            if (data.reason === 'Player forfeited' || data.reason === 'Other players disconnected') {
                title = '🎉 Victory!';
                if (data.winnerId === currentUser?.username) {
                    message = `Congratulations! You won by default!`;
                } else if (data.winnerId) {
                    message = `${data.winnerId} wins by default!`;
                } else {
                    message = 'Game ended due to player disconnections.';
                }
            }
            
            // Show custom game over popup with restart options
            showGameOverPopup(title, message, data);
            gameMessage.textContent = message;
        });

        socket.on('error', (err) => {
            const errorMessage = err.message || err || 'An error occurred.';
            const title = errorMessage.includes('Invalid move') ? 'Invalid Move' : 'Server Error';
            showUnoPopup(title, errorMessage, { error: true });
        });

        // Handle game restart event - ALL players get choice dialog
        socket.on('gameRestarted', (data) => {
            console.log('Game restarted event received:', data);
            
            // Close any existing popups
            const existingPopups = document.querySelectorAll('.uno-popup');
            existingPopups.forEach(popup => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            });
            
            // Show restart choice dialog
            showRestartChoiceDialog(data.message, data.newGameState);
        });

        // Function to show restart choice dialog
        function showRestartChoiceDialog(message, newGameState) {
            // Remove any existing restart dialogs
            const existingRestartDialogs = document.querySelectorAll('.restart-choice-dialog');
            existingRestartDialogs.forEach(dialog => {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            });
            
            const overlay = document.createElement('div');
            overlay.className = 'uno-popup-overlay restart-choice-dialog';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            const popup = document.createElement('div');
            popup.className = 'uno-popup';
            popup.style.cssText = `
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
                position: relative;
            `;
            
            popup.innerHTML = `
                <h2 style="margin: 0 0 20px 0; font-size: 24px;">🎮 Game Restarted!</h2>
                <p style="margin: 0 0 25px 0; font-size: 16px;">${message}</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="join-restart-btn" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
                    ">Join New Game</button>
                    <button class="decline-restart-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
                    ">Main Menu</button>
                </div>
            `;
            
            overlay.appendChild(popup);
            
            // Add event listeners
            const joinBtn = popup.querySelector('.join-restart-btn');
            const declineBtn = popup.querySelector('.decline-restart-btn');
            
            joinBtn.addEventListener('click', () => {
                // Remove the dialog immediately
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                
                // Emit unified restart response
                if (backendRoomId) {
                    socket.emit('respondToRestart', { roomId: backendRoomId, didAccept: true });
                }
                
                // Join the restarted game
                showScreen(lobbyScreen);
                
                if (newGameState) {
                    console.log('Updating lobby with new game state:', newGameState);
                    latestGameState = newGameState;
                    updateLobbyUI(newGameState);
                }
                
                showUnoPopup('✅ Joined!', 'Welcome back to the lobby!', { autoClose: 2000 });
            });
            
            declineBtn.addEventListener('click', () => {
                // Remove the dialog immediately
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                
                // Emit unified restart response
                if (backendRoomId) {
                    socket.emit('respondToRestart', { roomId: backendRoomId, didAccept: false });
                }
                
                // Go to main menu
                showScreen(modeScreen);
                latestGameState = null;
                backendRoomId = null;
                backendPlayerId = null;
                
                showUnoPopup('👋 Left Game', 'You have left the restarted game', { autoClose: 2000 });
            });
            
            // Prevent closing by clicking outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            // Add to page
            document.body.appendChild(overlay);
        }

        // Listen for UNO call results
        socket.on('unoCallResult', (data) => {
            const { caller, target, success, message } = data;
            if (success) {
                showUnoPopup('UNO Call Successful!', message, { autoClose: 4000 });
            } else {
                showUnoPopup('UNO Call Failed', message, { autoClose: 3000 });
            }
        });

        // Listen for self-UNO results
        socket.on('unoSelfResult', (data) => {
            const { player, success, message } = data;
            if (success) {
                showUnoPopup('UNO Declared!', message, { autoClose: 3000 });
            } else {
                showUnoPopup('UNO Declaration Failed', message, { autoClose: 3000 });
            }
        });

        // Function to show custom game over popup with restart options
        function showGameOverPopup(title, message, gameData) {
            // Create popup elements
            const popup = document.createElement('div');
            popup.className = 'uno-popup';
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
                color: white;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 1000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
            `;
            
            // Check if current user is the original host
            const isOriginalHost = gameData.originalHost === currentUser?.username;
            
            popup.innerHTML = `
                <h2 style="margin: 0 0 20px 0; font-size: 28px;">${title}</h2>
                <p style="margin: 0 0 30px 0; font-size: 18px;">${message}</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    ${isOriginalHost ? `
                        <button class="restart-btn" style="
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 25px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        ">🔄 Restart Game</button>
                    ` : ''}
                    <button class="new-game-btn" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
                    ">🎮 New Game</button>
                    <button class="exit-btn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                    ">🚪 Exit</button>
                </div>
            `;
            
            // Add hover effects
            const buttons = popup.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = btn.style.boxShadow.replace('4px', '8px');
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = btn.style.boxShadow.replace('8px', '4px');
                });
            });
            
            // Add event listeners
            const restartBtn = popup.querySelector('.restart-btn');
            const newGameBtn = popup.querySelector('.new-game-btn');
            const exitBtn = popup.querySelector('.exit-btn');
            
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    // Emit restart game event
                    socket.emit('restartGame', { roomId: backendRoomId });
                    document.body.removeChild(popup);
                    showUnoPopup('🔄 Restarting Game', 'Sending restart invitations to all players...', { autoClose: 3000 });
                });
            }
            
            if (newGameBtn) {
                newGameBtn.addEventListener('click', () => {
                    document.body.removeChild(popup);
                    
                    // If this is during a restart scenario, use respondToRestart
                    if (backendRoomId && gameData?.isGameOver) {
                        socket.emit('respondToRestart', { roomId: backendRoomId, didAccept: false });
                    } else {
                        // Otherwise use normal leave
                        if (backendRoomId) {
                            socket.emit('leaveRoom', { roomId: backendRoomId, playerId: currentUser?.username, reason: 'new_game' });
                        }
                    }
                    
                    // Clear game state and return to main menu
                    showScreen(modeScreen);
                    latestGameState = null;
                    backendRoomId = null;
                    backendPlayerId = null;
                });
            }
            
            if (exitBtn) {
                exitBtn.addEventListener('click', () => {
                    document.body.removeChild(popup);
                    
                    // If this is during a restart scenario, use respondToRestart
                    if (backendRoomId && gameData?.isGameOver) {
                        socket.emit('respondToRestart', { roomId: backendRoomId, didAccept: false });
                    } else {
                        // Otherwise use normal leave
                        if (backendRoomId) {
                            socket.emit('leaveRoom', { roomId: backendRoomId, playerId: currentUser?.username, reason: 'game_exit' });
                        }
                    }
                    
                    // Clear game state and return to main menu
                    showScreen(modeScreen);
                    latestGameState = null;
                    backendRoomId = null;
                    backendPlayerId = null;
                });
            }
            
            // Add to page
            document.body.appendChild(popup);
        }
        
        // Handle players joining the lobby during restart
        socket.on('playerJoinedLobby', (data) => {
            console.log('Player joined lobby:', data);
            
            // Show notification
            if (data.message) {
                showUnoPopup('👥 Player Joined', data.message, { autoClose: 3000 });
            }
        });
        
        // Handle players leaving the lobby during restart
        socket.on('playerLeftLobby', (data) => {
            console.log('Player left lobby:', data);
            
            // Show notification
            if (data.message) {
                showUnoPopup('👋 Player Left', data.message, { autoClose: 3000 });
            }
            
            // Update max players info if provided
            if (data.newMaxPlayers) {
                console.log(`Room max players updated to: ${data.newMaxPlayers}`);
            }
        });
    }

    // Helper function to update the game player info display
    function updateGamePlayerInfo() {
        if (gamePlayerAvatar && gamePlayerName && currentUser) {
            gamePlayerAvatar.src = currentUser.avatar || 'public/assets/images/avatar/exported avatar/ava-1.svg';
            gamePlayerName.textContent = currentUser.name || currentUser.username;
        }
    }

    // Render the game screen (player hand, top card, etc.)
    function renderGameScreen(roomState) {
        if (!roomState || !currentUser) return;
        
        // Update player info display
        updateGamePlayerInfo();
        
        // Find player hand
        let playerHand = [];
        // --- FIX: Always fetch hand from backend for privacy ---
        fetch(`${API_BASE_URL}/api/rooms/${roomState.roomId}/hand/${currentUser.username}`)
            .then(res => res.json())
            .then(data => {
                if (data.hand) {
                    playerHand = data.hand;
                    updateHandUI(playerHand, roomState);
                }
            });
        // Update top card
        if (roomState.topCard) {
            topCardImg.src = getCardImage(roomState.topCard);
            topCardImg.alt = `${roomState.topCard.color} ${roomState.topCard.value}`;
        }
        // Update color indicator
        if (roomState.currentColor) {
            currentColorIndicator.style.background = getColorHex(roomState.currentColor);
        } else {
            currentColorIndicator.style.background = '#fff';
        }
        // Info
        gameInfo.textContent = `Current Player: ${roomState.currentPlayer || ''}`;
        // Message
        if (roomState.isGameOver && roomState.winner) {
            gameMessage.textContent = `Winner: ${roomState.winner}`;
        } else if (roomState.playableDrawnCard && roomState.currentPlayer === currentUser.username) {
            // Don't clear message if in limbo state - it will be set by the gameUpdate handler
        } else {
            gameMessage.textContent = '';
        }
    }

    // Update the player's hand UI
    function updateHandUI(hand, roomState) {
        playerHandDiv.innerHTML = '';
        hand.forEach((card, idx) => {
            const cardBtn = document.createElement('button');
            cardBtn.className = 'card-btn';
            cardBtn.style.border = 'none';
            cardBtn.style.background = 'none';
            cardBtn.style.padding = '0';
            cardBtn.style.cursor = 'pointer';
            cardBtn.style.position = 'relative';
            cardBtn.style.outline = 'none';
            // Card image
            const img = document.createElement('img');
            img.src = getCardImage(card);
            img.alt = `${card.color} ${card.value}`;
            img.style.width = '70px';
            img.style.height = '110px';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0 2px 8px #0005';
            img.style.background = '#fff';
            // If it's not your turn, disable
            if (roomState.currentPlayer !== currentUser.username || roomState.isGameOver) {
                cardBtn.disabled = true;
                img.style.opacity = 0.6;
            }
            cardBtn.appendChild(img);
            // Play card on click
            cardBtn.onclick = async () => {
                // For wild cards, prompt for color
                if (card.type === 'wild') {
                    try {
                        const chosenColor = await showUnoColorPicker('Choose a Color for Wild Card');
                        socket.emit('playCard', {
                            roomId: backendRoomId,
                            playerId: currentUser.username,
                            card,
                            chosenColor
                        });
                    } catch (error) {
                        // User cancelled color selection
                        return;
                    }
                } else {
                    socket.emit('playCard', {
                        roomId: backendRoomId,
                        playerId: currentUser.username,
                        card
                    });
                }
            };
            playerHandDiv.appendChild(cardBtn);
        });
    }

    // Draw card button
    drawCardBtn.addEventListener('click', function () {
        if (!latestGameState || latestGameState.currentPlayer !== currentUser.username || latestGameState.isGameOver) {
            return;
        }
        socket.emit('drawCard', {
            roomId: backendRoomId,
            playerId: currentUser.username
        });
    });

    // Play drawn card button
    playDrawnCardBtn.addEventListener('click', async function () {
        if (!latestGameState || latestGameState.currentPlayer !== currentUser.username || !latestGameState.playableDrawnCard) {
            return;
        }

        const drawnCard = latestGameState.playableDrawnCard.card;
        let chosenColor = null;

        // If it's a wild card, prompt for color choice
        if (drawnCard.type === 'wild') {
            try {
                chosenColor = await showUnoColorPicker('Choose a Color for Drawn Wild Card');
            } catch (error) {
                // User cancelled color selection
                return;
            }
        }

        socket.emit('playDrawnCard', {
            roomId: backendRoomId,
            playerId: currentUser.username,
            chosenColor: chosenColor
        });
        
        // Immediately exit limbo state for smoother UX
        drawnCardVisual.innerHTML = '';
        drawnCardOptions.classList.add('hidden-screen');
        drawnCardOptions.style.display = 'none';
        drawCardBtn.classList.remove('hidden-screen');
        
        // Re-enable hand cards
        playerHandDiv.querySelectorAll('.card-btn').forEach(btn => {
            btn.disabled = false;
            btn.querySelector('img').style.opacity = 1;
        });
        
        gameMessage.textContent = '';
    });

    // Pass drawn card button
    passDrawnCardBtn.addEventListener('click', function () {
        if (!latestGameState || latestGameState.currentPlayer !== currentUser.username || !latestGameState.playableDrawnCard) {
            return;
        }

        socket.emit('passDrawnCard', {
            roomId: backendRoomId,
            playerId: currentUser.username
        });
        
        // Immediately exit limbo state for smoother UX
        drawnCardVisual.innerHTML = '';
        drawnCardOptions.classList.add('hidden-screen');
        drawnCardOptions.style.display = 'none';
        drawCardBtn.classList.remove('hidden-screen');
        
        // Re-enable hand cards
        playerHandDiv.querySelectorAll('.card-btn').forEach(btn => {
            btn.disabled = false;
            btn.querySelector('img').style.opacity = 1;
        });
        
        gameMessage.textContent = '';
    });

    // UNO Call button (calling UNO on another player)
    callUnoBtn.addEventListener('click', function () {
        if (socket && backendRoomId && currentUser && latestGameState && latestGameState.unoPlayerId) {
            // Disable button to prevent double-clicks (race condition protection)
            callUnoBtn.disabled = true;
            callUnoBtn.style.opacity = '0.6';
            
            socket.emit('player:callUno', {
                roomId: backendRoomId,
                targetPlayerId: latestGameState.unoPlayerId
            });
            
            // Hide the button immediately after clicking
            unoCallSection.classList.add('hidden-screen');
            unoCallSection.style.display = 'none';
            
            // Show feedback message
            showUnoPopup('UNO Called!', `You called UNO on <b>${latestGameState.unoPlayerId}</b>!`, { autoClose: 2000 });
            
            // Re-enable button after a short delay
            setTimeout(() => {
                callUnoBtn.disabled = false;
                callUnoBtn.style.opacity = '1';
            }, 2000);
        }
    });

    // Self UNO button (declaring UNO on yourself)
    callUnoSelfBtn.addEventListener('click', function () {
        if (socket && backendRoomId && currentUser) {
            // Disable button to prevent double-clicks
            callUnoSelfBtn.disabled = true;
            callUnoSelfBtn.style.opacity = '0.6';
            
            socket.emit('player:callUnoSelf', {
                roomId: backendRoomId
            });
            
            // Hide the button immediately after clicking
            unoSelfSection.classList.add('hidden-screen');
            unoSelfSection.style.display = 'none';
            
            // Show feedback message
            showUnoPopup('UNO Declared!', 'You are now safe from UNO penalty!', { autoClose: 2000 });
            
            // Re-enable button after a short delay
            setTimeout(() => {
                callUnoSelfBtn.disabled = false;
                callUnoSelfBtn.style.opacity = '1';
            }, 2000);
        }
    });

    // Exit game button
    gameExitBtn.addEventListener('click', function () {
        if (backendRoomId && currentUser) {
            // Show confirmation popup before leaving
            const confirmPopup = document.createElement('div');
            confirmPopup.className = 'uno-popup-overlay';
            confirmPopup.innerHTML = `
                <div class="uno-popup">
                    <div class="uno-popup-title">Leave Game?</div>
                    <div class="uno-popup-message">Are you sure you want to leave this game? You will forfeit the match.</div>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="uno-popup-btn" id="confirm-leave-btn" style="background: #e63946;">Leave Game</button>
                        <button class="uno-popup-btn" id="cancel-leave-btn">Stay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmPopup);
            
            // Handle leave confirmation
            document.getElementById('confirm-leave-btn').onclick = () => {
                confirmPopup.remove();
                
                // Emit leave event to backend (will trigger disconnect handling)
                socket.emit('leaveRoom', {
                    roomId: backendRoomId,
                    playerId: currentUser.username,
                    reason: 'intentional_exit'
                });
                
                // Clean up frontend state
                latestGameState = null;
                backendRoomId = null;
                showScreen(modeScreen);
                
                // Show confirmation message
                showUnoPopup('Left Game', 'You have successfully left the game.', { autoClose: 2000 });
            };
            
            // Handle cancel
            document.getElementById('cancel-leave-btn').onclick = () => {
                confirmPopup.remove();
            };
        } else {
            // No active game, just go back to mode screen
            showScreen(modeScreen);
            latestGameState = null;
        }
    });    // Helper: get card image path from card object
    function getCardImage(card) {
        if (!card) return '';
        if (card.type === 'wild') {
            if (card.value === 'wild') return 'public/assets/images/cards/exported_cards/wild.svg';
            if (card.value === 'wild_draw4' || card.value === '+4') return 'public/assets/images/cards/exported_cards/wild_draw4.svg';
        }
        let color = card.color ? card.color[0] : '';
        let value = card.value;
        if (value === 'draw2') value = 'draw2';
        if (value === 'skip') value = 'skip';
        if (value === 'reverse') value = 'reverse';
        // Map color and value to SVG file name
        const colorMap = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
        const colorName = colorMap[color] || color;
        let fileName = '';
        if (["0","1","2","3","4","5","6","7","8","9"].includes(value)) {
            fileName = `${colorName}_${value}`;
        } else if (value === 'draw2') {
            fileName = `${colorName}_draw2`;
        } else if (value === 'skip') {
            fileName = `${colorName}_skip`;
        } else if (value === 'reverse') {
            fileName = `${colorName}_reverse`;
        } else {
            fileName = `${colorName}_${value}`;
        }
        return `public/assets/images/cards/exported_cards/${fileName}.svg`;
    }

    // Helper: get color hex for indicator
    function getColorHex(color) {
        switch (color) {
            case 'red': return '#e63946';
            case 'yellow': return '#f4d35e';
            case 'green': return '#2a9d8f';
            case 'blue': return '#457b9d';
            default: return '#fff';
        }
    }

    // ============================================================================
    // LOBBY MANAGEMENT
    // ============================================================================

    // Lobby back button logic
    const lobbyBackBtn = document.getElementById('lobby-back-btn');
    if (lobbyBackBtn) {
        lobbyBackBtn.addEventListener('click', function () {
            // If we're currently in a room, properly leave it first
            if (socket && backendRoomId && backendPlayerId) {
                console.log('Leaving room via lobby back button');
                
                // Show a brief confirmation for waiting room
                const confirmPopup = document.createElement('div');
                confirmPopup.className = 'uno-popup-overlay';
                confirmPopup.innerHTML = `
                    <div class="uno-popup">
                        <div class="uno-popup-title">Leave Room?</div>
                        <div class="uno-popup-message">Are you sure you want to leave this room?</div>
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button class="uno-popup-btn" id="confirm-lobby-leave-btn" style="background: #e63946;">Leave Room</button>
                            <button class="uno-popup-btn" id="cancel-lobby-leave-btn">Stay</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(confirmPopup);
                
                // Handle leave confirmation
                document.getElementById('confirm-lobby-leave-btn').onclick = () => {
                    confirmPopup.remove();
                    
                    // Emit leave event to backend
                    socket.emit('leaveRoom', {
                        roomId: backendRoomId,
                        playerId: backendPlayerId,
                        reason: 'lobby_back_button'
                    });
                    
                    // Return to multiplayer options and reset state
                    showScreen(multiplayerOptions);
                    latestGameState = null;
                    isAdmin = false;
                    backendRoomId = null;
                    backendPlayerId = null;
                    
                    showUnoPopup('Left Room', 'You have left the room.', { autoClose: 2000 });
                };
                
                // Handle cancel
                document.getElementById('cancel-lobby-leave-btn').onclick = () => {
                    confirmPopup.remove();
                };
            } else {
                // No active room, just navigate back
                showScreen(multiplayerOptions);
                latestGameState = null;
                isAdmin = false;
                backendRoomId = null;
                backendPlayerId = null;
            }
        });
    }

    // Update lobby UI using backend game state as source of truth
    function updateLobbyUI(gameState) {
        if (!gameState) return;
        
        // Set room code
        lobbyRoomCode.textContent = gameState.roomId;
        
        // Find the host player data for display
        const hostPlayer = gameState.players.find(p => p.id === gameState.host);
        if (hostPlayer) {
            lobbyAdminAvatar.src = hostPlayer.avatar;
            lobbyAdminName.textContent = hostPlayer.name;
            
            // Add error handler for host avatar
            lobbyAdminAvatar.onerror = function() {
                console.warn('Host avatar image failed to load:', hostPlayer.avatar);
                if (!this.src.includes('ava-1.svg')) {
                    this.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
                }
            };
        } else {
            // Fallback if host data not found
            lobbyAdminAvatar.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
            lobbyAdminName.textContent = gameState.host;
        }
        
        // Update lobby slots with real player data
        for (let i = 0; i < lobbySlots.length; i++) {
            const slot = lobbySlots[i];
            if (i < gameState.maxPlayers - 1) {
                slot.style.display = '';
                const player = gameState.players[i + 1]; // 0 is admin
                const avatarBox = slot.querySelector('.lobby-avatar-box img');
                const nameBox = slot.querySelector('.lobby-player-name');
                
                if (player) {
                    avatarBox.src = player.avatar;
                    avatarBox.style.opacity = 1;
                    nameBox.textContent = player.name;
                    
                    // Add error handler for player avatar
                    avatarBox.onerror = function() {
                        console.warn('Player avatar image failed to load:', player.avatar);
                        if (!this.src.includes('ava-1.svg')) {
                            this.src = 'public/assets/images/avatar/exported avatar/ava-1.svg';
                        }
                    };
                } else {
                    avatarBox.src = 'public/assets/images/add-user.svg';
                    avatarBox.alt = 'Add Player';
                    avatarBox.style.opacity = 0.7;
                    nameBox.textContent = 'Waiting...';
                }
            } else {
                slot.style.display = 'none';
            }
        }
        
        // Show start button only for admin
        lobbyStartBtn.style.display = isAdmin ? 'inline-block' : 'none';
    }

    // Start button (admin only, triggers backend startGame)
    lobbyStartBtn.addEventListener('click', function () {
        if (isAdmin && backendRoomId && socket) {
            // Only allow if enough players have joined (check from latest game state)
            if (latestGameState && latestGameState.players.length >= 2) {
                socket.emit('startGame', { roomId: backendRoomId });
            } else {
                showUnoPopup('Cannot Start Game', 'At least 2 players are required to start the game.');
            }
        } else {
            showUnoPopup('Permission Denied', 'Only the host can start the game.');
        }
    });

    // ============================================================================
    // ANIMATED BACKGROUND CARDS
    // ============================================================================

    // === Animated UNO Cards: Randomly Appear and Fall ===
    const cardImages = [
        'public/assets/images/cards/exported_cards/wild_draw4.svg',
        'public/assets/images/cards/exported_cards/blue_draw2.svg',
        'public/assets/images/cards/exported_cards/blue_0.svg',
        'public/assets/images/cards/exported_cards/blue_1.svg',
        'public/assets/images/cards/exported_cards/blue_2.svg',
        'public/assets/images/cards/exported_cards/blue_3.svg',
        'public/assets/images/cards/exported_cards/blue_4.svg',
        'public/assets/images/cards/exported_cards/blue_5.svg',
        'public/assets/images/cards/exported_cards/blue_6.svg',
        'public/assets/images/cards/exported_cards/blue_7.svg',
        'public/assets/images/cards/exported_cards/blue_8.svg',
        'public/assets/images/cards/exported_cards/blue_9.svg',
        'public/assets/images/cards/exported_cards/blue_reverse.svg',
        'public/assets/images/cards/exported_cards/blue_skip.svg',
        'public/assets/images/cards/exported_cards/green_draw2.svg',
        'public/assets/images/cards/exported_cards/green_0.svg',
        'public/assets/images/cards/exported_cards/green_1.svg',
        'public/assets/images/cards/exported_cards/green_2.svg',
        'public/assets/images/cards/exported_cards/green_3.svg',
        'public/assets/images/cards/exported_cards/green_4.svg',
        'public/assets/images/cards/exported_cards/green_5.svg',
        'public/assets/images/cards/exported_cards/green_6.svg',
        'public/assets/images/cards/exported_cards/green_7.svg',
        'public/assets/images/cards/exported_cards/green_8.svg',
        'public/assets/images/cards/exported_cards/green_9.svg',
        'public/assets/images/cards/exported_cards/green_reverse.svg',
        'public/assets/images/cards/exported_cards/green_skip.svg',
        'public/assets/images/cards/exported_cards/red_draw2.svg',
        'public/assets/images/cards/exported_cards/red_0.svg',
        'public/assets/images/cards/exported_cards/red_1.svg',
        'public/assets/images/cards/exported_cards/red_2.svg',
        'public/assets/images/cards/exported_cards/red_3.svg',
        'public/assets/images/cards/exported_cards/red_4.svg',
        'public/assets/images/cards/exported_cards/red_5.svg',
        'public/assets/images/cards/exported_cards/red_6.svg',
        'public/assets/images/cards/exported_cards/red_7.svg',
        'public/assets/images/cards/exported_cards/red_8.svg',
        'public/assets/images/cards/exported_cards/red_9.svg',
        'public/assets/images/cards/exported_cards/red_reverse.svg',
        'public/assets/images/cards/exported_cards/red_skip.svg',
        'public/assets/images/cards/exported_cards/wild.svg',
        'public/assets/images/cards/exported_cards/yellow_draw2.svg',
        'public/assets/images/cards/exported_cards/yellow_0.svg',
        'public/assets/images/cards/exported_cards/yellow_1.svg',
        'public/assets/images/cards/exported_cards/yellow_2.svg',
        'public/assets/images/cards/exported_cards/yellow_3.svg',
        'public/assets/images/cards/exported_cards/yellow_4.svg',
        'public/assets/images/cards/exported_cards/yellow_5.svg',
        'public/assets/images/cards/exported_cards/yellow_6.svg',
        'public/assets/images/cards/exported_cards/yellow_7.svg',
        'public/assets/images/cards/exported_cards/yellow_8.svg',
        'public/assets/images/cards/exported_cards/yellow_9.svg',
        'public/assets/images/cards/exported_cards/yellow_reverse.svg',
        'public/assets/images/cards/exported_cards/yellow_skip.svg'
    ];
    const animatedBg = document.querySelector('.animated-bg');

    function spawnFallingCard() {
        const card = document.createElement('img');
        card.src = cardImages[Math.floor(Math.random() * cardImages.length)];
        card.className = 'animated-card';
        card.alt = 'UNO Card';
        // Random size for each card (width: 48-90px, height: 75-140px)
        const width = Math.floor(Math.random() * 42) + 48; // 48px to 90px
        const height = Math.floor(width * 1.55); // keep aspect ratio
        card.style.width = width + 'px';
        card.style.height = height + 'px';
        // Random start position anywhere in the viewport
        const startLeft = Math.random() * 90 + 2; // 2vw to 92vw
        const startTop = Math.random() * 80 + 5; // 5vh to 85vh
        card.style.left = startLeft + 'vw';
        card.style.top = startTop + 'vh';
        // Random direction: angle in radians (0 = right, PI/2 = down, PI = left, 3PI/2 = up)
        const angle = Math.random() * 2 * Math.PI;
        // Random distance (in vh/vw)
        const distance = Math.random() * 40 + 30; // 30 to 70 units
        // Calculate end position
        const endLeft = startLeft + Math.cos(angle) * distance;
        const endTop = startTop + Math.sin(angle) * distance;
        // Clamp to viewport
        const endLeftClamped = Math.max(0, Math.min(95, endLeft));
        const endTopClamped = Math.max(0, Math.min(95, endTop));
        // Random rotation
        const rot = (Math.random() * 40 - 20); // -20deg to +20deg
        card.style.transform = `rotate(${rot}deg)`;
        // Random duration
        const duration = Math.random() * 8 + 14;
        // Animate with transition
        card.style.transition = `left ${duration}s linear, top ${duration}s linear, opacity 1.5s`;
        card.style.opacity = 0.92;
        animatedBg.appendChild(card);
        // Animate to end position after a short delay (to trigger transition)
        setTimeout(() => {
            card.style.left = endLeftClamped + 'vw';
            card.style.top = endTopClamped + 'vh';
            card.style.opacity = 0.15;
        }, 50);
        // Remove card after animation
        setTimeout(() => { card.remove(); }, duration * 1000 + 1000);
    }
    // Spawn a card at a random interval between ~960ms and ~1760ms for 30% more density
    function startRandomCardSpawner() {
        spawnFallingCard();
        const next = Math.random() * 800 + 960; // 960ms to 1760ms (30% faster than original)
        setTimeout(startRandomCardSpawner, next);
    }
    startRandomCardSpawner();

    // Copy Room Code Button
    if (copyRoomCodeBtn) {
        copyRoomCodeBtn.addEventListener('click', function () {
            // Defensive: get the code from the correct element
            let code = '';
            if (lobbyRoomCode && lobbyRoomCode.textContent) {
                code = lobbyRoomCode.textContent.trim();
            } else if (roomCodeBox && roomCodeBox.textContent) {
                code = roomCodeBox.textContent.trim();
            }
            if (!code) return;
            const originalBg = copyRoomCodeBtn.style.backgroundColor;
            const originalColor = copyRoomCodeBtn.style.color;
            function setSuccessStyle() {
                copyRoomCodeBtn.style.backgroundColor = '#27ae60'; // green
                copyRoomCodeBtn.style.color = '#fff';
                setTimeout(() => {
                    copyRoomCodeBtn.style.backgroundColor = originalBg;
                    copyRoomCodeBtn.style.color = originalColor;
                }, 1200);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(() => {
                    setSuccessStyle();
                }, () => {
                    // Do nothing on failure
                });
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = code;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    setSuccessStyle();
                } catch (err) {
                    // Do nothing on failure
                }
                document.body.removeChild(textarea);
            }
        });
    }

    // =============================
    // Victory Popup Logic
    // =============================
    const victoryPopup = document.getElementById('victory-popup');
    const victoryTitle = document.getElementById('victory-title');
    const victoryMessage = document.getElementById('victory-message');
    const victoryAvatar = document.getElementById('victory-avatar');
    const victoryRestartBtn = document.getElementById('victory-restart-btn');
    const victoryExitBtn = document.getElementById('victory-exit-btn');

    // Show the victory popup
    function showVictoryPopup(winnerName, winnerAvatarUrl) {
        if (victoryTitle) victoryTitle.textContent = 'Congratulations!';
        if (victoryMessage) victoryMessage.innerHTML = `Player <b>${winnerName}</b> has won the game!`;
        if (victoryAvatar && winnerAvatarUrl) victoryAvatar.src = winnerAvatarUrl;
        if (victoryPopup) victoryPopup.style.display = 'flex';
    }
    // Hide the victory popup
    function hideVictoryPopup() {
        if (victoryPopup) victoryPopup.style.display = 'none';
    }
    // Restart game button
    if (victoryRestartBtn) {
        victoryRestartBtn.addEventListener('click', function () {
            hideVictoryPopup();
            // TODO: Add your restart game logic here
            // For now, reload the page
            window.location.reload();
        });
    }
    // Exit to main menu button
    if (victoryExitBtn) {
        victoryExitBtn.addEventListener('click', function () {
            hideVictoryPopup();
            // Show the mode selection screen (main menu)
            showScreen(modeScreen);
        });
    }
    // Example usage: call showVictoryPopup('Alice', 'public/assets/images/avatar/exported avatar/ava-2.svg');
    // Call this function when a player wins

    // =============================
    // Victory Screen Logic (Separate Page)
    // =============================
    const victoryScreen = document.getElementById('victory-screen');
    const victoryWinnerName = document.getElementById('victory-winner-name');
    const victoryPlayersList = document.getElementById('victory-players-list');
    const victoryRestartBtnNew = document.getElementById('victory-restart-btn');
    const victoryExitBtnNew = document.getElementById('victory-exit-btn');

    function showVictoryScreen(winnerName, playerList) {
        // Hide all other screens
        [loginScreen, registerScreen, modeScreen, multiplayerOptions, createRoomFormSection, joinRoomFormSection, howToPlayScreen, profileScreen, lobbyScreen, gameScreen].forEach(sec => {
            if (sec) {
                sec.classList.add('hidden-screen');
                sec.classList.remove('active-screen');
            }
        });
        // Show victory screen
        victoryScreen.classList.remove('hidden-screen');
        victoryScreen.classList.add('active-screen');
        // Set winner name
        victoryWinnerName.textContent = winnerName;
        // Populate player list
        victoryPlayersList.innerHTML = '';
        playerList.forEach(playerName => {
            const li = document.createElement('li');
            li.textContent = playerName;
            victoryPlayersList.appendChild(li);
        });
    }

    // Wire up buttons
    if (victoryRestartBtnNew) {
        victoryRestartBtnNew.addEventListener('click', function () {
            // For now, reload the page to restart
            window.location.reload();
        });
    }
    if (victoryExitBtnNew) {
        victoryExitBtnNew.addEventListener('click', function () {
            // Show the mode selection screen (main menu)
            showScreen(modeScreen);
        });
    }

    // --- Replace old popup logic with new screen logic ---
    // Example usage: call showVictoryScreen('Alice', ['Alice', 'Bob', 'Charlie']) when game ends

    // In your game end logic, call showVictoryScreen with the winner and player list:
    // For example, in renderGameScreen or gameUpdate handler:
    // if (roomState.isGameOver && roomState.winner && roomState.finalPlayerOrder) {
    //     showVictoryScreen(roomState.winner, roomState.finalPlayerOrder);
    // }

    // (You may need to adjust the property names for the player list as per your backend)

    // Handle browser tab close/navigation - ensure proper room cleanup
    window.addEventListener('beforeunload', function (event) {
        // If user is in a room, emit leave event to clean up server state
        if (socket && backendRoomId && backendPlayerId) {
            console.log('Page unloading - leaving room:', backendRoomId);
            
            // Use synchronous approach for beforeunload to ensure it's sent
            socket.emit('leaveRoom', {
                roomId: backendRoomId,
                playerId: backendPlayerId,
                reason: 'page_unload'
            });
        }
    });
});
// Create audio elements with correct paths
document.addEventListener('DOMContentLoaded', () => {
  const muteToggleBtn = document.getElementById('mute-toggle');
  if (!muteToggleBtn) {
    console.error('Mute toggle button not found!');
    return;
  }

  const bgMusic = new Audio('public/assets/images/sounds/background.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.4;

  const clickSound = new Audio('public/assets/images/sounds/click.mp3');
  clickSound.volume = 0.4;

  let isMuted = false;

  // Try to autoplay on page load (may be blocked)
  bgMusic.play().catch(() => {
    console.log('Autoplay prevented, waiting for user interaction...');
  });

  // Play click sound on all button clicks (only if not muted)
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      if (!isMuted) {
        clickSound.currentTime = 0;
        clickSound.play();
      }
    });
  });

  // Mute toggle button logic
  muteToggleBtn.addEventListener('click', () => {
    if (!bgMusic.paused && !isMuted) {
      bgMusic.volume = 0;
      clickSound.volume = 0;
      muteToggleBtn.textContent = '🔇';
      isMuted = true;
    } else {
      bgMusic.volume = 0.4;
      clickSound.volume = 0.4;
      muteToggleBtn.textContent = '🔊';
      isMuted = false;
    }
  });

  // Start background music on first user click anywhere (for browsers that block autoplay)
  document.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {
        console.log('Autoplay still blocked');
      });
    }
  }, { once: true });
});
   app.js
