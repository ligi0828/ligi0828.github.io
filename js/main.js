/* ============================================================
   API config — point this to your PythonAnywhere backend
   e.g. https://YOUR-USERNAME.pythonanywhere.com
   Leave EMPTY to run fully offline (local demo data)
   ============================================================ */

const API_BASE = "";

const API = {
  isConfigured: API_BASE.trim().length > 0,

  async get(path) {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(API_BASE + path, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async post(path, body, token) {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify(body),
      });
      return { ok: res.ok, data: res.ok ? await res.json() : null, status: res.status };
    } catch {
      return null;
    }
  },

  async upload(file, token) {
    if (!this.isConfigured) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(API_BASE + "/api/upload", {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: fd,
      });
      return { ok: res.ok, status: res.status };
    } catch {
      return null;
    }
  },

  fileUrl(name) {
    return this.isConfigured ? API_BASE + "/files/" + encodeURIComponent(name) : "#";
  },
};

/* ============================================================
   Demo data (used when backend is not configured / unreachable)
   ============================================================ */

const DEMO_POSTS = [
  {
    id: 1,
    title: "Hello World — 我的网站上线了",
    tag: "life",
    date: "2026-08-10",
    excerpt: "经过几个月的设计与开发，我的个人主页终于上线了。这篇文章记录整个搭建过程：从技术选型、页面设计到前后端部署。",
    content:
      "## 为什么做这个网站\n\n作为开发者，我一直想要一个属于自己的数字空间，可以自由地记录与分享。\n\n## 技术栈\n\n- 前端：原生 HTML / CSS / JS，部署在 GitHub Pages\n- 后端：Python Flask，部署在 PythonAnywhere\n- 特性：五国语言、暗黑模式、粒子背景\n\n```js\nconsole.log('Hello, world!');\n```\n\n## 收获\n\n这个过程让我重新梳理了前端工程化、国际化与部署的完整流程。",
  },
  {
    id: 2,
    title: "为网站添加多语言支持的最佳实践",
    tag: "dev",
    date: "2026-08-02",
    excerpt: "从 i18n 结构设计、语言探测到动态切换，聊聊如何给静态站点加上完整的多语言能力，并兼顾 SEO 与性能。",
    content:
      "## 设计 i18n 字典\n\n把文案统一收进 JSON 字典，页面只引用 key，方便维护与扩展。\n\n## 语言探测\n\n依次检查：用户手动选择 > 浏览器语言 > 默认中文。\n\n## 动态切换\n\n通过事件通知（如 `langchange`）让所有动态内容重新渲染。",
  },
  {
    id: 3,
    title: "PythonAnywhere 免费部署 Flask 指南",
    tag: "tutorial",
    date: "2026-07-21",
    excerpt: "免费账号也能跑 Flask！从注册、上传代码、配置 WSGI 到开放 CORS，一步步带你把后端跑起来。",
    content:
      "## 步骤概览\n\n1. 注册 PythonAnywhere 免费账号\n2. 通过网页控制台上传代码\n3. 配置 WSGI 指向 app 实例\n4. 在 GitHub Pages 中开启 CORS\n\n## 注意事项\n\n- 免费版每天 100 秒 CPU，适合轻量 API\n- 记得为上传接口设置管理员令牌",
  },
  {
    id: 4,
    title: "我的 2026 开源计划",
    tag: "life",
    date: "2026-07-08",
    excerpt: "新的一年，给自己定下几个小目标：多读源码、多写笔记、多做开源贡献。",
    content:
      "## 目标清单\n\n- 阅读 3 个大项目的源码\n- 每周至少一篇技术笔记\n- 参与 2 个开源项目贡献\n\n持续学习，保持热爱。",
  },
];

const DEMO_RESOURCES = [
  { id: 1, title: "MDN Web Docs", url: "https://developer.mozilla.org", category: "docs", desc: "Web 开发权威文档，HTML / CSS / JS 的最佳参考。" },
  { id: 2, title: "GitHub", url: "https://github.com", category: "dev", desc: "全球最大的代码托管平台，开源精神的家园。" },
  { id: 3, title: "Python 官方文档", url: "https://docs.python.org", category: "docs", desc: "Python 语言与标准库的完整文档。" },
  { id: 4, title: "Figma", url: "https://www.figma.com", category: "design", desc: "团队协作设计工具，界面与原型设计神器。" },
  { id: 5, title: "freeCodeCamp", url: "https://www.freecodecamp.org", category: "learn", desc: "免费学习编程的平台，认证课程质量很高。" },
  { id: 6, title: "Stack Overflow", url: "https://stackoverflow.com", category: "dev", desc: "程序员问答社区，遇到 bug 先去搜一搜。" },
];

/* ============================================================
   Shared helpers
   ============================================================ */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + " " + units[i];
}

function formatDate(iso, lang) {
  try {
    const map = { zh: "zh-CN", en: "en-US", ru: "ru-RU", fr: "fr-FR", ja: "ja-JP" };
    return new Date(iso).toLocaleDateString(map[lang] || "zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

function renderMarkdown(md) {
  const esc = escapeHtml(md);
  let html = esc;
  html = html.replace(/^### (.*)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^# (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/```([\s\S]*?)```/g, "<pre>$1</pre>");
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^\- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!(?:[\s\S]*?<\/li>))/g, "<ul>$1</ul>");
  html = html.replace(/(^|\n)(?!<)/gm, "<br>");
  return html;
}

/* ============================================================
   Shared page boot (nav, i18n, theme, footer year)
   ============================================================ */

function bootPage() {
  I18n.set(I18n.detect());
  Theme.init();

  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest(".nav-link")) navLinks.classList.remove("open");
    });
  }

  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", () => I18n.set(langSelect.value));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  window.addEventListener("beforeunload", () => io.disconnect());
}
