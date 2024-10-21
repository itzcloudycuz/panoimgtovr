import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls, sphereMesh;
const loader = document.getElementById('loader');

// Initialize scene, camera, and renderer
function initScene() {
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 600); // Adjusted camera position

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);  // Black background
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append renderer to the body
    document.body.appendChild(renderer.domElement);

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Initialize controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
}

// Create the sphere for the 360° image
function createSphere() {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);  // Flip the sphere inside out

    const material = new THREE.MeshBasicMaterial({
        color: 0x000000, // Default black material
        side: THREE.DoubleSide // Enable double-sided rendering
    });

    sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
}

// Handle file upload and texture application
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file || !sphereMesh) return; // Ensure sphereMesh is defined

    const reader = new FileReader();
    loader.style.display = 'block';  // Show loader while image is processing

    reader.onload = function (e) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            e.target.result,
            function (texture) {
                // Apply the texture to the sphere
                sphereMesh.material.map = texture;
                sphereMesh.material.needsUpdate = true;
                loader.style.display = 'none';  // Hide loader once the image is applied
            },
            undefined,
            function (err) {
                loader.style.display = 'none';
                console.error('Error loading texture:', err);
                alert('There was an error loading the image. Please try again.');
            }
        );
    };

    reader.readAsDataURL(file);
});

// Animation loop
function animate() {
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
}

// Initialize everything
initScene();
createSphere();
animate();
