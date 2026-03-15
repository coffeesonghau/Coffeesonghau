// --- CẤU HÌNH BOT TELEGRAM ---
const TELEGRAM_BOT_TOKEN = '8694135824:AAGDHxwOWJttiBh079TLWz1Rg7e9S3ltp90';
const TELEGRAM_CHAT_ID = '-5208033826';

// Trạng thái ứng dụng
let giftState = {
    totalReceived: 0,
    distributedList: [] // Lưu { time: "14:30", linkGps: "http...", accuracy: 5 }
};

// --- KHỞI TẠO TRANG ---
document.addEventListener("DOMContentLoaded", () => {
    // Không cần set Header User ở đây nữa vì đã có script.js lo liệu.
    
    // Load dữ liệu từ LocalStorage
    const savedState = localStorage.getItem('sh_gift_state');
    if (savedState) {
        giftState = JSON.parse(savedState);
    }
    renderUI();
});

function renderUI() {
    const setupSection = document.getElementById('setup-section');
    const trackingSection = document.getElementById('tracking-section');

    if (giftState.totalReceived > 0) {
        setupSection.style.display = 'none';
        trackingSection.style.display = 'block';

        const totalGiven = giftState.distributedList.length;
        const remain = giftState.totalReceived - totalGiven;
        
        // Tính phần trăm
        let percent = Math.round((totalGiven / giftState.totalReceived) * 100);
        if (percent > 100) percent = 100;

        // Cập nhật Progress Bar
        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('progress-percent').innerText = `${percent}%`;

        // Cập nhật Dashboard
        document.getElementById('val-total').innerText = giftState.totalReceived;
        document.getElementById('val-given').innerText = totalGiven;
        document.getElementById('val-remain').innerText = remain;

        // Đổi màu nếu hoàn thành
        if (remain <= 0) {
            document.getElementById('progress-fill').style.background = 'linear-gradient(90deg, #f1c40f, #f39c12)'; // Chuyển vàng chúc mừng
            document.querySelector('.btn-large-action').style.background = '#95a5a6';
            document.querySelector('.btn-large-action').style.boxShadow = 'none';
            document.querySelector('.btn-large-action').classList.remove('pulse-effect');
        } else {
            document.getElementById('progress-fill').style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            document.querySelector('.btn-large-action').style.background = 'linear-gradient(135deg, #4e54c8, #8f94fb)';
            document.querySelector('.btn-large-action').classList.add('pulse-effect');
        }

        renderHistory();
    } else {
        setupSection.style.display = 'block';
        trackingSection.style.display = 'none';
    }
}

function renderHistory() {
    const container = document.getElementById('history-items');
    container.innerHTML = '';

    if (giftState.distributedList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marked-alt"></i>
                <p>Chưa có tọa độ nào được ghi nhận.</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">Hãy bắt đầu phát điểm đầu tiên!</p>
            </div>
        `;
        return;
    }

    // Hiển thị từ mới nhất đến cũ nhất
    [...giftState.distributedList].reverse().forEach((item, index) => {
        const realIndex = giftState.distributedList.length - index;
        const accText = item.accuracy ? `<span class="acc-badge">Sai số: ~${Math.round(item.accuracy)}m</span>` : '';
        
        container.innerHTML += `
            <div class="timeline-item">
                <div class="time-row">
                    <span>Điểm thứ ${realIndex}</span>
                    <span style="color: #64748b;"><i class="far fa-clock"></i> ${item.time}</span>
                </div>
                <div class="gps-row">
                    <a href="${item.linkGps}" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Xem bản đồ
                    </a>
                    ${accText}
                </div>
            </div>
        `;
    });
}

function saveState() {
    localStorage.setItem('sh_gift_state', JSON.stringify(giftState));
}

// --- BẮT ĐẦU ---
function initGift() {
    const inputVal = document.getElementById('initial-amount').value;
    const amount = parseInt(inputVal);

    if (isNaN(amount) || amount <= 0) {
        alert("⚠️ Vui lòng nhập số lượng hợp lệ (lớn hơn 0)!");
        return;
    }

    if (confirm(`Xác nhận hôm nay bạn nhận ${amount} Catalog/Gift để đi phát?`)) {
        giftState.totalReceived = amount;
        giftState.distributedList = [];
        saveState();
        renderUI();
    }
}

// --- GHI NHẬN TỌA ĐỘ ---
function trackOneGift() {
    const remain = giftState.totalReceived - giftState.distributedList.length;
    if (remain <= 0) {
        alert("🎉 Chúc mừng! Bạn đã phát hết số lượng Catalog nhận hôm nay.");
        return;
    }

    const btn = document.querySelector('.btn-large-action');
    btn.disabled = true;
    
    setLoading(true, "Đang kết nối vệ tinh GPS...");

    if (!navigator.geolocation) {
        setLoading(false);
        btn.disabled = false;
        alert("⚠️ Trình duyệt của bạn không hỗ trợ định vị GPS!");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const acc = position.coords.accuracy; // Lấy độ sai số (mét)
            
            const linkGps = `http://maps.google.com/maps?q=${lat},${lon}`;
            
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            giftState.distributedList.push({
                time: timeStr,
                linkGps: linkGps,
                accuracy: acc
            });

            saveState();
            setLoading(false);
            btn.disabled = false;
            renderUI();
        },
        (error) => {
            setLoading(false);
            btn.disabled = false;
            console.error(error);
            alert("❌ Không thể lấy vị trí. Hãy bật Location (Định vị) trên điện thoại, cấp quyền cho trình duyệt và thử lại!");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

// --- KẾT THÚC NGÀY ---
async function sendEndDayReport() {
    const totalGiven = giftState.distributedList.length;
    if (totalGiven === 0 && !confirm("Bạn chưa phát được cuốn nào. Bạn vẫn muốn gửi báo cáo tổng kết?")) {
        return;
    }

    if (!confirm("🏁 Xác nhận chốt tổng kết chuyến đi?\nDữ liệu sẽ được gửi về Telegram và làm mới ứng dụng!")) {
        return;
    }

    setLoading(true, "Đang đồng bộ báo cáo...");

    const userName = localStorage.getItem('sh_user_name') || "Nhân viên";
    const dateStr = new Date().toLocaleDateString('vi-VN');
    const remain = giftState.totalReceived - totalGiven;
    const percent = Math.round((totalGiven / giftState.totalReceived) * 100);

    let message = `📢 *BÁO CÁO PHÁT CATALOG/GIFT*\n`;
    message += `👤 *Nhân sự:* ${userName}\n`;
    message += `📅 *Ngày:* ${dateStr}\n`;
    message += `----------------------------\n`;
    message += `📦 *Nhận ban đầu:* ${giftState.totalReceived}\n`;
    message += `✅ *Đã phát:* ${totalGiven} (${percent}%)\n`;
    message += `📉 *Tồn đọng:* ${remain}\n`;
    message += `----------------------------\n`;
    
    if (totalGiven > 0) {
        message += `📍 *LỘ TRÌNH CHI TIẾT:*\n`;
        giftState.distributedList.forEach((item, index) => {
            message += `${index + 1}. [${item.time}] - [Mở Map](${item.linkGps})\n`;
        });
    } else {
        message += `📍 *Chưa có lượt phát sinh nào.*\n`;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });

        const result = await response.json();

        if (result.ok) {
            alert("✅ Đã gửi báo cáo tổng kết thành công! Ứng dụng sẽ tự động làm mới.");
            localStorage.removeItem('sh_gift_state');
            giftState = { totalReceived: 0, distributedList: [] };
            renderUI();
        } else {
            throw new Error(result.description);
        }
    } catch (error) {
        console.error("Lỗi gửi Telegram:", error);
        alert("❌ Mạng không ổn định: Không thể gửi báo cáo. Vui lòng kiểm tra 3G/Wi-fi và thử lại!");
    } finally {
        setLoading(false);
    }
}

// --- UTILS ---
function setLoading(show, text = "Đang xử lý...") {
    const loader = document.getElementById('global-loading');
    document.getElementById('loading-text').innerText = text;
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

function undoLastGift() {
    if (giftState.distributedList.length === 0) {
        alert("Chưa có dữ liệu để hoàn tác!");
        return;
    }
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa tọa độ vừa ghi nhận không?")) {
        giftState.distributedList.pop(); 
        saveState();
        renderUI();
    }
}

function editInitialAmount() {
    const newVal = prompt("Nhập lại tổng số Catalog bạn nhận đi phát hôm nay:", giftState.totalReceived);
    if (newVal !== null) {
        const amount = parseInt(newVal);
        if (isNaN(amount) || amount <= 0) {
            alert("Số lượng không hợp lệ!");
            return;
        }
        if (amount < giftState.distributedList.length) {
            alert("Tổng số không thể nhỏ hơn số lượng bạn đã lỡ phát đi!");
            return;
        }
        giftState.totalReceived = amount;
        saveState();
        renderUI();
    }
}