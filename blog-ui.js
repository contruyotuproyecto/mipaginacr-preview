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
    const cards = [...document.querySelectorAll("[data-blog-card]")];
    const filters = [...controls.querySelectorAll("[data-blog-filter]")];
    const empty = document.querySelector("[data-blog-empty]");
    const params = new URLSearchParams(location.search);
    const topics = new Set(filters.map((button) => button.dataset.blogFilter));
    let topic = topics.has(params.get("tema")) ? params.get("tema") : "all";

    controls.hidden = false;
    function render() {
      let found = 0;
      for (const card of cards) {
        const show = topic === "all" || card.dataset.blogTopic === topic;
        card.hidden = !show;
        if (show) found++;
      }
      featured.hidden = !featured.querySelector("[data-blog-card]:not([hidden])");
      archive.hidden = !archive.querySelector("[data-blog-card]:not([hidden])");
      empty.hidden = found > 0;
      filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.blogFilter === topic)));
    }
    filters.forEach((button) => button.addEventListener("click", () => {
      topic = button.dataset.blogFilter;
      const url = new URL(location.href);
      if (topic === "all") url.searchParams.delete("tema");
      else url.searchParams.set("tema", topic);
      history.replaceState(null, "", url);
      render();
    }));
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
