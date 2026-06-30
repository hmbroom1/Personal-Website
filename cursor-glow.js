(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const storageKey = "navigationAnimation";
  const toggles = document.querySelectorAll("[data-animation-toggle]");
  let enabled = localStorage.getItem(storageKey) !== "off";

  if (reducedMotion || coarsePointer) {
    toggles.forEach((toggle) => {
      toggle.hidden = true;
    });
    return;
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
})();
