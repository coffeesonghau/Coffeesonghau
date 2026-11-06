document.addEventListener("DOMContentLoaded", () => {
    const introScreen = document.getElementById("intro-screen");
    const mainContent = document.querySelector(".main-content");

    // 1. Xử lý màn hình chào ban đầu
    setTimeout(() => {
        introScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        document.body.style.overflow = "auto";
    }, 1800); 

    // 2. Xử lý Menu 3 gạch
    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const sideMenu = document.getElementById("sideMenu");
    const closeMenuBtn = document.getElementById("closeMenuBtn");
    const menuOverlay = document.getElementById("menuOverlay");

    function openMenu() {
        sideMenu.classList.add("active");
        menuOverlay.classList.add("active");
    }

    function closeMenu() {
        sideMenu.classList.remove("active");
        menuOverlay.classList.remove("active");
    }

    if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
    if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);

    // 3. Xử lý Chế độ Giao diện Sáng / Tối (Dark Mode)
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    // Kiểm tra xem khách có lưu tuỳ chọn chế độ tối trước đó không
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
        updateThemeUI(true);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const isDark = document.body.classList.contains("dark-theme");
            
            // Lưu lại để lần sau vào web vẫn giữ nguyên chế độ
            localStorage.setItem("theme", isDark ? "dark" : "light");
            updateThemeUI(isDark);
        });
    }

    function updateThemeUI(isDark) {
        if (isDark) {
            themeIcon.classList.replace("fa-moon", "fa-sun");
            themeText.textContent = "Giao diện sáng";
        } else {
            themeIcon.classList.replace("fa-sun", "fa-moon");
            themeText.textContent = "Giao diện tối";
        }
    }
});