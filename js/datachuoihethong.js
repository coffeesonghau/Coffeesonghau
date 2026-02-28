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
        searchTags: "sh12song hau 12 cau sap phuong 8 bac lieu",
        name: "Sông Hậu 12 - Cầu Sập",
        address: "188+181, Đ.23/8, P.8, TP. Bạc Liêu",
        image: "img/songhau12.jpg",
        mapLink: "https://maps.app.goo.gl/z11znAq7eE6X5mtP7"
    },
    {
        id: "sys-02",
        type: "system",
        city: "bac-lieu",
        searchTags: "shhp song hau hoang phat kdc hoang phat nguyen van linh",
        name: "Sông Hậu Hoàng Phát",
        address: "Nguyễn Văn Linh, P.1, TP. Bạc Liêu",
        image: "img/Songhauhoangphat.jpg",
        mapLink: "https://maps.app.goo.gl/HX8h9LM5ZSu3RrAE7"
    },
    {
        id: "sys-03",
        type: "system",
        city: "bac-lieu",
        searchTags: "shp2 song hau special song hau phuong 2 duong ninh binh",
        name: "Sông Hậu Special",
        address: "Đường Ninh Bình, P.2, TP. Bạc Liêu",
        image: "img/songhaup2.jpg",
        mapLink: "https://maps.app.goo.gl/2UypPNgP3ZjJsWZCA"
    },
    {
        id: "sys-04",
        type: "system",
        city: "bac-lieu",
        searchTags: "sh2 song hau 2 ton duc thang duong cach mang duong ba trieu",
        name: "Sông Hậu 2",
        address: "Đường Cách Mạng, P.1, TP. Bạc Liêu",
        image: "img/songhau2.jpg",
        mapLink: "https://maps.app.goo.gl/jZYdeBkgCuJzW98LA"
    },
    {
        id: "sys-05",
        type: "system",
        city: "bac-lieu",
        searchTags: "shcs2 song hau cau so 2 vinh my b hoa binh bac lieu",
        name: "Sông Hậu Cầu Số 2",
        address: "Xã Vĩnh Mỹ B, Hòa Bình, Bạc Liêu",
        image: "img/songhaucauso2.jpg",
        mapLink: "https://maps.app.goo.gl/EzeSKWa5pLxG2gdr8"
    },
    {
        id: "sys-06",
        type: "system",
        city: "bac-lieu",
        searchTags: "sh10 song hau 10 chau van dang phuong 1 bac lieu",
        name: "Sông Hậu 10",
        address: "Châu Văn Đặng, P.1, TP. Bạc Liêu",
        image: "img/SH10.webp",
        mapLink: "https://maps.app.goo.gl/RKSbmoLqhDKKPfLm6"
    },
    {
        id: "sys-07",
        type: "system",
        city: "bac-lieu",
        searchTags: "sh11 song hau 11 tran huynh phuong 1 bac lieu",
        name: "Sông Hậu 11",
        address: "Trần Huỳnh, Phường 1, Bạc Liêu",
        image: "img/songhau11.jpg",
        mapLink: "https://maps.app.goo.gl/pAUcUc4CjLTSYzbu9"
    },
    {
        id: "sys-08",
        type: "system",
        city: "bac-lieu",
        searchTags: "shp3 song hau phuong 3 ba trieu phuong 3 bac lieu",
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
        searchTags: "shpl nhuong quyen song hau phuoc long bac lieu",
        name: "Sông Hậu Phước Long",
        address: "TT. Phước Long, Huyện Phước Long, BL",
        image: "chuoihethong/SHNQplanhlinh.webp",
        mapLink: "https://maps.app.goo.gl/s12ovPaD52eF9mwy7"
    },
    {
        id: "fran-02",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shqk nhuong quyen song hau qk cầu sập huy liệu xã hoà bình",
        name: "Sông Hậu QK",
        address: "Long Thạnh, Vĩnh Lợi, Bạc Liêu,", 
        image: "chuoihethong/SHNQqk.webp",
        mapLink: "https://maps.app.goo.gl/55qa3L2RqXHgJvGr9"
    },
    {
        id: "fran-03",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh22 song hau 22 nhuong quyen song hau 22 vo thi sau, phuong 8, bac lieu",
        name: "Sông Hậu 22",
        address: "45 Võ Thị Sáu, Phường 8, Bạc Liêu", 
        image: "chuoihethong/SH22.webp",
        mapLink: "https://maps.app.goo.gl/ohEPJhJ4NupZ2eEy7"
    },
    {
        id: "fran-04",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shphuoclong nhuong quyen song hau phuoc long",
        name: "Sông Hậu Phước Long (TB)",
        address: "ấp long thành thị trấn phước long tỉnh bạc liêu", 
        image: "chuoihethong/SHphuoclongTB.webp",
        mapLink: "https://maps.app.goo.gl/PgCZ1BSXswTqPbAh8"
    },
    {
        id: "fran-31",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh168 song hau 168 nhuong quyen",
        name: "Sông Hậu 168",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-05",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh9 nhuong quyen song hau 9",
        name: "Sông Hậu 9",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-06",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh13 nhuong quyen song hau 13",
        name: "Sông Hậu 13",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-07",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh19 nhuong quyen song hau 19",
        name: "Sông Hậu 19",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-08",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh28 song hau 28 nhuong quyen",
        name: "Sông Hậu 28",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-09",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh22 nhuong quyen song hau 22",
        name: "Sông Hậu 22",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-10",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh86 nhuong quyen song hau 86",
        name: "Sông Hậu 86",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-11",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh26 nhuong quyen song hau 26",
        name: "Sông Hậu 26",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-12",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh1 nhuong quyen song hau 1",
        name: "Sông Hậu 1",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-13",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh2 nhuong quyen song hau 2",
        name: "Sông Hậu 2",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-14",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh3 nhuong quyen song hau 3",
        name: "Sông Hậu 3",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-15",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh69 nhuong quyen song hau 69",
        name: "Sông Hậu 69",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-16",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh23/8 nhuong quyen song hau 23/8",
        name: "Sông Hậu 23/8",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-17",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh32 nhuong quyen song hau 32",
        name: "Sông Hậu 32",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-18",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shnhamat nhuong quyen song hau nha mat",
        name: "Sông Hậu Nhà Mát",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-19",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "sh22 nhuong quyen song hau 22",
        name: "Sông Hậu 22",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-20",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shdoanhnhan nhuong quyen song hau doanh nhan",
        name: "Sông Hậu Doanh Nhân",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-21",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shchauhung nhuong quyen song hau chau hung",
        name: "Sông Hậu Châu Hưng",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-22",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shphuoclong nhuong quyen song hau phuoc long",
        name: "Sông Hậu Phước Long TB",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-23",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shhongdan nhuong quyen song hau hong dan",
        name: "Sông Hậu Hồng Dân",
        address: "Đang cập nhật...", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-24",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shhoabinh nhuong quyen song hau hoa binh ",
        name: "Sông Hậu Hoà Binh AK",
        address: "45 Võ Thị Sáu, Phường 8, Bạc Liêu", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-25",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shcauhoabinh nhuong quyen song hau cau hoa binh",
        name: "Sông Hậu Cầu Hoà Bình",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-26",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shhoabinh nhuong quyen song hau hoa binh",
        name: "Sông Hậu Hoà Bình",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-27",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shvinhhung nhuong quyen song hau vinh hung",
        name: "Sông Hậu Vĩnh Hưng",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-28",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shdat nhuong quyen song hau dat",
        name: "Sông Hậu SH Đạt",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-29",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "shquangtruong nhuong quyen song hau quang truong",
        name: "Sông Hậu Quảng Trường",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    {
        id: "fran-30",
        type: "franchise",
        city: "bac-lieu",
        searchTags: "nhuong quyen song hau",
        name: "Đang cập nhật...",
        address: "Đang cập nhật", 
        image: "chuoihethong/NQnon.png",
        mapLink: "#"
    },
    
];