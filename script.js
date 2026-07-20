// Nav: solid background after scrolling past the top
const nav = document.getElementById("nav");

function updateNav() {
  nav.classList.toggle("is-scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

// Mobile menu toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close the mobile menu after choosing a section
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Hero grid torch: brighten the grid around the cursor
const hero = document.getElementById("hero");
const torch = document.getElementById("heroTorch");

hero.addEventListener("mousemove", (e) => {
  const rect = hero.getBoundingClientRect();
  torch.style.setProperty("--mx", e.clientX - rect.left + "px");
  torch.style.setProperty("--my", e.clientY - rect.top + "px");
});

// Email designs folder gallery: hover fans the stack, click opens,
// drag a card down more than 100px to close.
const folder = document.getElementById("folder");
const folderFront = document.getElementById("folderFront");

folderFront.addEventListener("mouseenter", () => {
  if (!folder.classList.contains("is-open")) folder.classList.add("is-hover");
});

folderFront.addEventListener("mouseleave", () => {
  folder.classList.remove("is-hover");
});

function openFolder() {
  folder.classList.remove("is-hover");
  folder.classList.add("is-open");
}

folderFront.addEventListener("click", openFolder);
folderFront.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openFolder();
  }
});

function closeFolder() {
  folder.classList.remove("is-open");
  folder.querySelectorAll(".folder__photo").forEach((p) => {
    p.style.removeProperty("--dx");
    p.style.removeProperty("--dy");
    p.style.removeProperty("--drag-tilt");
    p.scrollTop = 0;
  });
}

// Click anywhere outside the open designs to close the folder
document.addEventListener("click", (e) => {
  if (!folder.classList.contains("is-open")) return;
  if (e.target.closest(".folder__photo") || e.target.closest("#folderFront")) return;
  closeFolder();
});

// Process timeline: the line fills as you scroll, and each stage
// lights up when the fill reaches its connector.
const timeline = document.getElementById("timeline");
const timelineFill = document.getElementById("timelineFill");
const timelineItems = [...document.querySelectorAll(".tl-item")];
let timelineTicking = false;

function updateTimeline() {
  timelineTicking = false;
  const rect = timeline.getBoundingClientRect();
  // fill up to the vertical middle of the viewport
  const progress = Math.min(Math.max(window.innerHeight * 0.55 - rect.top, 0), rect.height);
  timelineFill.style.height = progress + "px";
  timelineItems.forEach((item) => {
    const c = item.querySelector(".tl-connector").getBoundingClientRect();
    const connectorY = c.top + c.height / 2 - rect.top;
    item.classList.toggle("is-active", progress >= connectorY);
  });
}

function onTimelineScroll() {
  if (!timelineTicking) {
    timelineTicking = true;
    requestAnimationFrame(updateTimeline);
  }
}

window.addEventListener("scroll", onTimelineScroll, { passive: true });
window.addEventListener("resize", onTimelineScroll, { passive: true });
updateTimeline();

// Scroll-reveal: fade sections' content up as it enters the viewport
const revealTargets = document.querySelectorAll(
  ".why__head, .founder-note, .why__cards .why-card, .why__nofit, " +
    ".system__head, .system__row, " +
    ".designs__head, .folder, " +
    ".reviews__headline, .reviews__about, .reviews__video, .reviews__logolabel, .reviews__logos, " +
    ".process__head, .process__cta, " +
    ".contact__info, .contact__cal"
);

if ("IntersectionObserver" in window) {
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger siblings that reveal together
        const siblings = [...el.parentElement.children].filter((c) =>
          c.classList.contains("reveal")
        );
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 4) * 90 + "ms";
        el.classList.add("is-visible");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// Scrollspy: highlight the nav link for the section in view
const spyLinks = new Map(
  [...document.querySelectorAll('.nav__links a[href^="#"]')].map((a) => [
    a.getAttribute("href").slice(1),
    a,
  ])
);

if ("IntersectionObserver" in window && spyLinks.size) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = spyLinks.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          spyLinks.forEach((a) => a.classList.remove("is-current"));
          link.classList.add("is-current");
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  spyLinks.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spyObserver.observe(section);
  });
}

folder.querySelectorAll(".folder__photo").forEach((photo) => {
  photo.addEventListener("pointerdown", (e) => {
    if (!folder.classList.contains("is-open")) return;
    e.preventDefault();
    photo.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    let dy = 0;

    const onMove = (ev) => {
      dy = ev.clientY - startY;
      photo.classList.add("is-dragging");
      photo.style.setProperty("--dx", ev.clientX - startX + "px");
      photo.style.setProperty("--dy", dy + "px");
      photo.style.setProperty("--drag-tilt", "1");
    };

    const onUp = () => {
      photo.removeEventListener("pointermove", onMove);
      photo.removeEventListener("pointerup", onUp);
      photo.removeEventListener("pointercancel", onUp);
      photo.classList.remove("is-dragging");
      if (dy > 100) {
        closeFolder();
      } else {
        // snap back to the open position
        photo.style.removeProperty("--dx");
        photo.style.removeProperty("--dy");
        photo.style.removeProperty("--drag-tilt");
      }
    };

    photo.addEventListener("pointermove", onMove);
    photo.addEventListener("pointerup", onUp);
    photo.addEventListener("pointercancel", onUp);
  });
});
