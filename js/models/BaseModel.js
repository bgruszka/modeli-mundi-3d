/**
 * Base Model - Abstract base class for all universe models
 * Implements Template Method pattern and defines interface for models
 */
export class BaseModel {
    constructor(name, scene, textureManager) {
        this.name = name;
        this.scene = scene;
        this.textureManager = textureManager;
        this.celestialBodies = {};
        this.temporaryObjects = [];
    }
    
    // Template method - defines the algorithm for model creation
    async create() {
        await this.createCelestialBodies();
        this.setupOrbits();
        this.setupAdditionalElements();
    }
    
    // Abstract methods to be implemented by subclasses
    async createCelestialBodies() {
        throw new Error('createCelestialBodies must be implemented by subclass');
    }
    
    setupOrbits() {
        // Default implementation - can be overridden
    }
    
    setupAdditionalElements() {
        // Default implementation - can be overridden
    }
    
    updateAnimations(time, speed) {
        // Default implementation - can be overridden
        this.updateDefaultAnimations(time, speed);
    }
    
    // Common methods available to all models
    updateDefaultAnimations(time, speed) {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            // Add planetary rotation for realism
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed * speed;
            }
            
            // Handle parent-child relationships (moons orbiting planets)
            if (body.parent) {
                const parent = this.celestialBodies[body.parent];
                if (parent && parent.object) {
                    const angle = time * body.speed * speed;
                    const x = parent.object.position.x + Math.cos(angle) * body.distance;
                    const z = parent.object.position.z + Math.sin(angle) * body.distance;
                    body.object.position.set(x, 0, z);
                    
                    if (body.orbit) {
                        body.orbit.position.copy(parent.object.position);
                    }
                }
            } else if (body.distance !== undefined) {
                // Simple circular motion
                const angle = time * body.speed * speed;
                const x = Math.cos(angle) * body.distance;
                const z = Math.sin(angle) * body.distance;
                body.object.position.set(x, 0, z);
            }
        });
    }
    
    createCelestialBody(name, size, color, x, y, z) {
        // Create sphere with proper UV mapping for textures
        const geometry = new THREE.SphereGeometry(size, 64, 32);
        
        // Get texture for this celestial body
        const bodyKey = name.toLowerCase();
        const texture = this.textureManager.getTexture(bodyKey);
        
        let material;
        if (texture) {
            if (name.toLowerCase() === 'sun') {
                // Sun should emit light
                material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    emissive: new THREE.Color(0xFFA500),
                    emissiveIntensity: 0.3
                });
            } else {
                // Regular planets and moons
                material = new THREE.MeshPhongMaterial({ 
                    map: texture,
                    shininess: name.toLowerCase() === 'europa' || name.toLowerCase() === 'callisto' ? 100 : 5,
                    specular: 0x222222,
                    color: new THREE.Color(color).multiplyScalar(0.9)
                });
            }
        } else {
            // Fallback to solid color
            material = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 5,
                specular: 0x222222
            });
        }
        
        const body = new THREE.Mesh(geometry, material);
        body.position.set(x, y, z);
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Add rotation for realism
        body.userData = {
            rotationSpeed: 0.01 + Math.random() * 0.02,
            name: name
        };
        
        // Add label
        this.addLabel(body, name, size);
        
        // Add rings for Saturn
        if (name.toLowerCase() === 'saturn') {
            this.addSaturnRings(body, size);
        }
        
        return body;
    }
    
    addLabel(object, text, size) {
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
    
    addSaturnRings(planet, planetSize) {
        const ringGeometry = new THREE.RingGeometry(planetSize * 1.2, planetSize * 2.2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xB8860B,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.rotation.z = Math.PI / 8;
        
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
    
    createOrbitRing(distance, color, opacity = 0.3) {
        const orbitGeometry = new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        return orbit;
    }
    
    createEllipticalOrbit(semiMajorAxis, eccentricity, color, focusOffset = 0) {
        const orbitPoints = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(theta));
            orbitPoints.push(new THREE.Vector3(r * Math.cos(theta) - focusOffset, 0, r * Math.sin(theta)));
        }
        
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        return new THREE.Line(orbitGeometry, orbitMaterial);
    }
    
    // Scene management
    addToScene(scene) {
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object) scene.add(body.object);
            if (body.orbit) scene.add(body.orbit);
            if (body.epicycle) scene.add(body.epicycle);
        });
        
        this.temporaryObjects.forEach(obj => {
            scene.add(obj);
        });
    }
    
    removeFromScene(scene) {
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object) scene.remove(body.object);
            if (body.orbit) scene.remove(body.orbit);
            if (body.epicycle) scene.remove(body.epicycle);
        });
        
        this.temporaryObjects.forEach(obj => {
            scene.remove(obj);
        });
        
        this.celestialBodies = {};
        this.temporaryObjects = [];
    }
    
    addTemporaryObject(object) {
        this.temporaryObjects.push(object);
        if (this.scene) {
            this.scene.add(object);
        }
    }
    
    removeTemporaryObject(object) {
        const index = this.temporaryObjects.indexOf(object);
        if (index > -1) {
            this.temporaryObjects.splice(index, 1);
        }
        if (this.scene) {
            this.scene.remove(object);
        }
    }
    
    // Getters
    getCelestialBodies() {
        return this.celestialBodies;
    }
    
    getCelestialBody(name) {
        return this.celestialBodies[name];
    }
}