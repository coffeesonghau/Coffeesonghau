// js/tet-popup.js

(function() {
    // 1. Chèn thư viện Pháo hoa tự động
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    document.head.appendChild(script);

    // 2. Giao diện HTML của Popup Tết
    const tetPopupHTML = `
    <div id="promo-popup" class="fixed inset-0 z-[100] hidden items-center justify-center p-2 sm:p-4">
        <div id="popup-overlay" class="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"></div>
        <div class="bg-[#450a0a] rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] w-full max-w-4xl overflow-hidden relative z-10 flex flex-col md:flex-row border border-yellow-600/40 max-h-[95vh]">
            <button id="close-popup-btn" class="absolute top-3 right-3 z-[70] bg-black/50 text-white shadow-lg rounded-full w-9 h-9 flex items-center justify-center hover:bg-yellow-600 transition-all border border-white/20">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
            <div class="w-full md:w-5/12 relative h-48 md:h-auto shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-yellow-600/20">
                <img src="img/pupopkm.webp" class="absolute inset-0 w-full h-full object-cover" alt="Chúc Mừng Năm Mới">
                <div class="absolute inset-0 bg-gradient-to-t from-[#450a0a] via-transparent to-transparent md:hidden"></div>
                <div class="absolute top-4 left-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-black text-[10px] px-4 py-1.5 uppercase tracking-wider z-10 rounded-r-full shadow-lg">
                    <i class="fa-solid fa-star-and-crescent mr-1"></i> Xuân Ất Tỵ 2026
                </div>
            </div>
            <div class="w-full md:w-7/12 relative bg-[#450a0a] p-6 md:p-10 flex flex-col overflow-y-auto">
                <div class="mb-6">
                    <span class="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em] block mb-2">Cà Phê Sông Hậu Kính Chúc</span>
                    <h2 class="text-3xl md:text-5xl font-black uppercase leading-tight italic">
                        <span class="text-white">Chúc Mừng</span><br>
                        <span class="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-100 bg-clip-text text-transparent">Năm Mới 2026</span>
                    </h2>
                </div>
                <p class="text-gray-200 text-sm md:text-base mb-8 leading-relaxed font-medium">
                    Kính chúc quý <span class="text-yellow-500 font-bold">Khách hàng</span> và <span class="text-yellow-500 font-bold">Đối tác Nhượng quyền</span> một năm mới vạn sự hanh thông, triệu điều như ý.
                </p>
                <div class="mt-auto flex flex-col gap-3">
                    <a href="nhuong-quyen.html" class="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:brightness-125 transition-all border border-yellow-600/30">
                        <span>Hợp tác Nhượng quyền</span>
                        <i class="fa-solid fa-handshake-angle text-lg"></i>
                    </a>
                    <button id="dismiss-popup-btn" class="w-full py-2 text-[11px] text-gray-400 font-bold hover:text-white transition-colors uppercase tracking-[0.2em]">Khép lại thông báo</button>
                </div>
            </div>
        </div>
    </div>`;

    // 3. Tự động chèn HTML vào cuối body
    document.body.insertAdjacentHTML('beforeend', tetPopupHTML);

    // 4. Logic hiển thị và Pháo hoa
    const popup = document.getElementById('promo-popup');
    const isPopupShown = sessionStorage.getItem('tetPopup2026');

    if (!isPopupShown && popup) {
        setTimeout(() => {
            popup.classList.remove('hidden');
            popup.classList.add('flex');
            bắnPháoHoa();
        }, 2500);
    }

    function bắnPháoHoa() {
        var duration = 5 * 1000;
        var end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 200 });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 200 });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }

    // 5. Sự kiện đóng
    const closePopup = () => {
        popup.classList.add('hidden');
        sessionStorage.setItem('tetPopup2026', 'true');
    };

    document.getElementById('close-popup-btn').addEventListener('click', closePopup);
    document.getElementById('dismiss-popup-btn').addEventListener('click', closePopup);
    document.getElementById('popup-overlay').addEventListener('click', closePopup);
})();