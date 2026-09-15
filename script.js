const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

document.querySelectorAll('.faq-item').forEach((item) => {
  const button = item.querySelector('.faq-question');
  button?.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Branş sayfalarındaki tek görsel penceresi: görseller bu pencere içinde kayar.
document.querySelectorAll('[data-image-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.image-carousel-track');
  const slides = [...carousel.querySelectorAll('.image-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dots span')];
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  if (!track || slides.length < 2) return;

  let index = 0;
  let timer;

  const show = (newIndex) => {
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(() => show(index + 1), 4200);
  };

  prev?.addEventListener('click', () => { show(index - 1); start(); });
  next?.addEventListener('click', () => { show(index + 1); start(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  let startX = null;
  carousel.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  carousel.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const diff = event.clientX - startX;
    if (Math.abs(diff) > 45) show(index + (diff < 0 ? 1 : -1));
    startX = null;
    start();
  });

  show(0);
  start();
});

// Danışan yorumları: üçlü görünüm masaüstünde, yatay kayan kartlar.
document.querySelectorAll('[data-reviews-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('.reviews-viewport');
  const prev = carousel.querySelector('.reviews-prev');
  const next = carousel.querySelector('.reviews-next');
  if (!viewport) return;

  const step = () => Math.max(280, viewport.clientWidth * 0.88);
  const atEnd = () => viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
  const moveNext = () => {
    if (atEnd()) viewport.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    else viewport.scrollBy({ left: step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const movePrev = () => {
    if (viewport.scrollLeft <= 8) viewport.scrollTo({ left: viewport.scrollWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    else viewport.scrollBy({ left: -step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  prev?.addEventListener('click', movePrev);
  next?.addEventListener('click', moveNext);

  let timer;
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(moveNext, 5200);
  };
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  start();
});

// Hafif giriş animasyonları. JS kapalıysa içerik normal görünür.
const revealTargets = document.querySelectorAll('.reveal, .feature, .program-list li, .review-card, .contact-card');
if (!reducedMotion && 'IntersectionObserver' in window) {
  revealTargets.forEach((el) => el.classList.add('reveal-ready'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((el) => observer.observe(el));
}


// Antrenör görseli için hafif 3D tilt + ışık takibi
const coachPortrait = document.querySelector('.trainer-portrait');
if (coachPortrait && !reducedMotion) {
  const resetPortrait = () => {
    coachPortrait.style.setProperty('--rx', '0deg');
    coachPortrait.style.setProperty('--ry', '0deg');
    coachPortrait.style.setProperty('--mx', '50%');
    coachPortrait.style.setProperty('--my', '34%');
  };

  coachPortrait.addEventListener('pointermove', (event) => {
    const rect = coachPortrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rx = ((0.5 - y) * 10).toFixed(2);
    const ry = ((x - 0.5) * 12).toFixed(2);

    coachPortrait.style.setProperty('--rx', `${rx}deg`);
    coachPortrait.style.setProperty('--ry', `${ry}deg`);
    coachPortrait.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    coachPortrait.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  });

  coachPortrait.addEventListener('pointerleave', resetPortrait);
  coachPortrait.addEventListener('pointercancel', resetPortrait);
  resetPortrait();
}
