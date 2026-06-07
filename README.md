# 🦖 Dino Adventure

[![Game Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/EugeneLewis06/dino-adventure)
[![Made with HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Made with JavaScript](https://img.shields.io/badge/JavaScript-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/tests-41%2F41%20passed-brightgreen)](https://github.com/EugeneLewis06/dino-adventure/tree/main/test-reports)
[![Vitest](https://img.shields.io/badge/vitest-34%2F34-brightgreen)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/playwright-7%2F7-brightgreen)](https://playwright.dev)

> An action-packed endless runner game with boss battles, power-ups, and epic 8-bit soundtrack! 🎮

---

## 🎮 How to Play

### Normal Mode (Runner)
- **🖱️ Click / Space / ↑ Arrow** - Jump
- **🖱️ Double Click** - Double Jump (in mid-air)
- **⏸️ P Key** - Pause/Resume game
- **⏱️ Survive** - Avoid cacti, birds, pits, and turtles for 2 minutes
- **❤️ Collect Hearts** - Gain extra lives to survive collisions
- **⚡ Collect Lightning** - 3 seconds of speed boost + invincibility

### Boss Battle Mode
After surviving for 2 minutes, face the mighty **Elephant Boss**! 🐘

- **🖱️ Mouse Move** - Move your dino in 2D space
- **🖱️ Left Click** - Shoot (1 damage per hit)
- **🔥 Q Key** - Fireball Attack (10 damage - one time use)
- **🛡️ E Key** - Shield (7 seconds invincibility - one time use)
- **⏸️ P Key** - Pause/Resume game

### Boss Choice System
Before the boss fight, choose your power:
- **🔥 Fireball** - Massive 10 damage attack (use Q)
- **🛡️ Shield** - Temporary invincibility (use E)

### Shortcuts
| Key | Action |
|-----|--------|
| **F3** | Toggle debug overlay (FPS & error info) |
| **F6** | Toggle fullscreen |
| **H** | Cheat: reduce boss battle timer from 120s to 60s |

---

## 🎯 Game Features

| Feature | Description |
|---------|-------------|
| 🏃 **Endless Runner** | Procedurally generated obstacles with increasing difficulty |
| 🐘 **Boss Battle** | Epic 2D shooter mechanic against the Elephant Boss with homing projectiles |
| ⚡ **Lightning Power-up** | Speed boost + temporary invincibility when collected |
| 🌵 **4 Obstacle Types** | Cacti, birds, pits, and bouncing turtles — with progressive unlock times |
| 💓 **Heart System** | Collect up to 3 hearts to absorb fatal hits |
| 🎵 **8-Bit Soundtrack** | Retro-style synthesized audio effects and music via Web Audio API |
| 📳 **Screen Shake** | Visual feedback on collisions and boss hits |
| 🏆 **Leaderboard** | Top 3 boss battle times saved to LocalStorage |
| 📱 **Responsive** | Full-screen canvas that adapts to any screen size |
| 🔊 **Sound Toggle** | Click the speaker icon in top-right to mute/unmute |
| ⏸️ **Pause System** | Press P anytime to pause/resume the game |
| ⏱️ **DeltaTime System** | Consistent game speed across different refresh rates |
| 🧪 **Test Suite (Vitest)** | 7 test dosyası, 34 birim testi — oyun mantığı, ses, boss, oyuncu, engeller, UI |
| 🔬 **Görsel Regresyon (Playwright)** | 7 canvas snapshot testi — headless Chromium'da tüm oyun durumlarını doğrular |
| 🛠️ **ESLint + Prettier** | Code quality and formatting tools configured |

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Canvas API** 🎨 | 2D rendering for all game graphics, animations, and visual effects |
| **Web Audio API** 🔊 | 8-bit sound synthesis for jump, shoot, hit, victory, and lightning sounds |
| **LocalStorage** 💾 | Persisting top boss battle completion times across sessions |
| **requestAnimationFrame** 🔄 | Smooth 60 FPS game loop with deltaTime normalization |
| **ES6 Modules** 📜 | Modular JavaScript architecture with clean separation of concerns |
| **Vitest** 🧪 | Unit testing framework for game logic and mechanics |
| **Playwright** 🔬 | Visual regression testing — canvas snapshot comparison |
| **ESLint** 🔍 | Static code analysis and linting |
| **Prettier** ✨ | Consistent code formatting |

---

## 🚀 How to Run

### Option 1: Direct Browser
Simply open the `index.html` file in any modern web browser:

```bash
# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

### Option 2: Local Server (Recommended)
For the best experience with audio, serve via a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: Running Tests

**Birim Testleri (Vitest):**
```bash
npm install
npm test              # 34 birim testini çalıştır
npm run test:watch    # Watch modunda çalıştır
```

**Görsel Regresyon Testleri (Playwright):**
```bash
npx playwright install chromium   # İlk kurulumda bir kere
npm run test:visual               # 7 canvas snapshot testini çalıştır
npm run test:visual-update        # Snapshot'ları güncelle
```

**Tüm testler tek seferde:**
```bash
npm test && npm run test:visual
```

Test sonuçları: [`test-reports/TEST-REPORT.md`](test-reports/TEST-REPORT.md)

### Option 4: Linting & Formatting

```bash
npm run lint      # Check code with ESLint
npm run format    # Auto-format code with Prettier
```

---

## 📂 Project Structure

```
dino-adventure/
├── 📄 index.html          # Main HTML file with canvas and UI overlays
├── 📜 main.js             # Core game engine, game loop, event handling
├── 🎮 player.js           # Dino object, jump, shoot, special attack
├── 👾 boss.js             # Boss object, AI, homing projectiles
├── 🌍 obstacles.js        # Cactus, bird, pit, turtle, hearts, lightning
├── 🖥️ ui.js               # Score board, health bars, overlays, leaderboard
├── 🎵 audio.js            # Web Audio API synthesis, sound effects, music
├── 🧰 utils.js            # Collision detection utility
├── 🎨 style.css           # Styling & animations
├── 🐘 fil1.png            # Elephant boss image
├── 🐢 turtle.png          # Turtle obstacle image
├── 🧪 player.test.js      # Jump, shoot, specialShoot tests
├── 🧪 boss.test.js        # Boss shooting and positioning tests
├── 🧪 obstacles.test.js   # Pit detection, obstacle spawn tests
├── 🧪 audio.test.js       # Sound playback and toggle tests
├── 🧪 gameState.test.js   # Game state transition tests
├── 🧪 ui.test.js          # Leaderboard and localStorage tests
├── 🧪 utils.test.js       # Collision detection tests
├── 🧪 vitest.setup.js     # Test environment mocks (Canvas, Audio, DOM)
├── ⚙️ vitest.config.js    # Vitest configuration (excludes worktrees, Playwright)
├── ⚙️ eslint.config.js    # ESLint flat configuration
├── ⚙️ playwright.config.js # Playwright configuration (headless, 800×600)
├── 🔬 tests/visual/       # Playwright görsel regresyon testleri
│   ├── visual.spec.js     # 7 oyun durumu snapshot testi
│   └── __snapshots__/     # Baseline PNG snapshot'lar
├── 📁 scripts/            # Yardımcı betikler
│   ├── serve.cjs          # Test HTTP sunucusu
│   └── analyze-snapshots.cjs # Snapshot doğrulama
├── 📊 test-reports/       # Test sonuç raporları
│   └── TEST-REPORT.md    # Güncel test sonuçları
├── .prettierrc            # Prettier formatting rules
├── .prettierignore        # Files excluded from formatting
└── 📖 README.md           # This file
```

---

## 🏆 Boss Battle Leaderboard

Your best boss battle times are automatically saved to your browser's LocalStorage!

Top players are displayed on the victory screen with medals:
- 🥇 Gold - 1st place
- 🥈 Silver - 2nd place
- 🥉 Bronze - 3rd place

---

## 🐛 Known Issues / Troubleshooting

| Issue | Solution |
|-------|----------|
| No sound 🔇 | Click anywhere on the page first (browser autoplay policy) |
| Game runs too fast/slow | DeltaTime system normalizes speed; refresh rate shouldn't matter |
| Canvas not responsive | Resize your browser window - game adapts automatically |

---

## 📜 License

MIT License - Feel free to use, modify, and distribute!

---

<div align="center">

**🎮 Happy Gaming! 🦖**

*[Made with JavaScript and Web APIs]*

</div>
