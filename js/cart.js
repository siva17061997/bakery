/* ===============================
   CART RESTORE FIX (SAFE)
================================ */

function restoreCartPopup() {
    const itemsBox = document.querySelector(".cart-items");
    const countEls = document.querySelectorAll(".cart-count");
  
    if (!itemsBox || countEls.length === 0) {
      setTimeout(restoreCartPopup, 100);
      return;
    }
  
    let cartKey = localStorage.getItem("activeCartKey");
    if (!cartKey) {
      const user = JSON.parse(localStorage.getItem("user"));
      cartKey = user ? `cart_${user.id}` : "cart_guest";
      localStorage.setItem("activeCartKey", cartKey);
    }
  
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  
    /* COUNT */
    const totalQty = cart.reduce((s, i) => s + (i.qty || 0), 0);
    countEls.forEach(el => {
      el.textContent = totalQty;
      el.style.display = totalQty > 0 ? "inline-block" : "none";
    });
  
    /* RENDER */
    renderCart();
  }
  