(() => {
  const products = window.UBEPARI_PRODUCTS || [];
  const config = window.UBEPARI_CATALOGUE_CONFIG || { whatsappNumber: '' };
  const grid = document.querySelector('#product-grid');
  if (!grid) return;

  const search = document.querySelector('#product-search');
  const count = document.querySelector('#search-status');
  const empty = document.querySelector('#search-empty');
  const brandFilters = document.querySelector('#brand-filters');
  const sort = document.querySelector('#catalogue-sort');
  const compareButton = document.querySelector('#open-compare');
  const compareCount = document.querySelector('#compare-count');
  const selected = new Set();
  let activeBrand = '';
  let activeCategory = '';
  const activeSpecifications = {};
  const filterSpecifications = [
    ['processor', 'Processor family'], ['ram', 'RAM'], ['storage', 'Storage'],
    ['graphics', 'Graphics'], ['display', 'Display size'],
  ];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));

  const brands = [...new Set(products.map((product) => product.brand))];
  const categories = [...new Set(products.map((product) => product.category))];

  function makeEnquiryLink(product) {
    const message = `Hello UBEPARI PC, I'm interested in the ${product.model}. Could you please confirm availability and current pricing?`;
    const phone = String(config.whatsappNumber || '').replace(/\D/g, '');
    const whatsappUrl = phone ? `https://wa.me/${phone}` : 'https://api.whatsapp.com/send';
    return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
  }

  function availabilityLabel(availability) {
    if (availability === 'available') return 'Available';
    if (availability === 'out-of-stock') return 'Out of stock';
    return 'Check availability';
  }

  function formatPrice(product) {
    if (product.price == null) return 'Contact UBEPARI for pricing';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency', currency: product.currency || 'TZS', maximumFractionDigits: 0,
    }).format(product.price);
  }

  function laptopArtwork(product) {
    if (product.image) {
      return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || `${product.brand} ${product.model} laptop`)}" loading="lazy" decoding="async">`;
    }
    return `<div class="catalogue-placeholder" role="img" aria-label="Illustrative laptop placeholder for ${escapeHtml(product.brand)} ${escapeHtml(product.model)}; exact model image pending">
      <svg viewBox="0 0 220 130" aria-hidden="true"><rect x="47" y="17" width="126" height="82" rx="7"/><rect x="53" y="23" width="114" height="70" rx="3"/><path d="M25 104h170l-11 10H37z"/><path d="M91 105h38"/></svg>
      <span>Model image pending</span>
    </div>`;
  }

  function card(product, index) {
    const checked = selected.has(product.id);
    const compareDisabled = selected.size >= 3 && !checked;
    return `<article class="product-card catalogue-card" data-product-id="${escapeHtml(product.id)}">
      <div class="product-image catalogue-product-image">
        ${laptopArtwork(product)}
        <span class="catalogue-brand-chip">${escapeHtml(product.brand)}</span>
        <label class="compare-select" title="Add ${escapeHtml(product.model)} to comparison">
          <input type="checkbox" data-compare-id="${escapeHtml(product.id)}" ${checked ? 'checked' : ''} ${compareDisabled ? 'disabled' : ''} aria-label="Compare ${escapeHtml(product.model)}">
          <span>Compare</span>
        </label>
      </div>
      <div class="product-info catalogue-product-info">
        <span class="product-brand">${escapeHtml(product.brand)} <span aria-hidden="true">·</span> ${escapeHtml(product.category)}</span>
        <h3>${escapeHtml(product.model)}</h3>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="catalogue-status-row"><span class="availability-check"><i aria-hidden="true"></i> ${availabilityLabel(product.availability)}</span><span class="price-contact">${escapeHtml(formatPrice(product))}</span></div>
        <div class="catalogue-card-actions">
          <button class="product-link detail-button" type="button" data-detail-id="${escapeHtml(product.id)}">View details <span aria-hidden="true">↗</span></button>
          <a class="button button-primary ask-button" href="${makeEnquiryLink(product)}" target="_blank" rel="noopener noreferrer">Ask UBEPARI</a>
        </div>
      </div>
    </article>`;
  }

  function renderBrandFilters() {
    const brandButtons = ['All brands', ...brands].map((brand) => {
      const value = brand === 'All brands' ? '' : brand;
      const isActive = activeBrand === value;
      const total = value ? products.filter((product) => product.brand === value).length : products.length;
      return `<button class="filter-chip${isActive ? ' is-active' : ''}" type="button" data-brand-filter="${escapeHtml(value)}" aria-pressed="${isActive}">${escapeHtml(brand)} <span>${total}</span></button>`;
    }).join('');
    const categoryOptions = ['<option value="">All categories</option>', ...categories.map((category) => `<option value="${escapeHtml(category)}" ${activeCategory === category ? 'selected' : ''}>${escapeHtml(category)}</option>`)].join('');
    const specificationFilters = filterSpecifications.map(([key, label]) => {
      const values = [...new Set(products.map((product) => product.specifications?.[key]).filter(Boolean))];
      if (!values.length) return '';
      const options = [`<option value="">All ${escapeHtml(label.toLowerCase())}</option>`, ...values.map((value) => `<option value="${escapeHtml(value)}" ${activeSpecifications[key] === value ? 'selected' : ''}>${escapeHtml(value)}</option>`)].join('');
      return `<label class="category-filter-label" for="filter-${key}">${escapeHtml(label)}<select id="filter-${key}" data-spec-filter="${key}">${options}</select></label>`;
    }).join('');
    brandFilters.innerHTML = `<div class="brand-filter-list" aria-label="Laptop brands">${brandButtons}</div><div class="catalogue-select-filters"><label class="category-filter-label" for="catalogue-category">Category<select id="catalogue-category">${categoryOptions}</select></label>${specificationFilters}</div>`;
  }

  function getMatches() {
    const term = search.value.trim().toLowerCase();
    const matches = products.filter((product) => {
      const specText = Object.values(product.specifications || {}).filter(Boolean).join(' ');
      const searchable = `${product.brand} ${product.model} ${product.category} ${specText}`.toLowerCase();
      return searchable.includes(term)
        && (!activeBrand || product.brand === activeBrand)
        && (!activeCategory || product.category === activeCategory)
        && Object.entries(activeSpecifications).every(([key, value]) => !value || product.specifications?.[key] === value);
    });

    if (sort.value === 'brand') {
      matches.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
    } else {
      matches.sort((a, b) => a.model.localeCompare(b.model));
    }
    return matches;
  }

  function updateCompareControls() {
    compareCount.textContent = String(selected.size);
    compareButton.disabled = selected.size < 2;
    grid.querySelectorAll('[data-compare-id]').forEach((input) => {
      input.disabled = selected.size >= 3 && !selected.has(input.dataset.compareId);
    });
  }

  function render() {
    const matches = getMatches();
    grid.innerHTML = matches.map(card).join('');
    empty.hidden = matches.length > 0;
    count.textContent = `${matches.length} ${matches.length === 1 ? 'model' : 'models'}`;
    renderBrandFilters();
    updateCompareControls();
  }

  function renderSpecificationList(specifications) {
    const labels = [
      ['processor', 'Processor'], ['ram', 'Memory'], ['storage', 'Storage'], ['display', 'Display'],
      ['graphics', 'Graphics'], ['operatingSystem', 'Operating system'], ['weight', 'Weight'], ['battery', 'Battery'],
    ];
    const available = labels.filter(([key]) => specifications?.[key]);
    if (!available.length) return '<p class="detail-spec-note">Exact specifications have not been supplied for this model family.</p>';
    return `<dl class="detail-spec-list">${available.map(([key, label]) => `<div><dt>${label}</dt><dd>${escapeHtml(specifications[key])}</dd></div>`).join('')}</dl>`;
  }

  function openDetails(product) {
    const dialog = document.querySelector('#product-dialog');
    const content = document.querySelector('#product-detail-content');
    content.innerHTML = `<div class="detail-layout">
      <div class="detail-media">${laptopArtwork(product)}</div>
      <div class="detail-copy">
        <p class="eyebrow">${escapeHtml(product.brand)} · ${escapeHtml(product.category)} model family</p>
        <h2 id="detail-title">${escapeHtml(product.model)}</h2>
        <p class="detail-description">${escapeHtml(product.description)}</p>
        <div class="detail-business-status"><span class="availability-check"><i aria-hidden="true"></i> ${availabilityLabel(product.availability)}</span><strong>${escapeHtml(formatPrice(product))}</strong></div>
        <a class="button button-primary" href="${makeEnquiryLink(product)}" target="_blank" rel="noopener noreferrer">Ask UBEPARI about this model <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <section class="detail-specifications" aria-labelledby="technical-specs-title"><p class="eyebrow">Model information</p><h3 id="technical-specs-title">Technical specifications</h3>${renderSpecificationList(product.specifications)}
      <p class="configuration-note">Specifications and configurations may vary. Contact UBEPARI to confirm the exact configuration.</p>
    </section>`;
    dialog.showModal();
    document.title = `${product.model} | Laptop model family | UBEPARI PC`;
    document.querySelector('meta[name="description"]').content = `${product.model} model family. Specifications vary by configuration. Contact UBEPARI PC for current availability and pricing.`;
  }

  const compareFields = [
    ['brand', 'Brand'], ['model', 'Model'], ['processor', 'Processor'], ['ram', 'RAM'], ['storage', 'Storage'],
    ['display', 'Display'], ['graphics', 'Graphics'], ['operatingSystem', 'Operating system'], ['weight', 'Weight'], ['battery', 'Battery'],
  ];

  function openComparison() {
    const list = products.filter((product) => selected.has(product.id));
    const dialog = document.querySelector('#compare-dialog');
    const content = document.querySelector('#compare-content');
    const fields = list.some((product) => product.price != null) ? [...compareFields, ['price', 'Price']] : compareFields;
    content.innerHTML = `<p class="eyebrow">Product comparison</p><h2 id="compare-title">Compare model families</h2><p class="detail-description">Only details supplied and verified for each entry are shown. Model families can have different configurations.</p>
      <div class="comparison-scroll"><table class="comparison-table"><thead><tr><th scope="col">Specification</th>${list.map((product) => `<th scope="col">${escapeHtml(product.model)}</th>`).join('')}</tr></thead><tbody>${fields.map(([key, label]) => `<tr><th scope="row">${label}</th>${list.map((product) => {
        const value = key === 'brand' || key === 'model' ? product[key]
          : key === 'price' ? formatPrice(product)
            : product.specifications?.[key] || 'Varies by configuration';
        return `<td>${escapeHtml(value)}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="configuration-note">Specifications may vary by configuration. Contact UBEPARI to confirm exact product details, stock and pricing.</p>`;
    dialog.showModal();
  }

  function openFinder() {
    const dialog = document.querySelector('#finder-dialog');
    const content = document.querySelector('#finder-content');
    content.innerHTML = `<p class="eyebrow">UBEPARI PC model finder</p><h2 id="finder-title">Find your PC</h2><p class="detail-description">Tell us what matters. The finder will only make a match when verified catalogue information supports it.</p>
      <form class="finder-form" id="finder-form">
        <label>What will you use it for?<select name="use"><option value="">Choose a use</option><option>Business</option><option>Student</option><option>Creator</option><option>Gaming</option><option>Everyday use</option></select></label>
        <label>Device type<select name="device"><option value="">Choose a device</option><option>Laptop</option><option>Desktop</option></select></label>
        <label>Priority<select name="priority"><option value="">Choose a priority</option><option>Portability</option><option>Performance</option><option>Storage</option><option>Graphics</option><option>Budget</option></select></label>
        <button class="button button-primary" type="submit">See next steps</button>
      </form><div class="finder-result" id="finder-result" aria-live="polite"></div>`;
    content.querySelector('#finder-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const device = String(values.get('device') || '');
      const result = content.querySelector('#finder-result');
      const message = device === 'Desktop'
        ? 'This catalogue currently lists laptop model families only. Contact UBEPARI to ask about desktop options.'
        : 'The catalogue does not yet have verified configurations mapped to these preferences, so it cannot make a product recommendation. Browse the listed model families and ask UBEPARI to confirm a suitable configuration.';
      result.innerHTML = `<p>${escapeHtml(message)}</p><a href="https://ubeparipc.com/" target="_blank" rel="noopener noreferrer">Contact UBEPARI <span aria-hidden="true">↗</span></a>`;
    });
    dialog.showModal();
  }

  search.addEventListener('input', render);
  sort.addEventListener('change', render);
  brandFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-brand-filter]');
    if (!button) return;
    activeBrand = button.dataset.brandFilter;
    render();
  });
  brandFilters.addEventListener('change', (event) => {
    if (event.target.id === 'catalogue-category') activeCategory = event.target.value;
    else if (event.target.matches('[data-spec-filter]')) activeSpecifications[event.target.dataset.specFilter] = event.target.value;
    else return;
    render();
  });
  document.querySelector('#clear-catalogue-filters').addEventListener('click', () => {
    activeBrand = '';
    activeCategory = '';
    Object.keys(activeSpecifications).forEach((key) => { delete activeSpecifications[key]; });
    search.value = '';
    sort.value = 'relevant';
    render();
  });
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-detail-id]');
    if (button) {
      const product = products.find((item) => item.id === button.dataset.detailId);
      if (product) openDetails(product);
    }
  });
  grid.addEventListener('change', (event) => {
    const input = event.target.closest('[data-compare-id]');
    if (!input) return;
    const changedId = input.dataset.compareId;
    if (input.checked && selected.size < 3) selected.add(input.dataset.compareId);
    else selected.delete(input.dataset.compareId);
    render();
    grid.querySelectorAll('[data-compare-id]').forEach((checkbox) => {
      if (checkbox.dataset.compareId === changedId) checkbox.focus();
    });
  });
  compareButton.addEventListener('click', openComparison);
  document.querySelector('#open-finder').addEventListener('click', openFinder);
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  document.querySelectorAll('.catalogue-dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (dialog.id !== 'product-dialog') return;
      document.title = 'UBEPARI PC | Technology shapes the future';
      document.querySelector('meta[name="description"]').content = 'UBEPARI PC technology for work, business and everyday digital life.';
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  render();
})();
