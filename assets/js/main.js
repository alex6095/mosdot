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
})();
