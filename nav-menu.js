(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-menu-toggle");

  if (!nav || !toggle) {
    return;
  }

  const setMenuOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });
})();
