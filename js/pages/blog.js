/* ============================================================
   Blog page — fetch posts, filter, search, expandable content
   ============================================================ */

(() => {
  const listEl = document.getElementById("blogList");
  const spinner = document.getElementById("blogSpinner");
  const emptyEl = document.getElementById("blogEmpty");
  const searchEl = document.getElementById("blogSearch");
  const pillsEl = document.getElementById("catPills");

  let posts = [];
  let activeCat = "all";
  let offline = false;

  const TAG_CLASS = { life: 1, dev: 2, tutorial: 3, notes: 4 };

  async function load() {
    spinner.classList.remove("hide");
    const data = await API.get("/api/posts");
    posts = data || DEMO_POSTS;
    offline = !data;
    spinner.classList.add("hide");
    renderPills();
    render();
    if (offline) {
      const note = document.createElement("div");
      note.className = "empty";
      note.style.padding = "14px";
      note.textContent = I18n.t("blog.offline");
      listEl.parentNode.insertBefore(note, listEl);
    }
  }

  function renderPills() {
    const cats = ["all", ...new Set(posts.map((p) => p.tag || "notes"))];
    pillsEl.innerHTML = cats
      .map(
        (c) => `
        <button class="pill ${c === activeCat ? "active" : ""}" data-cat="${escapeHtml(c)}">
          ${I18n.t("blog.cat." + c) === "blog.cat." + c ? escapeHtml(c) : escapeHtml(I18n.t("blog.cat." + c))}
        </button>`
      )
      .join("");
    pillsEl.querySelectorAll(".pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCat = btn.dataset.cat;
        pillsEl.querySelectorAll(".pill").forEach((b) => b.classList.toggle("active", b === btn));
        render();
      });
    });
  }

  function filtered() {
    const q = (searchEl.value || "").trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = activeCat === "all" || p.tag === activeCat;
      const qOk =
        !q ||
        (p.title + " " + (p.excerpt || "") + " " + (p.content || "")).toLowerCase().includes(q);
      return catOk && qOk;
    });
  }

  function render() {
    const items = filtered();
    emptyEl.classList.toggle("hide", items.length > 0);
    listEl.innerHTML = items
      .map(
        (p, i) => `
        <article class="card post-card reveal" data-id="${p.id}">
          <span class="post-tag t${TAG_CLASS[p.tag] || (i % 4) + 1}">${escapeHtml(p.tag || "note")}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <div class="post-meta">
            <span data-date="${p.date}">${formatDate(p.date, I18n.current)}</span>
            ${p.tag ? `<span># ${escapeHtml(p.tag)}</span>` : ""}
          </div>
          <p class="post-excerpt">${escapeHtml(p.excerpt || "")}</p>
          <div class="post-body">${renderMarkdown(p.content || "")}</div>
          <button class="btn btn-ghost btn-sm read-btn" style="align-self: flex-start">
            ${I18n.t("blog.read")} ▾
          </button>
        </article>`
      )
      .join("");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    listEl.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    listEl.querySelectorAll(".read-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".post-card");
        const isOpen = card.classList.toggle("open");
        btn.textContent = (isOpen ? I18n.t("blog.collapse") : I18n.t("blog.read")) + (isOpen ? " ▴" : " ▾");
      });
    });
  }

  searchEl.addEventListener("input", render);
  document.addEventListener("langchange", () => {
    renderPills();
    render();
  });

  load();
  bootPage();
})();