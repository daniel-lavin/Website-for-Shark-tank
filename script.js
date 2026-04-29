const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const revealItems = document.querySelectorAll(".scroll-reveal");
const progressBar = document.querySelector(".scroll-progress");
const parallaxItems = document.querySelectorAll(".parallax-layer");
const noticePopup = document.querySelector(".notice-popup");
const noticeClose = document.querySelector(".notice-close");
const modelCanvas = document.querySelector("#plane-model-canvas");

let modelState = null;

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

function initFloatingPlaneModel() {
  if (!modelCanvas || !window.THREE || !window.THREE.STLLoader) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: modelCanvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x8fb8ff, 1.1);
  keyLight.position.set(5, 4, 7);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(-5, -2, -6);
  scene.add(rimLight);

  const loader = new THREE.STLLoader();
  loader.load(
    "Plane.stl",
    (geometry) => {
      geometry.computeVertexNormals();
      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: 0xc9ddff,
        metalness: 0.35,
        roughness: 0.32,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;

      const bounds = new THREE.Box3().setFromObject(mesh);
      const size = bounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.8 / maxDimension;
      mesh.scale.setScalar(scale);

      scene.add(mesh);
      modelState.mesh = mesh;
      modelCanvas.classList.add("is-ready");
    },
    undefined,
    (error) => {
      console.error("Failed to load Plane.stl", error);
    }
  );

  modelState = {
    scene,
    camera,
    renderer,
    mesh: null,
    targetYRotation: 0,
    currentYRotation: 0,
  };

  function setRendererSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function renderFrame() {
    if (modelState?.mesh) {
      modelState.currentYRotation +=
        (modelState.targetYRotation - modelState.currentYRotation) * 0.08;
      modelState.mesh.rotation.y = modelState.currentYRotation;
      modelState.mesh.rotation.z = 0.08 * Math.sin(modelState.currentYRotation * 0.5);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  }

  setRendererSize();
  renderFrame();
  window.addEventListener("resize", setRendererSize);
}

function updateScrollEffects() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  if (modelState) {
    modelState.targetYRotation = progress * 0.06;
  }

  parallaxItems.forEach((item) => {
    const speed = Number(item.getAttribute("data-speed")) || 0.1;
    item.style.transform = `translateY(${scrollTop * speed * -1}px)`;
  });
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
initFloatingPlaneModel();
updateScrollEffects();
