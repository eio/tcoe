// Parameters for tuning
const ZOOM_FACTOR = 3; // Higher numbers are further away
const CAM_ROTATION = 0.005; // Adjust the rotation speed as needed

// Set up the scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a white background
scene.background = new THREE.Color(0xffffff);

// Declare the geometry variable in the global scope
let geometry;

// Define all the states
const CURL_NOISE = "applyCurlNoise";
const POS_GRAVITY = "applyPositiveGravity"; 
const NEG_GRAVITY = "applyNegativeGravity"; 
// Declare a flag to track the current state
let currentState = CURL_NOISE;

// Store the target position for moving towards the click
let targetPosition = new THREE.Vector3();

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

// Function to apply gravity
function applyGravity() {
    const groupCenterX = 0; // X-coordinate of the center of the group
    const groupCenterY = 0; // Y-coordinate of the center of the group
    const groupCenterZ = 0; // Z-coordinate of the center of the group

    // Move particles toward the group center
    const dx = groupCenterX - x;
    const dy = groupCenterY - y;
    const dz = groupCenterZ - z;

    // Calculate the distance to the group center
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Apply gravitational force
    const forceX = (G * dx) / distance;
    const forceY = (G * dy) / distance;
    const forceZ = (G * dz) / distance;

    x = x + forceX
    y = y + forceY
    z = z + forceZ
    return 
    // Update particle positions with the applied force
    positionAttribute.setXYZ(i, x + forceX, y + forceY, z + forceZ);
}

function applyGravity(positionAttribute, i, x, y, z, G) {
  const groupCenterX = 0;
  const groupCenterY = 0;
  const groupCenterZ = 0;

  const dx = groupCenterX - x;
  const dy = groupCenterY - y;
  const dz = groupCenterZ - z;

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const forceX = (G * dx) / distance;
  const forceY = (G * dy) / distance;
  const forceZ = (G * dz) / distance;

  positionAttribute.setXYZ(i, x + forceX, y + forceY, z + forceZ);
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

      if (currentState === CURL_NOISE) {
        // Apply curl noise diffusion
        const noiseX = noise.noise3D(x, y, z);
        const noiseY = noise.noise3D(y, z, x);
        const noiseZ = noise.noise3D(z, x, y);

        positionAttribute.setXYZ(i, x + noiseX * 0.01, y + noiseY * 0.01, z + noiseZ * 0.01);
      } else if (currentState === POS_GRAVITY) {
        // // Move particles towards the target position (click location)
        // const direction = new THREE.Vector3();
        // direction.copy(targetPosition).sub(new THREE.Vector3(x, y, z)).normalize();
        // const speed = 0.01; // Adjust the separation distance as needed
        // positionAttribute.setXYZ(i, x + direction.x * speed, y + direction.y * speed, z + direction.z * speed);

        // Call the applyGravity function to apply the positive gravitational force
        applyGravity(positionAttribute, i, x, y, z, 0.01);
      } else if (currentState === NEG_GRAVITY) {
        // Move particles away from each other
        // Call the applyGravity function to apply the negative gravitational force
        applyGravity(positionAttribute, i, x, y, z, -0.01);
      }
    }

    positionAttribute.needsUpdate = true;

    // Rotate the camera around the origin
    const newX = camera.position.x * Math.cos(CAM_ROTATION) - camera.position.z * Math.sin(CAM_ROTATION);
    const newZ = camera.position.x * Math.sin(CAM_ROTATION) + camera.position.z * Math.cos(CAM_ROTATION);

    camera.position.x = newX;
    camera.position.z = newZ;

    // Update the camera target to look at the origin
    camera.lookAt(0, 0, 0);

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    requestAnimationFrame(animate);
  }

  animate();
}

// Initialize camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = ZOOM_FACTOR; // Adjust the value to make it closer to the origin

window.addEventListener('click', () => {
    // Toggle between states
    if (currentState === POS_GRAVITY) {
      currentState = NEG_GRAVITY;
    } else if (currentState === NEG_GRAVITY) {
      currentState = CURL_NOISE;
    } else {
      currentState = POS_GRAVITY;
    }
});

// Start the animation
createParticles(scene);
animateParticles(geometry);
