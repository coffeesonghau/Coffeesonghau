// js/script.js

// ======================================================
// 1. DỮ LIỆU & HÀM HỖ TRỢ CHUNG
// ======================================================
const products = window.dbProducts || [];

// Hàm mở menu con (Dùng cho Mobile Menu)
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
// 2. HIỂN THỊ SẢN PHẨM TRÊN TRANG CHỦ (ĐÃ CẬP NHẬT ĐƠN VỊ TÍNH)
// ======================================================
function renderSection(category, targetId, limit = null) {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    // Lọc sản phẩm theo danh mục và giá hợp lệ
    const filtered = products.filter(p => {
        if (p.price <= 0) return false;
        if (Array.isArray(p.category)) {
            return p.category.includes(category);
        }
        return p.category === category;
    });
    
    // Giới hạn số lượng hiển thị nếu có tham số limit
    const itemsToRender = limit ? filtered.slice(0, limit) : filtered;

    // Nếu không có sản phẩm
    if (itemsToRender.length === 0) {
        if(targetId === 'grid-cao-cap') {
             // Ẩn luôn section nếu là cao cấp mà ko có data
             grid.parentElement.style.display = 'none'; 
             return;
        }
        grid.innerHTML = '<p class="text-gray-400 text-sm col-span-full text-center">Đang cập nhật sản phẩm...</p>';
        return;
    }

    // Render danh sách sản phẩm
    grid.innerHTML = itemsToRender.map(p => {
        let priceDisplay = '';
        
        // --- [MỚI] LOGIC HIỂN THỊ ĐƠN VỊ TÍNH (/Kg, /Gói) ---
        const unitHtml = p.unit ? `<span class="text-xs text-gray-500 font-normal ml-1">/${p.unit}</span>` : '';

        if (p.price === 1) {
            priceDisplay = '<span class="text-blue-700 font-bold text-sm">Liên hệ báo giá</span>';
        } else if (p.price === 2) {
            priceDisplay = '<span class="text-orange-600 font-bold text-sm">Sắp ra mắt</span>';
        } else {
            // Hiển thị: Giá tiền + Đơn vị
            priceDisplay = `<span class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</span>${unitHtml}`;
        }
        
        // --- KIỂM TRA & HIỂN THỊ ICON VƯƠNG MIỆN (CAO CẤP) ---
        const isPremium = (Array.isArray(p.category) && p.category.includes('cao-cap')) || p.category === 'cao-cap';
        const crownBadge = isPremium 
            ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white w-10 h-10 flex items-center justify-center rounded-bl-xl shadow-md z-20" title="Sản phẩm Cao Cấp">
                 <i class="fas fa-crown text-xl"></i>
               </div>` 
            : '';
        
        // --- KIỂM TRA & HIỂN THỊ NHÃN HOT (BEST SELLER) ---
        const hotBadge = category === 'best-seller' 
            ? '<div class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">HOT</div>' 
            : '';

        return `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer relative" onclick="window.location.href='product-detail.html?id=${p.id}'">
            
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50 relative">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                ${crownBadge} ${hotBadge}
            </div>

            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            
            <div class="flex justify-between items-center border-t pt-3 mt-3">
                <div class="flex items-center">
                    ${priceDisplay}
                </div>
                <button class="text-gray-400 hover:text-red-900"><i class="fa-solid fa-cart-plus"></i></button>
            </div>
        </div>
    `}).join('');
}

// ======================================================
// 3. TÍNH NĂNG TÌM KIẾM (FULL: TÌM KIẾM + GỢI Ý BEST SELLER)
// ======================================================

// Hàm hỗ trợ: Chuyển tiếng Việt có dấu thành không dấu
function removeVietnameseTones(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
    return str.trim();
}

// Hàm render thẻ HTML cho 1 sản phẩm (Dùng cho kết quả tìm kiếm)
function createSearchProductCard(p) {
    let priceDisplay = '';
    const unitHtml = p.unit ? `<span class="text-xs text-gray-500 font-normal ml-1">/${p.unit}</span>` : '';

    if (p.price === 1) priceDisplay = '<span class="text-blue-700 font-bold text-sm">Liên hệ báo giá</span>';
    else if (p.price === 2) priceDisplay = '<span class="text-orange-600 font-bold text-sm">Sắp ra mắt</span>';
    else priceDisplay = `<span class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</span>${unitHtml}`;
    
    const isPremium = (Array.isArray(p.category) && p.category.includes('cao-cap')) || p.category === 'cao-cap';
    const crownBadge = isPremium ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white w-10 h-10 flex items-center justify-center rounded-bl-xl shadow-md z-20"><i class="fas fa-crown text-xl"></i></div>` : '';

    return `
    <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer relative" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50 relative">
            <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            ${crownBadge}
        </div>
        <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
        <div class="flex justify-between items-center border-t pt-3 mt-3">
            <div class="flex items-center">${priceDisplay}</div>
            <button class="text-gray-400 hover:text-red-900"><i class="fa-solid fa-cart-plus"></i></button>
        </div>
    </div>`;
}

function initSearch() {
    const searchBtn = document.getElementById('search-toggle-btn');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');

    if (!searchBtn || !searchBox) return;

    // Toggle đóng mở hộp tìm kiếm
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBox.classList.toggle('hidden');
        if (!searchBox.classList.contains('hidden')) searchInput.focus();
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && e.target !== searchBtn) {
            searchBox.classList.add('hidden');
        }
    });

    // Xử lý khi nhấn Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const rawQuery = searchInput.value;
            if (rawQuery.trim() === "") return;
            doSearch(rawQuery);
            searchBox.classList.add('hidden'); 
        }
    });
}

// Tìm hàm doSearch
function doSearch(keyword) {
    const query = removeVietnameseTones(keyword);
    
    // 1. Lọc sản phẩm (Tìm cả trong Tên và Mô tả)
    const results = products.filter(p => {
        const pName = removeVietnameseTones(p.name);
        
        // Lấy thêm mô tả để tìm kiếm (nếu có)
        const pDesc = p.info && p.info.description ? removeVietnameseTones(p.info.description) : ""; 
        
        // Kiểm tra từ khóa có trong Tên HOẶC Mô tả
        return (pName.includes(query) || pDesc.includes(query)) && p.price > 0;
    });

    // 2. Hiển thị kết quả
    showSearchResultsUI(results, keyword);
}

// Hàm hiển thị giao diện kết quả (Kèm tính năng gợi ý Best Seller)
function showSearchResultsUI(results, keyword) {
    // A. Ẩn trang chủ
    const homeSections = document.querySelectorAll('main > section, body > section');
    homeSections.forEach(sec => sec.classList.add('hidden'));

    // B. Tạo vùng hiển thị kết quả
    let resultContainer = document.getElementById('search-results-overlay');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'search-results-overlay';
        resultContainer.className = 'container mx-auto px-4 py-8 animate-popup';
        const header = document.querySelector('header');
        header.parentNode.insertBefore(resultContainer, header.nextSibling);
    }

    resultContainer.classList.remove('hidden');
    
    // C. Xây dựng nội dung
    let htmlContent = `
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <div>
                <h2 class="text-2xl font-black text-red-950 uppercase">Kết quả tìm kiếm</h2>
                <p class="text-sm text-gray-500">Từ khóa: "<span class="font-bold text-red-900">${keyword}</span>"</p>
            </div>
            <button onclick="closeSearch()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs uppercase transition flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Quay lại
            </button>
        </div>
    `;

    // --- [LOGIC QUAN TRỌNG] GỢI Ý SẢN PHẨM NẾU KHÔNG TÌM THẤY ---
    if (results.length === 0) {
        // Lọc 5 sản phẩm Best Seller để gợi ý
        const suggestions = products.filter(p => {
            if (Array.isArray(p.category)) return p.category.includes('best-seller');
            return p.category === 'best-seller';
        }).slice(0, 5);

        htmlContent += `
            <div class="text-center py-8">
                <i class="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 mb-8">Rất tiếc, không tìm thấy sản phẩm nào phù hợp.</p>
                
                <div class="border-t border-gray-100 pt-8 mt-8">
                    <h3 class="text-lg font-bold text-red-900 uppercase mb-6 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-star text-yellow-500"></i> Có thể bạn sẽ thích
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-left">
                        ${suggestions.map(p => createSearchProductCard(p)).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Nếu tìm thấy: Hiển thị danh sách kết quả
        htmlContent += `<p class="mb-4 text-sm text-gray-600">Tìm thấy <strong>${results.length}</strong> sản phẩm phù hợp:</p>`;
        htmlContent += `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">`;
        htmlContent += results.map(p => createSearchProductCard(p)).join('');
        htmlContent += `</div>`;
    }

    resultContainer.innerHTML = htmlContent;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm đóng tìm kiếm
window.closeSearch = function() {
    const resultContainer = document.getElementById('search-results-overlay');
    if (resultContainer) resultContainer.classList.add('hidden');

    const homeSections = document.querySelectorAll('main > section, body > section');
    homeSections.forEach(sec => sec.classList.remove('hidden'));
    
    window.dispatchEvent(new Event('resize')); 
}

// ======================================================
// 4. SLIDER TỰ ĐỘNG & KÉO THẢ (TOUCH SWIPE)
// ======================================================
function initSlider() {
    const sliderContainer = document.getElementById('slider-container');
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (!slider || !sliderContainer) return;

    let currentSlide = 0;
    let autoPlayInterval;
    const totalSlides = 3; // Số lượng slide mặc định

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
    let sliderWidth = sliderContainer.offsetWidth;

    // Ngăn kéo ảnh mặc định của trình duyệt
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

    // Gán sự kiện Touch & Mouse
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
        // 1. Xử lý nút đóng/mở menu (Code cũ)
        menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

        // 2. [MỚI THÊM] Tự động đóng menu khi click vào bất kỳ link nào bên trong
        const menuLinks = mobileMenu.querySelectorAll('a'); // Lấy tất cả thẻ <a> trong menu
        
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Thêm class hidden để ẩn menu đi
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// ======================================================
// 6. TRANG CHI TIẾT SẢN PHẨM (DỰ PHÒNG - NẾU DÙNG SCRIPT.JS)
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

    // --- [MỚI] LOGIC GIÁ & ĐƠN VỊ (Trang Chi Tiết) ---
    let mainPriceHTML = '';
    const bigUnit = product.unit ? `<span class="text-xl font-bold text-gray-500 ml-1">/${product.unit}</span>` : '';

    if (product.price === 1) {
        mainPriceHTML = `<span class="text-3xl font-black text-blue-700 uppercase">Liên hệ báo giá</span>`;
    } else if (product.price === 2) {
        mainPriceHTML = `<span class="text-3xl font-black text-orange-600 uppercase">Sắp ra mắt</span>`;
    } else {
        mainPriceHTML = `<span class="text-3xl font-black text-red-600">${product.price.toLocaleString()} VNĐ</span>
                         ${bigUnit}
                         <span class="block text-sm text-gray-400 line-through mt-1">Giá thị trường: ${(product.price * 1.2).toLocaleString()}đ</span>`;
    }

    // Sản phẩm liên quan
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id && p.price > 0)
        .slice(0, 4);

    const relatedHTML = relatedProducts.map(p => {
        // --- [MỚI] LOGIC GIÁ & ĐƠN VỊ (Sản phẩm liên quan) ---
        let smallPriceDisplay = '';
        const smallUnit = p.unit ? `<span class="text-xs font-normal text-gray-500">/${p.unit}</span>` : '';
        
        if (p.price === 1) smallPriceDisplay = '<span class="text-blue-700 font-bold text-sm">Liên hệ</span>';
        else if (p.price === 2) smallPriceDisplay = '<span class="text-orange-600 font-bold text-sm">Sắp ra mắt</span>';
        else smallPriceDisplay = `<div class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ ${smallUnit}</div>`;

        return `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            ${smallPriceDisplay}
        </div>
    `}).join('');

    // Render HTML chi tiết
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
                <div class="flex flex-col items-start gap-1 mb-6">${mainPriceHTML}</div>
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

    // Kiểm tra xem đã hiển thị chưa
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
    
    // Trang Chủ (Có Slider và các Grid sản phẩm)
    if (document.getElementById('slider')) {
        initSlider();
        
        // Render các khu vực sản phẩm hiện có
        renderSection('cao-cap', 'grid-cao-cap');
        renderSection('cafe-hat', 'grid-cafe-hat');
        renderRangXayPagination();
        renderSection('best-seller', 'grid-best-seller');

        // --- THÊM MỚI: RENDER MẪU DÙNG THỬ (ID 12, 13) ---
        const trialGrid = document.getElementById('grid-trial-samples');
        if (trialGrid) {
            // Lọc đúng 2 mã sản phẩm dùng thử từ database
            const trialProducts = products.filter(p => [12, 13].includes(p.id));
            
            trialGrid.innerHTML = trialProducts.map(p => {
                const unitHtml = p.unit ? `<span class="text-xs text-gray-500 font-normal ml-1">/${p.unit}</span>` : '';
                return `
                <div class="bg-white border border-orange-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer relative" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <div class="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded z-10">DÙNG THỬ</div>
                    <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                        <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    </div>
                    <h4 class="text-[11px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
                    <div class="flex justify-between items-center border-t border-orange-50 pt-3 mt-3">
                        <span class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</span>${unitHtml}
                        <button class="text-orange-400 hover:text-red-900"><i class="fa-solid fa-cart-plus"></i></button>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Trang Chi Tiết
    if (document.getElementById('product-detail-container')) {
        renderProductDetail();
    }
});
// ======================================================
// 9. LOGIC PHÂN TRANG CHO RANG XAY
// ======================================================
let currentRangXayPage = 1;
const rangXayPerPage = 10; // Số sản phẩm trên 1 trang (bạn có thể sửa số này)

function renderRangXayPagination() {
    const grid = document.getElementById('grid-rang-xay');
    const paginationContainer = document.getElementById('pagination-rang-xay');
    
    if (!grid || !paginationContainer) return;

    // 1. Lọc lấy tất cả sản phẩm Rang Xay
    const allProducts = window.dbProducts || [];
    const filtered = allProducts.filter(p => {
        if (p.price <= 0) return false;
        if (Array.isArray(p.category)) return p.category.includes('rang-xay');
        return p.category === 'rang-xay';
    });

    // 2. Tính toán trang
    const totalPages = Math.ceil(filtered.length / rangXayPerPage);
    
    // Đảm bảo trang hiện tại hợp lệ
    if (currentRangXayPage < 1) currentRangXayPage = 1;
    if (currentRangXayPage > totalPages) currentRangXayPage = totalPages;

    // 3. Cắt mảng sản phẩm theo trang
    const startIndex = (currentRangXayPage - 1) * rangXayPerPage;
    const itemsToRender = filtered.slice(startIndex, startIndex + rangXayPerPage);

    // 4. Render Sản phẩm (Copy logic từ renderSection để giữ nguyên giao diện)
    if (itemsToRender.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 text-sm col-span-full text-center">Đang cập nhật sản phẩm...</p>';
    } else {
        grid.innerHTML = itemsToRender.map(p => {
            let priceDisplay = '';
            const unitHtml = p.unit ? `<span class="text-xs text-gray-500 font-normal ml-1">/${p.unit}</span>` : '';

            if (p.price === 1) priceDisplay = '<span class="text-blue-700 font-bold text-sm">Liên hệ báo giá</span>';
            else if (p.price === 2) priceDisplay = '<span class="text-orange-600 font-bold text-sm">Sắp ra mắt</span>';
            else priceDisplay = `<span class="text-red-900 font-black text-sm">${p.price.toLocaleString()}đ</span>${unitHtml}`;
            
            const isPremium = (Array.isArray(p.category) && p.category.includes('cao-cap')) || p.category === 'cao-cap';
            const crownBadge = isPremium 
                ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white w-10 h-10 flex items-center justify-center rounded-bl-xl shadow-md z-20"><i class="fas fa-crown text-xl"></i></div>` : '';

            return `
            <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer relative" onclick="window.location.href='product-detail.html?id=${p.id}'">
                <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50 relative">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    ${crownBadge}
                </div>
                <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
                <div class="flex justify-between items-center border-t pt-3 mt-3">
                    <div class="flex items-center">${priceDisplay}</div>
                    <button class="text-gray-400 hover:text-red-900"><i class="fa-solid fa-cart-plus"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    // 5. Render Nút Phân Trang
    let paginationHTML = '';
    if (totalPages > 1) {
        // Nút Previous
        paginationHTML += `
            <button onclick="changePageRangXay(${currentRangXayPage - 1})" 
                class="w-8 h-8 flex items-center justify-center rounded border ${currentRangXayPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-red-900 hover:text-white hover:border-red-900 transition'}" 
                ${currentRangXayPage === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
        `;

        // Các nút số
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentRangXayPage;
            paginationHTML += `
                <button onclick="changePageRangXay(${i})" 
                    class="w-8 h-8 flex items-center justify-center rounded border text-sm font-bold transition
                    ${isActive ? 'bg-red-900 text-white border-red-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}">
                    ${i}
                </button>
            `;
        }

        // Nút Next
        paginationHTML += `
            <button onclick="changePageRangXay(${currentRangXayPage + 1})" 
                class="w-8 h-8 flex items-center justify-center rounded border ${currentRangXayPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-red-900 hover:text-white hover:border-red-900 transition'}" 
                ${currentRangXayPage === totalPages ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
        `;
    }
    paginationContainer.innerHTML = paginationHTML;
}

// Hàm được gọi khi click vào nút trang
function changePageRangXay(newPage) {
    currentRangXayPage = newPage;
    renderRangXayPagination();
    // Tự động cuộn lên đầu danh sách sản phẩm khi chuyển trang
    document.getElementById('grid-rang-xay').scrollIntoView({ behavior: 'smooth', block: 'start' });
}