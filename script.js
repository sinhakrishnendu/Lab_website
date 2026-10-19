/* Page chrome: navigation, header state, active section, footer year.
 * Publication lists live in publications-core.js and publications-ui.js. */
const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeNav = () => {
  body.classList.remove("nav-open");
  header?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  header?.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
navLinks.forEach((link) => link.addEventListener("click", closeNav));
document.addEventListener("keydown", (event) => event.key === "Escape" && closeNav());

const sections = [...document.querySelectorAll("main section[id]")];
if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`),
        );
      }),
    { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}
