(() => {
  const normalize = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();

  const controls = document.querySelector("[data-blog-controls]");
  if (controls) {
    const featured = document.querySelector("[data-blog-featured]");
    const archive = document.querySelector("[data-blog-archive]");
    const featuredGrid = featured.querySelector(".blog-featured-grid");
    const archiveGrid = archive.querySelector(".blog-card-grid");
    const featuredCards = [...featuredGrid.querySelectorAll("[data-blog-card]")];
    const archiveCards = [...archiveGrid.querySelectorAll("[data-blog-card]")];
    const allCards = [...featuredCards, ...archiveCards];
    const filters = [...controls.querySelectorAll("[data-blog-filter]")];
    const searchForm = controls.querySelector("[data-blog-search]");
    const searchInput = controls.querySelector("[data-blog-search-input]");
    const loadMore = archive.querySelector("[data-blog-load-more]");
    const status = document.querySelector("[data-blog-status]");
    const empty = document.querySelector("[data-blog-empty]");
    const archiveTitle = archive.querySelector(".blog-section-heading h2");
    const archiveIntro = archive.querySelector(".blog-section-heading p");
    const params = new URLSearchParams(location.search);
    const validTopics = new Set(filters.map((button) => button.dataset.blogFilter));
    let topic = validTopics.has(params.get("tema")) ? params.get("tema") : "all";
    let query = params.get("q") || "";
    let visibleLimit = 3;
    let filteredLayout = false;

    searchInput.value = query;
    controls.hidden = false;
    status.hidden = false;

    function updateUrl() {
      const url = new URL(location.href);
      if (topic === "all") url.searchParams.delete("tema");
      else url.searchParams.set("tema", topic);
      if (query.trim()) url.searchParams.set("q", query.trim());
      else url.searchParams.delete("q");
      history.replaceState(null, "", url);
    }

    function render() {
      const active = topic !== "all" || query.trim() !== "";
      if (active !== filteredLayout) {
        if (active) archiveGrid.append(...allCards);
        else {
          featuredGrid.append(...featuredCards);
          archiveGrid.append(...archiveCards);
        }
        filteredLayout = active;
      }

      const search = normalize(query);
      const matches = allCards.filter((card) => (
        (topic === "all" || card.dataset.blogTopic === topic)
        && (!search || normalize(card.textContent).includes(search))
      ));
      const archiveMatches = active ? matches : matches.filter((card) => archiveCards.includes(card));
      const visibleArchive = archiveMatches.slice(0, visibleLimit);

      for (const card of allCards) {
        card.hidden = active
          ? !visibleArchive.includes(card)
          : !featuredCards.includes(card) && !visibleArchive.includes(card);
      }

      featured.hidden = active;
      archive.hidden = archiveMatches.length === 0;
      archiveTitle.textContent = active ? "Artículos encontrados" : "Más para leer";
      archiveIntro.textContent = active
        ? "Resultados ordenados del más reciente al más antiguo."
        : "Publicaciones anteriores, de la más reciente a la más antigua.";
      empty.hidden = matches.length !== 0;
      loadMore.hidden = archiveMatches.length <= visibleLimit;
      filters.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.blogFilter === topic));
      });

      const visible = active ? visibleArchive.length : featuredCards.length + visibleArchive.length;
      status.textContent = matches.length === 0
        ? "No hay artículos que coincidan con la búsqueda."
        : `Mostrando ${visible} de ${matches.length} ${matches.length === 1 ? "artículo" : "artículos"}.`;
    }

    filters.forEach((button) => button.addEventListener("click", () => {
      topic = button.dataset.blogFilter;
      visibleLimit = topic === "all" && !query.trim() ? 3 : 6;
      render();
      updateUrl();
    }));
    searchInput.addEventListener("input", () => {
      query = searchInput.value;
      visibleLimit = topic === "all" && !query.trim() ? 3 : 6;
      render();
      updateUrl();
    });
    searchForm.addEventListener("submit", (event) => event.preventDefault());
    loadMore.addEventListener("click", () => {
      visibleLimit += 3;
      render();
    });
    if (topic !== "all" || query.trim()) visibleLimit = 6;
    render();
  }

  const body = document.querySelector(".blog-article-body");
  if (!body) return;

  const readTime = document.querySelector("[data-blog-reading-time]");
  if (readTime) {
    const wordCount = body.textContent.trim().split(/\s+/).filter(Boolean).length;
    readTime.textContent = `${Math.max(1, Math.ceil(wordCount / 220))} min de lectura`;
    readTime.hidden = false;
  }

  const headings = [...body.querySelectorAll(":scope > h2")].filter(
    (heading) => !/^fuentes?(?: oficiales| consultadas)?$/i.test(heading.textContent.trim())
  );
  const image = document.querySelector(".blog-post-image");
  if (headings.length < 4 || !image) return;

  const toc = document.createElement("nav");
  toc.className = "blog-toc";
  toc.setAttribute("aria-label", "Contenido del artículo");
  const title = document.createElement("p");
  title.className = "blog-toc-title";
  title.textContent = "En este artículo";
  const list = document.createElement("ol");
  const usedIds = new Set([...document.querySelectorAll("[id]")].map((node) => node.id));
  for (const heading of headings) {
    if (!heading.id) {
      const base = normalize(heading.textContent).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "seccion";
      let id = base;
      let suffix = 2;
      while (usedIds.has(id)) id = `${base}-${suffix++}`;
      heading.id = id;
    }
    usedIds.add(heading.id);
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
  }
  toc.append(title, list);
  image.insertAdjacentElement("afterend", toc);
})();
