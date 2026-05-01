(() => {
  const init = async (sectionEl) => {
    const viewport = sectionEl.querySelector('[data-embla-viewport]');
    const prevButton = sectionEl.querySelector('[data-embla-prev]');
    const nextButton = sectionEl.querySelector('[data-embla-next]');

    if (!viewport || !window.EmblaCarousel) return;

    const embla = window.EmblaCarousel(viewport, {
      align: 'start',
      containScroll: 'trimSnaps',
      loop: false,
    });

    const updateButtons = () => {
      if (prevButton) prevButton.disabled = !embla.canScrollPrev();
      if (nextButton) nextButton.disabled = !embla.canScrollNext();
    };

    if (prevButton) prevButton.addEventListener('click', () => embla.scrollPrev());
    if (nextButton) nextButton.addEventListener('click', () => embla.scrollNext());

    embla.on('select', updateButtons);
    embla.on('reInit', updateButtons);
    updateButtons();
  };

  const initAll = () => {
    document
      .querySelectorAll('[data-featured-products-section-id]')
      .forEach((sectionEl) => init(sectionEl));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }
})();

