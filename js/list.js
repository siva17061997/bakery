/* ===============================
   GET ALREADY-IN-CART QTY (SAFE)
================================ */
function getCartQty(productId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const cartKey =
    localStorage.getItem("activeCartKey") ||
    (user ? `cart_${user.id}` : "cart_guest");

  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const item = cart.find(i => i.productId === productId);
  return item ? item.qty : 0;
}

const PRODUCT_API = "http://localhost:8080/api/products";
const IMAGE_BASE = "http://localhost:8080";

let products = [];

/* ===============================
   LOAD PRODUCTS
================================ */
document.addEventListener("DOMContentLoaded", () => {
  fetch(PRODUCT_API)
    .then(res => res.json())
    .then(data => {
      products = data.content || [];
      renderProducts(products);
      loadFilters(products); // ✅ FIX
    })
    .catch(err => console.error("❌ Product load failed", err));
});

/* ===============================
   RENDER PRODUCTS
================================ */
function renderProducts(list) {

  const wrap = document.getElementById("cards");
  if (!wrap) return;

  wrap.innerHTML = "";

  if (!list.length) {
    wrap.innerHTML = `<p class="text-center">No products found</p>`;
    return;
  }

  list.forEach(p => {

    const maxQty = p.quantity > 0 ? p.quantity : 1;
    const unitLabel = p.qtyType === "KG" ? "Kg" : "Piece";

    wrap.insertAdjacentHTML("beforeend", `
      <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
        <div class="card product-card h-100">

          <img src="${IMAGE_BASE}${p.imageUrl}"
               class="img-fluid"
               onclick="openProduct(${p.id})"
               onerror="this.src='assets/no-image.png'"
               style="cursor:pointer">

          <div class="card-body text-center">

            <h6 onclick="openProduct(${p.id})" style="cursor:pointer">
              ${p.subcategory}
            </h6>

            <small class="text-muted">${p.category}</small>

            <div class="mt-2">
              <span class="fw-bold">₹${p.price}</span>
              ${
                p.mrp && p.mrp > p.price
                  ? `<del class="text-muted ms-2">₹${p.mrp}</del>`  // ✅ STRIKE
                  : ""
              }
            </div>

            ${
              p.discount && p.discount > 0
                ? `<div class="text-danger small mt-1">${p.discount}% OFF</div>` // ✅ FIX
                : ""
            }

            <!-- QTY -->
            <div class="qty-box d-flex justify-content-center mt-2">
              <button id="m-${p.id}"
                      onclick="changeQty(event,${p.id},-1)"
                      disabled>−</button>

              <input id="q-${p.id}"
                     value="1"
                     data-max="${maxQty}"
                     readonly>

              <button id="p-${p.id}"
                      onclick="changeQty(event,${p.id},1)">+</button>
            </div>

            <small class="text-muted d-block mt-1">
              Available: ${maxQty} ${unitLabel}
            </small>

            <!-- ✅ BUTTON ON NEW LINE -->
            <button class="btn btn-success btn-sm w-100 mt-3"
                    onclick="addToCartFromList(event,${p.id})">
              Add to Cart
            </button>

          </div>
        </div>
      </div>
    `);
  });
}

/* ===============================
   QTY CHANGE
================================ */
function changeQty(e, id, delta) {
  e.preventDefault();
  e.stopPropagation();

  const input = document.getElementById(`q-${id}`);
  const minus = document.getElementById(`m-${id}`);
  const plus = document.getElementById(`p-${id}`);

  let val = parseInt(input.value);
  const max = parseInt(input.dataset.max);

  val += delta;
  if (val < 1) val = 1;
  if (val > max) val = max;

  input.value = val;
  minus.disabled = val <= 1;
  plus.disabled = val >= max;
}

/* ===============================
   ADD TO CART (STOCK SAFE)
================================ */
function addToCartFromList(e, id) {
  e.preventDefault();
  e.stopPropagation();

  const p = products.find(x => x.id === id);
  if (!p) return;

  const qty = parseInt(document.getElementById(`q-${id}`).value);
  const maxQty = p.quantity > 0 ? p.quantity : 1;
  const already = getCartQty(p.id);

  if (already + qty > maxQty) {
    alert(`Only ${maxQty} available.\nAlready in cart: ${already}`);
    return;
  }

  addToCart({
    productId: p.id,
    name: p.subcategory,
    price: p.price,
    gst: p.gst || 0,
    qtyType: p.qtyType,
    imageUrl: IMAGE_BASE + p.imageUrl,
    maxQty: maxQty
  }, qty);
}

/* ===============================
   OPEN PRODUCT DETAIL
================================ */
function openProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

/* ===============================
   LOAD FILTERS (🔥 FIXED)
================================ */
function loadFilters(list) {

  const catSel = document.getElementById("filterCategory");
  const subSel = document.getElementById("filterSubcategory");
  const discountBox = document.getElementById("discountFilters");

  if (!catSel || !subSel || !discountBox) return;

  /* CATEGORY */
  const categories = [...new Set(list.map(p => p.category))];
  catSel.innerHTML =
    `<option value="">All</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");

  /* SUBCATEGORY */
  subSel.innerHTML = `<option value="">All</option>`;

  catSel.onchange = () => {
    const subs = [...new Set(
      list
        .filter(p => !catSel.value || p.category === catSel.value)
        .map(p => p.subcategory)
    )];

    subSel.innerHTML =
      `<option value="">All</option>` +
      subs.map(s => `<option value="${s}">${s}</option>`).join("");
  };

  /* DISCOUNT */
  let html = "";
  for (let i = 10; i <= 100; i += 10) {
    html += `
      <label class="d-block small">
        <input type="checkbox" class="discount-check" value="${i}">
        ${i}% & above
      </label>`;
  }
  discountBox.innerHTML = html;
}




/* ===============================
   APPLY FILTER (FIXED)
================================ */
function applyFilter() {

  const cat = document.getElementById("filterCategory")?.value || "";
  const sub = document.getElementById("filterSubcategory")?.value || "";

  const discounts = [...document.querySelectorAll(".discount-check:checked")]
    .map(d => Number(d.value));

  const filtered = products.filter(p => {

    const matchCategory =
      !cat || p.category === cat;

    const matchSub =
      !sub || p.subcategory === sub;

    const matchDiscount =
      discounts.length === 0 ||
      discounts.some(d => (p.discount || 0) >= d);

    return matchCategory && matchSub && matchDiscount;
  });

  renderProducts(filtered);
}
