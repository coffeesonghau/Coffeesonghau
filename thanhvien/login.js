// login.js

// ================= CẤU HÌNH (IT SETUP) =================
// Mã HASH SHA-256 của mật khẩu. (Hiện tại đang là: admin123)
const IT_PROVIDED_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; 

// Thời gian tự động đăng xuất (tính bằng mili giây)
// Ví dụ: 15 phút = 15 * 60 * 1000 = 900000
const AUTO_LOGOUT_TIME = 15 * 60 * 1000; 

// ================= HÀM MÃ HÓA SHA-256 =================
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// ================= LOGIC ĐĂNG NHẬP =================
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("login-overlay");
    const loginInput = document.getElementById("login-pass");
    const loginBtn = document.getElementById("btn-login-submit");
    const errorMsg = document.getElementById("login-error");

    // 1. Kiểm tra xem đã đăng nhập chưa khi tải trang
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        overlay.classList.add("hidden-overlay");
        startIdleTimer(); // Bắt đầu tính giờ idle
    } else {
        // Nếu chưa đăng nhập, đảm bảo overlay hiện
        overlay.classList.remove("hidden-overlay");
        loginInput.focus();
    }

    // 2. Xử lý sự kiện bấm nút Đăng nhập
    async function handleLogin() {
        const inputPass = loginInput.value;
        if (!inputPass) return;

        // Vô hiệu hóa nút để tránh bấm nhiều lần
        loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking...';
        loginBtn.disabled = true;

        try {
            // Mã hóa mật khẩu người dùng nhập
            const hashedInput = await sha256(inputPass);

            // So sánh với mã Hash của IT
            if (hashedInput === IT_PROVIDED_HASH) {
                // ĐÚNG MẬT KHẨU
                sessionStorage.setItem("isLoggedIn", "true");
                overlay.classList.add("hidden-overlay");
                errorMsg.style.display = "none";
                startIdleTimer();
            } else {
                // SAI MẬT KHẨU
                errorMsg.style.display = "block";
                errorMsg.innerText = "Mật khẩu không đúng!";
                loginInput.value = "";
                loginInput.focus();
            }
        } catch (e) {
            console.error(e);
            errorMsg.innerText = "Lỗi trình duyệt, vui lòng thử lại.";
            errorMsg.style.display = "block";
        } finally {
            loginBtn.innerText = "ĐĂNG NHẬP HỆ THỐNG";
            loginBtn.disabled = false;
        }
    }

    loginBtn.addEventListener("click", handleLogin);
    
    // Hỗ trợ bấm Enter
    loginInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
    });
});

// ================= LOGIC AUTO LOGOUT (IDLE TIMER) =================
let idleTimeout;

function logout() {
    sessionStorage.removeItem("isLoggedIn");
    alert("Hết phiên làm việc. Vui lòng đăng nhập lại!");
    window.location.reload(); // Tải lại trang để hiện form login
}

function resetIdleTimer() {
    // Chỉ reset nếu người dùng đang ở trạng thái đã đăng nhập
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(logout, AUTO_LOGOUT_TIME);
    }
}

function startIdleTimer() {
    // Các sự kiện được coi là "người dùng đang hoạt động"
    window.onload = resetIdleTimer;
    window.onmousemove = resetIdleTimer;
    window.onmousedown = resetIdleTimer; // Cảm ứng / Click
    window.ontouchstart = resetIdleTimer; // Mobile
    window.onclick = resetIdleTimer;     
    window.onkeypress = resetIdleTimer;   
    window.addEventListener('scroll', resetIdleTimer, true); 
    
    resetIdleTimer(); // Bắt đầu đếm ngay
}