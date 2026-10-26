(() => {
  const grid = document.querySelector("[data-latest-articles]");
  if (!grid) return;

  const limit = Number.parseInt(grid.dataset.latestCount || "4", 10) || 4;
  const blogUrl = new URL("/blog/", window.location.href);

  fetch(blogUrl, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el índice del blog.");
      return response.text();
    })
    .then((html) => {
      const page = new DOMParser().parseFromString(html, "text/html");
      const articles = [...page.querySelectorAll("a[data-blog-card]")]
        .map((card, index) => {
          const time = card.querySelector("time[datetime]");
          const image = card.querySelector("img");
          const heading = card.querySelector("h2, h3");
          const href = card.getAttribute("href");
          if (!time?.dateTime || !image || !heading || !href) return null;

          return {
            index,
            date: time.dateTime,
            dateLabel: time.textContent.trim(),
            category: card.querySelector(".blog-card-category")?.textContent.trim() || "",
            title: heading.textContent.trim(),
            description: card.querySelector("p")?.textContent.trim() || "",
            url: new URL(href, blogUrl),
            image: new URL(image.getAttribute("src"), blogUrl),
            alt: image.getAttribute("alt") || "",
            width: image.getAttribute("width"),
            height: image.getAttribute("height"),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.date.localeCompare(a.date) || a.index - b.index)
        .slice(0, limit);

      if (!articles.length) return;

      const fragment = document.createDocumentFragment();
      for (const article of articles) {
        const link = document.createElement("a");
        link.className = "blog-teaser";
        link.href = article.url.pathname;

        const category = document.createElement("span");
        category.className = "blog-teaser-category";
        category.textContent = article.category.toLocaleUpperCase("es");

        const date = document.createElement("time");
        date.className = "blog-teaser-date";
        date.dateTime = article.date;
        date.textContent = article.dateLabel;

        const story = document.createElement("div");
        story.className = "blog-teaser-story";
        const image = document.createElement("img");
        image.src = article.image.pathname;
        image.alt = article.alt;
        image.loading = "lazy";
        image.decoding = "async";
        if (article.width) image.width = Number(article.width);
        if (article.height) image.height = Number(article.height);

        const heading = document.createElement("h3");
        heading.textContent = article.title;
        story.append(image, heading);

        link.append(category, date, story);
        if (article.description) {
          const description = document.createElement("p");
          description.textContent = article.description;
          link.append(description);
        }

        const action = document.createElement("span");
        action.className = "blog-teaser-action";
        action.append(document.createTextNode("Leer artículo "));
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        action.append(arrow);
        link.append(action);
        fragment.append(link);
      }

      grid.replaceChildren(fragment);
    })
    .catch(() => {
      // The current newest articles remain available as static HTML if the blog cannot be fetched.
    });
})();
