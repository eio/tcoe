// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a white background
scene.background = new THREE.Color(0xffffff);

function createLargerParticles() {
    // Create the particle system
    const particles = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);

    for (let i = 0; i < positions.length; i += 3) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x000000 });
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    return geometry;
}

function createSmallerParticles() {
    // Create the particle system with smaller particles
    const particleSize = 0.02; // Adjust the size as needed
    const material = new THREE.PointsMaterial({
        color: 0x000000,
        size: particleSize,
    });
    const particles = 10000;
    const geometry = new THREE.BufferGeometry();
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

//geometry = createLargerParticles();
geometry = createSmallerParticles();

// Create curl noise using SimplexNoise
const noise = new SimplexNoise();

function animateParticles() {
    const positionAttribute = geometry.getAttribute('position');

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

    renderer.render(scene, camera);

    requestAnimationFrame(animateParticles);
}

animateParticles();
