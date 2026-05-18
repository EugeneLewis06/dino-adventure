// Çarpışma kontrolü fonksiyonu - ES6 Modülü
// Bu fonksiyon AABB (Axis-Aligned Bounding Box) çarpışma kontrolü yapar

export function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + (obj1.width || 10) > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + (obj1.height || 10) > obj2.y;
}
