// ui.js - Kullanıcı Arayüzü Modülü
// DOM elementleri ve UI fonksiyonları

// DOM Elementleri
export const scoreBoard = document.getElementById('scoreBoard');
export const playerHealthDiv = document.getElementById('playerHealth');
export const bossHealthDiv = document.getElementById('bossHealth');
export const bossHealthBar = document.getElementById('bossHealthBar');
export const bossHealthFill = document.getElementById('bossHealthFill');
export const gameOverScreen = document.getElementById('gameOver');
export const startMessage = document.getElementById('startMessage');
export const victoryMessage = document.getElementById('victoryMessage');
export const loadingMessage = document.getElementById('loadingMessage');

// Loading mesajını gizle
export function hideLoadingMessage() {
    loadingMessage.style.display = 'none';
}

// Skor tablosunu güncelle
export function updateScoreBoard(gameMode, gameTime, targetTime = 120) {
    const targetMinutes = Math.floor(targetTime / 60);
    const targetStr = `${targetMinutes}:${String(targetTime % 60).padStart(2, '0')}`;
    if (gameMode === 'normal') {
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        scoreBoard.textContent = `SURE: ${timeStr} / ${targetStr}`;
    } else if (gameMode === 'boss') {
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        scoreBoard.textContent = `SÜRE: ${timeStr} / ${targetStr} | Hedef: Boss`;
        scoreBoard.style.fontSize = '20px';
    }
}

// Oyun başlangıcı UI
export function resetUI() {
    scoreBoard.textContent = 'SÜRE: 0:00 / 2:00 | Hedef: Boss';
    playerHealthDiv.textContent = 'CAN: 50';
    playerHealthDiv.style.display = 'none';
    bossHealthDiv.style.display = 'none';
    bossHealthBar.style.display = 'none';
    bossHealthFill.style.width = '100%';
    gameOverScreen.style.display = 'none';
    victoryMessage.style.display = 'none';
    startMessage.style.display = 'none';
}

// Boss savaşı UI başlangıcı
export function showBossUI(dinoHealth) {
    playerHealthDiv.style.display = 'block';
    bossHealthDiv.style.display = 'block';
    bossHealthBar.style.display = 'block';
    bossHealthFill.style.width = '100%';
    playerHealthDiv.textContent = `CAN: ${dinoHealth}`;
}

// Boss can barını güncelle
export function updateBossHealth(bossHealth, bossMaxHealth) {
    bossHealthFill.style.width = (bossHealth / bossMaxHealth * 100) + '%';
}

// Oyuncu canını güncelle
export function updatePlayerHealth(dinoHealth) {
    playerHealthDiv.textContent = `CAN: ${dinoHealth}`;
}

// Boss savaşı sonu UI temizliği
export function hideBossUI() {
    playerHealthDiv.style.display = 'none';
    bossHealthDiv.style.display = 'none';
    bossHealthBar.style.display = 'none';
}

// Oyun bitti ekranı
export function showGameOver() {
    gameOverScreen.style.display = 'block';
}

// Oyun bitti ekranını gizle
export function hideGameOver() {
    gameOverScreen.style.display = 'none';
}

// ── DEBUG UI ────────────────────────────────────────────────────────────────
let debugPanel = null;

// Paneli DOM'dan kaldır ve closure değişkenini sıfırla
export function removeDebugUI() {
    if (debugPanel) {
        debugPanel.remove();
        debugPanel = null;
    }
}

// Debug panelini oluştur veya güncelle
// fps: sayısal FPS değeri, errors: [{ time: string, message: string }]
export function updateDebugUI(fps, errors) {
    // Panel DOM'da yoksa veya null ise yeniden oluştur
    if (!debugPanel || !document.getElementById('debugPanel')) {
        debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        document.body.appendChild(debugPanel);
    }

    const fpsColor = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffaa00' : '#ff0000';
    const errorCount = errors.length;

    debugPanel.innerHTML = `
        <div style="
            position:fixed;
            bottom:10px;
            left:10px;
            background:rgba(0,0,0,0.85);
            color:#00ff00;
            font-family:monospace;
            font-size:13px;
            padding:10px 14px;
            border-radius:6px;
            border:1px solid #00ff00;
            z-index:9999;
            min-width:220px;
            line-height:1.6;
            pointer-events:none;
        ">
            <div style="font-weight:bold;font-size:14px;border-bottom:1px solid #00ff00;margin-bottom:6px;padding-bottom:4px;">
                🐛 DEBUG MODU
            </div>
            <div>
                FPS: <span style="color:${fpsColor};font-weight:bold;">${fps}</span>
            </div>
            <div>
                Hata Sayısı: <span style="color:${errorCount > 0 ? '#ff4444' : '#00ff00'};font-weight:bold;">${errorCount}</span>
            </div>
            ${errorCount > 0 ? `
                <div style="margin-top:8px;border-top:1px solid #333;padding-top:6px;">
                    ${errors.map(e => `<div style="color:#ff8888;">[${e.time}] ${e.message}</div>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Boss upgrade ekranını göster
export function showBossUpgradeScreen(onChoiceSelected) {
    let upgradeDiv = document.getElementById('bossUpgradeScreen');
    if (!upgradeDiv) {
        upgradeDiv = document.createElement('div');
        upgradeDiv.id = 'bossUpgradeScreen';
        upgradeDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#2d5016,#4a7c2a);padding:30px;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.5);z-index:500;text-align:center;color:white;min-width:400px;';
        document.body.appendChild(upgradeDiv);
    }
    
    upgradeDiv.innerHTML = `
        <h2 style="margin:0 0 20px 0;font-size:32px;text-shadow:2px 2px 4px rgba(0,0,0,0.5);">🎉 BOSS SAVAŞI! 🎉</h2>
        <p style="font-size:16px;margin:10px 0 20px 0;opacity:0.9;">BOSS'a karşı hangi gücü kullanmak istersin?<br>Sadece birini seçebilirsin!</p>
        
        <div style="display:flex;flex-direction:column;gap:15px;align-items:center;">
            <label style="display:flex;align-items:center;gap:15px;padding:15px;background:rgba(255,100,50,0.2);border:2px solid #ff6347;border-radius:10px;cursor:pointer;transition:all 0.3s;width:100%;">
                <input type="radio" name="bossChoice" value="fireball" style="width:24px;height:24px;cursor:pointer;">
                <div style="text-align:left;">
                    <div style="font-weight:bold;font-size:18px;color:#ff6347;">🔥 ATEŞ TOPU</div>
                    <div style="font-size:14px;opacity:0.9;">BOSS'tan 10 can götürür!<br><small>(Q tuşu ile kullan)</small></div>
                </div>
            </label>
            
            <label style="display:flex;align-items:center;gap:15px;padding:15px;background:rgba(100,150,255,0.2);border:2px solid #6496ff;border-radius:10px;cursor:pointer;transition:all 0.3s;width:100%;">
                <input type="radio" name="bossChoice" value="shield" style="width:24px;height:24px;cursor:pointer;">
                <div style="text-align:left;">
                    <div style="font-weight:bold;font-size:18px;color:#6496ff;">🛡️ KALKAN</div>
                    <div style="font-size:14px;opacity:0.9;">7 saniye hasar almazsın!<br><small>(E tuşu ile aktif et)</small></div>
                </div>
            </label>
        </div>
        
        <button id="startBossBtn" style="margin-top:25px;padding:15px 40px;font-size:20px;background:#FFD700;color:#2d5016;border:none;border-radius:10px;cursor:pointer;font-weight:bold;box-shadow:0 5px 15px rgba(0,0,0,0.3);transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">BOSS'A GİT!</button>
    `;
    
    upgradeDiv.style.display = 'block';
    
    // Buton tıklama
    document.getElementById('startBossBtn').addEventListener('click', () => {
        const selectedChoice = document.querySelector('input[name="bossChoice"]:checked');
        
        if (!selectedChoice) {
            alert('Lütfen bir güç seç! (Ateş Topu veya Kalkan)');
            return;
        }
        
        const choice = selectedChoice.value;
        upgradeDiv.style.display = 'none';
        onChoiceSelected(choice);
    });
}
