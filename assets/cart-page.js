class WandCartForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.querySelectorAll('[data-cart-quantity-step]').forEach((button) => {
      button.addEventListener('click', () => this.stepQuantity(button));
    });
  }

  stepQuantity(button) {
    const target = this.querySelector(`[data-cart-quantity="${button.dataset.cartLine}"]`);
    if (!target) return;

    const min = Number(target.min || 0);
    const nextValue = Math.max(min, Number(target.value || 0) + Number(button.dataset.cartQuantityStep || 0));
    target.value = String(nextValue);
    this.form?.requestSubmit();
  }
}

if (!customElements.get('wand-cart-form')) {
  customElements.define('wand-cart-form', WandCartForm);
}
