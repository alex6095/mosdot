(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const old = button.textContent;
      try {
        await navigator.clipboard.writeText(target.innerText.trim());
        button.textContent = 'Copied';
      } catch (error) {
        console.warn('Copy failed', error);
        button.textContent = 'Copy failed';
      }

      setTimeout(() => {
        button.textContent = old;
      }, 1400);
    });
  });

  const canvas = document.getElementById('routeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palette = ['#d97706', '#0f6ca6', '#6b7280', '#ea554d', '#35b78f', '#7c3aed'];

  const modes = [
    { x: 120, y: 80, label: 'y1' },
    { x: 165, y: 285, label: 'y2' },
    { x: 255, y: 66, label: 'y3' },
    { x: 305, y: 270, label: 'y4' },
    { x: 386, y: 104, label: 'y5' },
    { x: 424, y: 230, label: 'y6' }
  ];

  const sources = Array.from({ length: 58 }, (_, i) => {
    const radius = 30 + (i % 11) * 5.5;
    const angle = i * 2.399963 + 0.22;
    return {
      x: 205 + Math.cos(angle) * radius + ((i % 5) - 2) * 3,
      y: 185 + Math.sin(angle) * radius + ((i % 7) - 3) * 2.5,
      phase: i * 0.27,
      group: i % modes.length
    };
  });

  function fitCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const height = Math.max(320, rect.width * 0.68);

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function drawPanel(x, y, width, height, title, accent) {
    ctx.save();
    roundedRect(x, y, width, height, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#dbe5ee';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 17px system-ui, sans-serif';
    ctx.fillText(title, x + 16, y + 30);

    ctx.fillStyle = accent;
    roundedRect(x + 16, y + 44, 72, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  function drawCells(offsetX, offsetY) {
    const cells = [
      { path: [[26, 58], [150, 25], [222, 118], [112, 194], [24, 178]], color: 'rgba(53,183,143,0.18)' },
      { path: [[150, 25], [360, 58], [355, 190], [222, 118]], color: 'rgba(15,108,166,0.14)' },
      { path: [[24, 178], [112, 194], [150, 316], [30, 326]], color: 'rgba(245,158,11,0.16)' },
      { path: [[112, 194], [222, 118], [355, 190], [315, 326], [150, 316]], color: 'rgba(234,85,77,0.13)' }
    ];

    cells.forEach((cell) => {
      ctx.beginPath();
      cell.path.forEach(([px, py], index) => {
        const xx = offsetX + px;
        const yy = offsetY + py;
        if (index === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      });
      ctx.closePath();
      ctx.fillStyle = cell.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.08)';
      ctx.stroke();
    });
  }

  function drawMode(mode, offsetX, offsetY, color) {
    const x = offsetX + mode.x;
    const y = offsetY + mode.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.fillText(mode.label, x + 9, y - 8);
    ctx.restore();
  }

  function drawRoute(source, mode, offsetX, offsetY, t, structured) {
    const sx = offsetX + source.x;
    const sy = offsetY + source.y;
    const mx = offsetX + mode.x;
    const my = offsetY + mode.y;
    const wiggle = structured ? 0 : Math.sin(t + source.phase) * 32;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo((sx + mx) / 2 + wiggle, sy - 34, (sx + mx) / 2 - wiggle, my + 38, mx, my);
    ctx.strokeStyle = structured ? 'rgba(15,23,42,0.22)' : 'rgba(245,158,11,0.34)';
    ctx.lineWidth = structured ? 1 : 1.15;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(91,103,120,0.85)';
    ctx.fill();
  }

  function drawScene(panelX, panelY, panelWidth, panelHeight, t, structured) {
    const contentWidth = 470;
    const contentHeight = 340;
    const scale = Math.min((panelWidth - 32) / contentWidth, (panelHeight - 82) / contentHeight);
    const originX = panelX + 16 + (panelWidth - 32 - contentWidth * scale) / 2;
    const originY = panelY + 62;

    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(scale, scale);

    if (structured) {
      drawCells(8, 0);
    }

    sources.forEach((source, index) => {
      const mode = structured ? modes[source.group] : modes[(source.group + Math.floor(index / 7)) % modes.length];
      drawRoute(source, mode, 0, 10, t, structured);
    });

    modes.forEach((mode, index) => {
      drawMode(mode, 0, 10, palette[index % palette.length]);
    });

    ctx.restore();
  }

  function draw(t) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const gap = 18;
    const panelX = 18;
    const panelTop = 24;
    const panelHeight = height - 48;
    const panelWidth = (width - panelX * 2 - gap) / 2;
    const rightX = panelX + panelWidth + gap;

    ctx.clearRect(0, 0, width, height);
    drawPanel(panelX, panelTop, panelWidth, panelHeight, 'Independent pairing', '#f59e0b');
    drawPanel(rightX, panelTop, panelWidth, panelHeight, 'MoSDOT routing', '#ea554d');
    drawScene(panelX, panelTop, panelWidth, panelHeight, t, false);
    drawScene(rightX, panelTop, panelWidth, panelHeight, t, true);
  }

  function animate(now) {
    draw(now / 1000);
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  fitCanvas();
  window.addEventListener('resize', () => {
    fitCanvas();
    draw(0);
  });

  requestAnimationFrame(animate);
}());
