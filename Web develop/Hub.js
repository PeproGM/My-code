window.addEventListener("DOMContentLoaded", () => {
  const materials = [
    { title: "ГРОШІ", link: "service.html" },
    { title: "ФІНАНСОВЕ ПЛАНУВАННЯ", link: "service2.html" },
    { title: "НАДХОДЖЕННЯ", link: "service3.html" },
    { title: "ВИДАТКИ", link: "service4.html" },
    { title: "ПОДАТКИ", link: "service5.html" },
    { title: "ЯК ПРАЦЮЄ ФІНАНСОВА СИСТЕМА", link: "service6.html" },
    { title: "БАНКИ ТА БАНКІВСЬКІ ПОСЛУГИ", link: "service7.html" },
    { title: "ЩО ТАКЕ ВАЛЮТА", link: "service8.html" },
    { title: "ПЛАТЕЖІ ТА ПЛАТІЖНІ СИСТЕМИ", link: "service9.html" },
    { title: "ДЕПОЗИТИ", link: "service10.html" },
    { title: "ВИДИ СТРАХУВАННЯ", link: "service11.html" },
    { title: "ФІНАНСОВА БЕЗПЕКА ТА ШАХРАЙСТВО", link: "service12.html" },
    {
      title: "ЗАХИСТ ПРАВ СПОЖИВАЧІВ ФІНАНСОВИХ ПОСЛУГ",
      link: "service13.html",
    },
  ];

  const grid = document.getElementById("materials-grid");

  // Создание карточек
  materials.forEach((material, index) => {
    const wrap = document.createElement("div");
    wrap.className = "card-wrap";
    wrap.style.setProperty("--i", index);

    wrap.innerHTML = `
      <div class="card" data-material="${index + 1}">
        <span class="badge">${material.title}</span>
        <p class="card__desc">Короткий опис матеріалу...</p>
        <div class="card__actions">
          <a href="${material.link}" class="link">Пройти матеріал</a>
        </div>
      </div>
    `;
    grid.appendChild(wrap);
  });

  const cardWraps = document.querySelectorAll(".card-wrap");

  // Кнопка назад
  document.querySelector(".go-main").addEventListener("click", () => {
    window.location.href = "main.html";
  });

  // ===== Новый способ проверки прохождения =====
  const isCompleted = (index) => {
    return (
      Number(localStorage.getItem(`material_done_${index + 1}`) || 0) === 1
    );
  };

  // ===== Обновление прогресса =====
  const updateProgress = () => {
    const completedMaterials = Array.from(cardWraps).filter((wrap, index) => {
      return isCompleted(index);
    }).length;

    const level = Math.floor(completedMaterials / 10);
    const progress = completedMaterials % 10;

    document.querySelector(
      ".user-progress .level-text"
    ).textContent = `Рівень: ${level}, досвід: ${progress}/10`;

    const progressBar = document.querySelector(
      ".user-progress .level-progress-bar"
    );
    progressBar.style.width = `${(progress / 10) * 100}%`;
  };

  updateProgress();

  // ===== Фильтры "Пройдені / Непройдені" =====
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip, chipIndex) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      cardWraps.forEach((wrap, index) => {
        const completed = isCompleted(index);
        wrap.style.display =
          chipIndex === 0
            ? completed
              ? "block"
              : "none"
            : !completed
            ? "block"
            : "none";
      });
    });
  });

  // ===== Теперь материалы хранятся как material_done_X =====
  cardWraps.forEach((wrap, index) => {
    const link = wrap.querySelector(".link");
    link.addEventListener("click", () => {
      localStorage.setItem(`material_done_${index + 1}`, 1);
      updateProgress();
    });
  });
});
