/**
 * GENZSTORE - Global Storefront Scripts
 */

// Cart state management in localStorage
const CartManager = {
  getCart() {
    try {
      const stored = localStorage.getItem('genzstore_cart');
      return stored ? JSON.parse(stored) : [
        {
          id: 'trench-01',
          name: 'Structured Mulberry Silk Trench',
          color: 'Bone Greige',
          size: 'M',
          price: 1850,
          qty: 1,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'knit-02',
          name: 'Brushed Cashmere Relaxed Knit',
          color: 'Warm Taupe',
          size: 'S',
          price: 950,
          qty: 1,
          image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80'
        }
      ];
    } catch {
      return [];
    }
  },

  saveCart(items) {
    localStorage.setItem('genzstore_cart', JSON.stringify(items));
    this.updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
  },

  addItem(product) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id && item.size === product.size);
    if (existing) {
      existing.qty += (product.qty || 1);
    } else {
      cart.push({ ...product, qty: product.qty || 1 });
    }
    this.saveCart(cart);
    this.showToast(`Added "${product.name}" (${product.size}) to your bag`);
  },

  updateQty(index, newQty) {
    const cart = this.getCart();
    if (newQty <= 0) cart.splice(index, 1);
    else cart[index].qty = newQty;
    this.saveCart(cart);
  },

  removeItem(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  },

  getSubtotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  calculateTotals(discountPercent = 0) {
    const subtotal = this.getSubtotal();
    const discount = Math.round((subtotal * discountPercent) / 100);
    const discounted = Math.max(0, subtotal - discount);
    const shipping = (discounted >= 1500 || discounted === 0) ? 0 : 99;
    return {
      subtotal,
      discount,
      shipping,
      total: discounted + shipping
    };
  },

  formatPrice(amount) {
    return 'Rs. ' + Number(amount || 0).toLocaleString('en-IN');
  },

  updateCartBadge() {
    const totalCount = this.getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });
    document.querySelectorAll('.mobile-cart-count').forEach(el => { el.textContent = totalCount; });
  },

  showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
      <span>${message}</span>
    `;
    toast.classList.add('is-active');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('is-active'), 3200);
  }
};

// Wishlist state management in localStorage
const WishlistManager = {
  getWishlist() {
    try {
      const stored = localStorage.getItem('genzstore_wishlist');
      return stored ? JSON.parse(stored) : [
        {
          id: 'w-trench-01',
          name: 'Sculpted Mulberry Silk Trench',
          price: 18500,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=75'
        }
      ];
    } catch {
      return [];
    }
  },

  saveWishlist(items) {
    localStorage.setItem('genzstore_wishlist', JSON.stringify(items));
    this.updateBadges();
    this.renderDrawer();
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: items }));
  },

  toggleItem(product) {
    const list = this.getWishlist();
    const idx = list.findIndex(item => item.id === product.id);
    if (idx > -1) {
      list.splice(idx, 1);
      this.saveWishlist(list);
      CartManager.showToast(`Removed "${product.name}" from Saved Pieces`);
      return false;
    } else {
      list.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      this.saveWishlist(list);
      CartManager.showToast(`Saved "${product.name}" to Wishlist`);
      return true;
    }
  },

  isInWishlist(id) {
    return this.getWishlist().some(item => item.id === id);
  },

  updateBadges() {
    const list = this.getWishlist();
    const count = list.length;
    document.querySelectorAll('.wishlist-count-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
    document.querySelectorAll('.mobile-wishlist-count').forEach(el => { el.textContent = count; });
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
      const card = btn.closest('.product-card');
      const id = card?.dataset?.id;
      if (id) {
        btn.classList.toggle('is-active', this.isInWishlist(id));
      }
    });
  },

  renderDrawer() {
    const listEl = document.querySelector('.wishlist-items-list');
    if (!listEl) return;
    const list = this.getWishlist();
    if (list.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.4;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <p style="font-size: 0.95rem; margin-bottom: 0.4rem; color: var(--text-primary); font-weight: 500;">Your wishlist is empty</p>
          <p style="font-size: 0.8rem; opacity: 0.7;">Explore our latest Mumbai luxury silhouettes and save your favorites.</p>
        </div>
      `;
      return;
    }
    listEl.innerHTML = list.map((item, idx) => `
      <div class="wishlist-item-card">
        <img src="${item.image}" alt="${item.name}" class="wishlist-item-img">
        <div class="wishlist-item-info">
          <h4>${item.name}</h4>
          <div class="wishlist-item-price">${CartManager.formatPrice(item.price)}</div>
          <button class="wishlist-move-btn" onclick="WishlistManager.moveToCart(${idx})">Move to Bag</button>
        </div>
        <button class="wishlist-remove-btn" onclick="WishlistManager.removeItem(${idx})" aria-label="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `).join('');
  },

  removeItem(index) {
    const list = this.getWishlist();
    list.splice(index, 1);
    this.saveWishlist(list);
  },

  moveToCart(index) {
    const list = this.getWishlist();
    const item = list[index];
    if (item) {
      CartManager.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        size: 'M',
        color: 'Curated',
        image: item.image,
        qty: 1
      });
      list.splice(index, 1);
      this.saveWishlist(list);
    }
  }
};

function initWishlistDrawer() {
  if (document.querySelector('.wishlist-drawer')) return;
  const drawer = document.createElement('div');
  drawer.className = 'wishlist-drawer';
  drawer.innerHTML = `
    <div class="wishlist-header">
      <h3 style="font-family: var(--font-heading); font-size: 1.1rem; margin: 0; text-transform: uppercase; letter-spacing: 0.08em;">Saved Pieces</h3>
      <button type="button" class="wishlist-close-btn" aria-label="Close Wishlist" style="background:none;border:none;cursor:pointer;padding:0.4rem;display:flex;align-items:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="wishlist-items-list"></div>
  `;
  const backdrop = document.createElement('div');
  backdrop.className = 'wishlist-backdrop';
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);
}

function openWishlistDrawer() {
  if (!document.querySelector('.wishlist-drawer')) initWishlistDrawer();
  const drawer = document.querySelector('.wishlist-drawer');
  const backdrop = document.querySelector('.wishlist-backdrop');
  WishlistManager.renderDrawer();
  if (drawer) drawer.classList.add('is-open');
  if (backdrop) backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  const drawer = document.querySelector('.wishlist-drawer');
  const backdrop = document.querySelector('.wishlist-backdrop');
  if (drawer) drawer.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Global Search Dropdown Engine
function initGlobalSearch() {
  const header = document.querySelector('.site-header') || document.body;
  let searchOverlay = document.querySelector('.header-search-overlay');
  if (!searchOverlay) {
    searchOverlay = document.createElement('div');
    searchOverlay.className = 'header-search-overlay';
    searchOverlay.innerHTML = `
      <form class="header-search-form" onsubmit="event.preventDefault(); window.handleGlobalSearch();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="opacity: 0.6; flex-shrink: 0;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="header-search-input" id="global-search-query" placeholder="Search silk trenches, blazers, linen trousers, cashmere..." autocomplete="off">
        <button type="submit" class="btn btn-primary" style="padding: 0.55rem 1.15rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0;">Search</button>
        <button type="button" class="header-search-close-btn" style="background:none;border:none;cursor:pointer;padding:0.4rem;display:flex;align-items:center;flex-shrink:0;" aria-label="Close Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </form>
    `;
    header.appendChild(searchOverlay);
  }
}

function toggleGlobalSearch() {
  if (!document.querySelector('.header-search-overlay')) initGlobalSearch();
  const searchOverlay = document.querySelector('.header-search-overlay');
  if (!searchOverlay) return;
  const isOpen = searchOverlay.classList.toggle('is-open');
  if (isOpen) {
    setTimeout(() => {
      const input = document.getElementById('global-search-query');
      if (input) input.focus();
    }, 50);
  }
}

function closeGlobalSearch() {
  const searchOverlay = document.querySelector('.header-search-overlay');
  if (searchOverlay) searchOverlay.classList.remove('is-open');
}

window.handleGlobalSearch = function() {
  const query = document.getElementById('global-search-query')?.value?.trim();
  if (query) {
    if (window.location.pathname.includes('shop.html')) {
      const catalogSearch = document.getElementById('catalog-search');
      if (catalogSearch) {
        catalogSearch.value = query;
        catalogSearch.dispatchEvent(new Event('input', { bubbles: true }));
      }
      closeGlobalSearch();
      return;
    }
    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
  }
};

window.openWishlistDrawer = openWishlistDrawer;
window.closeWishlistDrawer = closeWishlistDrawer;
window.toggleGlobalSearch = toggleGlobalSearch;
window.closeGlobalSearch = closeGlobalSearch;
window.WishlistManager = WishlistManager;
window.CartManager = CartManager;

// Logical Navbar active state synchronization
function syncActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const links = document.querySelectorAll('.desktop-nav .nav-link');
  
  links.forEach(l => l.classList.remove('is-active'));
  
  if (search.includes('gender=women')) {
    document.querySelectorAll('.desktop-nav a[href*="gender=women"]').forEach(l => l.classList.add('is-active'));
  } else if (search.includes('gender=men')) {
    document.querySelectorAll('.desktop-nav a[href*="gender=men"]').forEach(l => l.classList.add('is-active'));
  } else if (path.endsWith('about.html') || path.endsWith('/about')) {
    document.querySelectorAll('.desktop-nav a[href*="about.html"]').forEach(l => l.classList.add('is-active'));
  } else if (path.endsWith('contact.html') || path.endsWith('/contact')) {
    document.querySelectorAll('.desktop-nav a[href*="contact.html"]').forEach(l => l.classList.add('is-active'));
  } else if (path.endsWith('shop.html') || path.endsWith('/shop')) {
    document.querySelectorAll('.desktop-nav a[href="shop.html"]').forEach(l => l.classList.add('is-active'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CartManager.updateCartBadge();
  WishlistManager.updateBadges();
  initWishlistDrawer();
  initGlobalSearch();
  syncActiveNav();

  // 1. Reliable Fixed Header - Never hides on scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

  // 2. High-Performance IntersectionObserver for Scroll Reveals
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-fade-up').forEach(el => revealObserver.observe(el));

  // 3. Mobile Menu Drawer Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileDrawer.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileDrawer?.querySelector('.drawer-close')?.addEventListener('click', () => {
    mobileDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  // 4. Delegated Event Handlers
  document.addEventListener('click', e => {
    // A. Wishlist Drawer Toggle
    const wishToggle = e.target.closest('.wishlist-toggle-btn');
    if (wishToggle) {
      e.preventDefault();
      openWishlistDrawer();
      return;
    }

    // B. Wishlist Drawer Close
    const wishClose = e.target.closest('.wishlist-close-btn, .wishlist-backdrop');
    if (wishClose) {
      e.preventDefault();
      closeWishlistDrawer();
      return;
    }

    // C. Global Search Toggle
    const searchToggle = e.target.closest('.search-toggle-btn');
    if (searchToggle) {
      e.preventDefault();
      toggleGlobalSearch();
      return;
    }

    // D. Global Search Close
    const searchClose = e.target.closest('.header-search-close-btn');
    if (searchClose) {
      e.preventDefault();
      closeGlobalSearch();
      return;
    }

    // E. Wishlist Heart Button on cards
    const heartBtn = e.target.closest('.wishlist-heart-btn');
    if (heartBtn) {
      e.preventDefault();
      const card = heartBtn.closest('.product-card');
      const id = card?.dataset?.id || ('garment-' + Math.floor(Math.random() * 1000));
      const name = card?.querySelector('.product-title')?.textContent?.trim() || 'Garment';
      const price = parseInt(card?.querySelector('.product-price')?.textContent?.replace(/\D/g, '') || '999', 10);
      const image = card?.querySelector('.primary-img')?.src || '';
      
      const isNowActive = WishlistManager.toggleItem({ id, name, price, image });
      heartBtn.classList.toggle('is-active', isNowActive);
      return;
    }

    // Quick-Add Size Pills
    const pill = e.target.closest('.quick-size-pill');
    if (pill) {
      e.preventDefault();
      const card = pill.closest('.product-card');
      if (!card) return;
      CartManager.addItem({
        id: card.dataset.id || 'item-' + Math.floor(Math.random() * 1000),
        name: card.querySelector('.product-title')?.textContent.trim() || 'Garment',
        price: parseInt(card.querySelector('.product-price')?.textContent.replace(/\D/g, '') || '999', 10),
        size: pill.textContent.trim(),
        color: card.dataset.color || 'Standard',
        image: card.querySelector('.primary-img')?.src || ''
      });
      return;
    }

    // Accordions
    const accordionTrigger = e.target.closest('.accordion-trigger');
    if (accordionTrigger) {
      accordionTrigger.closest('.accordion-item')?.classList.toggle('is-open');
    }
  });

  // 5. Newsletter Submission
  document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    if (input?.value) {
      CartManager.showToast('Welcome to the GenZStore circle. Confirmation sent.');
      input.value = '';
    }
  });
});
