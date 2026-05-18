// Player modülü - Dinozor ve oyuncu fonksiyonları

// Dinozor nesnesi
const dino = {
    x: 100,
    y: 0, // groundY - 80 olarak ayarlanacak
    width: 70,
    height: 80,
    vx: 0,
    vy: 0,
    jumping: false,
    doubleJumpAvailable: false,
    gravity: 1.2,
    legAngle: 0,
    health: 50,
    maxHealth: 50,
    facingRight: true
};

// Dinozoru çiz (SVG görüntü olarak)
function drawRealDino(ctx, dinoImage, frameCount, heartPowerCount, x, y, scale = 1, dancing = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    if (dancing) {
        const danceOffset = Math.sin(frameCount * 0.2) * 5;
        ctx.translate(0, danceOffset);
        ctx.rotate(Math.sin(frameCount * 0.1) * 0.1);
    }

    // SVG görüntüyü çiz (64x64, merkezli)
    if (dinoImage.complete && dinoImage.naturalWidth > 0) {
        // KALP GÜCÜ AKTIFKEN (sayac > 0) - kırmızı filtre uygula
        if (heartPowerCount > 0) {
            ctx.filter = 'sepia(1) saturate(8) hue-rotate(-50deg) brightness(1.3)';
        }
        
        ctx.drawImage(dinoImage, -32, -48, 64, 64);
        
        // Filtreyi resetle
        ctx.filter = 'none';
        
        // KALP SAYACI GÖSTER (dinazor üzerinde) - kare YOK, sadece sayac
        if (heartPowerCount > 0) {
            ctx.fillStyle = '#ff1744';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('x' + heartPowerCount, 0, -50);
        }
    } else {
        // Yedek: basit kare
        ctx.fillStyle = heartPowerCount > 0 ? '#ff4444' : '#535353';
        ctx.fillRect(-20, -40, 40, 40);
    }

    ctx.restore();
}

// Zıplama (double jump BAŞTAN AKTİF) - YÜKSEK ZıPLAMA
function jump(dino, gameMode, gameStartTime, lastClickTime, isDoubleClick, play8BitSound) {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    const updatedLastClickTime = now;

    // Oyun başladıktan hemen sonra istemsiz zıplamayı engelle
    const timeSinceGameStart = now - gameStartTime;
    if (timeSinceGameStart < 800) {
        return updatedLastClickTime;
    }

    if (gameMode === 'boss') {
        // Boss modunda - 2D zıplama
        if (!dino.jumping || (dino.doubleJumpAvailable && isDoubleClick)) {
            if (dino.jumping && dino.doubleJumpAvailable) {
                dino.vy = -16; // Çift zıplama daha yüksek
                dino.doubleJumpAvailable = false;
                play8BitSound('doubleJump');
            } else {
                dino.jumping = true;
                dino.vy = -20; // YÜKSEK ZıPLAMA
                dino.doubleJumpAvailable = true; // BAŞTAN AKTİF
                play8BitSound('jump');
            }
        }
    } else {
        // Normal mod - DOUBLE JUMP BAŞTAN AKTİF - YÜKSEK
        if (!dino.jumping) {
            dino.jumping = true;
            dino.vy = -20; // YÜKSEK ZıPLAMA (eski -15)
            dino.doubleJumpAvailable = true; // BAŞTAN AKTİF
            play8BitSound('jump');
        } else if (dino.doubleJumpAvailable && timeSinceLastClick < 300) {
            // Havada iken çift tıklama
            dino.vy = -16; // Çift zıplama da yüksek (eski -12)
            dino.doubleJumpAvailable = false;
            play8BitSound('doubleJump');
        }
    }
    
    return updatedLastClickTime;
}

// Ateş et (SOL TIK - normal)
function shoot(dino, gameMode, bullets, play8BitSound) {
    if (gameMode !== 'boss') return;
    
    bullets.push({
        x: dino.x + 35,
        y: dino.y - 30,
        vx: 10,
        vy: 0,
        type: 'normal'
    });
    play8BitSound('shoot');
}

// ÖZEL Q ATEŞ TOPU - bir kere kullanılan, 10 can, daha yavaş
function specialShoot(dino, gameMode, bullets, specialAttackUsed, play8BitSound) {
    if (gameMode !== 'boss' || specialAttackUsed) return { updatedSpecialAttackUsed: specialAttackUsed, message: null };
    
    const updatedSpecialAttackUsed = true;
    bullets.push({
        x: dino.x + 35,
        y: dino.y - 30,
        vx: 5, // DAHA YAVAŞ
        vy: 0,
        type: 'special',
        damage: 10 // 10 CAN VURUR
    });
    play8BitSound('doubleJump'); // Farklı ses
    
    // Mesaj oluştur
    const message = {
        text: '🔥 ÖZEL ATEŞ TOPU!',
        duration: 2000
    };
    
    return { updatedSpecialAttackUsed, message };
}

export { dino, drawRealDino, jump, shoot, specialShoot };