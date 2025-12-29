// ===== Load HTML components =====
async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(`Failed to load ${file}`, err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", "components/header.html");
  await loadComponent("footer", "components/footer.html");

  setActiveNav();
  setYear();
});

// ===== Active navigation =====
function setActiveNav() {
  const current = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("nav a[data-page]").forEach(link => {
    if (link.dataset.page === current) {
      link.classList.add("active");
    }
  });
}

// ===== Footer year =====
function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ===== Contact form =====
function openMailTo(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const to = "YOUR_EMAIL@example.com";
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`
  );

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}
