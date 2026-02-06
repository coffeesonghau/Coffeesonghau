// js/data.js

// Khai báo biến toàn cục để các file khác đều gọi được
window.dbProducts = [
    // --- CÀ PHÊ RANG XAY ---
    {
        id: 1, 
        name: "Sông Hậu Premium", 
        price: 2, 
        unit: "", // Thêm đơn vị
        category: ["cao-cap", "rang-xay"], 
        img: "img/SHpremium1.webp",
        gallery: [
            "img/SHpremiumMT.webp", 
            "img/SHpremiumMS.webp", 
        ],
        info: {
            description: "Dòng sản phẩm Cao Cấp đánh dấu sự trở lại của Sông Hậu với diện mạo và tầm vóc hoàn toàn mới. Sông Hậu Premium giữ trọn hương vị mộc nguyên bản, được tinh tuyển khắt khe từ những tinh hoa tự nhiên nhất, đồng thời mở ra định hướng mới cho phân khúc cao cấp bậc nhất. SH Premium là tuyệt phẩm của sự chọn lọc và chế tác công phu, nơi từng nguyên liệu được nâng niu để đạt đến độ tinh tế và chiều sâu phức hợp trong từng tầng hương, mang đến trải nghiệm đẳng cấp và khác biệt.",
            highlights: [
                "100% Nguyên chất thượng hạng",
                "100% hạt chín mọng, rang xay thủ công tỉ mỉ",
                "Đóng gói hộp quà sang trọng",
                "Giữ trọn vị Mộc nguyên bản và tầng hương tinh tế."
            ],
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Đang Cập Nhật...</p>
            `
        }
    },
    
    {
        id: 2, 
        name: "SH Truyền Thống 1 (250g)", 
        price: 60000, 
        unit: "Gói", // Thêm đơn vị
        category: "rang-xay", 
        img: "img/SHTruyenthong2026.webp",
        gallery: [
            "img/SHTruyenthong12026MT.webp",
            "img/SHtruyenthong2026MS.webp",
              
        ],
        info: {
            description: "Sông Hậu Truyền Thống 1 là phiên bản nâng cấp từ dòng truyền thống cũ, mang đến sự cân bằng tinh tế trong từng giọt cà phê. Với công thức phối trộn bí mật giữa Arabica thơm dịu và Robusta Culi đậm đà, sản phẩm giữ trọn vị mạnh mẽ đúng gu phin Việt nhưng hậu vị êm ái hơn. dòng sản phẩm Tiêu chuẩn (Standard), Truyền Thống 1 đề cao sự mộc mạc, giản dị và tính thực tế. Đây là giải pháp tối ưu cho nhu cầu thưởng thức hàng ngày tại gia đình hay văn phòng: ít cầu kỳ về hình thức, tập trung toàn bộ vào chất lượng hạt để đánh thức sự tỉnh táo trong bạn với mức chi phí hợp lý nhất.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Arabica - Culi.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Mộc nguyên chất vị đậm</p>
                <p class="mb-2">- <strong>Phiên bản:</strong> Nâng cấp điều chỉnh từ Truyền Thống 2 2010</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 3, 
        name: "SH Truyền Thống 2 (250g)", 
        price: 60000, 
        unit: "Gói", // Thêm đơn vị
        category: "rang-xay",
        img: "img/SHTruyenthong2026.webp",
        gallery: [
            "img/SHtruyenthong2026MT.webp",
            "img/SHtruyenthong2026MS.webp"  
        ],
        info: {
            description: "Dòng sản phẩm Sông Hậu Truyền thống 2 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica và Robusta culi, chúng tôi tạo ra một hương vị đậm đà, mạnh mẽ, đúng chất 'gu' phin Việt Nam. Đây là dòng sản phẩm tiêu chuẩn (Standard) dành cho nhu cầu thưởng thức hàng ngày. Nếu như SH Premium là tuyệt phẩm được tinh tuyển khắt khe để đạt đến độ tinh tế và phức tạp trong từng tầng hương, thì Truyền thống 2 mang nét mộc mạc, giản dị và gần gũi hơn. Một lựa chọn kinh tế, ít cầu kỳ, nhưng vẫn đủ 'đậm' và 'chất' để đánh thức sự tỉnh táo trong bạn mỗi sáng.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Arabica - Culi.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Mộc nguyên chất vị đậm</p>
                <p class="mb-2">- <strong>Phiên bản:</strong> Nâng cấp điều chỉnh từ Truyền Thống 1 2026</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 4, 
        name: "SH Mạnh Mẽ 1 - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/chuacosanpham.png",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "SH Mạnh Mẽ 1 phiên bản 2026.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
            `
        }
    },

    {
        id: 5, 
        name: "SH Mạnh Mẽ 2 - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/chuacosanpham.png",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "SH Mạnh Mẽ 2 phiên bản 2026.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
            `
        }
    },

    {
        id: 6, 
        name: "SH Cận Đại - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/SHcandai2026.webp",
        gallery: [
            "img/SHcandai2026MT.webp",
            "img/SHcandai2026MS.webp",  
        ],
        info: {
            description: "Dòng sản phẩm Gu Cận Đại phiên bản 2026 đánh dấu sự trở lại với diện mạo và định hướng hoàn toàn mới của công ty.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
            `
        }
    },

    {
        id: 99, 
        name: "Cà Phê Hạt", 
        price: 300000, 
        unit: "Kg", // Thêm đơn vị
        category: "cafe-hat", 
        img: "img/hatcaphe2.webp",
        gallery: [
            "img/hatcaphe2.webp",  
        ],
        info: {
            description: "Dòng sản phẩm Mạnh Mẽ 2 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica và Robusta.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Arabica - Culi.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Mộc nguyên chất vị đậm</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },
    
    { id: 8, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 9, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 10, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 11, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 12, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 13, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },   

    // --- CODE MẪU ---

    { 
        id: 97, 
        name: "Máy Pha Cà Phê Công Nghiệp", 
        price: 0, // Ví dụ giá 15 triệu
        unit: "Cái", // Thêm đơn vị
        category: "may-pha", // Đã sửa category
        
        // Ảnh demo máy pha (thay vì ảnh hạt cafe)
        img: "https://images.unsplash.com/photo-1520978396595-64d08d9e7664?w=500",
        
        gallery: [
            "https://images.unsplash.com/photo-1520978396595-64d08d9e7664?w=500", 
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500", 
            "https://images.unsplash.com/photo-1517080315801-795b5420320a?w=500"
        ],
        
        info: {
            // Sửa lại mô tả cho đúng tính chất máy móc
            description: "Dòng máy pha công suất lớn, chuyên dụng cho quán cafe vừa và lớn. Tốc độ chiết xuất ổn định.",
            details: `
                <p class="mb-2">- <strong>Công suất:</strong> 3000W - Đun nóng nhanh.</p>
                <p class="mb-2">- <strong>Dung tích nồi hơi:</strong> 11 Lít.</p>
                <p class="mb-2">- <strong>Chất liệu:</strong> Thép không gỉ cao cấp.</p>
                <p>- <strong>Bảo hành:</strong> 24 tháng chính hãng.</p>
            `
        }
    }
];