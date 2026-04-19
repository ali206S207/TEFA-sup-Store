const state = {
  cart: readCart(),
  filter: "all",
  search: "",
};

const productsGrid = document.querySelector("#productsGrid");
const bundlesGrid = document.querySelector("#bundlesGrid");
const productSearch = document.querySelector("#productSearch");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartCount = document.querySelector("#cartCount");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");

function persistCart() {
  writeCart(state.cart);
}

function getLineKey(line) {
  return `${line.id}||${line.flavor}`;
}

function getCartRows() {
  return state.cart
    .map((line) => {
      const product = getProduct(line.id);
      return product ? { ...product, ...line, key: getLineKey(line), subtotal: product.price * line.qty } : null;
    })
    .filter(Boolean);
}

function getTotals() {
  const rows = getCartRows();
  const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
  return {
    rows,
    total,
    count: rows.reduce((sum, item) => sum + item.qty, 0),
  };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("tefaGymTheme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
}

function initTheme() {
  const savedTheme = localStorage.getItem("tefaGymTheme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

function addToCart(id, flavor, qty = 1) {
  const product = getProduct(id);
  if (!product || product.stock === "out") {
    showToast("المنتج غير متوفر حاليًا");
    return;
  }

  const selectedFlavor = flavor || getDefaultFlavor(product);
  const existing = state.cart.find((line) => line.id === id && line.flavor === selectedFlavor);

  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ id, flavor: selectedFlavor, qty });
  }

  persistCart();
  renderCart();
  showToast("اتضافت للسلة");
}

function updateLine(key, change) {
  const line = state.cart.find((item) => getLineKey(item) === key);
  if (!line) return;

  line.qty += change;
  if (line.qty <= 0) {
    state.cart = state.cart.filter((item) => getLineKey(item) !== key);
  }

  persistCart();
  renderCart();
}

function addBundle(bundleId) {
  const bundle = bundles.find((item) => item.id === bundleId);
  if (!bundle) return;

  bundle.productIds.forEach((id) => {
    const product = getProduct(id);
    if (product?.stock !== "out") {
      addToCart(id, getDefaultFlavor(product), 1);
    }
  });

  openCart();
  showToast("الباكدج اتضاف للسلة");
}

function getVisibleProducts() {
  const query = state.search.trim().toLowerCase();
  return products.filter((product) => {
    const matchesFilter = state.filter === "all" || product.category === state.filter;
    const matchesSearch =
      !query ||
      [product.name, product.description, product.badge, categoryLabels[product.category], product.flavors.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productsGrid.innerHTML = `<div class="empty-state wide">مفيش منتجات مطابقة للبحث الحالي.</div>`;
    return;
  }

  productsGrid.innerHTML = visibleProducts
    .map((product, index) => {
      const disabled = product.stock === "out";
      return `
        <article class="product-card reveal" style="--delay: ${index * 70}ms">
          <a class="product-art" href="product.html?id=${product.id}" aria-label="تفاصيل ${product.name}">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
            <span class="stock-badge stock-${product.stock}">${stockLabels[product.stock]}</span>
          </a>
          <div class="product-body">
            <div class="product-tags">
              <span>${categoryLabels[product.category]}</span>
              <b>${product.badge}</b>
            </div>
            <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
            <p>${product.description}</p>
            <label class="mini-field">
              <span>النكهة</span>
              <select data-flavor="${product.id}" ${disabled ? "disabled" : ""}>
                ${product.flavors.map((flavor) => `<option value="${flavor}">${flavor}</option>`).join("")}
              </select>
            </label>
            <div class="product-buy-row">
              <div class="qty-controls" aria-label="اختيار كمية ${product.name}">
                <button type="button" data-card-dec="${product.id}" ${disabled ? "disabled" : ""}>-</button>
                <span data-card-qty="${product.id}">1</span>
                <button type="button" data-card-inc="${product.id}" ${disabled ? "disabled" : ""}>+</button>
              </div>
              <a class="details-link" href="product.html?id=${product.id}">التفاصيل</a>
            </div>
            <div class="product-meta">
              <span class="price">${formatMoney(product.price)}</span>
              <button class="add-btn" type="button" data-add="${product.id}" ${disabled ? "disabled" : ""}>
                ${disabled ? "غير متوفر" : product.stock === "preorder" ? "احجز طلب مسبق" : "أضف للسلة"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBundles() {
  bundlesGrid.innerHTML = bundles
    .map((bundle) => {
      const bundleProducts = bundle.productIds.map(getProduct).filter(Boolean);
      return `
        <article class="bundle-card reveal">
          <div>
            <p class="eyebrow">TEFA Pack</p>
            <h3>${bundle.name}</h3>
            <p>${bundle.description}</p>
          </div>
          <div class="bundle-products">
            ${bundleProducts.map((product) => `<img src="${product.image}" alt="${product.name}" loading="lazy" />`).join("")}
          </div>
          <div class="bundle-foot">
            <strong>${formatMoney(getBundleTotal(bundle))}</strong>
            <button class="primary-btn" type="button" data-add-bundle="${bundle.id}">أضف الباكدج</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  const totals = getTotals();
  cartCount.textContent = totals.count;
  cartTotal.textContent = formatMoney(totals.total);

  if (!totals.rows.length) {
    cartItems.innerHTML = `<div class="empty-state">السلة فاضية. اختار منتج من الكتالوج وابدأ الأوردر.</div>`;
    return;
  }

  cartItems.innerHTML = totals.rows
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.flavor} - ${formatMoney(item.price)}</p>
            <div class="qty-row">
              <div class="qty-controls" aria-label="تعديل كمية ${item.name}">
                <button type="button" data-dec="${item.key}" aria-label="تقليل الكمية">-</button>
                <span>${item.qty}</span>
                <button type="button" data-inc="${item.key}" aria-label="زيادة الكمية">+</button>
              </div>
              <strong>${formatMoney(item.subtotal)}</strong>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function updateCardQty(id, change) {
  const target = document.querySelector(`[data-card-qty="${id}"]`);
  if (!target) return;

  const nextValue = Math.max(1, Number(target.textContent) + change);
  target.textContent = nextValue;
}

document.addEventListener("click", (event) => {
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const incKey = event.target.closest("[data-inc]")?.dataset.inc;
  const decKey = event.target.closest("[data-dec]")?.dataset.dec;
  const cardInc = event.target.closest("[data-card-inc]")?.dataset.cardInc;
  const cardDec = event.target.closest("[data-card-dec]")?.dataset.cardDec;
  const bundleId = event.target.closest("[data-add-bundle]")?.dataset.addBundle;

  if (addId) {
    const flavor = document.querySelector(`[data-flavor="${addId}"]`)?.value;
    const qty = Number(document.querySelector(`[data-card-qty="${addId}"]`)?.textContent || 1);
    addToCart(addId, flavor, qty);
  }

  if (incKey) updateLine(incKey, 1);
  if (decKey) updateLine(decKey, -1);
  if (cardInc) updateCardQty(cardInc, 1);
  if (cardDec) updateCardQty(cardDec, -1);
  if (bundleId) addBundle(bundleId);

  if (event.target.closest(".cart-toggle")) openCart();
  if (event.target.closest(".cart-close")) closeCart();
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderProducts();
  });
});

productSearch?.addEventListener("input", () => {
  state.search = productSearch.value;
  renderProducts();
});

document.querySelector("#checkoutLink")?.addEventListener("click", closeCart);

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(current);
});

initTheme();
renderProducts();
renderBundles();
renderCart();
