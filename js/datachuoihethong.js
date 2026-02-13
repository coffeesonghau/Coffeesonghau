// js/datachuoihethong.js

const systemData = [
    // --- TRỤ SỞ CHÍNH ---
    {
        id: "hq-01",
        type: "headquarters", // Loại đặc biệt: Trụ sở chính (Card to)
        city: "bac-lieu",
        searchTags: "cong ty nam duong tru so chinh bac lieu",
        name: "Nam Dương",
        subTitle: "Công Ty TNHH MTV SX TM DV",
        address: "188+181, Đường 23/8, Khóm Cầu Sập, Phường 8, TP. Bạc Liêu, Tỉnh Cà Mau",
        phone: "0852.494.694",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        mapLink: "https://maps.app.goo.gl/sWArB5r16oyuGpzUA",
        contactLink: "nhuong-quyen.html"
    },
    // --- HỆ THỐNG CỬA HÀNG (TRỰC THUỘC) ---
    {
        id: "sys-01",
        type: "system", // Loại thường: Hệ thống (Card nhỏ)
        city: "bac-lieu",
        searchTags: "song hau 12 cau sap phuong 8 bac lieu",
        name: "Sông Hậu 12 - Cầu Sập",
        address: "188+181, Đ.23/8, P.8, TP. Bạc Liêu",
        image: "img/songhau12.jpg",
        mapLink: "https://maps.app.goo.gl/z11znAq7eE6X5mtP7"
    },
    {
        id: "sys-02",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau hoang phat kdc hoang phat nguyen van linh",
        name: "Sông Hậu Hoàng Phát",
        address: "Nguyễn Văn Linh, P.1, TP. Bạc Liêu",
        image: "img/Songhauhoangphat.jpg",
        mapLink: "https://maps.app.goo.gl/HX8h9LM5ZSu3RrAE7"
    },
    {
        id: "sys-03",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau special song hau phuong 2 duong ninh binh",
        name: "Sông Hậu Special",
        address: "Đường Ninh Bình, P.2, TP. Bạc Liêu",
        image: "img/songhaup2.jpg",
        mapLink: "https://maps.app.goo.gl/2UypPNgP3ZjJsWZCA"
    },
    {
        id: "sys-04",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau 2 ton duc thang duong cach mang duong ba trieu",
        name: "Sông Hậu 2",
        address: "Đường Cách Mạng, P.1, TP. Bạc Liêu",
        image: "img/songhau2.jpg",
        mapLink: "https://maps.app.goo.gl/jZYdeBkgCuJzW98LA"
    },
    {
        id: "sys-05",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau cau so 2 vinh my b hoa binh bac lieu",
        name: "Sông Hậu Cầu Số 2",
        address: "Xã Vĩnh Mỹ B, Hòa Bình, Bạc Liêu",
        image: "img/songhaucauso2.jpg",
        mapLink: "https://maps.app.goo.gl/EzeSKWa5pLxG2gdr8"
    },
    {
        id: "sys-06",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau 10 chau van dang phuong 1 bac lieu",
        name: "Sông Hậu 10",
        address: "Châu Văn Đặng, P.1, TP. Bạc Liêu",
        image: "img/songhau10.jpg",
        mapLink: "https://maps.app.goo.gl/RKSbmoLqhDKKPfLm6"
    },
    {
        id: "sys-07",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau 11 tran huynh phuong 1 bac lieu",
        name: "Sông Hậu 11",
        address: "Trần Huỳnh, Phường 1, Bạc Liêu",
        image: "img/songhau11.jpg",
        mapLink: "https://maps.app.goo.gl/pAUcUc4CjLTSYzbu9"
    },
    {
        id: "sys-08",
        type: "system",
        city: "bac-lieu",
        searchTags: "song hau phuong 3 ba trieu phuong 3 bac lieu",
        name: "Sông Hậu P.3",
        address: "Bà Triệu, Phường 3, TP. Bạc Liêu",
        image: "img/songhaup3.jpg",
        mapLink: "https://maps.app.goo.gl/DHt4iLCEiSGepEQz6"
    },
    {
        id: "res-01",
        type: "restaurant", // Loại đặc biệt: Nhà hàng (Card nhỏ, badge xanh)
        city: "bac-lieu",
        searchTags: "am thuc song hau vong xoay ton duc thang vo van kiet",
        name: "Ẩm Thực Sông Hậu",
        address: "Vòng xoay Tôn Đức Thắng, P.7, BL",
        image: "img/amthucsonghau.jpg",
        mapLink: "https://maps.app.goo.gl/gcN9vA2XzsJdc4GW9"
    },
    // --- HỆ THỐNG NHƯỢNG QUYỀN (ĐỐI TÁC) ---
    {
        id: "fran-01",
        type: "franchise", // Loại: Nhượng quyền (Card nhỏ, badge vàng)
        city: "bac-lieu",
        searchTags: "nhuong quyen song hau phuoc long bac lieu",
        name: "Sông Hậu Phước Long",
        address: "TT. Phước Long, Huyện Phước Long, BL",
        image: "chuoihethong/SHNQplanhlinh.webp",
        mapLink: "https://maps.app.goo.gl/s12ovPaD52eF9mwy7"
    },
    {
        id: "fran-02",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "nhuong quyen song hau qk cầu sập huy liệu xã hoà bình",
        name: "Sông Hậu QK",
        address: "Long Thạnh, Vĩnh Lợi, Bạc Liêu,", // Lưu ý: Địa chỉ gốc trong HTML cũ ghi Phường 7 Bạc Liêu nhưng tag là Cà Mau, tôi giữ nguyên data gốc.
        image: "chuoihethong/SHNQqk.webp",
        mapLink: "https://maps.app.goo.gl/55qa3L2RqXHgJvGr9"
    },
];