(() => {
  "use strict";
  document.documentElement.classList.add("enhanced");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      closeMenu();
      navToggle.focus();
    }
  });
  matchMedia("(min-width: 721px)").addEventListener("change", closeMenu);

  const tabs = [...document.querySelectorAll("[data-benchmark]")];
  const tablist = document.querySelector(".benchmark-controls");
  tablist.setAttribute("role", "tablist");
  tabs.forEach((tab) => tab.setAttribute("role", "tab"));
  document.querySelectorAll(".benchmark-panel").forEach((panel) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
  });
  function showBenchmark(key, focus = false) {
    tabs.forEach((tab) => {
      const active = tab.dataset.benchmark === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden =
        !active;
      if (active && focus) tab.focus();
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showBenchmark(tab.dataset.benchmark));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        showBenchmark(tabs[next].dataset.benchmark, true);
      }
    });
  });
  showBenchmark("mpe");
  document.querySelectorAll("[data-show-benchmark]").forEach((link) => {
    link.addEventListener("click", () =>
      showBenchmark(link.dataset.showBenchmark),
    );
  });
  const scenario = document.getElementById("scenario-select");
  function showScenario() {
    document.querySelectorAll("[data-scenario]").forEach((panel) => {
      panel.hidden = panel.dataset.scenario !== scenario.value;
    });
  }
  scenario.addEventListener("change", showScenario);
  showScenario();

  const dialog = document.querySelector(".figure-dialog");
  const viewerImage = dialog.querySelector(".viewer-image");
  const viewerScroll = dialog.querySelector(".viewer-scroll");
  const zoom = dialog.querySelector(".viewer-zoom");
  let figureTrigger;
  if (typeof dialog.showModal === "function") {
    document.querySelectorAll("[data-figure]").forEach((link) => {
      link.addEventListener("click", (event) => {
        // Preserve the browser's open-in-new-tab behavior.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        figureTrigger = link;
        const figure = link.closest("figure");
        viewerImage.src = link.dataset.figure;
        viewerImage.alt = link.querySelector("img").alt;
        dialog.querySelector("#viewer-title").textContent = link
          .getAttribute("aria-label")
          .replace("Enlarge ", "");
        dialog.querySelector(".viewer-caption").textContent =
          figure.querySelector("figcaption p").textContent;
        dialog.querySelector(".viewer-original").href = link.href;
        viewerScroll.classList.remove("zoomed");
        zoom.textContent = "Zoom in";
        zoom.setAttribute("aria-pressed", "false");
        document.body.classList.add("modal-open");
        dialog.showModal();
        viewerScroll.scrollTop = viewerScroll.scrollLeft = 0;
        dialog.querySelector(".viewer-close").focus();
      });
    });
    dialog
      .querySelector(".viewer-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      figureTrigger?.focus({ preventScroll: true });
    });
    zoom.addEventListener("click", () => {
      const zoomed = viewerScroll.classList.toggle("zoomed");
      zoom.textContent = zoomed ? "Fit to view" : "Zoom in";
      zoom.setAttribute("aria-pressed", String(zoomed));
      if (!zoomed) viewerScroll.scrollTop = viewerScroll.scrollLeft = 0;
    });
  }

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    let reset;
    button.addEventListener("click", async () => {
      const text = document
        .getElementById(button.dataset.copyTarget)
        .innerText.trim();
      const status = document.querySelector(".copy-status");
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        status.textContent = "Citation copied to clipboard.";
      } catch {
        const range = document.createRange();
        range.selectNodeContents(
          document.getElementById(button.dataset.copyTarget),
        );
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
      }
      reset = setTimeout(() => {
        button.textContent = "Copy";
      }, 2500);
    });
  });

  if ("IntersectionObserver" in window) {
    const links = [...navLinks.querySelectorAll("a")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-12% 0px -60% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section")
      .forEach((section) => observer.observe(section));
  }
  // VIDEO:js — the landmark figure's animation plays while on screen; its own small button pauses it.
  document.querySelectorAll(".figure-video").forEach((fig) => {
    const v = fig.querySelector("video");
    const btn = fig.querySelector(".fig-toggle");
    if (!v) return;
    let userPaused = false;
    let inView = false;
    const label = () => {
      const playing = !v.paused;
      fig.classList.toggle("is-paused", !playing);
      if (!btn) return;
      btn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
      btn.querySelector("span").textContent = playing ? "Pause" : "Play";
    };
    const sync = () => {
      if (inView && !userPaused && document.visibilityState === "visible") {
        v.preload = "auto";
        const p = v.play();
        if (p && p.catch) p.catch(label);
      } else if (!v.paused) {
        v.pause();
      }
    };
    v.controls = false;
    v.addEventListener("play", label);
    v.addEventListener("pause", label);
    if (btn)
      btn.addEventListener("click", () => {
        userPaused = !v.paused;
        if (userPaused) v.pause();
        else {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
      });
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        (entries) => {
          inView = entries[entries.length - 1].isIntersecting;
          sync();
        },
        { threshold: 0.3 },
      ).observe(v);
    else {
      inView = true;
      sync();
    }
    document.addEventListener("visibilitychange", sync);
  });
  // other muted loops (opt-in sections): play while on screen
  const otherLoops = [...document.querySelectorAll("video.autoplay-loop")].filter((v) => !v.closest(".figure-video"));
  if (otherLoops.length && "IntersectionObserver" in window) {
    const loopObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.play().catch(() => en.target.setAttribute("controls", ""));
          else en.target.pause();
        }),
      { threshold: 0.3 },
    );
    otherLoops.forEach((v) => loopObserver.observe(v));
  }
  // rollouts: benchmark tabs (kept in step with the results table) and one carousel per benchmark.
  // The track moves by transform (eased; follows the pointer while dragging), the centred clip plays only
  // while it is on screen, and the page's own buttons replace the browser's video controls.
  {
    const makeCarousel = (panel, live) => {
      const car = panel.querySelector(".carousel");
      const viewport = car.querySelector(".car-viewport");
      const track = car.querySelector(".car-track");
      const slides = [...track.querySelectorAll(".car-slide")];
      const videos = slides.map((s) => s.querySelector("video"));
      const dots = [...panel.querySelectorAll(".car-dot")];
      const count = panel.querySelector(".car-count");
      const prev = car.querySelector(".car-prev");
      const next = car.querySelector(".car-next");
      const userPaused = new Set(); // clips the visitor paused
      const blocked = new Set(); // clips the browser would not autoplay
      let index = 0;
      let inView = false;
      let viewW = 0;
      let slideW = 0;
      let gap = 0;
      let postersLoaded = false;

      const shift = (i) => (viewW - slideW) / 2 - i * (slideW + gap);
      const measure = () => {
        if (panel.hidden) return false;
        viewW = viewport.clientWidth;
        slideW = slides[0].offsetWidth;
        gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        car.style.setProperty("--media-h", `${slides[index].querySelector(".car-media").offsetHeight}px`);
        return viewW > 0;
      };
      const place = (animate) => {
        if (!measure()) return;
        track.classList.toggle("no-anim", !animate);
        track.style.transform = `translate3d(${shift(index)}px, 0, 0)`;
        if (!animate) {
          void track.offsetWidth;
          track.classList.remove("no-anim");
        }
      };
      const setToggleLabel = (j) => {
        const b = slides[j].querySelector(".car-toggle");
        if (b) b.setAttribute("aria-label", videos[j].paused ? "Play clip" : "Pause clip");
      };
      const sync = () => {
        const visible = !panel.hidden && inView && document.visibilityState === "visible";
        videos.forEach((v, j) => {
          if (j === index && visible && !userPaused.has(j)) {
            v.preload = "auto";
            if (v.paused) {
              const p = v.play();
              if (p && p.catch)
                p.catch(() => {
                  blocked.add(j);
                  if (j === index) slides[j].classList.add("is-paused");
                });
            }
          } else if (!v.paused) {
            v.pause();
          }
        });
        // the big play button marks a clip the visitor paused (or one the browser blocked), not one paused off screen
        slides[index].classList.toggle("is-paused", userPaused.has(index) || blocked.has(index));
      };
      const go = (i, opts = {}) => {
        const to = Math.max(0, Math.min(slides.length - 1, i));
        const changed = to !== index;
        if (changed) userPaused.delete(index);
        index = to;
        place(opts.animate !== false);
        slides.forEach((s, j) => {
          const on = j === to;
          s.classList.toggle("is-active", on);
          s.setAttribute("aria-hidden", String(!on));
          s.querySelectorAll("button").forEach((b) => (b.tabIndex = on ? 0 : -1));
          if (!on) s.classList.remove("is-paused");
        });
        dots.forEach((d, j) => (j === to ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
        prev.disabled = to === 0;
        next.disabled = to === slides.length - 1;
        if (count) count.textContent = `${to + 1} / ${slides.length}`;
        if (changed) {
          try {
            videos[to].currentTime = 0;
          } catch (e) {
            /* not loaded yet */
          }
          if (live && opts.announce !== false) live.textContent = slides[to].getAttribute("aria-label");
        }
        sync();
      };
      const toggle = () => {
        const v = videos[index];
        if (v.paused) {
          userPaused.delete(index);
          v.preload = "auto";
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          userPaused.add(index);
          v.pause();
        }
      };
      const fullscreen = () => {
        const v = videos[index];
        if (v.requestFullscreen) {
          v.controls = true;
          v.requestFullscreen().catch(() => (v.controls = false));
        } else if (v.webkitEnterFullscreen) {
          v.webkitEnterFullscreen();
        }
      };

      videos.forEach((v, j) => {
        v.controls = false;
        v.removeAttribute("controls");
        v.addEventListener("play", () => {
          blocked.delete(j);
          slides[j].classList.remove("is-paused");
          setToggleLabel(j);
        });
        v.addEventListener("pause", () => {
          if (document.fullscreenElement === v) userPaused.add(j); // paused with the full-screen controls
          slides[j].classList.toggle("is-paused", j === index && userPaused.has(j));
          setToggleLabel(j);
        });
      });
      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) videos.forEach((v) => (v.controls = false));
      });

      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));
      dots.forEach((d, j) => d.addEventListener("click", () => go(j)));
      car.addEventListener("keydown", (e) => {
        const to = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: slides.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        go(to);
      });

      // drag / swipe: the track follows the pointer, then settles on the nearest clip (distance or flick speed)
      let drag = null;
      let dragEnded = 0;
      viewport.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || e.target.closest("button")) return;
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, on: false, lx: e.clientX, lt: e.timeStamp, v: 0 };
      });
      viewport.addEventListener("pointermove", (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x0;
        const dy = e.clientY - drag.y0;
        if (!drag.on) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            drag = null; // vertical: the page scrolls
            return;
          }
          if (Math.abs(dx) < 8) return;
          drag.on = true;
          try {
            viewport.setPointerCapture(e.pointerId);
          } catch (err) {
            /* pointer already released */
          }
          car.classList.add("is-dragging");
        }
        const dt = Math.max(1, e.timeStamp - drag.lt);
        drag.v = 0.75 * ((e.clientX - drag.lx) / dt) + 0.25 * drag.v;
        drag.lx = e.clientX;
        drag.lt = e.timeStamp;
        drag.dx = dx;
        const atEdge = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
        track.style.transform = `translate3d(${shift(index) + (atEdge ? dx * 0.3 : dx)}px, 0, 0)`;
      });
      const endDrag = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.on) return;
        car.classList.remove("is-dragging");
        dragEnded = performance.now();
        const far = slideW * 0.16;
        let to = index;
        if (d.dx < -far || d.v < -0.45) to = index + 1;
        else if (d.dx > far || d.v > 0.45) to = index - 1;
        go(to);
      };
      viewport.addEventListener("pointerup", endDrag);
      viewport.addEventListener("pointercancel", endDrag);
      viewport.addEventListener("click", (e) => {
        if (performance.now() - dragEnded < 120) return; // the click that ends a drag
        const s = e.target.closest(".car-slide");
        if (!s) return;
        const j = slides.indexOf(s);
        if (j !== index) go(j); // a neighbour comes to the centre
        else if (e.target.closest(".car-full")) fullscreen();
        else if (e.target.closest(".car-toggle, .car-play, .car-media")) toggle();
      });
      viewport.addEventListener("dblclick", (e) => {
        if (e.target.closest(".car-slide.is-active .car-media")) fullscreen();
      });

      if ("ResizeObserver" in window) new ResizeObserver(() => place(false)).observe(viewport);
      else window.addEventListener("resize", () => place(false));
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => {
            const en = entries[entries.length - 1];
            inView = en.isIntersecting && en.intersectionRatio >= 0.35;
            sync();
          },
          { threshold: [0, 0.35, 0.7] },
        ).observe(car);
      } else {
        inView = true;
      }

      const loadPosters = () => {
        if (postersLoaded) return;
        postersLoaded = true;
        videos.forEach((v) => {
          if (v.dataset.poster && !v.getAttribute("poster")) v.setAttribute("poster", v.dataset.poster);
        });
      };
      return {
        key: panel.dataset.roll,
        panel,
        sync,
        loadPosters,
        show(animateIn) {
          panel.hidden = false;
          panel.classList.add("is-current");
          if (animateIn) {
            panel.classList.add("is-entering");
            requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove("is-entering")));
          }
          go(index, { animate: false, announce: false });
        },
        hide() {
          panel.hidden = true;
          panel.classList.remove("is-current");
          videos.forEach((v) => v.pause());
        },
      };
    };

    document.querySelectorAll(".rollouts").forEach((root) => {
      const tabs = [...root.querySelectorAll(".roll-tab")];
      const live = root.querySelector(".roll-live");
      const carousels = [...root.querySelectorAll(".roll-panel")].map((p) => makeCarousel(p, live));
      if (!carousels.length) return;
      let current = carousels[0];
      let near = false; // the section is close to the viewport: posters may load
      const show = (key, fromTable) => {
        const target = carousels.find((c) => c.key === key);
        if (!target) return;
        tabs.forEach((t) => {
          const on = t.dataset.roll === key;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
        });
        if (target !== current) {
          current.hide();
          current = target;
          current.show(true);
          if (near || !fromTable) current.loadPosters();
        }
        if (!fromTable) {
          const tableTab = document.querySelector(`[data-benchmark="${key}"]`);
          if (tableTab && tableTab.getAttribute("aria-selected") !== "true") tableTab.click();
        }
      };
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => show(t.dataset.roll));
        t.addEventListener("keydown", (e) => {
          let j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
          if (j === undefined) return;
          j = (j + tabs.length) % tabs.length;
          e.preventDefault();
          tabs[j].focus();
          show(tabs[j].dataset.roll);
        });
      });
      // follow the results table above: its tabs, keys and links all end in an aria-selected change
      const tableTabs = [...document.querySelectorAll("[data-benchmark]")];
      if ("MutationObserver" in window && tableTabs.length) {
        const mo = new MutationObserver(() => {
          const sel = tableTabs.find((t) => t.getAttribute("aria-selected") === "true");
          if (sel) show(sel.dataset.benchmark, true);
        });
        tableTabs.forEach((t) => mo.observe(t, { attributes: true, attributeFilter: ["aria-selected"] }));
      }
      carousels.forEach((c) => (c === current ? c.show(false) : c.hide()));
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => {
            if (entries.some((en) => en.isIntersecting)) {
              near = true;
              current.loadPosters();
            }
          },
          { rootMargin: "700px 0px" },
        ).observe(root);
      } else {
        near = true;
        current.loadPosters();
      }
      document.addEventListener("visibilitychange", () => carousels.forEach((c) => c.sync()));
    });
  }
  // /VIDEO:js
})();
