// js/data.js

// Khai báo biến toàn cục để các file khác đều gọi được
window.dbProducts = [
    // --- CÀ PHÊ RANG XAY ---
    { 
        id: 1, 
        name: "Cà Phê Rang Mộc (Sản phẩm mẫu)", 
        price: 260000, 
        category: "rang-xay", 
        img: "img/2.jpg",
        gallery: [
            "img/2.jpg", 
            "imgsp/01/img2.png", 
            "imgsp/01/img3.png", 
            "imgsp/01/img4.png"
        ],
        info: {
            description: "Dòng sản phẩm No.1 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica và Robusta.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> 70% Robusta - 30% Arabica.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Socola đen, hạt dẻ, hậu vị ngọt sâu.</p>
                <p>- <strong>Hạn sử dụng:</strong> 12 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    { 
        id: 2, 
        name: "Cà Phê Gu Mạnh Mẽ 2", 
        price: 250000, 
        category: "rang-xay", 
        img: "imgsp/cafemm2.1.jpg",
        gallery: [
            "imgsp/cafemm2.1.jpg", 
            "imgsp/cafemm2.2.png", 
        ],
        info: {
            description: "Dòng sản phẩm Mạnh Mẽ 2 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica và Robusta.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> 70% Robusta - 30% Arabica.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Socola đen, hạt dẻ, hậu vị ngọt sâu.</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    { 
        id: 3, 
        name: "Cà Phê Hạt", 
        price: 250000, 
        category: "cafe-hat", 
        img: "imgsp/cafehat.jpg",
        gallery: [
            "imgsp/cafehat.jpg",  
        ],
        info: {
            description: "Dòng sản phẩm Mạnh Mẽ 2 là biểu tượng của sự cân bằng hoàn hảo. Với tỷ lệ phối trộn bí mật giữa Arabica và Robusta.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> 70% Robusta - 30% Arabica.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Socola đen, hạt dẻ, hậu vị ngọt sâu.</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    { id: 88, name: "Đang cập nhật sản phẩm", price: 1, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 3, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 4, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 5, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 9, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 10, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 11, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 12, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 13, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },
    { id: 16, name: "Đang cập nhật sản phẩm", price: 0, category: "rang-xay", img: "img/chuacosanpham.png" },

    // --- CÀ PHÊ HÒA TAN ---
    { 
        id: 6, 
        name: "Cà Phê Sữa 3in1 (Hộp)", 
        price: 0, 
        category: "best-seller", 
        img: "https://images.unsplash.com/photo-1572286258217-40142c1c6a70?w=500",
        info: {
            description: "Tiện lợi nhưng vẫn đậm đà bản sắc. Cà phê sữa 3in1 mang đến ly cà phê thơm béo chỉ trong 30 giây.",
            details: "<p>Hộp 18 gói x 17g. Thích hợp làm quà tặng hoặc sử dụng văn phòng.</p>"
        }
    },
    { id: 7, name: "Cà phê Đen Hòa Tan", price: 0, category: "best-seller", img: "https://images.unsplash.com/photo-1512568400610-64da2dca8545?w=500" },
    { id: 8, name: "Cappuccino Muối", price: 0, category: "best-seller", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500" },
    { id: 14, name: "Cà Phê Sữa Dừa", price: 0, category: "best-seller", img: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500" },
    { id: 15, name: "Trà Sữa Matcha Coffee", price: 0, category: "best-seller", img: "https://images.unsplash.com/photo-1536452329015-d736360344b4?w=500" },

    // --- MÁY PHA CÀ PHÊ DEMO KHÔNG ĐƯỢC THAY ĐỔI ---
    { 
        id: 20, 
        name: "Máy Pha Espresso Home", 
        price: 0, 
        category: "may-pha", 
        
        // 1. Ảnh đại diện (Hiện ở trang chủ/danh sách)
        img: "https://images.unsplash.com/photo-1517080315801-795b5420320a?w=500", 

        // 2. DANH SÁCH ẢNH THUMBNAIL (Hiện ở trang chi tiết)
        gallery: [
            "https://images.unsplash.com/photo-1517080315801-795b5420320a?w=500", // Ảnh 1 (Nên trùng ảnh đại diện)
            "https://images.unsplash.com/photo-1594493370355-6b2f76f7f5e3?w=500", // Ảnh 2 (Góc nghiêng)
            "https://images.unsplash.com/photo-1596541223402-23c267252033?w=500", // Ảnh 3 (Chi tiết)
            "https://images.unsplash.com/photo-1563853173-90d16d030999?w=500"  // Ảnh 4 (Phụ kiện/Hộp)
        ],

        info: {
            description: "Dòng máy pha chuyên nghiệp dành cho gia đình...",
            details: "<p>Bảo hành 12 tháng.</p>"
        }
    },

    // --- DỤNG CỤ PHA CHẾ ---
    { 
        id: 21, 
        name: "Ca Đánh Sữa Inox", 
        price: 0, 
        category: "dung-cu", 
        img: "#"
    },

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