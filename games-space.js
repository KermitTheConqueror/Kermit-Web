const spaceCanvas = document.querySelector('#spaceCanvas');
const spaceContext = spaceCanvas.getContext('2d');
let spaceStars = [];
let spaceShootingStars = [];
let nextSpaceShootingStar = performance.now() + 4000;

function resizeSpace() {
    spaceCanvas.width = innerWidth * devicePixelRatio;
    spaceCanvas.height = innerHeight * devicePixelRatio;
    spaceCanvas.style.width = `${innerWidth}px`;
    spaceCanvas.style.height = `${innerHeight}px`;
    spaceContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    spaceStars = Array.from({ length: Math.max(55, Math.floor(innerWidth / 18)) }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        radius: Math.random() * 1.45 + .35,
        alpha: Math.random() * .5 + .22,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * .018 + .006,
        drift: Math.random() * .035 + .008,
        tint: Math.random() > .82 ? '190,220,255' : '255,255,255'
    }));
}

function drawSpace(now = performance.now()) {
    spaceContext.clearRect(0, 0, innerWidth, innerHeight);
    for (const star of spaceStars) {
        star.phase += star.twinkle;
        star.y -= star.drift;
        if (star.y < -3) star.y = innerHeight + 3;
        spaceContext.beginPath();
        spaceContext.fillStyle = `rgba(${star.tint},${Math.max(.1, star.alpha + Math.sin(star.phase) * .16)})`;
        spaceContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        spaceContext.fill();
    }

    if (now >= nextSpaceShootingStar && spaceShootingStars.length === 0) {
        spaceShootingStars.push({ x: Math.random() * innerWidth * .65, y: Math.random() * innerHeight * .35, life: 1 });
        nextSpaceShootingStar = now + 7000 + Math.random() * 8000;
    }
    spaceShootingStars = spaceShootingStars.filter(star => {
        const trail = spaceContext.createLinearGradient(star.x - 85, star.y - 45, star.x, star.y);
        trail.addColorStop(0, 'rgba(160,205,255,0)');
        trail.addColorStop(1, `rgba(225,240,255,${star.life * .7})`);
        spaceContext.beginPath();
        spaceContext.strokeStyle = trail;
        spaceContext.lineWidth = 1.2;
        spaceContext.moveTo(star.x - 85, star.y - 45);
        spaceContext.lineTo(star.x, star.y);
        spaceContext.stroke();
        star.x += 4.1;
        star.y += 2.1;
        star.life -= .018;
        return star.life > 0;
    });
    requestAnimationFrame(drawSpace);
}

addEventListener('resize', resizeSpace);
resizeSpace();
drawSpace();
