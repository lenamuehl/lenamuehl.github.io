// constants
const EMAIL = "muehlbauer-lena@web.de";
const isPages = location.pathname.includes("/pages/");
const base = isPages ? "../" : "";

// component loader
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

// active nav
function setActiveNav() {
  const currentFile = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll("nav a[data-page]").forEach(a => {
    if (a.dataset.page === currentFile) a.classList.add("active");
  });
}

// reveal animation
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

// contact mailto
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

// helpers 
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// projects rendering
function projectCard(p) {
  const title = escapeHtml(p.title || "");
  const desc = escapeHtml(p.description || "");
  const tech = Array.isArray(p.tech) ? p.tech : [];
  const workedWith = Array.isArray(p.workedWith) ? p.workedWith : [];

  // image path
  const imgHtml = p.image
    ? `<img src="${base}${escapeHtml(p.image)}" alt="${title}" style="width:100%; border-radius:16px; margin-bottom:10px;">`
    : "";

  const tagsHtml = tech.length
    ? `<div class="tags">${tech.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`
    : "";

  const workedWithHtml = workedWith.length
    ? `<p class="small" style="margin-top:10px;"><strong>Worked with:</strong> ${workedWith.map(escapeHtml).join(", ")}</p>`
    : "";

  const actions = [
    p.demoUrl && p.demoUrl !== "#"
      ? `<a class="btn" href="${p.demoUrl}" target="_blank" rel="noopener">Demo</a>`
      : "",
    p.repoUrl
      ? `<a class="btn" href="${p.repoUrl}" target="_blank" rel="noopener">GitHub</a>`
      : ""
  ].filter(Boolean).join(" ");

  return `
    <article class="card hover-lift">
      ${imgHtml}
      <h3>${title}</h3>
      <p class="small">${desc}</p>
      ${tagsHtml}
      ${workedWithHtml}
      ${actions ? `<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${actions}</div>` : ""}
    </article>
  `;
}

function renderProjectList(targetEl, projects) {
  if (!targetEl) return;

  if (!Array.isArray(projects) || projects.length === 0) {
    targetEl.innerHTML = `<p class="small">No projects yet.</p>`;
    return;
  }

  targetEl.innerHTML = `
    <div class="grid stagger" style="margin-top:12px">
      ${projects.map(projectCard).join("")}
    </div>
  `;
}

// projects json rendering
async function renderProjectsIfNeeded() {
  const featuredEl = document.getElementById("projects-featured");
  const allEl = document.getElementById("projects-all");
  if (!featuredEl && !allEl) return;

  try {
    const jsonPath = `${base}data/projects.json`;
    const res = await fetch(jsonPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${jsonPath} (${res.status})`);

    const projects = await res.json(); // <-- your file is an ARRAY
    if (!Array.isArray(projects)) throw new Error("projects.json must be an array");

    const featured = projects.filter(p => p.featured === true);
    const all = projects.filter(p => p.featured !== true);

    if (featuredEl) renderProjectList(featuredEl, featured);
    if (allEl) renderProjectList(allEl, all);
  } catch (err) {
    console.error(err);
    if (featuredEl) featuredEl.innerHTML = `<p class="small">Could not load projects.</p>`;
    if (allEl) allEl.innerHTML = `<p class="small">Could not load projects.</p>`;
  }
}

// boot
document.addEventListener("DOMContentLoaded", async () => {
  // header/footer
  await loadComponent(
    "header",
    isPages ? "../components/header/header-pages.html" : "components/header/header-root.html"
  );
  await loadComponent("footer", `${base}components/footer.html`);

  // home-only components (paths must respect base)
  await loadComponent("hero-slot", `${base}components/hero.html`);
  await loadComponent("highlights-slot", `${base}components/highlights.html`);

  // pages-only components (use base so it also works if you ever move files)
  await loadComponent("contact-cards-slot", `${base}components/contact-cards.html`);

  // pages/projects.html (and also index if you include that slot there)
  await loadComponent("projects-slot", `${base}components/project-section.html`);

  // NOW slots exist -> render
  await renderProjectsIfNeeded();

  setActiveNav?.();
  initRevealOnScroll();
  initContactForm();
});
