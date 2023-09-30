// Set up the scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a white background
scene.background = new THREE.Color(0xffffff);

// Declare the geometry variable in the global scope
let geometry;

// Function to create the particle system with smaller particles
function createParticles(scene) {
  const particles = 25000;
  const particleSize = 0.01; // Adjust the size as needed
  const material = new THREE.PointsMaterial({
    color: 0x000000,
    size: particleSize,
  });
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);

  for (let i = 0; i < positions.length; i += 3) {
    const x = (Math.random() - 0.5) * 2; // Adjust the range as needed
    const y = (Math.random() - 0.5) * 2; // Adjust the range as needed
    const z = (Math.random() - 0.5) * 2; // Adjust the range as needed
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  return geometry;
}

// Function to reset or reinitialize particles
function resetParticles(geometry) {
  const positionAttribute = geometry.getAttribute('position');

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = (Math.random() - 0.5) * 2; // Adjust the range as needed
    const y = (Math.random() - 0.5) * 2; // Adjust the range as needed
    const z = (Math.random() - 0.5) * 2; // Adjust the range as needed
    positionAttribute.setXYZ(i, x, y, z);
  }

  positionAttribute.needsUpdate = true;
}

// Function to animate particles
function animateParticles(geometry) {
  const noise = new SimplexNoise();
  const positionAttribute = geometry.getAttribute('position');

  function animate() {
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      const noiseX = noise.noise3D(x, y, z);
      const noiseY = noise.noise3D(y, z, x);
      const noiseZ = noise.noise3D(z, x, y);

      positionAttribute.setXYZ(i, x + noiseX * 0.01, y + noiseY * 0.01, z + noiseZ * 0.01);
    }

    positionAttribute.needsUpdate = true;

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    requestAnimationFrame(animate);
  }

  animate();
}

// Initialize camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3; // Adjust the value to make it closer to the origin


// Handle mouse click to reset particles
let isResettingParticles = false;

window.addEventListener('click', () => {
  if (!isResettingParticles) {
    resetParticles(geometry);
  }
});

// Start the animation
createParticles(scene);
animateParticles(geometry);