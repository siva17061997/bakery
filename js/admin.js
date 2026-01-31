/* ===============================
   GLOBALS (from config.js)
================================ */
const PRODUCT_API = "https://bakery-backend-hq21.onrender.com/api/products";
const token = localStorage.getItem("accessToken");

/* ===============================
   ADMIN AUTH CHECK (SAFE)
================================ */
if (!currentUser || currentUser.role !== "ADMIN") {
    alert("Admin access only");
    window.location.href = "login.html";
}

/* ===============================
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* ===== ADMIN INFO (SAFE) ===== */
    const adminName = document.getElementById("adminName");
    const adminEmail = document.getElementById("adminEmail");

    if (adminName) {
        adminName.textContent = currentUser.fullName || "Admin";
    }
    if (adminEmail) {
        adminEmail.textContent = currentUser.email || "";
        adminEmail.href = "#";
    }

    /* ===== PRODUCT FORM ===== */
    const productForm = document.getElementById("productForm");
    if (!productForm) return; // prevents crash on other pages

    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!token) {
            alert("Session expired. Please login again.");
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        const formData = new FormData(productForm);

        console.log("📤 Sending product to backend...");

        try {
            const res = await fetch(`${PRODUCT_API}/admin`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }

            alert("✅ Product added successfully");

            // redirect after add
            window.location.href = "list.html";

        } catch (err) {
            console.error("❌ ERROR:", err);
            alert("❌ Admin permission required or token expired");
        }
    });
});

/* ===============================
   LOGOUT
================================ */
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ===============================
   CATEGORY → SUBCATEGORY MAP
================================ */
const categoryMap = {
    "Cakes": [
        "Butterscotch Cake",
        "Fruit Cakes",
        "Cheesecakes",
        "Cupcakes",
        "Black Forest Cake",
        "Red Velvet Cake"
      ],
    
      "Cookies & Biscuits": [
        "Butter Cookies",
        "Chocolate Chip Cookies",
        "Ginger Cookies",
        "Rusks",
        "Macarons"
      ],
    
      "Pastries": [
        "Croissants",
        "Danish Pastries",
        "Cream Rolls",
        "Veg Puffs",
        "Paneer Puffs",
        "Masala Puffs"
      ],
    
      "Bars": [
        "Brownies",
        "Cheesecake Bars",
        "Chess Bars"
      ],
    
      "Savory Snacks": [
        "Rusks (Milk)",
        "Rusks (Suji)",
        "Rusks (Cardamom)",
        "Murukku",
        "Mixture",
        "Chips",
        "Crackers",
        "Breadsticks"
      ],
    
      "Millet-based": [
        "Millet Sandwich Bread",
        "Millet Buns",
        "Millet Pizzas",
        "Quinoa Puffs"
      ],
    
      "Savory Pastries": [
        "Veg Puffs",
        "Paneer Puffs",
        "Cheese Straws",
        "Jam Rolls",
        "Masala Puffs"
      ],
    
      "Whole Grain": [
        "Wholewheat Lavash",
        "Wholewheat Garlic Bread",
        "Wholewheat Buns"
      ]
    
};

/* ===============================
   LOAD SUBCATEGORIES
================================ */
function loadSubCategories() {
    const category = document.getElementById("category");
    const sub = document.getElementById("subcategory");

    if (!category || !sub) return;

    sub.innerHTML = `<option value="">-- Select Subcategory --</option>`;

    if (categoryMap[category.value]) {
        categoryMap[category.value].forEach(item => {
            const opt = document.createElement("option");
            opt.value = item;
            opt.textContent = item;
            sub.appendChild(opt);
        });
    }
}
