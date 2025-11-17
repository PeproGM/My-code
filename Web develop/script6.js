window.addEventListener("DOMContentLoaded", () => {
  // -----------------------
  // Анимация хедера
  // -----------------------
  const header = document.querySelector(".app__header");
  header.style.opacity = "0";
  header.style.transform = "translateY(-10px)";
  setTimeout(() => {
    header.style.transition = "all 0.6s ease";
    header.style.opacity = "1";
    header.style.transform = "none";
  }, 150);

  // -----------------------
  // Кнопка "Назад до Хаба"
  // -----------------------
  document.querySelector(".go-hub").addEventListener("click", () => {
    window.location.href = "hub.html";
  });

  // -----------------------
  // Настройка таймера для теста
  // -----------------------
  const testButton = document.querySelector(".go-test");
  const timerMessage = document.querySelector(".timer-message");

  // Имя текущего теста — используем его для отдельного ключа в localStorage
  const testFileName = "Test6"; // <-- укажи здесь имя текущего теста
  const storageKey = `test_last_time_${testFileName}`;

  function updateAccess() {
    const lastTestTime = localStorage.getItem(storageKey);

    if (!lastTestTime) {
      enableTestButton();
      return;
    }

    const now = Date.now();
    const diff = now - Number(lastTestTime);
    const remaining = 10 * 60 * 1000 - diff; // 10 минут

    if (remaining > 0) {
      disableTestButton();
      startCountdown(remaining);
    } else {
      enableTestButton();
    }
  }

  function disableTestButton() {
    testButton.disabled = true;
    testButton.classList.add("disabled");
    timerMessage.style.color = "#ff6b6b";
  }

  function enableTestButton() {
    testButton.disabled = false;
    testButton.classList.remove("disabled");
    timerMessage.textContent = "Ви можете пройти тест.";
    timerMessage.style.color = "#82c7ff";
  }

  function startCountdown(time) {
    function tick() {
      let remaining = time - (Date.now() - startTime);
      if (remaining <= 0) {
        enableTestButton();
        return;
      }

      let minutes = Math.floor(remaining / 60000);
      let seconds = Math.floor((remaining % 60000) / 1000);

      timerMessage.textContent =
        "Повторний доступ до тесту через: " +
        minutes +
        " хв " +
        seconds +
        " сек";

      requestAnimationFrame(tick);
    }

    const startTime = Date.now();
    tick();
  }

  // -----------------------
  // Нажатие на кнопку теста
  // -----------------------
  testButton.addEventListener("click", () => {
    localStorage.setItem(storageKey, Date.now().toString());
    window.location.href = "Test6.html"; // ссылка на тест
  });

  // -----------------------
  // Инициализация доступа
  // -----------------------
  updateAccess();
});
