let allItems = [];

document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const tbody = document.getElementById("orderTableBody");

  /* ===============================
     ADMIN ACCESS CHECK
  ================================ */
  if (!token || !user || user.role !== "ADMIN") {
    document.body.innerHTML = `
      <div style="text-align:center;margin-top:80px;">
        <h3 style="color:red;">🚫 Access Denied</h3>
        <p>Admin access only</p>
      </div>
    `;
    return;
  }

  /* ===============================
     LOAD ADMIN ORDERS
  ================================ */
  fetch("http://localhost:8080/api/orders/admin", {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => {
    if (!res.ok) throw new Error("Forbidden");
    return res.json();
  })
  .then(data => {

    if (!data.success) return;

    allItems = [];

    data.orders.forEach(order => {
      const isToday = isTodayOrder(order.createdAt);

      order.items.forEach(item => {
        allItems.push({
          rawDate: order.createdAt,
          date: formatDate(order.createdAt),
          isToday: isToday,
          name: order.name,
          mobile: order.mobile,
          subCategory: item.name,
          qty: item.qty,
          total: calculateTotal(item),
          payment: order.paymentMethod
        });
      });
    });

    renderTable(allItems);
  })
  .catch(() => {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger">
          Failed to load orders
        </td>
      </tr>`;
  });
});

/* ===============================
   APPLY FILTERS
=============================== */
function applyFilters() {

  const name = document.getElementById("filterName").value.toLowerCase();
  const mobile = document.getElementById("filterMobile").value;
  const category = document.getElementById("filterCategory").value.toLowerCase();
  const date = document.getElementById("filterDate").value;

  const filtered = allItems.filter(i =>
    (!name || i.name.toLowerCase().includes(name)) &&
    (!mobile || i.mobile.includes(mobile)) &&
    (!category || i.subCategory.toLowerCase().includes(category)) &&
    (!date || formatDate(i.rawDate) === formatDate(date))
  );

  renderTable(filtered);
}

/* ===============================
   QUICK FILTER BUTTONS
=============================== */
function filterToday() {
  const today = new Date().toDateString();
  renderTable(allItems.filter(i =>
    new Date(i.rawDate).toDateString() === today
  ));
}

function filterYesterday() {
  const y = new Date();
  y.setDate(y.getDate() - 1);

  renderTable(allItems.filter(i =>
    new Date(i.rawDate).toDateString() === y.toDateString()
  ));
}

function filterLast7Days() {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 7);

  renderTable(allItems.filter(i => {
    const d = new Date(i.rawDate);
    return d >= past && d <= now;
  }));
}

/* ===============================
   CLEAR FILTERS
=============================== */
function clearFilters() {
  document.getElementById("filterName").value = "";
  document.getElementById("filterMobile").value = "";
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterDate").value = "";
  renderTable(allItems);
}

/* ===============================
   RENDER TABLE
=============================== */
function renderTable(items) {

  const tbody = document.getElementById("orderTableBody");
  tbody.innerHTML = "";

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          No matching records
        </td>
      </tr>`;
    updateSummary([]);
    return;
  }

  items.forEach((i, index) => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="${i.isToday ? "today-order" : ""}">
        <td>${index + 1}</td>
        <td>
          ${i.date}
          ${i.isToday ? `<span class="badge bg-success today-badge">Today</span>` : ""}
        </td>
        <td>${i.name}</td>
        <td>${i.mobile}</td>
        <td>${i.subCategory}</td>
        <td>${i.qty}</td>
        <td>${i.total.toFixed(2)}</td>
        <td>${i.payment}</td>
      </tr>
    `);
  });

  updateSummary(items);
}

/* ===============================
   SUMMARY BAR
=============================== */
function updateSummary(items) {
  document.getElementById("sumOrders").innerText = items.length;
  document.getElementById("sumQty").innerText =
    items.reduce((s, i) => s + i.qty, 0);
  document.getElementById("sumAmount").innerText =
    items.reduce((s, i) => s + i.total, 0).toFixed(2);
}

/* ===============================
   EXPORT CSV
=============================== */
function exportCSV() {

  if (allItems.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    "Date","Name","Mobile","Subcategory",
    "Quantity","Total","Payment"
  ];

  let csv = headers.join(",") + "\n";

  allItems.forEach(i => {
    csv += [
      i.date, i.name, i.mobile,
      i.subCategory, i.qty,
      i.total.toFixed(2), i.payment
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "admin-orders.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* ===============================
   HELPERS
=============================== */
function calculateTotal(item) {
  const base = item.price * item.qty;
  return base + (base * item.gst / 100);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN");
}

function isTodayOrder(dateStr) {
  if (!dateStr) return false;
  const t = new Date();
  const d = new Date(dateStr);
  return (
    t.getDate() === d.getDate() &&
    t.getMonth() === d.getMonth() &&
    t.getFullYear() === d.getFullYear()
  );
}
