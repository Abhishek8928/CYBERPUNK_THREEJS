import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

let renderer, composer;

function initRenderer() {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#model"),
      antialias: true,
     
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set up EffectComposer
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add RGB Shift effect
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms['amount'].value = 0.0015;
    rgbShiftPass.uniforms['angle'].value = 0;
    composer.addPass(rgbShiftPass);

    // If we reach here, renderer was created successfully
    return true;
  } catch (error) {
    console.error('Failed to create WebGL context:', error);
    return false;
  }
}

// Set camera position
camera.position.z = 5;

// Create a GLTFLoader instance
const loader = new GLTFLoader();

// Create an RGBELoader instance
const rgbeLoader = new RGBELoader();

// Load the HDR environment map
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/pond_bridge_night_4k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});

let model;
// Load the 3D model
loader.load(
  './DamagedHelmet.gltf',
  (gltf) => {
    model = gltf.scene;
    // Add the loaded model to the scene
    scene.add(gltf.scene);
  },
  (progress) => {
    console.log(`Loading model: ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

function animate() {
  if (composer) {
    requestAnimationFrame(animate);
    // Render the scene with post-processing
    composer.render();
  }
}

window.addEventListener('mousemove', function(event) {
  if (model) {
    const rotationX = ((event.clientX / window.innerWidth) * 2 - 1) * 0.4;
    const rotationY = ((event.clientY / window.innerHeight) * 2 - 1) * 0.4;
    model.rotation.y = rotationX;
    model.rotation.x = rotationY;
  }
});

window.addEventListener('resize', () => {
  if (renderer && composer) {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer and composer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }
});

// Initialize renderer and start animation loop
if (initRenderer()) {
  animate();
} else {
  // Display an error message to the user
  const errorMessage = document.createElement('div');
  errorMessage.textContent = 'WebGL is not supported in your browser. Please try a different browser or update your current one.';
  errorMessage.style.color = 'white';
  errorMessage.style.position = 'absolute';
  errorMessage.style.top = '50%';
  errorMessage.style.left = '50%';
  errorMessage.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(errorMessage);
}
