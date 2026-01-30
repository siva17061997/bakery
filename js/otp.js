const urlParams = new URLSearchParams(window.location.search);
document.getElementById('email').value = urlParams.get('email') || '';

function verifyOtp() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    if (!otp || otp.length !== 6) {
        alert('Please enter valid 6-digit OTP');
        return;
    }

    fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert(message);
            window.location.href = 'login.html';   // ✅ only on success
        } else {
            throw new Error(message);
        }
    })
    .catch(error => {
        alert('OTP Verification Failed: ' + error.message);
    });
}
