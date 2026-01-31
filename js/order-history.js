document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));
  
    const ordersBody = document.getElementById("orders");
    const accNameEl = document.getElementById("accName");
    const accEmailEl = document.getElementById("accEmail");
  
    /* ===============================
       USER INFO (OPTIONAL)
    ================================ */
    if (user) {
      if (accNameEl) accNameEl.innerText = user.fullName || "";
      if (accEmailEl) accEmailEl.innerText = user.email || "";
    }
  
    /* ===============================
       NO TOKEN → MESSAGE ONLY
    ================================ */
    if (!token) {
      ordersBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-danger text-center">
            ⚠️ Please login to view your orders
          </td>
        </tr>`;
      return;
    }
  
    /* ===============================
       FETCH USER ORDERS
    ================================ */
    fetch("https://bakery-backend-hq21.onrender.com/api/orders/my", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        ordersBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-danger text-center">
              ⚠️ Session expired. Please login again
            </td>
          </tr>`;
        return null;
      }
      return res.json();
    })
    .then(data => {
  
      if (!data || !data.success) {
        ordersBody.innerHTML = `
          <tr><td colspan="6" class="text-center">No orders found</td></tr>`;
        return;
      }
  
      const orders = data.orders || [];
  
      if (orders.length === 0) {
        ordersBody.innerHTML = `
          <tr><td colspan="6" class="text-center">No orders placed yet</td></tr>`;
        return;
      }
  
      ordersBody.innerHTML = "";
  
      orders.forEach((order, index) => {
        ordersBody.insertAdjacentHTML(
          "beforeend",
          renderOrderRow(order, index + 1)
        );
      });
    })
    .catch(err => {
      console.error(err);
      ordersBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-danger text-center">
            Error loading orders
          </td>
        </tr>`;
    });
  });
  
  /* ===============================
     TABLE ROW TEMPLATE
  =============================== */
  function renderOrderRow(order, index) {
  
    const itemsHtml = (order.items && order.items.length)
      ? order.items.map(i =>
          `<div>🍰 ${i.name} × ${i.qty}</div>`
        ).join("")
      : `<span class="text-muted">No items</span>`;
  
    return `
      <tr>
        <td>${index}</td>
        <td>${formatDate(order.createdAt)}</td>
        <td>${itemsHtml}</td>
        <td>₹${Number(order.totalAmount).toFixed(2)}</td>
        <td>${order.paymentMethod || "-"}</td>
        <td>
          <span class="badge bg-${statusColor(order.status)}">
            ${order.status}
          </span>
        </td>
      </tr>
    `;
  }
  
  /* ===============================
     HELPERS
  =============================== */
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN");
  }
  
  function statusColor(status) {
    switch (status) {
      case "PENDING": return "warning";
      case "CONFIRMED": return "info";
      case "DELIVERED": return "success";
      case "CANCELLED": return "danger";
      default: return "secondary";
    }
  }
  