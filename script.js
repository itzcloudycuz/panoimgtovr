import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', function () {
    let camera, scene, renderer, sphere, material, controls;
    let textureLoader = new THREE.TextureLoader();

    init();
    animate();

    function init() {
        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.position.set(0, 0, 0.1);  // Start slightly inside the sphere

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create the sphere geometry for the panoramic image
        const geometry = new THREE.SphereGeometry(100, 60, 40);
        geometry.scale(-1, 1, 1);  // Flip the sphere inside-out

        // Default material (empty until an image is uploaded)
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add OrbitControls to enable mouse interaction
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;  // Disable zoom if not needed
        controls.update();

        // Handle image upload
        const uploadButton = document.getElementById('upload-button');
        uploadButton.addEventListener('change', handleImageUpload);

        // Handle "Generate VR" button
        const generateButton = document.getElementById('generate-button');
        generateButton.addEventListener('click', enableVRMode);

        window.addEventListener('resize', onWindowResize, false);
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                textureLoader.load(imageUrl, function(texture) {
                    material.map = texture;
                    material.needsUpdate = true;  // Trigger a re-render
                    document.getElementById('generate-button').style.visibility = 'visible'; // Show button
                });
            };
            reader.readAsDataURL(file);  // Ensure this works properly
        }
    }

    async function enableVRMode() {
        console.log("WebXR available:", !!navigator.xr);
        const isSupported = navigator.xr && await navigator.xr.isSessionSupported('immersive-vr');
        console.log("Is session supported:", isSupported);

        if (renderer.xr.isPresenting) {
            // If already in VR, exit VR
            renderer.xr.end();
        } else {
            // Enable VR mode
            if (isSupported) {
                renderer.xr.enabled = true;
                document.body.appendChild(VRButton.createButton(renderer));
            } else {
                alert("VR not supported on this device or browser.");
            }
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();  // Update controls on every frame
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
});
