# 🦖 Dino Adventure

[![Game Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/yourusername/dino-adventure)
[![Made with HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Made with JavaScript](https://img.shields.io/badge/JavaScript-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> An action-packed endless runner game with boss battles, power-ups, and epic 8-bit soundtrack! 🎮

---

## 📸 Screenshot

![Game Screenshot](./screenshot-placeholder.png)

*Add your game screenshot here! Replace `screenshot-placeholder.png` with an actual image.*

---

## 🎮 How to Play

### Normal Mode (Runner)
- **🖱️ Click / Space / ↑ Arrow** - Jump
- **🖱️ Double Click** - Double Jump (in mid-air)
- **⏸️ P Key** - Pause/Resume game (works in all modes!)
- **⏱️ Survive** - Avoid cacti, birds, and pits for 2 minutes
- **❤️ Collect Hearts** - Gain extra lives to survive collisions

### Boss Battle Mode
After surviving for 2 minutes, face the mighty **Elephant Boss**! 🐘

- **🖱️ Mouse Move** - Move your dino in 2D space
- **🖱️ Left Click** - Shoot (1 damage per hit)
- **🔥 Q Key** - Fireball Attack (10 damage - one time use)
- **🛡️ E Key** - Shield (7 seconds invincibility)

### Boss Choice System
Before the boss fight, choose your power:
- **🔥 Fireball** - Massive 10 damage attack (use Q)
- **🛡️ Shield** - Temporary invincibility (use E)

---

## 🎯 Game Features

| Feature | Description |
|---------|-------------|
| 🏃 **Endless Runner** | Procedurally generated obstacles with increasing difficulty |
| 🐘 **Boss Battle** | Epic 2D shooter mechanic against the Elephant Boss |
| 🎵 **8-Bit Soundtrack** | Retro-style synthesized audio effects and music |
| 🏆 **Leaderboard** | Top 3 boss battle times saved to LocalStorage |
| 📱 **Responsive** | Full-screen canvas that adapts to any screen size |
| 🔊 **Sound Toggle** | Click the speaker icon in top-right to mute/unmute |
| ⏸️ **Pause System** | Press P anytime to pause/resume the game |
| ⏱️ **DeltaTime System** | Consistent game speed across different refresh rates |

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Canvas API** 🎨 | 2D rendering for all game graphics, animations, and visual effects |
| **Web Audio API** 🔊 | 8-bit sound synthesis for jump, shoot, hit, and victory sounds |
| **LocalStorage** 💾 | Persisting top boss battle completion times across sessions |
| **requestAnimationFrame** 🔄 | Smooth 60 FPS game loop with deltaTime normalization |
| **ES6+ JavaScript** 📜 | Modern JavaScript features for clean, modular code |

---

## 🚀 How to Run

### Option 1: Direct Browser (Easiest)
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

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 3: GitHub Pages 🌐
Deploy to GitHub Pages for instant online access:

1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Visit: `https://yourusername.github.io/dino-adventure`

**Live Demo:** [Play Now!](https://yourusername.github.io/dino-adventure) *(Replace with your actual link)*

---

## 📂 Project Structure

```
dino-adventure/
├── 📄 index.html          # Main HTML file
├── 📜 main.js             # Game logic & engine (all-in-one)
├── 🎨 style.css           # Styling & animations
└── 📖 README.md           # This file
```

---

## 🎵 Audio Controls

- 🔊 **Click the speaker icon** (top-right corner) to toggle sound
- 🎶 Background music plays during normal mode
- 🔊 Sound effects for: Jump, Shoot, Hit, Victory, Game Over

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
| Game runs too fast/slow | DeltaTime system normalizes speed; check your monitor refresh rate |
| Canvas not responsive | Resize your browser window - game adapts automatically |

---

## 🔮 Future Enhancements

- [ ] Mobile touch controls
- [ ] Multiple boss types
- [ ] Power-up items during runner mode
- [ ] Multiplayer mode
- [ ] Achievement system

---

## 📜 License

MIT License - Feel free to use, modify, and distribute! 🎉

---

## 🙏 Acknowledgments

- Inspired by the classic Chrome Dino game 🦕
- 8-bit audio design inspired by retro NES games 🎮
- Built with love and lots of ☕

---

## 📝 Development Notes

**This project was developed using the Vibe Coding approach with Windsurf.** 🌊

Vibe Coding is an AI-assisted development methodology where the developer and AI collaborate in a conversational flow, iterating rapidly to build functional software. This game was created through iterative prompt engineering and rapid prototyping using the Windsurf IDE.

---

<div align="center">

**🎮 Happy Gaming! 🦖**

*[Made with 💚 and JavaScript]*

</div>
