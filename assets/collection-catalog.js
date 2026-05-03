if (!customElements.get('collection-catalog-filters')) {
  class CollectionCatalogFilters extends HTMLElement {
    connectedCallback() {
      this.abortController = new AbortController();
      this.abortFetchController = null;
      this.debouncedAjaxUpdate = this.debounce((url) => this.renderFromUrl(url), 350);

      this.bindEvents();
      this.syncAllRangeGroups();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.abortFetchController?.abort();
    }

    bindEvents() {
      const { signal } = this.abortController;

      this.addEventListener('change', (event) => this.handleChange(event), { signal });
      this.addEventListener('input', (event) => this.handleInput(event), { signal });
      this.addEventListener('submit', (event) => this.handleSubmit(event), { signal });
      this.addEventListener('click', (event) => this.handleClick(event), { signal });

      window.addEventListener(
        'popstate',
        () => {
          this.renderFromUrl(window.location.href, { updateHistory: false });
        },
        { signal }
      );
    }

    handleChange(event) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      if (target.matches('[data-collection-sort]')) {
        event.preventDefault();
        this.renderFromUrl(this.urlFromForm(target.form));
        return;
      }

      if (target.matches('input[type="checkbox"]') && target.closest('[data-collection-filter-form]')) {
        event.preventDefault();
        this.renderFromUrl(this.urlFromForm(target.form));
      }
    }

    handleInput(event) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      if (target.matches('[data-price-range-slider]')) {
        const group = target.closest('[data-price-range-group]');
        if (!group) return;
        this.syncRangeGroup(group, target.dataset.priceRangeSlider);
        this.debouncedAjaxUpdate(this.urlFromForm(target.form));
        return;
      }

      if (target.matches('[data-price-range-input]')) {
        const group = target.closest('[data-price-range-group]') || target.form?.querySelector('[data-price-range-group]');
        if (!group) return;
        this.syncRangeGroup(group, target.dataset.priceRangeInput, true);
        this.debouncedAjaxUpdate(this.urlFromForm(target.form));
      }
    }

    handleSubmit(event) {
      const form = event.target;

      if (!(form instanceof HTMLFormElement) || !form.matches('[data-collection-filter-form]')) return;

      event.preventDefault();
      this.renderFromUrl(this.urlFromForm(form));
    }

    handleClick(event) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const openButton = target.closest(`[data-open-collection-filters="${this.dataset.sectionId}"]`);
      const closeButton = target.closest(`[data-close-collection-filters="${this.dataset.sectionId}"]`);
      const ajaxLink = target.closest('[data-collection-ajax-link]');
      const overlay = target.closest(`#CollectionFilterOverlay-${this.dataset.sectionId}`);

      if (openButton) {
        event.preventDefault();
        this.openDrawer();
        return;
      }

      if (closeButton || overlay) {
        event.preventDefault();
        this.closeDrawer();
        return;
      }

      if (ajaxLink instanceof HTMLAnchorElement) {
        event.preventDefault();
        this.renderFromUrl(ajaxLink.href);
      }
    }

    urlFromForm(form) {
      const url = new URL(form?.action || window.location.href, window.location.origin);
      const params = new URLSearchParams(new FormData(form));

      [...params.entries()].forEach(([key, value]) => {
        if (value === '') {
          params.delete(key);
        }
      });

      url.search = params.toString();
      return url.toString();
    }

    async renderFromUrl(url, options = {}) {
      const { updateHistory = true } = options;
      const requestUrl = new URL(url, window.location.origin);

      this.abortFetchController?.abort();
      this.abortFetchController = new AbortController();
      this.setLoading(true);

      try {
        const response = await fetch(requestUrl.toString(), {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          signal: this.abortFetchController.signal,
        });

        if (!response.ok) throw new Error(`Collection request failed: ${response.status}`);

        const html = await response.text();
        const nextDocument = new DOMParser().parseFromString(html, 'text/html');
        const nextCatalog = nextDocument.querySelector(`collection-catalog-filters[data-section-id="${this.dataset.sectionId}"]`);

        if (!nextCatalog) {
          window.location.href = requestUrl.toString();
          return;
        }

        this.innerHTML = nextCatalog.innerHTML;
        this.dataset.currencyCode = nextCatalog.dataset.currencyCode || this.dataset.currencyCode;
        this.syncAllRangeGroups();
        this.closeDrawer();

        if (updateHistory) {
          window.history.pushState({}, '', requestUrl.toString());
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          window.location.href = requestUrl.toString();
        }
      } finally {
        this.setLoading(false);
      }
    }

    setLoading(isLoading) {
      this.toggleAttribute('aria-busy', isLoading);
      this.querySelector('[data-collection-results]')?.classList.toggle('opacity-60', isLoading);
      this.querySelector('[data-collection-results]')?.classList.toggle('pointer-events-none', isLoading);
    }

    openDrawer() {
      const drawer = this.querySelector(`#CollectionFilterDrawer-${this.dataset.sectionId}`);
      const overlay = this.querySelector(`#CollectionFilterOverlay-${this.dataset.sectionId}`);

      if (!drawer || !overlay) return;

      drawer.classList.add('open');
      overlay.classList.add('open');

      if (this.dataset.lockBodyScroll === 'true') {
        document.body.style.overflow = 'hidden';
      }
    }

    closeDrawer() {
      const drawer = this.querySelector(`#CollectionFilterDrawer-${this.dataset.sectionId}`);
      const overlay = this.querySelector(`#CollectionFilterOverlay-${this.dataset.sectionId}`);

      if (!drawer || !overlay) return;

      drawer.classList.remove('open');
      overlay.classList.remove('open');

      if (this.dataset.lockBodyScroll === 'true') {
        document.body.style.overflow = '';
      }
    }

    syncAllRangeGroups() {
      this.querySelectorAll('[data-price-range-group]').forEach((group) => {
        this.syncRangeGroup(group);
      });
    }

    syncRangeGroup(group, changedControl = null, fromInput = false) {
      const minBound = Number.parseFloat(group.dataset.rangeMin || 0);
      const maxBound = Number.parseFloat(group.dataset.rangeMax || 0);
      const minSlider = group.querySelector('[data-price-range-slider="min"]');
      const maxSlider = group.querySelector('[data-price-range-slider="max"]');
      const minInput = group.parentElement?.querySelector('[data-price-range-input="min"]');
      const maxInput = group.parentElement?.querySelector('[data-price-range-input="max"]');
      const minOutput = group.querySelector('[data-price-range-output="min"]');
      const maxOutput = group.querySelector('[data-price-range-output="max"]');
      const track = group.querySelector('[data-price-range-track]');

      if (!minSlider || !maxSlider || !minInput || !maxInput || !track) return;

      let minValue = Number.parseFloat(fromInput ? minInput.value : minSlider.value);
      let maxValue = Number.parseFloat(fromInput ? maxInput.value : maxSlider.value);

      if (Number.isNaN(minValue)) minValue = minBound;
      if (Number.isNaN(maxValue)) maxValue = maxBound;

      minValue = Math.max(minBound, Math.min(minValue, maxBound));
      maxValue = Math.max(minBound, Math.min(maxValue, maxBound));

      if (changedControl === 'min' && minValue > maxValue) {
        maxValue = minValue;
      } else if (changedControl === 'max' && maxValue < minValue) {
        minValue = maxValue;
      } else if (minValue > maxValue) {
        maxValue = minValue;
      }

      minSlider.value = String(minValue);
      maxSlider.value = String(maxValue);
      minInput.value = String(minValue);
      maxInput.value = String(maxValue);

      if (minOutput) minOutput.textContent = this.formatMoney(minValue);
      if (maxOutput) maxOutput.textContent = this.formatMoney(maxValue);

      const range = maxBound - minBound || 1;
      const minPercent = ((minValue - minBound) / range) * 100;
      const maxPercent = ((maxValue - minBound) / range) * 100;

      track.style.left = `${minPercent}%`;
      track.style.width = `${Math.max(maxPercent - minPercent, 0)}%`;
    }

    debounce(callback, wait) {
      let timeoutId;

      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), wait);
      };
    }

    formatMoney(amount) {
      const numericAmount = Number.parseFloat(amount || 0);
      const currencyCode = this.dataset.currencyCode || 'USD';

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
      }).format(numericAmount);
    }
  }

  customElements.define('collection-catalog-filters', CollectionCatalogFilters);
}
