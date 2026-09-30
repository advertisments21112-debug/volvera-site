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
  ".why__head, .founder-note, .why__nofit, " +
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

/* ============================================================
   Motion layer
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll progress rail
const progressBar = document.getElementById("progress");

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = pct + "%";
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });
updateProgress();

// Hero headline: wrap each word in a mask so it can rise into place
const heroHeadline = document.querySelector(".hero__headline");

function splitIntoWords(node) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const words = child.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach((word) => {
        if (!word.trim()) {
          frag.appendChild(document.createTextNode(word));
          return;
        }
        const mask = document.createElement("span");
        mask.className = "w-mask";
        const inner = document.createElement("span");
        inner.textContent = word;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // Styled spans (the gradient word) stay whole — splitting them would
      // strip the background the text is clipped from.
      const mask = document.createElement("span");
      mask.className = "w-mask";
      child.replaceWith(mask);
      mask.appendChild(child);
    }
  });
}

if (heroHeadline && !reducedMotion) {
  splitIntoWords(heroHeadline);
  const parts = heroHeadline.querySelectorAll(".w-mask > span");
  parts.forEach((part, i) => {
    part.style.transitionDelay = 90 + i * 85 + "ms";
  });
  requestAnimationFrame(() => heroHeadline.classList.add("is-revealed"));
}

/* --- Section headlines: same word reveal as the hero, on scroll --- */
const sectionHeadlines = document.querySelectorAll(
  ".why__headline, .system__headline, .reviews__headline, .designs__headline, .process__headline, .founder-note__title, .contact__headline"
);

if (!reducedMotion && "IntersectionObserver" in window) {
  const headlineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        headlineObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  sectionHeadlines.forEach((el) => {
    splitIntoWords(el);
    el.classList.add("reveal-words");
    el.querySelectorAll(".w-mask > span").forEach((part, i) => {
      part.style.transitionDelay = i * 70 + "ms";
    });
    headlineObserver.observe(el);
  });
}

/* --- Parallax: media drifts slightly against the scroll --- */
const parallaxItems = [
  { el: document.querySelector(".hero__video"), depth: 0.05 },
  { el: document.querySelector(".founder-note__photo"), depth: 0.07 },
  { el: document.querySelector(".reviews__video"), depth: 0.05 },
].filter((item) => item.el);

let parallaxTicking = false;

function runParallax() {
  parallaxTicking = false;
  const mid = window.innerHeight / 2;
  parallaxItems.forEach(({ el, depth }) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    const offset = (rect.top + rect.height / 2 - mid) * depth;
    el.style.transform = "translate3d(0, " + offset.toFixed(1) + "px, 0)";
  });
}

if (!reducedMotion && parallaxItems.length) {
  window.addEventListener(
    "scroll",
    () => {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(runParallax);
      }
    },
    { passive: true }
  );
  runParallax();
}

/* ============================================================
   Why section — frame by frame; the logo turns with each point
   ============================================================ */

const wfSection = document.getElementById("why");
const wfTrack = document.querySelector(".wf-track");
const wfFrames = [...document.querySelectorAll(".wf-frame")];
const wfRing = document.querySelector(".wf-ring");
const wfCount = document.querySelector(".wf-count");
const wfNow = document.querySelector(".wf-count__now");
const wfFill = document.querySelector(".wf-count__fill");

if (wfSection && wfTrack && wfFrames.length && !reducedMotion) {
  wfSection.classList.add("why--frames");

  // Each title rolls in word by word
  wfFrames.forEach((frame) => {
    const title = frame.querySelector(".wf-title");
    splitIntoWords(title);
    title.querySelectorAll(".w-mask > span").forEach((part, i) => {
      part.style.transitionDelay = i * 55 + "ms";
    });
  });

  const points = wfFrames.length - 1; // first frame is the section title
  let activeFrame = -1;

  function showFrame(index) {
    if (index === activeFrame) return;
    activeFrame = index;

    wfFrames.forEach((frame, n) => {
      frame.classList.toggle("is-active", n === index);
      frame.classList.toggle("is-past", n < index);
    });

    // A quarter turn per frame; the first point sits at the logo's
    // natural orientation, so the title frame starts one step back
    wfRing.style.setProperty("--ring-rot", (index - 1) * 90 + "deg");

    wfCount.classList.toggle("is-visible", index > 0);
    if (index > 0) {
      wfNow.textContent = String(index).padStart(2, "0");
      wfFill.style.transform = "scaleX(" + (index / points).toFixed(3) + ")";
    }
  }

  let wfTicking = false;

  function syncFrame() {
    wfTicking = false;
    const rect = wfTrack.getBoundingClientRect();
    const travel = wfTrack.offsetHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, -rect.top / travel));
    showFrame(Math.min(wfFrames.length - 1, Math.floor(p * wfFrames.length)));
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!wfTicking) {
        wfTicking = true;
        requestAnimationFrame(syncFrame);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", syncFrame, { passive: true });

  /* --- One gesture moves exactly one point, however fast the scroll --- */
  const lastFrame = wfFrames.length - 1;
  const STEP_LOCK_MS = 1000; // time for a point to settle before the next
  const GESTURE_GAP_MS = 170; // silence that separates one wheel gesture from the next
  let lockedUntil = 0;
  let lastWheelAt = 0;
  let wheelGestureUsed = false;
  let touchStartY = null;
  let touchGestureUsed = false;
  let selfScrolling = false;
  let navigating = false;
  let navTimer = null;
  let prevScrollY = window.scrollY;

  function trackRange() {
    const top = wfTrack.getBoundingClientRect().top + window.scrollY;
    return { top, end: top + wfTrack.offsetHeight - window.innerHeight };
  }

  function inTrack(y) {
    const { top, end } = trackRange();
    return y >= top - 1 && y <= end + 1;
  }

  // Scroll position at the middle of a frame's slot on the track
  function frameTop(i) {
    const { top, end } = trackRange();
    return top + ((i + 0.5) / wfFrames.length) * (end - top);
  }

  function holdAt(y) {
    selfScrolling = true;
    window.scrollTo({ top: y, behavior: "instant" });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        selfScrolling = false;
      })
    );
  }

  function goToFrame(i) {
    const target = Math.max(0, Math.min(lastFrame, i));
    holdAt(frameTop(target));
    showFrame(target);
    lockedUntil = performance.now() + STEP_LOCK_MS;
  }

  // Scrolling past the first or last point is the only way out
  const leaving = (dir) =>
    (dir > 0 && activeFrame === lastFrame) || (dir < 0 && activeFrame === 0);

  // Wheel and trackpad: a gesture is a burst of events; momentum is part of it
  window.addEventListener(
    "wheel",
    (e) => {
      if (navigating || e.ctrlKey || !e.deltaY) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const now = performance.now();
      if (now - lastWheelAt > GESTURE_GAP_MS) wheelGestureUsed = false;
      lastWheelAt = now;

      const dir = Math.sign(e.deltaY);
      const y = window.scrollY;

      if (!inTrack(y)) {
        // Arriving from outside: stop on the edge point instead of flying through
        const { top, end } = trackRange();
        const next = y + e.deltaY;
        if ((dir > 0 && y < top && next >= top) || (dir < 0 && y > end && next <= end)) {
          e.preventDefault();
          goToFrame(dir > 0 ? 0 : lastFrame);
          wheelGestureUsed = true;
        }
        return;
      }

      if (leaving(dir) && !wheelGestureUsed && now >= lockedUntil) return;

      e.preventDefault();
      if (wheelGestureUsed || now < lockedUntil) {
        wheelGestureUsed = true; // swallow the rest of this gesture
        return;
      }
      wheelGestureUsed = true;
      goToFrame(activeFrame + dir);
    },
    { passive: false }
  );

  // Touch: one swipe, one point
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches.length === 1 ? e.touches[0].clientY : null;
      touchGestureUsed = false;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartY === null || navigating) return;
      const dy = touchStartY - e.touches[0].clientY; // positive = scrolling down
      const dir = Math.sign(dy);
      if (!dir || !inTrack(window.scrollY)) return;

      const now = performance.now();
      if (leaving(dir) && !touchGestureUsed && now >= lockedUntil) return;

      e.preventDefault();
      if (touchGestureUsed || now < lockedUntil) return;
      if (Math.abs(dy) > 36) {
        touchGestureUsed = true;
        goToFrame(activeFrame + dir);
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "touchend",
    () => {
      touchStartY = null;
    },
    { passive: true }
  );

  // Keyboard: arrows, page keys and space step one point
  window.addEventListener("keydown", (e) => {
    if (navigating || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;

    let dir = 0;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
    else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
    if (!dir || !inTrack(window.scrollY) || leaving(dir)) return;

    e.preventDefault();
    if (performance.now() >= lockedUntil) goToFrame(activeFrame + dir);
  });

  // Catch anything else (a touch fling, a scrollbar drag) arriving at the
  // section, and hold the stage still while a point settles
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (!selfScrolling && !navigating) {
        const { top, end } = trackRange();
        const inside = y >= top - 1 && y <= end + 1;
        if (inside && prevScrollY < top - 1) goToFrame(0);
        else if (inside && prevScrollY > end + 1) goToFrame(lastFrame);
        else if (inside && performance.now() < lockedUntil) holdAt(frameTop(activeFrame));
      }
      prevScrollY = window.scrollY;
    },
    { passive: true }
  );

  // Menu and button links glide through the section untouched
  document.addEventListener("click", (e) => {
    if (!e.target.closest('a[href^="#"]')) return;
    navigating = true;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => {
      navigating = false;
      prevScrollY = window.scrollY;
    }, 2500);
  });

  window.addEventListener("scrollend", () => {
    if (!navigating) return;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => {
      navigating = false;
      prevScrollY = window.scrollY;
    }, 120);
  });

  syncFrame();
}
