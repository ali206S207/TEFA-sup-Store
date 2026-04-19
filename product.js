const state = {
  cart: readCart(),
};

const productDetail = document.querySelector("#productDetail");
const relatedGrid = document.querySelector("#relatedGrid");
const cartCount = document.querySelector("#cartCount");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("tefaGymTheme", theme);
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

function initTheme() {
  const savedTheme = localStorage.getItem("tefaGymTheme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function refreshCartCount() {
  cartCount.textContent = state.cart.reduce((sum, line) => sum + line.qty, 0);
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

  writeCart(state.cart);
  refreshCartCount();
  showToast("اتضافت للسلة");
}

function getCurrentProduct() {
  const id = new URLSearchParams(window.location.search).get("id");
  return getProduct(id) || products[0];
}

function renderProduct() {
  const product = getCurrentProduct();
  const disabled = product.stock === "out";
  document.title = `${product.name} | TEFA GYM`;

  productDetail.innerHTML = `
    <div class="detail-media">
      <img src="${product.image}" alt="${product.name}" />
      <span class="stock-badge stock-${product.stock}">${stockLabels[product.stock]}</span>
    </div>
    <div class="detail-copy">
      <p class="eyebrow">${categoryLabels[product.category]} - ${product.badge}</p>
      <h1>${product.name}</h1>
      <p>${product.description}</p>
      <strong class="detail-price">${formatMoney(product.price)}</strong>

      <div class="detail-options">
        <label class="mini-field">
          <span>اختار النكهة</span>
          <select id="detailFlavor" ${disabled ? "disabled" : ""}>
            ${product.flavors.map((flavor) => `<option value="${flavor}">${flavor}</option>`).join("")}
          </select>
        </label>
        <div class="qty-controls detail-qty" aria-label="اختيار الكمية">
          <button type="button" id="detailDec" ${disabled ? "disabled" : ""}>-</button>
          <span id="detailQty">1</span>
          <button type="button" id="detailInc" ${disabled ? "disabled" : ""}>+</button>
        </div>
      </div>

      <div class="detail-actions">
        <button class="primary-btn" id="detailAdd" type="button" ${disabled ? "disabled" : ""}>
          ${disabled ? "غير متوفر" : product.stock === "preorder" ? "احجز طلب مسبق" : "أضف للسلة"}
        </button>
        <a class="ghost-btn" href="checkout.html">افتح Checkout</a>
      </div>

      <div class="detail-info">
        <div>
          <h2>الفوائد</h2>
          <ul>${product.benefits.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div>
          <h2>طريقة الاستخدام</h2>
          <p>${product.usage}</p>
        </div>
      </div>
    </div>
  `;
}

function renderRelated() {
  const product = getCurrentProduct();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  relatedGrid.innerHTML = related
    .map(
      (item) => `
        <article class="product-card reveal">
          <a class="product-art" href="product.html?id=${item.id}">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
            <span class="stock-badge stock-${item.stock}">${stockLabels[item.stock]}</span>
          </a>
          <div class="product-body">
            <div class="product-tags"><span>${categoryLabels[item.category]}</span><b>${item.badge}</b></div>
            <h3><a href="product.html?id=${item.id}">${item.name}</a></h3>
            <p>${item.description}</p>
            <div class="product-meta">
              <span class="price">${formatMoney(item.price)}</span>
              <a class="details-link" href="product.html?id=${item.id}">التفاصيل</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

document.addEventListener("click", (event) => {
  if (event.target.id === "detailInc") {
    document.querySelector("#detailQty").textContent = Number(document.querySelector("#detailQty").textContent) + 1;
  }

  if (event.target.id === "detailDec") {
    const qty = Math.max(1, Number(document.querySelector("#detailQty").textContent) - 1);
    document.querySelector("#detailQty").textContent = qty;
  }

  if (event.target.id === "detailAdd") {
    const product = getCurrentProduct();
    const flavor = document.querySelector("#detailFlavor").value;
    const qty = Number(document.querySelector("#detailQty").textContent);
    addToCart(product.id, flavor, qty);
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

initTheme();
renderProduct();
renderRelated();
refreshCartCount();
