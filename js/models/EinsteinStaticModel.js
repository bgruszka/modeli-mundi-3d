/**
 * Einstein's Static Universe Model (1917)
 * 
 * Historical Context:
 * Einstein's first application of general relativity to cosmology, proposed to solve
 * the cosmological problem of creating a stable, finite universe. This model was
 * revolutionary as it introduced the cosmological constant (Λ) to balance
 * gravitational collapse, creating a mathematically elegant solution for a
 * static, closed universe.
 * 
 * Key Scientific Concepts:
 * - Finite but unbounded space (closed spherical geometry)
 * - Static spacetime (no expansion or contraction)
 * - Uniform matter distribution (homogeneous and isotropic)
 * - Cosmological constant as repulsive force
 * - Perfect balance between gravity and Λ
 * 
 * Mathematical Foundation:
 * Einstein Field Equations with cosmological constant:
 * Rμν - ½gμνR + Λgμν = 8πTμν
 * 
 * Historical Significance:
 * Though later abandoned after Hubble's discovery of cosmic expansion,
 * this model laid the groundwork for modern cosmology and demonstrated
 * the power of general relativity in describing the universe's structure.
 */
import { BaseModel } from './BaseModel.js';

export class EinsteinStaticModel extends BaseModel {
    constructor(name, scene, textureManager) {
        super(name, scene, textureManager);
        
        // Physical parameters of Einstein's static universe
        this.universeRadius = 100;          // Finite radius of the closed universe
        this.galaxyCount = 150;             // Uniform matter distribution
        this.cosmologicalConstant = 0.001;  // Einstein's Λ for cosmic balance
        this.matterDensity = 0.1;           // Critical density for static equilibrium
        
        // Educational parameters for visualization
        this.showEducationalLabels = true;
        this.showCosmologicalField = true;
        this.showSpacetimeGrid = true;
    }

    async createCelestialBodies() {
        // Create the finite universe boundary
        this.createUniverseBoundary();
        
        // Create uniform matter distribution (galaxies)
        this.createUniformMatterDistribution();
        
        // Add cosmological constant visualization
        this.createCosmologicalConstantField();
        
        // Add reference grid to show static nature
        this.createSpaceTimeGrid();
        
        // Add central observer point (representing our position)
        this.createObserverPoint();
    }

    createUniverseBoundary() {
        const boundaryGeometry = new THREE.SphereGeometry(this.universeRadius, 64, 64);
        
        // Outer boundary - represents the finite edge of the universe
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a4a4a,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
            wireframe: true
        });
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        
        // Inner glow to show finite nature
        const glowGeometry = new THREE.SphereGeometry(this.universeRadius * 0.98, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x6666ff,
            transparent: true,
            opacity: 0.03,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        
        this.celestialBodies.universe = {
            boundary: boundary,
            glow: glow
        };
    }

    createUniformMatterDistribution() {
        // Create galaxies uniformly distributed throughout the finite volume
        const galaxies = [];
        
        for (let i = 0; i < this.galaxyCount; i++) {
            // Generate random position within the sphere
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = Math.cbrt(Math.random()) * (this.universeRadius * 0.9); // Cubic root for uniform volume distribution
            
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            
            // Create galaxy representation
            const galaxy = this.createGalaxy(x, y, z, i);
            galaxies.push(galaxy);
        }
        
        this.celestialBodies.galaxies = galaxies;
    }

    createGalaxy(x, y, z, index) {
        // Create a small galaxy representation
        const size = 0.5 + Math.random() * 1.5;
        const colors = [0xffffaa, 0xffaaff, 0xaaffff, 0xaaffaa, 0xffaaaa];
        const color = colors[index % colors.length];
        
        const galaxy = this.createCelestialBody(`Galaxy-${index}`, size, color, x, y, z);
        
        // Add spiral arms for some galaxies
        if (Math.random() > 0.7) {
            this.addSpiralArms(galaxy, size);
        }
        
        // Add slight pulsing to show it's active matter
        galaxy.userData.pulseSpeed = 0.01 + Math.random() * 0.02;
        galaxy.userData.pulsePhase = Math.random() * Math.PI * 2;
        
        return {
            object: galaxy,
            position: new THREE.Vector3(x, y, z),
            restPosition: new THREE.Vector3(x, y, z), // Static - no expansion
            index: index
        };
    }

    addSpiralArms(galaxy, size) {
        // Create simple spiral arms for the galaxy
        const armCount = 2;
        const armGeometry = new THREE.BufferGeometry();
        const armPoints = [];
        
        for (let arm = 0; arm < armCount; arm++) {
            const armOffset = (arm / armCount) * Math.PI * 2;
            for (let i = 0; i < 20; i++) {
                const angle = armOffset + (i / 20) * Math.PI * 4;
                const radius = (i / 20) * size * 2;
                armPoints.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                ));
            }
        }
        
        armGeometry.setFromPoints(armPoints);
        const armMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const arms = new THREE.Line(armGeometry, armMaterial);
        
        galaxy.add(arms);
    }

    createCosmologicalConstantField() {
        // Visual representation of the cosmological constant
        // Creates a subtle field that permeates space
        const fieldParticles = [];
        
        for (let i = 0; i < 500; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = Math.cbrt(Math.random()) * (this.universeRadius * 0.95);
            
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            
            fieldParticles.push(new THREE.Vector3(x, y, z));
        }
        
        const fieldGeometry = new THREE.BufferGeometry().setFromPoints(fieldParticles);
        const fieldMaterial = new THREE.PointsMaterial({
            color: 0x6666ff,
            size: 0.1,
            transparent: true,
            opacity: 0.2
        });
        const field = new THREE.Points(fieldGeometry, fieldMaterial);
        
        this.celestialBodies.cosmologicalField = {
            object: field,
            particles: fieldParticles
        };
    }

    createSpaceTimeGrid() {
        // Create a subtle 3D grid to show the static nature of spacetime
        const gridSize = this.universeRadius * 0.8;
        const gridDivisions = 10;
        const gridStep = gridSize / gridDivisions;
        
        const gridGeometry = new THREE.BufferGeometry();
        const gridPoints = [];
        
        // Create grid lines
        for (let i = -gridDivisions; i <= gridDivisions; i++) {
            for (let j = -gridDivisions; j <= gridDivisions; j++) {
                // X-direction lines
                gridPoints.push(new THREE.Vector3(-gridSize, i * gridStep, j * gridStep));
                gridPoints.push(new THREE.Vector3(gridSize, i * gridStep, j * gridStep));
                
                // Y-direction lines
                gridPoints.push(new THREE.Vector3(i * gridStep, -gridSize, j * gridStep));
                gridPoints.push(new THREE.Vector3(i * gridStep, gridSize, j * gridStep));
                
                // Z-direction lines
                gridPoints.push(new THREE.Vector3(i * gridStep, j * gridStep, -gridSize));
                gridPoints.push(new THREE.Vector3(i * gridStep, j * gridStep, gridSize));
            }
        }
        
        gridGeometry.setFromPoints(gridPoints);
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.05
        });
        const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
        
        this.celestialBodies.spacetimeGrid = {
            object: grid
        };
    }

    createObserverPoint() {
        // Create a reference point representing our observational position
        const observer = this.createCelestialBody('Observer', 1, 0xffff00, 0, 0, 0);
        
        // Add a subtle glow to indicate our position
        const glowGeometry = new THREE.SphereGeometry(2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        
        observer.add(glow);
        
        this.celestialBodies.observer = {
            object: observer
        };
    }

    setupAdditionalElements() {
        // Add educational elements to enhance learning
        if (this.showEducationalLabels) {
            this.addModelInformation();
        }
        
        // Add historical context marker
        this.addHistoricalMarker();
    }
    
    /**
     * Provides detailed educational information about the model
     * @returns {Object} Educational content about Einstein's static universe
     */
    getEducationalInfo() {
        return {
            historicalContext: {
                year: 1917,
                motivation: "Einstein sought to apply general relativity to cosmology, needing a stable, finite universe model",
                problem: "Without the cosmological constant, the universe would collapse under its own gravity",
                solution: "Introduced Λ (Lambda) to create a repulsive force balancing gravity"
            },
            keyFeatures: {
                geometry: "Closed spherical geometry - finite but unbounded space",
                dynamics: "Static - no expansion or contraction over time",
                matter: "Uniform distribution of matter throughout the universe",
                balance: "Perfect equilibrium between gravitational attraction and cosmic repulsion"
            },
            mathematicalFoundation: {
                equation: "Rμν - ½gμνR + Λgμν = 8πTμν",
                components: {
                    "Rμν": "Ricci curvature tensor",
                    "R": "Ricci scalar",
                    "gμν": "Metric tensor",
                    "Λ": "Cosmological constant",
                    "Tμν": "Stress-energy tensor"
                }
            },
            visualization: {
                boundary: "Wireframe sphere represents the finite edge of space",
                galaxies: "150 galaxies show uniform matter distribution",
                field: "Blue particles represent the cosmological constant field",
                grid: "Static spacetime grid emphasizes no expansion",
                observer: "Central point shows our reference frame"
            },
            legacy: {
                abandonment: "Later abandoned after Hubble's discovery of cosmic expansion (1929)",
                importance: "Laid foundation for modern cosmology and Big Bang theory",
                revival: "Cosmological constant concept returned with dark energy discovery"
            }
        };
    }

    addModelInformation() {
        // Create information labels with detailed descriptions
        const infoLabels = [
            { text: 'Finite Universe\n(Closed Spherical Geometry)', position: new THREE.Vector3(0, this.universeRadius * 0.7, 0) },
            { text: 'Static Spacetime\n(No Expansion/Contraction)', position: new THREE.Vector3(this.universeRadius * 0.5, 0, 0) },
            { text: 'Uniform Matter Distribution\n(Homogeneous & Isotropic)', position: new THREE.Vector3(0, 0, this.universeRadius * 0.5) },
            { text: 'Cosmological Constant Λ\n(Repulsive Force)', position: new THREE.Vector3(-this.universeRadius * 0.5, 0, 0) },
            { text: 'Perfect Cosmic Balance\n(Gravity vs Λ)', position: new THREE.Vector3(0, -this.universeRadius * 0.7, 0) },
            { text: 'Einstein Field Equations\n(Rμν - ½gμνR + Λgμν = 8πTμν)', position: new THREE.Vector3(-this.universeRadius * 0.5, 0, this.universeRadius * 0.5) }
        ];
        
        infoLabels.forEach(label => {
            const sprite = this.createInfoSprite(label.text);
            sprite.position.copy(label.position);
            this.addTemporaryObject(sprite);
        });
    }
    
    addHistoricalMarker() {
        // Create a historical context marker
        const historicalText = "Einstein's 1917 Solution\nto the Cosmological Problem\n\n'The most beautiful fate of a physical theory\nis to point the way to the establishment\nof a more comprehensive theory'";
        
        const marker = this.createHistoricalSprite(historicalText);
        marker.position.set(0, this.universeRadius * 0.9, 0);
        this.addTemporaryObject(marker);
    }
    
    createHistoricalSprite(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 150;
        
        // Golden background to indicate historical significance
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(139, 69, 19, 0.9)');
        gradient.addColorStop(1, 'rgba(184, 134, 11, 0.9)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add decorative border
        context.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        context.lineWidth = 3;
        context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
        
        // Handle multi-line text
        const lines = text.split('\n');
        context.fillStyle = 'white';
        context.textAlign = 'center';
        
        // Calculate vertical positioning for multiple lines
        const lineHeight = 18;
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height - totalHeight) / 2 + lineHeight;
        
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            
            // Use different font sizes for different parts
            if (index < 2) {
                context.font = 'bold 16px Arial';
            } else if (index === 2) {
                context.font = '12px Arial';
            } else {
                context.font = 'italic 12px Arial';
            }
            
            // Main text with golden glow
            context.fillStyle = 'white';
            context.fillText(line, canvas.width / 2, y);
            
            // Add golden glow effect
            context.shadowColor = 'rgba(255, 215, 0, 0.6)';
            context.shadowBlur = 4;
            context.fillText(line, canvas.width / 2, y);
            context.shadowBlur = 0;
        });
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(25, 7.5, 1);
        
        return sprite;
    }

    createInfoSprite(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 100;
        
        // Enhanced background with gradient
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 50, 0.9)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        context.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        context.lineWidth = 2;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Handle multi-line text
        const lines = text.split('\n');
        context.fillStyle = 'white';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        
        // Calculate vertical positioning for multiple lines
        const lineHeight = 20;
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height - totalHeight) / 2 + lineHeight;
        
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            
            // Main text
            context.fillStyle = 'white';
            context.fillText(line, canvas.width / 2, y);
            
            // Add subtle glow effect
            context.shadowColor = 'rgba(255, 255, 255, 0.5)';
            context.shadowBlur = 3;
            context.fillText(line, canvas.width / 2, y);
            context.shadowBlur = 0;
        });
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(20, 5, 1);
        
        return sprite;
    }

    updateAnimations(time, speed) {
        // Very subtle animations to show the static nature
        
        // Gentle pulsing of galaxies to show they're active matter
        if (this.celestialBodies.galaxies) {
            this.celestialBodies.galaxies.forEach(galaxy => {
                if (galaxy.object && galaxy.object.userData.pulseSpeed) {
                    const pulse = Math.sin(time * galaxy.object.userData.pulseSpeed + galaxy.object.userData.pulsePhase);
                    galaxy.object.scale.setScalar(1 + pulse * 0.1);
                }
            });
        }
        
        // Slow rotation of the cosmological field
        if (this.celestialBodies.cosmologicalField && this.celestialBodies.cosmologicalField.object) {
            this.celestialBodies.cosmologicalField.object.rotation.y += 0.001 * speed;
        }
        
        // Very slow rotation of the entire universe boundary to show it's a closed system
        if (this.celestialBodies.universe && this.celestialBodies.universe.boundary) {
            this.celestialBodies.universe.boundary.rotation.y += 0.0005 * speed;
            this.celestialBodies.universe.glow.rotation.y += 0.0003 * speed;
        }
        
        // Static spacetime grid (no animation - emphasizes static nature)
        // Observer point stays fixed at origin
        
        // Add planetary rotation for observer point
        if (this.celestialBodies.observer && this.celestialBodies.observer.object) {
            this.celestialBodies.observer.object.rotation.y += 0.01 * speed;
        }
    }

    addToScene(scene) {
        // Add universe boundary
        if (this.celestialBodies.universe) {
            scene.add(this.celestialBodies.universe.boundary);
            scene.add(this.celestialBodies.universe.glow);
        }
        
        // Add galaxies
        if (this.celestialBodies.galaxies) {
            this.celestialBodies.galaxies.forEach(galaxy => {
                scene.add(galaxy.object);
            });
        }
        
        // Add cosmological field
        if (this.celestialBodies.cosmologicalField) {
            scene.add(this.celestialBodies.cosmologicalField.object);
        }
        
        // Add spacetime grid
        if (this.celestialBodies.spacetimeGrid) {
            scene.add(this.celestialBodies.spacetimeGrid.object);
        }
        
        // Add observer
        if (this.celestialBodies.observer) {
            scene.add(this.celestialBodies.observer.object);
        }
        
        // Add temporary objects (info labels)
        this.temporaryObjects.forEach(obj => {
            scene.add(obj);
        });
    }

    removeFromScene(scene) {
        // Remove universe boundary
        if (this.celestialBodies.universe) {
            scene.remove(this.celestialBodies.universe.boundary);
            scene.remove(this.celestialBodies.universe.glow);
        }
        
        // Remove galaxies
        if (this.celestialBodies.galaxies) {
            this.celestialBodies.galaxies.forEach(galaxy => {
                scene.remove(galaxy.object);
            });
        }
        
        // Remove cosmological field
        if (this.celestialBodies.cosmologicalField) {
            scene.remove(this.celestialBodies.cosmologicalField.object);
        }
        
        // Remove spacetime grid
        if (this.celestialBodies.spacetimeGrid) {
            scene.remove(this.celestialBodies.spacetimeGrid.object);
        }
        
        // Remove observer
        if (this.celestialBodies.observer) {
            scene.remove(this.celestialBodies.observer.object);
        }
        
        // Remove temporary objects
        this.temporaryObjects.forEach(obj => {
            scene.remove(obj);
        });
        
        this.celestialBodies = {};
        this.temporaryObjects = [];
    }
}