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

/* ===============================
   CONSTANTS
================================ */
const PRODUCT_API = "http://localhost:8080/api/products";
const IMAGE_BASE = "http://localhost:8080";

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

if (!productId) {
  alert("Invalid product");
  window.location.href = "list.html";
}

/* ===============================
   STATE
================================ */
let product = null;
let qty = 1;
let maxQty = 1;

/* ===============================
   DOM ELEMENTS
================================ */
const imgEl = document.querySelector(".detail-img");
const nameEl = document.querySelector(".detail-name");
const catEl = document.querySelector(".detail-category");
const priceEl = document.querySelector(".detail-price");
const mrpEl = document.querySelector(".detail-mrp");
const discountEl = document.querySelector(".detail-discount");

const qtyInput = document.querySelector(".detail-qty");
const subtotalEl = document.querySelector(".detail-subtotal");
const gstEl = document.querySelector(".detail-gst");
const totalEl = document.querySelector(".detail-total");

/* ===============================
   LOAD PRODUCT
================================ */
fetch(`${PRODUCT_API}/${productId}`)
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(p => {

    product = p;
    maxQty = p.quantity > 0 ? p.quantity : 1;
    qty = 1;

    /* IMAGE */
    if (imgEl) {
      imgEl.src = IMAGE_BASE + p.imageUrl;
      imgEl.onerror = () => {
        imgEl.src = "assets/no-image.png";
      };
    }

    /* TEXT DETAILS */
    if (nameEl) nameEl.textContent = p.subcategory;
    if (catEl) catEl.textContent = p.category;
    if (priceEl) priceEl.textContent = `₹${p.price}`;

    if (mrpEl) {
      mrpEl.textContent =
        p.mrp && p.mrp > p.price ? `₹${p.mrp}` : "";
      mrpEl.style.textDecoration = "line-through";
    }

    if (discountEl) {
      discountEl.textContent =
        p.discount && p.discount > 0 ? `${p.discount}% OFF` : "";
    }

    if (qtyInput) qtyInput.value = qty;

    calculateTotal();
  })
  .catch(() => {
    alert("Product not found");
    window.location.href = "list.html";
  });

/* ===============================
   QTY + ADD TO CART
================================ */
document.addEventListener("click", e => {

  if (e.target.classList.contains("detail-plus")) {
    if (qty < maxQty) {
      qty++;
      if (qtyInput) qtyInput.value = qty;
      calculateTotal();
    }
  }

  if (e.target.classList.contains("detail-minus")) {
    if (qty > 1) {
      qty--;
      if (qtyInput) qtyInput.value = qty;
      calculateTotal();
    }
  }

  if (e.target.classList.contains("detail-add-cart")) {

    const already = getCartQty(product.id);

    if (already + qty > maxQty) {
      alert(
        `Only ${maxQty} available\nAlready in cart: ${already}`
      );
      return;
    }

    addToCart({
      productId: product.id,
      name: product.subcategory,
      price: product.price,
      gst: product.gst || 0,
      qtyType: product.qtyType,
      imageUrl: IMAGE_BASE + product.imageUrl,
      maxQty: maxQty
    }, qty);
  }
});

/* ===============================
   TOTAL CALCULATION
================================ */
function calculateTotal() {
  if (!product) return;

  const subtotal = product.price * qty;
  const gst = (subtotal * (product.gst || 0)) / 100;
  const total = subtotal + gst;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}
