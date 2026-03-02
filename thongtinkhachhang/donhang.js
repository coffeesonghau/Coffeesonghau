const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec"; // Thay đúng link script giống bên login.js
const userId = localStorage.getItem('sh_user_id');

let currentEditingOrder = null;
const orderState = { channel: "ban_le", items: {} };
window.currentSearchTerm = '';

document.addEventListener("DOMContentLoaded", () => {
    if (!userId) { window.location.href = 'login.html'; return; }
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
            renderOrderList(result.orders);
        } else {
            document.getElementById('orderListContainer').innerHTML = "<p style='text-align:center;'>Chưa có đơn hàng nào.</p>";
        }
    } catch (err) {
        document.getElementById('loadingText').innerHTML = "❌ Lỗi tải dữ liệu. Vui lòng thử lại.";
    }
}

function renderOrderList(orders) {
    const container = document.getElementById('orderListContainer');
    container.innerHTML = '';
    orders.forEach(o => {
        // Parse ngày cho đẹp
        const dateObj = new Date(o.thoi_gian);
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth()+1} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <span class="order-id"><i class="fas fa-hashtag"></i> ${o.ma_don}</span>
                <span class="order-status">${o.trang_thai}</span>
            </div>
            <div class="order-shop">${o.ten_quan}</div>
            <div style="font-size:0.75rem; color:#a0aec0; margin-bottom:8px;">📅 ${dateStr} - 📦 Kênh: ${o.kenh_ban}</div>
            <div class="order-details">${o.chi_tiet}</div>
            <div class="order-total">${parseInt(o.tong_tien || 0).toLocaleString('vi-VN')} đ</div>
            <button class="btn-edit-order" onclick='openEditView(${JSON.stringify(o)})'>
                <i class="fas fa-pencil-alt"></i> Sửa Đơn Hàng
            </button>
        `;
        container.appendChild(card);
    });
}

// 2. MỞ GIAO DIỆN SỬA ĐƠN
window.openEditView = function(orderObj) {
    currentEditingOrder = orderObj;
    document.getElementById('orderListView').style.display = 'none';
    document.getElementById('editOrderView').style.display = 'block';
    
    document.getElementById('editOrderId').innerText = orderObj.ma_don;
    document.getElementById('editShopName').innerText = orderObj.ten_quan;
    
    orderState.channel = orderObj.kenh_ban || "ban_le";
    
    // Phục hồi giỏ hàng từ JSON lưu trên Google Sheet
    try {
        orderState.items = JSON.parse(orderObj.cart_json || "{}");
    } catch(e) { orderState.items = {}; }
    
    window.currentSearchTerm = 'VIEW_CART_ONLY'; // Hiển thị sẵn các món đã chọn
    renderEditProducts();
}

function closeEditView() {
    document.getElementById('editOrderView').style.display = 'none';
    document.getElementById('orderListView').style.display = 'block';
    currentEditingOrder = null;
}

// 3. LOGIC HIỂN THỊ VÀ TÍNH TOÁN SẢN PHẨM (Tương tự trang index)
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
                <input type="number" inputmode="numeric" class="qty-input" value="${qty}" onfocus="this.select()" onchange="manualEditUpdateQty('${prod.id}', this.value)">
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

// 4. LƯU THAY ĐỔI LÊN SERVER
window.saveUpdatedOrder = async function() {
    if (currentEditingOrder.new_tong_tien_so === 0) {
        alert("Đơn hàng không thể trống!"); return;
    }

    const btn = document.getElementById('btnUpdateOrder');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

    const payload = {
        action: "updateOrder",
        ma_don: currentEditingOrder.ma_don,
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
            fetchOrders(); // Tải lại danh sách
        } else {
            alert("❌ Lỗi: " + data.msg);
        }
    } catch (err) {
        alert("❌ Lỗi kết nối máy chủ!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'LƯU THAY ĐỔI';
    }
}