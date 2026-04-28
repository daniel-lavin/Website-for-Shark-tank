const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const revealItems = document.querySelectorAll(".scroll-reveal");
const progressBar = document.querySelector(".scroll-progress");
const parallaxItems = document.querySelectorAll(".parallax-layer");
const noticePopup = document.querySelector(".notice-popup");
const noticeClose = document.querySelector(".notice-close");

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
updateScrollEffects();
