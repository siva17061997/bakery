document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // AUTH CHECK
    // ===============================
    const token = localStorage.getItem("accessToken");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !currentUser || currentUser.role !== "ADMIN") {
        alert("Admin login required");
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    const API_BASE = "http://localhost:8080/api/products";

    // ===============================
    // GET PRODUCT ID
    // ===============================
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("Invalid product ID");
        window.location.href = "admin-products.html";
        return;
    }

    document.getElementById("productId").value = productId;

    // ===============================
    // LOAD PRODUCT
    // ===============================
    fetch(`${API_BASE}/${productId}`)
        .then(res => {
            if (!res.ok) throw new Error("Not found");
            return res.json();
        })
        .then(p => {
            document.getElementById("name").value = p.name;
            document.getElementById("category").value = p.category;
            document.getElementById("subcategory").value = p.subcategory;
            document.getElementById("price").value = p.price;
            document.getElementById("mrp").value = p.mrp;
            document.getElementById("discount").value = p.discount;
            document.getElementById("gst").value = p.gst;
            document.getElementById("qtyType").value = p.qtyType;
            document.getElementById("quantity").value = p.quantity;
            document.getElementById("previewImage").src = p.imageUrl;
        })
        .catch(() => {
            alert("Failed to load product");
            window.location.href = "admin-products.html";
        });

    // ===============================
    // UPDATE PRODUCT
    // ===============================
    document
        .getElementById("editProductForm")
        .addEventListener("submit", async (e) => {

            e.preventDefault();

            const formData = new FormData();

            formData.append("name", name.value);
            formData.append("category", category.value);
            formData.append("subcategory", subcategory.value);
            formData.append("price", price.value);
            formData.append("mrp", mrp.value);
            formData.append("discount", discount.value);
            formData.append("gst", gst.value);
            formData.append("qtyType", qtyType.value);
            formData.append("quantity", quantity.value);

            if (image.files.length > 0) {
                formData.append("image", image.files[0]);
            }

            try {
                const res = await fetch(
                    `${API_BASE}/admin/${productId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                if (!res.ok) {
                    const err = await res.text();
                    throw new Error(err);
                }

                alert("✅ Product updated successfully");
                window.location.href = "admin-products.html";

            } catch (err) {
                console.error(err);
                alert("❌ Update failed (token expired or server error)");
            }
        });
});
