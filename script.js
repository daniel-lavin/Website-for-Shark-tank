const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const revealItems = document.querySelectorAll(".scroll-reveal");
const progressBar = document.querySelector(".scroll-progress");
const parallaxItems = document.querySelectorAll(".parallax-layer");
const noticePopup = document.querySelector(".notice-popup");
const noticeClose = document.querySelector(".notice-close");
const accessGate = document.querySelector("#access-gate");
const accessGateForm = document.querySelector("#access-gate-form");
const accessGateError = document.querySelector("#access-gate-error");
const accessPasswordInput = document.querySelector("#access-password");

const ACCESS_STORAGE_KEY = "icarusSiteAccessGrantedHash";
const ACCESS_HASH = "d19bfcb92e7da42722fd5b9679d739fd6633b73d4a4a7dd0a416e93a05fe7e7e";

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockSite() {
  document.body.classList.remove("access-locked");
  if (accessGate) {
    accessGate.classList.add("hidden");
  }
}

async function initAccessGate() {
  if (!accessGate || !accessGateForm || !accessPasswordInput) {
    document.body.classList.remove("access-locked");
    return;
  }

  const previouslyGranted = localStorage.getItem(ACCESS_STORAGE_KEY) === ACCESS_HASH;
  if (previouslyGranted) {
    unlockSite();
    return;
  }

  accessPasswordInput.focus();

  accessGateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const enteredPassword = accessPasswordInput.value || "";
    const enteredHash = await sha256Hex(enteredPassword);

    if (enteredHash === ACCESS_HASH) {
      localStorage.setItem(ACCESS_STORAGE_KEY, ACCESS_HASH);
      accessGateError.textContent = "";
      accessGateForm.reset();
      unlockSite();
      return;
    }

    accessGateError.textContent = "Incorrect password. Please try again.";
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

if (noticePopup && noticeClose) {
  const closePopup = () => {
    noticePopup.classList.add("hidden");
  };

  noticeClose.addEventListener("click", closePopup);
}

if (revealItems.length > 0 && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

function updateScrollEffects() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  parallaxItems.forEach((item) => {
    const speed = Number(item.getAttribute("data-speed")) || 0.1;
    item.style.transform = `translateY(${scrollTop * speed * -1}px)`;
  });
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
initAccessGate();
updateScrollEffects();
