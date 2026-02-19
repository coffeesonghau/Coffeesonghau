// --- CẤU HÌNH ---
const OFFICE_LAT = 9.288933426099419; 
const OFFICE_LNG = 105.67547137936793; 
const RADIUS = 30; 
const COOLDOWN_MINS = 40;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCJ5dV9T5rDMK_95iPKPATIrbZK05NfxKIQq0kLVWXNqTE3mtCgcdlJFqSXMhdMkiW/exec"; 

// --- CƠ SỞ DỮ LIỆU TÀI KHOẢN ---
// Mã hóa SHA-256 cho mật khẩu. Mặc định mật khẩu của cả 3 người đang là: 123456
// Để tạo mã hóa cho mật khẩu mới, bạn vào trang: https://emn178.github.io/online-tools/sha256.html
const USER_DB = {
    "Nguyễn Văn A": "0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c", 
    "Nguyễn Minh Thuận": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 
    "ABC": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" 
};

let currentUser = localStorage.getItem("saved_user") || "";
let isNear = false;
let watchId = null;

// Hàm mã hóa mật khẩu
async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Tự động vào hệ thống nếu đã đăng nhập trước đó
window.onload = () => {
    setupSidebarMenu();
    if (currentUser) {
        showMainScreen();
    }
};

// Đăng nhập có kiểm tra riêng từng tài khoản
async function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const hashed = await sha256(pass);

    // Kiểm tra xem tên có trong hệ thống và mật khẩu có khớp không
    if (USER_DB[user] && USER_DB[user] === hashed) {
        currentUser = user;
        localStorage.setItem("saved_user", user); // Lưu phiên đăng nhập
        showMainScreen();
    } else {
        alert("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }
}

// Chuyển sang màn hình chính
function showMainScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('display-name').innerText = currentUser;
    startGPS();
    renderHistory();
    updateButtonUI();
}

// Tính khoảng cách
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Theo dõi GPS
function startGPS() {
    watchId = navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        isNear = dist <= RADIUS;
        document.getElementById('dist-val').innerText = Math.round(dist);
        updateButtonUI();
    }, null, { enableHighAccuracy: true });
}

// Cập nhật giao diện nút
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

// Xử lý gửi chấm công
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

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ name: currentUser })
    })
    .then(async (response) => {
        let text = await response.text();
        if (text.includes("LỖI")) {
            alert(text); // Báo lỗi nếu trên sheets không có tên
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
        alert("Lỗi kết nối đến máy chủ Google!");
        updateButtonUI();
    });
}

function renderHistory() {
    const today = new Date().toLocaleDateString('vi-VN');
    const logs = JSON.parse(localStorage.getItem('logs_' + currentUser + '_' + today) || "[]");
    document.getElementById('progress-bar-fill').style.width = (logs.length / 4 * 100) + "%";
    document.getElementById('progress-text').innerText = logs.length + "/4 lần";
    document.getElementById('history-list').innerHTML = logs.map((t, i) => `
        <div class="history-item"><span>Lần ${i+1}</span><b>${t}</b></div>
    `).join('');
}

document.getElementById('date-display').innerText = new Date().getDate() + " Tháng " + (new Date().getMonth()+1);

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

// Xóa tài khoản lưu trữ và thoát
function logout() {
    currentUser = "";
    localStorage.removeItem("saved_user");
    window.location.reload(); 
}

function resetTest() {
    const today = new Date().toLocaleDateString('vi-VN');
    localStorage.removeItem('logs_' + currentUser + '_' + today);
    localStorage.removeItem('last_time_' + currentUser);
    alert("Đã xóa dữ liệu test của tài khoản: " + currentUser);
    window.location.reload();
}

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