// LƯU Ý: Thay thế URL này bằng đường link Web App của bạn
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec"; 

window.allAdminOrders = [];

// ==========================================
// 1. KHỞI TẠO & ĐĂNG NHẬP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sh_it_logged_in') === 'true') {
        document.getElementById('itLoginOverlay').style.display = 'none';
        loadAdminData(); 
    }
});

async function loginIT() {
    const user = document.getElementById('itUsername').value.trim();
    const pass = document.getElementById('itPassword').value;
    const btn = document.getElementById('btnITLogin');

    if (!user || !pass) return showToast("Vui lòng nhập ID và Mật khẩu!", "error");

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XÁC THỰC...';
    btn.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "loginIT", user: user, password: pass }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('sh_it_logged_in', 'true');
            document.getElementById('itLoginOverlay').style.display = 'none';
            showToast("Đăng nhập quản trị thành công!", "success");
            loadAdminData();
        } else {
            showToast(result.msg || "Sai thông tin Quản trị viên!", "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối đến máy chủ Google Sheet!", "error");
    } finally {
        btn.innerHTML = 'ĐĂNG NHẬP HỆ THỐNG';
        btn.disabled = false;
    }
}

function logoutIT() {
    if(confirm("Xác nhận đăng xuất khỏi hệ thống Admin?")) {
        localStorage.removeItem('sh_it_logged_in');
        location.reload();
    }
}

// ==========================================
// 2. GIAO DIỆN & TIỆN ÍCH
// ==========================================
const tabTitles = { 'dashboard': 'Tổng Quan Số Liệu', 'orders': 'CSDL Đơn Hàng', 'staff': 'Quản Trị Sales' };

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById('pageTitle').innerText = tabTitles[tabId];
}

function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 3. TẢI VÀ XỬ LÝ DỮ LIỆU TỪ SHEET
// ==========================================
async function loadAdminData() {
    const tableBody = document.getElementById('adminOrderTable');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>Đang đồng bộ dữ liệu Database...</td></tr>';

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "getAllOrdersAdmin" }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();

        if (result.success) {
            window.allAdminOrders = result.orders;
            updateDashboardStats(window.allAdminOrders);
            populateSalesFilter(window.allAdminOrders);
            applyFilters(); 
            showToast("Đã đồng bộ dữ liệu mới nhất.", "success");
        } else {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">${result.msg}</td></tr>`;
        }
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Lỗi kết nối mạng, không thể tải dữ liệu!</td></tr>';
        showToast("Lỗi tải dữ liệu!", "error");
    }
}

function updateDashboardStats(orders) {
    let totalRev = 0, pendingCount = 0;
    orders.forEach(o => {
        totalRev += Number(o.tong_tien) || 0;
        let status = (o.trang_thai_ke_toan || '').toLowerCase();
        if (!status.includes('đã')) pendingCount++;
    });

    document.getElementById('dashTotalOrders').innerText = orders.length.toLocaleString('vi-VN');
    document.getElementById('dashTotalRevenue').innerText = totalRev.toLocaleString('vi-VN') + ' đ';
    document.getElementById('dashPendingOrders').innerText = pendingCount.toLocaleString('vi-VN');
}

function populateSalesFilter(orders) {
    const select = document.getElementById('filterSales');
    const uniqueSales = [...new Set(orders.map(o => o.id_sales))].filter(id => id && id !== "Không xác định");
    
    select.innerHTML = '<option value="all">Tất cả nhân viên Sales</option>';
    uniqueSales.forEach(id => {
        select.innerHTML += `<option value="${id}">Mã Sales: ${id}</option>`;
    });
}

// ==========================================
// 4. BỘ LỌC ĐA CHIỀU CÓ NGÀY THÁNG
// ==========================================
window.applyFilters = function() {
    const term = document.getElementById('filterSearch').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const salesFilter = document.getElementById('filterSales').value;
    
    const dateStartVal = document.getElementById('filterDateStart').value;
    const dateEndVal = document.getElementById('filterDateEnd').value;
    const dateStart = dateStartVal ? new Date(dateStartVal).getTime() : 0;
    const dateEnd = dateEndVal ? new Date(dateEndVal).getTime() + 86400000 : Infinity; // Cộng 1 ngày để bao gồm ngày End

    const filteredOrders = window.allAdminOrders.filter(o => {
        // Text
        const searchStr = `${o.ma_don} ${o.ten_quan} ${o.sdt}`.toLowerCase();
        const matchText = searchStr.includes(term);

        // Status
        let matchStatus = true;
        const statusStr = (o.trang_thai_ke_toan || '').toLowerCase();
        if (statusFilter === 'pending') matchStatus = !statusStr.includes('đã');
        if (statusFilter === 'processed') matchStatus = statusStr.includes('đã');

        // Sales
        let matchSales = true;
        if (salesFilter !== 'all') matchSales = (o.id_sales == salesFilter);

        // Date
        let matchDate = true;
        let orderDateParts = o.thoi_gian.split(' ')[0].split('/'); // Định dạng Sheet dd/MM/yyyy
        if(orderDateParts.length === 3) {
            let orderTime = new Date(`${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`).getTime();
            if (!isNaN(orderTime)) {
                matchDate = (orderTime >= dateStart && orderTime <= dateEnd);
            }
        }

        return matchText && matchStatus && matchSales && matchDate;
    });

    renderAdminOrders(filteredOrders);
}

function renderAdminOrders(orders) {
    const tableBody = document.getElementById('adminOrderTable');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Không tìm thấy kết quả phù hợp.</td></tr>';
        return;
    }

    orders.forEach(o => {
        const total = parseInt(o.tong_tien || 0).toLocaleString('vi-VN') + ' đ';
        const cleanPhone = (o.sdt && o.sdt !== "'") ? o.sdt.replace(/'/g, '') : 'N/A';
        
        let statusClass = 'pending';
        let statusText = o.trang_thai_ke_toan || 'Chưa tạo đơn';
        if (statusText.toLowerCase().includes('đã')) statusClass = 'processed';

        const orderJson = JSON.stringify(o).replace(/'/g, "&#39;");

        // [MỚI] TẠO DROPDOWN TIẾN ĐỘ GIAO HÀNG
        const deliveryStatuses = ["Đang yêu cầu", "Đang chuẩn bị", "Đang giao", "Hoàn thành", "Thất bại"];
        let currentDelivery = o.trang_thai || "Đang yêu cầu";
        
        let selectHtml = `<select onchange="changeDeliveryStatus(this, '${o.ma_don}')" data-old="${currentDelivery}" style="padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; color: #334155; background: #f8fafc; outline: none; cursor: pointer;">`;
        deliveryStatuses.forEach(s => {
            selectHtml += `<option value="${s}" ${currentDelivery === s ? 'selected' : ''}>${s}</option>`;
        });
        selectHtml += `</select>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${o.ma_don}</strong></td>
            <td>${o.thoi_gian}</td>
            <td><span style="font-weight: 600; color: #0f172a;">${o.id_sales}</span></td>
            <td><div style="font-weight: 600;">${o.ten_quan}</div><div style="font-size: 0.8rem; color: #64748b;">📞 ${cleanPhone}</div></td>
            <td style="color: var(--danger); font-weight: 700;">${total}</td>
            <td>${selectHtml}</td> <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                ${statusClass === 'pending' ? `<button class="action-btn check" title="Xác nhận Kế toán" onclick="markAsProcessed(this, '${o.ma_don}')"><i class="fas fa-check-circle"></i></button>` : ''}
                <button class="action-btn edit" title="Xem chi tiết" onclick='openModal(${orderJson})'><i class="fas fa-eye"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 5. CẬP NHẬT TRẠNG THÁI SHEET
// ==========================================
async function markAsProcessed(btn, maDon) {
    if(!confirm(`Xác nhận đánh dấu đơn ${maDon} ĐÃ TẠO trên phần mềm kế toán?`)) return;

    const tr = btn.closest('tr');
    const badge = tr.querySelector('.badge');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "updateOrderStatus", ma_don: maDon, new_status: "Đã tạo đơn" }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();

        if (result.success) {
            badge.className = 'badge processed';
            badge.innerText = 'Đã tạo đơn';
            btn.style.display = 'none'; 
            
            const orderObj = window.allAdminOrders.find(o => o.ma_don === maDon);
            if(orderObj) orderObj.trang_thai_ke_toan = "Đã tạo đơn";
            updateDashboardStats(window.allAdminOrders);
            showToast("Đã cập nhật trạng thái đơn hàng.", "success");
        } else {
            showToast("Lỗi Server: " + result.msg, "error");
            btn.innerHTML = '<i class="fas fa-check-circle"></i>';
            btn.disabled = false;
        }
    } catch (err) {
        showToast("Mất kết nối mạng!", "error");
        btn.innerHTML = '<i class="fas fa-check-circle"></i>';
        btn.disabled = false;
    }
}

// ==========================================
// 6. XUẤT CSV CHO BÁO CÁO EXCEL
// ==========================================
function exportToExcel() {
    // Chỉ xuất các đơn hàng đang được hiển thị theo bộ lọc
    const tbody = document.getElementById('adminOrderTable');
    if(tbody.rows.length === 0 || tbody.innerText.includes("Không tìm thấy")) return showToast("Không có dữ liệu để xuất!", "error");
    
    let csvContent = "Ma Don,Thoi Gian,ID Sales,Ten Quan,SDT,Tong Tien,Trang Thai Ke Toan, Chi Tiet San Pham\n";
    
    // Tìm các ID đang hiển thị trên bảng
    const visibleIds = Array.from(tbody.querySelectorAll('td:first-child strong')).map(el => el.innerText);
    const ordersToExport = window.allAdminOrders.filter(o => visibleIds.includes(o.ma_don));

    ordersToExport.forEach(o => {
        let cleanPhone = (o.sdt || "").replace(/'/g, '');
        let cleanName = (o.ten_quan || "").replace(/,/g, ' '); // Xoá phẩy tránh vỡ cột
        let cleanCart = (o.cart_json || "{}").replace(/"/g, '""'); // Tránh lỗi JSON trong CSV
        
        let row = `${o.ma_don},${o.thoi_gian},${o.id_sales},${cleanName},${cleanPhone},${o.tong_tien},${o.trang_thai_ke_toan},"${cleanCart}"`;
        csvContent += row + "\n";
    });

    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_SongHau_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã tải xuống file CSV báo cáo.", "success");
}

// ==========================================
// 7. MODAL CHI TIẾT ĐƠN HÀNG (ĐÃ FIX CSP)
// ==========================================
const productNames = {
    "tt1_500": "Truyền Thống 1 (500g)", "tt2_500": "Truyền Thống 2 (500g)", "mm1_500": "Mạnh Mẽ 1 (500g)", "mm2_500": "Mạnh Mẽ 2 (500g)", "cd_500": "Cận Đại (500g)",
    "tt1_250": "Truyền Thống 1 (250g)", "tt2_250": "Truyền Thống 2 (250g)", "mm1_250": "Mạnh Mẽ 1 (250g)", "mm2_250": "Mạnh Mẽ 2 (250g)", "cd_250": "Cận Đại (250g)",
    "tt1_100": "Truyền Thống 1 (100g)", "tt2_100": "Truyền Thống 2 (100g)", "mm1_100": "Mạnh Mẽ 1 (100g)", "mm2_100": "Mạnh Mẽ 2 (100g)", "cd_100": "Cận Đại (100g)"
};

window.openModal = function(maDon) {
    // [QUAN TRỌNG]: Tự đi tìm dữ liệu order dựa trên mã đơn truyền vào
    const order = window.allAdminOrders.find(o => o.ma_don === maDon);
    if (!order) {
        showToast("Lỗi: Không tìm thấy dữ liệu đơn hàng!", "error");
        return;
    }

    document.getElementById('mOrderId').innerText = order.ma_don;
    
    // Parse JSON giỏ hàng
    let cartItemsHtml = '';
    try {
        let cart = JSON.parse(order.cart_json || "{}");
        for (const [id, qty] of Object.entries(cart)) {
            if (qty > 0) {
                let pName = productNames[id] || id; // Dùng tên chuẩn hóa nếu có
                cartItemsHtml += `<div class="cart-item"><span>${pName}</span> <strong style="color: var(--admin-primary); background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">x${qty}</strong></div>`;
            }
        }
    } catch(e) { 
        cartItemsHtml = 'Lỗi đọc dữ liệu giỏ hàng.'; 
    }

    if(cartItemsHtml === '') {
        cartItemsHtml = '<div style="color: #94a3b8; font-style: italic;">Giỏ hàng trống.</div>';
    }

    let html = `
        <div class="detail-row"><div class="detail-label">Thời gian tạo:</div> <div class="detail-value">${order.thoi_gian}</div></div>
        <div class="detail-row"><div class="detail-label">Nhân viên (ID):</div> <div class="detail-value">${order.id_sales}</div></div>
        <div class="detail-row"><div class="detail-label">Tên cửa hàng:</div> <div class="detail-value" style="color: var(--admin-primary); font-weight: 700;">${order.ten_quan}</div></div>
        <div class="detail-row"><div class="detail-label">SĐT Khách:</div> <div class="detail-value" style="font-weight: 600;">${order.sdt ? order.sdt.replace(/'/g, '') : ''}</div></div>
        
        <div class="cart-box" style="margin-top: 15px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
            <div style="font-weight: 700; color: #475569; margin-bottom: 10px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">Sản phẩm đã đặt:</div>
            ${cartItemsHtml}
            <div style="margin-top: 15px; font-size: 1.25rem; font-weight: 800; color: var(--danger); text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
                Tổng: ${parseInt(order.tong_tien || 0).toLocaleString('vi-VN')} đ
            </div>
        </div>
    `;
    
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('orderModal').style.display = 'flex';
}

window.closeModal = function() {
    document.getElementById('orderModal').style.display = 'none';
}

window.onclick = function(event) {
    let modal = document.getElementById('orderModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// ==========================================
// 8. CẬP NHẬT TIẾN ĐỘ GIAO HÀNG (MỚI)
// ==========================================
window.changeDeliveryStatus = async function(selectEl, maDon) {
    const newStatus = selectEl.value;
    selectEl.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: "updateDelivery", 
                token: localStorage.getItem('sh_it_token'), // Token bảo mật của admin
                ma_don: maDon, 
                new_status: newStatus 
            }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();

        if (result.success) {
            showToast(`Đã chuyển đơn ${maDon} sang: ${newStatus}`, "success");
            // Cập nhật lại data local để không bị mất khi filter
            const orderObj = window.allAdminOrders.find(o => o.ma_don === maDon);
            if(orderObj) orderObj.trang_thai = newStatus;
            selectEl.setAttribute('data-old', newStatus); // Cập nhật lại trạng thái cũ
        } else {
            showToast("Lỗi: " + result.msg, "error");
            selectEl.value = selectEl.getAttribute('data-old'); // Khôi phục nếu lỗi
        }
    } catch (err) {
        showToast("Lỗi kết nối mạng!", "error");
        selectEl.value = selectEl.getAttribute('data-old'); // Khôi phục nếu lỗi
    } finally {
        selectEl.disabled = false;
    }
}