// account.js - Повний код для сторінки акаунта українською мовою

// Обробник кнопки виходу
document.getElementById("logoutBtn").addEventListener("click", function () {
  if (confirm("Ви впевнені, що хочете вийти?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
});

// Обробник кнопки назад
document.getElementById("backBtn").addEventListener("click", function () {
  window.location.href = "main.html";
});

// Завантаження даних користувача при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function () {
  loadUserData();
  loadAccountStats();
  setupEventListeners();
});

// Завантаження даних користувача
function loadUserData() {
  // Отримуємо ім'я користувача з localStorage (з index.html)
  const users = Object.keys(localStorage);
  const currentUser = users.find(
    (user) => user !== "currentUser" && user !== "settings"
  );

  if (currentUser) {
    document.getElementById("profileName").textContent = currentUser;
    document.getElementById(
      "profileEmail"
    ).textContent = `${currentUser}@example.com`;
  }
}

// Завантаження статистики акаунта
function loadAccountStats() {
  // Отримуємо дані з localStorage
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const income = JSON.parse(localStorage.getItem("income")) || [];

  // Розраховуємо загальні суми
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Оновлюємо відображення статистики
  document.getElementById("totalBalance").textContent = `${totalBalance.toFixed(
    2
  )} ₴`;
  document.getElementById("totalIncome").textContent = `${totalIncome.toFixed(
    2
  )} ₴`;
  document.getElementById(
    "totalExpenses"
  ).textContent = `${totalExpenses.toFixed(2)} ₴`;
}

// Налаштування обробників подій
function setupEventListeners() {
  // Кнопка редагування профілю
  document
    .querySelector(".edit-profile-btn")
    .addEventListener("click", function () {
      editProfile();
    });

  // Кнопки налаштувань
  const settingActions = document.querySelectorAll(".setting-action");
  settingActions.forEach((button) => {
    button.addEventListener("click", function () {
      const settingTitle =
        this.closest(".setting-item").querySelector(
          ".setting-title"
        ).textContent;
      handleSettingAction(settingTitle);
    });
  });

  // Кнопки керування даними
  document.querySelector(".export-btn").addEventListener("click", exportData);
  document.querySelector(".import-btn").addEventListener("click", importData);
  document.querySelector(".clear-btn").addEventListener("click", clearData);
}

// Редагування профілю
function editProfile() {
  const currentName = document.getElementById("profileName").textContent;
  const currentEmail = document.getElementById("profileEmail").textContent;

  const newName = prompt("Введіть нове ім'я:", currentName);
  if (newName && newName.trim() !== "") {
    document.getElementById("profileName").textContent = newName.trim();

    // Оновлюємо email на основі нового імені
    const newEmail = `${newName.trim().toLowerCase()}@example.com`;
    document.getElementById("profileEmail").textContent = newEmail;

    alert("Профіль успішно оновлено!");
  }
}

// Обробка дій налаштувань
function handleSettingAction(settingTitle) {
  switch (settingTitle) {
    case "Особиста інформація":
      editPersonalInfo();
      break;
    case "Безпека":
      changePassword();
      break;
    case "Сповіщення":
      configureNotifications();
      break;
    case "Мова та валюта":
      changeLanguageCurrency();
      break;
    default:
      alert(`Функція "${settingTitle}" в розробці`);
  }
}

// Зміна особистої інформації
function editPersonalInfo() {
  const currentName = document.getElementById("profileName").textContent;
  const newName = prompt("Введіть нове ім'я користувача:", currentName);

  if (newName && newName.trim() !== "" && newName !== currentName) {
    // Оновлюємо дані в localStorage (якщо потрібно)
    updateUserName(currentName, newName.trim());

    document.getElementById("profileName").textContent = newName.trim();
    document.getElementById("profileEmail").textContent = `${newName
      .trim()
      .toLowerCase()}@example.com`;

    alert("Особисту інформацію оновлено!");
  }
}

// Оновлення імені користувача в localStorage
function updateUserName(oldName, newName) {
  // Отримуємо пароль старого користувача
  const oldPassword = localStorage.getItem(oldName);

  if (oldPassword) {
    // Створюємо запис з новим іменем
    localStorage.setItem(newName, oldPassword);

    // Видаляємо старий запис
    localStorage.removeItem(oldName);

    // Оновлюємо поточного користувача якщо він активний
    if (localStorage.getItem("currentUser") === oldName) {
      localStorage.setItem("currentUser", newName);
    }
  }
}

// Зміна пароля
function changePassword() {
  const users = Object.keys(localStorage);
  const currentUser = users.find(
    (user) => user !== "currentUser" && user !== "settings"
  );

  if (currentUser) {
    const currentPassword = localStorage.getItem(currentUser);
    const oldPassword = prompt("Введіть поточний пароль:");

    if (oldPassword === currentPassword) {
      const newPassword = prompt("Введіть новий пароль:");
      if (newPassword && newPassword.trim() !== "") {
        const confirmPassword = prompt("Повторіть новий пароль:");

        if (newPassword === confirmPassword) {
          localStorage.setItem(currentUser, newPassword);
          alert("Пароль успішно змінено!");
        } else {
          alert("Паролі не співпадають!");
        }
      }
    } else {
      alert("Невірний поточний пароль!");
    }
  }
}

// Налаштування сповіщень
function configureNotifications() {
  const notifications = {
    email: confirm("Увімкнути email сповіщення?"),
    push: confirm("Увімкнути push сповіщення?"),
    sms: confirm("Увімкнути SMS сповіщення?"),
  };

  // Зберігаємо налаштування сповіщень
  localStorage.setItem("notificationSettings", JSON.stringify(notifications));

  let enabledNotifications = [];
  if (notifications.email) enabledNotifications.push("Email");
  if (notifications.push) enabledNotifications.push("Push");
  if (notifications.sms) enabledNotifications.push("SMS");

  if (enabledNotifications.length > 0) {
    alert(`Сповіщення увімкнено: ${enabledNotifications.join(", ")}`);
  } else {
    alert("Усі сповіщення вимкнено");
  }
}

// Зміна мови та валюти
function changeLanguageCurrency() {
  const language = prompt("Введіть мову (uk, ru, en):", "uk");
  const currency = prompt("Введіть валюту (UAH, USD, EUR):", "UAH");

  if (language && currency) {
    const settings = {
      language: language.toUpperCase(),
      currency: currency.toUpperCase(),
    };

    localStorage.setItem("userSettings", JSON.stringify(settings));
    alert(
      `Налаштування збережено: Мова - ${settings.language}, Валюта - ${settings.currency}`
    );
  }
}

// Експорт даних
function exportData() {
  const userData = {
    expenses: JSON.parse(localStorage.getItem("expenses")) || [],
    income: JSON.parse(localStorage.getItem("income")) || [],
    settings: JSON.parse(localStorage.getItem("userSettings")) || {},
    exportDate: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  // Створюємо посилання для завантаження
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financial_data_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert("Дані успішно експортовано!");
}

// Імпорт даних
function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const importedData = JSON.parse(e.target.result);

          if (confirm("Замінити поточні дані імпортованими?")) {
            if (importedData.expenses) {
              localStorage.setItem(
                "expenses",
                JSON.stringify(importedData.expenses)
              );
            }
            if (importedData.income) {
              localStorage.setItem(
                "income",
                JSON.stringify(importedData.income)
              );
            }
            if (importedData.settings) {
              localStorage.setItem(
                "userSettings",
                JSON.stringify(importedData.settings)
              );
            }

            alert("Дані успішно імпортовано!");
            loadAccountStats(); // Оновлюємо статистику
          }
        } catch (error) {
          alert("Помилка при імпорті даних: невірний формат файлу");
        }
      };
      reader.readAsText(file);
    }
  };

  input.click();
}

// Очищення даних
function clearData() {
  if (confirm("УВАГА! Ця дія видалить усі ваші фінансові дані. Продовжити?")) {
    if (confirm("Ви впевнені? Цю дію не можна скасувати!")) {
      localStorage.removeItem("expenses");
      localStorage.removeItem("income");
      localStorage.removeItem("userSettings");
      localStorage.removeItem("notificationSettings");

      alert("Усі дані успішно очищено!");
      loadAccountStats(); // Оновлюємо статистику
    }
  }
}

// Завантаження та застосування користувацьких налаштувань
function loadUserSettings() {
  const settings = JSON.parse(localStorage.getItem("userSettings")) || {};

  if (settings.language) {
    console.log("Мова встановлена:", settings.language);
  }

  if (settings.currency) {
    console.log("Валюта встановлена:", settings.currency);
  }
}

// Ініціалізація при завантаженні
loadUserSettings();
