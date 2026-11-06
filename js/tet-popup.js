// js/tet-popup.js

(function() {
    // 1. Giao diện HTML của Popup (Đã cập nhật nội dung "Hương Vị Đẳng Cấp")
    const tetPopupHTML = `
    <div id="promo-popup" class="fixed inset-0 z-[100] hidden items-center justify-center p-2 sm:p-4">
        <div id="popup-overlay" class="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"></div>
        <div class="bg-[#1a1a1a] rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] w-full max-w-4xl overflow-hidden relative z-10 flex flex-col md:flex-row border border-yellow-600/30 max-h-[95vh]">
            
            <button id="close-popup-btn" class="absolute top-3 right-3 z-[70] bg-black/50 text-white shadow-lg rounded-full w-9 h-9 flex items-center justify-center hover:bg-yellow-600 transition-all border border-white/20">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>

            <div class="w-full md:w-5/12 relative h-64 md:h-auto shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-yellow-600/20 bg-[#2a2a2a]">
                <img src="img/klklklklklklk.jpg" class="absolute inset-0 w-full h-full object-cover" alt="Sông Hậu Coffee - Hương Vị Đẳng Cấp">
                <div class="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent md:hidden"></div>
                <div class="absolute top-4 left-0 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-[10px] px-4 py-1.5 uppercase tracking-wider z-10 rounded-r-full shadow-lg">
                    <i class="fa-solid fa-crown mr-1"></i> Premium Quality
                </div>
            </div>

            <div class="w-full md:w-7/12 relative bg-[#1a1a1a] p-6 md:p-10 flex flex-col overflow-y-auto">
                <div class="mb-6">
                    <span class="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em] block mb-2">Sông Hậu Coffee</span>
                    <h2 class="text-3xl md:text-5xl font-black uppercase leading-tight italic">
                        <span class="text-white">HƯƠNG VỊ</span><br>
                        <span class="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-100 bg-clip-text text-transparent">ĐẲNG CẤP</span>
                    </h2>
                </div>

                <p class="text-gray-300 text-sm md:text-base mb-8 leading-relaxed font-medium">
                    Khám phá bí quyết tạo nên sự khác biệt từ những hạt cà phê tuyển chọn. 
                    <span class="text-yellow-500 font-bold">Gu Mạnh Mẽ</span> và <span class="text-yellow-500 font-bold">Gu Cận Đại</span> - 
                    Sự kết hợp hoàn hảo giữa truyền thống và tinh hoa hiện đại.
                </p>

                <div class="grid grid-cols-2 gap-4 mb-8">
                    <div class="bg-white/5 border-l-2 border-yellow-500 p-3 rounded-r-lg">
                        <div class="text-yellow-500 font-bold text-[10px] uppercase mb-1">Đậm đà</div>
                        <div class="text-white text-[12px] font-semibold">Chuẩn vị cà phê Việt</div>
                    </div>
                    <div class="bg-white/5 border-l-2 border-yellow-500 p-3 rounded-r-lg">
                        <div class="text-yellow-500 font-bold text-[10px] uppercase mb-1">Tinh tế</div>
                        <div class="text-white text-[12px] font-semibold">Hương thơm quyến rũ</div>
                    </div>
                </div>

                <div class="mt-auto flex flex-col gap-3">
                    <a href="sanpham.html" class="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(202,138,4,0.3)] border border-yellow-400/30">
                        <span>Thưởng thức ngay</span>
                        <i class="fa-solid fa-mug-hot text-lg"></i>
                    </a>
                    <button id="dismiss-popup-btn" class="w-full py-2 text-[11px] text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-[0.2em]">Để sau</button>
                </div>
            </div>
        </div>
    </div>`;

    // 2. Tự động chèn HTML vào cuối body
    document.body.insertAdjacentHTML('beforeend', tetPopupHTML);

    // 3. Logic hiển thị
    const popup = document.getElementById('promo-popup');
    const isPopupShown = sessionStorage.getItem('promoPopupShown');

    if (!isPopupShown && popup) {
        setTimeout(() => {
            popup.classList.remove('hidden');
            popup.classList.add('flex');
        }, 2500);
    }

    // 4. Sự kiện đóng
    const closePopup = () => {
        if(popup) {
            popup.classList.add('hidden');
            popup.classList.remove('flex');
            sessionStorage.setItem('promoPopupShown', 'true');
        }
    };

    document.getElementById('close-popup-btn')?.addEventListener('click', closePopup);
    document.getElementById('dismiss-popup-btn')?.addEventListener('click', closePopup);
    document.getElementById('popup-overlay')?.addEventListener('click', closePopup);
})();