/* ============================================================
   Resources page — curated links with category filter
   ============================================================ */

(() => {
  const listEl = document.getElementById("resList");
  const emptyEl = document.getElementById("resEmpty");
  const searchEl = document.getElementById("resSearch");
  const pillsEl = document.getElementById("resPills");

  let items = [];
  let activeCat = "all";
  const CATS = ["dev", "design", "docs", "learn", "other"];
  const ICON_CLASS = { dev: "i1", design: "i2", docs: "i3", learn: "i4", other: "i5" };

  async function load() {
    const data = await API.get("/api/resources");
    items = data || DEMO_RESOURCES;
    renderPills();
    render();
  }

  function renderPills() {
    pillsEl.innerHTML = ["all", ...CATS]
      .map(
        (c) => `
        <button class="pill ${c === activeCat ? "active" : ""}" data-cat="${c}">
          ${I18n.t("resources.cat." + c)}
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
    return items.filter((r) => {
      const catOk = activeCat === "all" || r.category === activeCat;
      const qOk = !q || (r.title + " " + (r.desc || "")).toLowerCase().includes(q);
      return catOk && qOk;
    });
  }

  function render() {
    const arr = filtered();
    emptyEl.classList.toggle("hide", arr.length > 0);
    listEl.innerHTML = arr
      .map(
        (r, i) => `
        <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="card res-card reveal">
          <div class="res-icon ${ICON_CLASS[r.category] || "i5"}">${escapeHtml((r.title || "R")[0].toUpperCase())}</div>
          <span class="res-cat">${I18n.t("resources.cat." + (r.category || "other"))}</span>
          <h3>${escapeHtml(r.title)}</h3>
          <p>${escapeHtml(r.desc || "")}</p>
          <span class="link-more">${I18n.t("resources.open")} →</span>
        </a>`
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
  }

  searchEl.addEventListener("input", render);
  document.addEventListener("langchange", () => {
    renderPills();
    render();
  });

  load();
  bootPage();
})();