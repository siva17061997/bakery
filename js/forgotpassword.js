async function sendOtp() {
    const email = document.getElementById('fpEmail').value.trim();

    if (!email) {
        alert("Enter email!");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) throw new Error(await res.text());

        alert("OTP sent to your email");
        window.location.href = `resetpassword.html?email=${encodeURIComponent(email)}`;

    } catch (e) {
        alert("Error: " + e.message);
    }
}
