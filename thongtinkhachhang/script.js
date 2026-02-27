const app = {
    totalSteps: 4,
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

// --- XỬ LÝ GỬI FORM (Đã fix lỗi gửi dữ liệu) ---
document.getElementById('saleForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

    // Thay URL của bạn vào đây
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwlWkIZWvJlu6iETWWiC4eStWWoH05ZWvVam3FlH4M-KfqKhd-HYrfihH7D6oTtgEHo/exec'; 
    
    // Đóng gói dữ liệu thành Object
    const formData = new FormData(this);
    const dataObj = Object.fromEntries(formData.entries());
    
    // Thêm các key cần thiết cho Backend xử lý
    dataObj.action = "saveData";
    dataObj.nguoi_gui = localStorage.getItem('sh_user_name');
    dataObj.id_sales = localStorage.getItem('sh_user_id');

    fetch(scriptURL, { 
        method: 'POST', 
        // Bắt buộc gửi dạng stringify và Header text/plain để tránh lỗi CORS
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