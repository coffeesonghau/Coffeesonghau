// js/data.js

// Khai báo biến toàn cục để các file khác đều gọi được
window.dbProducts = [
    // --- CÀ PHÊ RANG XAY ---
    { 
        id: 1, 
        name: "Cà Phê Gu Mạnh Mẽ 2", 
        price: 300000,
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
        id: 4, 
        name: "Sông Hậu Premium", 
        price: 2, 
        category: ["cao-cap", "rang-xay"], 
        img: "img/spm.jpg",
        gallery: [
            "img/chuacosanpham.png",  
        ],
        info: {
            description: "Dòng sản phẩm cao cấp đánh dấu sự trở lại với diện mạo và định hướng hoàn toàn mới của công ty. Giữ trọn hương vị mộc nguyên bản, chuẩn vị tự nhiên và tinh tuyển ở phân khúc cao cấp nhất – Sông Hậu Premium.",
            details: `
                <p class="mb-2">- <strong>Thông tin:</strong> Tham khảo.</p>
            `
        }
    },

    {
        id: 5, 
        name: "Gu Truyền Thống - 2026", 
        price: 2, 
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