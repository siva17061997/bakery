function updateUserMenu() {

    let currentUser = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("accessToken");

    if (!token || !currentUser) {
        $(".user-dropdown").html(`
            <a href="login.html">Login</a>
        `);
    } else {
        $(".user-dropdown").html(`
            <a href="myaccount.html">My Account</a>
            <a href="#" onclick="logout()">Logout</a>
        `);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
