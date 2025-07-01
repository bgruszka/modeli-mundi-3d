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
        this.textureLoader = null;
        this.textures = {};
        
        // Lighting control properties
        this.lights = {
            ambient: null,
            sun: null,
            rim1: null,
            rim2: null
        };
        this.lightingSettings = {
            ambient: 0.4,
            sun: 2.0,
            rim: 0.3
        };
        
        // Visual element toggles
        this.visualElements = {
            orbitsVisible: true,
            wireframesVisible: true,
            orbitObjects: [],
            wireframeObjects: []
        };
        
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
        this.setupTextures();
        this.setupEventListeners();
        this.loadModel(this.currentModel);
        this.animate();
        
        // Initialize button states
        this.updateButtonStates();
        
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
        // Ambient light for overall illumination
        this.lights.ambient = new THREE.AmbientLight(0x404040, this.lightingSettings.ambient);
        this.scene.add(this.lights.ambient);

        // Main sun light (point light)
        this.lights.sun = new THREE.PointLight(0xFFE4B5, this.lightingSettings.sun, 1000);
        this.lights.sun.position.set(0, 0, 0);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.1;
        this.lights.sun.shadow.camera.far = 1000;
        this.scene.add(this.lights.sun);

        // Rim lighting for better planet definition
        this.lights.rim1 = new THREE.DirectionalLight(0x87CEEB, this.lightingSettings.rim);
        this.lights.rim1.position.set(100, 50, 100);
        this.scene.add(this.lights.rim1);
        
        this.lights.rim2 = new THREE.DirectionalLight(0x4169E1, this.lightingSettings.rim * 0.7);
        this.lights.rim2.position.set(-100, -50, -100);
        this.scene.add(this.lights.rim2);

        // Store reference to sun light for model-specific adjustments (backward compatibility)
        this.sunLight = this.lights.sun;
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
     * Set up textures for celestial bodies
     */
    setupTextures() {
        this.textureLoader = new THREE.TextureLoader();
        
        // Define texture URLs for celestial bodies
        // Using procedural textures for now (all set to null to use fallbacks)
        // This ensures consistent behavior and eliminates 404 errors
        const textureUrls = {
            sun: null,      // Will use procedural solar texture
            mercury: null,  // Will use procedural rocky texture
            venus: null,    // Will use procedural cloudy texture
            earth: null,    // Will use procedural earth texture
            mars: null,     // Will use procedural rocky texture
            jupiter: null,  // Will use procedural gas giant texture
            saturn: null,   // Will use procedural gas giant texture
            moon: null,     // Will use procedural rocky texture
            io: null,       // Will use procedural volcanic texture
            europa: null,   // Will use procedural icy texture
            ganymede: null, // Will use procedural rocky texture
            callisto: null  // Will use procedural rocky texture
        };

        // Track loading progress
        this.texturesLoaded = 0;
        this.totalTextures = Object.keys(textureUrls).length;
        
        // Load textures
        Object.entries(textureUrls).forEach(([name, url]) => {
            if (url) {
                this.textureLoader.load(
                    url,
                    (texture) => {
                        // Proper sphere texture mapping
                        texture.wrapS = THREE.ClampToEdgeWrapping;
                        texture.wrapT = THREE.ClampToEdgeWrapping;
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.flipY = false; // Important for proper sphere mapping
                        this.textures[name] = texture;
                        this.texturesLoaded++;
                        this.updateTextureLoadingStatus();
                        console.log(`✅ Loaded texture for ${name}`);
                    },
                    (progress) => {
                        // Loading progress
                    },
                    (error) => {
                        console.warn(`⚠️ Failed to load texture for ${name}, using fallback procedural texture`);
                        // Create a fallback procedural texture
                        this.textures[name] = this.createProceduralTexture(name);
                        this.texturesLoaded++;
                        this.updateTextureLoadingStatus();
                    }
                );
            } else {
                // Use procedural texture immediately for null URLs
                this.textures[name] = this.createProceduralTexture(name);
                this.texturesLoaded++;
                this.updateTextureLoadingStatus();
                console.log(`🎨 Using procedural texture for ${name}`);
            }
        });

        // Create immediate fallback textures
        Object.keys(textureUrls).forEach(name => {
            if (!this.textures[name]) {
                this.textures[name] = this.createProceduralTexture(name);
            }
        });
    }

    /**
     * Create procedural textures as fallbacks
     */
    createProceduralTexture(bodyName) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512; // 2:1 aspect ratio for equirectangular mapping
        const context = canvas.getContext('2d');

        // Color schemes for different celestial bodies
        const colorSchemes = {
            sun: { primary: '#FDB813', secondary: '#FF8C00', pattern: 'solar' },
            mercury: { primary: '#8C7853', secondary: '#A68B5B', pattern: 'rocky' },
            venus: { primary: '#FFC649', secondary: '#FFB347', pattern: 'cloudy' },
            earth: { primary: '#4A90E2', secondary: '#228B22', pattern: 'earth' },
            mars: { primary: '#CD5C5C', secondary: '#8B4513', pattern: 'rocky' },
            jupiter: { primary: '#D2691E', secondary: '#F4A460', pattern: 'gas' },
            saturn: { primary: '#FAD5A5', secondary: '#DEB887', pattern: 'gas' },
            moon: { primary: '#C0C0C0', secondary: '#808080', pattern: 'rocky' },
            io: { primary: '#FFFF99', secondary: '#FFA500', pattern: 'volcanic' },
            europa: { primary: '#87CEEB', secondary: '#4682B4', pattern: 'icy' },
            ganymede: { primary: '#8B7D6B', secondary: '#696969', pattern: 'rocky' },
            callisto: { primary: '#696969', secondary: '#2F4F4F', pattern: 'rocky' }
        };

        const scheme = colorSchemes[bodyName] || colorSchemes.mercury;
        
        // Create gradient background
        const gradient = context.createRadialGradient(512, 256, 0, 512, 256, 512);
        gradient.addColorStop(0, scheme.primary);
        gradient.addColorStop(1, scheme.secondary);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1024, 512);

        // Add pattern based on body type
        this.addTexturePattern(context, scheme.pattern, scheme);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = false;
        return texture;
    }

    /**
     * Add specific patterns to procedural textures
     */
    addTexturePattern(context, pattern, scheme) {
        context.globalAlpha = 0.3;
        
        switch (pattern) {
            case 'solar':
                // Solar flares and spots
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 1024;
                    const y = Math.random() * 512;
                    const radius = Math.random() * 30 + 10;
                    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(1, 'transparent');
                    context.fillStyle = gradient;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
                break;
                
            case 'earth':
                // Continents and oceans
                context.fillStyle = '#228B22';
                for (let i = 0; i < 15; i++) {
                    context.beginPath();
                    const x = Math.random() * 1024;
                    const y = Math.random() * 512;
                    const width = Math.random() * 100 + 50;
                    const height = Math.random() * 60 + 30;
                    context.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
                    context.fill();
                }
                break;
                
            case 'gas':
                // Gas giant bands
                context.strokeStyle = scheme.secondary;
                context.lineWidth = 8;
                for (let y = 0; y < 512; y += 40) {
                    context.beginPath();
                    context.moveTo(0, y + Math.sin(y * 0.1) * 10);
                    for (let x = 0; x <= 1024; x += 10) {
                        context.lineTo(x, y + Math.sin((x + y) * 0.05) * 15);
                    }
                    context.stroke();
                }
                break;
                
            case 'rocky':
                // Craters and surface features
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * 1024;
                    const y = Math.random() * 512;
                    const radius = Math.random() * 20 + 5;
                    context.fillStyle = scheme.secondary;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                    context.fillStyle = scheme.primary;
                    context.beginPath();
                    context.arc(x - 2, y - 2, radius * 0.8, 0, Math.PI * 2);
                    context.fill();
                }
                break;
                
            case 'cloudy':
                // Cloud patterns
                for (let i = 0; i < 25; i++) {
                    const x = Math.random() * 1024;
                    const y = Math.random() * 512;
                    const radius = Math.random() * 40 + 20;
                    context.fillStyle = '#FFFFFF';
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
                break;
                
            case 'volcanic':
                // Volcanic features
                context.fillStyle = '#FF4500';
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 1024;
                    const y = Math.random() * 512;
                    const radius = Math.random() * 15 + 5;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
                break;
                
            case 'icy':
                // Ice cracks and features
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 2;
                for (let i = 0; i < 40; i++) {
                    context.beginPath();
                    const startX = Math.random() * 1024;
                    const startY = Math.random() * 512;
                    context.moveTo(startX, startY);
                    context.lineTo(startX + (Math.random() - 0.5) * 100, startY + (Math.random() - 0.5) * 100);
                    context.stroke();
                }
                break;
        }
        
        context.globalAlpha = 1.0;
    }

    /**
     * Update texture loading status
     */
    updateTextureLoadingStatus() {
        const statusElement = document.getElementById('texture-status');
        if (statusElement) {
            const percentage = Math.round((this.texturesLoaded / this.totalTextures) * 100);
            statusElement.textContent = `Loading textures... ${percentage}% (${this.texturesLoaded}/${this.totalTextures})`;
            
            if (this.texturesLoaded >= this.totalTextures) {
                setTimeout(() => {
                    statusElement.textContent = '✅ All textures loaded!';
                }, 500);
            }
        }
    }

    /**
     * Create a star field background
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random positions in sphere
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 2000;
            
            // Random star colors (blue-white to red)
            const starType = Math.random();
            if (starType < 0.7) {
                // White stars (most common)
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else if (starType < 0.85) {
                // Blue stars
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else {
                // Red/orange stars
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.4;
            }
            
            // Variable star sizes
            sizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({ 
            vertexColors: true,
            size: 1,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: false
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

        // Lighting control sliders
        this.setupLightingControls();

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Set up lighting control sliders and buttons
     */
    setupLightingControls() {
        // Ambient light slider
        const ambientSlider = document.getElementById('ambient-slider');
        const ambientValue = document.getElementById('ambient-value');
        
        ambientSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.lightingSettings.ambient = value;
            this.lights.ambient.intensity = value;
            ambientValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Sun light slider
        const sunSlider = document.getElementById('sun-slider');
        const sunValue = document.getElementById('sun-value');
        
        sunSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.lightingSettings.sun = value;
            this.lights.sun.intensity = value;
            sunValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Rim light slider
        const rimSlider = document.getElementById('rim-slider');
        const rimValue = document.getElementById('rim-value');
        
        rimSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.lightingSettings.rim = value;
            this.lights.rim1.intensity = value;
            this.lights.rim2.intensity = value * 0.7;
            rimValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Animation pause/play button
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.animationEnabled = !this.animationEnabled;
            pauseBtn.textContent = this.animationEnabled ? '⏸️ Pause' : '▶️ Play';
            pauseBtn.classList.toggle('active', !this.animationEnabled);
        });

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetLighting();
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyLightingPreset(preset);
            });
        });

        // Visual element toggle buttons
        const orbitsBtn = document.getElementById('orbits-btn');
        orbitsBtn.addEventListener('click', () => {
            this.visualElements.orbitsVisible = !this.visualElements.orbitsVisible;
            this.toggleOrbitsVisibility();
            orbitsBtn.classList.toggle('active', !this.visualElements.orbitsVisible);
            console.log(`Orbits visibility: ${this.visualElements.orbitsVisible}`);
        });

        const wireframesBtn = document.getElementById('wireframes-btn');
        wireframesBtn.addEventListener('click', () => {
            this.visualElements.wireframesVisible = !this.visualElements.wireframesVisible;
            this.toggleWireframesVisibility();
            wireframesBtn.classList.toggle('active', !this.visualElements.wireframesVisible);
            console.log(`Wireframes visibility: ${this.visualElements.wireframesVisible}`);
        });
    }

    /**
     * Apply lighting presets
     */
    applyLightingPreset(preset) {
        let settings;
        
        switch (preset) {
            case 'bright':
                settings = { ambient: 0.8, sun: 2.5, rim: 0.5 };
                break;
            case 'dark':
                settings = { ambient: 0.1, sun: 1.0, rim: 0.1 };
                break;
            case 'realistic':
                settings = { ambient: 0.3, sun: 1.8, rim: 0.2 };
                break;
            case 'dramatic':
                settings = { ambient: 0.2, sun: 3.0, rim: 0.8 };
                break;
            default:
                return;
        }

        this.updateLightingFromSettings(settings);
    }

    /**
     * Reset lighting to default values
     */
    resetLighting() {
        const defaultSettings = { ambient: 0.4, sun: 2.0, rim: 0.3 };
        this.updateLightingFromSettings(defaultSettings);
    }

    /**
     * Update lighting and UI from settings object
     */
    updateLightingFromSettings(settings) {
        // Update lighting
        this.lightingSettings = { ...settings };
        this.lights.ambient.intensity = settings.ambient;
        this.lights.sun.intensity = settings.sun;
        this.lights.rim1.intensity = settings.rim;
        this.lights.rim2.intensity = settings.rim * 0.7;

        // Update UI sliders
        document.getElementById('ambient-slider').value = Math.round(settings.ambient * 100);
        document.getElementById('ambient-value').textContent = `${Math.round(settings.ambient * 100)}%`;
        
        document.getElementById('sun-slider').value = Math.round(settings.sun * 100);
        document.getElementById('sun-value').textContent = `${Math.round(settings.sun * 100)}%`;
        
        document.getElementById('rim-slider').value = Math.round(settings.rim * 100);
        document.getElementById('rim-value').textContent = `${Math.round(settings.rim * 100)}%`;
    }

    /**
     * Update button states to reflect current settings
     */
    updateButtonStates() {
        const orbitsBtn = document.getElementById('orbits-btn');
        const wireframesBtn = document.getElementById('wireframes-btn');
        
        if (orbitsBtn) {
            orbitsBtn.classList.toggle('active', !this.visualElements.orbitsVisible);
        }
        
        if (wireframesBtn) {
            wireframesBtn.classList.toggle('active', !this.visualElements.wireframesVisible);
        }
    }

    /**
     * Toggle orbit visibility
     */
    toggleOrbitsVisibility() {
        console.log(`Toggling ${this.visualElements.orbitObjects.length} orbit objects to ${this.visualElements.orbitsVisible}`);
        this.visualElements.orbitObjects.forEach(orbit => {
            orbit.visible = this.visualElements.orbitsVisible;
        });
    }

    /**
     * Toggle wireframe visibility
     */
    toggleWireframesVisibility() {
        console.log(`Toggling ${this.visualElements.wireframeObjects.length} wireframe objects to ${this.visualElements.wireframesVisible}`);
        this.visualElements.wireframeObjects.forEach(wireframe => {
            wireframe.visible = this.visualElements.wireframesVisible;
        });
    }

    /**
     * Add orbit to tracking array
     */
    addOrbitToTracking(orbitObject) {
        this.visualElements.orbitObjects.push(orbitObject);
        orbitObject.visible = this.visualElements.orbitsVisible;
    }

    /**
     * Add wireframe to tracking array
     */
    addWireframeToTracking(wireframeObject) {
        this.visualElements.wireframeObjects.push(wireframeObject);
        wireframeObject.visible = this.visualElements.wireframesVisible;
    }

    /**
     * Apply current visual element states to all tracked objects
     */
    updateVisualElementStates() {
        this.toggleOrbitsVisibility();
        this.toggleWireframesVisibility();
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
            if (body.epicycle) {
                this.scene.remove(body.epicycle);
            }
        });
        
        // Clear visual element tracking arrays
        this.visualElements.orbitObjects = [];
        this.visualElements.wireframeObjects = [];
        
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

        // Apply current visual element toggle states to the new model
        this.updateVisualElementStates();
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
            this.addWireframeToTracking(sphere);

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
        this.addWireframeToTracking(starsSphere);
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
            this.addOrbitToTracking(orbit);

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
                this.addOrbitToTracking(epicycle);
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
            this.addOrbitToTracking(orbit);

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
            this.addOrbitToTracking(orbit);

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
            this.addOrbitToTracking(orbit);

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
        // Create sphere with proper UV mapping for textures
        const geometry = new THREE.SphereGeometry(size, 64, 32, 0, Math.PI * 2, 0, Math.PI);
        
        // Get texture for this celestial body
        const bodyKey = name.toLowerCase();
        const texture = this.textures[bodyKey];
        
        let material;
        if (texture) {
            // Use texture if available
            if (name.toLowerCase() === 'sun') {
                // Sun should emit light and have special material
                material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    emissive: new THREE.Color(0xFFA500),
                    emissiveIntensity: 0.3
                });
            } else {
                // Regular planets and moons
                material = new THREE.MeshPhongMaterial({ 
                    map: texture,
                    shininess: name.toLowerCase() === 'europa' || name.toLowerCase() === 'callisto' ? 100 : 30,
                    // Add subtle base color that blends with texture
                    color: new THREE.Color(color).multiplyScalar(0.8)
                });
            }
        } else {
            // Fallback to solid color if no texture
            material = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30
            });
        }
        
        const body = new THREE.Mesh(geometry, material);
        body.position.set(x, y, z);
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Add rotation for more realistic appearance
        body.userData = {
            rotationSpeed: 0.01 + Math.random() * 0.02,
            name: name
        };
        
        // Add simple label
        this.addLabel(body, name, size);
        
        // Add rings for Saturn
        if (name.toLowerCase() === 'saturn') {
            this.addSaturnRings(body, size);
        }
        
        this.scene.add(body);
        return body;
    }

    /**
     * Add rings to Saturn
     */
    addSaturnRings(planet, planetSize) {
        const ringGeometry = new THREE.RingGeometry(planetSize * 1.2, planetSize * 2.2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xB8860B,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2; // Rotate to be horizontal
        rings.rotation.z = Math.PI / 8; // Slight tilt for realism
        
        planet.add(rings);
        
        // Add inner ring detail
        const innerRingGeometry = new THREE.RingGeometry(planetSize * 1.5, planetSize * 1.8, 32);
        const innerRingMaterial = new THREE.MeshPhongMaterial({
            color: 0xDAA520,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        const innerRings = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        innerRings.rotation.x = Math.PI / 2;
        innerRings.rotation.z = Math.PI / 8;
        
        planet.add(innerRings);
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

            // Add planetary rotation for realism
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed;
            }

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