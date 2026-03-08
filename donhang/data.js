// data.js
const productData = {
    // Định nghĩa các mức giá chung
    channels: {
        "ban_le": "Bán lẻ",
        "dai_ly_quan": "Đại lý / Quán",
        "he_thong_npp": "Hệ thống / NPP"
    },
    
    // Danh sách sản phẩm
    // Các mức giá (VNĐ) được chia theo 3 nhóm như bạn yêu cầu
    products: [
        // Dòng 500g
        { id: "tt1_500", name: "Truyền Thống 1", weight: "500g", prices: { ban_le: 150000, dai_ly_quan: 130000, he_thong_npp: 120000 } },
        { id: "tt2_500", name: "Truyền Thống 2", weight: "500g", prices: { ban_le: 120000, dai_ly_quan: 110000, he_thong_npp: 100000 } },
        { id: "mm1_500", name: "Mạnh Mẽ 1", weight: "500g", prices: { ban_le: 110000, dai_ly_quan: 100000, he_thong_npp: 90000 } },
        { id: "mm2_500", name: "Mạnh Mẽ 2", weight: "500g", prices: { ban_le: 90000, dai_ly_quan: 80000, he_thong_npp: 70000 } },
        { id: "cd_500", name: "Cận Đại", weight: "500g", prices: { ban_le: 80000, dai_ly_quan: 70000, he_thong_npp: 60000 } },

        // Dòng 250g
        { id: "pre_250", name: "Premium 2026", weight: "250g", prices: { ban_le: 100000, dai_ly_quan: 95000, he_thong_npp: 90000 } },
        { id: "tt1_250", name: "Truyền Thống 1", weight: "250g", prices: { ban_le: 75000, dai_ly_quan: 65000, he_thong_npp: 60000 } },
        { id: "tt2_250", name: "Truyền Thống 2", weight: "250g", prices: { ban_le: 60000, dai_ly_quan: 55000, he_thong_npp: 50000 } },
        { id: "mm1_250", name: "Mạnh Mẽ 1", weight: "250g", prices: { ban_le: 55000, dai_ly_quan: 50000, he_thong_npp: 45000 } },
        { id: "mm2_250", name: "Mạnh Mẽ 2", weight: "250g", prices: { ban_le: 70000, dai_ly_quan: 40000, he_thong_npp: 35000 } },
        { id: "cd_250", name: "Cận Đại", weight: "250g", prices: { ban_le: 35000, dai_ly_quan: 30000, he_thong_npp: 25000 } },

        // Dòng 100g
        { id: "tt1_100", name: "Truyền Thống 1", weight: "100g", prices: { ban_le: 40000, dai_ly_quan: 40000, he_thong_npp: 40000 } },
        { id: "tt2_100", name: "Truyền Thống 2", weight: "100g", prices: { ban_le: 34000, dai_ly_quan: 34000, he_thong_npp: 34000 } },
        { id: "mm1_100", name: "Mạnh Mẽ 1", weight: "100g", prices: { ban_le: 32000, dai_ly_quan: 32000, he_thong_npp: 32000 } },
        { id: "mm2_100", name: "Mạnh Mẽ 2", weight: "100g", prices: { ban_le: 28000, dai_ly_quan: 28000, he_thong_npp: 28000 } },
        { id: "cd_100", name: "Cận Đại", weight: "100g", prices: { ban_le: 26000, dai_ly_quan: 26000, he_thong_npp: 26000 } },

        // Dòng 100g dùng thử
        { id: "tt1_100dt", name: "Truyền Thống 1", weight: "100g", prices: { ban_le: 0, dai_ly_quan: 0, he_thong_npp: 0 } },
        { id: "tt2_100dt", name: "Truyền Thống 2", weight: "100g", prices: { ban_le: 0, dai_ly_quan: 0, he_thong_npp: 0 } },
        { id: "mm1_100dt", name: "Mạnh Mẽ 1", weight: "100g", prices: { ban_le: 0, dai_ly_quan: 0, he_thong_npp: 0 } },
        { id: "mm2_100dt", name: "Mạnh Mẽ 2", weight: "100g", prices: { ban_le: 0, dai_ly_quan: 0, he_thong_npp: 0 } },
        { id: "cd_100dt", name: "Cận Đại", weight: "100g", prices: { ban_le: 0, dai_ly_quan: 0, he_thong_npp: 0 } },

    ]
};