// ============================================================
// NEXUS - Real-Time Multiplayer Mini-Game Platform
// Frontend (Demo Mode - No Backend Required)
// ============================================================

// ---- STATE ----
const State = {
  username: '',
  currentGame: null,
  roomCode: '',
  roomType: 'public',
  isHost: false,
  players: [],
  quizQuestions: [],
  quizTimePerQ: 20,
};

// ---- LEADERBOARDS ----
const Leaderboards = {
  quiz: [
    { name: 'Arjun', score: 4800 },
    { name: 'Rohan', score: 4200 },
    { name: 'Neha', score: 3600 },
  ],
  dino: [
    { name: 'Rohan', score: 3850 },
    { name: 'Arjun', score: 3210 },
    { name: 'Priya', score: 2980 },
  ],
  typerace: [
    { name: 'Neha', score: 112, label: 'WPM' },
    { name: 'Arjun', score: 98, label: 'WPM' },
    { name: 'Rohan', score: 87, label: 'WPM' },
  ],
  click: [
    { name: 'Arjun', score: 142 },
    { name: 'Priya', score: 138 },
    { name: 'Rohan', score: 131 },
  ],
};

// ---- DUMMY PLAYERS FOR DEMO ----
const BOT_NAMES = ['Arjun_Bot', 'Neha_Bot', 'Rohan_Bot', 'Priya_Bot', 'Karan_Bot'];
const BOT_COLORS = ['#00f5ff', '#ff006e', '#ffbe0b', '#06ffa5', '#8b5cf6'];
const BOT_EMOJIS = ['🤖', '🧠', '⚡', '🔥', '🌊'];

// ---- NAVIGATION ----
function showPage(id) {
  document.querySelectorAll('.page, .game-screen, .results-screen').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function enterLobby() {
  const val = document.getElementById('username-input').value.trim();
  if (!val) { showToast('Enter your player tag!', 'error'); return; }
  State.username = val;
  document.getElementById('nav-username').textContent = '👤 ' + val;
  renderGlobalLeaderboard();
  showPage('lobby');
  showToast('Welcome, ' + val + '!', 'success');
}

function goToLobby() {
  showPage('lobby');
  resetAllGames();
}

// ---- TOAST ----
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ---- MODAL ----
function openGameModal(game) {
  State.currentGame = game;
  const titles = { quiz: '🧠 KAHOOT QUIZ', dino: '🦖 DINO RACE', typerace: '⌨️ TYPE RACE', click: '🖱️ CLICK RACE' };
  document.getElementById('modal-game-title').textContent = titles[game];
  selectModalMode('create');
  selectRoomType('public');
  document.getElementById('game-modal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function selectModalMode(mode) {
  document.getElementById('modal-create-btn').classList.toggle('selected', mode === 'create');
  document.getElementById('modal-join-btn').classList.toggle('selected', mode === 'join');
  document.getElementById('modal-create-section').style.display = mode === 'create' ? 'block' : 'none';
  document.getElementById('modal-join-section').style.display = mode === 'join' ? 'block' : 'none';
}

function selectRoomType(type) {
  State.roomType = type;
  document.getElementById('pub-btn').classList.toggle('selected', type === 'public');
  document.getElementById('pvt-btn').classList.toggle('selected', type === 'private');
}

// ---- ROOM MANAGEMENT ----
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function createRoom() {
  closeModal('game-modal');
  State.roomCode = generateCode();
  State.isHost = true;
  State.players = [{ name: State.username, isHost: true, ready: true }];

  // Add some bots for demo
  const botCount = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < botCount; i++) {
    State.players.push({ name: BOT_NAMES[i], isHost: false, ready: false });
  }

  renderRoomLobby();
  showPage('room-lobby');
  showToast('Room created! Code: ' + State.roomCode, 'success');

  // Bots mark ready after delay
  setTimeout(() => {
    State.players.forEach((p, i) => { if (!p.isHost) p.ready = true; });
    renderRoomLobby();
    showToast('All players ready!', 'info');
  }, 1500);
}

function joinRoom() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (code.length < 4) { showToast('Enter a valid room code!', 'error'); return; }
  closeModal('game-modal');
  State.roomCode = code;
  State.isHost = false;
  State.players = [
    { name: 'HOST_Player', isHost: true, ready: true },
    { name: State.username, isHost: false, ready: true },
    { name: BOT_NAMES[2], isHost: false, ready: true },
  ];
  renderRoomLobby();
  showPage('room-lobby');
  showToast('Joined room ' + code, 'success');
}

function leaveRoom() {
  resetAllGames();
  showPage('lobby');
}

function renderRoomLobby() {
  document.getElementById('room-code-display').textContent = State.roomCode;
  const gameNames = { quiz: 'KAHOOT QUIZ', dino: 'DINO RACE', typerace: 'TYPE RACE', click: 'CLICK RACE' };
  document.getElementById('room-game-type').textContent = gameNames[State.currentGame] || '---';

  const list = document.getElementById('room-players-list');
  list.innerHTML = `
    <div class="section-header" style="margin-bottom:1rem">
      <span class="section-title">Players (${State.players.length})</span>
      <div class="section-line"></div>
    </div>
  `;
  State.players.forEach((p, i) => {
    const color = BOT_COLORS[i % BOT_COLORS.length];
    const emoji = BOT_EMOJIS[i % BOT_EMOJIS.length];
    list.innerHTML += `
      <div class="player-item">
        <div class="player-avatar" style="border-color:${color};background:${color}18">${p.isHost ? '👑' : emoji}</div>
        <span class="player-name">${p.name}${p.name === State.username ? ' (You)' : ''}</span>
        <span class="player-badge ${p.isHost ? 'badge-host' : p.ready ? 'badge-ready' : 'badge-waiting'}">
          ${p.isHost ? 'HOST' : p.ready ? 'READY' : 'WAITING'}
        </span>
      </div>
    `;
  });

  document.getElementById('host-controls').style.display = State.isHost ? 'block' : 'none';
  document.getElementById('player-waiting').style.display = State.isHost ? 'none' : 'block';

  if (State.isHost) {
    const quizSettings = document.getElementById('quiz-time-settings');
    quizSettings.style.display = State.currentGame === 'quiz' ? 'block' : 'none';
  }
}

function goToQuizSetup() {
  State.quizTimePerQ = parseInt(document.getElementById('quiz-time-per-q').value) || 20;
  if (State.quizQuestions.length === 0) {
    // Add default questions
    State.quizQuestions = [
      { q: 'Which protocol does NEXUS use for real-time communication?', opts: ['HTTP', 'WebSocket', 'FTP', 'SMTP'], correct: 1 },
      { q: 'What is the maximum number of players per room?', opts: ['5', '10', '15', '20'], correct: 1 },
    ];
  }
  renderQuizSetupScreen();
  showPage('quiz-host-setup');
}

function renderQuizSetupScreen() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  State.quizQuestions.forEach((q, qi) => {
    list.innerHTML += `
      <div class="question-row">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
          <span style="font-family:'Orbitron',monospace;font-size:.75rem;color:var(--neon-cyan)">Q${qi + 1}</span>
          <button onclick="removeQuestion(${qi})" style="background:none;border:none;color:var(--neon-pink);cursor:pointer;font-size:.8rem;">✕ Remove</button>
        </div>
        <input type="text" placeholder="Question text..." value="${q.q}" oninput="State.quizQuestions[${qi}].q=this.value" />
        <div class="options-grid">
          ${q.opts.map((opt, oi) => `
            <div style="display:flex;align-items:center;gap:.4rem">
              <input type="radio" name="correct-${qi}" ${q.correct === oi ? 'checked' : ''} onchange="State.quizQuestions[${qi}].correct=${oi}" style="accent-color:var(--neon-green)" />
              <input type="text" placeholder="Option ${String.fromCharCode(65+oi)}..." value="${opt}" oninput="State.quizQuestions[${qi}].opts[${oi}]=this.value" style="flex:1" />
            </div>
          `).join('')}
        </div>
        <div style="margin-top:.5rem;font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--neon-green)">● Select the radio button next to the correct answer</div>
      </div>
    `;
  });
}

function addQuestion() {
  State.quizQuestions.push({ q: '', opts: ['', '', '', ''], correct: 0 });
  renderQuizSetupScreen();
}

function removeQuestion(i) {
  State.quizQuestions.splice(i, 1);
  renderQuizSetupScreen();
}

function saveAndGoBack() {
  showToast('Questions saved!', 'success');
  showPage('room-lobby');
}

function startGame() {
  const game = State.currentGame;
  if (game === 'quiz') startQuizGame();
  else if (game === 'dino') startDinoGame();
  else if (game === 'typerace') startTypeRaceGame();
  else if (game === 'click') startClickGame();
}

// ============================================================
// QUIZ GAME
// ============================================================
const QuizGame = {
  currentQ: 0,
  timer: null,
  timeLeft: 20,
  answered: false,
  scores: {},
  questions: [],
};

function startQuizGame() {
  showPage('quiz-game');

  QuizGame.questions = State.quizQuestions.length > 0 ? State.quizQuestions : getDefaultQuizQuestions();
  State.quizTimePerQ = parseInt(document.getElementById('quiz-time-per-q')?.value) || 20;

  // Init scores
  QuizGame.scores = {};
  State.players.forEach(p => QuizGame.scores[p.name] = 0);

  document.getElementById('quiz-my-score').textContent = '0';
  document.getElementById('quiz-waiting-start').classList.add('active');
  document.getElementById('quiz-question-screen').style.display = 'none';

  setTimeout(() => {
    QuizGame.currentQ = 0;
    showQuizQuestion();
  }, 1500);
}

function getDefaultQuizQuestions() {
  return [
    { q: 'What does WebSocket provide that HTTP cannot?', opts: ['Caching', 'Persistent bidirectional connection', 'File transfer', 'Better security'], correct: 1 },
    { q: 'Which company developed Node.js?', opts: ['Google', 'Facebook', 'Ryan Dahl (Open Source)', 'Microsoft'], correct: 2 },
    { q: 'What format is used for WebSocket message exchange in this system?', opts: ['XML', 'CSV', 'JSON', 'YAML'], correct: 2 },
    { q: 'What is the authoritative source for game state in this architecture?', opts: ['Client browser', 'Database', 'Server', 'Load balancer'], correct: 2 },
    { q: 'What is the max response time for player actions in the requirements?', opts: ['100ms', '200ms', '500ms', '1000ms'], correct: 1 },
  ];
}

function showQuizQuestion() {
  const q = QuizGame.questions[QuizGame.currentQ];
  if (!q) { endQuiz(); return; }

  document.getElementById('quiz-waiting-start').classList.remove('active');
  document.getElementById('quiz-question-screen').style.display = 'block';

  document.getElementById('quiz-q-num').textContent = `Q ${QuizGame.currentQ + 1} / ${QuizGame.questions.length}`;
  document.getElementById('quiz-question-text').textContent = q.q;

  const letters = ['A', 'B', 'C', 'D'];
  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => selectQuizAnswer(i);
    container.appendChild(btn);
  });

  QuizGame.answered = false;
  QuizGame.timeLeft = State.quizTimePerQ;
  updateQuizTimer();
  updateQuizLeaderboard();

  clearInterval(QuizGame.timer);
  QuizGame.timer = setInterval(() => {
    QuizGame.timeLeft--;
    updateQuizTimer();
    if (QuizGame.timeLeft <= 0) {
      clearInterval(QuizGame.timer);
      lockQuizOptions();
      revealQuizAnswer();
      // Bots answer
      simulateBotQuizAnswers();
      setTimeout(() => nextQuizQuestion(), 2500);
    }
  }, 1000);
}

function updateQuizTimer() {
  const pct = (QuizGame.timeLeft / State.quizTimePerQ) * 100;
  const el = document.getElementById('quiz-countdown');
  const bar = document.getElementById('quiz-timer-bar');
  el.textContent = QuizGame.timeLeft;
  bar.style.width = pct + '%';

  const isWarn = QuizGame.timeLeft <= 5;
  el.classList.toggle('warning', isWarn);
  bar.classList.toggle('warning', pct < 40 && pct >= 20);
  bar.classList.toggle('critical', pct < 20);
}

function selectQuizAnswer(idx) {
  if (QuizGame.answered) return;
  QuizGame.answered = true;
  clearInterval(QuizGame.timer);

  const opts = document.querySelectorAll('.quiz-option');
  opts[idx].classList.add('selected');
  opts.forEach(o => o.classList.add('locked'));

  const q = QuizGame.questions[QuizGame.currentQ];
  const correct = idx === q.correct;
  if (correct) {
    const bonus = Math.round(QuizGame.timeLeft / State.quizTimePerQ * 1000);
    QuizGame.scores[State.username] = (QuizGame.scores[State.username] || 0) + 1000 + bonus;
    document.getElementById('quiz-my-score').textContent = QuizGame.scores[State.username];
    showToast('✓ Correct! +' + (1000 + bonus) + ' pts', 'success');
  } else {
    showToast('✗ Wrong!', 'error');
  }

  simulateBotQuizAnswers();
  revealQuizAnswer();
  setTimeout(() => nextQuizQuestion(), 2500);
}

function revealQuizAnswer() {
  const q = QuizGame.questions[QuizGame.currentQ];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach((o, i) => {
    o.classList.add('locked');
    if (i === q.correct) o.classList.add('correct');
    else if (o.classList.contains('selected')) o.classList.add('wrong');
  });
  updateQuizLeaderboard();
}

function lockQuizOptions() {
  document.querySelectorAll('.quiz-option').forEach(o => o.classList.add('locked'));
}

function simulateBotQuizAnswers() {
  const q = QuizGame.questions[QuizGame.currentQ];
  State.players.forEach(p => {
    if (p.name === State.username) return;
    const correct = Math.random() < 0.65;
    if (correct) {
      const bonus = Math.round(Math.random() * 800);
      QuizGame.scores[p.name] = (QuizGame.scores[p.name] || 0) + 1000 + bonus;
    }
  });
  updateQuizLeaderboard();
}

function updateQuizLeaderboard() {
  const lb = document.getElementById('quiz-live-lb');
  const sorted = Object.entries(QuizGame.scores).sort((a, b) => b[1] - a[1]).slice(0, 4);
  lb.innerHTML = `<div style="font-family:'Orbitron',monospace;font-size:.7rem;color:var(--text-muted);letter-spacing:.1em;margin-bottom:.5rem">LIVE STANDINGS</div>`;
  sorted.forEach(([name, score], i) => {
    lb.innerHTML += `
      <div class="quiz-lb-item">
        <span class="quiz-lb-rank">#${i + 1}</span>
        <span style="font-weight:600;${name === State.username ? 'color:var(--neon-cyan)' : ''}">${name}${name === State.username ? ' (You)' : ''}</span>
        <span class="quiz-lb-score">${score}</span>
      </div>
    `;
  });
}

function nextQuizQuestion() {
  QuizGame.currentQ++;
  if (QuizGame.currentQ >= QuizGame.questions.length) { endQuiz(); return; }
  showQuizQuestion();
}

function endQuiz() {
  clearInterval(QuizGame.timer);
  const sorted = Object.entries(QuizGame.scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
  showResults(sorted, 'pts');
}

// ============================================================
// DINO GAME
// ============================================================
const DinoGame = {
  canvas: null,
  ctx: null,
  running: false,
  gameTimer: null,
  frameId: null,
  timeLeft: 40,
  dinos: [],
  obstacles: [],
  ground: 200,
  speed: 5,
  frameCount: 0,
  scores: {},
};

function startDinoGame() {
  showPage('dino-game');
  DinoGame.canvas = document.getElementById('dino-canvas');
  DinoGame.ctx = DinoGame.canvas.getContext('2d');

  // Resize canvas
  const maxW = Math.min(800, window.innerWidth - 40);
  DinoGame.canvas.width = maxW;
  DinoGame.canvas.height = 250;
  DinoGame.ground = 200;

  // Init player dino
  DinoGame.dinos = [{
    name: State.username,
    x: 80,
    y: DinoGame.ground - 50,
    w: 44,
    h: 50,
    vy: 0,
    jumping: false,
    dead: false,
    score: 0,
    color: '#00f5ff',
    isPlayer: true,
    legFrame: 0,
  }];

  // Bot dinos
  State.players.slice(1, 3).forEach((p, i) => {
    DinoGame.dinos.push({
      name: p.name,
      x: 80,
      y: DinoGame.ground - 50,
      w: 44,
      h: 50,
      vy: 0,
      jumping: false,
      dead: false,
      score: 0,
      color: BOT_COLORS[(i + 1) % BOT_COLORS.length],
      isPlayer: false,
      legFrame: 0,
      jumpCooldown: 0,
    });
  });

  DinoGame.obstacles = [];
  DinoGame.scores = {};
  DinoGame.dinos.forEach(d => DinoGame.scores[d.name] = 0);
  DinoGame.timeLeft = 40;
  DinoGame.speed = 5;
  DinoGame.frameCount = 0;
  DinoGame.running = true;

  updateDinoScoreDisplay();
  renderDinoPlayerScores();

  // Controls
  DinoGame._jumpHandler = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); dinoJump(); }
  };
  document.addEventListener('keydown', DinoGame._jumpHandler);
  DinoGame.canvas.onclick = dinoJump;

  // Game timer
  DinoGame.gameTimer = setInterval(() => {
    DinoGame.timeLeft--;
    const pct = (DinoGame.timeLeft / 40) * 100;
    document.getElementById('dino-countdown').textContent = DinoGame.timeLeft;
    document.getElementById('dino-timer-bar').style.width = pct + '%';
    if (DinoGame.timeLeft <= 0) endDinoGame();
  }, 1000);

  dinoLoop();
}

function dinoJump() {
  const player = DinoGame.dinos[0];
  if (!player.dead && !player.jumping) {
    player.vy = -16;
    player.jumping = true;
  }
}

function dinoLoop() {
  if (!DinoGame.running) return;
  DinoGame.frameId = requestAnimationFrame(dinoLoop);
  DinoGame.frameCount++;
  DinoGame.speed = 5 + (40 - DinoGame.timeLeft) * 0.15;

  const ctx = DinoGame.ctx;
  const W = DinoGame.canvas.width;
  const H = DinoGame.canvas.height;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0a0f1e';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,245,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = DinoGame.frameCount % 60; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Ground
  ctx.strokeStyle = 'rgba(0,245,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, DinoGame.ground + 2);
  ctx.lineTo(W, DinoGame.ground + 2);
  ctx.stroke();

  // Spawn obstacles
  if (DinoGame.frameCount % Math.max(60, 120 - Math.floor((40 - DinoGame.timeLeft) * 1.5)) === 0) {
    const type = Math.random() > 0.5 ? 'cactus' : 'rock';
    DinoGame.obstacles.push({
      x: W + 10,
      y: DinoGame.ground - (type === 'cactus' ? 50 : 30),
      w: type === 'cactus' ? 20 : 30,
      h: type === 'cactus' ? 52 : 32,
      type,
    });
  }

  // Update and draw obstacles
  DinoGame.obstacles = DinoGame.obstacles.filter(o => o.x + o.w > -10);
  DinoGame.obstacles.forEach(o => {
    o.x -= DinoGame.speed;
    drawObstacle(ctx, o);
  });

  // Update and draw dinos
  DinoGame.dinos.forEach((dino, di) => {
    if (!dino.dead) {
      // Bot AI
      if (!dino.isPlayer) {
        dino.jumpCooldown = (dino.jumpCooldown || 0) - 1;
        const nearest = DinoGame.obstacles.find(o => o.x > dino.x && o.x - dino.x < 120 + Math.random() * 60);
        if (nearest && !dino.jumping && dino.jumpCooldown <= 0 && Math.random() > 0.2) {
          dino.vy = -16;
          dino.jumping = true;
          dino.jumpCooldown = 30;
        }
        dino.score = Math.floor(DinoGame.frameCount * DinoGame.speed / 50);
      } else {
        dino.score = Math.floor(DinoGame.frameCount * DinoGame.speed / 50);
      }

      // Physics
      dino.vy += 0.9;
      dino.y += dino.vy;
      if (dino.y >= DinoGame.ground - dino.h) {
        dino.y = DinoGame.ground - dino.h;
        dino.vy = 0;
        dino.jumping = false;
      }

      // Collision
      for (const o of DinoGame.obstacles) {
        if (
          dino.x + 6 < o.x + o.w - 4 &&
          dino.x + dino.w - 6 > o.x + 4 &&
          dino.y + 6 < o.y + o.h &&
          dino.y + dino.h > o.y + 6
        ) {
          dino.dead = true;
          DinoGame.scores[dino.name] = dino.score;
          if (dino.isPlayer) {
            document.getElementById('dino-status').textContent = '💀 YOU DIED! Waiting for game to end...';
            showToast('You crashed! Score: ' + dino.score, 'error');
          }
        }
      }

      dino.legFrame = DinoGame.frameCount;
      drawDino(ctx, dino);
    } else {
      drawDeadDino(ctx, dino);
    }

    DinoGame.scores[dino.name] = Math.max(DinoGame.scores[dino.name] || 0, dino.score);
  });

  updateDinoScoreDisplay();
}

function drawDino(ctx, dino) {
  ctx.save();
  ctx.strokeStyle = dino.color;
  ctx.fillStyle = dino.color + '22';
  ctx.lineWidth = 2;

  // Body
  ctx.beginPath();
  ctx.roundRect(dino.x, dino.y, dino.w, dino.h * 0.65, 6);
  ctx.fill(); ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.roundRect(dino.x + dino.w * 0.5, dino.y - 14, dino.w * 0.55, 18, 4);
  ctx.fill(); ctx.stroke();

  // Eye
  ctx.fillStyle = dino.color;
  ctx.beginPath();
  ctx.arc(dino.x + dino.w * 0.88, dino.y - 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(dino.x + 4, dino.y + dino.h * 0.3);
  ctx.quadraticCurveTo(dino.x - 18, dino.y + dino.h * 0.2, dino.x - 10, dino.y + dino.h * 0.55);
  ctx.stroke();

  // Legs
  const legSwing = Math.sin(dino.legFrame * 0.3) * 6;
  if (!dino.jumping) {
    ctx.beginPath();
    ctx.moveTo(dino.x + 10, dino.y + dino.h * 0.65);
    ctx.lineTo(dino.x + 10 + legSwing, dino.y + dino.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dino.x + 28, dino.y + dino.h * 0.65);
    ctx.lineTo(dino.x + 28 - legSwing, dino.y + dino.h);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(dino.x + 10, dino.y + dino.h * 0.65);
    ctx.lineTo(dino.x, dino.y + dino.h * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dino.x + 28, dino.y + dino.h * 0.65);
    ctx.lineTo(dino.x + 36, dino.y + dino.h * 0.85);
    ctx.stroke();
  }

  // Name label
  ctx.fillStyle = dino.color;
  ctx.font = '10px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillText(dino.name.substring(0, 8), dino.x + dino.w / 2, dino.y - 20);
  ctx.restore();
}

function drawDeadDino(ctx, dino) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ff006e';
  ctx.fillStyle = '#ff006e11';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(dino.x, dino.y, dino.w, dino.h * 0.65, 6);
  ctx.fill(); ctx.stroke();
  // X eyes
  ctx.strokeStyle = '#ff006e';
  ctx.lineWidth = 2;
  const hx = dino.x + dino.w * 0.88;
  const hy = dino.y - 8;
  ctx.beginPath(); ctx.moveTo(hx - 3, hy - 3); ctx.lineTo(hx + 3, hy + 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx + 3, hy - 3); ctx.lineTo(hx - 3, hy + 3); ctx.stroke();
  ctx.restore();
}

function drawObstacle(ctx, o) {
  ctx.save();
  if (o.type === 'cactus') {
    ctx.strokeStyle = '#06ffa5';
    ctx.fillStyle = '#06ffa511';
    ctx.lineWidth = 2;
    // Main trunk
    ctx.beginPath();
    ctx.roundRect(o.x + o.w * 0.35, o.y, o.w * 0.3, o.h, 3);
    ctx.fill(); ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.roundRect(o.x, o.y + o.h * 0.2, o.w * 0.35, o.h * 0.12, 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(o.x + o.w * 0.65, o.y + o.h * 0.3, o.w * 0.35, o.h * 0.12, 2);
    ctx.fill(); ctx.stroke();
    // Arm tips
    ctx.beginPath();
    ctx.roundRect(o.x, o.y + o.h * 0.08, o.w * 0.12, o.h * 0.14, 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(o.x + o.w * 0.88, o.y + o.h * 0.18, o.w * 0.12, o.h * 0.14, 2);
    ctx.fill(); ctx.stroke();
  } else {
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#8b5cf611';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, 4);
    ctx.fill(); ctx.stroke();
    // Rock details
    ctx.strokeStyle = '#8b5cf666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w * 0.3, o.y + 3);
    ctx.lineTo(o.x + o.w * 0.5, o.y + o.h - 5);
    ctx.stroke();
  }
  ctx.restore();
}

function updateDinoScoreDisplay() {
  const player = DinoGame.dinos[0];
  document.getElementById('dino-score-display').textContent = 'Score: ' + (player ? player.score : 0);
}

function renderDinoPlayerScores() {
  const container = document.getElementById('dino-player-scores');
  container.innerHTML = '';
  DinoGame.dinos.forEach((d, i) => {
    container.innerHTML += `
      <div class="dino-player-score">
        <div class="dino-player-dot" style="background:${d.color}"></div>
        <span style="font-weight:600;font-size:.85rem">${d.name}${d.isPlayer ? ' (You)' : ''}</span>
        <span style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:${d.color};margin-left:auto" id="dino-score-${i}">0</span>
        ${d.dead ? '<span style="color:#ff006e;font-size:.75rem">💀</span>' : ''}
      </div>
    `;
  });
}

function endDinoGame() {
  DinoGame.running = false;
  clearInterval(DinoGame.gameTimer);
  cancelAnimationFrame(DinoGame.frameId);
  document.removeEventListener('keydown', DinoGame._jumpHandler);
  DinoGame.canvas.onclick = null;

  const sorted = DinoGame.dinos.map(d => ({
    name: d.name + (d.isPlayer ? ' (You)' : ''),
    score: d.score,
  })).sort((a, b) => b.score - a.score);

  // Save to leaderboard
  const me = DinoGame.dinos[0];
  if (me) {
    Leaderboards.dino.push({ name: State.username, score: me.score });
    Leaderboards.dino.sort((a, b) => b.score - a.score);
    Leaderboards.dino = Leaderboards.dino.slice(0, 5);
  }

  showResults(sorted, 'pts');
}

// ============================================================
// TYPE RACE
// ============================================================
const TypeRace = {
  text: '',
  typed: 0,
  errors: 0,
  startTime: 0,
  finished: false,
  playerProgress: {},
  updateInterval: null,
};

const RACE_TEXTS = [
  "The WebSocket protocol enables persistent bidirectional communication between clients and the server over a single TCP connection.",
  "Real-time multiplayer systems require server-authoritative state management to ensure fairness across all connected players.",
  "In distributed systems, latency is the time delay between a user action and the corresponding response from the server.",
  "The JSON format is a lightweight data-interchange format that is easy for humans to read and machines to parse efficiently.",
  "Node.js is a cross-platform runtime environment that allows developers to execute JavaScript code on the server side.",
];

function startTypeRaceGame() {
  showPage('typerace-game');
  TypeRace.text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
  TypeRace.typed = 0;
  TypeRace.errors = 0;
  TypeRace.startTime = Date.now();
  TypeRace.finished = false;

  TypeRace.playerProgress = {};
  State.players.forEach(p => TypeRace.playerProgress[p.name] = 0);
  TypeRace.playerProgress[State.username] = 0;

  renderTypeRaceText();
  renderTypeRaceProgress();

  const input = document.getElementById('typerace-input');
  input.value = '';
  input.disabled = false;
  input.focus();
  input.oninput = onTypeRaceInput;

  document.getElementById('typerace-finish-btn').style.display = 'none';
  document.getElementById('typerace-wpm').textContent = '0';
  document.getElementById('tr-wpm').textContent = '0';
  document.getElementById('tr-acc').textContent = '100%';
  document.getElementById('tr-progress').textContent = '0%';
  document.getElementById('typerace-wpm').textContent = '0';

  // Bot simulation
  TypeRace.updateInterval = setInterval(() => {
    State.players.forEach((p, i) => {
      if (p.name === State.username) return;
      const speed = (55 + Math.random() * 50) / 60; // chars per frame at ~60fps interval
      TypeRace.playerProgress[p.name] = Math.min(
        TypeRace.text.length,
        (TypeRace.playerProgress[p.name] || 0) + speed
      );
    });
    renderTypeRaceProgress();

    // Check if any bot finished
    State.players.forEach(p => {
      if (p.name !== State.username && TypeRace.playerProgress[p.name] >= TypeRace.text.length) {
        if (!p._finished) {
          p._finished = true;
          showToast(p.name + ' finished!', 'info');
        }
      }
    });

    if (!TypeRace.finished) updateTypeRaceStats();
  }, 200);
}

function renderTypeRaceText() {
  const display = document.getElementById('typerace-text-display');
  display.innerHTML = TypeRace.text.split('').map((ch, i) => {
    let cls = 'upcoming';
    if (i < TypeRace.typed) cls = 'correct';
    if (i === TypeRace.typed) cls = 'current';
    return `<span class="char ${cls}" id="char-${i}">${ch}</span>`;
  }).join('');
}

function onTypeRaceInput(e) {
  if (TypeRace.finished) return;
  const input = document.getElementById('typerace-input');
  const val = input.value;
  const expected = TypeRace.text[TypeRace.typed];

  if (!expected) return;

  const ch = val[val.length - 1];
  if (!ch) {
    // Backspace not allowed in type race
    input.value = '';
    return;
  }

  if (ch === expected) {
    TypeRace.typed++;
    TypeRace.playerProgress[State.username] = TypeRace.typed;
    input.value = '';
    input.classList.remove('error');

    // Update char display
    const prevChar = document.getElementById('char-' + (TypeRace.typed - 1));
    if (prevChar) prevChar.className = 'char correct';
    const currChar = document.getElementById('char-' + TypeRace.typed);
    if (currChar) { currChar.className = 'char current'; currChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }

    if (TypeRace.typed >= TypeRace.text.length) {
      autoFinishTypeRace();
      return;
    }

    // Show finish button when > 90% done
    if (TypeRace.typed / TypeRace.text.length > 0.9) {
      document.getElementById('typerace-finish-btn').style.display = 'flex';
    }
  } else {
    TypeRace.errors++;
    input.classList.add('error');
    input.value = '';
    setTimeout(() => input.classList.remove('error'), 300);
  }

  updateTypeRaceStats();
  renderTypeRaceProgress();
}

function updateTypeRaceStats() {
  const elapsed = (Date.now() - TypeRace.startTime) / 1000 / 60;
  const wpm = elapsed > 0 ? Math.round((TypeRace.typed / 5) / elapsed) : 0;
  const accuracy = TypeRace.typed + TypeRace.errors > 0 
    ? Math.round((TypeRace.typed / (TypeRace.typed + TypeRace.errors)) * 100) 
    : 100;
  const progress = Math.round((TypeRace.typed / TypeRace.text.length) * 100);

  document.getElementById('tr-wpm').textContent = wpm;
  document.getElementById('typerace-wpm').textContent = wpm;
  document.getElementById('tr-acc').textContent = accuracy + '%';
  document.getElementById('tr-progress').textContent = progress + '%';
}

function renderTypeRaceProgress() {
  const container = document.getElementById('typerace-progress-list');
  const colors = ['#00f5ff', '#ff006e', '#ffbe0b', '#06ffa5', '#8b5cf6'];
  const entries = Object.entries(TypeRace.playerProgress).sort((a, b) => b[1] - a[1]);
  container.innerHTML = entries.map(([name, prog], i) => {
    const pct = Math.round((prog / TypeRace.text.length) * 100);
    const color = name === State.username ? colors[0] : colors[(i + 1) % colors.length];
    return `
      <div class="typerace-progress-item">
        <span class="typerace-progress-name" style="color:${color}">${name.substring(0, 10)}${name === State.username ? ' ★' : ''}</span>
        <div class="typerace-progress-bar-bg">
          <div class="typerace-progress-bar" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="typerace-progress-pct">${pct}%</span>
      </div>
    `;
  }).join('');
}

function autoFinishTypeRace() {
  TypeRace.finished = true;
  document.getElementById('typerace-input').disabled = true;
  document.getElementById('typerace-finish-btn').style.display = 'none';
  showToast('🏁 You finished!', 'success');
  setTimeout(endTypeRace, 1500);
}

function finishTypeRace() {
  TypeRace.finished = true;
  document.getElementById('typerace-input').disabled = true;
  document.getElementById('typerace-finish-btn').style.display = 'none';
  showToast('🏁 Submitted!', 'success');
  setTimeout(endTypeRace, 800);
}

function endTypeRace() {
  clearInterval(TypeRace.updateInterval);
  State.players.forEach(p => p._finished = false);

  const elapsed = (Date.now() - TypeRace.startTime) / 1000 / 60;
  const myWpm = elapsed > 0 ? Math.round((TypeRace.typed / 5) / elapsed) : 0;

  const results = Object.entries(TypeRace.playerProgress).map(([name, prog]) => {
    const wpm = name === State.username ? myWpm : Math.round(50 + Math.random() * 60);
    return { name, score: wpm };
  }).sort((a, b) => b.score - a.score);

  // Save
  Leaderboards.typerace.push({ name: State.username, score: myWpm, label: 'WPM' });
  Leaderboards.typerace.sort((a, b) => b.score - a.score);
  Leaderboards.typerace = Leaderboards.typerace.slice(0, 5);

  showResults(results, 'WPM');
}

// ============================================================
// CLICK RACE
// ============================================================
const ClickGame = {
  myClicks: 0,
  timer: null,
  timeLeft: 10,
  running: false,
  botIntervals: [],
  playerClicks: {},
};

function startClickGame() {
  showPage('click-game');
  ClickGame.myClicks = 0;
  ClickGame.timeLeft = 10;
  ClickGame.running = true;
  ClickGame.playerClicks = {};

  State.players.forEach(p => ClickGame.playerClicks[p.name] = 0);
  ClickGame.playerClicks[State.username] = 0;

  renderClickScores();
  document.getElementById('click-timer-display').textContent = '10';
  document.getElementById('click-timer-bar').style.width = '100%';

  // Bot automation
  ClickGame.botIntervals = State.players.slice(1).map((p) => {
    const cps = 5 + Math.random() * 8; // clicks per second
    return setInterval(() => {
      if (ClickGame.running) {
        ClickGame.playerClicks[p.name] = (ClickGame.playerClicks[p.name] || 0) + (Math.random() < cps / 10 ? 1 : 0);
        renderClickScores();
      }
    }, 100);
  });

  ClickGame.timer = setInterval(() => {
    ClickGame.timeLeft--;
    const pct = (ClickGame.timeLeft / 10) * 100;
    document.getElementById('click-timer-display').textContent = ClickGame.timeLeft;
    document.getElementById('click-timer-bar').style.width = pct + '%';
    if (ClickGame.timeLeft <= 0) endClickGame();
  }, 1000);
}

function doClick() {
  if (!ClickGame.running) return;
  ClickGame.myClicks++;
  ClickGame.playerClicks[State.username] = ClickGame.myClicks;

  // Ripple
  const btn = document.getElementById('click-btn');
  btn.style.transform = 'scale(0.92)';
  setTimeout(() => btn.style.transform = '', 80);

  renderClickScores();
}

function renderClickScores() {
  const container = document.getElementById('clickrace-scores');
  const sorted = Object.entries(ClickGame.playerClicks).sort((a, b) => b[1] - a[1]);
  container.innerHTML = sorted.map(([name, clicks], i) => `
    <div class="clickrace-score-card ${name === State.username ? 'active-player' : ''}">
      <div class="clickrace-score-name">${name}${name === State.username ? ' (You)' : ''}</div>
      <div class="clickrace-score-val">${clicks}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--text-muted)">CLICKS</div>
    </div>
  `).join('');
}

function endClickGame() {
  ClickGame.running = false;
  clearInterval(ClickGame.timer);
  ClickGame.botIntervals.forEach(clearInterval);

  const sorted = Object.entries(ClickGame.playerClicks)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  Leaderboards.click.push({ name: State.username, score: ClickGame.myClicks });
  Leaderboards.click.sort((a, b) => b.score - a.score);
  Leaderboards.click = Leaderboards.click.slice(0, 5);

  showResults(sorted, 'clicks');
}

// ============================================================
// RESULTS
// ============================================================
function showResults(players, unit) {
  resetAllGames();
  showPage('results-screen');

  const podium = document.getElementById('results-podium');
  const fullList = document.getElementById('results-full-list');

  const medals = ['🥇', '🥈', '🥉'];
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd for visual
  const heights = [140, 180, 110];

  podium.innerHTML = '';
  [1, 0, 2].forEach((rank, pos) => {
    const p = players[rank];
    if (!p) return;
    podium.innerHTML += `
      <div class="podium-place" style="height:${heights[pos]}px; ${rank === 0 ? 'border-color:var(--neon-yellow)' : ''}">
        <span class="podium-emoji">${medals[rank] || '🎮'}</span>
        <div class="podium-name">${p.name}</div>
        <div class="podium-score">${p.score} ${unit}</div>
      </div>
    `;
  });

  fullList.innerHTML = `<div style="font-family:'Orbitron',monospace;font-size:.7rem;color:var(--text-muted);letter-spacing:.1em;margin-bottom:.75rem">FULL STANDINGS</div>`;
  players.forEach((p, i) => {
    fullList.innerHTML += `
      <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid var(--border)">
        <span style="font-family:'Orbitron',monospace;font-size:.8rem;color:${i < 3 ? 'var(--neon-yellow)' : 'var(--text-muted)'};min-width:1.5rem">#${i + 1}</span>
        <span style="flex:1;font-weight:600;${p.name.includes('(You)') || p.name === State.username ? 'color:var(--neon-cyan)' : ''}">${p.name}</span>
        <span style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:var(--neon-cyan)">${p.score} ${unit}</span>
      </div>
    `;
  });
}

function playAgain() {
  showPage('room-lobby');
  renderRoomLobby();
}

// ============================================================
// GLOBAL LEADERBOARD
// ============================================================
function renderGlobalLeaderboard() {
  const container = document.getElementById('global-leaderboard');
  const games = [
    { key: 'quiz', name: 'Quiz', icon: '🧠', unit: 'pts', color: 'var(--neon-yellow)' },
    { key: 'dino', name: 'Dino Race', icon: '🦖', unit: 'pts', color: 'var(--neon-green)' },
    { key: 'typerace', name: 'Type Race', icon: '⌨️', unit: 'WPM', color: 'var(--neon-cyan)' },
    { key: 'click', name: 'Click Race', icon: '🖱️', unit: 'clicks', color: 'var(--neon-pink)' },
  ];

  container.innerHTML = games.map(g => {
    const lb = Leaderboards[g.key] || [];
    return `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:1.25rem;">
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <span style="font-size:1.5rem">${g.icon}</span>
          <span style="font-family:'Orbitron',monospace;font-size:.85rem;font-weight:700;color:${g.color}">${g.name}</span>
        </div>
        ${lb.slice(0, 3).map((entry, i) => `
          <div style="display:flex;align-items:center;gap:.6rem;padding:.35rem 0;border-bottom:1px solid var(--border)">
            <span style="font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${i === 0 ? 'var(--neon-yellow)' : 'var(--text-muted)'};min-width:1.2rem">#${i + 1}</span>
            <span style="flex:1;font-size:.85rem;font-weight:600">${entry.name}</span>
            <span style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:${g.color}">${entry.score}${entry.label ? ' ' + entry.label : ' ' + g.unit}</span>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// ============================================================
// CLEANUP
// ============================================================
function resetAllGames() {
  // Dino
  DinoGame.running = false;
  clearInterval(DinoGame.gameTimer);
  cancelAnimationFrame(DinoGame.frameId);
  if (DinoGame._jumpHandler) document.removeEventListener('keydown', DinoGame._jumpHandler);

  // Quiz
  clearInterval(QuizGame.timer);

  // TypeRace
  clearInterval(TypeRace.updateInterval);
  State.players.forEach(p => p._finished = false);

  // Click
  ClickGame.running = false;
  clearInterval(ClickGame.timer);
  ClickGame.botIntervals.forEach(clearInterval);
  ClickGame.botIntervals = [];
}

// ---- KEYBOARD: Enter to submit ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const landing = document.getElementById('landing');
    if (landing.classList.contains('active')) enterLobby();
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// ---- JOIN CODE: uppercase auto ----
document.addEventListener('input', (e) => {
  if (e.target.id === 'join-code-input') {
    e.target.value = e.target.value.toUpperCase();
  }
});

console.log('%c⚡ NEXUS loaded', 'color: #00f5ff; font-family: monospace; font-size: 16px; font-weight: bold');
