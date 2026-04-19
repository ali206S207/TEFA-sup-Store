const state = {
  cart: readCart(),
  customer: null,
  orderId: createOrderId(),
};

const CUSTOMER_STORAGE_KEY = "tefaGymCustomer";

const checkoutItems = document.querySelector("#checkoutItems");
const summaryContent = document.querySelector("#summaryContent");
const cartCount = document.querySelector("#cartCount");
const checkoutForm = document.querySelector("#checkoutForm");
const confirmWhatsApp = document.querySelector("#confirmWhatsApp");
const downloadInvoicePdf = document.querySelector("#downloadInvoicePdf");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");

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

function hasPreorder(rows = getCartRows()) {
  return rows.some((item) => item.stock === "preorder");
}

function persistCart() {
  writeCart(state.cart);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeText(value = "") {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function readSavedCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function fillCustomerForm() {
  const savedCustomer = readSavedCustomer();
  if (!savedCustomer) return;

  savedCustomer.pickup = savedCustomer.pickup || "استلام من TEFA GYM - الوادي الجديد";

  ["name", "phone", "city", "pickup", "notes"].forEach((field) => {
    const input = checkoutForm.elements[field];
    if (input && savedCustomer[field]) {
      input.value = savedCustomer[field];
    }
  });

  checkoutForm.elements.remember.checked = true;
  state.customer = savedCustomer;
}

function persistCustomer(customer) {
  if (checkoutForm.elements.remember.checked) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
  } else {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  }
}

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

function updateQuantity(key, change) {
  const line = state.cart.find((item) => getLineKey(item) === key);
  if (!line) return;

  line.qty += change;
  if (line.qty <= 0) {
    state.cart = state.cart.filter((item) => getLineKey(item) !== key);
  }

  persistCart();
  renderCheckout();
}

function renderCheckoutItems(rows) {
  if (!rows.length) {
    checkoutItems.innerHTML = `
      <div class="checkout-empty">
        <strong>السلة فاضية</strong>
        <span>ارجع للمنتجات واختار المكملات اللي محتاجها قبل إتمام الأوردر.</span>
        <a class="primary-btn" href="index.html#products">تسوق الآن</a>
      </div>
    `;
    return;
  }

  checkoutItems.innerHTML = rows
    .map(
      (item) => `
        <article class="checkout-item reveal">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.flavor} - ${formatMoney(item.price)} للقطعة</p>
          </div>
          <div class="qty-controls" aria-label="تعديل كمية ${item.name}">
            <button type="button" data-dec="${item.key}" aria-label="تقليل الكمية">-</button>
            <span>${item.qty}</span>
            <button type="button" data-inc="${item.key}" aria-label="زيادة الكمية">+</button>
          </div>
          <strong>${formatMoney(item.subtotal)}</strong>
        </article>
      `
    )
    .join("");
}

function renderSummary(rows, total) {
  const customer = state.customer;
  const customerBlock = customer
    ? `
      <div class="summary-customer">
        <strong>${escapeText(customer.name)}</strong>
        <span>${escapeText(customer.phone)}</span>
        <span>${escapeText(customer.city)} - ${escapeText(customer.pickup)}</span>
        ${customer.notes ? `<span>${escapeText(customer.notes)}</span>` : ""}
      </div>
    `
    : `<p class="summary-hint">اكتب بياناتك واضغط تحديث الفاتورة عشان تظهر هنا قبل الإرسال.</p>`;

  summaryContent.innerHTML = `
    <div class="order-id-pill">Order ID: ${state.orderId}</div>
    <div class="summary-lines">
      ${
        rows.length
          ? rows
              .map(
                (item) => `
                  <div>
                    <span>${item.name} - ${item.flavor} × ${item.qty}</span>
                    <b>${formatMoney(item.subtotal)}</b>
                  </div>
                `
              )
              .join("")
          : `<p class="summary-hint">مفيش منتجات في السلة.</p>`
      }
    </div>
    ${customerBlock}
    <div class="summary-total">
      <span>الإجمالي النهائي</span>
      <strong>${formatMoney(total)}</strong>
    </div>
    <p class="summary-hint">الاستلام من TEFA GYM داخل الوادي الجديد فقط.</p>
    ${hasPreorder(rows) ? `<p class="preorder-alert">يوجد منتج طلب مسبق: سيتم التواصل مع العميل عند وصوله.</p>` : ""}
  `;
}

function renderCheckout() {
  const totals = getTotals();
  cartCount.textContent = totals.count;
  renderCheckoutItems(totals.rows);
  renderSummary(totals.rows, totals.total);
}

function buildWhatsAppMessage() {
  const totals = getTotals();
  const customer = state.customer;
  const lines = [
    `Order ID: ${state.orderId}`,
    "أوردر جديد من TEFA GYM",
    "",
    "بيانات العميل:",
    `الاسم: ${customer.name}`,
    `الموبايل: ${customer.phone}`,
    `المنطقة داخل الوادي الجديد: ${customer.city}`,
    `طريقة الاستلام: ${customer.pickup}`,
    "نطاق الخدمة: الوادي الجديد فقط",
  ];

  if (customer.notes) {
    lines.push(`ملاحظات: ${customer.notes}`);
  }

  lines.push("", "المنتجات:");
  totals.rows.forEach((item, index) => {
    const preorder = item.stock === "preorder" ? " - طلب مسبق" : "";
    lines.push(`${index + 1}. ${item.name} - ${item.flavor}${preorder} × ${item.qty} = ${formatMoney(item.subtotal)}`);
  });

  lines.push("", `الإجمالي النهائي: ${formatMoney(totals.total)}`);
  if (hasPreorder(totals.rows)) {
    lines.push("ملاحظة: يوجد منتج طلب مسبق، يتم التواصل مع العميل عند وصوله.");
  }
  return lines.join("\n");
}

function syncCustomerFromForm() {
  if (!checkoutForm.reportValidity()) return false;
  state.customer = Object.fromEntries(new FormData(checkoutForm).entries());
  delete state.customer.remember;
  persistCustomer(state.customer);
  renderCheckout();
  return true;
}

function buildInvoiceDocument() {
  const totals = getTotals();
  const customer = state.customer;
  const date = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const rowsHtml = totals.rows
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${item.name}</strong>
            <span>${item.flavor}${item.stock === "preorder" ? " - طلب مسبق" : ""}</span>
          </td>
          <td>${item.qty}</td>
          <td>${formatMoney(item.price)}</td>
          <td>${formatMoney(item.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>TEFA GYM Invoice ${state.orderId}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f4f1e8;
            color: #121212;
            font-family: Tahoma, Arial, sans-serif;
            line-height: 1.7;
          }
          .invoice-sheet {
            width: min(900px, calc(100% - 32px));
            margin: 24px auto;
            background: #fff;
            border: 1px solid #ded7c7;
            box-shadow: 0 24px 70px rgba(0,0,0,.14);
          }
          .invoice-hero {
            display: grid;
            grid-template-columns: 1fr 140px;
            gap: 24px;
            align-items: center;
            padding: 28px;
            background: linear-gradient(135deg, #111, #27230d);
            color: #fff;
          }
          .invoice-hero img {
            width: 140px;
            height: 140px;
            object-fit: cover;
            border: 3px solid #f6d51a;
            border-radius: 10px;
          }
          .invoice-hero p { margin: 0; color: #f6d51a; font-weight: 800; }
          .invoice-hero h1 { margin: 4px 0 8px; font-size: 48px; line-height: 1; }
          .invoice-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 18px 28px;
            border-bottom: 1px solid #ded7c7;
          }
          .pill {
            padding: 12px;
            border-radius: 8px;
            background: #f6f3ea;
          }
          .pill span { display: block; color: #6b6252; font-size: 12px; }
          .pill strong { display: block; font-size: 16px; }
          .customer {
            padding: 22px 28px;
            border-bottom: 1px solid #ded7c7;
          }
          .customer h2, .items h2 { margin: 0 0 10px; }
          .customer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .items { padding: 22px 28px; }
          th, td {
            padding: 12px;
            border-bottom: 1px solid #ded7c7;
            text-align: right;
          }
          th {
            background: #111;
            color: #f6d51a;
          }
          td span {
            display: block;
            color: #6b6252;
            font-size: 13px;
          }
          .total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 18px;
            padding: 18px;
            border-radius: 8px;
            background: #f6d51a;
            color: #111;
            font-weight: 900;
            font-size: 24px;
          }
          .footer {
            padding: 18px 28px 26px;
            color: #6b6252;
            text-align: center;
          }
          .print-actions {
            width: min(900px, calc(100% - 32px));
            margin: 18px auto 0;
            text-align: left;
          }
          button {
            min-height: 46px;
            border: 0;
            border-radius: 8px;
            background: #111;
            color: #f6d51a;
            padding: 0 18px;
            font: inherit;
            font-weight: 900;
            cursor: pointer;
          }
          @media print {
            body { background: #fff; }
            .invoice-sheet { width: 100%; margin: 0; box-shadow: none; border: 0; }
            .print-actions { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-actions">
          <button onclick="window.print()">حفظ / طباعة PDF</button>
        </div>
        <main class="invoice-sheet">
          <section class="invoice-hero">
            <div>
              <p>فاتورة شراء رسمية</p>
              <h1>TEFA GYM</h1>
              <strong>Supplements Store</strong>
            </div>
            <img src="assets/tefa-logo.png" alt="TEFA GYM logo" />
          </section>

          <section class="invoice-meta">
            <div class="pill"><span>رقم الأوردر</span><strong>${state.orderId}</strong></div>
            <div class="pill"><span>تاريخ الفاتورة</span><strong>${date}</strong></div>
            <div class="pill"><span>طريقة التأكيد</span><strong>WhatsApp</strong></div>
          </section>

          <section class="customer">
            <h2>بيانات العميل</h2>
            <div class="customer-grid">
              <div><strong>الاسم:</strong> ${escapeText(customer.name)}</div>
              <div><strong>الموبايل:</strong> ${escapeText(customer.phone)}</div>
              <div><strong>المنطقة:</strong> ${escapeText(customer.city)}</div>
              <div><strong>طريقة الاستلام:</strong> ${escapeText(customer.pickup)}</div>
              ${customer.notes ? `<div><strong>ملاحظات:</strong> ${escapeText(customer.notes)}</div>` : ""}
            </div>
          </section>

          <section class="items">
            <h2>المنتجات</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <div class="total">
              <span>الإجمالي النهائي</span>
              <strong>${formatMoney(totals.total)}</strong>
            </div>
            ${hasPreorder(totals.rows) ? `<p style="margin:16px 0 0;color:#6b6252;font-weight:800">ملاحظة: يوجد منتج طلب مسبق، يتم التواصل مع العميل عند وصوله.</p>` : ""}
          </section>

          <footer class="footer">
            شكراً لاختيارك TEFA GYM. الاستلام من الجيم داخل الوادي الجديد فقط، ولا توجد خدمة شحن حالياً.
          </footer>
        </main>
        <script>
          window.addEventListener("load", () => setTimeout(() => window.print(), 300));
        </script>
      </body>
    </html>
  `;
}

function openInvoicePdf() {
  if (!getTotals().rows.length) {
    showToast("السلة فاضية");
    return;
  }

  if (!syncCustomerFromForm()) return;

  const invoiceWindow = window.open("about:blank", "_blank");
  if (!invoiceWindow) {
    showToast("المتصفح منع فتح نافذة الفاتورة");
    return;
  }

  invoiceWindow.document.open();
  invoiceWindow.document.write(buildInvoiceDocument());
  invoiceWindow.document.close();
  invoiceWindow.focus();
}

checkoutItems.addEventListener("click", (event) => {
  const incKey = event.target.closest("[data-inc]")?.dataset.inc;
  const decKey = event.target.closest("[data-dec]")?.dataset.dec;
  if (incKey) updateQuantity(incKey, 1);
  if (decKey) updateQuantity(decKey, -1);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!getTotals().rows.length) {
    showToast("اختار منتج واحد على الأقل قبل الفاتورة");
    return;
  }
  syncCustomerFromForm();
  showToast("الفاتورة اتحدثت");
});

confirmWhatsApp.addEventListener("click", () => {
  if (!getTotals().rows.length) {
    showToast("السلة فاضية");
    return;
  }

  if (!syncCustomerFromForm()) return;

  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
});

downloadInvoicePdf.addEventListener("click", openInvoicePdf);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

initTheme();
fillCustomerForm();
renderCheckout();
