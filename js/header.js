/* =====================================================
   BASIC UI TOGGLES
===================================================== */
// function toggleNotify() {
//   const box = document.getElementById("notifyBox");
//   if (box) box.classList.toggle("show");
// }

// function toggleCart() {
//   document.querySelector(".cart-panel")?.classList.toggle("active");
// }

// function toggleMobileMenu() {
//   document.getElementById("mobileMenu")?.classList.toggle("active");
// }









// function toggleNotify() {
//   const box = document.getElementById("notifyBox");
//   if (box) box.classList.toggle("show");
// }

// function toggleCart() {
//   const panel = document.querySelector(".cart-panel");
//   if (!panel) return;

//   panel.classList.toggle("active");
// }

/* ================================
   MOBILE MENU
// ================================ */
// function toggleMobileMenu() {
//   document.getElementById("mobileMenu")?.classList.toggle("active");
// }

/* ================================
   CLOSE CART ON OUTSIDE CLICK
   (SAFE FOR ADD TO CART & DETAIL PAGE)
================================ */
// let cartWasOpen = false;

// document.addEventListener("click", function (e) {
//   const cartPanel = document.querySelector(".cart-panel");
//   const toggleBtn = document.querySelector(".cart-toggle");
//   const closeBtn  = document.querySelector(".cart-toggle.close");

//   if (!cartPanel) return;

//   const isOpen = cartPanel.classList.contains("active");

//   if (isOpen) cartWasOpen = true;

//   /* ❌ IGNORE CLICKS THAT SHOULD NOT CLOSE CART */
//   if (
//     cartPanel.contains(e.target) ||                 // inside cart
//     toggleBtn?.contains(e.target) ||                 // cart icon
//     closeBtn?.contains(e.target) ||                  // close button
//     e.target.closest(".detail-add-cart") ||          // product detail add
//     e.target.closest(".add-to-cart") ||              // list page add
//     e.target.closest(".btn-add-cart")                // any custom add btn
//   ) {
//     return;
//   }

//   /* ✅ REAL OUTSIDE CLICK */
//   if (cartWasOpen && isOpen) {
//     cartPanel.classList.remove("active");
//     cartWasOpen = false;
//     location.reload();
//   }
// });


/* ================================
   CLOSE BUTTON (×) → CLOSE + REFRESH
================================ */
// document.addEventListener("click", function (e) {
//   if (e.target.classList.contains("cart-toggle") &&
//       e.target.classList.contains("close")) {

//     const cartPanel = document.querySelector(".cart-panel");
//     if (!cartPanel) return;

//     cartPanel.classList.remove("active");
//     cartWasOpen = false;
//     location.reload();
//   }
// });



function toggleNotify() {
  const box = document.getElementById("notifyBox");
  if (box) box.classList.toggle("show");
}

function toggleCart() {
  const panel = document.querySelector(".cart-panel");
  if (!panel) return;
  panel.classList.toggle("active");
}

/* ================================
   MOBILE MENU
================================ */
function toggleMobileMenu() {
  document.getElementById("mobileMenu")?.classList.toggle("active");
}

/* ================================
   CLOSE BUTTON (×) — FIXED
================================ */
document.addEventListener("click", function (e) {

  const closeBtn = e.target.closest(".cart-toggle.close");
  if (!closeBtn) return;

  e.preventDefault();
  e.stopImmediatePropagation(); // 🔥 KEY FIX

  const cartPanel = document.querySelector(".cart-panel");
  if (!cartPanel) return;

  cartPanel.classList.remove("active");

  if (location.pathname.includes("checkout")) {
    location.reload();
  }
});

/* ================================
   CLOSE CART ON OUTSIDE CLICK
================================ */
document.addEventListener("click", function (e) {
  const cartPanel = document.querySelector(".cart-panel");
  const toggleBtn = document.querySelector(".cart-toggle");

  if (!cartPanel || !cartPanel.classList.contains("active")) return;

  /* ❌ Ignore safe clicks */
  if (
    cartPanel.contains(e.target) ||
    toggleBtn?.contains(e.target) ||
    e.target.closest(".detail-add-cart") ||
    e.target.closest(".add-to-cart") ||
    e.target.closest(".btn-add-cart")
  ) {
    return;
  }

  /* ✅ Outside click */
  cartPanel.classList.remove("active");

  if (location.pathname.includes("checkout")) {
    location.reload();
  }
});












/* ===============================
   HEADER CATEGORY → LIST PAGE
================================ */
document.addEventListener("click", function (e) {

  const link = e.target.closest("[data-category]");
  if (!link) return;

  e.preventDefault();

  const category = link.dataset.category || "";
  const subcategory = link.dataset.subcategory || "";

  let url = "list.html?";
  if (category) url += `category=${encodeURIComponent(category)}`;
  if (subcategory) url += `&subcategory=${encodeURIComponent(subcategory)}`;

  window.location.href = url;
});





















/* =====================================================
   LOGOUT
===================================================== */
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  localStorage.setItem("activeCartKey", "cart_guest");
  localStorage.removeItem("cart_guest");

  window.location.href = "index.html";
}

/* =====================================================
   MMENU INIT
===================================================== */
$(document).ready(function () {
  $("#my-menu").mmenu({
    navbar: { title: "Bakery Shop" },
    navbars: [{ position: "top", content: ["close"] }]
  });
});

/* =====================================================
   USER & CART STORAGE
===================================================== */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function getCartKey() {
  return localStorage.getItem("activeCartKey") || "cart_guest";
}

function getCart() {
  return JSON.parse(localStorage.getItem(getCartKey())) || [];
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  updateCartCount();
}

/* =====================================================
   CART COUNT
===================================================== */
function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-block" : "none";
  });
}

/* =====================================================
   ADD TO CART (ADMIN QTY SAFE)
===================================================== */
function addToCart(item, qty) {
  const user = getCurrentUser();
  const token = localStorage.getItem("accessToken");

  if (!user || !token) {
    alert("Please login to add items to cart");
    window.location.href = "login.html";
    return;
  }

  localStorage.setItem("activeCartKey", `cart_${user.id}`);

  const cart = getCart();
  const existing = cart.find(i => i.productId === item.productId);

  const maxQty = item.maxQty || 1;

  if (existing) {
    if (existing.qty + qty > maxQty) {
      alert(`Only ${maxQty} available`);
      return;
    }
    existing.qty += qty;
  } else {
    if (qty > maxQty) {
      alert(`Only ${maxQty} available`);
      return;
    }
    cart.push({ ...item, qty });
  }

  saveCart(cart);
  renderCart();
  openCart();
  showCartNotify();
}

/* =====================================================
   UPDATE / REMOVE CART ITEMS (ADMIN QTY SAFE)
===================================================== */
function changeCartQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.productId === id);
  if (!item) return;

  const maxQty = item.maxQty || 1;

  if (delta > 0 && item.qty >= maxQty) {
    alert(`Only ${maxQty} available`);
    return;
  }

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.productId !== id);
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.productId !== id);
  saveCart(cart);
  renderCart();
}

/* =====================================================
   RENDER CART UI (ADMIN QTY CLAMP)
===================================================== */
function renderCart() {
  const itemsBox = document.querySelector(".cart-items");
  const summaryBox = document.querySelector(".cart-summary");
  if (!itemsBox) return;

  const cart = getCart();
  itemsBox.innerHTML = "";

  let subtotal = 0;
  let gstTotal = 0;

  if (!cart.length) {
    itemsBox.innerHTML = `<p class="text-muted">Your cart is empty</p>`;
    if (summaryBox) summaryBox.innerHTML = "";
    return;
  }

  cart.forEach(p => {

    const maxQty = p.maxQty || 1;
    if (p.qty > maxQty) p.qty = maxQty;

    const sub = p.price * p.qty;
    const gst = (sub * (p.gst || 0)) / 100;

    subtotal += sub;
    gstTotal += gst;

    itemsBox.innerHTML += `
      <div class="cart-item d-flex align-items-start">
        <img src="${p.imageUrl}" class="cart-thumb">

        <div class="cart-info flex-grow-1">
          <div class="cart-name">${p.name}</div>
          <small>${p.qtyType}</small>

          <div class="cart-price">
            ₹${sub.toFixed(2)}
            <span class="gst">GST ₹${gst.toFixed(2)}</span>
          </div>

          <div class="cart-actions">
            <button class="qty-btn minus" data-id="${p.productId}">−</button>
            <span>${p.qty}</span>
            <button class="qty-btn plus" data-id="${p.productId}">+</button>
          </div>

          <small class="text-muted">Available: ${maxQty}</small>
        </div>

        <button class="cart-remove" data-id="${p.productId}">×</button>
      </div>
    `;
  });

  const total = subtotal + gstTotal;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-row">
        <span>Subtotal</span><strong>₹${subtotal.toFixed(2)}</strong>
      </div>
      <div class="summary-row">
        <span>GST</span><strong>₹${gstTotal.toFixed(2)}</strong>
      </div>
      <div class="summary-row total">
        <span>Total</span><strong>₹${total.toFixed(2)}</strong>
      </div>
      <a href="checkout.html" class="btn btn-success w-100 mt-2">Checkout</a>
    `;
  }
}

/* =====================================================
   CART POPUP & NOTIFY
===================================================== */
function openCart() {
  document.querySelector(".cart-panel")?.classList.add("active");
}

function showCartNotify() {
  const note = document.querySelector(".cart-notify");
  if (!note) return;
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 1200);
}

/* =====================================================
   GLOBAL CLICK EVENTS
===================================================== */
document.addEventListener("click", e => {

  if (e.target.classList.contains("plus")) {
    changeCartQty(Number(e.target.dataset.id), 1);
  }

  if (e.target.classList.contains("minus")) {
    changeCartQty(Number(e.target.dataset.id), -1);
  }

  if (e.target.classList.contains("cart-remove")) {
    removeFromCart(Number(e.target.dataset.id));
  }

  if (e.target.classList.contains("cart-toggle")) {
    toggleCart();
  }
});

/* =====================================================
   RESTORE CART AFTER PAGE LOAD
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
});

/* =====================================================
   🔥 REFRESH PAGE WHEN CART POPUP CLOSES
===================================================== */
// let cartWasOpen = false;

// document.addEventListener("click", () => {
//   const panel = document.querySelector(".cart-panel");
//   if (!panel) return;

//   const isOpen = panel.classList.contains("active");

//   if (cartWasOpen && !isOpen) {
//     location.reload();
//   }

//   cartWasOpen = isOpen;
// });



