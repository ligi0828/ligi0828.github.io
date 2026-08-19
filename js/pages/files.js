/* ============================================================
   Files page — list & download server files, optional upload
   ============================================================ */

(() => {
  const listEl = document.getElementById("fileList");
  const spinner = document.getElementById("fileSpinner");
  const emptyEl = document.getElementById("fileEmpty");
  const searchEl = document.getElementById("fileSearch");
  const uploadBox = document.getElementById("uploadBox");
  const uploadInput = document.getElementById("uploadInput");
  const uploadBtn = document.getElementById("uploadBtn");

  let files = [];

  function iconFor(name) {
    const ext = name.split(".").pop().toLowerCase();
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return ["zip", "ZIP"];
    if (ext === "pdf") return ["pdf", "PDF"];
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext)) return ["img", "IMG"];
    if (["doc", "docx", "txt", "md", "rtf"].includes(ext)) return ["doc", "DOC"];
    if (["js", "ts", "py", "html", "css", "json", "java", "go", "rs", "c", "cpp"].includes(ext))
      return ["code", ext.toUpperCase()];
    if (["mp4", "mp3", "wav", "flac", "mkv", "avi"].includes(ext)) return ["other", "MED"];
    if (!name.includes(".")) return ["folder", "DIR"];
    return ["other", ext.slice(0, 3).toUpperCase()];
  }

  function render() {
    const q = (searchEl.value || "").trim().toLowerCase();
    const arr = files.filter((f) => !q || f.name.toLowerCase().includes(q));
    emptyEl.classList.toggle("hide", arr.length > 0);
    listEl.innerHTML = arr
      .map((f) => {
        const [cls, label] = iconFor(f.name);
        return `
        <div class="card file-row reveal">
          <div class="file-icon ${cls}">${label}</div>
          <div class="file-info">
            <div class="file-name">${escapeHtml(f.name)}</div>
            <div class="file-meta">
              <span data-i18n="files.size">大小</span>: ${formatBytes(f.size)} ·
              <span data-i18n="files.updated">更新于</span>: ${formatDate(f.mtime, I18n.current)}
            </div>
          </div>
          <a class="btn btn-primary btn-sm" href="${API.fileUrl(f.name)}" download data-i18n="files.download">下载</a>
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
  }

  async function load() {
    if (!API.isConfigured) {
      emptyEl.classList.remove("hide");
      const note = document.createElement("div");
      note.className = "empty";
      note.style.padding = "14px";
      note.textContent = I18n.t("files.offline");
      listEl.appendChild(note);
      return;
    }
    spinner.classList.remove("hide");
    const data = await API.get("/api/files");
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
    files = data.files || [];
    render();
  }

  searchEl.addEventListener("input", render);
  document.addEventListener("langchange", render);

  /* ---------- Upload (owner only) ---------- */
  uploadBox.classList.remove("hide");
  uploadBtn.addEventListener("click", async () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const token = localStorage.getItem("admin_token") || prompt(I18n.t("files.token"));
    if (!token) return;
    const res = await API.upload(file, token);
    if (res && res.ok) {
      localStorage.setItem("admin_token", token);
      showToast(I18n.t("files.upload.ok"));
      uploadInput.value = "";
      load();
    } else {
      showToast(I18n.t("files.upload.fail"));
    }
  });

  load();
  bootPage();
})();