// 1. DỮ LIỆU SẢN PHẨM (Lấy từ data.js)
const products = window.dbProducts || [];

// 2. LOGIC LẤY ẢNH (Đã nâng cấp)
// Nhận vào toàn bộ object sản phẩm thay vì chỉ url
function getProductImages(product) {
    // ƯU TIÊN 1: Nếu sản phẩm có khai báo mảng 'gallery' và có dữ liệu
    if (product.gallery && product.gallery.length > 0) {
        return product.gallery;
    }
    
    // ƯU TIÊN 2: Nếu không có gallery riêng, dùng ảnh chính lặp lại 4 lần (Cơ chế Fallback)
    return [
        product.img,
        product.img,
        product.img,
        product.img
    ];
}

// 3. HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-2xl font-bold text-red-950 mb-4">KHÔNG TÌM THẤY SẢN PHẨM</h1>
                <a href="index.html" class="bg-red-900 text-white px-6 py-2 rounded-full text-sm uppercase font-bold hover:bg-black transition">Quay lại trang chủ</a>
            </div>`;
        return;
    }

    // --- XỬ LÝ ẢNH ---
    // Gọi hàm mới, truyền nguyên object product
    const galleryImages = getProductImages(product);

    // --- XỬ LÝ NỘI DUNG MÔ TẢ (Đã nâng cấp) ---
    // 1. Nội dung giới thiệu chung
    let descriptionText = `<strong>${product.name}</strong> là sự kết hợp hoàn hảo giữa hương vị truyền thống và công nghệ rang xay hiện đại. Được tuyển chọn từ những hạt cà phê chín mọng nhất vùng đất đỏ Bazan.`;
    if (product.info && product.info.description) {
        descriptionText = product.info.description;
    }

    // 2. Nội dung chi tiết kỹ thuật
    let detailsText = `
        <p class="mb-2">Sản phẩm được rang mộc ở nhiệt độ tiêu chuẩn, giữ lại trọn vẹn lớp dầu tự nhiên của hạt cà phê. Hậu vị ngọt sâu, hương thơm nồng nàn quyến rũ.</p>
        <p class="mb-2">Thích hợp cho cả pha phin truyền thống và pha máy Espresso hiện đại.</p>
        <p>Bảo quản: Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</p>
    `;
    if (product.info && product.info.details) {
        detailsText = product.info.details;
    }

    // Tạo HTML cho Gallery
    const galleryHTML = `
        <div class="gallery-container">
            <div class="main-image-frame group">
                <img id="main-product-img" src="${galleryImages[0]}" alt="${product.name}">
            </div>
            <div class="thumbnail-list">
                ${galleryImages.map((img, index) => `
                    <div class="thumbnail-item ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                        <img src="${img}" alt="Góc chụp ${index + 1}">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Logic sản phẩm liên quan
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id && p.price !== 0)
        .slice(0, 4);

    const relatedHTML = relatedProducts.map(p => `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            
            <div class="text-red-900 font-black text-sm">
                ${p.price === 1 
                    ? '<span class="text-blue-700 font-bold text-sm">Liên hệ</span>' 
                    : p.price.toLocaleString() + 'đ'}
            </div>
        </div>
    `).join('');

    // Render HTML Full
    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 mb-16 relative">
            <div class="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-tl-xl rounded-br-xl z-10">Best Seller</div>

            <div class="lg:w-1/2">
                ${galleryHTML}
            </div>

            <div class="lg:w-1/2 flex flex-col justify-center">
                <nav class="text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <a href="index.html" class="hover:text-red-900 transition"><i class="fa-solid fa-house"></i></a> / 
                    <span class="text-red-900 font-bold border-b border-red-900 pb-0.5">${product.category === 'rang-xay' ? 'Cà phê Rang Xay' : 'Cà phê Hòa Tan'}</span>
                </nav>
                
                <h1 class="text-3xl md:text-4xl font-black text-red-950 mb-3 leading-tight uppercase tracking-tight">${product.name}</h1>
                
                <div class="flex items-end gap-3 mb-6">
                     <span class="text-3xl font-black text-red-600">
                        ${product.price === 1 ? 'Liên hệ' : product.price.toLocaleString() + ' VNĐ'}
                     </span>
                     ${product.price !== 1 ? `<span class="text-sm text-gray-400 line-through mb-1.5">Giá thị trường: ${(product.price * 1.2).toLocaleString()}đ</span>` : ''}
                </div>
                
                <div class="bg-red-50 p-5 rounded-lg mb-8 border border-red-100 product-description-container">
                    <div id="desc-content" class="desc-content ${product.price === 1 ? '' : 'collapsed'} text-gray-700 text-sm leading-relaxed">
                        
                        ${product.price === 1 
                            ? '<p class="italic text-gray-500 font-medium">Nội dung đang cập nhật...</p>' 
                            : `
                                <div class="mb-4">
                                    ${descriptionText}
                                </div>

                                <ul class="space-y-2 mb-3">
                                    <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3 w-4"></i> 100% Nguyên chất</li>
                                    <li class="flex items-center text-gray-600"><i class="fas fa-box-open text-yellow-600 mr-3 w-4"></i> Đóng gói tiêu chuẩn</li>
                                </ul>
                                
                                <div class="mt-4 pt-4 border-t border-red-200">
                                    <h4 class="font-bold text-red-900 mb-2">THÔNG TIN CHI TIẾT:</h4>
                                    ${detailsText}
                                </div>
                            `
                        }
                    </div>
                    
                    ${product.price !== 1 ? `
                    <button id="toggle-desc-btn" class="toggle-desc-btn" onclick="toggleDescription()">
                        Xem thêm chi tiết <i class="fa-solid fa-chevron-down ml-1"></i>
                    </button>
                    ` : ''}
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
                ${relatedHTML}
            </div>
        </div>
    `;
}

// 4. HÀM XỬ LÝ SỰ KIỆN
function changeMainImage(src, element) {
    const mainImg = document.getElementById('main-product-img');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    mainImg.style.opacity = '0.5';
    setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
    }, 150);
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
}

function toggleDescription() {
    const content = document.getElementById('desc-content');
    const btn = document.getElementById('toggle-desc-btn');
    const isCollapsed = content.classList.contains('collapsed');
    if (isCollapsed) {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        btn.innerHTML = 'Thu gọn <i class="fa-solid fa-chevron-up ml-1"></i>';
    } else {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        btn.innerHTML = 'Xem thêm chi tiết <i class="fa-solid fa-chevron-down ml-1"></i>';
    }
}

// 5. KHỞI CHẠY
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
    
    renderProductDetail();
    
    const searchBtn = document.getElementById('search-toggle-btn');
    const searchBox = document.getElementById('search-box');
    if(searchBtn && searchBox) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBox.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && e.target !== searchBtn) {
                searchBox.classList.add('hidden');
            }
        });
    }
});