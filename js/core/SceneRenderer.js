/**
 * Scene Renderer - Handles all 3D rendering, lighting, and visual effects
 * Single Responsibility: 3D scene management and rendering
 */
export class SceneRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        
        // Lighting system
        this.lights = {
            ambient: null,
            sun: null,
            rim1: null,
            rim2: null
        };
        
        this.lightingSettings = {
            ambient: 0.15,
            sun: 2.5,
            rim: 0.2
        };
        
        // Visual element tracking
        this.visualElements = {
            orbitsVisible: true,
            wireframesVisible: true,
            starsVisible: true,
            orbitObjects: [],
            wireframeObjects: [],
            starField: null
        };
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createStarField();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000511);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(50, 30, 50);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);
    }
    
    setupLights() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, this.lightingSettings.ambient);
        this.scene.add(this.lights.ambient);

        // Sun light
        this.lights.sun = new THREE.PointLight(0xFFE4B5, this.lightingSettings.sun, 500, 2);
        this.lights.sun.position.set(-10, 5, 10);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.1;
        this.lights.sun.shadow.camera.far = 500;
        this.scene.add(this.lights.sun);

        // Rim lighting
        this.lights.rim1 = new THREE.DirectionalLight(0x87CEEB, this.lightingSettings.rim);
        this.lights.rim1.position.set(100, 50, 100);
        this.scene.add(this.lights.rim1);
        
        this.lights.rim2 = new THREE.DirectionalLight(0x4169E1, this.lightingSettings.rim * 0.7);
        this.lights.rim2.position.set(-100, -50, -100);
        this.scene.add(this.lights.rim2);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 500;
        this.controls.minDistance = 5;
    }
    
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 2000;
            
            const starType = Math.random();
            if (starType < 0.7) {
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else if (starType < 0.85) {
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else {
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.4;
            }
            
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
        
        this.visualElements.starField = stars;
    }
    
    // Model management
    setModel(model) {
        this.currentModel = model;
        if (model) {
            model.addToScene(this.scene);
        }
    }
    
    clearScene() {
        if (this.currentModel) {
            this.currentModel.removeFromScene(this.scene);
        }
        
        // Clear tracking arrays
        this.visualElements.orbitObjects = [];
        this.visualElements.wireframeObjects = [];
    }
    
    // Lighting controls
    updateLighting(settings) {
        if (settings.ambient !== undefined) {
            this.lightingSettings.ambient = settings.ambient;
            this.lights.ambient.intensity = settings.ambient;
        }
        
        if (settings.sun !== undefined) {
            this.lightingSettings.sun = settings.sun;
            this.lights.sun.intensity = settings.sun;
        }
        
        if (settings.rim !== undefined) {
            this.lightingSettings.rim = settings.rim;
            this.lights.rim1.intensity = settings.rim;
            this.lights.rim2.intensity = settings.rim * 0.7;
        }
    }
    
    // Visual element controls
    setVisualElementVisible(type, visible) {
        switch (type) {
            case 'orbits':
                this.visualElements.orbitsVisible = visible;
                this.toggleOrbitsVisibility();
                break;
            case 'wireframes':
                this.visualElements.wireframesVisible = visible;
                this.toggleWireframesVisibility();
                break;
            case 'stars':
                this.visualElements.starsVisible = visible;
                this.toggleStarsVisibility();
                break;
        }
    }
    
    toggleOrbitsVisibility() {
        this.visualElements.orbitObjects.forEach(orbit => {
            orbit.visible = this.visualElements.orbitsVisible;
        });
        
        this.scene.traverse((object) => {
            if (object.type === 'Line' || object.type === 'LineSegments' || object.type === 'LineLoop') {
                if (!this.visualElements.orbitObjects.includes(object)) {
                    object.visible = this.visualElements.orbitsVisible;
                }
            }
        });
    }
    
    toggleWireframesVisibility() {
        this.visualElements.wireframeObjects.forEach(wireframe => {
            wireframe.visible = this.visualElements.wireframesVisible;
        });
        
        this.scene.traverse((object) => {
            if (object.type === 'Mesh' && object.material) {
                const material = Array.isArray(object.material) ? object.material[0] : object.material;
                if (material.wireframe === true && !this.visualElements.orbitObjects.includes(object)) {
                    object.visible = this.visualElements.wireframesVisible;
                }
            }
        });
    }
    
    toggleStarsVisibility() {
        if (this.visualElements.starField) {
            this.visualElements.starField.visible = this.visualElements.starsVisible;
        }
    }
    
    // Tracking methods for visual elements
    addOrbitToTracking(orbitObject) {
        this.visualElements.orbitObjects.push(orbitObject);
        orbitObject.visible = this.visualElements.orbitsVisible;
    }
    
    addWireframeToTracking(wireframeObject) {
        this.visualElements.wireframeObjects.push(wireframeObject);
        wireframeObject.visible = this.visualElements.wireframesVisible;
    }
    
    // Utilities
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    update() {
        this.controls.update();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}