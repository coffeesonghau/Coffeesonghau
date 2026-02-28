const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec"; 
// LƯU Ý: Nếu bạn vừa tạo thẻ Deploy mới bên Google Apps Script, hãy dán cái Web App URL mới vào biến SCRIPT_URL ở trên nhé!

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function togglePass(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Hàm đổi mật khẩu (Dùng cho nút "Đổi mật khẩu?" bên trong app nếu có)
async function showChangePassForm() {
    const userId = localStorage.getItem('sh_user_id') || prompt("Nhập ID nhân viên của bạn:");
    if (!userId) return;

    const oldPass = prompt("Nhập MẬT KHẨU CŨ:");
    if (!oldPass) return;

    const newPass = prompt("Nhập MẬT KHẨU MỚI:");
    if (!newPass) return;

    try {
        const hashedOld = await sha256(oldPass);
        const hashedNew = await sha256(newPass);

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "changePass", user: userId, oldPass: hashedOld, newPass: hashedNew }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            localStorage.clear();
            window.location.reload();
        } else {
            alert("❌ Đổi mật khẩu thất bại: " + result.msg);
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginUserInput = document.getElementById('login-user');
    const userDisplayName = document.getElementById('user-display');
    const btnLogin = document.getElementById('btnLogin');
    
    const forgotUserInput = document.getElementById('forgot-user');
    const forgotUserDisplay = document.getElementById('forgot-user-display');
    const btnForgot = document.getElementById('btnForgot'); 

    // 1️⃣ TỰ ĐỘNG HIỆN TÊN (Trang Login)
    if (loginUserInput && userDisplayName) {
        loginUserInput.addEventListener('input', async function(e) {
            const userId = e.target.value.trim();
            if (userId.length === 6) {
                userDisplayName.innerText = "⏳ Đang kiểm tra...";
                userDisplayName.style.color = "#636e72";
                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: "checkID", user: userId }),
                        headers: { "Content-Type": "text/plain;charset=utf-8" }
                    });
                    const result = await response.json();
                    if (result.success) {
                        userDisplayName.innerText = "Chào bạn: " + result.name;
                        userDisplayName.style.color = "#27ae60";
                    } else {
                        userDisplayName.innerText = "ID không tồn tại!";
                        userDisplayName.style.color = "#e74c3c";
                    }
                } catch (err) {
                    userDisplayName.innerText = "Lỗi kết nối máy chủ";
                    userDisplayName.style.color = "#e74c3c";
                }
            } else {
                userDisplayName.innerText = "Hệ thống Sông Hậu Coffee";
                userDisplayName.style.color = "";
            }
        });
    }

    // 2️⃣ TỰ ĐỘNG HIỆN TÊN (Trang Forgot Password)
    if (forgotUserInput && forgotUserDisplay) {
        forgotUserInput.addEventListener('input', async function(e) {
            const userId = e.target.value.trim();
            if (userId.length === 6) {
                forgotUserDisplay.innerText = "⏳ Đang kiểm tra...";
                forgotUserDisplay.style.color = "#636e72";
                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: "checkID", user: userId }),
                        headers: { "Content-Type": "text/plain;charset=utf-8" }
                    });
                    const result = await response.json();
                    if (result.success) {
                        forgotUserDisplay.innerText = "Tài khoản: " + result.name;
                        forgotUserDisplay.style.color = "#27ae60"; 
                    } else {
                        forgotUserDisplay.innerText = "ID không tồn tại!";
                        forgotUserDisplay.style.color = "#e74c3c"; 
                    }
                } catch (err) {
                    forgotUserDisplay.innerText = "Lỗi kết nối máy chủ";
                    forgotUserDisplay.style.color = "#e74c3c";
                }
            } else {
                forgotUserDisplay.innerText = "Thiết lập lại mật khẩu mới";
                forgotUserDisplay.style.color = ""; 
            }
        });
    }

    // 3️⃣ XỬ LÝ ĐĂNG NHẬP (Trang Login)
    if (btnLogin) {
        btnLogin.addEventListener('click', async function() {
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;

            if (user.length !== 6 || !pass) {
                return alert("Vui lòng nhập ID 6 số và mật khẩu!");
            }

            this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ĐANG XÁC THỰC...';
            this.disabled = true;

            try {
                const hashedPass = await sha256(pass);
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: "login", user: user, password: hashedPass }),
                    headers: { "Content-Type": "text/plain;charset=utf-8" }
                });

                const result = await response.json();

                if (result.success) {
                    // GIỮ NGUYÊN LOCALSTORAGE THEO YÊU CẦU
                    localStorage.setItem('sh_is_logged_in', 'true');
                    localStorage.setItem('sh_user_id', user);
                    localStorage.setItem('sh_user_name', result.name);
                    window.location.href = "index.html";
                } else {
                    alert("Sai mật khẩu hoặc tài khoản!");
                    this.innerHTML = "ĐĂNG NHẬP";
                    this.disabled = false;
                }
            } catch (e) {
                alert("Lỗi kết nối máy chủ!");
                this.innerHTML = "ĐĂNG NHẬP";
                this.disabled = false;
            }
        });
    }

    // 4️⃣ XỬ LÝ QUÊN MẬT KHẨU (Trang Forgot Password)
    if (btnForgot) {
        btnForgot.addEventListener('click', async function() {
            const userInput = document.getElementById('forgot-user').value.trim();
            const passInput = document.getElementById('forgot-pass');
            const newPass = passInput ? passInput.value : '';

            if(!userInput || !newPass) {
                alert("Vui lòng nhập đầy đủ ID nhân viên và Mật khẩu mới!");
                return;
            }

            if(userInput.length !== 6) {
                alert("ID nhân viên không hợp lệ (Phải đủ 6 số)!");
                return;
            }

            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ĐANG XÁC THỰC...';
            btn.disabled = true;

            try {
                // Check xem ID có tồn tại trên Google Sheets không
                const resCheck = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: "checkID", user: userInput }),
                    headers: { "Content-Type": "text/plain;charset=utf-8" }
                });
                const checkResult = await resCheck.json();

                if (checkResult.success) {
                    // Mã hóa SHA256 mật khẩu mới
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';
                    const hashedNew = await sha256(newPass);

                    // Gửi lệnh đổi mật khẩu xuống Server (mã.gs)
                    const resReset = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: "resetPass", user: userInput, newPass: hashedNew }),
                        headers: { "Content-Type": "text/plain;charset=utf-8" }
                    });
                    const resetResult = await resReset.json();

                    if (resetResult.success) {
                        alert(`✅ Thành công! Đã đổi mật khẩu cho tài khoản: ${checkResult.name}\n\nHãy đăng nhập lại bằng mật khẩu mới.`);
                        window.location.href = "login.html"; // Chuyển về trang đăng nhập
                    } else {
                        alert("❌ Có lỗi xảy ra khi lưu: " + resetResult.msg);
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                } else {
                    alert("❌ Không tìm thấy ID Nhân viên này trong hệ thống!");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (e) {
                alert("Lỗi kết nối máy chủ! Vui lòng kiểm tra lại mạng 3G/Wi-Fi.");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        // HỖ TRỢ PHÍM ENTER KHI ĐỔI MẬT KHẨU
        const forgotPassInput = document.getElementById('forgot-pass');
        if (forgotPassInput) {
            forgotPassInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    btnForgot.click();
                }
            });
        }
    }

    // 5️⃣ HỖ TRỢ PHÍM ENTER KHI ĐĂNG NHẬP (Trang Login)
    const loginPassInput = document.getElementById('login-pass');
    if (loginPassInput && btnLogin) {
        loginPassInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnLogin.click();
            }
        });
    }
});