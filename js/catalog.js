const tableBody = document.getElementById("productTableBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const resultsCount = document.getElementById("resultsCount");
const catalogMessage = document.getElementById("catalogMessage");
const pagination = document.getElementById("pagination");

const productsPerPage = 10;

let products = [];
let currentPage = 1;

const urlParams = new URLSearchParams(window.location.search);
const categoryFromUrl = urlParams.get("category");

if (categoryFromUrl === "medicines" || categoryFromUrl === "devices") {
  categoryFilter.value = categoryFromUrl;
}
async function loadProducts() {
  try {
    const [medicinesResponse, devicesResponse] = await Promise.all([
      fetch("data/medicines.json"),
      fetch("data/devices.json"),
    ]);

    if (!medicinesResponse.ok || !devicesResponse.ok) {
      throw new Error("Не вдалося завантажити дані каталогу.");
    }

    const medicines = await medicinesResponse.json();
    const devices = await devicesResponse.json();

    products = [...medicines, ...devices];

    renderCatalog();
  } catch (error) {
    resultsCount.textContent = "";
    catalogMessage.textContent =
      "Не вдалося завантажити товари. Запустіть сайт через локальний вебсервер.";
    console.error(error);
  }
}

function getFilteredProducts() {
  const searchText = searchInput.value.trim().toLocaleLowerCase("uk");
  const selectedCategory = categoryFilter.value;

  const categoryNames = {
    medicines: "Лікарські засоби",
    devices: "Вироби медичного призначення",
  };
  const sortOrder = sortSelect.value;

  return products
    .filter((product) => {
      const matchesName = product.name
        .toLocaleLowerCase("uk")
        .includes(searchText);

      const matchesCategory =
        !selectedCategory ||
        product.category === categoryNames[selectedCategory];

      return matchesName && matchesCategory;
    })
    .sort((a, b) => {
      const result = a.name.localeCompare(b.name, "uk");
      return sortOrder === "asc" ? result : -result;
    });
}

function renderCatalog() {
  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }

  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  tableBody.replaceChildren();
  pagination.replaceChildren();
  catalogMessage.textContent = "";

  resultsCount.textContent = `Знайдено товарів: ${filteredProducts.length}`;

  if (filteredProducts.length === 0) {
    catalogMessage.textContent = "За вашим запитом товарів не знайдено.";
    return;
  }

  visibleProducts.forEach((product) => {
    const row = document.createElement("tr");

    [
      product.name,
      product.category,
      product.form,
      product.dosage,
      product.unit,
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    return;
  }

  const previousButton = createPageButton(
    "← Назад",
    currentPage - 1,
    currentPage === 1
  );

  pagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const button = createPageButton(String(page), page, false);

    if (page === currentPage) {
      button.classList.add("current-page");
      button.setAttribute("aria-current", "page");
    }

    pagination.appendChild(button);
  }

  const nextButton = createPageButton(
    "Далі →",
    currentPage + 1,
    currentPage === totalPages
  );

  pagination.appendChild(nextButton);
}

function createPageButton(label, page, disabled) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;

  button.addEventListener("click", () => {
    currentPage = page;
    renderCatalog();
  });

  return button;
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderCatalog();
});

categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  renderCatalog();
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  renderCatalog();
});

loadProducts();
