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

    if (currentAction === 'lunch_out' || currentAction === 'checkout') {
        photoGroup.style.display = 'block';
        // Hiệu ứng rung nhẹ hoặc đổi màu label để gây chú ý
        const photoLabel = photoGroup.querySelector('label');
        photoLabel.innerHTML = 'Chụp ảnh xác thực <span class="text-danger">(BẮT BUỘC) *</span>';
        photoLabel.style.color = '#e74c3c';
    } else {
        photoGroup.style.display = 'none';
    }

    // THÊM ĐOẠN NÀY ĐỂ RESET GPS KHI ĐỔI LOẠI HÌNH (Công ty / Sales)
    document.getElementById('tk-gps').value = "";
    document.getElementById('status-text').innerText = "Vui lòng định vị lại";
    document.getElementById('dist-val').innerText = "--";
    document.querySelector('.dist-badge').classList.remove('error');
    const headerStatus = document.getElementById('header-system-status');
    if (headerStatus) headerStatus.innerText = "Chưa định vị";
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

    // B. Kiểm tra Cooldown
    const lastTime = localStorage.getItem('tk_last_time');
    const now = new Date().getTime();
    if (lastTime && (now - parseInt(lastTime)) < COOLDOWN_MINS * 60 * 1000) {
        const minsLeft = Math.ceil((COOLDOWN_MINS * 60 * 1000 - (now - parseInt(lastTime))) / 60000);
        return showToast(`Vui lòng đợi ${minsLeft} phút nữa.`, 'warning');
    }

    // C. Kiểm tra Ảnh (Bắt buộc cho nghỉ trưa và ra về)
    const imgData = document.getElementById('tk-img-preview').dataset.base64;
    if ((currentAction === 'lunch_out' || currentAction === 'checkout')) {
        if (!imgData || imgData === "") {
            return showToast("📸 BẮT BUỘC: Bạn phải chụp ảnh xác thực để hoàn thành thao tác này!", "error");
        }
    }

    // ==========================================
    // LOGIC MỚI: TỰ ĐỘNG LẤY GPS VÀ KIỂM TRA 30M
    // ==========================================
    setGlobalLoading(true, "Đang kiểm tra tọa độ GPS...");
    let gpsValue = "Không xác định";
    const locationType = document.getElementById('tk-location-type').value;

    try {
        const coords = await getGPSCoordinates();
        gpsValue = `https://maps.google.com/?q=$$${coords.lat},${coords.lon}`;
        
        const distVal = document.getElementById('dist-val');
        const distBadge = document.querySelector('.dist-badge');
        const headerStatus = document.getElementById('header-system-status');

        if (locationType === "CongTy") {
            const distance = getDistance(coords.lat, coords.lon, COMPANY_LAT, COMPANY_LON);
            distVal.innerText = distance;

            if (distance > 30) {
                distBadge.classList.add('error');
                if (headerStatus) headerStatus.innerHTML = `<span style="color: #ff7675; font-weight:bold;">Cách c.ty ${distance}m (Quá xa)</span>`;
                setGlobalLoading(false);
                return showToast(`⚠️ LỖI: Bạn cách công ty ${distance}m. Phải nằm trong bán kính 30m mới được chấm công!`, "error");
            } else {
                distBadge.classList.remove('error');
                if (headerStatus) headerStatus.innerHTML = `<span style="color: #55efc4; font-weight:bold;">Cách c.ty ${distance}m</span>`;
            }
        } else {
            distVal.innerText = "Sales";
            distBadge.classList.remove('error');
            if (headerStatus) headerStatus.innerHTML = `<span style="color: #55efc4; font-weight:bold;">Đang đi Sales</span>`;
        }
    } catch (errorMsg) {
        setGlobalLoading(false);
        return showToast(errorMsg, "error");
    }

    // D. Gửi dữ liệu lên Telegram
    setGlobalLoading(true, "Đang gửi dữ liệu...");
    const payload = {
        user: `${currentUser.name} (ID: ${currentUser.id})`,
        time: new Date().toLocaleString('vi-VN'),
        gps: gpsValue,
        action: ACTION_LABELS[currentAction],
        image: imgData || null
    };

    const success = await sendToTelegram(payload);
    setGlobalLoading(false);

    if (success) {
        showToast(`Thành công: ${ACTION_LABELS[currentAction]}`, "success");
        localStorage.setItem('tk_last_time', now.toString());
        advanceAction(currentAction);
        resetPhoto();
    }
}

// ==========================================
// HÀM CHUYỂN BƯỚC CHẤM CÔNG (Chuyển ca)
// ==========================================
function advanceAction(currentAction) {
    // 1. Tìm xem hiện tại đang ở bước thứ mấy
    const currentIndex = ACTION_SEQUENCE.indexOf(currentAction);
    let nextAction = 'done'; // Mặc định nếu đã bấm "RA VỀ" thì sẽ chuyển thành "HOÀN THÀNH"

    // 2. Xác định bước tiếp theo
    if (currentIndex !== -1 && currentIndex < ACTION_SEQUENCE.length - 1) {
        nextAction = ACTION_SEQUENCE[currentIndex + 1];
    }

    // 3. Lưu bước tiếp theo vào bộ nhớ để F5 không bị mất
    localStorage.setItem('tk_saved_action', nextAction);

    // 4. Cập nhật lại giao diện nút bấm và thanh tiến trình (timeline)
    const btn = document.getElementById('btn-main-submit');
    const stepText = document.getElementById('tk-step-text');
    const allDots = document.querySelectorAll('.dot');

    if (nextAction === 'done') {
        // Đã hoàn thành 4 ca
        btn.dataset.action = 'done';
        document.getElementById('btn-submit-text').innerText = ACTION_LABELS['done'];
        btn.style.background = 'linear-gradient(135deg, #27ae60, #219150)'; // Đổi màu nút sang xanh lá
        btn.disabled = true; // Khóa nút không cho bấm nữa
        
        allDots.forEach(dot => {
            dot.classList.remove('active');
            dot.classList.add('completed');
        });
        stepText.innerText = `Tiến trình: 4/4 (Hoàn tất)`;
    } else {
        // Chuyển sang ca tiếp theo bình thường
        btn.dataset.action = nextAction;
        document.getElementById('btn-submit-text').innerText = ACTION_LABELS[nextAction];
        
        const nextIndex = ACTION_SEQUENCE.indexOf(nextAction);
        allDots.forEach((dot, idx) => {
            dot.classList.remove('completed', 'active');
            if (idx < nextIndex) dot.classList.add('completed');
            if (idx === nextIndex) dot.classList.add('active');
        });
        stepText.innerText = `Tiến trình: ${nextIndex}/4`;
    }

    // 5. Kiểm tra xem ca mới có bắt buộc chụp ảnh không để hiện khung Camera lên
    handleTkActionChange(); 
}

// Thay thế hàm captureAndWatermark hiện tại để bỏ tham chiếu tới ô GPS cũ
// Thay thế hàm này vào file chamcong.js
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
    
    // ĐIỂM SỬA CHÍNH TẠI ĐÂY: Dựa vào "Vị trí làm việc" thay vì ô GPS đã bị xóa
    const locationType = document.getElementById('tk-location-type').value;
    const locationStr = locationType === "CongTy" ? "Làm việc tại Công Ty" : "Đi Sales ngoài thị trường";

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
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?")) {
        localStorage.removeItem('sh_is_logged_in');
        localStorage.removeItem('sh_user_id');
        localStorage.removeItem('sh_user_name');
        window.location.replace("login.html");
    }
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
const COMPANY_LAT = 9.297844889581189;
const COMPANY_LON = 105.68564448938785;

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const deltaP = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Sửa dòng này để lấy chính xác 1 số thập phân (VD: 32.5m)
    return parseFloat((R * c).toFixed(1)); 
}

// --- HÀM LẤY GPS TỰ ĐỘNG DƯỚI NỀN ---
function getGPSCoordinates() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Trình duyệt không hỗ trợ GPS");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({ 
                    lat: position.coords.latitude, 
                    lon: position.coords.longitude 
                });
            },
            (error) => {
                reject("Hãy bật Vị trí (Location) trên điện thoại và cho phép web truy cập!");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
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

    // 1. KIỂM TRA QUA NGÀY MỚI ĐỂ XÓA CHU TRÌNH CŨ
    const lastTime = localStorage.getItem('tk_last_time');
    
    if (lastTime) {
        // Lấy ngày tháng năm hiện tại và ngày tháng năm của lần chấm công cuối
        const lastDate = new Date(parseInt(lastTime)).toLocaleDateString('vi-VN');
        const currentDate = new Date().toLocaleDateString('vi-VN');
        
        // Nếu đã sang ngày mới -> Xóa sạch trạng thái dang dở của hôm qua
        if (lastDate !== currentDate) {
            localStorage.removeItem('tk_saved_action'); 
            localStorage.removeItem('tk_last_time'); 
        }
    }

    // 2. KHÔI PHỤC HOẶC LÀM MỚI GIAO DIỆN
    const saved = localStorage.getItem('tk_saved_action');
    const btn = document.getElementById('btn-main-submit');
    const stepText = document.getElementById('tk-step-text');
    const allDots = document.querySelectorAll('.dot');
    
    // Nếu vẫn trong cùng 1 ngày và có trạng thái lưu dở
    if (saved) {
        btn.dataset.action = saved;
        document.getElementById('btn-submit-text').innerText = ACTION_LABELS[saved];
        
        const currentIndex = ACTION_SEQUENCE.indexOf(saved);
        if (currentIndex !== -1) {
            allDots.forEach((dot, idx) => {
                dot.classList.remove('completed', 'active');
                if (idx < currentIndex) dot.classList.add('completed');
                if (idx === currentIndex) dot.classList.add('active');
            });
            stepText.innerText = `Tiến trình: ${currentIndex}/4`;
        }
    } else {
        // Nếu là ngày mới (đã bị xóa dữ liệu) hoặc là người dùng mới tinh
        btn.dataset.action = 'checkin';
        document.getElementById('btn-submit-text').innerText = ACTION_LABELS['checkin'];
        
        allDots.forEach(dot => dot.classList.remove('completed', 'active'));
        const firstDot = document.getElementById('dot-0');
        if(firstDot) firstDot.classList.add('active');
        stepText.innerText = `Tiến trình: 0/4`;
    }

    handleTkActionChange();
});
// ==========================================
// HÀM LÀM MỚI ỨNG DỤNG (CHỈ REFRESH, KHÔNG XÓA DỮ LIỆU)
// ==========================================
function resetForm() {
    
    setGlobalLoading(true, "Đang làm mới dữ liệu...");
    
    setTimeout(() => {
        window.location.reload();
    }, 800);
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

window.handleAvatarChange = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast("Ảnh quá nặng, vui lòng chọn ảnh dưới 2MB", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
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