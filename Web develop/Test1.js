window.addEventListener("DOMContentLoaded", () => {
  const finishBtn = document.getElementById("finishTest");
  const questions = document.querySelectorAll(".test-questions > li");
  const timerEl = document.getElementById("timer");

  // Таймер 10 минут
  let timeLeft = 10 * 60;
  const timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    timeLeft--;
    if (timeLeft < 0) clearInterval(timerInterval);
  }, 1000);

  // Проверка ответов
  const checkAnswers = () => {
    let correctCount = 0;

    questions.forEach((q) => {
      const answer = q.dataset.answer;
      const options = q.querySelectorAll("li");
      options.forEach((opt) => {
        opt.style.background = "";
        if (
          opt.dataset.option === answer &&
          opt.classList.contains("selected")
        ) {
          correctCount++;
          opt.style.background = "rgba(77, 163, 255, 0.3)";
        } else if (opt.classList.contains("selected")) {
          opt.style.background = "rgba(255, 107, 107, 0.3)";
        }
      });
    });

    return correctCount === questions.length;
  };

  // Выбор опций
  questions.forEach((q) => {
    q.querySelectorAll("li").forEach((opt) => {
      opt.addEventListener("click", () => {
        q.querySelectorAll("li").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
  });

  // Завершение теста
  finishBtn.addEventListener("click", () => {
    if (checkAnswers()) {
      alert("Ви успішно пройшли тест! Досвід зараховано.");

      // --- ЕДИНОЕ ХРАНИЛИЩЕ ОПЫТА ---
      let exp = parseInt(localStorage.getItem("user_exp") || "0");
      exp++;
      localStorage.setItem("user_exp", exp);

      // Переход обратно
      window.location.href = "Hub.html";
    } else {
      alert("Деякі відповіді невірні. Спробуйте ще раз.");
    }
  });
});
