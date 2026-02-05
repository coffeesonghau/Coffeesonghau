// js/product-detail.js

// 1. DỮ LIỆU SẢN PHẨM (Lấy từ data.js)
const products = window.dbProducts || [];

// 2. LOGIC LẤY ẢNH
function getProductImages(product) {
  if (product.gallery && product.gallery.length > 0) {
    return product.gallery;
  }
  return [product.img, product.img, product.img, product.img];
}

/**
 * 2.1 HÀM MỞ MENU CON TRÊN MOBILE
 */
function toggleSubMenu(button) {
    const subMenu = button.nextElementSibling;
    const icon = button.querySelector('i');

    if (subMenu) {
        const isHidden = subMenu.classList.contains('hidden');
        
        // Đóng các sub-menu khác
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

// 3. HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM
function renderProductDetail() {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));
  const product = products.find((p) => p.id === productId);

  if (!product) {
    container.innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-2xl font-bold text-red-950 mb-4">KHÔNG TÌM THẤY SẢN PHẨM</h1>
                <a href="index.html" class="bg-red-900 text-white px-6 py-2 rounded-full text-sm uppercase font-bold hover:bg-black transition">Quay lại trang chủ</a>
            </div>`;
    return;
  }

  const galleryImages = getProductImages(product);

  // Xử lý mô tả
  let descriptionText = `<strong>${product.name}</strong> là sự kết hợp hoàn hảo giữa hương vị truyền thống và công nghệ rang xay hiện đại.`;
  if (product.info && product.info.description) {
    descriptionText = product.info.description;
  }

  let detailsText = `<p>Bảo quản: Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</p>`;
  if (product.info && product.info.details) {
    detailsText = product.info.details;
  }

  // --- XỬ LÝ PHẦN ĐẶC ĐIỂM NỔI BẬT (HIGHLIGHTS) TỰ ĐỘNG ---
  let highlightsHTML = "";
  if (product.info && product.info.highlights && product.info.highlights.length > 0) {
      const listItems = product.info.highlights.map(text => `
        <li class="flex items-start text-gray-600">
            <i class="fas fa-check text-green-500 mr-3 w-4 mt-1 shrink-0"></i> 
            <span>${text}</span>
        </li>
      `).join("");
      
      highlightsHTML = `<ul class="space-y-2 mb-3">${listItems}</ul>`;
  }
  // ----------------------------------------------------------------

  const galleryHTML = `
        <div class="gallery-container">
            <div class="main-image-frame group">
                <img id="main-product-img" src="${galleryImages[0]}" alt="${product.name}">
            </div>
            <div class="thumbnail-list">
                ${galleryImages.map((img, index) => `
                    <div class="thumbnail-item ${index === 0 ? "active" : ""}" onclick="changeMainImage('${img}', this)">
                        <img src="${img}" alt="Góc chụp ${index + 1}">
                    </div>
                `).join("")}
            </div>
        </div>
    `;

  // --- LOGIC RANDOM & LỌC ĐA DẠNG ---
  const currentCategories = Array.isArray(product.category) ? product.category : [product.category];

  let candidates = products.filter((p) => {
      if (p.id === product.id) return false;
      if (p.price === 0) return false;
      const pCategories = Array.isArray(p.category) ? p.category : [p.category];
      const hasCommonCategory = currentCategories.some(cate => pCategories.includes(cate));
      return hasCommonCategory;
  });
  
  candidates.sort(() => 0.5 - Math.random());
  const relatedProducts = candidates.slice(0, 4);
  // ----------------------------------

  const relatedHTML = relatedProducts.map((p) => {
        let priceDisplay = '';
        if (p.price === 1) priceDisplay = '<span class="text-blue-700 font-bold text-sm">Liên hệ</span>';
        else if (p.price === 2) priceDisplay = '<span class="text-orange-600 font-bold text-sm">Sắp ra mắt</span>';
        else priceDisplay = p.price.toLocaleString() + "đ";

        return `
        <div class="bg-white border border-gray-100 p-4 rounded-lg hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">
            <div class="aspect-square overflow-hidden rounded-md mb-4 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <h4 class="text-[12px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 uppercase group-hover:text-red-900 transition">${p.name}</h4>
            <div class="text-red-900 font-black text-sm">
                ${priceDisplay}
            </div>
        </div>
    `}).join("");

    const breadcrumbText = Array.isArray(product.category) 
        ? (product.category.includes("may-pha") ? "Máy Pha Cà Phê" : "Sản Phẩm")
        : (product.category === "rang-xay" ? "Cà phê Rang Xay" : 
           product.category === "cafe-hat" ? "Cà phê Hạt" : "Sản Phẩm");

    let mainPriceHTML = '';
    let warningNote = '';

    if (product.price === 1) {
        mainPriceHTML = "Liên hệ";
    } else if (product.price === 2) {
        mainPriceHTML = "Sắp ra mắt";
    } else {
        mainPriceHTML = product.price.toLocaleString() + " VNĐ";
        warningNote = `
             <span class="text-[11px] font-bold text-yellow-600 italic">
                 !  giá có thể thay đổi tùy thời điểm
             </span>`;
    }

  container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 mb-16 relative">
            <div class="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-tl-xl rounded-br-xl z-10">Sản phẩm chính hãng</div>

            <div class="lg:w-1/2">
                ${galleryHTML}
            </div>

            <div class="lg:w-1/2 flex flex-col justify-center">
                <nav class="text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <a href="index.html" class="hover:text-red-900 transition"><i class="fa-solid fa-house"></i></a> / 
                    <span class="text-red-900 font-bold border-b border-red-900 pb-0.5">
                        ${breadcrumbText}
                    </span>
                </nav>
                
                <h1 class="text-3xl md:text-4xl font-black text-red-950 mb-3 leading-tight uppercase tracking-tight">${product.name}</h1>
                
                <div class="mb-6">
                    <div class="flex flex-col gap-1">
                         <span class="text-3xl font-black ${product.price === 2 ? 'text-orange-600' : 'text-red-600'}">
                            ${mainPriceHTML}
                         </span>
                         ${warningNote}
                    </div>
                </div>
                
                <div class="bg-red-50 p-5 rounded-lg mb-8 border border-red-100 product-description-container">
                    <div id="desc-content" class="desc-content ${product.price <= 2 ? "" : "collapsed"} text-gray-700 text-sm leading-relaxed">
                        <div class="mb-4">${descriptionText}</div>
                        
                        ${highlightsHTML}
                        
                        <div class="detail-block-hidden mt-4 pt-4 border-t border-red-200">
                            <h4 class="font-bold text-red-900 mb-2">THÔNG TIN CHI TIẾT:</h4>
                            ${detailsText}
                        </div>
                    </div>
                    ${product.price > 2 ? `
                    <button id="toggle-desc-btn" class="toggle-desc-btn" onclick="toggleDescription()">
                        Xem thêm chi tiết <i class="fa-solid fa-chevron-down ml-1"></i>
                    </button>
                    ` : ""}
                </div>

                <div class="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <a href="https://m.me/1003418946177388" target="_blank" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg uppercase tracking-widest text-xs transition duration-300 shadow-lg shadow-blue-600/20 text-center flex items-center justify-center gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" class="w-5 h-5 bg-white rounded-full p-0.5">
                      Chat Messenger đặt hàng ngay
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
                <a href="sanpham.html" class="text-xs font-bold text-gray-500 hover:text-red-900 uppercase">Xem tất cả <i class="fa-solid fa-arrow-right ml-1"></i></a>
            </div>
            ${relatedProducts.length > 0 ? `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${relatedHTML}
            </div>
            ` : `<p class="text-gray-500 text-sm italic">Không có sản phẩm tương tự.</p>`}
        </div>
    `;
}

// 4. HÀM XỬ LÝ SỰ KIỆN (Không đổi)
function changeMainImage(src, element) {
  const mainImg = document.getElementById("main-product-img");
  const thumbnails = document.querySelectorAll(".thumbnail-item");
  if(!mainImg) return;
  
  mainImg.style.opacity = "0.5";
  setTimeout(() => {
    mainImg.src = src;
    mainImg.style.opacity = "1";
  }, 150);
  thumbnails.forEach((thumb) => thumb.classList.remove("active"));
  element.classList.add("active");
}

function toggleDescription() {
  const content = document.getElementById("desc-content");
  const btn = document.getElementById("toggle-desc-btn");
  if(!content || !btn) return;

  const isCollapsed = content.classList.contains("collapsed");
  if (isCollapsed) {
    content.classList.remove("collapsed");
    content.classList.add("expanded");
    btn.innerHTML = 'Thu gọn <i class="fa-solid fa-chevron-up ml-1"></i>';
  } else {
    content.classList.remove("expanded");
    content.classList.add("collapsed");
    btn.innerHTML = 'Xem thêm chi tiết <i class="fa-solid fa-chevron-down ml-1"></i>';
  }
}

// 5. KHỞI CHẠY
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("hidden");
    });
    
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        mobileMenu.classList.add("hidden");
      }
    });
  }

  renderProductDetail();

  const searchBtn = document.getElementById("search-toggle-btn");
  const searchBox = document.getElementById("search-box");
  if (searchBtn && searchBox) {
    searchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchBox.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!searchBox.contains(e.target) && e.target !== searchBtn) {
        searchBox.classList.add("hidden");
      }
    });
  }
});