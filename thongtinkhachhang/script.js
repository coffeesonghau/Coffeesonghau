const app = {
    // Chuyển đổi giữa các bước
    nextStep: (stepNumber) => {
        // Ẩn tất cả các bước
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelectorAll('.step').forEach(dot => dot.classList.remove('active'));
        
        // Hiện bước được chọn
        document.getElementById(`step${stepNumber}`).classList.add('active');
        document.getElementById(`step${stepNumber}-dot`).classList.add('active');
        
        // Cuộn lên đầu trang form
        window.scrollTo(0, 0);
    },

    // Lấy tọa độ thực tế
    getLocation: () => {
        const btn = document.querySelector('.btn-gps');
        if (navigator.geolocation) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy vị trí...';
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    document.getElementById('dia_chi').value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                    btn.innerHTML = '<i class="fas fa-check"></i> Đã lấy vị trí';
                    btn.style.background = "#c8e6c9";
                },
                () => { alert("Không thể lấy vị trí. Vui lòng cấp quyền GPS."); btn.innerText = "Thử lại"; }
            );
        }
    },

    // Khởi tạo tính năng lưu bản nháp (Auto-save)
    initAutoSave: () => {
        const form = document.getElementById('saleForm');
        // Load lại dữ liệu cũ nếu có
        const savedData = localStorage.getItem('draft_customer');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                if (form[key]) form[key].value = data[key];
            });
        }
        // Lưu mỗi khi có thay đổi
        form.addEventListener('input', () => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem('draft_customer', JSON.stringify(data));
        });
    }
};

// Xử lý khi nhấn nút gửi cuối cùng
document.getElementById('saleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const finalData = Object.fromEntries(formData.entries());
    
    console.log("Dữ liệu gửi về coffeesonghau.com:", finalData);
    
    alert("🎉 Tuyệt vời! Thông tin quán " + finalData.ten_quan + " đã được đồng bộ hệ thống.");
    
    // Sau khi gửi thành công thì xóa bản nháp
    localStorage.removeItem('draft_customer');
    this.reset();
    app.nextStep(1);
});

// Chạy khởi tạo
app.initAutoSave();