// ==========================================
// 1. CẤU HÌNH & BIẾN TOÀN CỤC
// ==========================================
const TELEGRAM_BOT_TOKEN = '8694135824:AAGDHxwOWJttiBh079TLWz1Rg7e9S3ltp90';
const TELEGRAM_CHAT_ID = '-5208033826';
const COOLDOWN_MINS = 30;

const ACTION_SEQUENCE = ['checkin', 'lunch_out', 'lunch_in', 'checkout'];
const ACTION_LABELS = {
    'checkin': 'VÀO CA SÁNG',
    'lunch_out': 'NGHỈ TRƯA',
    'lunch_in': 'VÀO CA CHIỀU',
    'checkout': 'RA VỀ',
    'done': 'ĐÃ HOÀN THÀNH'
};

let db;
let currentStream = null;

// ==========================================
// BẢO VỆ TRANG & LẤY THÔNG TIN ĐĂNG NHẬP
// ==========================================
if (localStorage.getItem('sh_is_logged_in') !== 'true') {
    // Nếu chưa đăng nhập, đá văng về trang login
    window.location.replace("login.html");
}

// Lấy thông tin user từ bộ nhớ trình duyệt
const currentUser = {
    id: localStorage.getItem('sh_user_id') || '000000',
    name: localStorage.getItem('sh_user_name') || 'Nhân viên'
};

// ==========================================
// 2. GIAO DIỆN THÔNG MINH (UI)
// ==========================================
function updateWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting = "";

    if (hour >= 5 && hour < 12) greeting = `Chào buổi sáng, ${currentUser.name}! ☕`;
    else if (hour >= 12 && hour < 14) greeting = `Nghỉ trưa thôi, ${currentUser.name}!`;
    else if (hour >= 14 && hour < 18) greeting = `Làm việc tốt nhé, ${currentUser.name}!`;
    else greeting = `Chúc buổi tối vui vẻ, ${currentUser.name}!`;

    const el = document.getElementById('welcome-msg');
    if (el) el.innerText = greeting;

    // Cập nhật tên thật lên góc trái màn hình (Header)
    const headerName = document.getElementById('currentUserName');
    if (headerName) {
        headerName.innerText = currentUser.name;
    }
}

// Ẩn hiện phần chụp ảnh dựa trên ca làm việc
function handleTkActionChange() {
    const btnSubmit = document.getElementById('btn-main-submit');
    const currentAction = btnSubmit.dataset.action || 'checkin';
    const photoGroup = document.getElementById('tk-photo-group');

    // Chỉ bắt buộc ảnh khi Nghỉ trưa hoặc Ra về
    if (currentAction === 'lunch_out' || currentAction === 'checkout') {
        photoGroup.style.display = 'block';
    } else {
        photoGroup.style.display = 'none';
    }
}

// ==========================================
// 3. LOGIC XỬ LÝ CHÍNH
// ==========================================
async function submitTimekeep() {
    const btnSubmit = document.getElementById('btn-main-submit');
    const currentAction = btnSubmit.dataset.action || 'checkin';

    if (currentAction === 'done') return;

    // A. Kiểm tra giờ ra về (Sau 17h)
    if (currentAction === 'checkout' && new Date().getHours() < 17) {
        return showToast("Chưa đến 17:00, không thể ra về sớm!", "error");
    }

    // B. Kiểm tra Cooldown (Thời gian chờ giữa 2 lần bấm)
    const lastTime = localStorage.getItem('tk_last_time');
    const now = new Date().getTime();
    if (lastTime && (now - parseInt(lastTime)) < COOLDOWN_MINS * 60 * 1000) {
        const minsLeft = Math.ceil((COOLDOWN_MINS * 60 * 1000 - (now - parseInt(lastTime))) / 60000);
        return showToast(`Vui lòng đợi ${minsLeft} phút nữa.`, 'warning');
    }

    // C. KIỂM TRA BẮT BUỘC CÓ GPS (MỚI THÊM)
    const gpsValue = document.getElementById('tk-gps').value;
    if (!gpsValue || gpsValue === "Không xác định" || gpsValue === "Đang định vị..." || !gpsValue.includes("http")) {
        return showToast("⚠️ BẮT BUỘC: Bạn phải nhấn nút lấy vị trí GPS trước khi chấm công!", "error");
    }

    // D. Kiểm tra Ảnh (Bắt buộc cho lunch_out và checkout)
    const imgData = document.getElementById('tk-img-preview').dataset.base64;
    if ((currentAction === 'lunch_out' || currentAction === 'checkout') && !imgData) {
        return showToast("Bạn cần chụp ảnh xác thực để kết thúc ca!", "error");
    }

    // Cập nhật Payload để gửi tên thật và ID về Telegram
    const payload = {
        user: `${currentUser.name} (ID: ${currentUser.id})`,
        time: new Date().toLocaleString('vi-VN'),
        gps: gpsValue,
        action: ACTION_LABELS[currentAction],
        image: imgData || null
    };

    // E. Gửi dữ liệu
    setGlobalLoading(true, "Đang gửi dữ liệu...");
    const success = await sendToTelegram(payload);
    setGlobalLoading(false);

    if (success) {
        showToast(`Thành công: ${ACTION_LABELS[currentAction]}`, "success");
        localStorage.setItem('tk_last_time', now.toString());
        advanceAction(currentAction);
        resetPhoto();
    }
}

// Hàm tự động chuyển bước tiếp theo và cập nhật giao diện
function advanceAction(currentAction) {
    const btnSubmit = document.getElementById('btn-main-submit');
    const btnText = document.getElementById('btn-submit-text');
    const currentIndex = ACTION_SEQUENCE.indexOf(currentAction);

    let nextAction = 'done';
    if (currentIndex < ACTION_SEQUENCE.length - 1) {
        nextAction = ACTION_SEQUENCE[currentIndex + 1];
    }

    // Cập nhật nút bấm
    btnSubmit.dataset.action = nextAction;
    btnText.innerText = ACTION_LABELS[nextAction];

    // Cập nhật thanh tiến trình (Dots)
    document.querySelectorAll('.dot').forEach((dot, idx) => {
        if (idx <= currentIndex) dot.classList.add('completed');
        if (idx === currentIndex + 1) dot.classList.add('active');
    });

    document.getElementById('tk-step-text').innerText = `Tiến trình: ${currentIndex + 1}/4`;

    // Lưu trạng thái vào máy để F5 không bị mất
    localStorage.setItem('tk_saved_action', nextAction);
    handleTkActionChange();
}

// ==========================================
// 4. TIỆN ÍCH (CAMERA, CLOCK, TOAST, MỞ MENU)
// ==========================================

// Đóng/Mở Sidebar Menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Xử lý Đăng Xuất
function handleLogout() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?")) {
        localStorage.removeItem('sh_is_logged_in');
        localStorage.removeItem('sh_user_id');
        localStorage.removeItem('sh_user_name');
        window.location.replace("login.html");
    }
}

function updateClock() {
    const now = new Date();
    document.getElementById('tk-clock').innerText = now.toLocaleTimeString('vi-VN', { hour12: false });
    document.getElementById('tk-date').innerText = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    setTimeout(updateClock, 1000);
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-msg">${msg}</div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 500); }, 3500);
}

function setGlobalLoading(show, text = "Đang xử lý...") {
    const loader = document.getElementById('global-loading');
    document.getElementById('loading-text').innerText = text;
    show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
}

// --- HÀM LẤY VỊ TRÍ GPS ---
// --- HÀM LẤY VỊ TRÍ GPS ---
function startLiveGPS() {
    const gpsInput = document.getElementById('tk-gps');
    const statusText = document.getElementById('status-text');

    gpsInput.value = "Đang định vị...";
    statusText.innerText = "Đang tìm GPS...";

    if (!navigator.geolocation) {
        showToast("Trình duyệt của bạn không hỗ trợ GPS", "error");
        gpsInput.value = "";
        statusText.innerText = "Lỗi GPS";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Đã sửa lại URL thành link chuẩn của Google Maps
            const mapLink = `https://maps.google.com/?q=${lat},${lon}`;
            
            gpsInput.value = mapLink;
            statusText.innerText = "Đã lấy vị trí";
            showToast("Cập nhật vị trí thành công!", "success");
        },
        (error) => {
            console.error(error);
            showToast("Không thể lấy vị trí. Hãy bật Location (Vị trí) trên điện thoại!", "error");
            gpsInput.value = "";
            statusText.innerText = "Lỗi định vị";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Các hàm Camera (Mở, Chụp, Đóng)
function openCameraModal() {
    document.getElementById('camera-modal').classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            currentStream = stream;
            document.getElementById('camera-stream').srcObject = stream;
        });
}

function closeCameraModal() {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    document.getElementById('camera-modal').classList.add('hidden');
}

function captureAndWatermark() {
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 1. Vẽ ảnh từ camera lên canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Lấy thông tin cần in lên ảnh
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN') + ' - ' + now.toLocaleDateString('vi-VN');
    const userName = currentUser.name + " (" + currentUser.id + ")";
    const gpsData = document.getElementById('tk-gps').value;
    const locationStr = (gpsData && gpsData !== "Đang định vị...") ? "Đã gắn tọa độ GPS" : "Chưa lấy vị trí GPS";

    // 3. Vẽ khung nền mờ đen để chữ dễ đọc hơn
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(10, canvas.height - 90, canvas.width - 20, 80);

    // 4. In chữ màu trắng lên ảnh
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("👤 " + userName, 20, canvas.height - 65);
    ctx.fillText("⏰ " + timeStr, 20, canvas.height - 40);
    ctx.fillText("📍 " + locationStr, 20, canvas.height - 15);

    // Xuất ra Base64
    const base64 = canvas.toDataURL('image/jpeg', 0.8);

    const preview = document.getElementById('tk-img-preview');
    preview.src = base64;
    preview.dataset.base64 = base64;
    document.getElementById('tk-photo-preview').style.display = 'block';
    closeCameraModal();
}

function resetPhoto() {
    const preview = document.getElementById('tk-img-preview');
    preview.src = "";
    preview.dataset.base64 = "";
    document.getElementById('tk-photo-preview').style.display = 'none';
}

// --- HÀM GỬI DỮ LIỆU VỀ TELEGRAM ---
async function sendToTelegram(data) {
    const botToken = TELEGRAM_BOT_TOKEN;
    const chatId = TELEGRAM_CHAT_ID;

    // Xử lý an toàn link bản đồ
    let locationText = (data.gps !== "Không xác định" && data.gps.includes("http")) 
        ? `[Xem trên bản đồ](${data.gps})` 
        : "Không xác định";

    const message = `📢 *CHẤM CÔNG: ${data.action}*\n` +
        `👤 *Nhân viên:* ${data.user}\n` +
        `⏰ *Thời gian:* ${data.time}\n` +
        `📍 *Vị trí:* ${locationText}`;

    try {
        if (data.image) {
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("caption", message);
            formData.append("parse_mode", "Markdown");

            const base64Data = data.image.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            formData.append("photo", blob, "checkin.jpg");

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (!result.ok) throw new Error(result.description);
            return true;

        } else {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                })
            });
            const result = await response.json();

            if (!result.ok) throw new Error(result.description);
            return true;
        }
    } catch (error) {
        console.error("Lỗi gửi Telegram:", error);
        showToast("Lỗi khi gửi dữ liệu về hệ thống!", "error");
        return false;
    }
}

// ==========================================
// 5. KHỞI CHẠY KHI TẢI TRANG
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    updateWelcomeMessage();
    updateClock();

    // Khôi phục trạng thái ca từ lần trước (nếu có)
    const saved = localStorage.getItem('tk_saved_action');
    if (saved) {
        const btn = document.getElementById('btn-main-submit');
        btn.dataset.action = saved;
        document.getElementById('btn-submit-text').innerText = ACTION_LABELS[saved];
    }

    handleTkActionChange();
});
// ==========================================
// THÊM VÀO CUỐI FILE CHAMCONG.JS 
// ĐỂ MENU BOTTOM HOẠT ĐỘNG
// ==========================================

function openDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}
// 2. Popup Tài Khoản
async function openProfileModal() {
    const userName = localStorage.getItem('sh_user_name') || "Thành viên";
    const userId = localStorage.getItem('sh_user_id') || "N/A";
    
    document.getElementById('profileName').innerText = userName;
    document.getElementById('profileId').innerText = userId;
    
    document.getElementById('profileModal').style.display = 'flex';
}
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}
// ==========================================
// 6. TÍNH NĂNG MENU BOTTOM (TÀI KHOẢN & XÓA ĐƠN)
// ==========================================

// Khai báo link Google Sheet API (Vì bên chamcong.js chưa có biến này)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec";

// --- POPUP TÀI KHOẢN ---
async function openProfileModal() {
    const userName = localStorage.getItem('sh_user_name') || "Thành viên";
    const userId = localStorage.getItem('sh_user_id') || "N/A";
    
    document.getElementById('profileName').innerText = userName;
    document.getElementById('profileId').innerText = userId;
    
    document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// --- POPUP YÊU CẦU XÓA ĐƠN ---
function openDeleteModal(ma_don = '') {
    const orderIdInput = document.getElementById('delOrderId');
    const reasonInput = document.getElementById('delReason');
    
    // Reset form trước khi mở
    reasonInput.value = '';
    
    if (ma_don) {
        orderIdInput.value = ma_don;
        orderIdInput.readOnly = true;
        orderIdInput.style.backgroundColor = '#f1f5f9';
    } else {
        orderIdInput.value = '';
        orderIdInput.readOnly = false;
        orderIdInput.style.backgroundColor = '#fff';
    }

    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

async function submitDeleteRequest() {
    const orderId = document.getElementById('delOrderId').value.trim().toUpperCase(); 
    const reason = document.getElementById('delReason').value.trim();

    if (!orderId || !reason) {
        showToast("⚠️ Vui lòng nhập đầy đủ Mã đơn hàng và Lý do xóa!", "warning");
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn gửi yêu cầu XÓA đơn [${orderId}] cho bộ phận IT không?`)) {
        return;
    }

    const btn = document.querySelector('#deleteModal .btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    btn.disabled = true;

    try {
        const userId = localStorage.getItem('sh_user_id') || "000000";
        const userName = localStorage.getItem('sh_user_name') || "Nhân viên";
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: "sendITRequest", 
                id_sales: userId,
                nguoi_gui: userName,
                loai_yeu_cau: "Yêu cầu XOÁ đơn",
                ma_don: orderId,
                ly_do: reason
            }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`✅ Đã gửi yêu cầu xóa mã đơn ${orderId} thành công!`, "success");
            closeDeleteModal();
        } else {
            showToast("❌ Lỗi từ máy chủ: " + result.msg, "error");
        }
    } catch (err) {
        showToast("❌ Lỗi kết nối mạng, vui lòng thử lại sau!", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
// --- XỬ LÝ ẢNH ĐẠI DIỆN TRANG CHẤM CÔNG ---
const dbHelper = {
    dbName: 'SongHauDB',
    storeName: 'userProfile',
    initDB: function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },
    saveAvatar: async function (base64Data) {
        const db = await this.initDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put({ id: 'avatar', image: base64Data });
    },
    getAvatar: async function () {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get('avatar');
            request.onsuccess = () => resolve(request.result ? request.result.image : null);
            request.onerror = () => reject(request.error);
        });
    }
};

window.handleAvatarChange = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast("Ảnh quá nặng, vui lòng chọn ảnh dưới 2MB", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result;
        const profileImg = document.getElementById('profileDisplayAvatar');
        if (profileImg) profileImg.src = base64Data;
        try {
            await dbHelper.saveAvatar(base64Data);
            showToast("Đã cập nhật ảnh đại diện thành công!", "success");
        } catch (err) {
            console.error(err);
        }
    };
    reader.readAsDataURL(file);
};