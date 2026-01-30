const params = new URLSearchParams(window.location.search);
document.getElementById("email").value = params.get("email");

async function resetPassword() {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;
    const newPassword = document.getElementById("newPassword").value;

    if (!otp || !newPassword) {
        alert("Fill all fields!");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword })
        });

        if (!res.ok) throw new Error(await res.text());

        alert("Password reset successful!");
        window.location.href = "login.html";   // 🔁 Auto Redirect

    } catch (e) {
        alert("Error: " + e.message);
    }
}
