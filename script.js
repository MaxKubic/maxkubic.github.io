// Počkám, až se načte celý HTML dokument
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-btn');
  const closeBtn = document.getElementById('close-btn');
  const modal = document.getElementById('my-modal');

  // Otevření okna POUZE po kliknutí
  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('is-open');
    });
  }

  // Zavření okna
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('is-open');
    });
  }
});
