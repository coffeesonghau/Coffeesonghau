// js/data.js

// Khai báo biến toàn cục để các file khác đều gọi được
window.dbProducts = [
    // --- CÀ PHÊ RANG XAY ---
    {
        id: 1, 
        name: "Sông Hậu Premium", 
        price: 400000, 
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
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Culi - Moka.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Rang xay Mộc giử vị đậm chất cà phê nguyên bản</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },
    
    {
        id: 2, 
        name: "SH Truyền Thống 1 (250g)", 
        price: 75000, 
        unit: "Gói", // Thêm đơn vị
        category: "rang-xay", 
        img: "img/SHTruyenthong2026.webp",
        gallery: [
            "img/SHTruyenthong12026MT.webp",
            "img/SHtruyenthong2026MS.webp",
              
        ],
        info: {
            description: "Sông Hậu Truyền Thống 1 (250G) 2026.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Hạt tuyển chọn 100% xay Mộc giử vị đậm chất cà phê nguyên bản</p>
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
            description: "Sông Hậu Truyền Thống 2 (250g) 2026.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica, Hương liệu caramel.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Thơm nồng vị Cà Phê rõ</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 4, 
        name: "SH Mạnh Mẽ 1 (250g)", 
        price: 55000, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/SHmanhme2026.webp",
        gallery: [
            "img/SHmanhme12026MT.webp",
            "img/SHmanhme2026MSp.webp",
            "img/SHmanhme2026MS.webp",  
        ],
        info: {
            description: "Sông Hậu Mạnh Mẽ 1 (250g) 2026.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica, Ngũ Cốc, Hương liệu caramel .</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Thơm nồng có vị béo</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 5, 
        name: "SH Mạnh Mẽ 2 (250g)", 
        price: 45000, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/SHmanhme2026.webp",
        gallery: [
            "img/SHmanhme22026MT.webp",
            "img/SHmanhme2026MSp.webp",
            "img/SHmanhme2026MS.webp",  
        ],
        info: {
            description: "SH Mạnh Mẽ 2 (250g) 2026.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica, Đậu, bơ, hương thực phẩm caramel (vị béo).</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Đậm đà - Sánh - Ngậy, Gu mạnh</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 6, 
        name: "SH Cận Đại (250g)", 
        price: 40000, 
        unit: "Gói",
        category: "rang-xay",
        img: "img/SHcandai2026.webp",
        gallery: [
            "img/SHcandai2026MT.webp",
            "img/SHcandai2026MS.webp",  
        ],
        info: {
            description: "Sông Hậu Cận Đại (250g) 2026.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Đậu, bơ, hương thực phẩm caramel (vị béo).</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Vị nhẹ nhàng, dễ uống</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 7, 
        name: "SH Truyền Thống 1 (500g)", 
        price: 150000, 
        unit: "Gói",
        category: ["best-seller", "rang-xay"],
        img: "img/SHtruyenthong1.webp",
        gallery: [
            "img/SHtruyenthong1MT.webp",
            "img/SHtruyenthong1MS.webp",  
        ],
        info: {
            description: "Sông Hậu Truyền Thống 1 (500g)",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Hạt tuyển chọn 100% xay Mộc giử vị đậm chất cà phê nguyên bản</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
            `
        }
    },

    {
        id: 8, 
        name: "SH Truyền Thống 2 (500g)", 
        price: 120000, 
        unit: "Gói",
        category: ["best-seller", "rang-xay"],
        img: "img/SHtruyenthong2.webp",
        gallery: [
            "img/SHtruyenthong2MT.webp",
            "img/SHtruyenthong1MS.webp",  
        ],
        info: {
            description: "Sông Hậu Truyền Thống 2 (500g)",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta, Arabica, Hương liệu caramel.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Thơm nồng vị Cà Phê rõ</p>
                <p>- <strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
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
            description: "cà phê hạt Sông Hậu Rang Mộc giữa Robusta - Moka.",
            details: `
                <p class="mb-2">- <strong>Thành phần:</strong> Robusta - Moka.</p>
                <p class="mb-2">- <strong>Mức rang:</strong> Medium Dark (Rang vừa đậm).</p>
                <p class="mb-2">- <strong>Hương vị:</strong> Mộc nguyên chất Rang thủ công</p>
                <p>- <strong>Hạn sử dụng:</strong> 1 tháng kể từ ngày sản xuất.</p>
            `
        }
    },   

    // --- CODE MẪU ---

    { 
        id: 98, 
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