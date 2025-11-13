document.addEventListener("DOMContentLoaded", () => {
  const totalExpensesEl = document.getElementById("totalExpenses");
  const totalIncomeEl = document.getElementById("totalIncome");
  const balanceEl = document.getElementById("balance");
  const backBtn = document.getElementById("backBtn");

  // Получаем данные из localStorage
  const savedData = localStorage.getItem("financeTracker");
  let leftEntries = [];
  let rightEntries = [];

  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      leftEntries = data.leftEntries || [];
      rightEntries = data.rightEntries || [];
    } catch (e) {
      console.error("Ошибка при загрузке данных:", e);
    }
  }

  // Суммы
  const totalExpenses = leftEntries.reduce((sum, e) => sum + e.value, 0);
  const totalIncome = rightEntries.reduce((sum, e) => sum + e.value, 0);
  const balance = totalIncome - totalExpenses;

  totalExpensesEl.textContent = totalExpenses.toFixed(2);
  totalIncomeEl.textContent = totalIncome.toFixed(2);
  balanceEl.textContent = balance.toFixed(2);

  // Плавная анимация элементов
  const fadeElements = document.querySelectorAll(".fade-element");
  fadeElements.forEach((el, i) => {
    setTimeout(() => el.classList.add("visible"), i * 150);
  });

  // График
  const ctx = document.getElementById("financeChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Витрати", "Прибутки"],
      datasets: [
        {
          label: "Сума",
          data: [totalExpenses, totalIncome],
          backgroundColor: ["#ff4b5c", "#3a86ff"],
          borderRadius: 12,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.raw.toFixed(2);
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#eaeaea" },
          grid: { color: "#333" },
        },
        x: {
          ticks: { color: "#eaeaea" },
          grid: { color: "#333" },
        },
      },
    },
  });

  // Кнопка назад
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "main.html";
    }
  });
});
