// audio.js - Ses Sistemi Modülü
// Tüm ses ve müzik fonksiyonlarını içerir

const AudioContext = window.AudioContext || window.webkitAudioContext;
export const audioCtx = new AudioContext();

let bgMusicInterval;
let soundEnabled = true;

// İç yardımcı fonksiyon
function playVictoryMusic() {
    const notes = [262, 294, 330, 349, 392, 440, 494, 523];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        }, i * 150);
    });
}

export function play8BitSound(type) {
    if (!soundEnabled) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch(type) {
        case 'jump':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'doubleJump':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
        case 'shoot':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'hit':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'bossHit':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(80, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'victory':
            playVictoryMusic();
            break;
        case 'gameover':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;
        case 'powerup':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
        case 'lightning':
            playLightningSound();
            break;
    }
}

// Yıldırım güçlendirme ses efekti - 3 saniyelik hızlı tempolu melodi
export function playLightningSound() {
    if (!soundEnabled) return;
    
    const melody = [
        523, 659, 784, 1047, 784, 659, 523, 659,
        784, 1047, 1319, 1047, 784, 659, 523, 392,
        523, 659, 784, 1047, 1319, 1568, 1319, 1047
    ];
    const noteDuration = 125; // Her nota 125ms → 24 nota = 3 saniye
    
    melody.forEach((freq, i) => {
        const startTime = audioCtx.currentTime + (i * noteDuration) / 1000;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration / 1000 * 0.9);
        osc.start(startTime);
        osc.stop(startTime + noteDuration / 1000);
    });
}

export function toggleSound(gameRunning, gameMode) {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
        stopBackgroundMusic();
    } else if (gameRunning && gameMode !== 'victory') {
        startBackgroundMusic(gameRunning, gameMode);
    }
    return soundEnabled;
}

export function drawSoundIcon(ctx, canvas, soundEnabled) {
    const iconX = canvas.width - 50;
    const iconY = 30;
    const size = 30;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(iconX, iconY, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = soundEnabled ? '#90EE90' : '#ff6b6b';
    ctx.strokeStyle = soundEnabled ? '#90EE90' : '#ff6b6b';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(iconX - 8, iconY - 6);
    ctx.lineTo(iconX - 2, iconY - 6);
    ctx.lineTo(iconX + 4, iconY - 10);
    ctx.lineTo(iconX + 4, iconY + 10);
    ctx.lineTo(iconX - 2, iconY + 6);
    ctx.lineTo(iconX - 8, iconY + 6);
    ctx.closePath();
    ctx.fill();

    if (soundEnabled) {
        ctx.beginPath();
        ctx.arc(iconX + 4, iconY, 4, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(iconX + 4, iconY, 8, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
    } else {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(iconX + 8, iconY - 6);
        ctx.lineTo(iconX + 12, iconY + 6);
        ctx.stroke();
    }
}

export function startBackgroundMusic(gameRunning, gameMode) {
    if (bgMusicInterval) clearInterval(bgMusicInterval);
    if (!soundEnabled) return;
    const melody = [330, 392, 523, 392, 330, 294, 330, 392];
    let noteIndex = 0;

    bgMusicInterval = setInterval(() => {
        if (!gameRunning || gameMode === 'victory') return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.value = melody[noteIndex];
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);

        noteIndex = (noteIndex + 1) % melody.length;
    }, 500);
}

export function stopBackgroundMusic() {
    clearInterval(bgMusicInterval);
}
