// 1. Dữ liệu sản phẩm hệ thống (Lấy từ data.js)
const products = window.dbProducts || [];

// 2. Hàm hiển thị sản phẩm theo danh mục (Trang chủ)
function renderSection(category, targetId) {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    // LỌC: Chỉ lấy sản phẩm giá > 0 (Giá = 1 vẫn lấy)
    const filtered = products.filter(p => p.category === category && p.price > 0);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 text-sm col-span-full text-center">Sản phẩm đang được cập nhật...</p>';
        return;
    }

    grid.innerHTML = filtered.map(p => {
        // LOGIC GIÁ: Nếu giá là 1 thì hiện "Liên hệ", ngược lại hiện tiền
        const priceDisplay = p.price === 1 
            ? '<span class="text-blue-700 font-bold text-sm">Liên hệ báo giá</span>' 
            : `<span class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</span>`;

        return `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            <div class="flex justify-between items-center border-t pt-3 mt-3">
                ${priceDisplay}
                <button class="text-gray-400 hover:text-red-900"><i class="fa-solid fa-cart-plus"></i></button>
            </div>
        </div>
    `}).join('');
}

// 3. Tính năng Tìm kiếm
function initSearch() {
    const searchBtn = document.getElementById('search-toggle-btn');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');

    if (!searchBtn || !searchBox) return;

    // Toggle đóng mở
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBox.classList.toggle('hidden');
        if (!searchBox.classList.contains('hidden')) searchInput.focus();
    });

    // Đóng khi click ngoài
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && e.target !== searchBtn) {
            searchBox.classList.add('hidden');
        }
    });

    // Xử lý tìm kiếm
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.toLowerCase().trim();
            if (query === "") return;
            
            // LỌC QUAN TRỌNG: Chỉ tìm sản phẩm có giá > 0
            const found = products.find(p => p.name.toLowerCase().includes(query) && p.price > 0);
            
            if (found) {
                window.location.href = `product-detail.html?id=${found.id}`;
            } else {
                alert('Không tìm thấy sản phẩm phù hợp!');
            }
        }
    });
} // <--- ĐÃ BỔ SUNG DẤU ĐÓNG NGOẶC BỊ THIẾU

// 4. Slider tự động (Trang chủ)
function initSlider() {
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;

    // Nếu không có slider (ở trang khác) thì dừng
    if (!slider) return;

    function moveSlider(index) {
        slider.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === index);
            dot.classList.toggle('bg-white/50', i !== index);
        });
    }

    setInterval(() => {
        currentSlide = (currentSlide + 1) % 3;
        moveSlider(currentSlide);
    }, 4000);
}

// 5. Menu Mobile
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
}

// 6. Hiển thị chi tiết sản phẩm & Sản phẩm liên quan (Trang chi tiết)
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return; // Nếu không tìm thấy container (ở trang chủ) thì thoát

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    // 1. XỬ LÝ ẨN SẢN PHẨM: Nếu không tìm thấy hoặc Giá = 0
    if (!product || product.price === 0) {
        container.innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-2xl font-bold text-red-950 mb-4">KHÔNG TÌM THẤY SẢN PHẨM</h1>
                <p class="text-gray-500 mb-6">Sản phẩm này hiện đang được cập nhật hoặc không tồn tại.</p>
                <a href="index.html" class="bg-red-900 text-white px-6 py-2 rounded-full text-sm uppercase font-bold hover:bg-black transition">Quay lại trang chủ</a>
            </div>`;
        return;
    }

    // 2. XỬ LÝ HIỂN THỊ GIÁ (CHO SẢN PHẨM CHÍNH)
    // Nếu giá là 1 -> Hiện "Liên hệ báo giá", ngược lại hiện số tiền
    let mainPriceHTML = '';
    if (product.price === 1) {
        mainPriceHTML = `<span class="text-3xl font-black text-blue-700 uppercase">Liên hệ báo giá</span>`;
    } else {
        mainPriceHTML = `
            <span class="text-3xl font-black text-red-600">${product.price.toLocaleString()} VNĐ</span>
            <span class="text-sm text-gray-400 line-through mb-1.5">Giá thị trường: ${(product.price * 1.2).toLocaleString()}đ</span>
        `;
    }

    // 3. XỬ LÝ SẢN PHẨM LIÊN QUAN
    // Lấy sản phẩm cùng loại, trừ chính nó, VÀ giá > 0
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id && p.price > 0)
        .slice(0, 4);

    const relatedHTML = relatedProducts.map(p => {
        // Xử lý hiển thị giá cho thẻ nhỏ (card) bên dưới
        const smallPriceDisplay = p.price === 1 
            ? '<span class="text-blue-700 font-bold text-sm">Liên hệ</span>' 
            : `<div class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</div>`;

        return `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            ${smallPriceDisplay}
        </div>
    `}).join('');

    // 4. RENDER HTML CHI TIẾT
    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 mb-16 relative">
            <div class="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-tl-xl rounded-br-xl z-10">Best Seller</div>

            <div class="lg:w-1/2 flex items-center justify-center bg-[#f9f9f9] rounded-xl overflow-hidden p-6 group">
                <img src="${product.img}" alt="${product.name}" class="max-w-full h-auto group-hover:scale-105 transition duration-500 shadow-xl rounded-lg">
            </div>

            <div class="lg:w-1/2 flex flex-col justify-center">
                <nav class="text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <a href="index.html" class="hover:text-red-900 transition"><i class="fa-solid fa-house"></i></a> / 
                    <span class="text-red-900 font-bold border-b border-red-900 pb-0.5">${product.category === 'rang-xay' ? 'Cà phê Rang Xay' : 'Cà phê Hòa Tan'}</span>
                </nav>
                
                <h1 class="text-3xl md:text-4xl font-black text-red-950 mb-3 leading-tight uppercase tracking-tight">${product.name}</h1>
                
                <div class="flex items-end gap-3 mb-6">
                     ${mainPriceHTML}
                </div>
                
                <div class="bg-red-50 p-4 rounded-lg mb-8 border border-red-100">
                    <p class="text-gray-700 text-sm leading-relaxed mb-3">
                        ${product.info ? product.info.description : `Hương vị đậm đà truyền thống từ dòng sản phẩm <strong>${product.name}</strong>.`}
                    </p>
                    <div class="space-y-2 text-sm text-gray-600">
                         ${product.info && product.info.details ? product.info.details : `
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-3 w-4"></i> 100% cà phê nguyên chất</li>
                            <li class="flex items-center"><i class="fas fa-box-open text-yellow-600 mr-3 w-4"></i> Đóng gói kỹ thuật cao</li>
                         `}
                    </div>
                </div>

                <div class="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <a href="https://zalo.me/0852494694" target="_blank" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg uppercase tracking-widest text-xs transition duration-300 shadow-lg shadow-blue-600/20 text-center flex items-center justify-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png" class="w-5 h-5 bg-white rounded-full p-0.5">
                        Chat Zalo đặt hàng ngay
                    </a>
                    <a href="tel:0852494694" class="w-full bg-white border border-red-900 text-red-900 font-bold py-3 rounded-lg uppercase tracking-widest text-xs transition hover:bg-red-50 text-center">
                        <i class="fa-solid fa-phone mr-2"></i> Hotline: 0852.494.694
                    </a>
                </div>
            </div>
        </div>

        <div class="mt-16">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-black text-red-950 uppercase border-l-4 border-yellow-500 pl-4">Có thể bạn sẽ thích</h3>
                <a href="index.html" class="text-xs font-bold text-gray-500 hover:text-red-900 uppercase">Xem tất cả <i class="fa-solid fa-arrow-right ml-1"></i></a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${relatedHTML.length > 0 ? relatedHTML : '<p class="col-span-4 text-center text-gray-400">Chưa có sản phẩm liên quan.</p>'}
            </div>
        </div>
    `;
}

// 7. KHỞI CHẠY CHÍNH
document.addEventListener('DOMContentLoaded', () => {
    // Chạy các tính năng chung
    initMobileMenu();
    initSearch();
    initPromoPopup();
    
    // Kiểm tra trang hiện tại để chạy code phù hợp
    // a. Nếu là Trang Chủ (có slider)
    if (document.getElementById('slider')) {
        initSlider();
        renderSection('rang-xay', 'grid-rang-xay');
        renderSection('best-seller', 'grid-best-seller');
    }

    // b. Nếu là Trang Chi Tiết (có container sản phẩm)
    if (document.getElementById('product-detail-container')) {
        renderProductDetail();
    }
});

// ==========================================
// 8. LOGIC POPUP SLIDER
// ==========================================
function initPromoPopup() {
    const popup = document.getElementById('promo-popup');
    const closeBtn = document.getElementById('close-popup-btn');
    const dismissBtn = document.getElementById('dismiss-popup-btn');
    const overlay = document.getElementById('popup-overlay');

    // Nếu trang hiện tại không có popup HTML thì thoát ngay
    if (!popup) return;

    // Kiểm tra sessionStorage xem khách đã tắt popup trong phiên này chưa
    const isPopupShown = sessionStorage.getItem('popupShown');

    if (!isPopupShown) {
        // Hiện popup sau 2.5 giây
        setTimeout(() => {
            popup.classList.remove('hidden');
            popup.classList.add('flex'); // <--- 1. THÊM DÒNG NÀY (để căn giữa)
        }, 2500);
    }

    // Hàm đóng popup
    const closePopup = () => {
        popup.classList.remove('flex');   // <--- 2. THÊM DÒNG NÀY (xóa flex trước)
        popup.classList.add('hidden');    // Sau đó mới ẩn
        
        // Lưu trạng thái "đã xem" -> F5 sẽ không hiện lại nữa
        sessionStorage.setItem('popupShown', 'true');
    };

    // Gán sự kiện click
    if(closeBtn) closeBtn.addEventListener('click', closePopup);
    if(dismissBtn) dismissBtn.addEventListener('click', closePopup);
    if(overlay) overlay.addEventListener('click', closePopup);
}