document.addEventListener("DOMContentLoaded", () => {
    const introScreen = document.getElementById("intro-screen");
    const mainContent = document.querySelector(".main-content");

    // Hiển thị màn hình chào trong 1.8 giây, sau đó chuyển cảnh
    setTimeout(() => {
        // 1. Kích hoạt hiệu ứng mờ dần màn hình Intro
        introScreen.classList.add("fade-out");
        
        // 2. Hiển thị Card nội dung chính mượt mà
        mainContent.classList.remove("hidden");
        
        // 3. Mở lại thanh cuộn của body (nếu có)
        document.body.style.overflow = "auto";
    }, 1800); 
});