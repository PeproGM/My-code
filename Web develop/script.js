document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const overlay = document.getElementById("overlay");

  // Переключатель открытия/закрытия
  settingsBtn.addEventListener("click", () => {
    const isOpen = settingsPanel.classList.contains("open");
    if (isOpen) {
      settingsPanel.classList.remove("open");
      overlay.classList.remove("active");
    } else {
      settingsPanel.classList.add("open");
      overlay.classList.add("active");
    }
  });

  // Закрыть по клику на оверлей
  overlay.addEventListener("click", () => {
    settingsPanel.classList.remove("open");
    overlay.classList.remove("active");
  });
});
