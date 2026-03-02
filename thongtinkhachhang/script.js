const app = {
    totalSteps: 3, // Đã giảm từ 4 xuống 3
    storageKey: 'songhau_coffee_draft',

    init: function() {
        // --- BƯỚC 1: CHỐNG VÀO LẬU ---
        const isLoggedIn = localStorage.getItem('sh_is_logged_in');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }

        // --- BƯỚC 2: HIỂN THỊ TÊN NGƯỜI DÙNG ---
        const userName = localStorage.getItem('sh_user_name');
        const displayEl = document.getElementById('currentUserName');
        if (displayEl) {
            displayEl.innerText = userName || "Thành viên";
        }

        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('ngay_goi_lai');
        if (dateInput) dateInput.value = today;
        
        // --- BƯỚC 3: CẢNH BÁO MẤT MẠNG ---
        window.addEventListener('online', () => this.updateNetworkStatus(true));
        window.addEventListener('offline', () => this.updateNetworkStatus(false));
        this.updateNetworkStatus(navigator.onLine);

        this.loadDraft();
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('change', () => this.saveDraft());
        });
    },

    logout: function() {
        if(confirm("Bạn muốn đăng xuất?")) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    },

    updateNetworkStatus: function(isOnline) {
        const header = document.querySelector('header');
        const logo = document.querySelector('.logo');
        if (!isOnline) {
            header.style.backgroundColor = '#e74c3c'; // Màu đỏ cảnh báo
            logo.innerHTML = '<i class="fas fa-wifi-slash"></i> MẤT KẾT NỐI';
        } else {
            header.style.backgroundColor = 'var(--primary-color)';
            logo.innerText = 'SÔNG HẬU COFFEE';
        }
    },

    clearDraft: function() {
        if (confirm("⚠️ Bạn có chắc muốn xóa sạch bản nháp hiện tại để nhập khách mới?")) {
            localStorage.removeItem(this.storageKey);
            document.getElementById('saleForm').reset();
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('ngay_goi_lai');
            if (dateInput) dateInput.value = today;
            
            // Xoá giỏ hàng hiện tại
            orderState.items = {};
            renderProducts();
        }
    },

    capitalizeFirstLetter: function(el) {
        el.value = el.value.replace(/\b\w/g, l => l.toUpperCase());
    },

    formatCurrency: function(el) {
        let val = el.value.replace(/\D/g, "");
        if (val) {
            el.value = parseInt(val).toLocaleString('vi-VN');
        }
    },

    saveDraft: function() {
        const form = document.getElementById('saleForm');
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
    },

    loadDraft: function() {
        const draft = localStorage.getItem(this.storageKey);
        if (draft) {
            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input && data[key]) input.value = data[key];
            });
        }
    },

    nextStep: function(step) {
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        const targetStep = document.getElementById(`step${step}`);
        if (targetStep) targetStep.classList.add('active');

        const progress = ((step - 1) / (this.totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    validateAndNext: function(currentStep, nextStepNum) {
        const currentSection = document.getElementById(`step${currentStep}`);
        const requiredElements = currentSection.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredElements.forEach(el => {
            if (!el.checkValidity()) {
                el.classList.add('is-invalid');
                isValid = false;
            } else {
                el.classList.remove('is-invalid');
            }
        });

        if (isValid) {
            this.nextStep(nextStepNum);
        } else {
            const firstError = currentSection.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
                alert("Vui lòng điền đầy đủ các ô bắt buộc (*)");
            }
        }
    },

    getLocation: function() {
        const addressInput = document.getElementById('dia_chi');
        const gpsBtn = document.querySelector('.btn-gps i');
        if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ GPS");

        gpsBtn.className = "fas fa-circle-notch fa-spin";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = `[${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}]`;
                addressInput.value = addressInput.value.trim() ? `${addressInput.value.trim()} ${coords}` : coords;
                gpsBtn.className = "fas fa-check";
                this.saveDraft();
                setTimeout(() => gpsBtn.className = "fas fa-location-arrow", 2000);
            },
            () => {
                alert("Không thể lấy vị trí. Vui lòng bật định vị (Location) trên điện thoại!");
                gpsBtn.className = "fas fa-location-arrow";
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }
};

app.init();

// --- XỬ LÝ GỬI FORM ---
document.getElementById('saleForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Chặn gửi nếu đang mất mạng
    if (!navigator.onLine) {
        alert("⚠️ Bạn đang mất kết nối mạng. Vui lòng kiểm tra lại 3G/Wi-Fi trước khi gửi!");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

    const scriptURL = 'https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec'; 
    
    const formData = new FormData(this);
    const dataObj = Object.fromEntries(formData.entries());
    
    dataObj.action = "saveData";
    dataObj.nguoi_gui = localStorage.getItem('sh_user_name');
    dataObj.id_sales = localStorage.getItem('sh_user_id');

    fetch(scriptURL, { 
        method: 'POST', 
        body: JSON.stringify(dataObj),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(response => response.json())
    .then(result => {
        if(result.success) {
            alert('✅ THÀNH CÔNG! Dữ liệu đã được lưu.');
            localStorage.removeItem(app.storageKey); 
            location.reload();
        } else {
            throw new Error("Lỗi từ máy chủ");
        }
    })
    .catch(error => {
        alert('❌ LỖI GỬI DỮ LIỆU! Kiểm tra lại kết nối mạng.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'HOÀN TẤT & LƯU';
    });
});

// ==========================================
// LOGIC XỬ LÝ ĐƠN HÀNG SẢN PHẨM & TÍNH GIÁ
// ==========================================
const orderState = {
    channel: "ban_le", // Mặc định kênh
    items: {}          // Lưu số lượng: { "tt1_500": 2 }
};

function formatCurrencyVND(num) {
    return num.toLocaleString('vi-VN') + ' đ';
}

// --- LOGIC TÌM KIẾM & LỌC SẢN PHẨM ---
window.currentSearchTerm = '';

window.filterProducts = function() {
    window.currentSearchTerm = document.getElementById('search-product').value.toLowerCase();
    renderProducts();
};

window.setFilter = function(term) {
    document.getElementById('search-product').value = term;
    window.currentSearchTerm = term.toLowerCase();
    renderProducts();
};

// --- MỚI: LỌC CHỈ NHỮNG MÓN ĐÃ CHỌN ---
window.showSelectedOnly = function() {
    document.getElementById('search-product').value = "";
    window.currentSearchTerm = 'VIEW_CART_ONLY'; 
    renderProducts();
};

// --- MỚI: XỬ LÝ KHI GÕ SỐ TRỰC TIẾP ---
window.manualUpdateQty = function(id, value) {
    let val = parseInt(value);
    if (isNaN(val) || val < 0) val = 0; // Chống nhập bậy chữ cái hoặc số âm
    orderState.items[id] = val;
    renderProducts();
    app.saveDraft();
};

function renderProducts() {
    const listEl = document.getElementById('product-list');
    if (!listEl || typeof productData === 'undefined') return;

    listEl.innerHTML = '';
    
    // --- CẢI TIẾN LOGIC LỌC ---
    let filteredProducts = [];
    if (window.currentSearchTerm === 'VIEW_CART_ONLY') {
        // Chỉ lấy những món có số lượng > 0
        filteredProducts = productData.products.filter(prod => (orderState.items[prod.id] || 0) > 0);
    } else {
        // Lọc bình thường theo text
        filteredProducts = productData.products.filter(prod => {
            const searchStr = `${prod.name} ${prod.weight} ${prod.id}`.toLowerCase();
            return searchStr.includes(window.currentSearchTerm);
        });
    }

    // Hiển thị thông báo nếu giỏ hàng trống khi bấm "Đã chọn"
    if (filteredProducts.length === 0 && window.currentSearchTerm === 'VIEW_CART_ONLY') {
        listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-sub); font-size: 0.9rem;">Chưa chọn sản phẩm nào</div>';
    }

    filteredProducts.forEach(prod => {
        const currentPrice = prod.prices[orderState.channel];
        const qty = orderState.items[prod.id] || 0;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';
        
        // Highlight món đã chọn
        if(qty > 0) itemDiv.style.background = "#fff3cd"; 
        
        // --- CẢI TIẾN Ô INPUT: Bỏ readonly, thêm inputmode="numeric" và onfocus="this.select()" ---
        itemDiv.innerHTML = `
            <div class="product-info">
                <div>
                    <span class="product-name">${prod.name}</span>
                    <span class="product-weight">${prod.weight}</span>
                </div>
                <span class="product-price">${formatCurrencyVND(currentPrice)} / gói</span>
            </div>
            <div class="qty-controls">
                <button type="button" class="qty-btn" onclick="updateOrderQty('${prod.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" inputmode="numeric" class="qty-input" value="${qty}" 
                       onfocus="this.select()" 
                       onchange="manualUpdateQty('${prod.id}', this.value)">
                <button type="button" class="qty-btn" onclick="updateOrderQty('${prod.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        listEl.appendChild(itemDiv);
    });

    calculateTotal();
}

// Cập nhật số lượng khi bấm + / -
window.updateOrderQty = function(id, change) {
    if (!orderState.items[id]) orderState.items[id] = 0;
    orderState.items[id] += change;
    
    if (orderState.items[id] < 0) orderState.items[id] = 0;
    
    renderProducts();
    app.saveDraft(); // Tự động lưu nháp
};

// Tính tổng tiền & cập nhật string chi tiết đơn hàng
function calculateTotal() {
    const totalEl = document.getElementById('total-price');
    const hiddenInput = document.getElementById('chi_tiet_don');
    if (!totalEl) return;

    let total = 0;
    let orderDetailsList = [];
    
    // Phải lặp qua toàn bộ mảng gốc (productData.products) để cộng tiền cả những món đang bị ẩn bởi bộ lọc
    productData.products.forEach(prod => {
        const qty = orderState.items[prod.id] || 0;
        if (qty > 0) {
            const price = prod.prices[orderState.channel];
            total += (price * qty);
            orderDetailsList.push(`${prod.name} (${prod.weight}) x${qty}`);
        }
    });

    totalEl.innerText = formatCurrencyVND(total);
    
    // Lưu vào input ẩn để gửi lên Google Sheet
    if(hiddenInput) {
        if(orderDetailsList.length > 0) {
            hiddenInput.value = orderDetailsList.join(', ') + ` => Tổng tiền: ${formatCurrencyVND(total)}`;
        } else {
            hiddenInput.value = "";
        }
        // Gọi sự kiện để kích hoạt saveDraft
        hiddenInput.dispatchEvent(new Event('change'));
    }
}

// Khởi tạo Event Listener cho thay đổi Kênh Bán
document.addEventListener("DOMContentLoaded", () => {
    const channelSelect = document.getElementById('channel-select');
    if (channelSelect) {
        channelSelect.addEventListener('change', (e) => {
            orderState.channel = e.target.value;
            renderProducts();
            app.saveDraft();
        });
    }
    
    // Đợi 1 chút để app.loadDraft() kịp fill dữ liệu rồi mới render
    setTimeout(() => {
        if (channelSelect && channelSelect.value) {
            orderState.channel = channelSelect.value;
        }
        renderProducts();
    }, 200);
});