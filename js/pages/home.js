/* ============================================================
   Home page — typewriter, count-up stats, recent posts
   ============================================================ */

(() => {
  /* ---------- Typewriter ---------- */
  const target = document.getElementById("typeTarget");
  if (target) {
    let roles = I18N.zh["home.roles"];
    let idx = 0;
    let char = 0;
    let deleting = false;
    let timer = null;

    function tick() {
      if (!document.querySelector("body")) return;
      const word = roles[idx];
      if (!deleting) {
        char++;
        target.textContent = word.slice(0, char);
        if (char === word.length) {
          deleting = true;
          timer = setTimeout(tick, 2200);
          return;
        }
        timer = setTimeout(tick, 90);
      } else {
        char--;
        target.textContent = word.slice(0, char);
        if (char === 0) {
          deleting = false;
          idx = (idx + 1) % roles.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 45);
      }
    }

    function restart() {
      clearTimeout(timer);
      roles = I18n.t("home.roles");
      if (!Array.isArray(roles)) roles = I18N.zh["home.roles"];
      target.textContent = "";
      char = 0;
      idx = 0;
      deleting = false;
      tick();
    }

    document.addEventListener("langchange", restart);
    restart();
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll(".count");
  const animate = (el) => {
    const targetNum = Number(el.dataset.target) || 0;
    const dur = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(targetNum * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          animate(en.target);
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => io.observe(c));

  /* ---------- Recent posts ---------- */
  const container = document.getElementById("recentPosts");

  async function loadRecent() {
    const list = (await API.get("/api/posts")) || DEMO_POSTS;
    if (container && list.length > 0) {
      const c = document.querySelectorAll(".stat .count");
      if (c[0]) {
        c[0].dataset.target = list.length;
        animate(c[0]);
      }
    }
    if (!container) return;
    const recent = list.slice(0, 3);
    container.innerHTML = recent
      .map(
        (p) => `
        <article class="card post-card reveal">
          <span class="post-tag t${(p.tag ? p.tag.length : 1) % 4 + 1}">${escapeHtml(p.tag || "note")}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <div class="post-meta">
            <span>${formatDate(p.date, I18n.current)}</span>
          </div>
          <p class="post-excerpt">${escapeHtml((p.excerpt || "").slice(0, 90))}</p>
        </article>`
      )
      .join("");

    const cards = container.querySelectorAll(".card");
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io2.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    cards.forEach((el) => io2.observe(el));

    document.addEventListener("langchange", () => {
      container.querySelectorAll(".post-meta span").forEach((el, i) => {
        el.textContent = formatDate(recent[i].date, I18n.current);
      });
    });
  }

  loadRecent();
  bootPage();
})();
