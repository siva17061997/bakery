const BASE_URL = "https://bakery-backend-hq21.onrender.com/api/auth";
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) {
    localStorage.clear();
    window.location.href = "login.html";
}


$("#header").load("header.html", function () {
    updateUserMenu();
    renderCartPopup();   // ✅ REQUIRED
    updateCartCount();   // ✅ REQUIRED
  });



function togglePassword(id, el) {
    const input = document.getElementById(id);
    const icon = el.querySelector('i');

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}




