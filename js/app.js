/**
 * Historical Models of the Universe - 3D Explorer
 * A Three.js application that visualizes different historical cosmic models
 */

class UniverseExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = 'aristotle';
        this.animationFrame = null;
        this.celestialBodies = {};
        this.animationEnabled = true;
        this.time = 0;
        
        // Model descriptions
        this.modelInfo = {
            aristotle: {
                title: "Aristotle's Geocentric Model",
                description: "The earliest systematic model where Earth sits at the center of the universe, surrounded by concentric crystalline spheres carrying the celestial bodies. The outermost sphere contains the fixed stars."
            },
            ptolemaic: {
                title: "Ptolemaic Model with Epicycles",
                description: "Refined geocentric model using epicycles (small circles) to explain the complex motions of planets, particularly retrograde motion. This model dominated for over 1,000 years."
            },
            copernican: {
                title: "Copernican Heliocentric Model",
                description: "Revolutionary model placing the Sun at the center with planets orbiting in circular paths. This challenged the Earth-centered worldview and laid the foundation for modern astronomy."
            },
            galilean: {
                title: "Galilean Model with Moons",
                description: "Enhanced heliocentric model incorporating Galileo's telescopic discoveries, including Jupiter's four largest moons, which provided strong evidence against the geocentric model."
            },
            kepler: {
                title: "Kepler's Elliptical Orbits",
                description: "Refined heliocentric model with elliptical rather than circular orbits, based on careful observations of Mars. This model accurately predicted planetary positions."
            }
        };

        this.init();
    }

    /**
     * Initialize the Three.js scene and set up event listeners
     */
    init() {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        this.loadModel(this.currentModel);
        this.animate();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    }

    /**
     * Set up the Three.js scene, camera, and renderer
     */
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000511);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(50, 30, 50);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);

        // Add stars background
        this.createStarField();
    }

    /**
     * Set up lighting for the scene
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point light (Sun)
        const sunLight = new THREE.PointLight(0xffffff, 1.5, 1000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Directional light for better visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }

    /**
     * Set up camera controls
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 500;
        this.controls.minDistance = 5;
    }

    /**
     * Create a star field background
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 1,
            transparent: true,
            opacity: 0.8
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Model selection buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modelName = e.target.dataset.model;
                this.switchModel(modelName);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Switch between different universe models
     */
    switchModel(modelName) {
        // Update UI
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-model="${modelName}"]`).classList.add('active');

        // Update info panel
        const info = this.modelInfo[modelName];
        const infoPanel = document.getElementById('info-panel');
        infoPanel.innerHTML = `
            <h4>${info.title}</h4>
            <p>${info.description}</p>
        `;

        this.currentModel = modelName;
        this.loadModel(modelName);
    }

    /**
     * Clear current model from scene
     */
    clearScene() {
        // Remove all celestial bodies
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object) {
                this.scene.remove(body.object);
            }
            if (body.orbit) {
                this.scene.remove(body.orbit);
            }
            if (body.label) {
                this.scene.remove(body.label);
            }
        });
        this.celestialBodies = {};
        this.time = 0;
    }

    /**
     * Load a specific universe model
     */
    loadModel(modelName) {
        this.clearScene();

        switch (modelName) {
            case 'aristotle':
                this.createAristotleModel();
                break;
            case 'ptolemaic':
                this.createPtolemaicModel();
                break;
            case 'copernican':
                this.createCopernicanModel();
                break;
            case 'galilean':
                this.createGalileanModel();
                break;
            case 'kepler':
                this.createKeplerModel();
                break;
        }
    }

    /**
     * Create Aristotle's geocentric model with crystalline spheres
     */
    createAristotleModel() {
        // Earth at center
        const earth = this.createCelestialBody('Earth', 3, 0x4a90e2, 0, 0, 0);
        this.celestialBodies.earth = { object: earth };

        // Crystalline spheres (transparent wireframes)
        const sphereRadii = [8, 12, 18, 25, 35, 45, 60];
        const sphereNames = ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars', 'Jupiter', 'Saturn'];
        const sphereColors = [0xc0c0c0, 0x8c7853, 0xffc649, 0xffd700, 0xff6347, 0xdaa520, 0xf4a460];

        sphereNames.forEach((name, i) => {
            const radius = sphereRadii[i];
            const color = sphereColors[i];

            // Create crystalline sphere
            const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                wireframe: true,
                transparent: true,
                opacity: 0.2
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            this.scene.add(sphere);

            // Create celestial body on sphere
            const bodySize = name === 'Sun' ? 2.5 : (name === 'Moon' ? 1 : 1.5);
            const body = this.createCelestialBody(name, bodySize, color, radius, 0, 0);
            this.celestialBodies[name.toLowerCase()] = {
                object: body,
                radius: radius,
                speed: 0.5 / (i + 1) // Outer spheres move slower
            };
        });

        // Fixed stars sphere
        const starsGeometry = new THREE.SphereGeometry(80, 32, 32);
        const starsMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const starsSphere = new THREE.Mesh(starsGeometry, starsMaterial);
        this.scene.add(starsSphere);
    }

    /**
     * Create Ptolemaic model with epicycles
     */
    createPtolemaicModel() {
        // Earth at center
        const earth = this.createCelestialBody('Earth', 3, 0x4a90e2, 0, 0, 0);
        this.celestialBodies.earth = { object: earth };

        // Create planets with epicycles
        const planets = [
            { name: 'Moon', distance: 8, size: 1, color: 0xc0c0c0, epicycleRadius: 0, speed: 2 },
            { name: 'Mercury', distance: 15, size: 1.2, color: 0x8c7853, epicycleRadius: 3, speed: 1.5 },
            { name: 'Venus', distance: 22, size: 1.8, color: 0xffc649, epicycleRadius: 4, speed: 1.2 },
            { name: 'Sun', distance: 30, size: 2.5, color: 0xffd700, epicycleRadius: 0, speed: 0.8 },
            { name: 'Mars', distance: 40, size: 1.5, color: 0xff6347, epicycleRadius: 6, speed: 0.6 },
            { name: 'Jupiter', distance: 55, size: 2, color: 0xdaa520, epicycleRadius: 5, speed: 0.4 },
            { name: 'Saturn', distance: 70, size: 1.8, color: 0xf4a460, epicycleRadius: 4, speed: 0.3 }
        ];

        planets.forEach(planet => {
            // Main orbit
            const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.2, planet.distance + 0.2, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);

            // Planet
            const body = this.createCelestialBody(planet.name, planet.size, planet.color, planet.distance, 0, 0);
            
            this.celestialBodies[planet.name.toLowerCase()] = {
                object: body,
                orbit: orbit,
                distance: planet.distance,
                epicycleRadius: planet.epicycleRadius,
                speed: planet.speed,
                epicycleSpeed: planet.speed * 3
            };

            // Epicycle circle for planets that have them
            if (planet.epicycleRadius > 0) {
                const epicycleGeometry = new THREE.RingGeometry(
                    planet.epicycleRadius - 0.1, 
                    planet.epicycleRadius + 0.1, 
                    32
                );
                const epicycleMaterial = new THREE.MeshBasicMaterial({
                    color: planet.color,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });
                const epicycle = new THREE.Mesh(epicycleGeometry, epicycleMaterial);
                epicycle.rotation.x = Math.PI / 2;
                this.scene.add(epicycle);
                this.celestialBodies[planet.name.toLowerCase()].epicycle = epicycle;
            }
        });
    }

    /**
     * Create Copernican heliocentric model
     */
    createCopernicanModel() {
        // Sun at center
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { object: sun };

        // Planets in heliocentric order
        const planets = [
            { name: 'Mercury', distance: 8, size: 1, color: 0x8c7853, speed: 2.4 },
            { name: 'Venus', distance: 12, size: 1.5, color: 0xffc649, speed: 1.8 },
            { name: 'Earth', distance: 18, size: 2, color: 0x4a90e2, speed: 1.2 },
            { name: 'Mars', distance: 25, size: 1.3, color: 0xff6347, speed: 0.8 },
            { name: 'Jupiter', distance: 45, size: 2.5, color: 0xdaa520, speed: 0.4 },
            { name: 'Saturn', distance: 65, size: 2.2, color: 0xf4a460, speed: 0.3 }
        ];

        planets.forEach(planet => {
            // Orbit
            const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.3, planet.distance + 0.3, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x555555,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);

            // Planet
            const body = this.createCelestialBody(planet.name, planet.size, planet.color, planet.distance, 0, 0);
            this.celestialBodies[planet.name.toLowerCase()] = {
                object: body,
                orbit: orbit,
                distance: planet.distance,
                speed: planet.speed
            };

            // Moon for Earth
            if (planet.name === 'Earth') {
                const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, planet.distance + 3, 0, 0);
                this.celestialBodies.moon = {
                    object: moon,
                    distance: 3,
                    speed: 4,
                    parent: 'earth'
                };
            }
        });
    }

    /**
     * Create Galilean model with Jupiter's moons
     */
    createGalileanModel() {
        // Start with Copernican model
        this.createCopernicanModel();

        // Add Jupiter's four largest moons (Galilean moons)
        const jupiterMoons = [
            { name: 'Io', distance: 3, size: 0.3, color: 0xffff99, speed: 8 },
            { name: 'Europa', distance: 4, size: 0.25, color: 0x87ceeb, speed: 6 },
            { name: 'Ganymede', distance: 5.5, size: 0.4, color: 0x8b7d6b, speed: 4 },
            { name: 'Callisto', distance: 7, size: 0.35, color: 0x696969, speed: 3 }
        ];

        jupiterMoons.forEach(moon => {
            const moonBody = this.createCelestialBody(moon.name, moon.size, moon.color, 
                this.celestialBodies.jupiter.distance + moon.distance, 0, 0);
            
            // Create small orbit around Jupiter
            const orbitGeometry = new THREE.RingGeometry(moon.distance - 0.1, moon.distance + 0.1, 32);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: moon.color,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);

            this.celestialBodies[moon.name.toLowerCase()] = {
                object: moonBody,
                orbit: orbit,
                distance: moon.distance,
                speed: moon.speed,
                parent: 'jupiter'
            };
        });
    }

    /**
     * Create Kepler's model with elliptical orbits
     */
    createKeplerModel() {
        // Sun at center (slightly off-center for ellipses)
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { object: sun };

        // Planets with elliptical parameters
        const planets = [
            { name: 'Mercury', a: 8, e: 0.2, size: 1, color: 0x8c7853, speed: 2.4 },
            { name: 'Venus', a: 12, e: 0.01, size: 1.5, color: 0xffc649, speed: 1.8 },
            { name: 'Earth', a: 18, e: 0.02, size: 2, color: 0x4a90e2, speed: 1.2 },
            { name: 'Mars', a: 25, e: 0.09, size: 1.3, color: 0xff6347, speed: 0.8 },
            { name: 'Jupiter', a: 45, e: 0.05, size: 2.5, color: 0xdaa520, speed: 0.4 },
            { name: 'Saturn', a: 65, e: 0.06, size: 2.2, color: 0xf4a460, speed: 0.3 }
        ];

        planets.forEach(planet => {
            // Create elliptical orbit path
            const orbitPoints = [];
            const segments = 100;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const r = planet.a * (1 - planet.e * planet.e) / (1 + planet.e * Math.cos(theta));
                orbitPoints.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
            }
            
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.4
            });
            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbit);

            // Planet
            const body = this.createCelestialBody(planet.name, planet.size, planet.color, planet.a, 0, 0);
            this.celestialBodies[planet.name.toLowerCase()] = {
                object: body,
                orbit: orbit,
                semiMajorAxis: planet.a,
                eccentricity: planet.e,
                speed: planet.speed,
                angle: Math.random() * Math.PI * 2
            };
        });

        // Add Earth's Moon
        const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, 18 + 3, 0, 0);
        this.celestialBodies.moon = {
            object: moon,
            distance: 3,
            speed: 4,
            parent: 'earth'
        };
    }

    /**
     * Create a celestial body (planet, moon, sun)
     */
    createCelestialBody(name, size, color, x, y, z) {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        });
        const body = new THREE.Mesh(geometry, material);
        body.position.set(x, y, z);
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Add simple label
        this.addLabel(body, name, size);
        
        this.scene.add(body);
        return body;
    }

    /**
     * Add a text label to a celestial body
     */
    addLabel(object, text, size) {
        // Create a simple sprite label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 7);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(8, 2, 1);
        sprite.position.set(0, size + 3, 0);
        
        object.add(sprite);
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        this.updateAnimations();
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Update animations based on current model
     */
    updateAnimations() {
        if (!this.animationEnabled) return;

        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name === 'earth' && this.currentModel === 'aristotle') return; // Earth stays fixed in Aristotle model
            if (name === 'sun' && (this.currentModel === 'copernican' || this.currentModel === 'galilean' || this.currentModel === 'kepler')) return; // Sun stays fixed in heliocentric models

            if (body.parent) {
                // Moon or satellite orbiting around parent
                const parent = this.celestialBodies[body.parent];
                if (parent && parent.object) {
                    const angle = this.time * body.speed;
                    const x = parent.object.position.x + Math.cos(angle) * body.distance;
                    const z = parent.object.position.z + Math.sin(angle) * body.distance;
                    body.object.position.set(x, 0, z);
                    
                    if (body.orbit) {
                        body.orbit.position.copy(parent.object.position);
                    }
                }
            } else if (body.semiMajorAxis && body.eccentricity !== undefined) {
                // Kepler elliptical orbit
                body.angle += body.speed * 0.01;
                const r = body.semiMajorAxis * (1 - body.eccentricity * body.eccentricity) / 
                         (1 + body.eccentricity * Math.cos(body.angle));
                const x = r * Math.cos(body.angle);
                const z = r * Math.sin(body.angle);
                body.object.position.set(x, 0, z);
            } else if (body.distance !== undefined) {
                // Circular orbit
                let angle = this.time * body.speed;
                let x, z;

                if (body.epicycleRadius && body.epicycleRadius > 0) {
                    // Ptolemaic epicycle motion
                    const centerAngle = this.time * body.speed;
                    const centerX = Math.cos(centerAngle) * body.distance;
                    const centerZ = Math.sin(centerAngle) * body.distance;
                    
                    const epicycleAngle = this.time * body.epicycleSpeed;
                    x = centerX + Math.cos(epicycleAngle) * body.epicycleRadius;
                    z = centerZ + Math.sin(epicycleAngle) * body.epicycleRadius;
                    
                    // Update epicycle position
                    if (body.epicycle) {
                        body.epicycle.position.set(centerX, 0, centerZ);
                    }
                } else {
                    // Simple circular motion
                    x = Math.cos(angle) * body.distance;
                    z = Math.sin(angle) * body.distance;
                }

                body.object.position.set(x, 0, z);
            }
        });
    }

    /**
     * Destroy the application and clean up resources
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universeExplorer = new UniverseExplorer();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.universeExplorer) {
        window.universeExplorer.destroy();
    }
});