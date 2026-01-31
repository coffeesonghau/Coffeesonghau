// js/sanpham.js

// 1. DATABASE SẢN PHẨM GỐC (Lấy từ data.js)
let baseProducts = window.dbProducts || [];

// 2. DỮ LIỆU HIỂN THỊ
// Lấy toàn bộ dữ liệu thật từ data.js (Bao gồm cả sản phẩm giá 0đ/Chưa cập nhật)
let allProducts = [...baseProducts].filter(p => p.price !== 0);

// 3. CẤU HÌNH TRANG
const itemsPerPage = 9; // Số sản phẩm mỗi trang (3 hàng x 3 cột)
let currentPage = 1;
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';

// 4. KHỞI TẠO KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    updateCounts(); // Cập nhật số lượng trên menu bên trái
    applyFilters(); // Chạy bộ lọc lần đầu để render
    setupEventListeners(); // Cài đặt sự kiện click

    // Mobile menu toggle chính (Mở/Đóng nguyên menu mobile)
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
});

/**
 * HÀM HỖ TRỢ KIỂM TRA DANH MỤC (QUAN TRỌNG)
 * Giúp xử lý cả trường hợp category là chuỗi (VD: "rang-xay")
 * hoặc là mảng (VD: ["rang-xay", "best-seller"])
 */
function checkCategory(product, filterName) {
    // Nếu chọn tất cả thì luôn đúng
    if (filterName === 'all') return true;
    
    // Nếu sản phẩm có nhiều danh mục (dạng Mảng)
    if (Array.isArray(product.category)) {
        return product.category.includes(filterName);
    }
    
    // Nếu sản phẩm chỉ có 1 danh mục (dạng Chuỗi)
    return product.category === filterName;
}

/**
 * 4.1 HÀM MỞ MENU CON TRÊN MOBILE
 */
function toggleSubMenu(button) {
    const subMenu = button.nextElementSibling;
    const icon = button.querySelector('i');

    if (subMenu) {
        const isHidden = subMenu.classList.contains('hidden');
        document.querySelectorAll('.sub-menu').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.group-menu i').forEach(el => el.style.transform = 'rotate(0deg)');

        if (isHidden) {
            subMenu.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            subMenu.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    }
}

// 5. LOGIC LỌC VÀ PHÂN TRANG CHÍNH
function applyFilters() {
    let filtered = [...allProducts];

    // a. Lọc theo danh mục (Sử dụng hàm checkCategory mới)
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => checkCategory(p, currentFilter));
    }

    // b. Lọc theo tìm kiếm
    if (currentSearch) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearch));
    }

    // c. Sắp xếp giá
    if (currentSort === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    // d. Cập nhật label "Hiển thị X sản phẩm"
    const showCountEl = document.getElementById('show-count');
    if(showCountEl) showCountEl.innerText = filtered.length;

    // e. Render
    renderPagination(filtered);
    renderProducts(filtered);
}

// 6. HÀM RENDER SẢN PHẨM (ĐÃ CẬP NHẬT: THÊM VƯƠNG MIỆN)
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = `<div class="col-span-2 md:col-span-3 text-center py-10 text-gray-500">Không tìm thấy sản phẩm nào!</div>`;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = products.slice(startIndex, endIndex);

    pageItems.forEach((p, index) => {
        const delay = index * 50;
        
        // Xác định nhãn danh mục
        let catSlug = Array.isArray(p.category) ? p.category[0] : p.category;
        
        let categoryName = 'Sản phẩm';
        switch(catSlug) {
            case 'cafe-hat': categoryName = 'Cà Phê Hạt'; break;
            case 'rang-xay': categoryName = 'Rang Xay'; break;
            case 'cao-cap': categoryName = 'Cao Cấp'; break;
            case 'best-seller': categoryName = 'Bán Chạy'; break;
            case 'dung-cu': categoryName = 'Dụng Cụ'; break;
            case 'may-pha': categoryName = 'Máy Pha'; break;
            default: categoryName = 'Sản phẩm';
        }

        let priceDisplay = '';
        if (p.price === 1) {
            priceDisplay = '<span class="text-sm text-blue-700 font-bold">Liên hệ</span>';
        } else if (p.price === 2) {
             priceDisplay = '<span class="text-sm text-orange-600 font-bold">Sắp ra mắt</span>';
        } else {
             priceDisplay = p.price.toLocaleString() + 'đ';
        }

        // --- ĐOẠN CODE MỚI: TẠO ICON VƯƠNG MIỆN ---
        // Kiểm tra xem sản phẩm có thuộc nhóm 'cao-cap' không
        const isPremium = checkCategory(p, 'cao-cap');
        
        // Tạo HTML Vương miện (Góc phải, giống trang chủ)
        const crownBadge = isPremium 
            ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white w-10 h-10 flex items-center justify-center rounded-bl-xl shadow-md z-20" title="Sản phẩm Cao Cấp">
                 <i class="fas fa-crown text-xl"></i>
               </div>` 
            : '';
        // -------------------------------------------

        const html = `
            <div class="product-card fade-in-item" style="animation-delay: ${delay}ms">
                <div class="card-img-container cursor-pointer relative" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400'">
                    
                    ${crownBadge} </div>
                
                <div class="p-4 flex flex-col flex-1">
                    <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">
                        ${categoryName}
                    </div>
                    <h3 class="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-2 cursor-pointer hover:text-red-900 transition" onclick="window.location.href='product-detail.html?id=${p.id}'">
                        ${p.name}
                    </h3>
                    <div class="mt-auto flex justify-between items-end border-t border-dashed border-gray-200 pt-3">
                        <span class="text-red-900 font-black text-lg">
                            ${priceDisplay}
                        </span>
                        <button onclick="window.location.href='product-detail.html?id=${p.id}'" class="text-gray-400 hover:text-red-900 text-sm" title="Xem chi tiết">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += html;
    });
}

// 7. HÀM TẠO NÚT PHÂN TRANG
function renderPagination(filteredList) {
    const paginationContainer = document.getElementById('pagination');
    if(!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.className = `pagination-btn ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            changePage(filteredList);
        }
    };
    paginationContainer.appendChild(prevBtn);

    const maxVisibleButtons = 5;
    if (totalPages <= maxVisibleButtons) {
        for (let i = 1; i <= totalPages; i++) {
            addPageButton(i, filteredList, paginationContainer);
        }
    } else {
        addPageButton(1, filteredList, paginationContainer);
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-400 self-end pb-2';
            dots.innerText = '...';
            paginationContainer.appendChild(dots);
        }
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        if (currentPage === 1) endPage = 3;
        if (currentPage === totalPages) startPage = totalPages - 2;
        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) addPageButton(i, filteredList, paginationContainer);
        }
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-400 self-end pb-2';
            dots.innerText = '...';
            paginationContainer.appendChild(dots);
        }
        addPageButton(totalPages, filteredList, paginationContainer);
    }

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            changePage(filteredList);
        }
    };
    paginationContainer.appendChild(nextBtn);
}

function addPageButton(pageNumber, list, container) {
    const btn = document.createElement('button');
    btn.innerText = pageNumber;
    btn.className = `pagination-btn ${pageNumber === currentPage ? 'active' : ''}`;
    btn.onclick = () => {
        currentPage = pageNumber;
        changePage(list);
    };
    container.appendChild(btn);
}

function changePage(filteredList) {
    renderProducts(filteredList);
    renderPagination(filteredList);
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// 8. CẬP NHẬT SỐ LƯỢNG (ĐÃ SỬA LẠI KHỚP VỚI FILE HTML CỦA BẠN)
function updateCounts() {
    // Sử dụng checkCategory để đếm chính xác (kể cả sản phẩm thuộc 2 danh mục)
    const counts = {
        // Selector class trong HTML : Key category cần đếm
        '.count-all': allProducts.length,
        '.count-hat': allProducts.filter(p => checkCategory(p, 'cafe-hat')).length,
        '.count-rx': allProducts.filter(p => checkCategory(p, 'rang-xay')).length,
        '.count-pre': allProducts.filter(p => checkCategory(p, 'cao-cap')).length,
        '.count-ht': allProducts.filter(p => checkCategory(p, 'best-seller')).length,
        
        // Lưu ý: Trong HTML bạn để data-filter="dung-cu" và class="count-pm"
        // Nên ở đây ta đếm 'dung-cu' và gán vào class .count-pm
        '.count-pm': allProducts.filter(p => checkCategory(p, 'dung-cu')).length 
    };

    for (let selector in counts) {
        const el = document.querySelector(selector);
        if (el) el.innerText = counts[selector];
    }
}

// 9. LẮNG NGHE SỰ KIỆN NGƯỜI DÙNG
function setupEventListeners() {
    const categories = document.querySelectorAll('#category-filter li');
    categories.forEach(item => {
        item.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active-filter'));
            item.classList.add('active-filter');
            currentFilter = item.getAttribute('data-filter');
            currentPage = 1;
            applyFilters();
        });
    });

    const searchInput = document.getElementById('filter-search');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            currentPage = 1;
            applyFilters();
        });
    }

    const sortSelect = document.getElementById('price-sort');
    if(sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
}