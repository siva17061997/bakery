document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
      const response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
      }

      const data = await response.json();

      /* ===============================
         STORE AUTH DATA
      ================================ */
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      /* 🔥 CART PER USER (SAFE) */
      localStorage.setItem("activeCartKey", `cart_${data.user.id}`);

      if (!localStorage.getItem(`cart_${data.user.id}`)) {
          localStorage.setItem(`cart_${data.user.id}`, JSON.stringify([]));
      }

      /* ===============================
         ROLE-BASED REDIRECT
      ================================ */
      const role = data.user.role; // "USER" or "ADMIN"

      if (role === "ADMIN") {
          // ✅ Admin → Admin dashboard only
          window.location.href = "admin.html";
      } else {
          // ✅ Normal user → Home page
          window.location.href = "index.html";
      }

  } catch (error) {
      alert("Login failed: " + error.message);
  }
});
