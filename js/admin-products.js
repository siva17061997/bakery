/* ===============================
   CONFIG (NO redeclaration)
================================ */
const PRODUCTS_API = "https://bakery-backend-a7vn.onrender.com/api/products";
const IMAGE_BASE = "https://bakery-backend-a7vn.onrender.com";
// const token = localStorage.getItem("accessToken");
// const currentUser = JSON.parse(localStorage.getItem("user") || "null");

/* ===============================
   ADMIN AUTH CHECK
================================ */
// if (!currentUser || currentUser.role !== "ADMIN") {
//     alert("Admin access only");
//     window.location.href = "login.html";
// }

/* ===============================
   STATE
================================ */
let products = [];
let filteredProducts = [];

/* ===============================
   LOAD PRODUCTS
================================ */
fetch(PRODUCTS_API)
  .then(res => res.json())
  .then(data => {
      products = data.content || [];
      filteredProducts = [...products];
      loadFilters(products);
      renderProducts(filteredProducts);
  })
  .catch(err => {
      console.error("❌ Load failed:", err);
      alert("Failed to load products");
  });

/* ===============================
   RENDER TABLE
================================ */
function renderProducts(list) {

  let html = "";

  list.forEach(p => {
    html += `
      <tr>
        <td>
          <img src="${IMAGE_BASE}${p.imageUrl}"
               width="60"
               height="60"
               style="object-fit:cover"
               onerror="this.src='assets/no-image.png'">
        </td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.subcategory}</td>
        <td>₹${p.price}</td>
        <td>${p.quantity}</td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="editProduct(${p.id})">
            Edit
          </button>
          <button class="btn btn-sm btn-danger ml-1"
            onclick="deleteProduct(${p.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("adminProducts").innerHTML =
    html || `<tr><td colspan="7" class="text-center">No products found</td></tr>`;
}

/* ===============================
   LOAD FILTER DROPDOWNS
================================ */
function loadFilters(list) {

  const categories = [...new Set(list.map(p => p.category))];
  const subcategories = [...new Set(list.map(p => p.subcategory))];

  const catSelect = document.getElementById("filterCategory");
  const subSelect = document.getElementById("filterSubcategory");

  catSelect.innerHTML =
    `<option value="">All Categories</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");

  subSelect.innerHTML =
    `<option value="">All Subcategories</option>` +
    subcategories.map(s => `<option value="${s}">${s}</option>`).join("");
}

/* ===============================
   APPLY SEARCH + FILTER
================================ */
function applyFilter() {

  const search = document.getElementById("searchInput").value.toLowerCase();
  const cat = document.getElementById("filterCategory").value;
  const sub = document.getElementById("filterSubcategory").value;

  filteredProducts = products.filter(p =>
    (!cat || p.category === cat) &&
    (!sub || p.subcategory === sub) &&
    (
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.subcategory.toLowerCase().includes(search)
    )
  );

  renderProducts(filteredProducts);
}

/* ===============================
   DELETE PRODUCT
================================ */
function deleteProduct(id) {

  if (!token) {
    alert("Session expired. Login again.");
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }

  if (!confirm("Delete this product?")) return;

  fetch(`${PRODUCTS_API}/admin/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Delete failed");
    alert("✅ Product deleted");
    products = products.filter(p => p.id !== id);
    applyFilter();
  })
  .catch(err => {
    console.error(err);
    alert("❌ Admin permission required");
  });
}

/* ===============================
   EDIT PRODUCT
================================ */
function editProduct(id) {
  window.location.href = `edit-product.html?id=${id}`;
}
