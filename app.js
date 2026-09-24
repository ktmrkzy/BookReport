const state = { books: [], category: "all", query: "" };

const grid = document.querySelector("#book-grid");
const filters = document.querySelector("#filters");
const count = document.querySelector("#book-count");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const renderFilters = () => {
  const categories = ["all", ...new Set(state.books.map((book) => book.category))];
  filters.innerHTML = categories.map((category) => `
    <button class="filter-button" type="button" data-category="${escapeHtml(category)}" aria-pressed="${state.category === category}">
      ${category === "all" ? "すべて" : escapeHtml(category)}
    </button>
  `).join("");
};

const renderBooks = () => {
  const normalizedQuery = state.query.trim().toLowerCase();
  const visibleBooks = state.books.filter((book) => {
    const matchesCategory = state.category === "all" || book.category === state.category;
    const searchable = `${book.title} ${book.author} ${book.excerpt}`.toLowerCase();
    return matchesCategory && searchable.includes(normalizedQuery);
  });

  count.textContent = visibleBooks.length;
  emptyState.hidden = visibleBooks.length !== 0;
  grid.innerHTML = visibleBooks.map((book, index) => `
    <article class="book-card">
      <div class="card-meta">
        <span class="card-category">${escapeHtml(book.category)}</span>
        <span class="card-number">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3>${escapeHtml(book.title)}</h3>
      <p class="author">${escapeHtml(book.author)}</p>
      <blockquote>${escapeHtml(book.excerpt)}</blockquote>
      <details>
        <summary>レビューを読む</summary>
        <p class="review">${escapeHtml(book.review)}</p>
      </details>
      <a class="book-link" href="${escapeHtml(book.url)}" target="_blank" rel="noreferrer">出版社サイトを見る ↗</a>
    </article>
  `).join("");
};

const setupEvents = () => {
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
    renderBooks();
  });

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderBooks();
  });
};

const initialize = async () => {
  try {
    const response = await fetch("data/books.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.books = (await response.json()).sort((firstBook, secondBook) => firstBook.titleKana.localeCompare(secondBook.titleKana, "ja"));
    renderFilters();
    renderBooks();
    setupEvents();
  } catch (error) {
    grid.innerHTML = "<p class=\"empty-state\">書籍データを読み込めませんでした。ローカルサーバーで開いてください。</p>";
    console.error(error);
  }
};

initialize();