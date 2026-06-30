(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const storageKey = "navigationAnimation";
  const toggles = document.querySelectorAll("[data-animation-toggle]");
  let enabled = localStorage.getItem(storageKey) !== "off";

  const revealTargets = document.querySelectorAll(
    ".project-card, .simple-card, .interest-card, .resume-disclosure, .case-disclosure, .story-disclosure"
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("scroll-reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index * 55, 220)}ms`);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => {
      target.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    revealTargets.forEach((target) => {
      revealObserver.observe(target);
    });
  }

  const brands = document.querySelectorAll(".brand");
  const sparkleOffsets = [
    [-22, -18, "-18deg"],
    [18, -24, "16deg"],
    [-30, 6, "12deg"],
    [28, 8, "-14deg"],
    [0, -34, "24deg"],
  ];

  const launchSparkles = (brand) => {
    if (reducedMotion) {
      return;
    }

    const rect = brand.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    brand.classList.add("is-sparkling");
    window.setTimeout(() => brand.classList.remove("is-sparkling"), 520);

    sparkleOffsets.forEach(([dx, dy, rotate], index) => {
      const sparkle = document.createElement("span");
      sparkle.className = "brand-sparkle";
      sparkle.textContent = index % 2 === 0 ? "*" : "+";
      sparkle.setAttribute("aria-hidden", "true");
      sparkle.style.setProperty("--sparkle-x", `${startX}px`);
      sparkle.style.setProperty("--sparkle-y", `${startY}px`);
      sparkle.style.setProperty("--sparkle-dx", `${dx}px`);
      sparkle.style.setProperty("--sparkle-dy", `${dy}px`);
      sparkle.style.setProperty("--sparkle-rotate", rotate);
      document.body.appendChild(sparkle);

      window.requestAnimationFrame(() => {
        sparkle.classList.add("is-visible");
      });

      window.setTimeout(() => {
        sparkle.remove();
      }, 760);
    });
  };

  brands.forEach((brand) => {
    brand.addEventListener("pointerenter", () => {
      if (!coarsePointer) {
        launchSparkles(brand);
      }
    });

    brand.addEventListener("pointerdown", () => {
      launchSparkles(brand);
    });
  });

  if (reducedMotion || coarsePointer) {
    toggles.forEach((toggle) => {
      toggle.hidden = true;
    });
  }

  const setAnimationState = (nextEnabled) => {
    enabled = nextEnabled;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    document.documentElement.setAttribute("data-animation", enabled ? "on" : "off");
  };

  const updateToggles = () => {
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(!enabled));
      toggle.setAttribute(
        "aria-label",
        enabled ? "Turn navigation animation off" : "Turn navigation animation on"
      );
      toggle.textContent = enabled ? "Glow off" : "Glow on";
    });
  };

  if (!reducedMotion && !coarsePointer) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");

    setAnimationState(enabled);

    if (enabled) {
      document.body.appendChild(glow);
    }

    let x = 0;
    let y = 0;
    let frame = null;

    const moveGlow = () => {
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      frame = null;
    };

    window.addEventListener("pointermove", (event) => {
      if (!enabled) {
        return;
      }

      if (!glow.isConnected) {
        document.body.appendChild(glow);
      }

      x = event.clientX;
      y = event.clientY;
      glow.classList.add("is-visible");

      if (frame === null) {
        frame = window.requestAnimationFrame(moveGlow);
      }
    });

    document.addEventListener("pointerleave", () => {
      glow.classList.remove("is-visible");
    });

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        setAnimationState(!enabled);
        glow.classList.remove("is-visible");

        if (enabled && !glow.isConnected) {
          document.body.appendChild(glow);
        } else if (!enabled && glow.isConnected) {
          glow.remove();
        }

        updateToggles();
      });
    });

    updateToggles();
  }
})();
