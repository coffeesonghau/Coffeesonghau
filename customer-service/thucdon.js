const menuData = [
    {
        name: "Cà Phê Đá",
        prices: {
            "goc": "15.000đ",       
            "chinhanh1": "16.000đ", 
            "chinhanh2": "13.000đ",
            "chinhanh3": "15.000đ"
        },
        image: "https://via.placeholder.com/300x300/e2d4c8/8b4513?text=Ca+Phe+Da",
        category: ["bestseller", "cafe"]
    },
    {
        name: "Bạc Xỉu",
        prices: {
            "goc": "20.000đ",
            "chinhanh1": "20.000đ",
            "chinhanh2": "20.000đ",
            "chinhanh3": "20.000đ"
        },
        image: "https://via.placeholder.com/300x300/e2d4c8/8b4513?text=Bac+Xiu",
        category: "cafe"
    },
    {
        name: "Cà Phê Pha Máy",
        prices: {
            "goc": "20.000đ",
            "chinhanh1": "20.000đ"
            // Không khai báo "chinhanh3" -> Tự động ẩn khi chọn Sông Hậu Coffee
        },
        image: "https://via.placeholder.com/300x300/e2d4c8/8b4513?text=Ca+Phe+Pha+May",
        category: "cafe"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const menuGrid = document.getElementById("menuGrid");
    const branchSelect = document.getElementById("branchSelect");
    const filterBtns = document.querySelectorAll(".cat-btn");
    const searchInput = document.getElementById("searchInput");
    
    let currentBranch = "goc";      
    let currentCategory = "all";    
    let currentSearchTerm = "";     

    function updateDisplay(triggerFlash = false) {
        // 1. Lọc theo danh mục món
        let items = currentCategory === "all" 
            ? menuData 
            : menuData.filter(i => 
                Array.isArray(i.category) 
                    ? i.category.includes(currentCategory) 
                    : i.category === currentCategory
              );
        
        // 2. Lọc theo từ khóa tìm kiếm
        if (currentSearchTerm !== "") {
            items = items.filter(i => i.name.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        }

        // 3. Lọc ẩn các món KHÔNG BÁN tại chi nhánh được chọn (chi nhánh không có khai báo giá)
        items = items.filter(i => i.prices[currentBranch] !== undefined);
        
        menuGrid.innerHTML = ""; 

        // Nếu không có món nào thỏa điều kiện
        if (items.length === 0) {
            menuGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-mug-hot"></i>
                    <p>Mục chọn chưa cập nhật. Xin vui lòng liên hệ nhân viên phục vụ để được hỗ trợ.</p>
                </div>
            `;
            return;
        }

        // Hiển thị các món thỏa điều kiện
        items.forEach(item => {
            let displayPrice = item.prices[currentBranch];
            
            // Gắn class hiệu ứng chớp nháy giá khi đổi chi nhánh
            let priceClass = triggerFlash ? "item-price price-flash" : "item-price";

            const productHTML = `
                <div class="menu-item">
                    <img src="${item.image}" alt="${item.name}" class="item-img" loading="lazy">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price-row">
                            <span class="${priceClass}">${displayPrice}</span>
                        </div>
                    </div>
                </div>
            `;
            menuGrid.insertAdjacentHTML("beforeend", productHTML);
        });
    }

    // Lắng nghe sự kiện khách chọn chi nhánh
    branchSelect.addEventListener("change", (e) => {
        currentBranch = e.target.value;
        updateDisplay(true);
    });

    // Lắng nghe sự kiện bấm chuyển danh mục
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".cat-btn.active").classList.remove("active");
            btn.classList.add("active");
            
            currentCategory = btn.getAttribute("data-filter");
            updateDisplay(); 
        });
    });

    // Lắng nghe sự kiện gõ tìm kiếm
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearchTerm = e.target.value;
            updateDisplay();
        });
    }

    // Khởi tạo hiển thị menu ban đầu
    updateDisplay();
});