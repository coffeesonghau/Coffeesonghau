/**
 * HỆ THỐNG QUẢN LÝ ĐƠN HÀNG SÔNG HẬU - FULL LOGIC (UPDATED)
 * Bao gồm: Dashboard, Bộ lọc, Sửa đơn, Xoá đơn và Hiệu ứng tải dữ liệu
 */

const userId = localStorage.getItem('sh_user_id');
const userName = localStorage.getItem('sh_user_name');

let allOrdersList = []; // Lưu trữ dữ liệu gốc để lọc không cần fetch lại
let currentEditingOrder = null;

// --- 1. KHỞI TẠO VÀ ĐỒNG BỘ ---
document.addEventListener("DOMContentLoaded", () => {
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Hiển thị tên người dùng nếu có
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.innerText = userName || "Nhân viên Sông Hậu";

    fetchOrders();
});

// --- 2. LẤY DỮ LIỆU ĐƠN HÀNG TỪ SERVER (CẢI TIẾN LOADING) ---
async function fetchOrders() {
    const refreshBtn = document.getElementById('refreshBtn');
    const container = document.getElementById('orderListContainer');

    // Bắt đầu hiệu ứng tải và chặn click trùng lặp
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "getOrders", id_sales: userId }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();

        if (result.success) {
            allOrdersList = result.orders; // Cập nhật danh sách đơn hàng
            renderOrderList(allOrdersList);
        } else {
            if (container) container.innerHTML = `<div style="text-align:center; padding:50px;">Chưa có đơn hàng nào.</div>`;
        }
    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        if (container) container.innerHTML = `<div style="text-align:center; color:red; padding:50px;">Lỗi kết nối máy chủ!</div>`;
    } finally {
        // Kết thúc hiệu ứng tải
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
    }
}

// --- 3. HIỂN THỊ DANH SÁCH & CẬP NHẬT DASHBOARD ---
function renderOrderList(orders) {
    const container = document.getElementById('orderListContainer');
    if (!container) return;
    container.innerHTML = '';

    let countToday = 0;
    let totalRevenueToday = 0;
    const todayStr = new Date().toLocaleDateString('vi-VN');

    if (orders.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#94a3b8;">Không tìm thấy đơn hàng phù hợp.</div>`;
        updateDashboard(0, 0);
        return;
    }

    orders.forEach(o => {
        // Thống kê đơn hôm nay
        const orderDate = new Date(o.thoi_gian).toLocaleDateString('vi-VN');
        if (orderDate === todayStr) {
            countToday++;
            totalRevenueToday += parseInt(o.tong_tien || 0);
        }

        const dateObj = new Date(o.thoi_gian);
        const timeDisplay = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        const cleanPhone = o.sdt ? o.sdt.replace(/'/g, '').trim() : 'Chưa có SĐT';

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-weight:800; color:var(--primary-color); font-size:0.9rem;">
                    <i class="fas fa-hashtag"></i> ${o.ma_don}
                </span>
                <span class="badge ${getStatusClass(o.trang_thai)}" style="padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:bold;">
                    ${o.trang_thai}
                </span>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:12px; border-left:4px solid #6F4E37; margin-bottom:12px;">
                <div style="font-weight:bold; color:#1e293b; font-size:1rem; margin-bottom:5px;">${o.ten_quan}</div>
                <div style="font-size:0.85rem; color:#475569; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-phone-alt" style="color:#22c55e;"></i> ${cleanPhone}
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-top:4px; display:flex; align-items:flex-start; gap:5px;">
                    <i class="fas fa-map-marker-alt" style="color:#3b82f6; margin-top:2px;"></i> 
                    <span>${o.dia_chi || 'Không có địa chỉ'}</span>
                </div>
            </div>
            <div style="background:#fffbeb; padding:10px; border-radius:8px; font-size:0.8rem; color:#92400e; margin-bottom:12px; border:1px solid #fef3c7;">
                <i class="fas fa-shopping-basket"></i> ${o.chi_tiet}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:10px;">
                <div style="font-weight:800; color:#e11d48; font-size:1.1rem;">
                    ${parseInt(o.tong_tien).toLocaleString('vi-VN')} đ
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-action btn-call" onclick='openBillPopup(${JSON.stringify(o).replace(/'/g, "\\'")})'>
    <i class="fas fa-file-invoice"></i> Bill
</button>
                    <button class="btn-action" onclick='openEditView(${JSON.stringify(o).replace(/'/g, "\\'")})'>
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn-action" style="color:#e74c3c; border-color:#f8d7da; background:#fdfdfe;" onclick="openDeleteModal('${o.ma_don}')">
                        <i class="fas fa-trash-alt"></i> Xoá
                    </button>
                </div>
            </div>
            <div style="font-size:0.7rem; color:#94a3b8; margin-top:10px; text-align:right;">
                🕒 ${timeDisplay} | ${o.kenh_ban.replace(/_/g, ' ')}
            </div>
        `;
        container.appendChild(card);
    });

    updateDashboard(countToday, totalRevenueToday);
}

function updateDashboard(count, total) {
    const countEl = document.getElementById('statCount');
    const totalEl = document.getElementById('statTotal');
    if (countEl) countEl.innerText = count;
    if (totalEl) totalEl.innerText = total.toLocaleString('vi-VN') + ' đ';
}

function getStatusClass(status) {
    if (status.includes('Chưa')) return 'pending';
    if (status.includes('Đang')) return 'shipping';
    if (status.includes('Thành')) return 'processed';
    return '';
}

// --- 4. BỘ LỌC VÀ TÌM KIẾM ---
window.filterOrders = function () {
    const term = document.getElementById('searchOrder').value.toLowerCase();
    const filtered = allOrdersList.filter(o => {
        const searchStr = `${o.ten_quan} ${o.ma_don} ${o.sdt} ${o.dia_chi}`.toLowerCase();
        return searchStr.includes(term);
    });
    renderOrderList(filtered);
};

window.filterByStatus = function (status, el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    if (status === 'all') {
        renderOrderList(allOrdersList);
    } else {
        const filtered = allOrdersList.filter(o => o.trang_thai.includes(status));
        renderOrderList(filtered);
    }
};

// --- 5. LOGIC SỬA ĐƠN HÀNG ---
window.openEditView = function (orderObj) {
    currentEditingOrder = orderObj;
    document.getElementById('orderListView').style.display = 'none';
    document.getElementById('editOrderView').style.display = 'block';

    document.getElementById('editOrderId').innerText = orderObj.ma_don;
    document.getElementById('editShopName').innerText = orderObj.ten_quan;
    document.getElementById('editPhone').value = orderObj.sdt ? orderObj.sdt.replace(/'/g, '') : '';
    document.getElementById('editAddress').value = orderObj.dia_chi || '';

    orderState.channel = orderObj.kenh_ban || "ban_le";
    try {
        orderState.items = JSON.parse(orderObj.cart_json || "{}");
    } catch (e) {
        orderState.items = {};
    }

    renderEditProducts();
};

window.closeEditView = function () {
    document.getElementById('editOrderView').style.display = 'none';
    document.getElementById('orderListView').style.display = 'block';
    currentEditingOrder = null;
};

window.filterEditProducts = function () {
    renderEditProducts();
};

function renderEditProducts() {
    const listEl = document.getElementById('edit-product-list');
    const searchTerm = document.getElementById('search-product').value.toLowerCase();
    listEl.innerHTML = '';

    productData.products.filter(p => p.name.toLowerCase().includes(searchTerm)).forEach(prod => {
        const qty = orderState.items[prod.id] || 0;
        const currentPrice = prod.prices[orderState.channel];

        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';
        if (qty > 0) itemDiv.style.background = "#fff3cd";

        itemDiv.innerHTML = `
            <div class="product-info">
                <div style="font-weight:bold;">${prod.name}</div>
                <div style="color:var(--primary-color); font-size:0.85rem;">${currentPrice.toLocaleString()} đ</div>
            </div>
            <div class="qty-controls" style="display:flex; align-items:center; gap:8px;">
                <button onclick="updateEditQty('${prod.id}', -1)" style="width:30px; height:30px; border-radius:50%; border:1px solid #ddd;">-</button>
                <span style="width:25px; text-align:center; font-weight:bold;">${qty}</span>
                <button onclick="updateEditQty('${prod.id}', 1)" style="width:30px; height:30px; border-radius:50%; border:1px solid #ddd; background:#6F4E37; color:white;">+</button>
            </div>
        `;
        listEl.appendChild(itemDiv);
    });
    calculateEditTotal();
}

window.updateEditQty = function (id, change) {
    if (!orderState.items[id]) orderState.items[id] = 0;
    orderState.items[id] += change;
    if (orderState.items[id] < 0) orderState.items[id] = 0;
    renderEditProducts();
};

function calculateEditTotal() {
    let total = 0;
    productData.products.forEach(prod => {
        const qty = orderState.items[prod.id] || 0;
        total += (prod.prices[orderState.channel] * qty);
    });
    document.getElementById('edit-total-price').innerText = total.toLocaleString('vi-VN') + ' đ';
}

window.saveUpdatedOrder = async function () {
    const btn = document.getElementById('btnUpdateOrder');
    const totalNew = parseInt(document.getElementById('edit-total-price').innerText.replace(/\D/g, ''));

    if (totalNew === 0) {
        alert("Đơn hàng không được để trống!");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'ĐANG LƯU...';

    const detailsArray = [];
    productData.products.forEach(p => {
        if (orderState.items[p.id] > 0) {
            detailsArray.push(`${p.name} x${orderState.items[p.id]}`);
        }
    });

    const payload = {
        action: "updateOrder",
        ma_don: currentEditingOrder.ma_don,
        sdt: document.getElementById('editPhone').value.trim(),
        dia_chi: document.getElementById('editAddress').value.trim(),
        chi_tiet_don: detailsArray.join(', ') + ` => Tổng: ${totalNew.toLocaleString()}đ`,
        tong_tien_so: totalNew,
        cart_json: JSON.stringify(orderState.items)
    };

    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cập nhật đơn hàng thành công!");
            location.reload();
        }
    } catch (err) {
        alert("❌ Lỗi kết nối!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'LƯU THAY ĐỔI';
    }
};
// ==========================================
// TÍNH NĂNG POPUP HÓA ĐƠN (BILL)
// ==========================================
window.openBillPopup = function(orderObj) {
    window.currentBillData = orderObj;
    // 1. Gắn thông tin cơ bản
    document.getElementById('billOrderId').innerText = orderObj.ma_don;
    document.getElementById('billShopName').innerText = orderObj.ten_quan;
    document.getElementById('billPhone').innerText = orderObj.sdt ? orderObj.sdt.replace(/'/g, '') : 'Chưa có SĐT';
    document.getElementById('billAddress').innerText = orderObj.dia_chi || 'Không có địa chỉ';

    // 2. Format thời gian
    const dateObj = new Date(orderObj.thoi_gian);
    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    document.getElementById('billTime').innerText = timeStr;

    // 3. Hiển thị Tổng tiền
    document.getElementById('billTotal').innerText = parseInt(orderObj.tong_tien).toLocaleString('vi-VN') + ' đ';

    // 4. Xử lý tách chuỗi chi tiết đơn để in ra list món ăn
    const billItemsContainer = document.getElementById('billItems');
    billItemsContainer.innerHTML = '';

    let chiTietText = orderObj.chi_tiet || '';
    // Tách bỏ phần "=> Tổng tiền: ..." ở đuôi chuỗi
    let itemsText = chiTietText.split('=>')[0].trim(); 
    
    if(itemsText) {
        // Tách từng món dựa theo dấu phẩy
        let itemsArray = itemsText.split(',');
        itemsArray.forEach(item => {
            let parts = item.trim().split(' x'); // Cắt bằng chữ " x" để tách tên và số lượng
            let name = parts[0];
            let qty = parts[1] ? `x${parts[1]}` : 'x1';
            
            billItemsContainer.innerHTML += `
                <tr>
                    <td style="padding: 6px 0; color: #334155; font-weight: 600;">${name}</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold; color: var(--primary-color); white-space: nowrap;">${qty}</td>
                </tr>
            `;
        });
    }

    // 5. Hiển thị modal
    document.getElementById('billModal').style.display = 'flex';
};

window.closeBillPopup = function() {
    document.getElementById('billModal').style.display = 'none';
};
window.copyBillToZalo = function() {
    if (!window.currentBillData) return;
    const o = window.currentBillData;
    
    // Format thời gian
    const dateObj = new Date(o.thoi_gian);
    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    // Xử lý danh sách món cho đẹp
    let chiTietText = o.chi_tiet || '';
    let itemsText = chiTietText.split('=>')[0].trim();
    let formattedItems = itemsText.split(',').map(item => "▪️ " + item.trim()).join('\n');

    // Chuyển đổi thành nội dung văn bản (Text)
    const textToCopy = `🧾 SÔNG HẬU COFFEE\n` +
                       `📌 Mã đơn: ${o.ma_don}\n` +
                       `🕒 Thời gian: ${timeStr}\n` +
                       `----------------------\n` +
                       `🏠 Khách hàng: ${o.ten_quan}\n` +
                       `📞 SĐT: ${o.sdt ? o.sdt.replace(/'/g, '') : 'Chưa có'}\n` +
                       `📍 Địa chỉ: ${o.dia_chi || 'Không có'}\n` +
                       `----------------------\n` +
                       `📝 CHI TIẾT ĐƠN:\n${formattedItems}\n` +
                       `----------------------\n` +
                       `💰 TỔNG CỘNG: ${parseInt(o.tong_tien).toLocaleString('vi-VN')} đ\n\n` +
                       `Cảm ơn Quý khách đã ủng hộ! ☕`;

    // Lệnh Copy vào Clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("✅ Đã copy hóa đơn! Bạn có thể chuyển sang Zalo/Messenger dán (Paste) cho khách.");
        });
    } else {
        // Dự phòng cho các trình duyệt cũ
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert("✅ Đã copy hóa đơn! Bạn có thể chuyển sang Zalo/Messenger dán (Paste) cho khách.");
        } catch (err) {
            alert("❌ Trình duyệt không hỗ trợ copy tự động. Vui lòng chụp ảnh màn hình Bill.");
        }
        document.body.removeChild(textArea);
    }
};