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
        this.animationSpeed = 1.0; // Default speed multiplier
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
            ambient: 0.15,  // Lower ambient for better day/night contrast
            sun: 2.5,       // Higher sun intensity  
            rim: 0.2        // Lower rim light to not wash out shadows
        };
        
        // Visual element toggles
        this.visualElements = {
            orbitsVisible: true,
            wireframesVisible: true,
            starsVisible: true,
            orbitObjects: [],
            wireframeObjects: [],
            starField: null
        };
        
        // Newtonian model specific properties
        this.newtonianModel = {
            gravityEnabled: true,
            planetVelocities: {}, // Store velocity vectors for straight-line motion
            gravitationalForces: [], // Store force objects for easy toggle
            collisionEnabled: true, // Enable collision detection
            explosionParticles: [], // Store explosion particle systems
            mergedPlanets: [] // Track newly created merged planets
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
            },
            newtonian: {
                title: "Newtonian Gravitational Model",
                description: `Advanced heliocentric model incorporating Newton's law of universal gravitation with comprehensive physics simulation and interactive features.

<strong>🔴 Gravitational Force Visualizations:</strong>
• Red force lines from Sun to major planets (stronger forces = brighter lines)
• Gray interplanetary force lines between major planets
• Dynamic opacity based on distance (closer objects = stronger gravitational pull)

<strong>🟢 Enhanced Orbital Mechanics:</strong>
• Realistic elliptical orbits with accurate eccentricity values
• Green velocity vectors at perihelion (closest point to Sun - faster orbital speed)
• Blue velocity vectors at aphelion (farthest point from Sun - slower orbital speed)
• Focus point markers showing the two foci of each elliptical orbit

<strong>🔵 Gravitational Influence Spheres:</strong>
• Transparent blue spheres around massive planets (Jupiter, Saturn, Earth, Mars)
• Sphere size represents gravitational influence radius
• Demonstrates how planet mass affects surrounding space

<strong>🟤 Asteroid Belt Simulation:</strong>
• 30 asteroids orbiting between Mars and Jupiter
• Each asteroid experiences gravitational perturbations from nearby planets
• Demonstrates how planetary gravity affects smaller bodies

<strong>⚖️ Mass-Based Physics:</strong>
• Realistic relative masses for all celestial bodies
• Gravitational force strength depends on both mass and distance
• Proper orbital speeds based on mass and orbital radius

                <strong>💥 Interactive Collision System:</strong>
                • Collisions only occur when gravity is disabled (🚀 No Gravity)
                • With gravity on, stable orbits prevent collisions (realistic behavior)
                • Toggle gravity off to see planets fly in straight lines and collide
                • Realistic collision detection between all objects (excludes parent-child relationships)
                • Two collision outcomes:
                  - Planet Merging: Similar masses → bright flash + larger combined planet
                  - Explosive Fragmentation: Different masses → particle explosion + debris field
                • Conservation of momentum and mass in all collisions
                • Explosion particles with realistic physics (gravity effects, fade over time)

<strong>🎮 Interactive Features:</strong>
• Gravity Toggle: Enable/disable gravitational forces
• Watch how gravity keeps solar systems stable
• Observe collision dynamics when gravity is removed
• Educational demonstration of Newton's laws of motion and universal gravitation

This model demonstrates the fundamental principles that govern our solar system and provides an interactive laboratory for exploring gravitational physics.`
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
        
        // Auto-collapse panels on mobile devices
        this.checkMobileAndCollapsePanels();
        
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

        // Main sun light (point light) - positioned to provide dramatic lighting
        this.lights.sun = new THREE.PointLight(0xFFE4B5, this.lightingSettings.sun, 500, 2);
        this.lights.sun.position.set(-10, 5, 10);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.1;
        this.lights.sun.shadow.camera.far = 500;
        this.scene.add(this.lights.sun);

        // Add light helper for debugging (initially hidden)
        this.lightHelper = new THREE.PointLightHelper(this.lights.sun, 1);
        this.lightHelper.visible = false;
        this.scene.add(this.lightHelper);

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
        
        // Store reference to star field for potential toggling
        this.visualElements.starField = stars;
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

        // Set up mobile-friendly tooltips
        this.setupMobileTooltips();
        
        // Gravity toggle button (for Newtonian model)
        document.getElementById('gravity-btn').addEventListener('click', () => {
            this.toggleGravity();
        });

        // Set up collapsible panels
        this.setupCollapsiblePanels();
    }

    /**
     * Set up mobile-friendly help system (replaces problematic tooltips)
     */
    setupMobileTooltips() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768 || 
                         ('ontouchstart' in window);
        
        console.log('Mobile detection:', isMobile, 'UserAgent:', navigator.userAgent, 'Width:', window.innerWidth);
        
        // Remove all title attributes on mobile to prevent browser tooltips
        document.querySelectorAll('[title]').forEach(element => {
            element.removeAttribute('title');
        });
        
        // Always add mobile help button with proper positioning
        this.addMobileHelpButton();
    }

    /**
     * Add a help button that shows control information in a mobile-friendly way
     */
    addMobileHelpButton() {
        const controlsInfo = document.getElementById('controls-info');
        if (controlsInfo) {
            console.log('Adding mobile help button to controls-info');
            
                         // Force position the controls info properly with !important
             controlsInfo.style.setProperty('position', 'fixed', 'important');
             controlsInfo.style.setProperty('bottom', '20px', 'important');
             controlsInfo.style.setProperty('left', '20px', 'important');
             controlsInfo.style.setProperty('right', 'auto', 'important');
             controlsInfo.style.setProperty('top', 'auto', 'important');
            controlsInfo.style.background = 'rgba(0, 0, 0, 0.85)';
            controlsInfo.style.backdropFilter = 'blur(10px)';
            controlsInfo.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            controlsInfo.style.borderRadius = '12px';
            controlsInfo.style.padding = '12px';
            controlsInfo.style.fontSize = '0.7em';
            controlsInfo.style.color = '#ccc';
            controlsInfo.style.maxWidth = '140px';
                         controlsInfo.style.setProperty('z-index', '1500', 'important');
            controlsInfo.style.lineHeight = '1.3';
            
            // Remove any existing help button first
            const existingHelpBtn = controlsInfo.querySelector('.help-btn');
            if (existingHelpBtn) {
                existingHelpBtn.remove();
            }
            
            // Add help button
            const helpBtn = document.createElement('button');
            helpBtn.innerHTML = '❓';
            helpBtn.className = 'help-btn';
            helpBtn.title = 'Show detailed help';
            
                         // Force button styling - make it bigger and more visible for testing
             helpBtn.style.position = 'absolute';
             helpBtn.style.top = '-15px';
             helpBtn.style.right = '-15px';
             helpBtn.style.width = '50px';
             helpBtn.style.height = '50px';
            helpBtn.style.borderRadius = '50%';
            helpBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            helpBtn.style.border = 'none';
            helpBtn.style.color = 'white';
                         helpBtn.style.fontSize = '24px';
            helpBtn.style.boxShadow = '0 3px 12px rgba(0,0,0,0.4)';
            helpBtn.style.cursor = 'pointer';
                         helpBtn.style.zIndex = '1600';
            helpBtn.style.display = 'flex';
            helpBtn.style.alignItems = 'center';
            helpBtn.style.justifyContent = 'center';
            helpBtn.style.transition = 'all 0.3s ease';
            
            // Add hover effect
            helpBtn.addEventListener('touchstart', () => {
                helpBtn.style.transform = 'scale(1.1)';
                helpBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
            });
            
            helpBtn.addEventListener('touchend', () => {
                helpBtn.style.transform = 'scale(1)';
                helpBtn.style.boxShadow = '0 3px 12px rgba(0,0,0,0.4)';
            });
            
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Help button clicked!');
                this.showMobileHelp();
            });
            
                         // Keep controls info as fixed, but ensure relative positioning for button
            controlsInfo.appendChild(helpBtn);
            
            console.log('Help button added successfully');
        } else {
            console.error('controls-info element not found!');
        }
    }

    /**
     * Show mobile help in a non-blocking way
     */
    showMobileHelp() {
        // Create or update help overlay
        let helpOverlay = document.getElementById('mobile-help-overlay');
        
        if (!helpOverlay) {
            helpOverlay = document.createElement('div');
            helpOverlay.id = 'mobile-help-overlay';
                                                  helpOverlay.style.cssText = `
                 position: fixed;
                 bottom: 0;
                 left: 0;
                 right: 0;
                 background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
                 backdrop-filter: blur(20px);
                 border-top: 1px solid rgba(255, 255, 255, 0.2);
                 border-radius: 20px 20px 0 0;
                 padding: 20px;
                 z-index: 2500;
                 transform: translateY(100%);
                 transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                 max-height: 70vh;
                 overflow-y: auto;
                 box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
             `;
            
            helpOverlay.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #ffd700; margin: 0; font-size: 1.1em;">📱 Controls & Help</h3>
                    <button id="close-help" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 20px; padding: 5px 12px; font-size: 0.9em; cursor: pointer;">Close</button>
                </div>
                
                <div style="color: #cccccc; font-size: 0.9em; line-height: 1.4;">
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">🌌 Navigation:</strong><br>
                        • Drag to rotate view around models<br>
                        • Pinch to zoom in/out<br>
                        • Two-finger pan to move view
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">🎛️ Panel Controls:</strong><br>
                        • 🌌 Universe Models - Select historical cosmic models<br>
                        • ✨ Scene Controls - Adjust lighting, speed, visibility
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">💡 Lighting Presets:</strong><br>
                        • ☀️ Bright - High visibility for study<br>
                        • 🌙 Dark - Dramatic cosmic atmosphere<br>
                        • 🌍 Realistic - Natural space lighting<br>
                        • 🎭 Dramatic - High contrast shadows
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">⚡ Speed Presets:</strong><br>
                        • 🐌 Slow (25%) - Study complex motions<br>
                        • ⚡ Normal (100%) - Standard speed<br>
                        • 🚀 Fast (200%) - Quick pattern viewing<br>
                        • 🚀💨 Ultra (500%) - Very fast motion
                    </div>
                    
                    <div>
                        <strong style="color: #87ceeb;">👁️ Visual Elements:</strong><br>
                        • 🛸 Orbits - Show/hide orbital paths<br>
                        • 📐 Geometry - Show/hide wireframes<br>
                        • ⭐ Stars - Toggle background stars
                    </div>
                </div>
            `;
            
            document.body.appendChild(helpOverlay);
            
            // Close button functionality
            document.getElementById('close-help').addEventListener('click', () => {
                this.hideMobileHelp();
            });
            
            // Close on background tap
            helpOverlay.addEventListener('click', (e) => {
                if (e.target === helpOverlay) {
                    this.hideMobileHelp();
                }
            });
        }
        
        // Show the overlay
        setTimeout(() => {
            helpOverlay.style.transform = 'translateY(0)';
        }, 10);
    }

    /**
     * Hide mobile help overlay
     */
    hideMobileHelp() {
        const helpOverlay = document.getElementById('mobile-help-overlay');
        if (helpOverlay) {
            helpOverlay.style.transform = 'translateY(100%)';
        }
    }

    /**
     * Show brief toast notification (replaces tooltips for feedback)
     */
    showToast(message, duration = 2000) {
        // Remove existing toast
        const existingToast = document.getElementById('toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9em;
            z-index: 3000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Set up collapsible panels for UI and controls
     */
    setupCollapsiblePanels() {
        // UI Panel toggle
        const toggleUiBtn = document.getElementById('toggle-ui-panel');
        const uiContent = document.getElementById('ui-content');
        const uiPanel = document.getElementById('ui-panel');
        
        if (toggleUiBtn && uiContent) {
            toggleUiBtn.addEventListener('click', () => {
                const isCollapsed = uiContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // Expand
                    uiContent.classList.remove('collapsed');
                    uiPanel.classList.remove('collapsed');
                    toggleUiBtn.classList.remove('active');
                    toggleUiBtn.textContent = '📋';
                    toggleUiBtn.title = 'Hide model selection panel';
                } else {
                    // Collapse
                    uiContent.classList.add('collapsed');
                    uiPanel.classList.add('collapsed');
                    toggleUiBtn.classList.add('active');
                    toggleUiBtn.textContent = '🌌';
                    toggleUiBtn.title = 'Show model selection panel';
                }
            });
        }
        
        // Controls Panel toggle
        const toggleControlsBtn = document.getElementById('toggle-controls-panel');
        const controlsContent = document.getElementById('controls-content');
        const controlsPanel = document.getElementById('lighting-controls');
        
        if (toggleControlsBtn && controlsContent) {
            toggleControlsBtn.addEventListener('click', () => {
                const isCollapsed = controlsContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // Expand
                    controlsContent.classList.remove('collapsed');
                    controlsPanel.classList.remove('collapsed');
                    toggleControlsBtn.classList.remove('active');
                    toggleControlsBtn.textContent = '🎛️';
                    toggleControlsBtn.title = 'Hide scene controls panel';
                } else {
                    // Collapse
                    controlsContent.classList.add('collapsed');
                    controlsPanel.classList.add('collapsed');
                    toggleControlsBtn.classList.add('active');
                    toggleControlsBtn.textContent = '✨';
                    toggleControlsBtn.title = 'Show scene controls panel';
                }
            });
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                // Toggle UI panel with 'H' key
                if (toggleUiBtn) {
                    toggleUiBtn.click();
                }
            } else if (e.key === 'c' || e.key === 'C') {
                // Toggle controls panel with 'C' key
                if (toggleControlsBtn) {
                    toggleControlsBtn.click();
                }
            }
        });
    }

    /**
     * Check if on mobile device and auto-collapse panels for better UX
     */
    checkMobileAndCollapsePanels() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768 || 
                         ('ontouchstart' in window);
        
        if (isMobile) {
            console.log('Mobile device detected - auto-collapsing panels for better UX');
            
            // Collapse UI panel
            const uiContent = document.getElementById('ui-content');
            const uiPanel = document.getElementById('ui-panel');
            const toggleUiBtn = document.getElementById('toggle-ui-panel');
            
            if (uiContent && uiPanel && toggleUiBtn) {
                uiContent.classList.add('collapsed');
                uiPanel.classList.add('collapsed');
                toggleUiBtn.classList.add('active');
                toggleUiBtn.textContent = '🌌';
                toggleUiBtn.title = 'Show model selection panel';
            }
            
            // Collapse controls panel
            const controlsContent = document.getElementById('controls-content');
            const controlsPanel = document.getElementById('lighting-controls');
            const toggleControlsBtn = document.getElementById('toggle-controls-panel');
            
            if (controlsContent && controlsPanel && toggleControlsBtn) {
                controlsContent.classList.add('collapsed');
                controlsPanel.classList.add('collapsed');
                toggleControlsBtn.classList.add('active');
                toggleControlsBtn.textContent = '✨';
                toggleControlsBtn.title = 'Show scene controls panel';
            }
            
            // Update the controls info with mobile-specific instructions
            const controlsInfo = document.getElementById('controls-info');
            if (controlsInfo) {
                controlsInfo.innerHTML = `
                    <strong>Touch Controls:</strong><br>
                    • Drag: Rotate view<br>
                    • Pinch: Zoom in/out<br>
                    • 🌌: Models • ✨: Controls
                `;
            }
        }
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

        // Sun light slider (range 0-300, so divide by 100 for 0-3.0 intensity)
        const sunSlider = document.getElementById('sun-slider');
        const sunValue = document.getElementById('sun-value');
        
        sunSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100; // Convert 0-300 to 0-3.0
            this.lightingSettings.sun = value;
            this.lights.sun.intensity = value;
            sunValue.textContent = `${Math.round(value * 100)}%`;
            console.log(`Sun intensity: ${value.toFixed(2)} (${Math.round(value * 100)}%) - Light position: (${this.lights.sun.position.x}, ${this.lights.sun.position.y}, ${this.lights.sun.position.z})`);
            
            // Update light helper if visible
            if (this.lightHelper && this.lightHelper.visible) {
                this.lightHelper.update();
            }
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

        // Animation speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.animationSpeed = value;
            speedValue.textContent = `${Math.round(value * 100)}%`;
            console.log(`Animation speed: ${Math.round(value * 100)}%`);
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
                const speed = e.target.dataset.speed;
                
                if (preset) {
                    this.applyLightingPreset(preset);
                    // Show mobile feedback
                    if (window.innerWidth <= 768) {
                        const presetNames = {bright: 'Bright', dark: 'Dark', realistic: 'Realistic', dramatic: 'Dramatic'};
                        this.showToast(`${presetNames[preset]} lighting applied`);
                    }
                }
                
                if (speed !== undefined) {
                    this.applySpeedPreset(parseInt(speed));
                    // Show mobile feedback
                    if (window.innerWidth <= 768) {
                        this.showToast(`Speed set to ${speed}%`);
                    }
                }
            });
        });

        // Visual element toggle buttons
        const orbitsBtn = document.getElementById('orbits-btn');
        orbitsBtn.addEventListener('click', () => {
            this.visualElements.orbitsVisible = !this.visualElements.orbitsVisible;
            this.toggleOrbitsVisibility();
            orbitsBtn.classList.toggle('active', !this.visualElements.orbitsVisible);
            
            // Show mobile feedback
            if (window.innerWidth <= 768) {
                this.showToast(`Orbits ${this.visualElements.orbitsVisible ? 'shown' : 'hidden'}`);
            }
            console.log(`Orbits visibility: ${this.visualElements.orbitsVisible}`);
        });

        const wireframesBtn = document.getElementById('wireframes-btn');
        wireframesBtn.addEventListener('click', () => {
            this.visualElements.wireframesVisible = !this.visualElements.wireframesVisible;
            this.toggleWireframesVisibility();
            wireframesBtn.classList.toggle('active', !this.visualElements.wireframesVisible);
            
            // Show mobile feedback
            if (window.innerWidth <= 768) {
                this.showToast(`Geometry ${this.visualElements.wireframesVisible ? 'shown' : 'hidden'}`);
            }
            console.log(`Geometry/Wireframes visibility: ${this.visualElements.wireframesVisible}`);
        });

        const starsBtn = document.getElementById('stars-btn');
        starsBtn.addEventListener('click', () => {
            this.visualElements.starsVisible = !this.visualElements.starsVisible;
            this.toggleStarsVisibility();
            starsBtn.classList.toggle('active', !this.visualElements.starsVisible);
            
            // Show mobile feedback
            if (window.innerWidth <= 768) {
                this.showToast(`Stars ${this.visualElements.starsVisible ? 'shown' : 'hidden'}`);
            }
            console.log(`Stars visibility: ${this.visualElements.starsVisible}`);
        });

        const debugBtn = document.getElementById('debug-btn');
        debugBtn.addEventListener('click', () => {
            this.toggleDebugMode();
            debugBtn.classList.toggle('active');
        });
    }

    /**
     * Apply lighting presets
     */
    applyLightingPreset(preset) {
        let settings;
        
        switch (preset) {
            case 'bright':
                settings = { ambient: 0.6, sun: 3.0, rim: 0.4 };
                break;
            case 'dark':
                settings = { ambient: 0.05, sun: 1.5, rim: 0.05 };
                break;
            case 'realistic':
                settings = { ambient: 0.15, sun: 2.5, rim: 0.2 };
                break;
            case 'dramatic':
                settings = { ambient: 0.05, sun: 4.0, rim: 0.5 };
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
        const defaultSettings = { ambient: 0.15, sun: 2.5, rim: 0.2 };
        this.updateLightingFromSettings(defaultSettings);
        
        // Also reset animation speed
        this.animationSpeed = 1.0;
        document.getElementById('speed-slider').value = 100;
        document.getElementById('speed-value').textContent = '100%';
    }

    /**
     * Apply speed preset
     */
    applySpeedPreset(speedPercent) {
        const speed = speedPercent / 100;
        this.animationSpeed = speed;
        
        // Update UI
        document.getElementById('speed-slider').value = speedPercent;
        document.getElementById('speed-value').textContent = `${speedPercent}%`;
        
        console.log(`Speed preset applied: ${speedPercent}%`);
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
        console.log(`Toggling ${this.visualElements.orbitObjects.length} tracked orbit objects to ${this.visualElements.orbitsVisible}`);
        
        // Toggle tracked orbit objects
        this.visualElements.orbitObjects.forEach(orbit => {
            orbit.visible = this.visualElements.orbitsVisible;
        });
        
        // Also find and toggle any line objects that might be untracked orbits
        let foundCount = 0;
        this.scene.traverse((object) => {
            if (object.type === 'Line' || object.type === 'LineSegments' || object.type === 'LineLoop') {
                // Only toggle if it's not already tracked
                if (!this.visualElements.orbitObjects.includes(object)) {
                    object.visible = this.visualElements.orbitsVisible;
                    foundCount++;
                }
            }
        });
        
        console.log(`Also toggled ${foundCount} untracked line objects`);
    }

    /**
     * Toggle wireframe visibility
     */
    toggleWireframesVisibility() {
        console.log(`Toggling ${this.visualElements.wireframeObjects.length} tracked wireframe objects to ${this.visualElements.wireframesVisible}`);
        
        // Toggle tracked wireframe objects
        this.visualElements.wireframeObjects.forEach(wireframe => {
            wireframe.visible = this.visualElements.wireframesVisible;
        });
        
        // Also find and toggle any wireframe objects that might not be tracked
        // BUT exclude objects that are already tracked as orbits
        let foundCount = 0;
        this.scene.traverse((object) => {
            if (object.type === 'Mesh' && object.material) {
                const material = Array.isArray(object.material) ? object.material[0] : object.material;
                if (material.wireframe === true && !this.visualElements.orbitObjects.includes(object)) {
                    object.visible = this.visualElements.wireframesVisible;
                    foundCount++;
                }
            }
        });
        
        console.log(`Also toggled ${foundCount} untracked wireframe objects (excluding orbits)`);
    }

    /**
     * Toggle star field visibility
     */
    toggleStarsVisibility() {
        if (this.visualElements.starField) {
            this.visualElements.starField.visible = this.visualElements.starsVisible;
            console.log(`Star field visibility: ${this.visualElements.starsVisible}`);
        }
    }

    /**
     * Toggle gravity for Newtonian model
     */
    toggleGravity() {
        if (this.currentModel !== 'newtonian') return;
        
        this.newtonianModel.gravityEnabled = !this.newtonianModel.gravityEnabled;
        
        // Update button appearance
        const gravityBtn = document.getElementById('gravity-btn');
        if (gravityBtn) {
            gravityBtn.classList.toggle('active', this.newtonianModel.gravityEnabled);
            gravityBtn.textContent = this.newtonianModel.gravityEnabled ? '🌍 Gravity' : '🚀 No Gravity';
        }
        
        // Show/hide gravitational force visualizations
        this.updateGravitationalForceVisibility();
        
        // Calculate initial velocities for straight-line motion when gravity is turned off
        if (!this.newtonianModel.gravityEnabled) {
            this.calculateStraightLineVelocities();
        }
        
        // Show toast notification
        this.showToast(
            this.newtonianModel.gravityEnabled ? 
            '🌍 Gravity enabled - Planets follow elliptical orbits' : 
            '🚀 Gravity disabled - Planets move in straight lines'
        );
    }

    /**
     * Update visibility of gravitational force visualizations
     */
    updateGravitationalForceVisibility() {
        if (this.newtonianModel.gravitationalForces) {
            this.newtonianModel.gravitationalForces.forEach(force => {
                if (force.line) {
                    force.line.visible = this.newtonianModel.gravityEnabled;
                }
                if (force.influence) {
                    force.influence.visible = this.newtonianModel.gravityEnabled;
                }
            });
        }
    }

    /**
     * Calculate initial velocities for straight-line motion
     */
    calculateStraightLineVelocities() {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (body.object) {
                let velocityX = 0;
                let velocityZ = 0;
                
                if (body.semiMajorAxis) {
                    // Planets with elliptical orbits
                    const currentAngle = body.angle || 0;
                    const a = body.semiMajorAxis;
                    const e = body.eccentricity || 0;
                    const speed = body.speed;
                    
                    // Current distance from focus (sun)
                    const r = a * (1 - e * e) / (1 + e * Math.cos(currentAngle));
                    
                    // Angular velocity at current position (varies in elliptical orbit)
                    const angularVel = speed * 0.01 * this.animationSpeed;
                    
                    // Tangential velocity magnitude (v = r * ω for the tangential component)
                    const velocityMagnitude = r * angularVel * 20; // Scale factor for visible motion
                    
                    // Calculate velocity direction (perpendicular to radius vector from sun)
                    // For elliptical orbit, velocity direction is tangent to the ellipse
                    const velocityAngle = currentAngle + Math.PI / 2; // Perpendicular to radius
                    
                    velocityX = Math.cos(velocityAngle) * velocityMagnitude;
                    velocityZ = Math.sin(velocityAngle) * velocityMagnitude;
                    
                } else if (body.distance !== undefined) {
                    // Circular orbits (moons, asteroids)
                    const currentAngle = body.angle || (this.time * body.speed);
                    const speed = body.speed;
                    const distance = body.distance;
                    
                    // For circular motion: v = ω * r
                    const angularVel = speed * 0.01 * this.animationSpeed;
                    const velocityMagnitude = distance * angularVel * 20;
                    
                    // Velocity is perpendicular to radius
                    const velocityAngle = currentAngle + Math.PI / 2;
                    velocityX = Math.cos(velocityAngle) * velocityMagnitude;
                    velocityZ = Math.sin(velocityAngle) * velocityMagnitude;
                    
                    // For moons orbiting planets, add parent's velocity
                    if (body.parent && this.newtonianModel.planetVelocities[body.parent]) {
                        const parentVel = this.newtonianModel.planetVelocities[body.parent];
                        velocityX += parentVel.x;
                        velocityZ += parentVel.z;
                    }
                }
                
                this.newtonianModel.planetVelocities[name] = {
                    x: velocityX,
                    z: velocityZ,
                    initialPosition: {
                        x: body.object.position.x,
                        z: body.object.position.z
                    },
                    timeWhenGravityDisabled: this.time
                };
                
                // Debug: Log velocity calculations
                if (this.debugMode) {
                    console.log(`${name} velocity:`, {
                        vx: velocityX.toFixed(3),
                        vz: velocityZ.toFixed(3),
                        magnitude: Math.sqrt(velocityX*velocityX + velocityZ*velocityZ).toFixed(3),
                        position: {x: body.object.position.x.toFixed(2), z: body.object.position.z.toFixed(2)}
                    });
                }
            }
        });
    }

    /**
     * Debug mode to identify scene objects (non-destructive)
     */
    toggleDebugMode() {
        // Toggle light helper visibility
        if (this.lightHelper) {
            this.lightHelper.visible = !this.lightHelper.visible;
            console.log(`Light helper visibility: ${this.lightHelper.visible}`);
        }
        
        console.log('=== DEBUG: Scene Analysis ===');
        console.log(`Sun light position: (${this.lights.sun.position.x}, ${this.lights.sun.position.y}, ${this.lights.sun.position.z})`);
        console.log(`Sun light intensity: ${this.lights.sun.intensity}`);
        console.log(`Ambient light intensity: ${this.lights.ambient.intensity}`);
        
        let wireframeCount = 0;
        let lineCount = 0;
        let meshCount = 0;
        let materialTypes = {};
        
        this.scene.traverse((object) => {
            if (object.type === 'Line' || object.type === 'LineSegments' || object.type === 'LineLoop') {
                console.log('LINE OBJECT:', object.type, 'visible:', object.visible, object);
                lineCount++;
            } else if (object.type === 'Mesh') {
                meshCount++;
                if (object.material) {
                    const material = Array.isArray(object.material) ? object.material[0] : object.material;
                    const matType = material.constructor.name;
                    materialTypes[matType] = (materialTypes[matType] || 0) + 1;
                    
                    if (material.wireframe) {
                        console.log('WIREFRAME MESH:', object.type, 'visible:', object.visible, 'wireframe:', material.wireframe, object);
                        wireframeCount++;
                    }
                }
            }
        });
        
        console.log(`=== SUMMARY ===`);
        console.log(`Wireframe objects: ${wireframeCount}`);
        console.log(`Line objects: ${lineCount}`);
        console.log(`Total mesh objects: ${meshCount}`);
        console.log(`Material types:`, materialTypes);
        console.log(`Tracked wireframe objects: ${this.visualElements.wireframeObjects.length}`);
        console.log(`Tracked orbit objects: ${this.visualElements.orbitObjects.length}`);
        console.log(`Wireframes visible setting: ${this.visualElements.wireframesVisible}`);
        console.log(`Orbits visible setting: ${this.visualElements.orbitsVisible}`);
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

        // Show/hide gravity button based on model
        const gravityBtn = document.getElementById('gravity-btn');
        if (gravityBtn) {
            if (modelName === 'newtonian') {
                gravityBtn.style.display = 'inline-block';
                gravityBtn.classList.add('active');
                gravityBtn.textContent = '🌍 Gravity';
            } else {
                gravityBtn.style.display = 'none';
                // Reset Newtonian model properties when switching away
                this.newtonianModel.gravityEnabled = true;
                this.newtonianModel.planetVelocities = {};
                this.newtonianModel.gravitationalForces = [];
            }
        }

        // Show mobile feedback
        if (window.innerWidth <= 768) {
            const modelNames = {
                aristotle: "Aristotle's Model",
                ptolemaic: "Ptolemaic Model", 
                copernican: "Copernican Model",
                galilean: "Galilean Model",
                kepler: "Kepler's Model",
                newtonian: "Newtonian Model"
            };
            this.showToast(`${modelNames[modelName]} loaded`);
        }

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
            case 'newtonian':
                this.createNewtonianModel();
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
     * Create Newton's gravitational model with force visualizations
     */
    createNewtonianModel() {
        // Sun at center with enhanced gravitational field visualization
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { 
            object: sun,
            mass: 1000, // Relative mass for gravitational calculations
            gravitationalInfluence: true
        };

        // Add gravitational field visualization around the sun
        const fieldGeometry = new THREE.SphereGeometry(5, 32, 32);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        const gravitationalField = new THREE.Mesh(fieldGeometry, fieldMaterial);
        this.scene.add(gravitationalField);
        this.addWireframeToTracking(gravitationalField);

        // Planets with realistic mass ratios and gravitational parameters
        const planets = [
            { name: 'Mercury', a: 8, e: 0.21, size: 1, color: 0x8c7853, speed: 2.4, mass: 0.33 },
            { name: 'Venus', a: 12, e: 0.007, size: 1.5, color: 0xffc649, speed: 1.8, mass: 4.9 },
            { name: 'Earth', a: 18, e: 0.017, size: 2, color: 0x4a90e2, speed: 1.2, mass: 5.97 },
            { name: 'Mars', a: 25, e: 0.093, size: 1.3, color: 0xff6347, speed: 0.8, mass: 0.64 },
            { name: 'Jupiter', a: 45, e: 0.048, size: 2.5, color: 0xdaa520, speed: 0.4, mass: 190 },
            { name: 'Saturn', a: 65, e: 0.054, size: 2.2, color: 0xf4a460, speed: 0.3, mass: 57 }
        ];

        // Reset Newtonian model properties
        this.newtonianModel.gravityEnabled = true;
        this.newtonianModel.planetVelocities = {};
        this.newtonianModel.gravitationalForces = [];

        planets.forEach(planet => {
            // Calculate focus positions for ellipse
            const c = planet.a * planet.e;
            const focus1 = new THREE.Vector3(-c, 0, 0); // Sun is at one focus
            const focus2 = new THREE.Vector3(c, 0, 0);   // Empty focus

            // Create elliptical orbit path with enhanced visualization
            const orbitPoints = [];
            const segments = 120;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const r = planet.a * (1 - planet.e * planet.e) / (1 + planet.e * Math.cos(theta));
                orbitPoints.push(new THREE.Vector3(r * Math.cos(theta) - c, 0, r * Math.sin(theta)));
            }
            
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.6
            });
            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbit);
            this.addOrbitToTracking(orbit);

            // Add gravitational force vectors for significant masses
            if (planet.mass > 1) {
                // Create force line from sun to planet
                const forceGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(planet.a - c, 0, 0)
                ]);
                const forceMaterial = new THREE.LineBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.3
                });
                const forceLine = new THREE.Line(forceGeometry, forceMaterial);
                this.scene.add(forceLine);
                this.addWireframeToTracking(forceLine);
                this.newtonianModel.gravitationalForces.push({
                    line: forceLine,
                    planet: planet.name.toLowerCase(),
                    strength: planet.mass / 100 // Visual strength indicator
                });

                // Add gravitational influence sphere around massive planets
                const influenceGeometry = new THREE.SphereGeometry(planet.size * 2, 16, 16);
                const influenceMaterial = new THREE.MeshBasicMaterial({
                    color: planet.color,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.BackSide
                });
                const influenceSphere = new THREE.Mesh(influenceGeometry, influenceMaterial);
                this.scene.add(influenceSphere);
                this.addWireframeToTracking(influenceSphere);
                
                // Store influence sphere with planet
                this.newtonianModel.gravitationalForces.push({
                    influence: influenceSphere,
                    planet: planet.name.toLowerCase(),
                    type: 'influence'
                });
            }

            // Add focus point markers with enhanced styling
            if (planet.e > 0.05) {
                // Empty focus point
                const focusGeometry = new THREE.SphereGeometry(0.4, 12, 12);
                const focusMaterial = new THREE.MeshBasicMaterial({
                    color: planet.color,
                    transparent: true,
                    opacity: 0.8
                });
                const focusPoint = new THREE.Mesh(focusGeometry, focusMaterial);
                focusPoint.position.copy(focus2);
                this.scene.add(focusPoint);
                this.addWireframeToTracking(focusPoint);

                // Add cross marker
                const crossGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-0.8, 0, 0),
                    new THREE.Vector3(0.8, 0, 0)
                ]);
                const crossMaterial = new THREE.LineBasicMaterial({
                    color: planet.color,
                    transparent: true,
                    opacity: 0.9
                });
                const cross1 = new THREE.Line(crossGeometry, crossMaterial);
                cross1.position.copy(focus2);
                this.scene.add(cross1);
                this.addWireframeToTracking(cross1);

                const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, -0.8),
                    new THREE.Vector3(0, 0, 0.8)
                ]);
                const cross2 = new THREE.Line(crossGeometry2, crossMaterial);
                cross2.position.copy(focus2);
                this.scene.add(cross2);
                this.addWireframeToTracking(cross2);
            }

            // Add velocity vectors at perihelion and aphelion
            const perihelionDistance = planet.a * (1 - planet.e);
            const aphelionDistance = planet.a * (1 + planet.e);
            
            // Perihelion velocity vector (faster)
            const perihelionVel = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1).normalize(),
                new THREE.Vector3(perihelionDistance - c, 0, 0),
                6,
                0x00ff00,
                2,
                1
            );
            perihelionVel.line.material.transparent = true;
            perihelionVel.line.material.opacity = 0.7;
            perihelionVel.cone.material.transparent = true;
            perihelionVel.cone.material.opacity = 0.7;
            this.scene.add(perihelionVel);
            this.addWireframeToTracking(perihelionVel);

            // Aphelion velocity vector (slower)
            const aphelionVel = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1).normalize(),
                new THREE.Vector3(-aphelionDistance - c, 0, 0),
                3,
                0x0066ff,
                1.5,
                0.8
            );
            aphelionVel.line.material.transparent = true;
            aphelionVel.line.material.opacity = 0.7;
            aphelionVel.cone.material.transparent = true;
            aphelionVel.cone.material.opacity = 0.7;
            this.scene.add(aphelionVel);
            this.addWireframeToTracking(aphelionVel);

            // Planet with enhanced properties
            const body = this.createCelestialBody(planet.name, planet.size, planet.color, planet.a - c, 0, 0);
            this.celestialBodies[planet.name.toLowerCase()] = {
                object: body,
                orbit: orbit,
                semiMajorAxis: planet.a,
                eccentricity: planet.e,
                speed: planet.speed,
                mass: planet.mass,
                angle: Math.random() * Math.PI * 2,
                focusOffset: c,
                gravitationalForces: true // Flag for gravitational calculations
            };
        });

        // Add asteroid belt to show gravitational perturbations
        this.createAsteroidBelt();

        // Add Earth's Moon with tidal effects
        const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, 18 + 3, 0, 0);
        this.celestialBodies.moon = {
            object: moon,
            distance: 3,
            speed: 4,
            parent: 'earth',
            mass: 0.73,
            tidalForce: true
        };

        // Add gravitational interaction lines between major planets
        this.addInterplanetaryForces();
    }

    /**
     * Create asteroid belt to demonstrate gravitational perturbations
     */
    createAsteroidBelt() {
        const asteroidCount = 30;
        const asteroidBeltRadius = 35; // Between Mars and Jupiter
        
        for (let i = 0; i < asteroidCount; i++) {
            const angle = (i / asteroidCount) * Math.PI * 2;
            const radiusVariation = (Math.random() - 0.5) * 8;
            const radius = asteroidBeltRadius + radiusVariation;
            
            const asteroidGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 8);
            const asteroidMaterial = new THREE.MeshPhongMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.8
            });
            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            asteroid.position.set(x, 0, z);
            
            this.scene.add(asteroid);
            this.addWireframeToTracking(asteroid);
            
            // Store asteroid for animation
            this.celestialBodies[`asteroid${i}`] = {
                object: asteroid,
                distance: radius,
                speed: 0.5 + Math.random() * 0.3,
                angle: angle,
                type: 'asteroid',
                perturbation: Math.random() * 0.1 // Random perturbation factor
            };
        }
    }

    /**
     * Add gravitational interaction lines between major planets
     */
    addInterplanetaryForces() {
        const majorPlanets = ['jupiter', 'saturn', 'earth', 'mars'];
        
        majorPlanets.forEach((planet1, i) => {
            majorPlanets.forEach((planet2, j) => {
                if (i < j) { // Avoid duplicate lines
                    const forceGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(0, 0, 0),
                        new THREE.Vector3(10, 0, 0)
                    ]);
                    const forceMaterial = new THREE.LineBasicMaterial({
                        color: 0x888888,
                        transparent: true,
                        opacity: 0.15
                    });
                    const forceLine = new THREE.Line(forceGeometry, forceMaterial);
                    this.scene.add(forceLine);
                    this.addWireframeToTracking(forceLine);
                    
                    this.newtonianModel.gravitationalForces.push({
                        line: forceLine,
                        planet1: planet1,
                        planet2: planet2,
                        type: 'interplanetary'
                    });
                }
            });
        });
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
                // Regular planets and moons - enhanced for better lighting
                material = new THREE.MeshPhongMaterial({ 
                    map: texture,
                    shininess: name.toLowerCase() === 'europa' || name.toLowerCase() === 'callisto' ? 100 : 5,
                    specular: 0x222222,  // Low specular reflection for realistic look
                    // Add subtle base color that blends with texture
                    color: new THREE.Color(color).multiplyScalar(0.9)
                });
            }
        } else {
            // Fallback to solid color if no texture - enhanced for better lighting
            material = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 5,
                specular: 0x222222  // Low specular for realistic planetary surfaces
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
        
        // Apply animation speed multiplier
        this.time += 0.01 * this.animationSpeed;
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
            if (name === 'sun' && (this.currentModel === 'copernican' || this.currentModel === 'galilean' || this.currentModel === 'kepler' || this.currentModel === 'newtonian')) return; // Sun stays fixed in heliocentric models

            // Add planetary rotation for realism
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed;
            }

            if (this.currentModel === 'newtonian' && !this.newtonianModel.gravityEnabled) {
                // Straight-line motion for ANY body when gravity is disabled (check FIRST!)
                const velocity = this.newtonianModel.planetVelocities[name];
                if (velocity) {
                    const deltaTime = this.time - velocity.timeWhenGravityDisabled;
                    const x = velocity.initialPosition.x + velocity.x * deltaTime;
                    const z = velocity.initialPosition.z + velocity.z * deltaTime;
                    body.object.position.set(x, 0, z);
                }
            } else if (body.parent) {
                // Moon or satellite orbiting around parent (when gravity is ON)
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
                // Kepler elliptical orbit (gravity enabled)
                body.angle += body.speed * 0.01 * this.animationSpeed;
                const r = body.semiMajorAxis * (1 - body.eccentricity * body.eccentricity) / 
                         (1 + body.eccentricity * Math.cos(body.angle));
                const c = body.focusOffset || 0;
                const x = r * Math.cos(body.angle) - c;
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

        // Update gravitational force visualizations for Newtonian model
        if (this.currentModel === 'newtonian' && this.newtonianModel.gravitationalForces) {
            this.newtonianModel.gravitationalForces.forEach(force => {
                if (force.type === 'interplanetary') {
                    // Update interplanetary force lines
                    const planet1 = this.celestialBodies[force.planet1];
                    const planet2 = this.celestialBodies[force.planet2];
                    
                    if (planet1 && planet2 && planet1.object && planet2.object) {
                        const positions = force.line.geometry.attributes.position.array;
                        positions[0] = planet1.object.position.x;
                        positions[1] = planet1.object.position.y;
                        positions[2] = planet1.object.position.z;
                        positions[3] = planet2.object.position.x;
                        positions[4] = planet2.object.position.y;
                        positions[5] = planet2.object.position.z;
                        force.line.geometry.attributes.position.needsUpdate = true;
                        
                        // Adjust opacity based on distance (closer = stronger force)
                        const distance = planet1.object.position.distanceTo(planet2.object.position);
                        const opacity = Math.max(0.05, 0.3 / (distance * 0.1));
                        force.line.material.opacity = opacity;
                    }
                } else if (force.line && force.planet) {
                    // Update force lines from sun to planets
                    const planet = this.celestialBodies[force.planet];
                    if (planet && planet.object) {
                        const positions = force.line.geometry.attributes.position.array;
                        positions[3] = planet.object.position.x;
                        positions[4] = planet.object.position.y;
                        positions[5] = planet.object.position.z;
                        force.line.geometry.attributes.position.needsUpdate = true;
                    }
                } else if (force.influence && force.planet) {
                    // Update influence spheres to follow planets
                    const planet = this.celestialBodies[force.planet];
                    if (planet && planet.object) {
                        force.influence.position.copy(planet.object.position);
                    }
                }
            });
        }

        // Update asteroid belt with gravitational perturbations (always for Newtonian model)
        if (this.currentModel === 'newtonian') {
            Object.entries(this.celestialBodies).forEach(([name, body]) => {
                if (body.type === 'asteroid') {
                    // Simple gravitational perturbation from Jupiter
                    const jupiter = this.celestialBodies.jupiter;
                    if (jupiter && jupiter.object) {
                        const distanceToJupiter = body.object.position.distanceTo(jupiter.object.position);
                        const perturbation = (body.perturbation || 0) * Math.sin(this.time * 0.5) * (50 / distanceToJupiter);
                        
                        // Update asteroid position with perturbation
                        body.angle += (body.speed * 0.01 * this.animationSpeed) + perturbation * 0.01;
                        const x = Math.cos(body.angle) * body.distance;
                        const z = Math.sin(body.angle) * body.distance;
                        body.object.position.set(x, 0, z);
                    }
                }
            });
        }

        // Check for collisions in Newtonian model
        if (this.currentModel === 'newtonian' && this.newtonianModel.collisionEnabled) {
            this.detectCollisions();
        }

        // Update explosion particles
        this.updateExplosionParticles();
    }

    /**
     * Detect collisions between celestial bodies
     */
    detectCollisions() {
        const bodies = Object.entries(this.celestialBodies);
        
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const [name1, body1] = bodies[i];
                const [name2, body2] = bodies[j];
                
                // Skip if either body doesn't exist or is the sun
                if (!body1.object || !body2.object || name1 === 'sun' || name2 === 'sun') continue;
                
                // Skip asteroids colliding with each other (too many)
                if (name1.startsWith('asteroid') && name2.startsWith('asteroid')) continue;
                
                // Skip parent-child relationships (e.g., Earth-Moon, Jupiter-Io)
                if (this.isParentChildRelationship(name1, body1, name2, body2)) continue;
                
                // Only detect collisions when gravity is disabled (more realistic)
                // With gravity on, stable orbits shouldn't result in collisions
                if (this.newtonianModel.gravityEnabled) continue;
                
                const distance = body1.object.position.distanceTo(body2.object.position);
                const body1Size = this.getCelestialBodySize(body1.object);
                const body2Size = this.getCelestialBodySize(body2.object);
                const collisionDistance = body1Size + body2Size + 0.5; // Smaller buffer for more realistic collisions
                
                if (distance < collisionDistance) {
                    this.handleCollision(name1, body1, name2, body2);
                    return; // Handle one collision per frame
                }
            }
        }
    }

    /**
     * Check if two bodies have a parent-child relationship
     */
    isParentChildRelationship(name1, body1, name2, body2) {
        // Check if one body is the parent of the other
        if (body1.parent === name2 || body2.parent === name1) {
            return true;
        }
        
        // Check for specific known relationships
        const relationships = [
            ['earth', 'moon'],
            ['jupiter', 'io'],
            ['jupiter', 'europa'],
            ['jupiter', 'ganymede'],
            ['jupiter', 'callisto']
        ];
        
        for (const [parent, child] of relationships) {
            if ((name1 === parent && name2 === child) || (name1 === child && name2 === parent)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Handle collision between two celestial bodies
     */
    handleCollision(name1, body1, name2, body2) {
        // Get sizes and masses
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const mass1 = body1.mass || size1 * size1; // Rough mass estimate
        const mass2 = body2.mass || size2 * size2;
        
        // Collision position (between the two objects)
        const collisionPos = new THREE.Vector3()
            .addVectors(body1.object.position, body2.object.position)
            .multiplyScalar(0.5);
        
        // Determine collision type based on relative masses
        const massRatio = Math.min(mass1, mass2) / Math.max(mass1, mass2);
        
        if (massRatio > 0.3 && Math.random() > 0.3) {
            // Merge if masses are similar and random chance
            this.mergePlanets(name1, body1, name2, body2, collisionPos);
        } else {
            // Explode if masses are very different or random chance
            this.explodePlanets(name1, body1, name2, body2, collisionPos);
        }
        
        // Show toast notification
        this.showToast(`💥 ${name1} and ${name2} collided!`, 3000);
    }

    /**
     * Merge two planets into one larger planet
     */
    mergePlanets(name1, body1, name2, body2, position) {
        // Calculate merged properties
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const mass1 = body1.mass || size1 * size1;
        const mass2 = body2.mass || size2 * size2;
        
        const totalMass = mass1 + mass2;
        const newSize = Math.pow(totalMass, 1/3) * 0.8; // Cube root relationship, slightly compressed
        
        // Calculate merged velocity (conservation of momentum)
        let vel1 = this.newtonianModel.planetVelocities[name1] || {x: 0, z: 0};
        let vel2 = this.newtonianModel.planetVelocities[name2] || {x: 0, z: 0};
        
        const newVelX = (vel1.x * mass1 + vel2.x * mass2) / totalMass;
        const newVelZ = (vel1.z * mass1 + vel2.z * mass2) / totalMass;
        
        // Create new merged planet
        const newName = `merged_${name1}_${name2}`;
        const newColor = this.blendColors(body1.object.material.color.getHex(), body2.object.material.color.getHex());
        
        // Remove old bodies
        this.removeCelestialBody(name1);
        this.removeCelestialBody(name2);
        
        // Create new merged body
        const mergedBody = this.createCelestialBody(newName.replace(/_/g, ' '), newSize, newColor, position.x, position.y, position.z);
        
        this.celestialBodies[newName] = {
            object: mergedBody,
            mass: totalMass,
            type: 'merged'
        };
        
        // Set velocity for the new merged planet
        if (!this.newtonianModel.gravityEnabled) {
            this.newtonianModel.planetVelocities[newName] = {
                x: newVelX,
                z: newVelZ,
                initialPosition: {x: position.x, z: position.z},
                timeWhenGravityDisabled: this.time
            };
        }
        
        // Create merge effect
        this.createMergeEffect(position);
        
        console.log(`🪐 Merged ${name1} and ${name2} into ${newName}`);
    }

    /**
     * Explode two planets into debris
     */
    explodePlanets(name1, body1, name2, body2, position) {
        // Create explosion effect
        this.createExplosionEffect(position);
        
        // Calculate debris properties
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const debrisCount = Math.min(15, Math.floor((size1 + size2) * 2));
        
        // Get velocities for debris scatter
        let vel1 = this.newtonianModel.planetVelocities[name1] || {x: 0, z: 0};
        let vel2 = this.newtonianModel.planetVelocities[name2] || {x: 0, z: 0};
        
        // Remove original bodies
        this.removeCelestialBody(name1);
        this.removeCelestialBody(name2);
        
        // Create debris fragments
        for (let i = 0; i < debrisCount; i++) {
            const debrisName = `debris_${name1}_${name2}_${i}`;
            const debrisSize = 0.3 + Math.random() * 0.8;
            const debrisColor = Math.random() > 0.5 ? body1.object.material.color.getHex() : body2.object.material.color.getHex();
            
            // Random position around collision point
            const angle = (i / debrisCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const distance = 1 + Math.random() * 3;
            const debrisX = position.x + Math.cos(angle) * distance;
            const debrisZ = position.z + Math.sin(angle) * distance;
            
            const debris = this.createCelestialBody(`Debris ${i+1}`, debrisSize, debrisColor, debrisX, position.y, debrisZ);
            
            this.celestialBodies[debrisName] = {
                object: debris,
                mass: debrisSize * debrisSize,
                type: 'debris'
            };
            
            // Set random scatter velocity
            if (!this.newtonianModel.gravityEnabled) {
                const scatterSpeed = 5 + Math.random() * 10;
                const scatterAngle = angle + (Math.random() - 0.5) * Math.PI;
                const baseVelX = (vel1.x + vel2.x) * 0.5;
                const baseVelZ = (vel1.z + vel2.z) * 0.5;
                
                this.newtonianModel.planetVelocities[debrisName] = {
                    x: baseVelX + Math.cos(scatterAngle) * scatterSpeed,
                    z: baseVelZ + Math.sin(scatterAngle) * scatterSpeed,
                    initialPosition: {x: debrisX, z: debrisZ},
                    timeWhenGravityDisabled: this.time
                };
            }
        }
        
        console.log(`💥 Exploded ${name1} and ${name2} into ${debrisCount} debris fragments`);
    }

    /**
     * Remove a celestial body from the scene
     */
    removeCelestialBody(name) {
        const body = this.celestialBodies[name];
        if (body) {
            if (body.object) this.scene.remove(body.object);
            if (body.orbit) this.scene.remove(body.orbit);
            delete this.celestialBodies[name];
            if (this.newtonianModel.planetVelocities[name]) {
                delete this.newtonianModel.planetVelocities[name];
            }
        }
    }

    /**
     * Get the size of a celestial body
     */
    getCelestialBodySize(object) {
        return object.geometry.parameters.radius || 1;
    }

    /**
     * Blend two colors together
     */
    blendColors(color1, color2) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, 0.5).getHex();
    }

    /**
     * Create merge effect
     */
    createMergeEffect(position) {
        // Create bright flash
        const flashGeometry = new THREE.SphereGeometry(5, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        this.scene.add(flash);
        
        // Animate flash fade out
        const fadeOut = () => {
            flash.material.opacity -= 0.05;
            flash.scale.multiplyScalar(1.1);
            if (flash.material.opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(flash);
            }
        };
        fadeOut();
    }

    /**
     * Create explosion effect with particles
     */
    createExplosionEffect(position) {
        // Create explosion particles
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5), // Orange/red
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(position);
            
            // Random velocity
            const speed = 5 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * Math.cos(elevation) * speed,
                    Math.sin(elevation) * speed,
                    Math.sin(angle) * Math.cos(elevation) * speed
                ),
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03
            };
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        this.newtonianModel.explosionParticles.push(...particles);
    }

    /**
     * Update explosion particles
     */
    updateExplosionParticles() {
        for (let i = this.newtonianModel.explosionParticles.length - 1; i >= 0; i--) {
            const particle = this.newtonianModel.explosionParticles[i];
            
            // Update position
            particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
            
            // Apply gravity to particles (make them fall)
            particle.userData.velocity.y -= 0.2;
            
            // Update life
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            
            // Remove dead particles
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.newtonianModel.explosionParticles.splice(i, 1);
            }
        }
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