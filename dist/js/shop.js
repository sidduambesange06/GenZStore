/**
 * GENZSTORE - Shop Catalog Engine
 * Real-time dual-filtering (gender + category + search), sorting, and view toggle
 */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('catalog-products');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const initialCards = [...cards];
  const counter = document.getElementById('item-counter');
  const searchInput = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('sort-select');

  let activeGender = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  const parsePrice = card => parseInt(card.querySelector('.product-price')?.textContent.replace(/\D/g, '') || 0, 10);

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const matchGender = activeGender === 'all' || card.dataset.gender === activeGender;
      const matchCat = activeCategory === 'all' || card.dataset.category === activeCategory;
      const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const matchSearch = !searchQuery || title.includes(searchQuery);

      const matches = matchGender && matchCat && matchSearch;
      card.style.display = matches ? 'flex' : 'none';
      if (matches) visible++;
    });

    if (counter) counter.textContent = `Showing ${visible} of ${cards.length} items`;

    // Keep URL parameter synchronized
    const url = new URL(window.location);
    if (activeGender === 'all') url.searchParams.delete('gender');
    else url.searchParams.set('gender', activeGender);
    if (activeCategory === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', activeCategory);
    window.history.replaceState({}, '', url);
  }

  function setGender(val) {
    activeGender = val || 'all';
    document.querySelectorAll('.gender-pill').forEach(p => {
      p.classList.toggle('active', (p.dataset.gender || 'all') === activeGender);
    });
    // Dynamically update navbar active underline to match
    document.querySelectorAll('.desktop-nav .nav-link').forEach(l => l.classList.remove('is-active'));
    if (activeGender === 'women') {
      document.querySelectorAll('.desktop-nav a[href*="gender=women"]').forEach(l => l.classList.add('is-active'));
    } else if (activeGender === 'men') {
      document.querySelectorAll('.desktop-nav a[href*="gender=men"]').forEach(l => l.classList.add('is-active'));
    } else {
      document.querySelectorAll('.desktop-nav a[href="shop.html"]').forEach(l => l.classList.add('is-active'));
    }
    // Check if current category has items for new gender; if not, reset category to 'all'
    const hasCategoryMatch = cards.some(c => 
      (activeGender === 'all' || c.dataset.gender === activeGender) &&
      (activeCategory === 'all' || c.dataset.category === activeCategory)
    );
    if (!hasCategoryMatch) {
      setCategory('all');
    } else {
      applyFilters();
    }
  }

  function setCategory(val) {
    activeCategory = val || 'all';
    document.querySelectorAll('.cat-pill').forEach(p => {
      p.classList.toggle('active', (p.dataset.category || 'all') === activeCategory);
    });
    applyFilters();
  }

  // Pill click handlers
  document.querySelectorAll('.gender-pill').forEach(pill => {
    pill.addEventListener('click', () => setGender(pill.dataset.gender));
  });

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => setCategory(pill.dataset.category));
  });

  // Intercept navbar Women / Men / Shop All links so they switch without page flicker
  document.querySelectorAll('a[href*="shop.html"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.includes('gender=women')) {
        e.preventDefault();
        setGender('women');
      } else if (href.includes('gender=men')) {
        e.preventDefault();
        setGender('men');
      } else if (href === 'shop.html' || href === 'shop.html?gender=all') {
        e.preventDefault();
        setGender('all');
      }
    });
  });

  // Search input
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    applyFilters();
  });

  // Sort selector
  sortSelect?.addEventListener('change', () => {
    const val = sortSelect.value;
    const sorted = val === 'price-asc' ? [...cards].sort((a, b) => parsePrice(a) - parsePrice(b))
                 : val === 'price-desc' ? [...cards].sort((a, b) => parsePrice(b) - parsePrice(a))
                 : initialCards;
    grid.append(...sorted);
  });

  // View switchers (2-col vs 4-col)
  const view2 = document.getElementById('view-2col');
  const view4 = document.getElementById('view-4col');
  const setCols = (add, remove, activeBtn, inactiveBtn) => {
    grid.classList.add(add);
    grid.classList.remove(remove);
    activeBtn?.classList.add('active');
    inactiveBtn?.classList.remove('active');
  };
  view2?.addEventListener('click', () => setCols('col-2', 'col-4', view2, view4));
  view4?.addEventListener('click', () => setCols('col-4', 'col-2', view4, view2));

  // Initialize from URL parameters (e.g. ?gender=women&category=outerwear&search=silk)
  const params = new URLSearchParams(window.location.search);
  const paramGender = params.get('gender');
  const paramCategory = params.get('category');
  const paramSearch = params.get('search');
  if (paramGender) setGender(paramGender);
  if (paramCategory) setCategory(paramCategory);
  if (paramSearch) {
    searchQuery = paramSearch.toLowerCase().trim();
    if (searchInput) searchInput.value = paramSearch;
    applyFilters();
  }
  if (!paramGender && !paramCategory && !paramSearch) applyFilters();
});
