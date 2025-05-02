import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

// Main application class
class DeepSeaExplorer {
    constructor() {
        // Show loading screen
        this.showLoadingScreen();

        // Initialize game state
        this.oxygenLevel = 100;
        this.flashlightOn = true;
        this.discoveredItems = [];
        this.maxDepth = 20; // Maximum depth in meters

        // Start initialization
        this.initialize();
    }

    showLoadingScreen() {
        // Get loading screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.querySelector('.loading-bar');

        // Simulate loading progress
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);

                // Hide loading screen after a short delay
                setTimeout(() => {
                    this.loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        this.loadingScreen.style.display = 'none';
                    }, 1000);
                }, 500);
            }

            // Update loading bar
            this.loadingBar.style.width = `${progress}%`;
        }, 200);
    }

    initialize() {
        // Create the scene
        this.scene = new THREE.Scene();

        // Set up the camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 30);

        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Set up first-person controls
        this.setupControls();

        // Set up keyboard controls
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.setupKeyControls();

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x0077be, 0.5);
        this.scene.add(ambientLight);

        // Add directional light (simulating sun through water)
        const directionalLight = new THREE.DirectionalLight(0x0077be, 0.8);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);

        // Add underwater fog
        this.scene.fog = new THREE.FogExp2(0x0077be, 0.02);
        this.scene.background = new THREE.Color(0x0077be);

        // Create the ocean floor
        this.createOceanFloor();

        // Create coral reefs
        this.createCoralReefs();

        // Create seaweed
        this.createSeaweed();

        // Create fish
        this.createFish();

        // Create bubbles
        this.createBubbles();

        // Create shipwreck
        this.createShipwreck();

        // Set up points of interest for discoveries
        this.setupDiscoveryPoints();

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start animation loop
        this.animate();
    }

    createOceanFloor() {
        // Create a large plane for the ocean floor
        const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);

        // Add some variation to the ocean floor
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 10 - 5; // Random height
        }

        // Update normals after modifying vertices
        geometry.computeVertexNormals();

        // Create material with sandy texture
        const material = new THREE.MeshStandardMaterial({
            color: 0xd2b48c,
            roughness: 0.8,
            metalness: 0.2,
        });

        const oceanFloor = new THREE.Mesh(geometry, material);
        oceanFloor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        oceanFloor.position.y = -20; // Position below the camera

        this.scene.add(oceanFloor);
    }

    createCoralReefs() {
        // Create a group to hold all coral pieces
        const coralGroup = new THREE.Group();

        // Create several coral formations
        for (let i = 0; i < 20; i++) {
            // Random position on the ocean floor
            const x = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;

            // Create a coral formation
            const coralFormation = this.createCoralFormation();
            coralFormation.position.set(x, -19, z); // Position just above the ocean floor
            coralGroup.add(coralFormation);
        }

        this.scene.add(coralGroup);
    }

    createCoralFormation() {
        // Create a group for this coral formation
        const formation = new THREE.Group();

        // Add several coral pieces to the formation
        const numPieces = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numPieces; i++) {
            // Choose a random coral type
            const coralType = Math.floor(Math.random() * 3);
            let coral;

            switch (coralType) {
                case 0: // Branching coral
                    coral = this.createBranchingCoral();
                    break;
                case 1: // Brain coral
                    coral = this.createBrainCoral();
                    break;
                case 2: // Table coral
                    coral = this.createTableCoral();
                    break;
            }

            // Position within the formation
            coral.position.set(
                Math.random() * 4 - 2,
                Math.random() * 2,
                Math.random() * 4 - 2
            );

            // Random rotation
            coral.rotation.y = Math.random() * Math.PI * 2;

            // Random scale
            const scale = Math.random() * 0.5 + 0.5;
            coral.scale.set(scale, scale, scale);

            formation.add(coral);
        }

        return formation;
    }

    createBranchingCoral() {
        // Create a branching coral using cylinders
        const coral = new THREE.Group();

        // Create the main stem
        const stemGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
        const coralMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random() * 0.3 + 0.7, Math.random() * 0.3, Math.random() * 0.3 + 0.7),
            roughness: 0.8,
            metalness: 0.2
        });

        const stem = new THREE.Mesh(stemGeometry, coralMaterial);
        stem.position.y = 1.5;
        coral.add(stem);

        // Add branches
        const numBranches = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < numBranches; i++) {
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2, 8);
            const branch = new THREE.Mesh(branchGeometry, coralMaterial);

            // Position the branch
            branch.position.y = Math.random() * 2 + 1;
            branch.position.x = Math.random() * 1 - 0.5;
            branch.position.z = Math.random() * 1 - 0.5;

            // Rotate the branch
            branch.rotation.x = Math.random() * 0.5 - 0.25;
            branch.rotation.z = Math.random() * 0.5 - 0.25;

            coral.add(branch);
        }

        return coral;
    }

    createBrainCoral() {
        // Create a brain coral using a sphere with a special material
        const geometry = new THREE.SphereGeometry(1, 16, 16);

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random() * 0.3 + 0.7, Math.random() * 0.3, Math.random() * 0.3 + 0.7),
            roughness: 0.9,
            metalness: 0.1,
            wireframe: false
        });

        const coral = new THREE.Mesh(geometry, material);
        coral.position.y = 1;

        return coral;
    }

    createTableCoral() {
        // Create a table coral using a cylinder and a disc
        const group = new THREE.Group();

        // Create the stem
        const stemGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random() * 0.3 + 0.7, Math.random() * 0.3, Math.random() * 0.3 + 0.7),
            roughness: 0.8,
            metalness: 0.2
        });

        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1;
        group.add(stem);

        // Create the table top
        const tableGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 16);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random() * 0.3 + 0.7, Math.random() * 0.3, Math.random() * 0.3 + 0.7),
            roughness: 0.7,
            metalness: 0.3
        });

        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 2.1;
        group.add(table);

        return group;
    }

    createSeaweed() {
        // Create several seaweed clusters
        for (let i = 0; i < 30; i++) {
            // Random position on the ocean floor
            const x = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;

            // Create a seaweed cluster
            const seaweedCluster = this.createSeaweedCluster();
            seaweedCluster.position.set(x, -19, z); // Position just above the ocean floor

            this.scene.add(seaweedCluster);
        }
    }

    createSeaweedCluster() {
        // Create a group for this seaweed cluster
        const cluster = new THREE.Group();

        // Add several seaweed strands to the cluster
        const numStrands = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numStrands; i++) {
            // Create a seaweed strand
            const strand = this.createSeaweedStrand();

            // Position within the cluster
            strand.position.set(
                Math.random() * 2 - 1,
                0,
                Math.random() * 2 - 1
            );

            cluster.add(strand);
        }

        return cluster;
    }

    createSeaweedStrand() {
        // Create a seaweed strand using a series of boxes
        const strand = new THREE.Group();

        // Choose a random height for this strand
        const height = Math.random() * 5 + 5;
        const numSegments = Math.floor(height);

        // Choose a random color (green to teal)
        const color = new THREE.Color(
            Math.random() * 0.2,
            Math.random() * 0.3 + 0.5,
            Math.random() * 0.3 + 0.2
        );

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });

        // Create the segments
        for (let i = 0; i < numSegments; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 1, 0.1);
            const segment = new THREE.Mesh(geometry, material);

            // Position the segment
            segment.position.y = i + 0.5;

            // Add some random rotation to make it look more natural
            segment.rotation.x = Math.sin(i * 0.5) * 0.2;
            segment.rotation.z = Math.cos(i * 0.5) * 0.2;

            strand.add(segment);

            // Store the segment for animation
            if (!this.seaweedSegments) {
                this.seaweedSegments = [];
            }

            this.seaweedSegments.push({
                mesh: segment,
                initialRotation: {
                    x: segment.rotation.x,
                    z: segment.rotation.z
                },
                phaseOffset: Math.random() * Math.PI * 2
            });
        }

        return strand;
    }

    createFish() {
        // Create fish schools
        this.fishes = [];

        // Create several schools of fish
        for (let i = 0; i < 5; i++) {
            const schoolSize = Math.floor(Math.random() * 10) + 5;
            const schoolCenter = new THREE.Vector3(
                Math.random() * 100 - 50,
                Math.random() * 20 - 5,
                Math.random() * 100 - 50
            );

            // Create a school of fish
            for (let j = 0; j < schoolSize; j++) {
                const fish = this.createSingleFish();

                // Position the fish near the school center
                fish.position.set(
                    schoolCenter.x + Math.random() * 10 - 5,
                    schoolCenter.y + Math.random() * 6 - 3,
                    schoolCenter.z + Math.random() * 10 - 5
                );

                // Store the fish for animation
                this.fishes.push({
                    mesh: fish,
                    velocity: new THREE.Vector3(
                        Math.random() * 0.1 - 0.05,
                        Math.random() * 0.05 - 0.025,
                        Math.random() * 0.1 - 0.05
                    ),
                    schoolCenter: schoolCenter.clone(),
                    offset: new THREE.Vector3(
                        Math.random() * 10 - 5,
                        Math.random() * 6 - 3,
                        Math.random() * 10 - 5
                    )
                });

                this.scene.add(fish);
            }
        }
    }

    createSingleFish() {
        // Create a simple fish using a group of meshes
        const fish = new THREE.Group();

        // Choose a random color for the fish
        const color = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
        );

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });

        // Create the body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.rotation.x = Math.PI / 2;
        fish.add(body);

        // Create the tail
        const tailGeometry = new THREE.ConeGeometry(0.5, 1, 4);
        const tail = new THREE.Mesh(tailGeometry, material);
        tail.rotation.x = -Math.PI / 2;
        tail.position.z = 1.5;
        fish.add(tail);

        // Create fins
        const finGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const finMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });

        // Left fin
        const leftFin = new THREE.Mesh(finGeometry, finMaterial);
        leftFin.rotation.y = Math.PI / 4;
        leftFin.position.set(-0.5, 0, -0.3);
        fish.add(leftFin);

        // Right fin
        const rightFin = new THREE.Mesh(finGeometry, finMaterial);
        rightFin.rotation.y = -Math.PI / 4;
        rightFin.position.set(0.5, 0, -0.3);
        fish.add(rightFin);

        return fish;
    }

    createBubbles() {
        // Create bubbles
        this.bubbles = [];

        // Create several bubble emitters
        for (let i = 0; i < 10; i++) {
            // Random position on the ocean floor
            const x = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;

            // Create bubbles from this position
            for (let j = 0; j < 5; j++) {
                const bubble = this.createSingleBubble();

                // Position the bubble at the emitter
                bubble.position.set(
                    x + Math.random() * 2 - 1,
                    -19, // Just above the ocean floor
                    z + Math.random() * 2 - 1
                );

                // Store the bubble for animation
                this.bubbles.push({
                    mesh: bubble,
                    velocity: new THREE.Vector3(
                        Math.random() * 0.02 - 0.01,
                        Math.random() * 0.05 + 0.05,
                        Math.random() * 0.02 - 0.01
                    ),
                    initialY: -19
                });

                this.scene.add(bubble);
            }
        }
    }

    createSingleBubble() {
        // Create a bubble using a sphere
        const geometry = new THREE.SphereGeometry(Math.random() * 0.2 + 0.1, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.3
        });

        return new THREE.Mesh(geometry, material);
    }

    createShipwreck() {
        // Create a simple shipwreck using basic shapes
        const shipwreck = new THREE.Group();

        // Create the hull
        const hullGeometry = new THREE.BoxGeometry(10, 3, 30);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });

        const hull = new THREE.Mesh(hullGeometry, woodMaterial);
        hull.position.y = 1.5;
        shipwreck.add(hull);

        // Create the deck
        const deckGeometry = new THREE.BoxGeometry(10, 0.5, 30);
        const deck = new THREE.Mesh(deckGeometry, woodMaterial);
        deck.position.y = 3.25;
        shipwreck.add(deck);

        // Create masts (broken)
        const mast1Geometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
        const mast1 = new THREE.Mesh(mast1Geometry, woodMaterial);
        mast1.position.set(0, 8, -5);
        mast1.rotation.x = Math.PI / 4;
        mast1.rotation.z = Math.PI / 6;
        shipwreck.add(mast1);

        const mast2Geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
        const mast2 = new THREE.Mesh(mast2Geometry, woodMaterial);
        mast2.position.set(0, 7, 5);
        mast2.rotation.x = -Math.PI / 6;
        mast2.rotation.z = -Math.PI / 8;
        shipwreck.add(mast2);

        // Position the shipwreck
        shipwreck.position.set(30, -17, -30);
        shipwreck.rotation.y = Math.PI / 4;

        this.scene.add(shipwreck);
    }

    setupControls() {
        // Create pointer lock controls for first-person view
        this.controls = new PointerLockControls(this.camera, document.body);

        // Add click event to lock controls
        const blocker = document.createElement('div');
        blocker.id = 'blocker';

        const instructionsContainer = document.createElement('div');
        instructionsContainer.style.maxWidth = '700px';
        instructionsContainer.style.padding = '20px';
        instructionsContainer.style.borderRadius = '10px';
        instructionsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        instructionsContainer.style.border = '2px solid rgba(79, 195, 247, 0.5)';

        const title = document.createElement('h2');
        title.textContent = 'Realm of the Deep Sea';

        const description = document.createElement('p');
        description.innerHTML = 'Explore the mysterious underwater world filled with colorful marine life, swaying seaweed, and ancient shipwrecks. Dive deep into the abyss and discover the secrets of the deep sea.';

        const controls = document.createElement('p');
        controls.innerHTML = '<strong>Controls:</strong><br>WASD = Move around<br>SPACE = Swim up<br>SHIFT = Swim down<br>MOUSE = Look around<br><br>Click anywhere to begin your underwater adventure!';

        instructionsContainer.appendChild(title);
        instructionsContainer.appendChild(description);
        instructionsContainer.appendChild(controls);
        blocker.appendChild(instructionsContainer);
        document.body.appendChild(blocker);

        blocker.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            blocker.style.display = 'none';
            // Hide the info div when exploring
            document.getElementById('info').style.display = 'none';
        });

        this.controls.addEventListener('unlock', () => {
            blocker.style.display = 'flex';
            // Show the info div when not exploring
            document.getElementById('info').style.display = 'block';
        });

        // Position the camera underwater
        this.camera.position.set(0, 0, 30);

        // Add flashlight (spotlight attached to camera)
        this.addFlashlight();
    }

    addFlashlight() {
        // Create a spotlight to simulate a flashlight
        const flashlight = new THREE.SpotLight(0xffffff, 1, 50, Math.PI / 6, 0.5, 1);
        flashlight.position.set(0, 0, 0);
        flashlight.target.position.set(0, 0, -1);

        // Add the spotlight and its target to the camera
        this.camera.add(flashlight);
        this.camera.add(flashlight.target);

        // Add the camera to the scene
        this.scene.add(this.camera);
    }

    setupKeyControls() {
        // Set up keyboard controls
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    this.moveUp = true;
                    break;
                case 'ShiftLeft':
                    this.moveDown = true;
                    break;
                case 'KeyF':
                    // Toggle flashlight on F key press
                    this.toggleFlashlight();
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'Space':
                    this.moveUp = false;
                    break;
                case 'ShiftLeft':
                    this.moveDown = false;
                    break;
            }
        });

        // Add click handler for flashlight indicator
        const flashlightIndicator = document.getElementById('flashlight-indicator');
        flashlightIndicator.addEventListener('click', () => {
            this.toggleFlashlight();
        });

        // Initialize flashlight indicator state
        if (this.flashlightOn) {
            flashlightIndicator.classList.add('on');
        } else {
            flashlightIndicator.classList.add('off');
        }
    }

    updateMovement() {
        // Update movement based on keyboard input
        const time = performance.now();

        if (this.prevTime === undefined) {
            this.prevTime = time;
        }

        const delta = (time - this.prevTime) / 1000;
        this.prevTime = time;

        // Calculate velocity based on input
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= this.velocity.y * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.y = Number(this.moveUp) - Number(this.moveDown);
        this.direction.normalize();

        // Apply movement
        const speed = 15.0;
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * speed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * speed * delta;
        if (this.moveUp || this.moveDown) this.velocity.y += this.direction.y * speed * delta;

        // Apply velocity to controls
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        // Apply vertical movement directly to camera
        this.camera.position.y += this.velocity.y * delta;

        // Keep the camera within bounds
        if (this.camera.position.y < -18) this.camera.position.y = -18;
        if (this.camera.position.y > 15) this.camera.position.y = 15;
    }

    setupDiscoveryPoints() {
        // Create points of interest that can be discovered
        this.discoveryPoints = [
            {
                position: new THREE.Vector3(20, -15, -30),
                radius: 10,
                name: "Ancient Coral Formation",
                description: "A rare coral formation estimated to be over 500 years old.",
                discovered: false
            },
            {
                position: new THREE.Vector3(-40, -18, 25),
                radius: 8,
                name: "Underwater Cave",
                description: "A mysterious cave with glowing minerals inside.",
                discovered: false
            },
            {
                position: new THREE.Vector3(0, -19, -80),
                radius: 15,
                name: "Shipwreck Treasure",
                description: "Gold coins and artifacts from a long-lost trading vessel.",
                discovered: false
            },
            {
                position: new THREE.Vector3(-60, -10, -20),
                radius: 12,
                name: "Bioluminescent Algae",
                description: "A rare species that produces a beautiful blue glow.",
                discovered: false
            },
            {
                position: new THREE.Vector3(70, -5, 10),
                radius: 10,
                name: "School of Rare Fish",
                description: "A group of fish thought to be extinct for centuries.",
                discovered: false
            }
        ];

        // Add visual markers for debugging (can be removed in final version)
        /*
        this.discoveryPoints.forEach(point => {
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(1, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
            );
            marker.position.copy(point.position);
            this.scene.add(marker);
        });
        */
    }

    checkDiscoveries() {
        // Check if player is near any discovery points
        const playerPosition = this.camera.position.clone();

        this.discoveryPoints.forEach(point => {
            if (!point.discovered) {
                const distance = playerPosition.distanceTo(point.position);

                if (distance < point.radius) {
                    // Mark as discovered
                    point.discovered = true;
                    this.discoveredItems.push(point.name);

                    // Show discovery notification
                    this.showDiscoveryNotification(point.name, point.description);
                }
            }
        });
    }

    showDiscoveryNotification(title, description) {
        const notification = document.getElementById('discovery-notification');
        const discoveryText = document.getElementById('discovery-text');

        // Update notification content
        document.querySelector('.discovery-content h3').textContent = title;
        discoveryText.textContent = description;

        // Show notification
        notification.classList.add('show');

        // Hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;

        // Update flashlight in scene
        const flashlight = this.camera.children[0];
        flashlight.intensity = this.flashlightOn ? 1 : 0;

        // Update UI
        const flashlightIndicator = document.getElementById('flashlight-indicator');
        if (this.flashlightOn) {
            flashlightIndicator.classList.add('on');
            flashlightIndicator.classList.remove('off');
        } else {
            flashlightIndicator.classList.add('off');
            flashlightIndicator.classList.remove('on');
        }
    }

    updateOxygenLevel() {
        // Decrease oxygen based on depth
        const depth = -this.camera.position.y;

        // Oxygen decreases faster at greater depths
        let decreaseRate = 0.01; // Base rate

        if (depth > 15) {
            decreaseRate = 0.05; // Faster at deep depths
        } else if (depth > 10) {
            decreaseRate = 0.03; // Medium rate
        } else if (depth > 5) {
            decreaseRate = 0.02; // Slow rate
        }

        // Decrease oxygen
        this.oxygenLevel = Math.max(0, this.oxygenLevel - decreaseRate);

        // Update oxygen meter UI
        const oxygenBar = document.querySelector('.oxygen-bar');
        oxygenBar.style.width = `${this.oxygenLevel}%`;

        // Change color based on oxygen level
        if (this.oxygenLevel < 20) {
            oxygenBar.style.background = 'linear-gradient(to right, #f44336, #f44336)';
        } else if (this.oxygenLevel < 50) {
            oxygenBar.style.background = 'linear-gradient(to right, #f44336, #ff9800)';
        } else {
            oxygenBar.style.background = 'linear-gradient(to right, #f44336, #ff9800, #4caf50)';
        }

        // If oxygen is critically low, show warning
        if (this.oxygenLevel < 10 && !this.lowOxygenWarning) {
            this.lowOxygenWarning = true;
            this.showDiscoveryNotification("Warning: Low Oxygen", "Return to the surface to replenish your oxygen supply!");
        }

        // Replenish oxygen when near surface
        if (depth < 2) {
            this.oxygenLevel = Math.min(100, this.oxygenLevel + 0.1);
            this.lowOxygenWarning = false;
        }
    }

    updateCompass() {
        // Update the compass based on camera direction
        const compassArrow = document.querySelector('.compass-arrow');
        if (compassArrow) {
            // Get the camera's forward direction
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(this.camera.quaternion);

            // Calculate the angle in the XZ plane (horizontal)
            const angle = Math.atan2(direction.x, direction.z);

            // Convert to degrees and rotate the compass arrow
            const degrees = (angle * 180 / Math.PI);
            compassArrow.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
        }
    }

    updateDepthMeter() {
        // Update the depth meter based on camera position
        const depthValue = document.querySelector('.depth-value');
        const depthBar = document.querySelector('.depth-bar');

        if (depthValue && depthBar) {
            // Calculate depth (negative Y position)
            const depth = -this.camera.position.y;
            const depthPercentage = Math.min(100, (depth / this.maxDepth) * 100);

            // Display depth in meters
            depthValue.textContent = `${Math.max(0, Math.round(depth))}m`;

            // Update depth bar
            depthBar.style.width = `${depthPercentage}%`;

            // Change color based on depth
            if (depth > 15) {
                depthValue.style.color = '#ff5252'; // Deep red for deep water
            } else if (depth > 10) {
                depthValue.style.color = '#ff9800'; // Orange for medium depth
            } else if (depth > 5) {
                depthValue.style.color = '#4fc3f7'; // Blue for shallow water
            } else {
                depthValue.style.color = '#4caf50'; // Green for surface
            }
        }
    }

    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update player movement and UI
        if (this.controls.isLocked) {
            this.updateMovement();
            this.updateCompass();
            this.updateDepthMeter();
            this.updateOxygenLevel();
            this.checkDiscoveries();

            // Update fog density based on depth
            const depth = -this.camera.position.y;
            this.scene.fog.density = 0.01 + (depth / 100); // Increase fog with depth

            // Update water color based on depth
            const depthFactor = Math.min(1, depth / 20);
            const waterColor = new THREE.Color(
                0.0 + (0.0 * depthFactor),  // R
                0.47 - (0.4 * depthFactor), // G
                0.75 - (0.5 * depthFactor)  // B
            );
            this.scene.background = waterColor;
            this.scene.fog.color = waterColor;
        }

        // Animate seaweed
        if (this.seaweedSegments) {
            const time = Date.now() * 0.001;

            this.seaweedSegments.forEach(segment => {
                segment.mesh.rotation.x = segment.initialRotation.x + Math.sin(time + segment.phaseOffset) * 0.1;
                segment.mesh.rotation.z = segment.initialRotation.z + Math.cos(time + segment.phaseOffset) * 0.1;
            });
        }

        // Animate fish
        if (this.fishes) {
            this.fishes.forEach(fish => {
                // Move the fish
                fish.mesh.position.add(fish.velocity);

                // Rotate the fish to face its direction of movement
                if (fish.velocity.length() > 0.01) {
                    fish.mesh.lookAt(fish.mesh.position.clone().add(fish.velocity));
                    fish.mesh.rotateY(Math.PI / 2);
                }

                // Make fish swim in a school
                const targetPosition = fish.schoolCenter.clone().add(fish.offset);
                const direction = targetPosition.clone().sub(fish.mesh.position);

                // Apply a small force towards the target position
                fish.velocity.add(direction.multiplyScalar(0.001));

                // Apply a small random force
                fish.velocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.01
                ));

                // Limit velocity
                if (fish.velocity.length() > 0.2) {
                    fish.velocity.normalize().multiplyScalar(0.2);
                }

                // Slowly move the school center
                fish.schoolCenter.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.05
                ));

                // Keep the school within bounds
                if (fish.schoolCenter.x < -80) fish.schoolCenter.x = -80;
                if (fish.schoolCenter.x > 80) fish.schoolCenter.x = 80;
                if (fish.schoolCenter.y < -15) fish.schoolCenter.y = -15;
                if (fish.schoolCenter.y > 10) fish.schoolCenter.y = 10;
                if (fish.schoolCenter.z < -80) fish.schoolCenter.z = -80;
                if (fish.schoolCenter.z > 80) fish.schoolCenter.z = 80;

                // Make fish avoid the player
                const distanceToPlayer = fish.mesh.position.distanceTo(this.camera.position);
                if (distanceToPlayer < 10) {
                    const avoidDirection = fish.mesh.position.clone().sub(this.camera.position).normalize();
                    fish.velocity.add(avoidDirection.multiplyScalar(0.02));
                }
            });
        }

        // Animate bubbles
        if (this.bubbles) {
            this.bubbles.forEach(bubble => {
                // Move the bubble
                bubble.mesh.position.add(bubble.velocity);

                // If the bubble reaches the surface, reset it
                if (bubble.mesh.position.y > 20) {
                    bubble.mesh.position.y = bubble.initialY;
                    bubble.mesh.position.x += Math.random() * 2 - 1;
                    bubble.mesh.position.z += Math.random() * 2 - 1;
                }

                // Add slight wobble to bubbles
                bubble.mesh.position.x += Math.sin(Date.now() * 0.001 + bubble.initialY) * 0.01;
                bubble.mesh.position.z += Math.cos(Date.now() * 0.001 + bubble.initialY) * 0.01;
            });
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new DeepSeaExplorer();
});
