// --- CẤU HÌNH HỆ THỐNG ---
const OFFICE_LAT = 9.288933426099419; 
const OFFICE_LNG = 105.67547137936793; 
const RADIUS = 30; // Bán kính cho phép chấm công (mét)
const COOLDOWN_MINS = 40; // Thời gian chờ giữa 2 lần chấm công (phút)

// THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY (Nhớ dùng link phiên bản mới nhất nhé)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCJ5dV9T5rDMK_95iPKPATIrbZK05NfxKIQq0kLVWXNqTE3mtCgcdlJFqSXMhdMkiW/exec"; 

// --- CƠ SỞ DỮ LIỆU TÀI KHOẢN ---
// Mật khẩu riêng cho từng người (Mã hóa SHA-256)
const USER_DB = {
    "Nguyễn Văn A": "0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c", // Pass: 123456
    "Nguyễn Minh Thuận": "13b96ba713ec367ba4fdf243e8ba2eb2e3de03b22cfd86fb35092a8385e0de59", // Pass: thuan123
    "ABC": "1290fd398fbfd8fbcc03cd711f181fcdfb6eddf333ab5a94ee8999ff391d4e0d" // Pass: abc123
};

let currentUser = localStorage.getItem("saved_user") || "";
let isNear = false;
let watchId = null;

// 1. Khởi tạo khi tải trang
window.onload = () => {
    setupSidebarMenu();
    if (currentUser) {
        showMainScreen(); // Tự động vào thẳng hệ thống nếu đã đăng nhập trước đó
    }
};

// 2. Hàm mã hóa Mật khẩu
async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 3. Xử lý Đăng nhập (Đã cải tiến)
async function login() {
    // Chuẩn hóa chuỗi: xóa khoảng trắng thừa 2 đầu và giữa các chữ
    const rawUser = document.getElementById('username').value.trim().replace(/\s+/g, ' ');
    const pass = document.getElementById('password').value;

    // Cảnh báo nếu để trống
    if (!rawUser || !pass) {
        alert("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");
        return;
    }

    const hashed = await sha256(pass);
    const btnLogin = document.querySelector('.btn-login');
    btnLogin.innerText = "ĐANG KIỂM TRA...";
    btnLogin.disabled = true;

    setTimeout(() => {
        // Tìm tên trong DB không phân biệt chữ hoa/thường
        const validUserKey = Object.keys(USER_DB).find(k => k.toLowerCase() === rawUser.toLowerCase());

        if (validUserKey && USER_DB[validUserKey] === hashed) {
            currentUser = validUserKey; // Lấy tên chuẩn (có viết hoa) từ DB
            localStorage.setItem("saved_user", currentUser); 
            showMainScreen();
        } else {
            alert("Tên đăng nhập hoặc mật khẩu không chính xác!");
        }
        
        btnLogin.innerText = "VÀO HỆ THỐNG";
        btnLogin.disabled = false;
    }, 300); // Thêm độ trễ 0.3s để UI hiển thị mượt mà hơn
}

// TÍNH NĂNG MỚI: Nhấn Enter để đăng nhập
function handleEnter(e) {
    if (e.key === 'Enter') {
        login();
    }
}

// TÍNH NĂNG MỚI: Ẩn/Hiện mật khẩu
function togglePassword() {
    const passInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleIcon.innerText = 'visibility';
    } else {
        passInput.type = 'password';
        toggleIcon.innerText = 'visibility_off';
    }
}

// 4. Chuyển sang màn hình chính (App)
function showMainScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('display-name').innerText = currentUser;
    
    // Hiển thị ngày tháng hôm nay
    document.getElementById('date-display').innerText = new Date().getDate() + " Tháng " + (new Date().getMonth()+1);
    
    startGPS();
    renderHistory();
    updateButtonUI();
}

// 5. Tính khoảng cách GPS
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 6. Theo dõi GPS
function startGPS() {
    watchId = navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        isNear = dist <= RADIUS;
        document.getElementById('dist-val').innerText = Math.round(dist);
        updateButtonUI();
    }, null, { enableHighAccuracy: true });
}

// 7. Cập nhật trạng thái Nút bấm (Tách biệt theo người dùng)
function updateButtonUI() {
    const btn = document.getElementById('check-btn');
    const label = document.getElementById('btn-label');
    const timer = document.getElementById('btn-timer');
    const status = document.getElementById('status-text');

    const last = localStorage.getItem('last_time_' + currentUser);
    const now = Date.now();
    const wait = COOLDOWN_MINS * 60 * 1000;

    if (last && (now - last < wait)) {
        const rem = Math.ceil((wait - (now - last)) / 1000);
        label.innerText = "ĐÃ GHI NHẬN";
        timer.innerText = `Chờ: ${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')}`;
        btn.disabled = true;
        setTimeout(updateButtonUI, 1000);
    } else if (isNear) {
        label.innerText = "CHẤM CÔNG";
        timer.innerText = "";
        btn.disabled = false;
        status.innerText = "Vị trí hợp lệ";
    } else {
        label.innerText = "NGOÀI VÙNG";
        btn.disabled = true;
        status.innerText = "Ngoài bán kính " + RADIUS + "m";
    }
}

// 8. Xử lý khi bấm nút Chấm công
function handleAction() {
    const today = new Date().toLocaleDateString('vi-VN');
    let logs = JSON.parse(localStorage.getItem('logs_' + currentUser + '_' + today) || "[]");

    if (logs.length >= 4) {
        alert("Bạn đã chấm công đủ 4 lần hôm nay!");
        return;
    }

    const btn = document.getElementById('check-btn');
    const label = document.getElementById('btn-label');
    label.innerText = "ĐANG GỬI...";
    btn.disabled = true;

    // Gửi dữ liệu (Có thêm text/plain để chống lỗi chặn truy cập)
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({ name: currentUser })
    })
    .then(async (response) => {
        let text = await response.text();
        
        if (text.includes("LỖI")) {
            alert("Hệ thống báo: " + text); 
            updateButtonUI();
            return;
        }

        logs.push(new Date().toLocaleTimeString('vi-VN'));
        localStorage.setItem('logs_' + currentUser + '_' + today, JSON.stringify(logs));
        localStorage.setItem('last_time_' + currentUser, Date.now());

        if (logs.length === 4) {
            alert("Đã đủ 4 lần! Hoàn thành 1 ngày công.");
        } else {
            alert("Thành công! Đã ghi nhận công cho " + currentUser);
        }
        
        renderHistory();
        updateButtonUI();
    })
    .catch(error => {
        alert("Lỗi mạng: Không thể kết nối đến máy chủ Google. Vui lòng kiểm tra lại đường truyền!");
        console.error(error);
        updateButtonUI();
    });
}

// 9. Hiển thị lịch sử trong ngày
function renderHistory() {
    const today = new Date().toLocaleDateString('vi-VN');
    const logs = JSON.parse(localStorage.getItem('logs_' + currentUser + '_' + today) || "[]");
    document.getElementById('progress-bar-fill').style.width = (logs.length / 4 * 100) + "%";
    document.getElementById('progress-text').innerText = logs.length + "/4 lần";
    document.getElementById('history-list').innerHTML = logs.map((t, i) => `
        <div class="history-item"><span>Lần ${i+1}</span><b>${t}</b></div>
    `).join('');
}

// 10. Đóng/Mở Menu Sidebar
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

// 11. Đăng xuất
function logout() {
    currentUser = "";
    localStorage.removeItem("saved_user"); // Xóa nhớ đăng nhập
    window.location.reload(); 
}

// 12. Xóa dữ liệu Test (Để bấm liên tục không cần chờ)
function resetTest() {
    const today = new Date().toLocaleDateString('vi-VN');
    localStorage.removeItem('logs_' + currentUser + '_' + today);
    localStorage.removeItem('last_time_' + currentUser);
    alert("Đã xóa dữ liệu test của tài khoản: " + currentUser);
    window.location.reload();
}

// 13. Tự động chèn nút Reset vào Menu
function setupSidebarMenu() {
    const sidebar = document.querySelector('.sidebar-menu');
    if (sidebar && !document.getElementById('btn-reset-test')) {
        sidebar.innerHTML += `
        <hr style="border: 0.5px solid #eee; margin: 10px 0;">
        <li id="btn-reset-test" onclick="resetTest()" style="color: #ff9800;">
            <span class="material-icons-round" style="color: #ff9800;">cleaning_services</span> Xóa dữ liệu Test
        </li>`;
    }
}