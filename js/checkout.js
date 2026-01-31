/* ===============================
   CHECKOUT JS – FINAL SYNCED
================================ */

const ORDER_BASE_URL = "https://bakery-backend-thni.onrender.com/api/orders";

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH
  =============================== */
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");

  if (!user || !token) {
    alert("Please login to continue");
    window.location.href = "login.html";
    return;
  }

  /* ===============================
     CART
  =============================== */
  const cartKey =
    localStorage.getItem("activeCartKey") || `cart_${user.id}`;

  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  /* ===============================
     DOM ELEMENTS
  =============================== */
  const orderItemsEl = document.getElementById("orderItems");
  const subtotalEl = document.getElementById("subtotal");
  const gstEl = document.getElementById("gst");
  const totalEl = document.getElementById("total");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const mobileEl = document.getElementById("mobile");
  const pinEl = document.getElementById("pincode");
  const addressEl = document.getElementById("address");
  const deliveryTypeEl = document.getElementById("deliveryType");

  /* ===============================
     PREFILL USER
  =============================== */
  if (nameEl) nameEl.value = user.fullName || user.name || "";
  if (emailEl) emailEl.value = user.email || "";

  /* ===============================
     PREFILL FROM LAST ORDER
  =============================== */
  fetch(`${ORDER_BASE_URL}/my`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data?.success && data.orders?.length) {
        const last = data.orders[0];
        if (mobileEl) mobileEl.value ||= last.mobile || "";
        if (pinEl) pinEl.value ||= last.pincode || "";
        if (addressEl) addressEl.value ||= last.address || "";
      }
    });

  /* ===============================
     RENDER ORDER
  =============================== */
  function renderOrder() {

    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    orderItemsEl.innerHTML = "";

    let subtotal = 0;
    let gstTotal = 0;

    if (!cart.length) {
      orderItemsEl.innerHTML =
        `<p class="text-muted">Your order is empty</p>`;
      subtotalEl.textContent = "₹0";
      gstEl.textContent = "₹0";
      totalEl.textContent = "₹0";
      placeOrderBtn.style.display = "none";
      return;
    }

    placeOrderBtn.style.display = "block";

    cart.forEach(i => {

      const maxQty = i.maxQty || 1;
      if (i.qty > maxQty) i.qty = maxQty;

      const sub = i.price * i.qty;
      const gst = (sub * (i.gst || 0)) / 100;

      subtotal += sub;
      gstTotal += gst;

      orderItemsEl.insertAdjacentHTML("beforeend", `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>${i.name}</strong>

            <div class="d-flex align-items-center mt-1">
              <button class="btn btn-sm btn-outline-secondary"
                onclick="updateCheckoutQty(${i.productId}, -1)"
                ${i.qty <= 1 ? "disabled" : ""}>−</button>

              <span class="mx-2">${i.qty}</span>

              <button class="btn btn-sm btn-outline-secondary"
                onclick="updateCheckoutQty(${i.productId}, 1)"
                ${i.qty >= maxQty ? "disabled" : ""}>+</button>
            </div>
          </div>

          <strong>₹${sub.toFixed(2)}</strong>
        </div>
      `);
    });

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    gstEl.textContent = `₹${gstTotal.toFixed(2)}`;
    totalEl.textContent = `₹${(subtotal + gstTotal).toFixed(2)}`;

    localStorage.setItem(cartKey, JSON.stringify(cart));

    if (typeof renderCart === "function") renderCart();
    if (typeof updateCartCount === "function") updateCartCount();
  }

  /* ===============================
     UPDATE QTY FROM CHECKOUT
  =============================== */
  window.updateCheckoutQty = function (productId, delta) {

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const maxQty = item.maxQty || 1;

    if (delta > 0 && item.qty >= maxQty) {
      alert(`Only ${maxQty} available`);
      return;
    }

    item.qty += delta;

    if (item.qty <= 0) {
      cart = cart.filter(i => i.productId !== productId);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderOrder();
  };

  renderOrder();

  /* ===============================
     PLACE ORDER
  =============================== */
  placeOrderBtn.addEventListener("click", async () => {

    if (!mobileEl.value || mobileEl.value.length < 10) {
      alert("Enter valid mobile number");
      return;
    }

    if (!pinEl.value || pinEl.value.length !== 6) {
      alert("Enter valid pincode");
      return;
    }

    if (!addressEl.value.trim()) {
      alert("Enter delivery address");
      return;
    }

    for (const i of cart) {
      if (i.qty > (i.maxQty || 1)) {
        alert(`${i.name} exceeds stock`);
        return;
      }
    }

    const payload = {
      userId: user.id,
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      mobile: mobileEl.value.trim(),
      pincode: pinEl.value.trim(),
      address: addressEl.value.trim(),
      deliveryType: deliveryTypeEl.value,
      paymentMethod: "CASH_ON_DELIVERY",
      items: cart.map(i => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        gst: i.gst || 0
      }))
    };

    try {
      const res = await fetch(ORDER_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order failed");
      }

      localStorage.removeItem(cartKey);
      localStorage.setItem("activeCartKey", "cart_guest");

      alert(`✅ Order #${data.orderId} placed successfully`);
      window.location.href = "myaccount.html";

    } catch (err) {
      alert("❌ Order failed: " + err.message);
    }
  });

});
