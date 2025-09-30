// nav.js
// Handles sticky navigation and mobile menu (optional future toggle)

const nav = document.querySelector('.sticky-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Future: Add mobile menu toggle
