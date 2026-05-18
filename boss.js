// Boss nesnesi
const boss = {
    x: 0,
    y: 0,
    width: 120,
    height: 120,
    health: 30,
    maxHealth: 30,
    shootTimer: 0,
    moveTimer: 0,
    targetY: 0
};

// Gerçekçi fil çiz (Boss) - Görsel veya SVG
function drawElephant(ctx, elephantImage, imagesLoaded, frameCount, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Görsel yüklendiyse kullan
    if (imagesLoaded === 2 && elephantImage.complete) {
        ctx.drawImage(elephantImage, -60, -50, 120, 100);
        
        // Hareket animasyonu
        const legOffset = Math.sin(frameCount * 0.05) * 2;
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(-40 + legOffset, 45, 12, 20);
        ctx.fillRect(-15 - legOffset, 45, 12, 20);
        ctx.fillRect(15 + legOffset, 45, 12, 20);
        ctx.fillRect(40 - legOffset, 45, 12, 20);
    } else {
        // Yedek SVG çizim
        ctx.fillStyle = '#8b7d6b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6b5d4b';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Baş
        ctx.fillStyle = '#9b8d7b';
        ctx.beginPath();
        ctx.arc(-35, -30, 35, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Boss ateş et
function bossShoot(dino, boss, bossBullets) {
    const angle = Math.atan2((dino.y - 30) - (boss.y - 20), dino.x - boss.x);
    bossBullets.push({
        x: boss.x - 60,
        y: boss.y - 20,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6
    });
}

// Boss pozisyonunu canvas boyutuna göre güncelle
function updateBossPosition(boss, canvas, groundY) {
    boss.x = canvas.width - 200;
    boss.y = groundY - 120;
    boss.targetY = groundY - 120;
}

export { boss, drawElephant, bossShoot, updateBossPosition };