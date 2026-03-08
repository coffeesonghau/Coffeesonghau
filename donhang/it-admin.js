/* ==========================================
   SÔNG HẬU - ENTERPRISE ADMIN JS (V5)
   Tích hợp: Dynamic Products (Từ data.js), HR, Internal Notes & Inventory Shifts (Kết Ca)
========================================== */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec"; 

window.allAdminOrders = [];
window.allProducts = {}; // Lưu trữ động danh sách sản phẩm từ data.js
window.allStaffData = []; // Lưu danh sách Nhân sự để làm Dropdown kết ca

// ==========================================
// 0. INDEXED DB CHO LƯU TRỮ OFFLINE AVATAR
// ==========================================
const DB_NAME = "SH_EnterpriseDB";
const STORE_NAME = "AdminSettings";
let idb;

function initIndexedDB() {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
        idb = event.target.result;
        if (!idb.objectStoreNames.contains(STORE_NAME)) {
            idb.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
    };
    
    request.onsuccess = (event) => {
        idb = event.target.result;
        loadAvatarFromDB();
    };
    
    request.onerror = (event) => console.error("Lỗi IndexedDB:", event.target.error);
}

function saveToDB(key, data) {
    if (!idb) return;
    const transaction = idb.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put({ key: key, value: data });
}

function loadAvatarFromDB() {
    if (!idb) return;
    const transaction = idb.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("adminAvatarBase64");
    
    request.onsuccess = () => {
        if (request.result && request.result.value) {
            document.getElementById('adminAvatar').src = request.result.value;
        }
    };
}

document.getElementById('avatarUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) return showToast("Kích thước ảnh quá lớn (Tối đa 2MB)!", "error");
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64String = e.target.result;
            document.getElementById('adminAvatar').src = base64String;
            saveToDB("adminAvatarBase64", base64String);
            showToast("Đã cập nhật Ảnh đại diện nội bộ.", "success");
        };
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 1. KHỞI TẠO & ĐĂNG NHẬP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initIndexedDB();
    if (localStorage.getItem('sh_it_logged_in') === 'true') {
        document.getElementById('itLoginOverlay').style.display = 'none';
        loadAdminData(); 
        loadStaffData(); 
        loadProductsData(); // MỚI: Tải từ data.js
        loadShiftsData(); 
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
            showToast("Truy cập hệ thống Enterprise thành công!", "success");
            loadAdminData();
            loadStaffData();
            loadProductsData(); // MỚI: Tải từ data.js
            loadShiftsData();
        } else {
            showToast(result.msg || "Sai thông tin bảo mật!", "error");
        }
    } catch (err) {
        console.error("Lỗi Đăng Nhập:", err);
        showToast("Lỗi kết nối Server Google Sheet!", "error");
    } finally {
        btn.innerHTML = 'XÁC THỰC BẢO MẬT';
        btn.disabled = false;
    }
}

function logoutIT() {
    if(confirm("Hệ thống sẽ đóng phiên làm việc. Xác nhận đăng xuất?")) {
        localStorage.removeItem('sh_it_logged_in');
        location.reload();
    }
}

// ==========================================
// 2. GIAO DIỆN & TIỆN ÍCH CHUNG
// ==========================================
const tabTitles = { 'dashboard': 'Tổng Quan Số Liệu', 'orders': 'CSDL Đơn Hàng', 'staff': 'Quản Trị Nhân Sự Sales', 'products': 'Danh Mục Hàng Hóa', 'shifts': 'Quản lý Kho & Kết Ca' };

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById('pageTitle').innerText = tabTitles[tabId];
}

function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle');
    
    if(type === 'warning') toast.style.borderLeftColor = 'var(--warning)';
    if(type === 'error') toast.style.borderLeftColor = 'var(--danger)';
    
    toast.innerHTML = `<i class="fas ${icon}" style="color: ${type === 'success' ? 'var(--success)' : (type === 'warning' ? 'var(--warning)' : 'var(--danger)')}; font-size: 1.2rem;"></i> <span>${message}</span>`;
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

window.closeModal = function(modalId) { 
    if(modalId) {
        document.getElementById(modalId).style.display = 'none'; 
    } else {
        document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none');
    }
}

window.onclick = function(event) { 
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    } 
}

// ==========================================
// 3. TẢI VÀ XỬ LÝ DỮ LIỆU ĐƠN HÀNG
// ==========================================
async function loadAdminData() {
    const tableBody = document.getElementById('adminOrderTable');
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>Đang đồng bộ dữ liệu Database...</td></tr>';

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
            showToast("Đã đồng bộ Dữ liệu Đơn hàng.", "success");
        } else {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">${result.msg}</td></tr>`;
        }
    } catch (err) {
        console.error("Lỗi Tải Dữ Liệu:", err);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--danger);">Lỗi kết nối mạng, không thể tải dữ liệu!</td></tr>';
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

window.applyFilters = function() {
    const term = document.getElementById('filterSearch').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const salesFilter = document.getElementById('filterSales').value;
    
    const dateStartVal = document.getElementById('filterDateStart').value;
    const dateEndVal = document.getElementById('filterDateEnd').value;
    const dateStart = dateStartVal ? new Date(dateStartVal).getTime() : 0;
    const dateEnd = dateEndVal ? new Date(dateEndVal).getTime() + 86400000 : Infinity;

    const filteredOrders = window.allAdminOrders.filter(o => {
        const searchStr = `${o.ma_don} ${o.ten_quan} ${o.sdt}`.toLowerCase();
        const matchText = searchStr.includes(term);

        let matchStatus = true;
        const statusStr = (o.trang_thai_ke_toan || '').toLowerCase();
        if (statusFilter === 'pending') matchStatus = !statusStr.includes('đã');
        if (statusFilter === 'processed') matchStatus = statusStr.includes('đã');

        let matchSales = true;
        if (salesFilter !== 'all') matchSales = (o.id_sales == salesFilter);

        let matchDate = true;
        let orderDateParts = String(o.thoi_gian).split(' ')[0].split('/');
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
        const cleanPhone = (o.sdt && o.sdt !== "'") ? String(o.sdt).replace(/'/g, '') : 'N/A';
        
        let statusClass = 'pending';
        let statusText = o.trang_thai_ke_toan || 'Chưa tạo đơn';
        if (statusText.toLowerCase().includes('đã')) statusClass = 'processed';

        const deliveryStatuses = ["Đang yêu cầu", "Đang chuẩn bị", "Đang giao", "Hoàn thành", "Thất bại"];
        let currentDelivery = o.trang_thai || "Đang yêu cầu";
        
        let selectHtml = `<select onchange="changeDeliveryStatus(this, '${o.ma_don}')" data-old="${currentDelivery}" style="padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; color: #334155; background: #f8fafc; outline: none; cursor: pointer;">`;
        deliveryStatuses.forEach(s => { selectHtml += `<option value="${s}" ${currentDelivery === s ? 'selected' : ''}>${s}</option>`; });
        selectHtml += `</select>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${o.ma_don}</strong></td>
            <td>${o.thoi_gian}</td>
            <td><span style="font-weight: 700; color: var(--admin-secondary);">${o.id_sales}</span></td>
            <td><div style="font-weight: 600;">${o.ten_quan}</div><div style="font-size: 0.8rem; color: #64748b;">📞 ${cleanPhone}</div></td>
            <td style="color: var(--danger); font-weight: 700;">${total}</td>
            <td>${selectHtml}</td> <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                ${statusClass === 'pending' ? `<button class="action-btn check" title="Xác nhận Kế toán" onclick="markAsProcessed(this, '${o.ma_don}')"><i class="fas fa-check-circle"></i></button>` : ''}
                <button class="action-btn edit" title="Xem chi tiết" onclick="openOrderModal('${o.ma_don}')"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 4. QUẢN LÝ NHÂN SỰ SALES
// ==========================================
async function loadStaffData() {
    const staffTable = document.getElementById('adminStaffTable');
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "getStaffList" }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        
        if(result.success && result.data) {
            window.allStaffData = result.data; 
            renderStaffTable(result.data);
        } else {
            staffTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">${result.msg}</td></tr>`;
        }
    } catch (err) {
        console.error("Lỗi Tải Nhân Sự:", err);
        staffTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Lỗi kết nối mạng khi tải nhân sự!</td></tr>';
    }
}

function renderStaffTable(staffList) {
    const tbody = document.getElementById('adminStaffTable');
    tbody.innerHTML = '';
    
    staffList.forEach(staff => {
        let isLocked = staff.status === "Nghỉ việc";
        let statusClass = isLocked ? "pending" : "active";
        
        tbody.innerHTML += `
            <tr style="${isLocked ? 'opacity: 0.6;' : ''}">
                <td><strong style="color: var(--admin-primary)">${staff.id}</strong></td>
                <td style="font-weight: 600;">${staff.name}</td>
                <td><i class="fas fa-map-marker-alt" style="color: #94a3b8; margin-right: 5px;"></i> ${staff.region || "Chưa cập nhật"}</td>
                <td><span class="badge ${statusClass}">${staff.status}</span></td>
                <td>
                    <button class="btn-action" style="background: #e2e8f0; color: #334155; padding: 6px 10px; margin-right: 5px;" onclick="resetStaffPass('${staff.id}')" title="Reset Mật khẩu">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-action" style="background: ${isLocked ? '#10b981' : '#ef4444'}; color: #fff; padding: 6px 10px;" onclick="toggleStaffStatus('${staff.id}')" title="${isLocked ? 'Mở khóa' : 'Khóa tài khoản'}">
                        <i class="fas ${isLocked ? 'fa-unlock' : 'fa-lock'}"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

window.toggleStaffStatus = async function(id) {
    if(!confirm(`Đổi trạng thái Hoạt Động / Nghỉ Việc của nhân sự ID: ${id}?`)) return;
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "toggleStaffStatus", id: id }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        if(result.success) {
            showToast(result.msg, "success");
            loadStaffData(); 
        } else { showToast(result.msg, "error"); }
    } catch (err) { showToast("Lỗi mạng!", "error"); }
}

window.resetStaffPass = async function(id) {
    if(!confirm(`Yêu cầu Reset mật khẩu về mặc định (123456) cho Sales ID: ${id}?`)) return;
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "resetStaffPass", id: id }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        if(result.success) showToast(`Đã reset mật khẩu ${id} về 123456.`, "success");
        else showToast(`Lỗi: ${result.msg}`, "error");
    } catch (err) { showToast("Lỗi kết nối mạng!", "error"); }
}

window.openStaffModal = function() {
    document.getElementById('newStaffId').value = '';
    document.getElementById('newStaffName').value = '';
    document.getElementById('newStaffRegion').value = '';
    document.getElementById('staffModal').style.display = 'flex';
}

window.saveNewStaff = async function() {
    const id = document.getElementById('newStaffId').value.trim();
    const name = document.getElementById('newStaffName').value.trim();
    const region = document.getElementById('newStaffRegion').value.trim();
    const btn = document.getElementById('btnSaveStaff');

    if(!id || !name) return showToast("Vui lòng nhập ID và Tên hiển thị!", "warning");

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG TẠO...';
    btn.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "addStaff", id: id, name: name, region: region }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        
        if(result.success) {
            showToast(result.msg, "success");
            closeModal('staffModal');
            loadStaffData(); 
        } else { showToast(result.msg, "error"); }
    } catch (err) { showToast("Lỗi kết nối!", "error"); }
    finally { btn.innerHTML = 'TẠO TÀI KHOẢN'; btn.disabled = false; }
}


// ==========================================
// 5. QUẢN TRỊ HÀNG HÓA (ĐỌC TỪ DATA.JS)
// ==========================================
function loadProductsData() {
    const tbody = document.getElementById('adminProductTable');
    try {
        window.allProducts = {}; 
        
        if (typeof productData !== 'undefined' && productData.products) {
            productData.products.forEach(p => window.allProducts[p.id] = p);
            renderProductTable(productData.products);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Không tìm thấy dữ liệu từ file data.js!</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải dữ liệu Sản Phẩm!</td></tr>`;
    }
}

function renderProductTable(products) {
    const tbody = document.getElementById('adminProductTable');
    tbody.innerHTML = '';
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có sản phẩm nào trong data.js.</td></tr>`;
        return;
    }
    
    products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><strong style="color: var(--admin-secondary);">${p.id}</strong></td>
                <td style="font-weight: 600;">${p.name}</td>
                <td>${p.weight}</td>
                <td style="color: var(--danger); font-weight: 700;">${Number(p.prices.ban_le || 0).toLocaleString('vi-VN')} đ</td>
                <td style="color: var(--warning); font-weight: 700;">${Number(p.prices.dai_ly_quan || 0).toLocaleString('vi-VN')} đ</td>
                <td style="color: var(--success); font-weight: 700;">${Number(p.prices.he_thong_npp || 0).toLocaleString('vi-VN')} đ</td>
            </tr>
        `;
    });
}


// ==========================================
// 6. CÁC CHỨC NĂNG KHÁC (Update Kế toán, Xuất File, Modal Đơn hàng)
// ==========================================
window.markAsProcessed = async function(btn, maDon) {
    if(!confirm(`Xác nhận đánh dấu đơn ${maDon} ĐÃ TẠO trên phần mềm kế toán?`)) return;
    const tr = btn.closest('tr');
    const badge = tr.querySelector('.badge');
    const originalContent = btn.innerHTML;
    
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
            showToast("Kế toán xử lý thành công.", "success");
        } else {
            showToast("Lỗi Server", "error");
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    } catch (err) { showToast("Mất kết nối mạng!", "error"); btn.innerHTML = originalContent; btn.disabled = false; }
}

window.exportToExcel = function() {
    const tbody = document.getElementById('adminOrderTable');
    if(tbody.rows.length === 0 || tbody.innerText.includes("Không tìm thấy")) return showToast("Không có dữ liệu để xuất!", "error");
    
    let csvContent = "Ma Don,Thoi Gian,ID Sales,Ten Quan,SDT,Tong Tien,Trang Thai Ke Toan,Chi Tiet San Pham\n";
    const visibleIds = Array.from(tbody.querySelectorAll('td:first-child strong')).map(el => el.innerText);
    const ordersToExport = window.allAdminOrders.filter(o => visibleIds.includes(o.ma_don));

    ordersToExport.forEach(o => {
        let cleanPhone = String(o.sdt || "").replace(/'/g, '');
        let cleanName = String(o.ten_quan || "").replace(/,/g, ' '); 
        let cleanCart = String(o.cart_json || "{}").replace(/"/g, '""'); 
        
        let row = `${o.ma_don},${o.thoi_gian},${o.id_sales},${cleanName},${cleanPhone},${o.tong_tien},${o.trang_thai_ke_toan},"${cleanCart}"`;
        csvContent += row + "\n";
    });

    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Export_SH_Admin_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.openOrderModal = function(maDon) {
    const order = window.allAdminOrders.find(o => o.ma_don === maDon);
    if (!order) return showToast("Lỗi dữ liệu", "error");

    document.getElementById('mOrderId').innerText = order.ma_don;
    document.getElementById('mOrderId').setAttribute('data-id', order.ma_don); 
    
    const noteEl = document.getElementById('mInternalNote');
    if(noteEl) noteEl.value = order.ghi_chu_noi_bo || "";

    let cartItemsHtml = '';
    try {
        let cart = JSON.parse(order.cart_json || "{}");
        for (const [id, qty] of Object.entries(cart)) {
            if (qty > 0) {
                let pName = window.allProducts[id] ? `${window.allProducts[id].name} (${window.allProducts[id].weight})` : id;
                cartItemsHtml += `<div class="cart-item" style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><span>${pName}</span> <strong style="color: var(--admin-primary); background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">x${qty}</strong></div>`;
            }
        }
    } catch(e) { cartItemsHtml = 'Lỗi dữ liệu giỏ hàng.'; }

    const cleanPhone = order.sdt ? String(order.sdt).replace(/'/g, '') : '';

    let html = `
        <div style="margin-bottom: 10px;"><strong>Thời gian:</strong> ${order.thoi_gian}</div>
        <div style="margin-bottom: 10px;"><strong>ID Sales:</strong> ${order.id_sales}</div>
        <div style="margin-bottom: 10px;"><strong>Khách hàng:</strong> <span style="color: var(--admin-primary); font-weight: bold;">${order.ten_quan}</span></div>
        <div style="margin-bottom: 10px;"><strong>SĐT:</strong> ${cleanPhone}</div>
        
        <div style="margin-top: 20px; border: 1px solid var(--border); padding: 15px; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px dashed var(--border); padding-bottom: 10px;">Chi tiết sản phẩm:</div>
            ${cartItemsHtml}
            <div style="margin-top: 15px; font-size: 1.3rem; font-weight: 800; color: var(--danger); text-align: right;">
                Tổng: ${parseInt(order.tong_tien || 0).toLocaleString('vi-VN')} đ
            </div>
        </div>
    `;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('orderModal').style.display = 'flex';
}

window.saveInternalNote = async function() {
    const maDon = document.getElementById('mOrderId').getAttribute('data-id');
    const note = document.getElementById('mInternalNote').value;
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "updateInternalNote", ma_don: maDon, note: note }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        if (result.success) {
            showToast("Đã lưu ghi chú nội bộ!", "success");
            const orderObj = window.allAdminOrders.find(o => o.ma_don === maDon);
            if(orderObj) orderObj.ghi_chu_noi_bo = note;
        } else { showToast("Lỗi Server", "error"); }
    } catch (err) { showToast("Lỗi mạng!", "error"); }
}

window.changeDeliveryStatus = async function(selectEl, maDon) {
    const newStatus = selectEl.value;
    selectEl.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "updateDelivery", ma_don: maDon, new_status: newStatus }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        if (result.success) {
            showToast(`Giao vận: ${newStatus}`, "success");
            const orderObj = window.allAdminOrders.find(o => o.ma_don === maDon);
            if(orderObj) orderObj.trang_thai = newStatus;
            selectEl.setAttribute('data-old', newStatus); 
        } else {
            showToast("Lỗi Server", "error");
            selectEl.value = selectEl.getAttribute('data-old'); 
        }
    } catch (err) {
        showToast("Lỗi mạng!", "error");
        selectEl.value = selectEl.getAttribute('data-old'); 
    } finally { selectEl.disabled = false; }
}

// ==========================================
// 7. QUẢN LÝ KẾT CA / TỒN XE (SHIFTS)
// ==========================================
async function loadShiftsData() {
    const tbody = document.getElementById('adminShiftTable');
    try {
        const res = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: "getShifts" }) 
        });
        const result = await res.json();
        if(result.success) {
            tbody.innerHTML = '';
            if(result.data.length === 0) return tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có phiếu kết ca nào.</td></tr>';
            
            result.data.forEach(s => {
                let detailsHtml = '';
                try {
                    let soldItems = JSON.parse(s.sold_details || "{}");
                    for (const [id, qty] of Object.entries(soldItems)) {
                        if(qty > 0) detailsHtml += `<span class="badge processed" style="margin-right:4px; margin-bottom:4px;">${window.allProducts[id] ? window.allProducts[id].name : id}: ${qty}</span>`;
                    }
                } catch(e) {}
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${s.id}</strong></td>
                        <td>${s.time}</td>
                        <td style="color:var(--admin-secondary); font-weight:700;">${s.sales_id}</td>
                        <td style="color:var(--danger); font-weight:800;">${Number(s.revenue).toLocaleString('vi-VN')} đ</td>
                        <td>${detailsHtml || '<span style="color:#94a3b8; font-size:0.85rem;">Không phát sinh doanh thu</span>'}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {}
}

window.openShiftModal = function() {
    const selectSales = document.getElementById('shiftSalesId');
    selectSales.innerHTML = '<option value="">-- Chọn Nhân Sự --</option>';
    window.allStaffData.forEach(staff => {
        if (staff.status === "Đang hoạt động") selectSales.innerHTML += `<option value="${staff.id}">${staff.id} - ${staff.name}</option>`;
    });

    const tbody = document.getElementById('shiftProductsTable');
    tbody.innerHTML = '';
    
    if (typeof productData !== 'undefined' && productData.products) {
        productData.products.forEach(p => {
            const price = Number(p.prices.dai_ly_quan) || 0; 
            
            tbody.innerHTML += `
                <tr data-pid="${p.id}" data-price="${price}">
                    <td style="font-weight:600; font-size:0.9rem;">${p.name} (${p.weight}) <div style="font-size:0.8rem; color:#64748b; font-weight:400;">${price.toLocaleString('vi-VN')} đ</div></td>
                    <td><input type="number" class="in-mangdi" min="0" value="0" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; text-align:center;" oninput="calcShiftRow(this)"></td>
                    <td><input type="number" class="in-mangve" min="0" value="0" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; text-align:center;" oninput="calcShiftRow(this)"></td>
                    <td style="text-align:center; font-weight:700; color:var(--admin-secondary);" class="out-daban">0</td>
                    <td style="text-align:right; font-weight:700; color:var(--danger);" class="out-thanhtien">0 đ</td>
                </tr>
            `;
        });
    }

    document.getElementById('shiftTotalText').innerText = '0 đ';
    document.getElementById('shiftModal').style.display = 'flex';
}


window.calcShiftRow = function(inputEl) {
    const tr = inputEl.closest('tr');
    const price = Number(tr.getAttribute('data-price'));
    const mangDi = Number(tr.querySelector('.in-mangdi').value) || 0;
    const mangVe = Number(tr.querySelector('.in-mangve').value) || 0;
    
    let daBan = mangDi - mangVe;
    if(daBan < 0) daBan = 0; 

    tr.querySelector('.out-daban').innerText = daBan;
    tr.querySelector('.out-thanhtien').innerText = (daBan * price).toLocaleString('vi-VN') + ' đ';

    calcShiftTotal();
}

function calcShiftTotal() {
    let total = 0;
    document.querySelectorAll('#shiftProductsTable tr').forEach(tr => {
        const price = Number(tr.getAttribute('data-price'));
        const daban = Number(tr.querySelector('.out-daban').innerText) || 0;
        total += (daban * price);
    });
    document.getElementById('shiftTotalText').innerText = total.toLocaleString('vi-VN') + ' đ';
    document.getElementById('shiftTotalText').setAttribute('data-total', total);
}

window.saveShift = async function() {
    const salesId = document.getElementById('shiftSalesId').value;
    if(!salesId) return showToast("Vui lòng chọn nhân sự Sales!", "warning");

    let mangDiObj = {};
    let mangVeObj = {};
    let daBanObj = {};
    let totalRevenue = Number(document.getElementById('shiftTotalText').getAttribute('data-total')) || 0;

    let hasData = false;

    document.querySelectorAll('#shiftProductsTable tr').forEach(tr => {
        const pid = tr.getAttribute('data-pid');
        const mDi = Number(tr.querySelector('.in-mangdi').value) || 0;
        const mVe = Number(tr.querySelector('.in-mangve').value) || 0;
        const dBan = Number(tr.querySelector('.out-daban').innerText) || 0;

        if(mDi > 0 || mVe > 0) {
            hasData = true;
            mangDiObj[pid] = mDi;
            mangVeObj[pid] = mVe;
            if(dBan > 0) daBanObj[pid] = dBan;
        }
    });

    if(!hasData) return showToast("Vui lòng nhập số lượng hàng hóa Mang Đi/Về!", "warning");

    const btn = document.getElementById('btnSaveShift');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...'; 
    btn.disabled = true;

    try {
        const res = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "saveShift", 
                sales_id: salesId, 
                mang_di: JSON.stringify(mangDiObj), 
                mang_ve: JSON.stringify(mangVeObj), 
                da_ban: JSON.stringify(daBanObj), 
                revenue: totalRevenue 
            }) 
        });
        const result = await res.json();
        if(result.success) { 
            showToast("Lưu phiếu kết ca thành công!", "success"); 
            closeModal('shiftModal'); 
            loadShiftsData(); 
        } else showToast(result.msg, "error");
    } catch (err) { showToast("Lỗi kết nối mạng!", "error"); } 
    finally { 
        btn.innerHTML = '<i class="fas fa-save"></i> LƯU PHIẾU KẾT CA'; 
        btn.disabled = false; 
    }
}