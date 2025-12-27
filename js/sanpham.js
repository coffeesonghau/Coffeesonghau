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

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
});

// 5. LOGIC LỌC VÀ PHÂN TRANG CHÍNH
function applyFilters() {
    let filtered = allProducts;

    // a. Lọc theo danh mục
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
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
    document.getElementById('show-count').innerText = filtered.length;

    // e. Render (Nếu đổi filter thì phải tính lại phân trang)
    renderPagination(filtered);
    renderProducts(filtered);
}

// 6. HÀM RENDER SẢN PHẨM (Đã cắt theo trang)
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-500">Không tìm thấy sản phẩm nào!</div>`;
        return;
    }

    // Tính toán cắt mảng (Slice) cho phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = products.slice(startIndex, endIndex);

    pageItems.forEach((p, index) => {
        const delay = index * 50;
        // HTML Card sản phẩm (Đã xóa card-actions)
        const html = `
            <div class="product-card fade-in-item" style="animation-delay: ${delay}ms">
                <div class="card-img-container cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400'">
                </div>
                
                <div class="p-4 flex flex-col flex-1">
                    <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">${p.category === 'rang-xay' ? 'Rang Xay' : 'Hòa Tan'}</div>
                    <h3 class="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-2 cursor-pointer hover:text-red-900 transition" onclick="window.location.href='product-detail.html?id=${p.id}'">
                        ${p.name}
                    </h3>
                    <div class="mt-auto flex justify-between items-end border-t border-dashed border-gray-200 pt-3">
                        <span class="text-red-900 font-black text-lg">
    ${p.price === 1 
        ? '<span class="text-sm text-blue-700 font-bold">Liên hệ</span>' 
        : p.price.toLocaleString() + 'đ'}
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

// 7. HÀM TẠO NÚT PHÂN TRANG THÔNG MINH (Có dấu ...)
function renderPagination(filteredList) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    // Nếu chỉ có 1 trang thì không cần hiện nút
    if (totalPages <= 1) return;

    // --- NÚT PREVIOUS (<) ---
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

    // --- LOGIC TẠO SỐ TRANG RÚT GỌN (...) ---
    const maxVisibleButtons = 5; // Số lượng nút tối đa muốn hiển thị

    if (totalPages <= maxVisibleButtons) {
        // TRƯỜNG HỢP 1: Ít trang -> Hiện tất cả (1 2 3 4 5)
        for (let i = 1; i <= totalPages; i++) {
            addPageButton(i, filteredList);
        }
    } else {
        // TRƯỜNG HỢP 2: Nhiều trang -> Hiện rút gọn (1 ... 4 5 6 ... 20)

        // Luôn hiện trang 1
        addPageButton(1, filteredList);

        // Nếu trang hiện tại xa trang 1 -> Hiện dấu ...
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-400 self-end pb-2'; // Style cho dấu ...
            dots.innerText = '...';
            paginationContainer.appendChild(dots);
        }

        // Logic hiển thị các trang ở giữa (Xung quanh trang hiện tại)
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Điều chỉnh để luôn hiện đủ 3 nút ở giữa
        if (currentPage === 1) { endPage = 3; }
        if (currentPage === totalPages) { startPage = totalPages - 2; }

        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) { // Đảm bảo không trùng trang 1 và trang cuối
                addPageButton(i, filteredList);
            }
        }

        // Nếu trang hiện tại xa trang cuối -> Hiện dấu ...
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-400 self-end pb-2';
            dots.innerText = '...';
            paginationContainer.appendChild(dots);
        }

        // Luôn hiện trang cuối
        addPageButton(totalPages, filteredList);
    }

    // --- NÚT NEXT (>) ---
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

    // Hàm con hỗ trợ tạo nút số
    function addPageButton(pageNumber, list) {
        const btn = document.createElement('button');
        btn.innerText = pageNumber;
        btn.className = `pagination-btn ${pageNumber === currentPage ? 'active' : ''}`;
        btn.onclick = () => {
            currentPage = pageNumber;
            changePage(list);
        };
        paginationContainer.appendChild(btn);
    }
}

// Hàm hỗ trợ chuyển trang và cuộn lên đầu
function changePage(filteredList) {
    renderProducts(filteredList);
    renderPagination(filteredList);
    window.scrollTo({ top: 300, behavior: 'smooth' }); 
}

// 8. CẬP NHẬT SỐ LƯỢNG (Sidebar)
function updateCounts() {
    // Đếm tất cả
    document.querySelector('.count-all').innerText = allProducts.length;

    // Đếm Rang Xay
    document.querySelector('.count-rx').innerText = allProducts.filter(p => p.category === 'rang-xay').length;

    // Đếm Hòa Tan
    document.querySelector('.count-ht').innerText = allProducts.filter(p => p.category === 'best-seller').length;

    // --- THÊM CODE ĐẾM MÁY PHA ---
    // Tìm thẻ có class .count-may và đếm sản phẩm có category là 'may-pha'
    const countMay = document.querySelector('.count-may');
    if (countMay) {
        countMay.innerText = allProducts.filter(p => p.category === 'may-pha').length;
    }

    // --- THÊM CODE ĐẾM DỤNG CỤ ---
    // Tìm thẻ có class .count-cu và đếm sản phẩm có category là 'dung-cu'
    const countCu = document.querySelector('.count-cu');
    if (countCu) {
        countCu.innerText = allProducts.filter(p => p.category === 'dung-cu').length;
    }
}

// 9. LẮNG NGHE SỰ KIỆN NGƯỜI DÙNG
function setupEventListeners() {
    // a. Click danh mục bên trái
    const categories = document.querySelectorAll('#category-filter li');
    categories.forEach(item => {
        item.addEventListener('click', () => {
            // Đổi style active
            categories.forEach(c => c.classList.remove('active-filter'));
            item.classList.add('active-filter');

            // Set filter và reset về trang 1
            currentFilter = item.getAttribute('data-filter');
            currentPage = 1;
            applyFilters();
        });
    });

    // b. Nhập ô tìm kiếm
    const searchInput = document.getElementById('filter-search');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        currentPage = 1;
        applyFilters();
    });

    // c. Chọn sắp xếp giá
    const sortSelect = document.getElementById('price-sort');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });
}