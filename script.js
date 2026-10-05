document.getElementById('year').textContent = new Date().getFullYear();

const progress = document.getElementById('progress');
const updateProgress = () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (available > 0 ? window.scrollY / available * 100 : 0) + '%';
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

const canvas = document.getElementById('networkCanvas');
const context = canvas.getContext('2d');
let particles = [];
let animationFrame;

function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: bounds.width < 500 ? 28 : 46 }, () => ({
    x: Math.random() * bounds.width,
    y: Math.random() * bounds.height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: Math.random() * 1.4 + 0.7
  }));
}

function drawNetwork() {
  const bounds = canvas.getBoundingClientRect();
  context.clearRect(0, 0, bounds.width, bounds.height);
  particles.forEach((point, index) => {
    point.x += point.vx;
    point.y += point.vy;
    if (point.x < 0 || point.x > bounds.width) point.vx *= -1;
    if (point.y < 0 || point.y > bounds.height) point.vy *= -1;
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(112, 164, 255, .72)';
    context.fill();
    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 92) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(95, 145, 225, ${(1 - distance / 92) * 0.22})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }
  });
  animationFrame = requestAnimationFrame(drawNetwork);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
sizeCanvas();
if (!reducedMotion.matches) drawNetwork();
window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrame);
  sizeCanvas();
  if (!reducedMotion.matches) drawNetwork();
});
