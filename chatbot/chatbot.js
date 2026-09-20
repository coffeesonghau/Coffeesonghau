// ==========================================
// 1. LẤY CÁC PHẦN TỬ DOM & ÂM THANH
// ==========================================
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const suggestionsBox = document.getElementById('suggestionsBox');

let isBotTyping = false; 
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 

// ==========================================
// 2. CƠ SỞ DỮ LIỆU KHỔNG LỒ (HƠN 60 KỊCH BẢN)
// ==========================================
const faqDatabase = [
    // --- NHÓM 1.1: MENU & BÁO GIÁ CƠ BẢN ---
    {
        keywords: [
            "bạn là ai", "ai đây", "ai đang chat", "bot à", "người hay máy", 
            "tên gì", "trợ lý ảo", "mày là ai", "giới thiệu bản thân", "có thể làm gì",
            "bot tên gì", "bạn tên gì", "admin hay bot", "ai trực page", "ai rep tin nhắn",
            "phải bot không", "chat với máy à", "trả lời tự động à", "máy trả lời à",
            "bạn làm được gì", "bot làm được gì", "giúp được gì không", "tư vấn cho mình",
            "hỗ trợ mình với", "chào", "alo", "hi", "hello", "có ai không", "ad ơi", 
            "admin ơi", "shop ơi", "quán ơi", "bot ơi", "trợ lý ơi"
        ],
        question: "Giới thiệu danh tính và chức năng của Chatbot",
        answer: "Dạ xin chào! 🤖 Mình là **Trợ lý ảo tự động của Coffee Sông Hậu**, túc trực 24/7 để hỗ trợ bạn nhanh nhất. <br><br>Mình có thể giúp bạn các việc sau: <br>📜 Cung cấp thực đơn & báo giá đồ uống <br>📍 Chỉ đường, giờ mở cửa các chi nhánh <br>🤝 Tư vấn mua sỉ, nhượng quyền, tuyển dụng <br>⚠️ Ghi nhận các phản hồi, sự cố hoặc khiếu nại dịch vụ. <br><br>Bạn đang cần mình hỗ trợ thông tin gì ạ?"
    },
    {
        keywords: ["menu", "thực đơn", "bảng giá", "xem giá", "tất cả món", "có những món gì", "bán đồ uống gì", "cho xem menu"],
        question: "Xem menu tổng hợp",
        answer: "Chào bạn, để xem toàn bộ danh sách đồ uống và mức giá, bạn vui lòng nhấp vào link này nhé: <a href='../customer-service/thucdon.html' style='color:#2563eb; font-weight:bold;'>👉 Xem Thực Đơn</a>.<br> chi tiết."
    },
    {
        keywords: ["cafe đá", "cà phê đá", "đen đá", "cà phê đen", "cf đá", "cf đen", "đen không đường"],
        question: "Giá cà phê đen đá",
        answer: "Dạ, Cà phê đen/đá truyền thống xay rang nguyên chất có giá là 15.000đ ạ. giá thay đổi tùy chi nhánh và khu vực Bạn dùng tại quán hay muốn đặt mang đi?"
    },
    {
        keywords: ["cafe sữa", "cà phê sữa", "nâu đá", "sữa đá", "bạc xỉu", "cf sữa"],
        question: "Giá cà phê sữa / bạc xỉu",
        answer: "Dạ, Cà phê sữa đá có giá 18.000đ, còn Bạc xỉu (nhiều sữa) là 20.000đ ạ. Món này đậm đà béo ngậy, rất được yêu thích ."
    },
    {
        keywords: [
            "trà sữa", "hồng trà", "trà thái", "ô long", "sữa tươi trân châu",
            "trà đào", "trà vải", "trà lài", "đác thơm", "trà trái cây", "trà dâu", "trà chanh",
            "nước ép", "sinh tố", "ép táo", "ép cam", "ép dưa hấu", "sinh tố bơ", "đồ xay"
        ],
        question: "Các loại Trà sữa, Trà trái cây, Nước ép & Sinh tố",
        answer: "Dạ khách ơi để phục vụ các món tốt hơn liên hệ phục vụ quán cập nhật chính xác nha."
    },
    {
        keywords: ["nóng", "đồ nóng", "uống nóng", "cafe nóng", "trà nóng", "cacao nóng"],
        question: "Các loại đồ uống nóng",
        answer: "Dạ Sông Hậu có phục vụ đồ uống nóng như: Cà phê đen/sữa nóng, Cacao nóng. Rất hợp cho những ngày trời lạnh ạ."
    },
    {
        keywords: [
            "phòng lạnh", "quy định phòng lạnh", "máy lạnh", "điều hòa", "phòng điều hòa", 
            "phòng kính", "nội quy phòng lạnh", "ngồi phòng lạnh", "trong phòng lạnh"
        ],
        question: "Quy định khu vực phòng lạnh",
        answer: "Dạ, để đảm bảo không gian chung luôn trong lành và thoải mái, khu vực phòng lạnh của Sông Hậu xin phép: **Không hút thuốc (kể cả Vape/Pod)**, hạn chế mang thức ăn có mùi nặng và giữ âm lượng trò chuyện vừa phải ạ. Quán rất cảm ơn sự hợp tác của bạn nhé!"
    },

    // --- NHÓM 1.2: TÙY CHỈNH & ĐỒ ĂN ---
    {
        keywords: ["topping", "trân châu", "thạch", "pudding", "kem cheese", "macchiato", "thêm trân châu"],
        question: "Các loại Topping",
        answer: "Dạ thật tiết quán chưa có các loại topping."
    },
    {
        keywords: ["ít đường", "ít đá", "không đường", "không đá", "ngọt vừa", "giảm đường"],
        question: "Tùy chỉnh đường đá",
        answer: "Dạ chắc chắn rồi ạ! Quán luôn pha chế theo khẩu vị của bạn. Bạn có thể yêu cầu ít đường (30%, 50%), không đường, hoặc ít đá/không đá nhé."
    },
    {
        keywords: ["đồ ăn ngoài", "thức ăn ngoài", "mang bánh", "mang đồ ăn vào"],
        question: "Mang đồ ăn/thức uống bên ngoài vào quán",
        answer: "Dạ bạn có thể mang theo đồ ăn vặt nhẹ hoặc bánh kem sinh nhật vào quán. Tuy nhiên, quán xin phép không nhận thức uống từ thương hiệu khác, đồ ăn nặng mùi khu vực phòng lạnh ạ."
    },

    // --- NHÓM 2: KHÔNG GIAN, CHỈ ĐƯỜNG & TIỆN ÍCH ---
    {
        keywords: ["không gian", "địa chỉ", "ở đâu", "chi nhánh", "chỗ nào", "vị trí", "đường nào", "cn1", "cn2"],
        question: "Hỏi địa chỉ và không gian",
        answer: "Dạ Sông Hậu hiện có 12 chi nhánh chính thức 43 chi nhánh nhượng quyền :<br>📍 SÔng Hậu Special p2 Đường Ninh Bình phường 2 (Phòng lạnh yên tĩnh, hợp làm việc).<br>📍 Sông Hậu 12 Cầu Sập Bạc Liêu (thoáng mát thư giãn) v.v....<br>"
    },
    {
        keywords: ["giờ mở cửa", "đóng cửa", "mấy giờ", "sớm nhất", "khuya", "đóng chưa"],
        question: "Giờ hoạt động",
        answer: "Dạ, toàn bộ hệ thống Coffee Sông Hậu mở cửa từ 5:30 sáng đến 21:30 tối tất cả các ngày trong tuần ạ."
    },
    {
        keywords: ["tết", "lễ", "mở xuyên tết", "nghỉ lễ", "ngày lễ"],
        question: "Giờ mở cửa ngày Lễ/Tết",
        answer: "Dạ, Sông Hậu **phục vụ xuyên suốt các ngày Lễ và Tết** (không nghỉ ngày nào). Quán mở cửa từ 6:30 - 22:30 như bình thường ạ."
    },
    {
        keywords: ["đỗ xe", "giữ xe", "ô tô", "xe hơi", "bãi xe", "đậu xe", "xe máy", "có chỗ để xe"],
        question: "Bãi đỗ xe",
        answer: "Dạ, các chi nhánh đều có bãi đỗ xe máy an toàn miễn phí."
    },
    {
        keywords: ["pass wifi", "mật khẩu wifi", "wifi", "mạng", "mật khẩu", "cục wifi"],
        question: "Hỏi mật khẩu Wifi",
        answer: "Dạ, Sông Hậu trang bị wifi miễn phí tốc độ cao ở tất cả chi nhánh. Mật khẩu wifi chung là: 666666 (8 số 6 ạ)"
    },
    {
        keywords: ["làm việc", "ổ cắm", "yên tĩnh", "máy lạnh", "laptop", "học bài", "deadline", "sạc", "chỗ sạc"],
        question: "Không gian làm việc, Ổ cắm điện",
        answer: "Dạ quán có khu vực phòng lạnh yên tĩnh, ánh sáng tốt và bố trí sẵn ổ cắm điện ở từng bàn bàn thường và phòng lạnh rất phù hợp để làm việc, chạy deadline. Bạn cứ xách laptop đến nhé!"
    },
    {
        keywords: ["ngoài trời", "sân vườn", "thoáng mát", "ban công", "không máy lạnh"],
        question: "Không gian ngoài trời/Sân vườn",
        answer: "Dạ nếu bạn thích gió trời, Sông Hậu có khu vực sân vườn/ban công rợp bóng cây xanh cực kỳ chill, đặc biệt mát mẻ vào buổi sáng và chiều tối ạ."
    },
    {
        keywords: ["hút thuốc", "thuốc lá", "vape", "pod", "khói", "ashtray", "gạt tàn"],
        question: "Khu vực hút thuốc",
        answer: "Dạ có, quán có bố trí không gian mở/ban công ngoài trời dành riêng cho khách hút thuốc (có gạt tàn sẵn ở bàn) để không ảnh hưởng đến phòng lạnh bên trong ạ."
    },
    {
        keywords: ["thú cưng", "chó", "mèo", "pet", "mang chó", "chó cưng"],
        question: "Mang theo thú cưng (Pet-friendly)",
        answer: "Dạ Sông Hậu rất chào đón các bé thú cưng! Tuy nhiên để đảm bảo không gian chung, các bé sẽ ngồi ở khu vực sân vườn ngoài trời. Bạn nhớ mang theo dây dẫn cho bé nhé."
    },

    // --- NHÓM 3: ĐẶT BÀN & QUAY PHIM CHỤP ẢNH ---
    {
        keywords: ["sinh nhật", "sự kiện", "đặt tiệc", "trang trí", "party", "offline", "workshop"],
        question: "Đặt tiệc, trang trí sinh nhật, Workshop",
        answer: "Tuyệt vời! Quán có hỗ trợ không gian tổ chức sinh nhật, Bạn liên hệ quản lý sẽ gọi lại tư vấn menu và báo phí trang trí nhé."
    },
    {
        keywords: ["chụp ảnh", "lookbook", "chụp hình", "sống ảo", "máy cơ", "chụp thương mại", "ekip", "studio"],
        question: "Quy định chụp ảnh Lookbook/Máy cơ",
        answer: "Dạ bạn thoải mái chụp hình check-in bằng điện thoại miễn phí."
    },

    // --- NHÓM 4: THANH TOÁN & HÓA ĐƠN ---
    {
        keywords: ["thanh toán", "cà thẻ", "momo", "chuyển khoản", "tiền mặt", "quẹt thẻ", "apple pay", "zalopay", "mã qr"],
        question: "Các hình thức thanh toán",
        answer: "Dạ, Sông Hậu hỗ trợ thanh toán linh hoạt qua: Tiền mặt, Quét mã QR (Chuyển khoản ngân hàng), chưa hỗ trợ Quẹt các loại thẻ ngân hàng (Napas, Visa, Mastercard, Apple Pay, zalo pay, momo) ạ."
    },
    {
        keywords: ["vat", "hóa đơn đỏ", "xuất hóa đơn", "công ty", "mã số thuế", "e-invoice"],
        question: "Xuất hóa đơn điện tử (VAT)",
        answer: "Dạ Sông Hậu có xuất hóa đơn VAT. Bạn vui lòng gửi: Tên Công Ty, Địa chỉ, Mã số thuế và Email hỗ trợ zalo 852.494.694. Kế toán sẽ xuất và gửi email cho bạn trong vòng 24h ạ."
    },
    {
        keywords: ["phụ thu lễ", "phụ thu tết", "tăng giá", "lên giá", "giá tết"],
        question: "Phụ thu ngày Lễ/Tết",
        answer: "Dạ vào các ngày cao điểm Lễ/Tết (Mùng 1 đến Mùng 4 Tết), Sông Hậu chưa có thông tin phụ thu này."
    },

    // --- NHÓM 5: GIAO HÀNG & APP CÔNG NGHỆ ---
    {
        keywords: [
            "giao hàng", "ship", "phí ship", "freeship", "tận nơi", "mang đi", "takeaway", "gọi món",
            "shopeefood", "grab", "gojek", "be", "baemin", "app", "trên app", "đặt qua app"
        ],
        question: "Chính sách giao hàng & Đặt qua App",
        answer: "Dạ, Sông Hậu chưa hỗ trợ giao hàng"
    },
    {
        keywords: ["hủy đơn", "đổi món", "đổi đơn", "đặt nhầm", "làm lại"],
        question: "Hủy đơn hoặc thay đổi món",
        answer: "Dạ nếu bạn vừa đặt hàng và muốn đổi/hủy món, vui lòng gọi thay đổi ngay để nhân viên pha chế kịp thời dừng làm món giúp bạn nhé (chỉ áp dụng nếu nước chưa pha xong)."
    },

    // --- NHÓM 6: KHIẾU NẠI & SỰ CỐ (PHÂN LOẠI CỰC KỲ CHI TIẾT) ---
    {
        keywords: ["tệ", "chán", "thất vọng", "bực mình", "thái độ", "nhân viên", "bảo vệ", "bất lịch sự", "coi thường", "lồi lõm", "chửi", "hách dịch", "phục vụ quá tệ", "tệ quá", "thô lỗ"],
        question: "Khiếu nại thái độ phục vụ",
        answer: "Sông Hậu vô cùng xin lỗi vì trải nghiệm không vui này của bạn! Quán luôn trân trọng và lắng nghe mọi ý kiến đóng góp để cải thiện dịch vụ. Bạn vui lòng liên hệ Hotline CSKH: 0852.494.694 để chia sẻ chi tiết sự việc, Sông Hậu sẽ xử lý ngay lập tức ạ!"
    },
    {
        keywords: ["dở", "không ngon", "chua", "đắng", "khét", "nhạt", "ngọt quá", "lạt nhách", "uống không nổi", "lỏng le", "dở tệ", "khác mọi ngày"],
        question: "Khiếu nại hương vị đồ uống",
        answer: "Sông Hậu thành thật xin lỗi vì đồ uống hôm nay bị lỗi pha chế hoặc chưa hợp khẩu vị của bạn. Nếu đang ở quán, bạn vui lòng báo ngay cho nhân viên hoặc bạn hãy liên hệ số CSKH 0852.494.694 để quán kịp thời xử lý nhé!"
    },
    {
        keywords: ["vật lạ", "tóc", "kiến", "côn trùng", "ruồi", "đau bụng", "vệ sinh", "bẩn", "dơ", "mùi ôi", "chua chua", "ruồi muỗi"],
        question: "Sự cố vệ sinh an toàn thực phẩm",
        answer: "Sông Hậu thật sự hoảng hốt và vô cùng xin lỗi về sự cố nghiêm trọng này! Liên hệ CSKH 0852.494.694 bộ phận sẽ liên hệ ngay để xử lý và rà soát lại toàn bộ quy trình!"
    },
    {
        keywords: ["ồn ào", "nhạc to", "điếc tai", "nóng", "hầm", "máy lạnh hư", "không mát", "hôi", "nhạc ồn", "nhức đầu"],
        question: "Khiếu nại không gian (Ồn, Nóng)",
        answer: "Dạ Sông Hậu rất xin lỗi vì không gian chưa làm bạn thoải mái. Bạn có thể báo ngay cho nhân viên quầy để điều chỉnh nhiệt độ máy lạnh/âm lượng nhạc, hoặc Liên hệ CSKH 0852.494.694 xử lý ngay nhé!"
    },
    {
        keywords: ["quên đồ", "mất đồ", "rơi", "để quên", "tìm đồ", "chìa khóa", "ví", "điện thoại", "túi xách", "nón bảo hiểm"],
        question: "Khách hàng để quên đồ",
        answer: "Dạ bạn đừng quá lo lắng. Bạn vui lòng cho biết thời gian ghé quán, chi nhánh, khu vực ngồi và đặc điểm món đồ, Sông Hậu sẽ lập tức kiểm tra camera và tìm giúp bạn ngay ạ!"
    },
    {
        keywords: ["chậm", "trễ", "thiếu món", "sai món", "nhầm món", "đổ", "tràn", "chưa thấy", "đợi lâu", "lâu quá", "lên nước lâu"],
        question: "Sự cố giao hàng hoặc Đợi nước lâu",
        answer: "Sông Hậu thành thật xin lỗi vì bạn đã phải chờ đợi lâu hoặc gặp sự cố trong quá trình phục vụ. Bạn vui lòng liên hệ ngay bộ phận CSKH qua số 0852.494.694 để quán ghi nhận chi tiết sự việc và có biện pháp xử lý nhân viên kịp thời nhé!"
    },
    {
        keywords: ["nhà vệ sinh", "toilet", "wc", "nhà vệ sinh bẩn", "hết giấy", "dơ bẩn"],
        question: "Hỏi hoặc khiếu nại Nhà vệ sinh",
        answer: "Dạ nhà vệ sinh (WC) nằm ở khu vực phía sau quầy pha chế/cuối sân vườn. Nếu bạn thấy có vấn đề về vệ sinh hoặc hết giấy, vui lòng nhắn lại để quán điều nhân viên dọn dẹp ngay lập tức ạ. Xin lỗi bạn nếu có sự bất tiện!"
    },

    // --- NHÓM 7: KHUYẾN MÃI & THẺ THÀNH VIÊN ---
    {
        keywords: ["khuyến mãi", "voucher", "giảm giá", "chương trình", "ưu đãi", "code", "sale", "có km gì không"],
        question: "Chương trình khuyến mãi",
        answer: "Dạ hiện Sông Hậu chưa có chương trình app dụng mã giảm khách hàng mới, Bạn cũng có thể theo dõi Fanpage Coffee Sông Hậu để theo giỏi nhé!"
    },

    // --- NHÓM 8: KINH DOANH B2B & NHÂN SỰ ---
    {
        keywords: ["sỉ", "đại lý", "phân phối", "nhập hàng", "giá sỉ", "hạt rang", "nguyên liệu", "kg", "cà phê bột"],
        question: "Mua sỉ / Đại lý cà phê rang xay",
        answer: "Sông Hậu tự hào là xưởng rang xay cung cấp nguyên liệu cho hàng trăm quán cafe với chiết khấu lên đến 15%. Liên hệ 0852.494.693 CSKH, chuyên viên B2B sẽ gọi tư vấn gu cafe và gửi bảng giá sỉ ngay ạ."
    },
    {
        keywords: ["nhượng quyền", "mở quán", "setup", "thương hiệu", "franchise", "hợp tác", "mua thương hiệu"],
        question: "Nhượng quyền thương hiệu",
        answer: "Dạ Sông Hậu đang mở rộng nhượng quyền với gói setup chuyên nghiệp, 0 đồng phí quản lý hàng tháng. Bạn vui liên hệ CSKH 0852.494.694 Giám đốc phát triển sẽ liên hệ trực tiếp ạ."
    },
    {
        keywords: ["tuyển dụng", "việc làm", "part-time", "full-time", "barista", "phục vụ", "pha chế", "xin việc", "thu ngân", "quản lý", "tuyển người"],
        question: "Thông tin tuyển dụng",
        answer: "Chào bạn, Sông Hậu đang tuyển dụng các vị trí: Pha chế (Barista), Thu ngân và Phục vụ (Part/Full-time). Môi trường năng động. Bạn có thể gửi yêu cầu qua Zalo 0852.494.694 Coffee Sông Hậu"
    },

    // --- NHÓM 9: SMALL TALK & GIAO TIẾP ---
    {
        keywords: ["tuyệt vời", "ngon", "khen", "dễ thương", "tốt", "hài lòng", "đẹp", "xuất sắc", "đỉnh", "10 điểm", "chăm sóc tốt", "rất ok"],
        question: "Khách hàng khen ngợi",
        answer: "Dạ Sông Hậu rất hạnh phúc khi nhận được lời khen từ bạn! Sự hài lòng của bạn là động lực lớn nhất để đội ngũ nhân viên cố gắng mỗi ngày ❤️"
    },
    {
        keywords: ["chào", "alo", "hi", "ơi", "bot", "trợ lý", "hello", "có ai không", "ad", "admin ơi"],
        question: "Lời chào chung",
        answer: "Dạ Coffee Sông Hậu xin chào! Trợ lý ảo Coffee Sông Hậu đang nghe đây ạ. Bạn cần xem menu đồ uống, hỏi địa chỉ chi nhánh hay cần hỗ trợ khiếu nại ạ?"
    },
    {
        keywords: ["tư vấn viên", "gặp người", "tổng đài", "hotline", "gọi điện", "admin", "nhân viên", "không hiểu", "nói chuyện", "người thật"],
        question: "Yêu cầu gặp nhân viên / người thật",
        answer: "Dạ, nếu trợ lý ảo chưa giải đáp được đúng ý bạn, bạn có thể gọi Hotline: 0852.494.694 Tư vấn viên (người thật) của Sông Hậu sẽ gọi lại hỗ trợ bạn trong vòng 3 phút ạ!"
    },
    {
        keywords: [
            "giám đốc", "giám đốc là ai", "tên giám đốc", "người đứng đầu", "song hau", "chu quan",
            "của công ty nào", "cong ty nào", "thuộc công ty", "công ty chủ quản", 
            "chủ quán", "chủ quán là ai", "ai là chủ", "giới thiệu", "thông tin", "thành lập"
        ],
        question: "Thông tin chủ quản / Giám đốc / Người sáng lập",
        answer: "Dạ, Coffee Sông Hậu là thương hiệu tâm huyết trực thuộc sự quản lý của CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ SẢN XUẤT NAM DƯƠNG (thương hiệu Cà Phê Sông Hậu), do Ông Lê Nam Dương làm Giám đốc. Bạn có thể tìm hiểu chi tiết hơn về câu chuyện thương hiệu tại trang <a href='../index.html' style='color:#2563eb; font-weight:bold;'>Giới thiệu</a> nhé!"
    },
    {
        keywords: [
            "bao nhiêu quán", "mấy quán", "bao nhiêu chi nhánh", "mấy chi nhánh", 
            "chuỗi", "cà phê sông hậu", "cafe sông hậu", "hệ thống", "các chi nhánh"
        ],
        question: "Hỏi về số lượng chi nhánh / Hệ thống",
        answer: "Dạ, hiện tại hệ thống Coffee Sông Hậu đang tự hào vận hành 43 chi nhánh khang trang để phục vụ khách hàng mỗi ngày. Bạn đang ở khu vực nào để trợ lý gợi ý chi nhánh Sông Hậu gần nhất cho mình ghé trải nghiệm nhé!"
    },

];

// ==========================================
// 3. CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
// ==========================================
function getCurrentTime() {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// 4. HÀM HIỂN THỊ TIN NHẮN (UI RENDER)
// ==========================================
function appendMessage(sender, message, save = true) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = `message-wrapper ${sender}`;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    if (sender === 'bot') {
        msgDiv.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } else {
        msgDiv.textContent = message;
    }

    const timeDiv = document.createElement('div');
    timeDiv.className = 'msg-time';
    const msgTime = getCurrentTime(); 
    timeDiv.innerText = msgTime;

    wrapperDiv.appendChild(msgDiv);
    wrapperDiv.appendChild(timeDiv);
    chatBox.appendChild(wrapperDiv);

    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });

    if (save) saveChatHistory(sender, message, msgTime);
}

// ==========================================
// 5. HIỆU ỨNG GÕ PHÍM (TYPING EFFECT)
// ==========================================
function typeMessage(message, callback) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'message-wrapper bot';

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'msg-time';
    timeDiv.innerText = getCurrentTime();

    wrapperDiv.appendChild(msgDiv);
    wrapperDiv.appendChild(timeDiv);
    chatBox.appendChild(wrapperDiv);

    let i = 0;
    const rawText = message.replace(/<[^>]*>?/gm, '').replace(/\*\*/g, ''); 
    
    const typingInterval = setInterval(() => {
        msgDiv.textContent += rawText.charAt(i);
        i++;
        chatBox.scrollTop = chatBox.scrollHeight;

        if (i >= rawText.length) {
            clearInterval(typingInterval);
            msgDiv.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            saveChatHistory('bot', message, timeDiv.innerText);
            
            try { notificationSound.play().catch(e => {}); } catch(e) {}
            if (callback) callback();
        }
    }, 15);
}

// ==========================================
// 6. LƯU TRỮ LỊCH SỬ CHAT (LOCAL STORAGE)
// ==========================================
function saveChatHistory(sender, message, time) {
    let history = JSON.parse(localStorage.getItem('chatHistorySongHau')) || [];
    history.push({ sender, message, time });
    localStorage.setItem('chatHistorySongHau', JSON.stringify(history));
}

function loadChatHistory() {
    let history = JSON.parse(localStorage.getItem('chatHistorySongHau'));
    if (history && history.length > 0) {
        history.forEach(item => {
            appendMessage(item.sender, item.message, false);
            const lastTimeDiv = chatBox.lastElementChild.querySelector('.msg-time');
            if (lastTimeDiv) lastTimeDiv.innerText = item.time;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        isBotTyping = true;
        setTimeout(() => {
            typeMessage('Xin chào! 👋 Cảm ơn bạn đã liên hệ với Coffee Sông Hậu. Tôi là trợ lý ảo, tôi có thể giúp gì cho bạn hôm nay?', () => {
                isBotTyping = false;
            });
        }, 500);
    }
}

// ==========================================
// 7. THUẬT TOÁN ĐIỀU HƯỚNG VÀ CHẤM ĐIỂM
// ==========================================
function handleSend(text) {
    if (isBotTyping) return;

    const messageText = text || chatInput.value.trim();
    if (!messageText) return;

    suggestionsBox.style.display = 'none';
    chatInput.value = '';

    appendMessage('user', messageText);

    isBotTyping = true;
    typingIndicator.style.display = 'block';
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const botResponse = getBotResponse(messageText);
        
        typeMessage(botResponse, () => {
            isBotTyping = false;
        });
    }, 800);
}

function getBotResponse(userText) {
    const lowerText = " " + userText.toLowerCase() + " "; 
    
    let bestMatch = null;
    let maxScore = 0;

    for (const item of faqDatabase) {
        let score = 0;
        
        for (const keyword of item.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                score += keyword.length; // Cộng điểm dựa trên độ dài từ khóa (Từ khóa càng dài/cụ thể càng được ưu tiên)
            }
        }
        
        if (score > maxScore) {
            maxScore = score;
            bestMatch = item.answer;
        }
    }
    
    // Yêu cầu phải có từ khóa được match (score > 0) mới trả lời
    if (maxScore > 0) {
        return bestMatch;
    }
    
    return "Dạ, trợ lý ảo chưa hiểu rõ ý của bạn. Để được hỗ trợ chính xác nhất, bạn vui lòng để lại **Số điện thoại**, hoặc gọi trực tiếp Hotline ** 0852.494.6940**, nhân viên Sông Hậu sẽ gọi lại hỗ trợ bạn ngay lập tức ạ!";
}

// ==========================================
// 8. TƯƠNG TÁC HTML VÀ AUTO-SUGGESTION
// ==========================================
window.sendQuickReply = function(text) { handleSend(text); }
window.clearChat = function() {
    if(confirm('Bạn có chắc muốn xóa lịch sử trò chuyện không?')) {
        localStorage.removeItem('chatHistorySongHau');
        chatBox.innerHTML = '';
        isBotTyping = true;
        setTimeout(() => {
            typeMessage('Xin chào! 👋 Lịch sử đã được xóa. Tôi có thể giúp gì cho bạn hôm nay?', () => isBotTyping = false);
        }, 300);
    }
}

chatInput.addEventListener('input', function() {
    const val = this.value.toLowerCase().trim();
    suggestionsBox.innerHTML = '';
    
    if (val.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const matches = faqDatabase.filter(item => 
        item.question.toLowerCase().includes(val) || 
        item.keywords.some(k => k.includes(val))
    );

    if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerText = match.question;
            div.onmousedown = function(e) { 
                e.preventDefault();
                chatInput.value = match.question;
                suggestionsBox.style.display = 'none';
                handleSend(match.question);
            };
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
});

document.addEventListener('click', function(e) {
    if (e.target !== chatInput && e.target !== suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }
});

sendBtn.addEventListener('click', () => handleSend());
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
});

window.onload = loadChatHistory;