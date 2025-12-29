// ===== constants =====
const EMAIL = "muehlbauer-lena@web.de";
const isPages = location.pathname.includes("/pages/");
const base = isPages ? "../" : "";

// ===== generic component loader =====
async function loadComponent(targetId, filePath) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const res = await fetch(filePath, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${filePath})`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error("Failed to load component:", err);
    el.innerHTML = `<div class="section"><p class="small">⚠️ Could not load: <code>${filePath}</code></p></div>`;
  }
}

// ===== active nav =====
function setActiveNav() {
  const currentFile = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll("nav a[data-page]").forEach(a => {
    if (a.dataset.page === currentFile) a.classList.add("active");
  });
}

// ===== footer year =====
function setFooterYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

// ===== reveal animation =====
function initRevealOnScroll() {
  const items = document.querySelectorAll(".reveal, .stagger > *");
  if (!items.length) return;

  items.forEach(el => el.classList.add("paused"));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.remove("paused");
        e.target.classList.add("shown");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });

  items.forEach(el => obs.observe(el));
}

// ===== contact mailto =====
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const subject = encodeURIComponent(`Portfolio message from ${name || "someone"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}\n`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  });
}

// ===== projects json rendering (optional hook) =====
// Falls du das schon drin hast: hier nur ein Stub, damit nichts crasht
async function renderProjectsIfNeeded() {
  // TODO: Wenn du das JSON-Rendering aktiv hast, ruf hier deinen Renderer auf.
}

// ===== boot =====
document.addEventListener("DOMContentLoaded", async () => {
  // header/footer
  await loadComponent("header", isPages ? "../components/header/header-pages.html"
                                      : "components/header/header-root.html");
  await loadComponent("footer", `${base}components/footer.html`);

  // home-only components (only exist on index.html)
  await loadComponent("hero-slot", "components/hero.html");
  await loadComponent("highlights-slot", "components/highlights.html");

  // pages-only components (only exist on pages/contact.html etc.)
  await loadComponent("contact-cards-slot", "../components/contact-cards.html");
  await loadComponent("projects-slot", "../components/project-section.html"); 
  // ^ bei dir heißt es im Explorer "project-section.html" (nicht projects-section.html)

  setActiveNav();
  setFooterYear();
  initRevealOnScroll();
  initContactForm();

  await renderProjectsIfNeeded();
});
