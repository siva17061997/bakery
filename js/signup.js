document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                email,
                password,
                confirmPassword
            })
        });

        const message = await response.text();

        if (!response.ok) {
            throw new Error(message);
        }

        alert(message);

        // 🔥 THIS IS THE KEY FIX
        window.location.href = `otp.html?email=${encodeURIComponent(email)}`;

    } catch (error) {
        alert("Signup failed: " + error.message);
    }
});
