// Navigation : fond au scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Burger menu mobile
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .fade-up').forEach(el => revealObserver.observe(el));

// Smooth scroll sur les ancres (compense la navbar fixe)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

// Onglets Pains / Viennoiseries / Gâteaux
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// Compteurs animés pour les stats
const animateCounter = (el, target, suffix) => {
  const isNumeric = /^\d+(\.\d+)?$/.test(target);
  if (!isNumeric) return;
  const end = parseFloat(target);
  const duration = 1600;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (Number.isInteger(end) ? Math.floor(eased * end) : (eased * end).toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target.querySelector('.stat-number');
    if (!el || el.dataset.animated) return;
    el.dataset.animated = 'true';
    const raw = el.textContent.trim();
    const suffix = raw.replace(/[\d.]/g, '');
    const num = raw.replace(/[^\d.]/g, '');
    if (num) animateCounter(el, num, suffix);
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(el => statsObserver.observe(el));

// Pagination spécialités — 12 items/page desktop (2×6), 6 items/page mobile (1×6)
function initMenuPagination() {
  const isMobile = window.innerWidth <= 1024;
  const pageSize = isMobile ? 6 : 12;

  document.querySelectorAll('.menu-list').forEach(list => {
    const items = Array.from(list.children);
    const pageCount = Math.ceil(items.length / pageSize);

    // Construire le slider avec ses pages
    const slider = document.createElement('div');
    slider.className = 'menu-slider';
    for (let p = 0; p < pageCount; p++) {
      const page = document.createElement('div');
      page.className = 'menu-page';
      items.slice(p * pageSize, (p + 1) * pageSize).forEach(item => page.appendChild(item));
      slider.appendChild(page);
    }
    list.appendChild(slider);

    // Pas de navigation si une seule page
    if (pageCount <= 1) return;

    let current = 0;

    // Envelopper la liste dans .menu-carousel
    const carousel = document.createElement('div');
    carousel.className = 'menu-carousel';
    list.parentNode.insertBefore(carousel, list);
    carousel.appendChild(list);

    // Flèches (absolues, centrées via CSS)
    const prevArrow = document.createElement('button');
    prevArrow.className = 'menu-arrow menu-arrow--prev';
    prevArrow.innerHTML = '&#8592;';
    prevArrow.setAttribute('aria-label', 'Page précédente');
    prevArrow.disabled = true;

    const nextArrow = document.createElement('button');
    nextArrow.className = 'menu-arrow menu-arrow--next';
    nextArrow.innerHTML = '&#8594;';
    nextArrow.setAttribute('aria-label', 'Page suivante');

    carousel.append(prevArrow, nextArrow);

    // Points de pagination en dessous
    const dotsEl = document.createElement('div');
    dotsEl.className = 'menu-dots';
    const dots = Array.from({ length: pageCount }, (_, i) => {
      const d = document.createElement('button');
      d.className = 'menu-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Page ${i + 1}`);
      dotsEl.appendChild(d);
      return d;
    });
    carousel.after(dotsEl);

    function goTo(n) {
      current = n;
      // Translation en % du slider (= 100% de la largeur de .menu-list)
      slider.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      prevArrow.disabled = current === 0;
      nextArrow.disabled = current === pageCount - 1;
    }

    prevArrow.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
    nextArrow.addEventListener('click', () => { if (current < pageCount - 1) goTo(current + 1); });
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Swipe tactile
    let touchX = 0;
    list.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    list.addEventListener('touchend', e => {
      const dx = touchX - e.changedTouches[0].clientX;
      if (dx > 50 && current < pageCount - 1) goTo(current + 1);
      else if (dx < -50 && current > 0) goTo(current - 1);
    }, { passive: true });
  });
}

initMenuPagination();

// Highlight du jour dans les horaires
(function highlightToday() {
  const day = new Date().getDay(); // 0=dim, 1=lun…
  const li = document.querySelector(`.horaires-list li[data-day="${day}"]`);
  if (li) li.classList.add('today');
})();

// Modaux légaux
document.querySelectorAll('.legal-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById(link.dataset.modal).classList.add('open');
  });
});

document.querySelectorAll('.legal-modal').forEach(modal => {
  modal.querySelector('.legal-modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.legal-modal.open').forEach(m => m.classList.remove('open'));
  }
});
