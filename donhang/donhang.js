const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec"; 
const userId = localStorage.getItem('sh_user_id');
const userName = localStorage.getItem('sh_user_name'); 

let currentEditingOrder = null;
const orderState = { channel: "ban_le", items: {} };
window.currentSearchTerm = '';

// --- 1. HÀM BỔ TRỢ XỬ LÝ MÀU SẮC TRẠNG THÁI (MỚI THÊM) ---
function getStatusClass(status) {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('hoàn thành') || s.includes('đã tạo đơn')) return 'processed'; // Xanh lá
    if (s.includes('đang giao') || s.includes('đang chuẩn bị')) return 'shipping'; // Xanh biển
    return 'pending'; // Vàng (Mặc định cho "Đang yêu cầu" hoặc "Chờ xử lý")
}

// DB QUẢN LÝ AVATAR
const dbHelper = {
    dbName: 'SongHauDB',
    storeName: 'userProfile',
    initDB: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(request.error);
        });
    },
    getAvatar: async function() {
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

// --- 2. CẬP NHẬT HÀM HIỂN THỊ ĐƠN HÀNG ---
function renderOrders(data) {
    const container = document.getElementById('order-list-container');
    if (!container) return;
    
    container.innerHTML = data.map(o => {
        // Lấy trạng thái từ Database gửi về
        let statusText = o.trang_thai || "Đang yêu cầu"; 
        let statusClass = getStatusClass(statusText);

        return `
            <div class="order-card">
                <div class="order-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">${o.ten_quan}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                            <i class="fas fa-barcode"></i> ${o.ma_don}
                        </div>
                    </div>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="order-details" style="margin: 12px 0; padding: 10px; background: #f8fafc; border-radius: 8px; font-size: 0.9rem;">
                    <div style="margin-bottom: 4px;"><i class="fas fa-clock"></i> ${o.thoi_gian}</div>
                    <div style="color: #475569; line-height: 1.4;">${o.chi_tiet}</div>
                </div>

                <div class="order-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; pt: 10px;">
                    <div style="font-weight: 800; color: #ef4444; font-size: 1.1rem;">
                        ${Number(o.tong_tien).toLocaleString('vi-VN')} đ
                    </div>
                    <button class="btn-edit" onclick="openEditModal('${o.ma_don}')" 
                        style="padding: 6px 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
                        <i class="fas fa-edit"></i> Sửa đơn
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
document.addEventListener("DOMContentLoaded", () => {
    if (!userId) { window.location.href = 'login.html'; return; }

    // ĐỒNG BỘ TÊN VÀ AVATAR
    const menuUserNameEl = document.getElementById('menuUserName');
    if (menuUserNameEl) {
        menuUserNameEl.innerText = userName || "Thành viên";
        if(userName) {
            document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4e54c8&color=fff&size=100`;
        }
    }
    dbHelper.getAvatar().then(imgBase64 => {
        const avatarImg = document.getElementById('userAvatar');
        if(imgBase64 && avatarImg) avatarImg.src = imgBase64;
    }).catch(err => console.log("Chưa có avatar trong DB"));

    fetchOrders();
});

function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('open');
}

function logout() {
    if(confirm("Bạn muốn đăng xuất?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// 1. LẤY DANH SÁCH ĐƠN
async function fetchOrders() {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "getOrders", id_sales: userId }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const result = await response.json();
        document.getElementById('loadingText').style.display = 'none';
        
        if (result.success && result.orders.length > 0) {
            window.allOrdersList = result.orders; // Lưu lại để tìm kiếm
            renderOrderList(window.allOrdersList);
        } else {
            document.getElementById('orderListContainer').innerHTML = "<p style='text-align:center;'>Chưa có đơn hàng nào.</p>";
        }
    } catch (err) {
        document.getElementById('loadingText').innerHTML = "❌ Lỗi tải dữ liệu. Vui lòng thử lại.";
    }
}

// 1.1 HÀM TÌM KIẾM VÀ LỌC ĐƠN HÀNG KẾT HỢP
let searchTimeout;
window.filterOrders = function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = document.getElementById('searchOrder').value.toLowerCase();
        const filtered = window.allOrdersList.filter(o => {
            const searchStr = `${o.ten_quan || ''} ${o.ma_don || ''} ${o.sdt || ''} ${o.dia_chi || ''}`.toLowerCase();
            return searchStr.includes(term);
        });
        renderOrderList(filtered);
    }, 300); // Đợi 300ms sau thao tác gõ cuối cùng
};

// TÍNH NĂNG 3: HÀM COPY ĐƠN HÀNG GỬI ZALO
window.copyOrderToZalo = function(ma_don) {
    const order = window.allOrdersList.find(o => o.ma_don === ma_don);
    if (!order) return;

    const cleanPhone = order.sdt ? order.sdt.replace(/'/g, '') : 'Chưa có SĐT';
    const total = parseInt(order.tong_tien || 0).toLocaleString('vi-VN');

    const textToCopy = `📦 MÃ ĐƠN: ${order.ma_don}\n🏠 Quán: ${order.ten_quan}\n📞 SĐT: ${cleanPhone}\n📍 Địa chỉ: ${order.dia_chi}\n📝 Chi tiết giao:\n${order.chi_tiet}\n💰 Tiền thu: ${total} đ`;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("✅ Đã copy thông tin giao hàng! Mở Zalo dán cho shipper ngay nhé.");
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert("✅ Đã copy thông tin giao hàng! Mở Zalo dán cho shipper ngay nhé.");
        } catch (err) {
            alert("❌ Trình duyệt không hỗ trợ copy tự động.");
        }
        document.body.removeChild(textArea);
    }
}

// 1.2 HÀM HIỂN THỊ DANH SÁCH VÀ THỐNG KÊ
function renderOrderList(orders) {
    const container = document.getElementById('orderListContainer');
    container.innerHTML = '';
    
    // Cập nhật thống kê
    let totalRevenue = 0;
    orders.forEach(o => totalRevenue += parseInt(o.tong_tien || 0));
    document.getElementById('statCount').innerText = orders.length;
    document.getElementById('statTotal').innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <p style="color: #64748b; margin: 0;">Không tìm thấy đơn hàng nào!</p>
            </div>`;
        return;
    }

    orders.forEach(o => {
        const dateObj = new Date(o.thoi_gian);
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth()+1} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        
        let statusBg = "#f39c12"; 
        let statusText = o.trang_thai.toLowerCase();
        if (statusText.includes("chưa")) statusBg = "#e74c3c";
        if (statusText.includes("đã") || statusText.includes("thành công")) statusBg = "#27ae60";

        // Xử lý dữ liệu SĐT và Địa chỉ triệt để hơn
        let cleanPhone = (o.sdt && o.sdt.trim() !== '' && o.sdt !== "'") ? o.sdt.replace(/'/g, '').trim() : 'Chưa có SĐT';
        let addressStr = (o.dia_chi && o.dia_chi.trim() !== '') ? o.dia_chi.trim() : 'Chưa có địa chỉ';

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header" style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                <span class="order-id" style="font-weight: bold; color: var(--primary-color);"><i class="fas fa-hashtag"></i> ${o.ma_don}</span>
                <span style="background: ${statusBg}; color: white; padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: bold;">${o.trang_thai}</span>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #2980b9;">
                <div class="order-shop" style="font-size: 1.1rem; font-weight: bold; margin-bottom: 10px; color: #2c3e50;">
                    <i class="fas fa-store" style="color: #34495e; margin-right: 5px;"></i> ${o.ten_quan}
                </div>
                
                <a href="${cleanPhone !== 'Chưa có SĐT' ? 'tel:' + cleanPhone : '#'}" style="display: flex; align-items: center; gap: 10px; color: #27ae60; text-decoration: none; font-weight: bold; margin-bottom: 10px; font-size: 0.95rem;">
                    <div style="background:#e8f8f5; padding:6px; border-radius:50%; width:26px; height:26px; display:flex; justify-content:center; align-items:center;"><i class="fas fa-phone-alt"></i></div>
                    ${cleanPhone}
                </a>
                
                <a href="${addressStr !== 'Chưa có địa chỉ' ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressStr) : '#'}" target="_blank" style="display: flex; align-items: flex-start; gap: 10px; color: #2980b9; text-decoration: none; font-size: 0.9rem; line-height: 1.4;">
                    <div style="background:#ebf5fb; padding:6px; border-radius:50%; width:26px; height:26px; display:flex; justify-content:center; align-items:center; flex-shrink:0; margin-top: -2px;"><i class="fas fa-map-marker-alt"></i></div>
                    ${addressStr}
                </a>
            </div>

            <div style="font-size:0.8rem; color:#64748b; margin-bottom:10px; display: flex; gap: 15px;">
                <span><i class="far fa-clock"></i> ${dateStr}</span>
                <span><i class="fas fa-box"></i> ${o.kenh_ban.replace(/_/g, ' ')}</span>
            </div>
            
            <div class="order-details" style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.85rem; color: #856404; margin-bottom: 10px; border-left: 3px solid #ffeeba;">
                ${o.chi_tiet}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
                <div class="order-total" style="font-size: 1.1rem; color: #e74c3c; font-weight: bold;">${parseInt(o.tong_tien || 0).toLocaleString('vi-VN')} đ</div>
                
                <div style="display: flex; gap: 8px;">
                    <button onclick="copyOrderToZalo('${o.ma_don}')" style="background: #e8f4fd; border: 1px solid #3498db; color: #3498db; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
                        <i class="far fa-copy"></i> Copy
                    </button>
                    <button onclick='openEditView(${JSON.stringify(o).replace(/'/g, "&apos;")})' style="background: none; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
                        <i class="fas fa-pencil-alt"></i> Sửa
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 2. MỞ GIAO DIỆN SỬA ĐƠN VÀ ĐỔ DỮ LIỆU SĐT/ĐỊA CHỈ
window.openEditView = function(orderObj) {
    currentEditingOrder = orderObj;
    document.getElementById('orderListView').style.display = 'none';
    document.getElementById('editOrderView').style.display = 'block';
    
    document.getElementById('editOrderId').innerText = orderObj.ma_don;
    document.getElementById('editShopName').innerText = orderObj.ten_quan;
    
    // Gán dữ liệu SĐT, địa chỉ cũ vào input
    document.getElementById('editPhone').value = orderObj.sdt ? orderObj.sdt.replace(/'/g, '') : '';
    document.getElementById('editAddress').value = orderObj.dia_chi || '';
    
    orderState.channel = orderObj.kenh_ban || "ban_le";
    
    try {
        orderState.items = JSON.parse(orderObj.cart_json || "{}");
    } catch(e) { orderState.items = {}; }
    
    window.currentSearchTerm = 'VIEW_CART_ONLY'; 
    renderEditProducts();
}

function closeEditView() {
    document.getElementById('editOrderView').style.display = 'none';
    document.getElementById('orderListView').style.display = 'block';
    currentEditingOrder = null;
}

// 3. LOGIC HIỂN THỊ VÀ TÍNH TOÁN SẢN PHẨM
window.filterEditProducts = function() {
    window.currentSearchTerm = document.getElementById('search-product').value.toLowerCase();
    renderEditProducts();
};

window.setEditFilter = function(term) {
    document.getElementById('search-product').value = term;
    window.currentSearchTerm = term.toLowerCase();
    renderEditProducts();
};

window.showEditSelectedOnly = function() {
    document.getElementById('search-product').value = "";
    window.currentSearchTerm = 'VIEW_CART_ONLY'; 
    renderEditProducts();
};

window.updateEditOrderQty = function(id, change) {
    if (!orderState.items[id]) orderState.items[id] = 0;
    orderState.items[id] += change;
    if (orderState.items[id] < 0) orderState.items[id] = 0;
    renderEditProducts();
};

window.manualEditUpdateQty = function(id, value) {
    let val = parseInt(value);
    if (isNaN(val) || val < 0) val = 0; 
    orderState.items[id] = val;
    renderEditProducts();
};

function renderEditProducts() {
    const listEl = document.getElementById('edit-product-list');
    listEl.innerHTML = '';
    
    let filteredProducts = [];
    if (window.currentSearchTerm === 'VIEW_CART_ONLY') {
        filteredProducts = productData.products.filter(prod => (orderState.items[prod.id] || 0) > 0);
    } else {
        filteredProducts = productData.products.filter(prod => {
            const searchStr = `${prod.name} ${prod.weight} ${prod.id}`.toLowerCase();
            return searchStr.includes(window.currentSearchTerm);
        });
    }

    filteredProducts.forEach(prod => {
        const currentPrice = prod.prices[orderState.channel];
        const qty = orderState.items[prod.id] || 0;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';
        if(qty > 0) itemDiv.style.background = "#fff3cd"; 
        
        itemDiv.innerHTML = `
            <div class="product-info">
                <div><span class="product-name">${prod.name}</span> <span class="product-weight">${prod.weight}</span></div>
                <span class="product-price">${currentPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="qty-controls">
    <button class="qty-btn" onclick="updateEditOrderQty('${prod.id}', -1)"><i class="fas fa-minus"></i></button>
    
    <input type="number" inputmode="numeric" class="qty-input" value="${qty}" 
           onfocus="this.select()" 
           oninput="this.value = this.value.replace(/[^0-9]/g, '');" 
           onchange="manualEditUpdateQty('${prod.id}', this.value)">
           
    <button class="qty-btn" onclick="updateEditOrderQty('${prod.id}', 1)"><i class="fas fa-plus"></i></button>
</div>
        `;
        listEl.appendChild(itemDiv);
    });
    calculateEditTotal();
}

function calculateEditTotal() {
    let total = 0;
    currentEditingOrder.new_chi_tiet = [];
    
    productData.products.forEach(prod => {
        const qty = orderState.items[prod.id] || 0;
        if (qty > 0) {
            total += (prod.prices[orderState.channel] * qty);
            currentEditingOrder.new_chi_tiet.push(`${prod.name} (${prod.weight}) x${qty}`);
        }
    });

    currentEditingOrder.new_tong_tien_so = total;
    let textChiTiet = currentEditingOrder.new_chi_tiet.join(', ');
    if(textChiTiet !== "") textChiTiet += ` => Tổng tiền: ${total.toLocaleString('vi-VN')} đ`;
    currentEditingOrder.new_chi_tiet_str = textChiTiet;

    document.getElementById('edit-total-price').innerText = total.toLocaleString('vi-VN') + ' đ';
}

// 4. LƯU THAY ĐỔI LÊN SERVER (GỬI THÊM SDT VÀ ĐỊA CHỈ)
window.saveUpdatedOrder = async function() {
    if (currentEditingOrder.new_tong_tien_so === 0) {
        alert("Đơn hàng không thể trống!"); return;
    }

    const btn = document.getElementById('btnUpdateOrder');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

    // Lấy giá trị SĐT và Địa chỉ mới
    const newPhone = document.getElementById('editPhone').value.trim();
    const newAddress = document.getElementById('editAddress').value.trim();

    const payload = {
        action: "updateOrder",
        ma_don: currentEditingOrder.ma_don,
        sdt: newPhone,          // Gửi SĐT cập nhật
        dia_chi: newAddress,    // Gửi Địa chỉ cập nhật
        chi_tiet_don: currentEditingOrder.new_chi_tiet_str,
        tong_tien_so: currentEditingOrder.new_tong_tien_so,
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
            alert("✅ Đã cập nhật đơn hàng thành công!");
            closeEditView();
            document.getElementById('loadingText').style.display = 'block';
            fetchOrders(); 
        } else {
            alert("❌ Lỗi: " + data.msg);
        }
    } catch (err) {
        alert("❌ Lỗi kết nối máy chủ!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> LƯU THAY ĐỔI';
    }
}

// ==========================================
// 5. GỬI YÊU CẦU SỬA/XOÁ ĐƠN CHO IT
// ==========================================
window.sendITRequest = async function(loaiYeuCau) {
    // Đóng menu nếu đang mở
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('open');

    // Hỏi mã đơn
    const orderId = prompt(`Nhập MÃ ĐƠN HÀNG bạn muốn ${loaiYeuCau.includes('SỬA') ? 'SỬA' : 'XOÁ'}:`);
    if (!orderId || orderId.trim() === "") return;

    // Hỏi lý do
    const reason = prompt(`Nhập LÝ DO chi tiết (VD: Khách đổi món, Đặt trùng đơn...):`);
    if (!reason || reason.trim() === "") {
        alert("Bạn phải nhập lý do thì IT mới có thể xử lý được!");
        return;
    }

    try {
        // Gửi dữ liệu về Google Sheet
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: "sendITRequest", 
                id_sales: userId,
                nguoi_gui: userName,
                loai_yeu_cau: loaiYeuCau,
                ma_don: orderId.trim(),
                ly_do: reason.trim()
            }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Đã gửi ${loaiYeuCau} thành công!\n\nBộ phận IT sẽ kiểm tra mã đơn ${orderId} và liên hệ lại với bạn sớm nhất.`);
        } else {
            alert("❌ Lỗi từ máy chủ: " + result.msg);
        }
    } catch (err) {
        alert("❌ Lỗi kết nối mạng, vui lòng thử lại sau!");
    }
}