const header = document.getElementById('header');
const scrollProgress = document.getElementById('scrollProgress');
const mobileMenuBtn = document.getElementById('mobile-menu');
const mobileCloseBtn = document.getElementById('mobile-close');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');
const navLinks = document.querySelectorAll('.nav-links a');
const quickNavPills = document.querySelectorAll('.mqn-pill');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// 1. Thay đổi trạng thái Header & Thanh tiến trình đọc khi cuộn trang
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    if (scrollTop > 30) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    if (scrollProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = `${progress}%`;
    }
}, { passive: true });

// 2. Hàm đóng/mở Menu Ngăn kéo (Slide-out Drawer) trên điện thoại
function toggleMobileMenu(forceClose = false) {
    const isOpen = forceClose ? false : !navMenu.classList.contains('active');

    navMenu.classList.toggle('active', isOpen);
    navOverlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    
    if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
}

if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => toggleMobileMenu(true));
}

if (navOverlay) {
    navOverlay.addEventListener('click', () => toggleMobileMenu(true));
}

// 3. Tự động đóng menu khi bấm vào bất kỳ mục nào
navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(true));
});

// 4. Đồng bộ trạng thái Active trên Menu & Thanh Quick-Nav ngang khi cuộn trang (ScrollSpy)
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = 'hero';
    const offset = header.offsetHeight + 80;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - offset)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    quickNavPills.forEach(pill => {
        const isMatch = pill.getAttribute('href') === `#${current}`;
        if (!pill.classList.contains('mqn-highlight')) {
            pill.classList.toggle('active', isMatch);
        }
    });
}, { passive: true });

quickNavPills.forEach(pill => {
    pill.addEventListener('click', function() {
        quickNavPills.forEach(p => p.classList.remove('active'));
        if (!this.classList.contains('mqn-highlight')) {
            this.classList.add('active');
        }
        this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
});

// 5. Hiệu ứng xuất hiện mượt mà khi cuộn (Intersection Observer)
const fadeElements = document.querySelectorAll('.fade-in');
const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -25px 0px" };

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

fadeElements.forEach(element => appearOnScroll.observe(element));

window.addEventListener('DOMContentLoaded', () => {
    const heroFadeItems = document.querySelectorAll('#hero .fade-in');
    heroFadeItems.forEach(item => item.classList.add('visible'));
});

// 6. Hiệu ứng đếm số tự động cho Thanh Bảo Chứng Năng Lực (Metrics Counter)
const countElements = document.querySelectorAll('.count-num');
let hasCounted = false;

const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
            hasCounted = true;
            countElements.forEach(el => {
                const target = parseInt(el.getAttribute('data-target'), 10);
                let count = 0;
                const duration = 1300;
                const stepTime = Math.max(Math.floor(duration / target), 20);
                
                const timer = setInterval(() => {
                    count += Math.ceil(target / (duration / stepTime));
                    if (count >= target) {
                        el.textContent = target;
                        clearInterval(timer);
                    } else {
                        el.textContent = count;
                    }
                }, stepTime);
            });
        }
    });
}, { threshold: 0.35 });

const metricsBar = document.querySelector('.metrics-bar');
if (metricsBar) {
    metricsObserver.observe(metricsBar);
}

// 7. Tương tác Nút Chọn Nhanh Nhu Cầu (Quick-Select Chips) & Link Sản phẩm với Form
const topicChips = document.querySelectorAll('.topic-chip');
const serviceSelect = document.getElementById('service');
const ecoCardLinks = document.querySelectorAll('.eco-card-link');

function selectServiceValue(val) {
    if (!serviceSelect) return;
    serviceSelect.value = val;
    topicChips.forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-value') === val);
    });
}

topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
        selectServiceValue(chip.getAttribute('data-value'));
    });
});

if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
        selectServiceValue(e.target.value);
    });
}

ecoCardLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetService = link.getAttribute('data-service');
        if (targetService) {
            selectServiceValue(targetService);
        }
    });
});

// 8. Xử lý gửi Form chuyển đổi với Popup Modal sang trọng
const leadForm = document.getElementById('leadForm');
if (leadForm) {
    leadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG GỬI ĐẾN BAN GIÁM ĐỐC...';
        btn.disabled = true;
        btn.style.opacity = '0.85';
        
        setTimeout(() => {
            this.reset();
            selectServiceValue('gap-giam-doc');
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
            
            if (successModal) {
                successModal.classList.add('active');
                document.body.classList.add('no-scroll');
            }
        }, 800);
    });
}

function closeSuccessModal() {
    if (successModal) {
        successModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSuccessModal);
}

if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });
}

// 9. Xử lý mở/đóng Modal Tiểu sử chi tiết Giám Đốc
const openBioModalBtn = document.getElementById('openBioModal');
const closeBioModalBtn = document.getElementById('closeBioModal');
const closeBioModalBottom = document.getElementById('closeBioModalBottom');
const bioModal = document.getElementById('bioModal');

function toggleBioModal(isOpen) {
    if (!bioModal) return;
    bioModal.classList.toggle('active', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
}

if (openBioModalBtn) {
    openBioModalBtn.addEventListener('click', () => toggleBioModal(true));
}

if (closeBioModalBtn) {
    closeBioModalBtn.addEventListener('click', () => toggleBioModal(false));
}

if (closeBioModalBottom) {
    closeBioModalBottom.addEventListener('click', () => toggleBioModal(false));
}

if (bioModal) {
    bioModal.addEventListener('click', (e) => {
        if (e.target === bioModal) {
            toggleBioModal(false);
        }
    });
}