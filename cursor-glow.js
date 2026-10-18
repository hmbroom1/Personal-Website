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

  // Phone scroll hint on long pages: jumps down a screen, fades once scrolled
  const isPhone = window.matchMedia("(max-width: 700px)").matches;
  const pageIsLong = document.documentElement.scrollHeight > window.innerHeight + 120;
  if (isPhone && pageIsLong) {
    const scrollHint = document.createElement("button");
    scrollHint.type = "button";
    scrollHint.className = "scroll-hint";
    scrollHint.setAttribute("aria-label", "Scroll down");
    scrollHint.innerHTML = '<span>Scroll</span><span class="scroll-hint-arrow" aria-hidden="true"></span>';
    document.body.appendChild(scrollHint);

    scrollHint.addEventListener("click", () => {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: reducedMotion ? "auto" : "smooth" });
    });

    const updateHint = () => {
      scrollHint.classList.toggle("is-hidden", window.scrollY > 40);
    };
    window.addEventListener("scroll", updateHint, { passive: true });
    updateHint();
  }

  // Phones: Interests become photo tiles; tap one to open it
  const interestGrid = document.querySelector(".interest-grid");
  if (interestGrid) {
    const phoneQuery = window.matchMedia("(max-width: 700px)");
    const cards = [...interestGrid.querySelectorAll(".interest-card")];

    // Tapping the open card closes it; tapping another opens it and closes the rest
    const openCard = (card) => {
      const closing = card.classList.contains("is-open");
      cards.forEach((other) => {
        const isOpen = other === card && !closing;
        other.classList.toggle("is-open", isOpen);
        other.setAttribute("aria-expanded", String(isOpen));
      });
    };

    const applyStack = () => {
      const stacked = phoneQuery.matches;
      interestGrid.classList.toggle("is-stacked", stacked);
      cards.forEach((card) => {
        if (stacked) {
          card.setAttribute("role", "button");
          card.setAttribute("tabindex", "0");
        } else {
          card.removeAttribute("role");
          card.removeAttribute("tabindex");
          card.removeAttribute("aria-expanded");
          card.classList.remove("is-open");
        }
      });
      if (stacked) {
        cards.forEach((card) => {
          if (!card.hasAttribute("aria-expanded")) {
            card.setAttribute("aria-expanded", "false");
          }
        });
      }
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (interestGrid.classList.contains("is-stacked")) {
          openCard(card);
        }
      });
      card.addEventListener("keydown", (event) => {
        if (interestGrid.classList.contains("is-stacked") && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          openCard(card);
        }
      });
    });

    phoneQuery.addEventListener("change", applyStack);
    applyStack();
  }

  // Headline word swap: plays once per page per visit.
  // Markup: <span class="swap-word" data-swap="next|another|final">first</span>
  const runWordSwap = (word, words) => {
    let index = 0;

    const showNext = () => {
      word.classList.add("is-leaving");
      window.setTimeout(() => {
        if (index === words.length - 1) {
          word.classList.add("is-final");
        }
        word.textContent = words[index];
        word.classList.remove("is-leaving");
        word.classList.add("is-entering");
        void word.offsetWidth;
        word.classList.remove("is-entering");
        index += 1;
        if (index < words.length) {
          window.setTimeout(showNext, 1100);
        } else {
          window.setTimeout(() => word.classList.add("is-settled"), 900);
        }
      }, 260);
    };

    word.classList.add("is-highlighted");
    window.setTimeout(showNext, 1400);
  };

  document.querySelectorAll("[data-swap]").forEach((word) => {
    const words = word.dataset.swap.split("|");
    const key = `wordSwap:${window.location.pathname}`;
    let alreadySwapped = false;
    try {
      alreadySwapped = sessionStorage.getItem(key) === "yes";
      sessionStorage.setItem(key, "yes");
    } catch (error) {
      alreadySwapped = false;
    }

    if (reducedMotion) {
      word.classList.add("is-final");
      word.textContent = words[words.length - 1];
    } else if (!alreadySwapped) {
      runWordSwap(word, words);
    }
  });

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
