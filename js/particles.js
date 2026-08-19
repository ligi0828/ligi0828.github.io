/* ============================================================
   Particle network background — lightweight canvas, theme aware
   ============================================================ */

(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let dots = [];
  let mouse = { x: -9999, y: -9999 };
  let running = true;
  let color = "129,140,248";

  function readColor() {
    const c = getComputedStyle(document.documentElement)
      .getPropertyValue("--particle")
      .trim();
    if (c) color = c;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  }

  function spawn() {
    const count = Math.min(90, Math.floor((W * H) / 16000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 1,
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;

      const dxm = d.x - mouse.x;
      const dym = d.y - mouse.y;
      const dm2 = dxm * dxm + dym * dym;
      if (dm2 < 180 * 180) {
        d.x += dxm * 0.012;
        d.y += dym * 0.012;
      }

      if (d.x < -20) d.x = W + 20;
      if (d.x > W + 20) d.x = -20;
      if (d.y < -20) d.y = H + 20;
      if (d.y > H + 20) d.y = -20;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.55)`;
      ctx.fill();
    }

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i];
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = dx * dx + dy * dy;
        if (dist < 120 * 120) {
          const alpha = (1 - Math.sqrt(dist) / 120) * 0.28;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) step();
  });

  document.addEventListener("themechange", readColor);
  window.addEventListener("resize", resize);

  readColor();
  resize();
  if (!reduced) step();
})();
