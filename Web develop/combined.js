document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => document.body.classList.add("ui-loaded"), 20);

  const digitsEl = document.getElementById("digits");
  const expensesBtn = document.getElementById("expensesBtn");
  const incomeBtn = document.getElementById("incomeBtn");
  const inputPanel = document.getElementById("inputPanel");
  const amountInput = document.getElementById("amountInput");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const leftList = document.getElementById("leftList");
  const rightList = document.getElementById("rightList");
  const leftTotalEl = document.getElementById("leftTotal");
  const rightTotalEl = document.getElementById("rightTotal");
  const leftProgressEl = document.getElementById("leftProgress");
  const rightProgressEl = document.getElementById("rightProgress");
  const panelCircleValueEl = document.getElementById("panelCircleValue");
  const panelPreviewTotal = document.getElementById("panelPreviewTotal");
  const panelEntries = document.getElementById("panelEntries");
  const overlay = document.getElementById("overlay");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const circleProgress = document.querySelector(".circle-progress");
  const circleEl = document.querySelector(".circle");

  // Элементы для курсов
  const usdRateEl = document.getElementById("usdRate");
  const eurRateEl = document.getElementById("eurRate");
  const usdChangeEl = document.getElementById("usdChange");
  const eurChangeEl = document.getElementById("eurChange");
  const lastUpdateEl = document.getElementById("lastUpdate");

  // Элементы для аккаунта
  const accountBtn = document.getElementById("accountBtn");
  const accountPanel = document.getElementById("accountPanel");
  const totalTransactionsEl = document.getElementById("totalTransactions");
  const registrationDateEl = document.getElementById("registrationDate");

  let currentAction = null;
  let leftEntries = [];
  let rightEntries = [];
  let nextEntryId = 1;
  let digitInterval = null;

  const circleLength = 565;
  const MAX_COLUMN_VALUE = 10000;

  // Переменные для хранения предыдущих курсов
  let previousRates = {
    USD: null,
    EUR: null,
  };

  // Загрузка данных из localStorage
  function loadData() {
    const saved = localStorage.getItem("financeTracker");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        leftEntries = data.leftEntries || [];
        rightEntries = data.rightEntries || [];
        nextEntryId = data.nextEntryId || 1;
        console.log("Данные загружены:", { leftEntries, rightEntries });
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
        leftEntries = [];
        rightEntries = [];
        nextEntryId = 1;
      }
    }
  }

  // Сохранение данных в localStorage
  function saveData() {
    const data = {
      leftEntries,
      rightEntries,
      nextEntryId,
    };
    localStorage.setItem("financeTracker", JSON.stringify(data));
    console.log("Данные сохранены:", data);
  }

  // Форматирование чисел с локализацией
  function formatNumber(n) {
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  }

  // Парсинг нескольких чисел из текста
  function parseMultipleNumbers(raw) {
    if (!raw) return [];
    const numbers = raw
      .split(/[\n,; ]+/)
      .map((s) => s.trim().replace(/\s+/g, "").replace(",", "."))
      .filter(Boolean)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n) && n > 0);

    console.log("Распарсенные числа:", numbers);
    return numbers;
  }

  // Валидация ввода
  function validateInput(value) {
    const numbers = parseMultipleNumbers(value);
    return numbers.length > 0 && numbers.every((n) => n > 0);
  }

  // Получение сумм
  function getSums() {
    const leftSum = leftEntries.reduce((s, e) => s + e.value, 0);
    const rightSum = rightEntries.reduce((s, e) => s + e.value, 0);
    console.log("Суммы:", { leftSum, rightSum });
    return { leftSum, rightSum };
  }

  // Форматирование значения для круга
  function formatCircleValue(val) {
    const intVal = Math.round(val);
    const abs = Math.abs(intVal);
    const s = String(abs).padStart(6, "0");
    const result = (intVal < 0 ? "-" : "") + s;
    console.log("Форматирование круга:", val, "->", result);
    return result;
  }

  // Установка значения круга без анимации
  function setCircleImmediate(val) {
    if (digitInterval) clearInterval(digitInterval);
    const formattedValue = formatCircleValue(val);
    digitsEl.textContent = formattedValue;
    updateCircleProgress(val);
    updateCircleColor(val);
    console.log("Круг обновлен (без анимации):", val);
  }

  // Анимация цифр круга
  function animateCircleDigits(targetValue, duration = 800, tick = 40) {
    if (digitInterval) clearInterval(digitInterval);
    const start = Date.now();

    console.log("Запуск анимации круга:", targetValue);

    digitInterval = setInterval(() => {
      const random = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 10)
      ).join("");
      digitsEl.textContent = random;

      if (Date.now() - start >= duration) {
        clearInterval(digitInterval);
        const finalValue = formatCircleValue(targetValue);
        digitsEl.textContent = finalValue;
        updateCircleProgress(targetValue);
        updateCircleColor(targetValue);
        console.log("Анимация завершена:", finalValue);
      }
    }, tick);
  }

  // Обновление прогресса круга
  function updateCircleProgress(value) {
    const maxVal = 10000;
    let percent = Math.min(Math.abs(value) / maxVal, 1);
    const dashoffset = circleLength * (1 - percent);
    circleProgress.style.strokeDashoffset = dashoffset;
    console.log("Прогресс круга:", value, "->", percent * 100 + "%");
  }

  // Обновление цвета круга
  function updateCircleColor(value) {
    if (value < 0) {
      circleEl.classList.add("negative");
      circleEl.classList.remove("positive");
      console.log("Цвет круга: отрицательный");
    } else {
      circleEl.classList.add("positive");
      circleEl.classList.remove("negative");
      console.log("Цвет круга: положительный");
    }
  }

  // Обновление прогресс-баров колонок
  function updateColumnProgress() {
    const { leftSum, rightSum } = getSums();

    const leftPercent = Math.min((leftSum / MAX_COLUMN_VALUE) * 100, 100);
    const rightPercent = Math.min((rightSum / MAX_COLUMN_VALUE) * 100, 100);

    leftProgressEl.style.width = `${leftPercent}%`;
    rightProgressEl.style.width = `${rightPercent}%`;

    console.log("Прогресс колонок:", { leftPercent, rightPercent });

    // Изменение цвета при приближении к лимиту
    if (leftPercent > 80) {
      leftProgressEl.style.background = "var(--negative)";
    } else {
      leftProgressEl.style.background = "var(--accent)";
    }

    if (rightPercent > 80) {
      rightProgressEl.style.background = "var(--negative)";
    } else {
      rightProgressEl.style.background = "var(--accent)";
    }
  }

  // Обновление всех totals
  function updateTotals({ animate = true } = {}) {
    const { leftSum, rightSum } = getSums();

    console.log("Обновление totals:", { leftSum, rightSum, animate });

    leftTotalEl.textContent = formatNumber(leftSum);
    rightTotalEl.textContent = formatNumber(rightSum);
    const diff = rightSum - leftSum;

    console.log("Разница (баланс):", diff);

    if (animate) {
      animateCircleDigits(diff);
    } else {
      setCircleImmediate(diff);
    }

    updateColumnProgress();
    saveData();
  }

  // Создание элемента списка
  function createListItem(entry, arrayRef, listEl) {
    const li = document.createElement("li");
    li.dataset.id = entry.id;

    const span = document.createElement("span");
    span.textContent = formatNumber(entry.value);
    span.style.flex = "1";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.title = "Удалить запись";
    delBtn.textContent = "❌";
    delBtn.style.background = "none";
    delBtn.style.border = "none";
    delBtn.style.cursor = "pointer";
    delBtn.style.padding = "4px";

    delBtn.addEventListener("click", () => {
      console.log("Удаление записи:", entry);
      const idx = arrayRef.findIndex((e) => e.id === entry.id);
      if (idx !== -1) {
        arrayRef.splice(idx, 1);
        console.log("Запись удалена, новый массив:", arrayRef);
      }
      renderLists();
      updateTotals();
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    listEl.appendChild(li);

    console.log("Создан элемент списка:", entry);
  }

  // Рендер списков
  function renderLists() {
    console.log("Рендер списков:", { leftEntries, rightEntries });

    leftList.innerHTML = "";
    rightList.innerHTML = "";

    leftEntries.forEach((e) => createListItem(e, leftEntries, leftList));
    rightEntries.forEach((e) => createListItem(e, rightEntries, rightList));

    console.log("Списки отрендерены");
  }

  // Быстрое добавление одного числа
  function quickAddNumber(value, action) {
    if (!value || isNaN(value) || value <= 0) {
      console.log("Некорректное значение для быстрого добавления:", value);
      return false;
    }

    const entry = {
      id: nextEntryId++,
      value: value,
      timestamp: new Date().toISOString(),
    };

    if (action === "left") {
      leftEntries.push(entry);
      console.log("Быстро добавлен расход:", entry);
    } else {
      rightEntries.push(entry);
      console.log("Быстро добавлен доход:", entry);
    }

    renderLists();
    updateTotals();
    showStatistics();
    return true;
  }

  // Открытие панели для одного числа
  function openSingleInputPanel(action) {
    console.log("Открытие панели для одного числа:", action);

    currentAction = action;

    // Создаем простую панель для одного числа
    const singleInputHTML = `
      <div class="input-inner">
        <div class="panel-header">
          <div class="panel-title">Ввести ${
            action === "left" ? "расход" : "доход"
          }</div>
        </div>
        
        <input 
          type="number" 
          id="singleAmountInput" 
          placeholder="Введите сумму" 
          min="1" 
          step="0.01"
          aria-label="Сумма"
          style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: var(--panel-bg); color: #eaeaea; font-size: 16px;"
        >
        
        <div class="panel-actions" style="display: flex; gap: 10px; margin-top: 15px;">
          <button id="singleConfirmBtn" type="button" style="flex: 1; padding: 12px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Добавить</button>
          <button id="singleCancelBtn" type="button" style="flex: 1; padding: 12px; background: #666; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Отмена</button>
        </div>
      </div>
    `;

    // Создаем временную панель
    const tempPanel = document.createElement("div");
    tempPanel.className = "input-panel visible";
    tempPanel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 16px 60px rgba(0, 0, 0, 0.6);
      z-index: 2200;
      color: #eaeaea;
      width: 90%;
      max-width: 300px;
    `;
    tempPanel.innerHTML = singleInputHTML;

    document.body.appendChild(tempPanel);
    overlay.classList.add("active");

    const singleAmountInput = document.getElementById("singleAmountInput");
    const singleConfirmBtn = document.getElementById("singleConfirmBtn");
    const singleCancelBtn = document.getElementById("singleCancelBtn");

    // Фокусируемся на поле ввода
    setTimeout(() => singleAmountInput.focus(), 100);

    // Обработчик подтверждения
    singleConfirmBtn.addEventListener("click", () => {
      const value = parseFloat(singleAmountInput.value);
      if (value && value > 0) {
        quickAddNumber(value, action);
        closeSingleInputPanel(tempPanel);
      } else {
        singleAmountInput.style.outline = "2px solid #ff6b6b";
        setTimeout(() => (singleAmountInput.style.outline = ""), 600);
      }
    });

    // Обработчик отмены
    singleCancelBtn.addEventListener("click", () => {
      closeSingleInputPanel(tempPanel);
    });

    // Обработчик клавиши Enter
    singleAmountInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        singleConfirmBtn.click();
      }
    });

    // Закрытие по клику на оверлей
    overlay.addEventListener("click", function closeOverlay(e) {
      if (e.target === overlay) {
        closeSingleInputPanel(tempPanel);
        overlay.removeEventListener("click", closeOverlay);
      }
    });
  }

  // Закрытие панели для одного числа
  function closeSingleInputPanel(panel) {
    if (panel && panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
    overlay.classList.remove("active");
  }

  // Защита от множественных кликов
  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  // Обработка клавиатуры
  function handleKeydown(e) {
    if (e.key === "Escape") {
      // Закрыть все временные панели
      const tempPanels = document.querySelectorAll(".input-panel[style]");
      tempPanels.forEach((panel) => {
        if (panel.parentNode) {
          panel.parentNode.removeChild(panel);
        }
      });

      // Закрыть основную панель ввода
      if (inputPanel.classList.contains("visible")) {
        inputPanel.classList.remove("visible");
        overlay.classList.remove("active");
        setTimeout(() => inputPanel.classList.add("hidden"), 280);
      }

      // Закрыть панель настроек
      if (settingsPanel.classList.contains("open")) {
        settingsPanel.classList.remove("open");
        overlay.classList.remove("active");
      }

      // Закрыть панель аккаунта
      if (accountPanel && accountPanel.classList.contains("open")) {
        accountPanel.classList.remove("open");
        overlay.classList.remove("active");
      }

      overlay.classList.remove("active");
    }
  }

  // Показать статистику
  function showStatistics() {
    const { leftSum, rightSum } = getSums();
    const savings = rightSum - leftSum;
    const savingsPercent = rightSum > 0 ? (savings / rightSum) * 100 : 0;

    console.log(`=== СТАТИСТИКА ===`);
    console.log(`Расходы: ${formatNumber(leftSum)}`);
    console.log(`Доходы: ${formatNumber(rightSum)}`);
    console.log(
      `Сбережения: ${formatNumber(savings)} (${savingsPercent.toFixed(1)}%)`
    );
    console.log(`Записей расходов: ${leftEntries.length}`);
    console.log(`Записей доходов: ${rightEntries.length}`);
    console.log(`================`);
  }

  // Функция для обновления статистики аккаунта
  function updateAccountStats() {
    if (totalTransactionsEl) {
      const totalTransactions = leftEntries.length + rightEntries.length;
      totalTransactionsEl.textContent = totalTransactions;
    }

    if (registrationDateEl) {
      const savedRegDate = localStorage.getItem("registrationDate");
      if (savedRegDate) {
        registrationDateEl.textContent = new Date(
          savedRegDate
        ).toLocaleDateString("ru-RU");
      } else {
        const regDate = new Date().toISOString();
        localStorage.setItem("registrationDate", regDate);
        registrationDateEl.textContent = new Date().toLocaleDateString("ru-RU");
      }
    }
  }

  // === КУРСЫ ВАЛЮТ ===

  // Функция для получения курсов валют
  async function fetchExchangeRates() {
    try {
      console.log("Получение курсов валют...");

      // Используем бесплатный API с fallback
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/UAH"
      );

      if (!response.ok) {
        throw new Error("Ошибка получения курсов");
      }

      const data = await response.json();
      console.log("Данные курсов:", data);

      if (data.rates && data.rates.USD && data.rates.EUR) {
        // Поскольку API возвращает курс относительно UAH, нам нужно инвертировать
        const usdRate = (1 / data.rates.USD).toFixed(2);
        const eurRate = (1 / data.rates.EUR).toFixed(2);

        // Обновляем отображение
        updateRatesDisplay(usdRate, eurRate);
        saveRatesToStorage(usdRate, eurRate);
      } else {
        throw new Error("Некорректные данные курсов");
      }
    } catch (error) {
      console.error("Ошибка при получении курсов:", error);
      // Используем сохраненные данные или заглушки
      loadRatesFromStorage();
    }
  }

  // Обновление отображения курсов
  function updateRatesDisplay(usdRate, eurRate) {
    // USD
    usdRateEl.textContent = usdRate;
    updateRateChange("USD", usdRate, usdChangeEl);

    // EUR
    eurRateEl.textContent = eurRate;
    updateRateChange("EUR", eurRate, eurChangeEl);

    // Время обновления
    const now = new Date();
    lastUpdateEl.textContent = now.toLocaleTimeString("ru-RU");

    // Сохраняем текущие курсы как предыдущие для следующего сравнения
    previousRates.USD = parseFloat(usdRate);
    previousRates.EUR = parseFloat(eurRate);
  }

  // Обновление индикатора изменения
  function updateRateChange(currency, currentRate, changeElement) {
    const current = parseFloat(currentRate);
    const previous = previousRates[currency];

    if (previous === null) {
      // Первое обновление
      changeElement.textContent = "новый";
      changeElement.className = "rate-change neutral";
      return;
    }

    const change = current - previous;
    const changePercent = ((change / previous) * 100).toFixed(2);

    if (change > 0.01) {
      // Небольшой порог для изменений
      changeElement.textContent = `+${changePercent}%`;
      changeElement.className = "rate-change positive";
    } else if (change < -0.01) {
      changeElement.textContent = `${changePercent}%`;
      changeElement.className = "rate-change negative";
    } else {
      changeElement.textContent = "0%";
      changeElement.className = "rate-change neutral";
    }
  }

  // Сохранение курсов в localStorage
  function saveRatesToStorage(usdRate, eurRate) {
    const ratesData = {
      usd: usdRate,
      eur: eurRate,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("exchangeRates", JSON.stringify(ratesData));
  }

  // Загрузка курсов из localStorage
  function loadRatesFromStorage() {
    const saved = localStorage.getItem("exchangeRates");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const now = new Date().getTime();
        const hoursDiff = (now - data.timestamp) / (1000 * 60 * 60);

        // Если данные старше 6 часов, показываем но обновляем
        if (hoursDiff < 6) {
          updateRatesDisplay(data.usd, data.eur);
          console.log("Курсы загружены из кэша");
        } else {
          // Показываем устаревшие данные
          usdRateEl.textContent = data.usd;
          eurRateEl.textContent = data.eur;
          usdChangeEl.textContent = "устар.";
          eurChangeEl.textContent = "устар.";
          usdChangeEl.className = "rate-change neutral";
          eurChangeEl.className = "rate-change neutral";
          console.log("Показаны устаревшие курсы");
        }
      } catch (e) {
        console.error("Ошибка загрузки курсов из хранилища:", e);
        showFallbackRates();
      }
    } else {
      showFallbackRates();
    }
  }

  // Заглушки если API не работает
  function showFallbackRates() {
    usdRateEl.textContent = "39.50";
    eurRateEl.textContent = "42.80";
    usdChangeEl.textContent = "нет дан.";
    eurChangeEl.textContent = "нет дан.";
    usdChangeEl.className = "rate-change neutral";
    eurChangeEl.className = "rate-change neutral";
    lastUpdateEl.textContent = "--:--";
  }

  // Инициализация курсов валют
  function initExchangeRates() {
    console.log("Инициализация курсов валют");

    // Сначала показываем сохраненные данные
    loadRatesFromStorage();

    // Затем обновляем из API
    fetchExchangeRates();

    // Обновляем каждые 30 минут
    setInterval(fetchExchangeRates, 30 * 60 * 1000);
  }

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===

  // Кнопки расходов/доходов
  expensesBtn.addEventListener(
    "click",
    debounce(() => {
      openSingleInputPanel("left");
    })
  );

  incomeBtn.addEventListener(
    "click",
    debounce(() => {
      openSingleInputPanel("right");
    })
  );

  // Кнопка аккаунта
  accountBtn.addEventListener("click", () => {
    window.location.href = "account.html";
  });

  // Кнопки панели ввода
  cancelBtn.addEventListener("click", () => {
    inputPanel.classList.remove("visible");
    overlay.classList.remove("active");
    setTimeout(() => inputPanel.classList.add("hidden"), 280);
  });

  // Оверлей
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      if (settingsPanel.classList.contains("open")) {
        settingsPanel.classList.remove("open");
      }

      if (accountPanel && accountPanel.classList.contains("open")) {
        accountPanel.classList.remove("open");
      }

      // Закрыть все временные панели
      const tempPanels = document.querySelectorAll(".input-panel[style]");
      tempPanels.forEach((panel) => {
        if (panel.parentNode) {
          panel.parentNode.removeChild(panel);
        }
      });

      // Закрыть основную панель ввода
      if (inputPanel.classList.contains("visible")) {
        inputPanel.classList.remove("visible");
        setTimeout(() => inputPanel.classList.add("hidden"), 280);
      }

      overlay.classList.remove("active");
    }
  });

  // Ввод текста
  amountInput.addEventListener("input", () => {
    const numbers = parseMultipleNumbers(amountInput.value);
    panelEntries.innerHTML = "";

    numbers.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = formatNumber(n);
      panelEntries.appendChild(li);
    });

    const total = numbers.reduce((s, n) => s + n, 0);
    panelPreviewTotal.textContent = formatNumber(total);

    console.log("Предпросмотр ввода:", { numbers, total });
  });

  // Подтверждение ввода
  confirmBtn.addEventListener("click", () => {
    console.log("Подтверждение ввода, действие:", currentAction);
    console.log("Введенный текст:", amountInput.value);

    if (!validateInput(amountInput.value)) {
      console.log("Валидация не пройдена");
      amountInput.classList.add("invalid");
      setTimeout(() => amountInput.classList.remove("invalid"), 600);
      return;
    }

    const numbers = parseMultipleNumbers(amountInput.value);
    console.log("Добавление чисел:", numbers, "в", currentAction);

    numbers.forEach((val) => {
      const entry = {
        id: nextEntryId++,
        value: val,
        timestamp: new Date().toISOString(),
      };

      if (currentAction === "left") {
        leftEntries.push(entry);
        console.log("Добавлен расход:", entry);
      } else {
        rightEntries.push(entry);
        console.log("Добавлен доход:", entry);
      }
    });

    console.log("Обновленные массивы:", { leftEntries, rightEntries });

    renderLists();
    updateTotals();

    // Закрываем панель
    inputPanel.classList.remove("visible");
    overlay.classList.remove("active");
    setTimeout(() => inputPanel.classList.add("hidden"), 280);

    showStatistics();
  });

  // Панель настроек
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

  // Глобальная обработка клавиатуры
  document.addEventListener("keydown", handleKeydown);

  // === ИНИЦИАЛИЗАЦИЯ ===
  console.log("=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===");
  loadData();
  renderLists();
  updateTotals({ animate: false });
  initExchangeRates();
  updateAccountStats();

  // Для отладки - добавляем тестовые данные если пусто
  //if (leftEntries.length === 0 && rightEntries.length === 0) {
  //console.log("Добавление тестовых данных");
  //leftEntries = [
  //{ id: nextEntryId++, value: 1500, timestamp: new Date().toISOString() },
  //{ id: nextEntryId++, value: 2300, timestamp: new Date().toISOString() },
  //];
  //rightEntries = [
  //{ id: nextEntryId++, value: 5000, timestamp: new Date().toISOString() },
  //{ id: nextEntryId++, value: 3200, timestamp: new Date().toISOString() },
  //];
  //renderLists();
  //updateTotals({ animate: false });
  //}

  console.log("Инициализация завершена");

  // Делаем функции глобальными для отладки
  window.showStatistics = showStatistics;
  window.clearData = function () {
    leftEntries = [];
    rightEntries = [];
    nextEntryId = 1;
    localStorage.removeItem("financeTracker");
    renderLists();
    updateTotals({ animate: false });
    console.log("Данные очищены");
  };
});
