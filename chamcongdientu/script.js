// --- CẤU HÌNH ---
const OFFICE_LAT = 9.288933426099419; 
const OFFICE_LNG = 105.67547137936793; 
const RADIUS = 30; 
const COOLDOWN_MINS = 40;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCJ5dV9T5rDMK_95iPKPATIrbZK05NfxKIQq0kLVWXNqTE3mtCgcdlJFqSXMhdMkiW/exec"; 
const HASHED_PW = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // Mặc định: 123456

let currentUser = "";
let isNear = false;
let watchId = null;

// 1. Mã hóa SHA-256
async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 2. Đăng nhập
async function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const hashed = await sha256(pass);

    if (user && hashed === HASHED_PW) {
        currentUser = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        document.getElementById('display-name').innerText = user;
        startGPS();
        renderHistory();
    } else {
        alert("Thông tin không chính xác!");
    }
}

// 3. Tính khoảng cách GPS
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 4. Theo dõi GPS
function startGPS() {
    watchId = navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        isNear = dist <= RADIUS;
        document.getElementById('dist-val').innerText = Math.round(dist);
        updateButtonUI();
    }, null, { enableHighAccuracy: true });
}

// 5. Cập nhật giao diện nút
function updateButtonUI() {
    const btn = document.getElementById('check-btn');
    const label = document.getElementById('btn-label');
    const timer = document.getElementById('btn-timer');
    const status = document.getElementById('status-text');

    const last = localStorage.getItem('last_time');
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

// 6. Xử lý Chấm công (Cải tiến có trạng thái ĐANG GỬI)
function handleAction() {
    const today = new Date().toLocaleDateString('vi-VN');
    let logs = JSON.parse(localStorage.getItem('logs_' + today) || "[]");

    if (logs.length >= 4) {
        alert("Bạn đã chấm công đủ 4 lần hôm nay!");
        return;
    }

    // Đổi giao diện sang trạng thái đang tải
    const btn = document.getElementById('check-btn');
    const label = document.getElementById('btn-label');
    label.innerText = "ĐANG GỬI...";
    btn.disabled = true;

    // Gửi dữ liệu lên Google Sheets (Bỏ qua cấu hình phức tạp để tránh lỗi CORS)
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ name: currentUser })
    })
    .then(response => {
        // Chỉ lưu LocalStorage và báo thành công khi đã gửi đi xong
        logs.push(new Date().toLocaleTimeString('vi-VN'));
        localStorage.setItem('logs_' + today, JSON.stringify(logs));
        localStorage.setItem('last_time', Date.now()); // Kích hoạt đếm ngược 40 phút

        if (logs.length === 4) {
            alert("Đã đủ 4 lần! Hoàn thành 1 ngày công.");
        } else {
            alert("Thành công! Ghi nhận chấm công lần " + logs.length);
        }
        
        renderHistory();
        updateButtonUI();
    })
    .catch(error => {
        alert("Lỗi mạng: Không thể gửi dữ liệu lên máy chủ!");
        console.error(error);
        updateButtonUI(); // Khôi phục nút nếu gửi lỗi
    });
}

// 7. Cập nhật giao diện lịch sử
function renderHistory() {
    const today = new Date().toLocaleDateString('vi-VN');
    const logs = JSON.parse(localStorage.getItem('logs_' + today) || "[]");
    document.getElementById('progress-bar-fill').style.width = (logs.length / 4 * 100) + "%";
    document.getElementById('progress-text').innerText = logs.length + "/4 lần";
    document.getElementById('history-list').innerHTML = logs.map((t, i) => `
        <div class="history-item"><span>Lần ${i+1}</span><b>${t}</b></div>
    `).join('');
}

document.getElementById('date-display').innerText = new Date().getDate() + " Tháng " + (new Date().getMonth()+1);

// 8. Đóng/mở thanh Menu (Sidebar)
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

// 9. Chức năng Đăng xuất
function logout() {
    currentUser = "";
    localStorage.removeItem('last_time'); // Tùy chọn: Xóa thời gian chờ khi đăng xuất
    window.location.reload(); 
}

// 10. TÍNH NĂNG MỚI: Reset để Test (Tự động chèn vào Menu)
function resetTest() {
    localStorage.clear();
    alert("Đã xóa thời gian chờ 40 phút và lịch sử số lần bấm! Bạn có thể test liên tục.");
    window.location.reload();
}

// Tự động thêm nút Reset vào Sidebar khi trang tải xong
window.onload = () => {
    const sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        sidebar.innerHTML += `
        <hr style="border: 0.5px solid #eee; margin: 10px 0;">
        <li onclick="resetTest()" style="color: #ff9800;">
            <span class="material-icons-round" style="color: #ff9800;">cleaning_services</span> Xóa dữ liệu Test
        </li>`;
    }
};