// --- CẤU HÌNH HỆ THỐNG ---
const OFFICE_LAT = 9.297882062370338; 
const OFFICE_LNG = 105.68558983928828; 
const RADIUS = 30; 
const COOLDOWN_MINS = 40; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCJ5dV9T5rDMK_95iPKPATIrbZK05NfxKIQq0kLVWXNqTE3mtCgcdlJFqSXMhdMkiW/exec"; 

let currentUser = localStorage.getItem("saved_user") || "";
let isNear = false;
let watchId = null;
let currentStream = null;

// Khởi tạo
window.onload = () => {
    registerServiceWorker(); // Kích hoạt PWA
    if (currentUser) {
        showMainScreen();
    }
};

// PWA Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('PWA Service Worker Đã Đăng Ký'))
        .catch(err => console.log('Lỗi PWA:', err));
    }
}

// UI Trạng thái Tải
function setGlobalLoading(isLoading, text = "Đang xử lý...") {
    const loader = document.getElementById('global-loading');
    document.getElementById('loading-text').innerText = text;
    if (isLoading) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

// Đăng nhập kết nối với Google Sheets
async function login() {
    const rawUser = document.getElementById('username').value.trim().replace(/\s+/g, ' ');
    const pass = document.getElementById('password').value;

    if (!rawUser || !pass) return alert("Vui lòng nhập đầy đủ!");

    setGlobalLoading(true, "Đang xác thực với hệ thống...");

    // Mã hóa mật khẩu sang SHA-256 trước khi gửi đi
    const buf = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
    const hashed = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Gọi API lên Google Apps Script
    const payload = {
        action: "login",
        username: rawUser,
        password: hashed // Gửi mã băm lên thay vì mật khẩu gốc
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Chuẩn hóa tên viết hoa chữ cái đầu nếu muốn, hoặc dùng tên user nhập
            currentUser = rawUser;
            localStorage.setItem("saved_user", currentUser); 
            showMainScreen();
        } else {
            alert(data.message); // Hiển thị lỗi từ server ("Sai mật khẩu", "Không tìm thấy"...)
        }
    })
    .catch(error => {
        alert("Lỗi kết nối mạng! Vui lòng thử lại.");
        console.error(error);
    })
    .finally(() => {
        setGlobalLoading(false);
    });
}

function handleEnter(e) { if (e.key === 'Enter') login(); }

function togglePassword() {
    const passInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
    toggleIcon.innerText = passInput.type === 'password' ? 'visibility_off' : 'visibility';
}

function showMainScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('display-name').innerText = currentUser;
    document.getElementById('date-display').innerText = new Date().getDate() + " Tháng " + (new Date().getMonth()+1);
    
    startGPS();
    fetchHistoryFromServer(); // Lấy lịch sử thật từ Server (Mô phỏng)
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Xử lý GPS nâng cao
function startGPS() {
    const status = document.getElementById('status-text');
    const icon = document.getElementById('gps-icon');

    watchId = navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        isNear = dist <= RADIUS;
        document.getElementById('dist-val').innerText = Math.round(dist);
        
        status.innerText = isNear ? "Vị trí hợp lệ" : `Ngoài bán kính (${Math.round(dist)}m)`;
        status.classList.remove('gps-error');
        icon.classList.remove('gps-error-icon');
        icon.innerText = "my_location";
        
        updateButtonUI();
    }, err => {
        status.classList.add('gps-error');
        icon.classList.add('gps-error-icon');
        icon.innerText = "location_off";
        document.getElementById('check-btn').disabled = true;

        if (err.code === 1) status.innerText = "Lỗi: Bị từ chối quyền vị trí!";
        else if (err.code === 2) status.innerText = "Lỗi: Mất tín hiệu GPS!";
        else if (err.code === 3) status.innerText = "Lỗi: Quá thời gian lấy tọa độ!";
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

function updateButtonUI() {
    const btn = document.getElementById('check-btn');
    const label = document.getElementById('btn-label');
    const timer = document.getElementById('btn-timer');

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
    } else {
        label.innerText = "NGOÀI VÙNG";
        btn.disabled = true;
    }
}

// MỞ CAMERA CHỐNG GIAN LẬN
async function openCameraModal() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-stream');
    modal.classList.remove('hidden');

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        video.srcObject = currentStream;
    } catch (err) {
        alert("Không thể mở camera. Vui lòng cấp quyền camera để chấm công!");
        closeCameraModal();
    }
}

function closeCameraModal() {
    document.getElementById('camera-modal').classList.add('hidden');
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

// CHỤP VÀ GỬI LÊN SERVER
function captureAndSubmit() {
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    const ctx = canvas.getContext('2d');
    
    // Đặt kích thước ảnh nhỏ lại để gửi nhanh hơn
    canvas.width = 480;
    canvas.height = 640;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Lấy ảnh dạng base64 (chất lượng 0.7 để nén ảnh)
    const base64Image = canvas.toDataURL('image/jpeg', 0.7);
    
    closeCameraModal();
    submitData(base64Image);
}

function submitData(photoBase64) {
    setGlobalLoading(true, "Đang đồng bộ dữ liệu...");

    const payload = {
        name: currentUser,
        action: "checkin",
        photo: photoBase64, // Gửi ảnh đính kèm
        timestamp: Date.now()
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(async (response) => {
        let text = await response.text();
        if (text.includes("LỖI")) {
            alert("Hệ thống báo: " + text); 
        } else {
            // Lưu local tạm
            const today = new Date().toLocaleDateString('vi-VN');
            let logs = JSON.parse(localStorage.getItem('logs_' + currentUser + '_' + today) || "[]");
            logs.push(new Date().toLocaleTimeString('vi-VN'));
            localStorage.setItem('logs_' + currentUser + '_' + today, JSON.stringify(logs));
            localStorage.setItem('last_time_' + currentUser, Date.now());
            
            alert("Điểm danh thành công!");
            renderHistory(logs);
        }
    })
    .catch(error => {
        alert("Lỗi mạng! Vui lòng thử lại.");
        console.error(error);
    })
    .finally(() => {
        setGlobalLoading(false);
        updateButtonUI();
    });
}

function fetchHistoryFromServer() {
    // Lý tưởng nhất là Fetch GET từ Google Script để đồng bộ, hiện tại gọi từ LocalStorage
    const today = new Date().toLocaleDateString('vi-VN');
    const logs = JSON.parse(localStorage.getItem('logs_' + currentUser + '_' + today) || "[]");
    renderHistory(logs);
}

function renderHistory(logs) {
    document.getElementById('progress-bar-fill').style.width = (logs.length / 4 * 100) + "%";
    document.getElementById('progress-text').innerText = logs.length + "/4 lần";
    document.getElementById('history-list').innerHTML = logs.map((t, i) => `
        <div class="history-item"><span>Lần ${i+1}</span><b>${t}</b></div>
    `).join('');
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function logout() {
    currentUser = "";
    localStorage.removeItem("saved_user"); 
    window.location.reload(); 
}