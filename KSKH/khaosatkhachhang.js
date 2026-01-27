const steps = document.querySelectorAll(".step");
let currentStep = 0;

/* NEXT STEP */
function nextStep() {
  // Kiểm tra input bắt buộc trong step hiện tại
  const inputs = steps[currentStep].querySelectorAll("input[required]");
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
  }

  steps[currentStep].classList.remove("active");
  currentStep++;
  steps[currentStep].classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* SUBMIT FORM */
document.getElementById("surveyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("https://script.google.com/macros/s/AKfycbwLenAR2LZraUJ4okB5PYx6aaMaA2z0fjS3BpAyDAzxqN4RwVbj5Vz-Lo2B-V50_pqRIA/exec", {
    method: "POST",
    body: formData
  })
  .catch(() => {
    console.warn("Không gửi được dữ liệu, kiểm tra URL Google Script");
  });

  document.body.innerHTML = `
    <div class="thank">
      <h2>🎉 Cảm ơn bạn đã khảo sát!</h2>
      <p>Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>
      <p>Trang sẽ tự động quay lại sau vài giây...</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "/";
  }, 3000);
});
