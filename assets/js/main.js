(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const old = button.textContent;
      try {
        await navigator.clipboard.writeText(target.innerText.trim());
        button.textContent = 'Copied';
      } catch (error) {
        console.warn('Copy failed', error);
        button.textContent = 'Copy failed';
      }

      setTimeout(() => {
        button.textContent = old;
      }, 1400);
    });
  });
}());
