(() => {
  const searchInput = document.querySelector('#product-search');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-navigation');

  document.querySelector('.search-toggle').addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.querySelector('.site-header').classList.remove('menu-open');
    searchInput.focus();
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
  });

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    navigation.classList.toggle('is-open', !isExpanded);
    document.querySelector('.site-header').classList.toggle('menu-open', !isExpanded);
  });

  document.addEventListener('keydown', (event) => {
    const menuIsOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (event.key !== 'Escape' || !menuIsOpen) return;

    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.querySelector('.site-header').classList.remove('menu-open');
    menuToggle.focus();
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      document.querySelector('.site-header').classList.remove('menu-open');
    });
  });

  function initTestimonialCarousel() {
    const viewport = document.querySelector('#testimonial-viewport');
    const track = document.querySelector('#testimonial-track');
    const previous = document.querySelector('#testimonial-previous');
    const next = document.querySelector('#testimonial-next');
    const dots = document.querySelector('#testimonial-dots');
    const status = document.querySelector('#testimonial-status');
    if (!viewport || !track || !previous || !next || !dots || !status) return;

    const slides = [...track.querySelectorAll('.testimonial-card')];
    let page = 0;
    let dotCount = 0;
    let pointerStart = null;

    function visibleCount() {
      if (window.matchMedia('(max-width: 680px)').matches) return 1;
      if (window.matchMedia('(max-width: 960px)').matches) return 2;
      return 3;
    }

    function updateCarousel() {
      const visible = visibleCount();
      const pageCount = Math.max(1, Math.ceil(slides.length / visible));
      page = Math.min(page, pageCount - 1);

      if (dotCount !== pageCount) {
        dots.replaceChildren(...Array.from({ length: pageCount }, (_, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'carousel-dot';
          dot.setAttribute('aria-label', `Show testimonial page ${index + 1}`);
          dot.addEventListener('click', () => {
            page = index;
            updateCarousel();
          });
          return dot;
        }));
        dotCount = pageCount;
      }

      const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
      track.style.transform = `translateX(-${page * visible * (slideWidth + gap)}px)`;
      previous.disabled = page === 0;
      next.disabled = page === pageCount - 1;

      [...dots.children].forEach((dot, index) => {
        if (index === page) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      const first = page * visible + 1;
      const last = Math.min((page + 1) * visible, slides.length);
      status.textContent = `Showing testimonials ${first} to ${last} of ${slides.length}`;
    }

    previous.addEventListener('click', () => {
      page = Math.max(0, page - 1);
      updateCarousel();
    });
    next.addEventListener('click', () => {
      page = Math.min(Math.ceil(slides.length / visibleCount()) - 1, page + 1);
      updateCarousel();
    });

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next.click();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous.click();
      } else if (event.key === 'Home') {
        event.preventDefault();
        page = 0;
        updateCarousel();
      } else if (event.key === 'End') {
        event.preventDefault();
        page = Math.ceil(slides.length / visibleCount()) - 1;
        updateCarousel();
      }
    });

    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse') pointerStart = event.clientX;
    });
    viewport.addEventListener('pointerup', (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) > 45) (distance < 0 ? next : previous).click();
    });
    viewport.addEventListener('pointercancel', () => { pointerStart = null; });
    window.addEventListener('resize', updateCarousel, { passive: true });
    updateCarousel();
  }

  initTestimonialCarousel();
})();
