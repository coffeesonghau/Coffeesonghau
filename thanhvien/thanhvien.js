// ======================================================
// 1. DỮ LIỆU & HÀM HỖ TRỢ CHUNG
// ======================================================
const products = window.dbProducts || [];

// Hàm mở menu con (Dùng cho Mobile Menu trong HTML mới)
function toggleSubMenu(btn) {
    const subMenu = btn.nextElementSibling;
    const icon = btn.querySelector('i');
    
    // Toggle ẩn hiện menu con
    subMenu.classList.toggle('hidden');
    
    // Xoay mũi tên 180 độ
    if (subMenu.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
}

// ======================================================
// 2. HIỂN THỊ SẢN PHẨM (TRANG CHỦ)
// ======================================================
function renderSection(category, targetId) {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    // LỌC: Chỉ lấy sản phẩm giá > 0
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

// ======================================================
// 3. TÍNH NĂNG TÌM KIẾM
// ======================================================
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
            
            const found = products.find(p => p.name.toLowerCase().includes(query) && p.price > 0);
            
            if (found) {
                window.location.href = `product-detail.html?id=${found.id}`;
            } else {
                alert('Không tìm thấy sản phẩm phù hợp!');
            }
        }
    });
}

// ======================================================
// 4. SLIDER TỰ ĐỘNG & KÉO THẢ (NÂNG CẤP)
// ======================================================
function initSlider() {
    const sliderContainer = document.getElementById('slider-container');
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (!slider || !sliderContainer) return;

    let currentSlide = 0;
    let autoPlayInterval;
    const totalSlides = 3; // Số lượng slide

    // --- A. Hàm chuyển Slide ---
    function moveSlider(index) {
        // Xử lý vòng lặp index
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Cập nhật dot active
        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add('bg-white', 'w-8'); // Active dài ra
                dot.classList.remove('bg-white/50');
            } else {
                dot.classList.remove('bg-white', 'w-8');
                dot.classList.add('bg-white/50');
            }
        });
    }

    // --- B. Tự động chạy ---
    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            moveSlider(currentSlide + 1);
        }, 4000);
    }
    
    startAutoPlay(); // Kích hoạt ngay khi load

    // --- C. Xử lý Kéo Thả (Swipe Logic) ---
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let sliderWidth = sliderContainer.offsetWidth;

    // Ngăn kéo ảnh mặc định
    slider.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Sự kiện bắt đầu chạm/click
    function touchStart(event) {
        isDragging = true;
        sliderWidth = sliderContainer.offsetWidth;
        startPos = getPositionX(event);
        clearInterval(autoPlayInterval); // Tạm dừng tự động chạy
        slider.style.transition = 'none'; // Tắt animation để kéo dính tay
    }

    // Sự kiện di chuyển
    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            const currentDrag = currentPosition - startPos;
            
            // Tính toán vị trí tạm thời
            const translatePercent = -(currentSlide * 100) + (currentDrag / sliderWidth * 100);
            slider.style.transform = `translateX(${translatePercent}%)`;
            
            currentTranslate = currentDrag; 
        }
    }

    // Sự kiện thả tay
    function touchEnd() {
        isDragging = false;
        slider.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'; // Bật lại animation

        // Nếu kéo > 100px thì đổi slide
        if (currentTranslate < -100) currentSlide += 1;
        else if (currentTranslate > 100) currentSlide -= 1;

        moveSlider(currentSlide); // Căn chỉnh lại vị trí chuẩn
        startAutoPlay(); // Chạy lại tự động
        currentTranslate = 0; // Reset
    }

    // Lấy tọa độ X (hỗ trợ cả chuột và cảm ứng)
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    // Gán sự kiện
    slider.addEventListener('touchstart', touchStart);
    slider.addEventListener('touchend', touchEnd);
    slider.addEventListener('touchmove', touchMove);

    slider.addEventListener('mousedown', touchStart);
    slider.addEventListener('mouseup', touchEnd);
    slider.addEventListener('mouseleave', () => { if(isDragging) touchEnd() });
    slider.addEventListener('mousemove', touchMove);

    // Click Dot
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveSlider(index);
            startAutoPlay();
        });
    });
}

// ======================================================
// 5. MENU MOBILE (NÚT 3 GẠCH)
// ======================================================
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
}

// ======================================================
// 6. TRANG CHI TIẾT SẢN PHẨM
// ======================================================
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product || product.price === 0) {
        container.innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-2xl font-bold text-red-950 mb-4">KHÔNG TÌM THẤY SẢN PHẨM</h1>
                <p class="text-gray-500 mb-6">Sản phẩm này hiện đang được cập nhật hoặc không tồn tại.</p>
                <a href="index.html" class="bg-red-900 text-white px-6 py-2 rounded-full text-sm uppercase font-bold hover:bg-black transition">Quay lại trang chủ</a>
            </div>`;
        return;
    }

    // Giá chính
    let mainPriceHTML = product.price === 1 
        ? `<span class="text-3xl font-black text-blue-700 uppercase">Liên hệ báo giá</span>`
        : `<span class="text-3xl font-black text-red-600">${product.price.toLocaleString()} VNĐ</span>
           <span class="text-sm text-gray-400 line-through mb-1.5">Giá thị trường: ${(product.price * 1.2).toLocaleString()}đ</span>`;

    // Sản phẩm liên quan
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id && p.price > 0)
        .slice(0, 4);

    const relatedHTML = relatedProducts.map(p => {
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
                <div class="flex items-end gap-3 mb-6">${mainPriceHTML}</div>
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

// ======================================================
// 7. POPUP KHUYẾN MÃI
// ======================================================
function initPromoPopup() {
    const popup = document.getElementById('promo-popup');
    const closeBtn = document.getElementById('close-popup-btn');
    const dismissBtn = document.getElementById('dismiss-popup-btn');
    const overlay = document.getElementById('popup-overlay');

    if (!popup) return;

    const isPopupShown = sessionStorage.getItem('popupShown');

    if (!isPopupShown) {
        setTimeout(() => {
            popup.classList.remove('hidden');
            popup.classList.add('flex'); 
        }, 2500);
    }

    const closePopup = () => {
        popup.classList.remove('flex');   
        popup.classList.add('hidden');    
        sessionStorage.setItem('popupShown', 'true');
    };

    if(closeBtn) closeBtn.addEventListener('click', closePopup);
    if(dismissBtn) dismissBtn.addEventListener('click', closePopup);
    if(overlay) overlay.addEventListener('click', closePopup);
}

// ======================================================
// 8. KHỞI CHẠY CHÍNH
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearch();
    initPromoPopup();
    
    // Trang Chủ
    if (document.getElementById('slider')) {
        initSlider();
        renderSection('rang-xay', 'grid-rang-xay');
        renderSection('best-seller', 'grid-best-seller');
    }

    // Trang Chi Tiết
    if (document.getElementById('product-detail-container')) {
        renderProductDetail();
    }
});