// js/data.js

// Khai báo biến toàn cục để các file khác đều gọi được
window.dbProducts = [
    // --- CÀ PHÊ RANG XAY ---
    {
        id: 1, 
        name: "Sông Hậu Premium", 
        price: 2, 
        unit: "Gói", // Thêm đơn vị
        category: ["cao-cap", "rang-xay"], 
        img: "img/SHpremium1.webp",
        gallery: [
            "img/SHpremiumMT.webp", 
            "img/SHpremiumMS.webp", 
        ],
        info: {
            description: "Dòng sản phẩm Cao Cấp đánh dấu sự trở lại với diện mạo và tầm vóc mới, Sông Hậu Premium giữ trọn hương vị mộc nguyên bản, tinh tuyển từ những gì tự nhiên nhất và định hướng hoàn toàn mới phân khúc cao cấp nhất – Sông Hậu Premium.",
            highlights: [
                "100% Nguyên chất thượng hạng",
                "Rang xay thủ công",
                "Đóng gói hộp quà sang trọng",
                "Hương vị mộc bản tự nhiên"
            ],
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Đang Cập Nhật...</p>
            `
        }
    },

    {
        id: 2, 
        name: "Cà Phê Truyền Thống 1 (250g)", 
        price: 60000, 
        unit: "Gói", // Thêm đơn vị
        category: "rang-xay",
        img: "img/SHtruyenthong2026.webp",
        gallery: [
            "img/SHtruyenthong2026MT.webp",
            "img/SHtruyenthong2026MS.webp"  
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

    { 
        id: 4, 
        name: "SH Gu Mạnh Mẽ 2", 
        price: 180000,
        unit: "Kg", // Thêm đơn vị
        category: ["rang-xay", "best-seller"],
        img: "img/cafemm21.jpg",
        gallery: [
            "img/cafemm21.jpg", 
            "img/cafemm22.jpg", 
        ],
        info: {
            description: "Dòng sản phẩm Mạnh Mẽ 2 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica, Robusta, Culi. (vị nguyên bản từ cafe hạt)",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Arabica - Culi.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Mộc nguyên chất vị đậm</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 2, 
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

    {
        id: 5, 
        name: "Gu Truyền Thống - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/chuacosanpham.png",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "Dòng sản phẩm Gu Truyền Thống phiên bản 2026 đánh dấu sự trở lại với diện mạo và định hướng hoàn toàn mới của công ty.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
            `
        }
    },

    {
        id: 6, 
        name: "Gu Cận Đại - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/chuacosanpham.png",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "Dòng sản phẩm Gu Cận Đại phiên bản 2026 đánh dấu sự trở lại với diện mạo và định hướng hoàn toàn mới của công ty.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
            `
        }
    },

    {
        id: 7, 
        name: "Gu Mạnh Mẽ - 2026", 
        price: 2, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/chuacosanpham.png",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "Dòng sản phẩm Gu Mạnh Mẽ phiên bản 2026 đánh dấu sự trở lại với diện mạo và định hướng hoàn toàn mới của công ty.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Chưa có thông tin sản phẩm</p>
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