class WandProductGallery extends HTMLElement {
  connectedCallback() {
    this.mainImage = this.querySelector('[data-product-gallery-main]');
    this.thumbnailButtons = [...this.querySelectorAll('[data-product-gallery-thumbnail]')];
    this.thumbnailButtons.forEach((button) => {
      button.addEventListener('click', () => this.selectImage(button));
    });
  }

  selectImage(button) {
    if (!this.mainImage) return;

    this.mainImage.src = button.dataset.imageUrl || this.mainImage.src;
    this.mainImage.srcset = button.dataset.imageSrcset || '';
    this.mainImage.alt = button.dataset.imageAlt || this.mainImage.alt;

    this.thumbnailButtons.forEach((thumbnail) => {
      thumbnail.classList.toggle('border-brand-gold', thumbnail === button);
      thumbnail.classList.toggle('border-brand-sand/50', thumbnail !== button);
      thumbnail.setAttribute('aria-current', thumbnail === button ? 'true' : 'false');
    });
  }
}

class WandProductForm extends HTMLElement {
  connectedCallback() {
    const variantsJson = this.querySelector('script[type="application/json"]')?.textContent || '[]';

    try {
      this.variants = JSON.parse(variantsJson);
    } catch (_error) {
      this.variants = [];
    }

    this.variantInput = this.querySelector('[data-product-variant-id]');
    this.price = this.querySelector('[data-product-price]');
    this.comparePrice = this.querySelector('[data-product-compare-price]');
    this.saleBadge = this.querySelector('[data-product-sale-badge]');
    this.inventory = this.querySelector('[data-product-inventory]');
    this.addButtons = [...this.querySelectorAll('[data-product-submit]')];
    this.quantityInput = this.querySelector('[data-product-quantity]');

    this.querySelectorAll('[data-product-option]').forEach((field) => {
      field.addEventListener('change', () => this.syncVariant());
      field.addEventListener('click', () => this.syncVariant());
    });

    this.querySelectorAll('[data-quantity-step]').forEach((button) => {
      button.addEventListener('click', () => this.stepQuantity(Number(button.dataset.quantityStep)));
    });

    this.syncVariant();
  }

  selectedOptions() {
    const optionGroups = [...this.querySelectorAll('[data-product-option-index]')];

    return optionGroups.map((group) => {
      const checkedInput = group.querySelector('input[data-product-option]:checked');
      const select = group.querySelector('select[data-product-option]');
      return checkedInput?.value || select?.value || '';
    });
  }

  syncVariant() {
    if (!this.variants.length) return;

    const selected = this.selectedOptions();
    const variant = this.variants.find((item) => {
      return selected.every((value, index) => item.options[index] === value);
    });

    if (!variant) {
      this.setUnavailable();
      return;
    }

    if (this.variantInput) this.variantInput.value = variant.id;
    if (this.price) this.price.textContent = this.formatMoney(variant.price);

    if (this.comparePrice) {
      const showCompare = variant.compare_at_price && variant.compare_at_price > variant.price;
      this.comparePrice.textContent = showCompare ? this.formatMoney(variant.compare_at_price) : '';
      this.comparePrice.classList.toggle('hidden', !showCompare);

      if (this.saleBadge) {
        this.saleBadge.classList.toggle('hidden', !showCompare);
        if (showCompare) this.saleBadge.textContent = this.saleBadge.dataset.label;
      }
    }

    if (this.inventory) {
      this.inventory.textContent = variant.available ? this.inventory.dataset.inStockLabel : this.inventory.dataset.soldOutLabel;
      this.inventory.classList.toggle('text-brand-forest', variant.available);
      this.inventory.classList.toggle('text-red-500', !variant.available);
    }

    this.addButtons.forEach((button) => {
      button.disabled = !variant.available;
      button.classList.toggle('cursor-not-allowed', !variant.available);
    });
  }

  setUnavailable() {
    if (this.variantInput) this.variantInput.value = '';
    this.addButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add('cursor-not-allowed');
    });
  }

  stepQuantity(step) {
    if (!this.quantityInput || !step) return;

    const min = Number(this.quantityInput.min || 1);
    const current = Number(this.quantityInput.value || min);
    this.quantityInput.value = Math.max(min, current + step);
  }

  formatMoney(cents) {
    const amount = Number(cents || 0) / 100;
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: this.dataset.currencyCode || 'USD',
    }).format(amount);
  }
}

class WandProductTabs extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-product-tab-button]')];
    this.panels = [...this.querySelectorAll('[data-product-tab-panel]')];
    this.buttons.forEach((button) => {
      button.addEventListener('click', () => this.activate(button.dataset.productTabButton));
    });
  }

  activate(tabId) {
    this.buttons.forEach((button) => {
      const active = button.dataset.productTabButton === tabId;
      button.classList.toggle('text-brand-forest', active);
      button.classList.toggle('border-brand-gold', active);
      button.classList.toggle('font-semibold', active);
      button.classList.toggle('text-brand-muted', !active);
      button.classList.toggle('border-transparent', !active);
      button.classList.toggle('font-medium', !active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    this.panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.productTabPanel !== tabId);
    });
  }
}

if (!customElements.get('wand-product-gallery')) {
  customElements.define('wand-product-gallery', WandProductGallery);
}

if (!customElements.get('wand-product-form')) {
  customElements.define('wand-product-form', WandProductForm);
}

if (!customElements.get('wand-product-tabs')) {
  customElements.define('wand-product-tabs', WandProductTabs);
}
