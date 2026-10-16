const pageContent = document.getElementById('pageContent');
const pageTransition = document.getElementById('pageTransition');
const navLinks = document.querySelectorAll('.nav-links a, .brand');

navLinks.forEach(link => {
  link.addEventListener('click', async (e) => {
    const href = link.getAttribute('href');
    const dataPage = link.getAttribute('data-page');
    const targetPage = dataPage || href;

    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && targetPage) {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (currentPage === targetPage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.reveal').forEach(el => el.classList.remove('is-visible'));
        setTimeout(() => { initRevealAnimations(); }, 100);
        return;
      }

      e.preventDefault();

      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      if (link.parentElement.classList.contains('nav-links')) {
        link.classList.add('active');
      } else {
        const matchingLink = document.querySelector(`.nav-links a[data-page="${targetPage}"]`);
        if (matchingLink) matchingLink.classList.add('active');
      }

      pageContent.classList.add('loading');
      if (pageTransition) pageTransition.classList.add('active');

      setTimeout(async () => {
        try {
          const response = await fetch(targetPage);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newContent = doc.getElementById('pageContent');

          if (newContent) {
            pageContent.innerHTML = newContent.innerHTML;
            history.pushState({}, '', targetPage);
            window.scrollTo(0, 0);
            initRevealAnimations();

            setTimeout(() => {
              pageContent.classList.remove('loading');
              if (pageTransition) pageTransition.classList.remove('active');
            }, 500);
          }
        } catch (error) {
          console.error('Failed to load page:', error);
          pageContent.classList.remove('loading');
          if (pageTransition) pageTransition.classList.remove('active');
          window.location.href = targetPage;
        }
      }, 400);
    }
  });
});

window.addEventListener('popstate', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const matchingLink = document.querySelector(`.nav-links a[data-page="${currentPage}"]`);
  if (matchingLink) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    matchingLink.classList.add('active');
  }
});

function initRevealAnimations() {
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
}

// Initialize on load
initRevealAnimations();

// Lightbox with event delegation
const lightbox = document.getElementById('screenshotLightbox');
const lightboxTarget = document.getElementById('lightboxTarget');
const lightboxClose = document.getElementById('lightboxClose');

document.addEventListener('click', (e) => {
  const frame = e.target.closest('.frame');
  if (frame && lightbox && lightboxTarget) {
    const img = frame.querySelector('img');
    const placeholder = frame.querySelector('.photo-placeholder-frame');
    
    if (img) {
      const clonedImg = img.cloneNode(true);
      lightboxTarget.innerHTML = '';
      lightboxTarget.appendChild(clonedImg);
      lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    } else if (placeholder) {
      const clonedPlaceholder = placeholder.cloneNode(true);
      lightboxTarget.innerHTML = '';
      lightboxTarget.appendChild(clonedPlaceholder);
      lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }
});

function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove('is-active');
    if (lightboxTarget) lightboxTarget.innerHTML = '';
    document.body.style.overflow = '';
  }
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
