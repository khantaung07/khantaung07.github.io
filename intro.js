const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = Array.from({ length: 150 }).map(() => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 1.5,
  speed: Math.random() * 0.5 + 0.2,
}));

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
  requestAnimationFrame(animateStars);
}
animateStars();

if (sessionStorage.getItem('introSeen') === 'true') {
  // Skip intro
  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('main-site').style.opacity = 1;
} else {
  // Show intro and wait for click
  const enterBtn = document.getElementById('enter-button');
  enterBtn.addEventListener('click', () => {
    const intro = document.getElementById('intro-screen');
    const site = document.getElementById('main-site');

    intro.style.transition = 'opacity 1s ease';
    intro.style.opacity = 0;

    const beep = document.getElementById('beep-sound');
    beep.currentTime = 0; // rewind if already played
    beep.play();

    setTimeout(() => {
      intro.style.display = 'none';
      site.style.opacity = 1;
      sessionStorage.setItem('introSeen', 'true');
    }, 1000);
  });
}
