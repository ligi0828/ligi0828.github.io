/* ============================================================
   Files page — browse the files of the GitHub Pages repository
   (lists https://github.com/ligi0828/ligi0828.github.io root)
   ============================================================ */

(() => {
  const REPO = "ligi0828/ligi0828.github.io";
  const BRANCHES = ["main", "master"];

  const listEl = document.getElementById("fileList");
  const spinner = document.getElementById("fileSpinner");
  const emptyEl = document.getElementById("fileEmpty");
  const searchEl = document.getElementById("fileSearch");
  const pathBarEl = document.getElementById("filePathBar");

  let entries = [];
  let currentPath = "";
  let branch = null;

  function iconFor(name, isDir) {
    if (isDir) return ["folder", "DIR"];
    const ext = name.split(".").pop().toLowerCase();
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return ["zip", "ZIP"];
    if (ext === "pdf") return ["pdf", "PDF"];
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext)) return ["img", "IMG"];
    if (["doc", "docx", "txt", "md", "rtf"].includes(ext)) return ["doc", "DOC"];
    if (["js", "ts", "py", "html", "css", "json", "java", "go", "rs", "c", "cpp"].includes(ext))
      return ["code", ext.toUpperCase()];
    if (["mp4", "mp3", "wav", "flac", "mkv", "avi"].includes(ext)) return ["other", "MED"];
    return ["other", ext.slice(0, 3).toUpperCase()];
  }

  async function fetchDir(path) {
    const tries = branch ? [branch] : BRANCHES;
    for (const b of tries) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${path}?ref=${b}`
        );
        if (res.status === 404 && !branch) continue;
        if (!res.ok) return null;
        branch = b;
        return await res.json();
      } catch {
        return null;
      }
    }
    return null;
  }

  function renderBreadcrumb() {
    const parts = currentPath ? currentPath.split("/") : [];
    const segs = [{ label: "ligi0828.github.io", path: "" }];
    let acc = "";
    parts.forEach((p) => {
      acc = acc ? acc + "/" + p : p;
      segs.push({ label: p, path: acc });
    });
    pathBarEl.innerHTML = segs
      .map(
        (s, i) =>
          `<button class="pill ${i === segs.length - 1 ? "active" : ""}" data-path="${escapeHtml(s.path)}">${escapeHtml(s.label)}</button>`
      )
      .join("");
    pathBarEl.querySelectorAll(".pill").forEach((btn) => {
      btn.addEventListener("click", () => openDir(btn.dataset.path));
    });
  }

  function render() {
    const q = (searchEl.value || "").trim().toLowerCase();
    const arr = entries.filter((f) => !q || f.name.toLowerCase().includes(q));
    emptyEl.classList.toggle("hide", arr.length > 0);
    listEl.innerHTML = arr
      .map((f) => {
        const isDir = f.type === "dir";
        const [cls, label] = iconFor(f.name, isDir);
        const meta = isDir ? "DIR" : formatBytes(f.size || 0);
        const action = isDir
          ? `<button class="btn btn-primary btn-sm" data-open="${escapeHtml(f.path)}" data-i18n="files.open">打开</button>`
          : `<a class="btn btn-primary btn-sm" href="${f.download_url || ""}" download data-i18n="files.download">下载</a>`;
        return `
        <div class="card file-row reveal">
          <div class="file-icon ${cls}">${label}</div>
          <div class="file-info">
            <div class="file-name">${escapeHtml(f.name)}</div>
            <div class="file-meta">${meta}</div>
          </div>
          ${action}
        </div>`;
      })
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
      { threshold: 0.05 }
    );
    listEl.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    listEl.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openDir(btn.dataset.open));
    });

    I18n.apply();
  }

  async function openDir(path) {
    currentPath = path;
    renderBreadcrumb();
    spinner.classList.remove("hide");
    const data = await fetchDir(path);
    spinner.classList.add("hide");
    if (!data) {
      emptyEl.classList.remove("hide");
      const note = document.createElement("div");
      note.className = "empty";
      note.style.padding = "14px";
      note.textContent = I18n.t("files.offline");
      listEl.appendChild(note);
      return;
    }
    entries = Array.isArray(data) ? data : [];
    entries.sort((a, b) => {
      if ((a.type === "dir") !== (b.type === "dir")) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    render();
  }

  searchEl.addEventListener("input", render);
  document.addEventListener("langchange", () => {
    renderBreadcrumb();
    render();
  });

  openDir("");
  bootPage();
})();
