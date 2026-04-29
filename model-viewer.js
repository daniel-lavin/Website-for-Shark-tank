import * as THREE from "three";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/STLLoader.js";

const modelCanvas = document.querySelector("#plane-model-canvas");
const modelStatus = document.querySelector("#model-status");

if (!modelCanvas) {
  // No viewer target on page.
} else {
  initFloatingPlaneModel();
}

function initFloatingPlaneModel() {
  if (!window.WebGLRenderingContext) {
    setStatus("WebGL is disabled in this browser.");
    return;
  }

  if (window.location.protocol === "file:") {
    setStatus("Use a local server (localhost) to load Plane.stl.");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: modelCanvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.58);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x8fb8ff, 1.1);
  keyLight.position.set(5, 4, 7);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.52);
  rimLight.position.set(-5, -2, -6);
  scene.add(rimLight);

  let mesh = null;
  let currentYRotation = 0;
  let targetYRotation = 0;

  const loader = new STLLoader();
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

      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;

      const bounds = new THREE.Box3().setFromObject(mesh);
      const size = bounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      const scale = 3.6 / maxDimension;
      mesh.scale.setScalar(scale);
      mesh.position.set(1.65, -0.28, 0);

      scene.add(mesh);
      hideStatus();
    },
    undefined,
    (error) => {
      console.error("Failed to load Plane.stl", error);
      setStatus("Could not load Plane.stl from localhost.");
    }
  );

  function setRendererSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function updateTargetRotationFromScroll() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    targetYRotation = -progress * Math.PI * 1.4;
  }

  function renderFrame() {
    if (mesh) {
      currentYRotation += (targetYRotation - currentYRotation) * 0.08;
      mesh.rotation.y = currentYRotation;
      mesh.rotation.z = 0;
      mesh.rotation.x = -Math.PI / 2;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  }

  setRendererSize();
  updateTargetRotationFromScroll();
  renderFrame();

  window.addEventListener("scroll", updateTargetRotationFromScroll, { passive: true });
  window.addEventListener("resize", setRendererSize);
}

function setStatus(message) {
  if (!modelStatus) {
    return;
  }
  modelStatus.textContent = message;
  modelStatus.classList.remove("hidden");
}

function hideStatus() {
  if (!modelStatus) {
    return;
  }
  modelStatus.classList.add("hidden");
}
