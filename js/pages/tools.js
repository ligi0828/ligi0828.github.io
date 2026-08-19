/* ============================================================
   Tools page — Base64 / JSON / SHA-256 / Case / Stats
   ============================================================ */

(() => {
  const $ = (id) => document.getElementById(id);

  /* ---------- Base64 ---------- */
  const b64In = $("b64Input");
  const b64Out = $("b64Out");
  $("b64Encode").addEventListener("click", () => {
    try {
      b64Out.textContent = btoa(unescape(encodeURIComponent(b64In.value)));
    } catch {
      b64Out.textContent = "Error";
    }
  });
  $("b64Decode").addEventListener("click", () => {
    try {
      b64Out.textContent = decodeURIComponent(escape(atob(b64In.value.trim())));
    } catch {
      b64Out.textContent = "Error";
    }
  });
  $("b64Copy").addEventListener("click", async () => {
    if (await copyText(b64Out.textContent)) showToast(I18n.t("tools.copied"));
  });
  $("b64Clear").addEventListener("click", () => {
    b64In.value = "";
    b64Out.textContent = "";
  });

  /* ---------- JSON ---------- */
  const jsonIn = $("jsonInput");
  const jsonOut = $("jsonOut");
  function jsonRun(minify) {
    try {
      const data = JSON.parse(jsonIn.value);
      jsonOut.textContent = minify ? JSON.stringify(data) : JSON.stringify(data, null, 2);
    } catch (e) {
      jsonOut.textContent = I18n.t("tools.json.err") + " — " + e.message;
    }
  }
  $("jsonFormat").addEventListener("click", () => jsonRun(false));
  $("jsonMinify").addEventListener("click", () => jsonRun(true));
  $("jsonCopy").addEventListener("click", async () => {
    if (await copyText(jsonOut.textContent)) showToast(I18n.t("tools.copied"));
  });

  /* ---------- SHA-256 ---------- */
  const hashIn = $("hashInput");
  const hashOut = $("hashOut");
  async function sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    let h1 = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h1 ^= text.charCodeAt(i);
      h1 = Math.imul(h1, 0x01000193);
    }
    return "fnv:" + (h1 >>> 0).toString(16).padStart(8, "0") + " (crypto.subtle unavailable)";
  }
  $("hashRun").addEventListener("click", async () => {
    hashOut.textContent = hashIn.value ? await sha256(hashIn.value) : "";
  });
  $("hashCopy").addEventListener("click", async () => {
    if (await copyText(hashOut.textContent)) showToast(I18n.t("tools.copied"));
  });

  /* ---------- Case ---------- */
  const caseIn = $("caseInput");
  const caseOut = $("caseOut");
  document.querySelectorAll("[data-case]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = caseIn.value;
      if (!text) return;
      switch (btn.dataset.case) {
        case "lower":
          caseOut.textContent = text.toLowerCase();
          break;
        case "upper":
          caseOut.textContent = text.toUpperCase();
          break;
        case "camel": {
          const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
          caseOut.textContent = words
            .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
            .join("");
          break;
        }
        case "kebab":
          caseOut.textContent = (text.toLowerCase().match(/[a-z0-9]+/g) || []).join("-");
          break;
        case "snake":
          caseOut.textContent = (text.toLowerCase().match(/[a-z0-9]+/g) || []).join("_");
          break;
      }
    });
  });

  /* ---------- Stats ---------- */
  const statsIn = $("statsInput");
  const statsOut = $("statsOut");
  function stats() {
    const text = statsIn.value;
    const chars = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    const lines = text ? text.split("\n").length : 0;
    statsOut.textContent = I18n.t("tools.stats.out", { c: chars, w: words, l: lines });
  }
  $("statsRun").addEventListener("click", stats);
  $("statsClear").addEventListener("click", () => {
    statsIn.value = "";
    statsOut.textContent = "";
  });
  statsIn.addEventListener("input", stats);

  document.addEventListener("langchange", stats);

  bootPage();
})();