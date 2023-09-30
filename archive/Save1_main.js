// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a white background
scene.background = new THREE.Color(0xffffff);

// Declare the geometry variable in the global scope
let geometry;

// Function to create the particle system with smaller particles
function createSmallerParticles() {
    // Create the particle system with smaller particles
    const particleSize = 0.02; // Adjust the size as needed
    const material = new THREE.PointsMaterial({
        color: 0x000000,
        size: particleSize,
    });
    const particles = 10000;
    geometry = new THREE.BufferGeometry(); // Update the global geometry variable
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

createSmallerParticles(); // Initialize with smaller particles
let isResettingParticles = false;

// Function to reset or reinitialize particles
function resetParticles() {
    isResettingParticles = true;

    const positionAttribute = geometry.getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
        // Generate a unique noise seed for each particle
        const particleSeed = Math.random();

        // Create a new noise instance with the particle's seed
        const noise = new SimplexNoise(particleSeed);

        // Reset particle positions to random values using the new noise instance
        const x = (Math.random() - 0.5) * 2; // Adjust the range as needed
        const y = (Math.random() - 0.5) * 2; // Adjust the range as needed
        const z = (Math.random() - 0.5) * 2; // Adjust the range as needed
        positionAttribute.setXYZ(i, x, y, z);
    }

    positionAttribute.needsUpdate = true;

    // Render the scene
    renderer.render(scene, camera);

    // Delay resetting particles to allow the user to observe the current state
    setTimeout(() => {
        isResettingParticles = false;
    }, 1000); // Adjust the delay as needed (1 second in this example)
}

// Function to handle mouse click to reset particles
function handleMouseClick(event) {
    if (!isResettingParticles) {
        resetParticles();
    }
}

// Add event listener for mouse click to reset particles
window.addEventListener('click', handleMouseClick);

// Create curl noise using SimplexNoise
const noise = new SimplexNoise();

// Initialize camera position and target
const cameraPosition = new THREE.Vector3(0, 0, 5); // Initial camera position
const cameraTarget = new THREE.Vector3(0, 0, 0);   // Initial camera target

// Set up camera
camera.position.copy(cameraPosition);
camera.lookAt(cameraTarget);

// Create a variable to control camera rotation
let cameraRotation = 0; // Initial rotation angle

// Function to update camera position and target
function updateCamera() {
    // Update camera position
    const radius = 5; // Adjust the radius as needed
    const cameraSpeed = 0.005; // Adjust the speed as needed
    cameraPosition.x = radius * Math.cos(cameraRotation);
    cameraPosition.z = radius * Math.sin(cameraRotation);
    camera.position.copy(cameraPosition);

    // Update camera target to point at the center of mass of the particles
    const centerOfMass = calculateCenterOfMass(); // Implement this function
    camera.lookAt(centerOfMass);

    // Increment the rotation angle for the next frame
    cameraRotation += cameraSpeed;

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    requestAnimationFrame(() => updateCamera(geometry)); // Pass the geometry to updateCamera
}

// Function to animate particles
function animateParticles(geometry) {
    const positionAttribute = geometry.getAttribute('position'); // Use the passed geometry

    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);

        // Calculate curl noise
        const noiseX = noise.noise3D(x, y, z);
        const noiseY = noise.noise3D(y, z, x);
        const noiseZ = noise.noise3D(z, x, y);

        // Update particle positions
        positionAttribute.setXYZ(i, x + noiseX * 0.01, y + noiseY * 0.01, z + noiseZ * 0.01);
    }

    positionAttribute.needsUpdate = true;

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    requestAnimationFrame(() => animateParticles(geometry)); // Pass the geometry to animateParticles
}

// Function to calculate the center of mass of the particles (adjust as needed)
function calculateCenterOfMass() {
    // Calculate the center of mass based on particle positions
    const total = new THREE.Vector3();
    const positionArray = geometry.getAttribute('position').array; // Access the raw position data

    for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];

        const particlePosition = new THREE.Vector3(x, y, z);
        total.add(particlePosition);
    }

    const centerOfMass = total.divideScalar(positionArray.length / 3); // Divide by 3 because each position has 3 components
    return centerOfMass;
}

// Start the camera animation loop and particle animation loop
updateCamera(geometry);
animateParticles(geometry);
