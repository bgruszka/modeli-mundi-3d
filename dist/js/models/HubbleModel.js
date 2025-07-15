/**
 * Hubble's Expanding Universe Model (1929)
 * 
 * Historical Context:
 * Edwin Hubble's revolutionary discovery that galaxies are moving away from us
 * with velocities proportional to their distance, proving the universe is expanding.
 * This observation overthrew the static universe model and laid the foundation
 * for Big Bang cosmology and modern understanding of cosmic evolution.
 * 
 * Key Scientific Concepts:
 * - Universal expansion (all galaxies receding)
 * - Hubble's Law: v = H₀ × d (velocity proportional to distance)
 * - Redshift effect (light from distant galaxies shifted toward red)
 * - Observable universe horizon
 * - Homogeneous and isotropic expansion
 * - No center of expansion (every point sees the same expansion)
 * 
 * Mathematical Foundation:
 * Hubble's Law: v = H₀ × d
 * where v = recession velocity, H₀ = Hubble constant (~70 km/s/Mpc), d = distance
 * 
 * Redshift formula: z = (λ_observed - λ_emitted) / λ_emitted = v/c (for small velocities)
 * 
 * Historical Significance:
 * This discovery revolutionized cosmology, leading to the Big Bang theory,
 * cosmic microwave background prediction, and our modern understanding
 * of the universe's age, structure, and ultimate fate.
 */
import { BaseModel } from './BaseModel.js';

export class HubbleModel extends BaseModel {
    constructor(name, scene, textureManager) {
        super(name, scene, textureManager);
        
        // Physical parameters based on Hubble's observations
        this.hubbleConstant = 0.002;        // H₀ scaled for visualization (actual ~70 km/s/Mpc)
        this.galaxyCount = 200;             // Observable galaxies in all directions
        this.maxDistance = 120;             // Observable universe radius for visualization
        this.expansionRate = 1.0;           // Animation speed factor
        this.lightSpeed = 10;               // Speed of light scaled for visualization
        
        // Redshift and visual parameters
        this.showRedshiftEffect = true;
        this.showExpansionVectors = true;
        this.showDistanceRings = true;
        this.showHubbleDiagram = false;     // Could be toggled for educational mode
        
        // Animation state
        this.timeElapsed = 0;
        this.initialPositions = new Map();
        
        // Color mapping for redshift (from blue to red)
        this.redshiftColors = [
            0x4169E1,  // Royal Blue (closest galaxies)
            0x0080FF,  // Blue
            0x00BFFF,  // Deep Sky Blue
            0x87CEEB,  // Sky Blue
            0xFFFFFF,  // White (intermediate distance)
            0xFFD700,  // Gold
            0xFF8C00,  // Dark Orange
            0xFF4500,  // Red Orange
            0xFF0000   // Red (most distant galaxies)
        ];
    }

    async createCelestialBodies() {
        // Create the Milky Way at the center (our observation point)
        this.createMilkyWay();
        
        // Create distant galaxies with varying distances and redshift
        this.createDistantGalaxies();
        
        // Create distance rings for visualization
        if (this.showDistanceRings) {
            this.createDistanceRings();
        }
        
        // Create expansion vectors for educational purposes
        if (this.showExpansionVectors) {
            this.createExpansionVectors();
        }
        
        // Add cosmic microwave background representation
        this.createCosmicBackground();
    }

    createMilkyWay() {
        // Create our galaxy at the center as the observation point
        const milkyWayGeometry = new THREE.SphereGeometry(2, 32, 16);
        const milkyWayMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x222244,
            shininess: 30
        });
        
        const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
        milkyWay.position.set(0, 0, 0);
        milkyWay.userData = {
            type: 'milkyway',
            name: 'Milky Way (Observer)',
            distance: 0,
            velocity: 0,
            redshift: 0
        };
        
        // Add a subtle glow effect
        const glowGeometry = new THREE.SphereGeometry(3, 16, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4444FF,
            transparent: true,
            opacity: 0.1
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        milkyWay.add(glow);
        
        this.celestialBodies.milkyway = {
            object: milkyWay,
            glow: glow,
            distance: 0,
            velocity: 0
        };
        
        this.scene.add(milkyWay);
    }

    createDistantGalaxies() {
        for (let i = 0; i < this.galaxyCount; i++) {
            // Generate random position in 3D space
            const distance = Math.random() * this.maxDistance + 10; // Minimum distance of 10
            const theta = Math.random() * Math.PI * 2; // Azimuthal angle
            const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform on sphere)
            
            // Convert spherical to Cartesian coordinates
            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta);
            const z = distance * Math.cos(phi);
            
            // Calculate recession velocity using Hubble's Law: v = H₀ × d
            const velocity = this.hubbleConstant * distance;
            const redshift = Math.min(velocity / this.lightSpeed, 0.8); // Cap redshift for visualization
            
            // Create galaxy with redshift-based color
            const galaxy = this.createGalaxy(x, y, z, distance, velocity, redshift, i);
            
            // Store initial position for expansion animation
            this.initialPositions.set(`galaxy_${i}`, { x, y, z, distance });
            
            this.celestialBodies[`galaxy_${i}`] = {
                object: galaxy,
                distance: distance,
                velocity: velocity,
                redshift: redshift,
                initialPosition: { x, y, z }
            };
        }
    }

    createGalaxy(x, y, z, distance, velocity, redshift, index) {
        // Galaxy size varies with distance (smaller = more distant)
        const baseSize = Math.max(0.5, 2 - distance / 60);
        const size = baseSize + Math.random() * 0.5;
        
        // Color based on redshift (blue-shifted to red-shifted)
        const colorIndex = Math.floor(redshift * (this.redshiftColors.length - 1));
        const galaxyColor = this.redshiftColors[Math.min(colorIndex, this.redshiftColors.length - 1)];
        
        // Create galaxy geometry (slightly flattened sphere for spiral galaxy appearance)
        const galaxyGeometry = new THREE.SphereGeometry(size, 12, 8);
        galaxyGeometry.scale(1, 0.3, 1); // Flatten to represent spiral galaxy
        
        const galaxyMaterial = new THREE.MeshPhongMaterial({
            color: galaxyColor,
            emissive: new THREE.Color(galaxyColor).multiplyScalar(0.1),
            transparent: true,
            opacity: Math.max(0.4, 1 - redshift) // More distant = more transparent
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        galaxy.position.set(x, y, z);
        
        // Random rotation for variety
        galaxy.rotation.x = Math.random() * Math.PI;
        galaxy.rotation.y = Math.random() * Math.PI;
        galaxy.rotation.z = Math.random() * Math.PI;
        
        // Add metadata
        galaxy.userData = {
            type: 'galaxy',
            name: `Galaxy ${index + 1}`,
            distance: distance,
            velocity: velocity,
            redshift: redshift,
            initialPosition: { x, y, z }
        };
        
        // Add subtle point light for distant galaxies
        if (distance < 50) {
            const light = new THREE.PointLight(galaxyColor, 0.1, distance * 0.5);
            light.position.set(x, y, z);
            this.temporaryObjects.push(light);
            this.scene.add(light);
        }
        
        this.scene.add(galaxy);
        return galaxy;
    }

    createDistanceRings() {
        // Create concentric rings to show distance scales
        const ringDistances = [20, 40, 60, 80, 100];
        
        ringDistances.forEach((radius, index) => {
            const ringGeometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.userData = {
                type: 'distance_ring',
                radius: radius,
                name: `${radius} Mpc`
            };
            
            this.temporaryObjects.push(ring);
            this.scene.add(ring);
        });
    }

    createExpansionVectors() {
        // Create arrows showing expansion direction for educational purposes
        const arrowCount = 12;
        
        for (let i = 0; i < arrowCount; i++) {
            const angle = (i / arrowCount) * Math.PI * 2;
            const distance = 30;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            // Create arrow using cylinder and cone
            const arrowGroup = new THREE.Group();
            
            // Arrow shaft
            const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4);
            const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.position.y = 2;
            arrowGroup.add(shaft);
            
            // Arrow head
            const headGeometry = new THREE.ConeGeometry(0.3, 1);
            const headMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 4.5;
            arrowGroup.add(head);
            
            arrowGroup.position.set(x, 0, z);
            arrowGroup.lookAt(x * 2, 0, z * 2); // Point outward
            
            arrowGroup.userData = {
                type: 'expansion_vector',
                name: 'Expansion Direction'
            };
            
            this.temporaryObjects.push(arrowGroup);
            this.scene.add(arrowGroup);
        }
    }

    createCosmicBackground() {
        // Create a subtle cosmic microwave background representation
        const backgroundGeometry = new THREE.SphereGeometry(this.maxDistance * 1.5, 32, 16);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: 0x221122,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        background.userData = {
            type: 'cosmic_background',
            name: 'Cosmic Microwave Background'
        };
        
        this.temporaryObjects.push(background);
        this.scene.add(background);
    }

    updateAnimations(time, speed) {
        this.timeElapsed += speed * 0.01;
        
        // Update galaxy positions based on Hubble expansion
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name.startsWith('galaxy_') && body.object) {
                const initialPos = body.initialPosition;
                const expansionFactor = 1 + (this.timeElapsed * this.expansionRate * 0.1);
                
                // Calculate new position (everything moves away from center)
                const newX = initialPos.x * expansionFactor;
                const newY = initialPos.y * expansionFactor;
                const newZ = initialPos.z * expansionFactor;
                
                body.object.position.set(newX, newY, newZ);
                
                // Update velocity and redshift based on new distance
                const newDistance = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
                const newVelocity = this.hubbleConstant * newDistance;
                const newRedshift = Math.min(newVelocity / this.lightSpeed, 0.8);
                
                // Update color based on new redshift
                const colorIndex = Math.floor(newRedshift * (this.redshiftColors.length - 1));
                const newColor = this.redshiftColors[Math.min(colorIndex, this.redshiftColors.length - 1)];
                body.object.material.color.setHex(newColor);
                body.object.material.opacity = Math.max(0.3, 1 - newRedshift);
                
                // Update metadata
                body.distance = newDistance;
                body.velocity = newVelocity;
                body.redshift = newRedshift;
                body.object.userData.distance = newDistance;
                body.object.userData.velocity = newVelocity;
                body.object.userData.redshift = newRedshift;
            }
        });
        
        // Rotate galaxies slowly for visual interest
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object && body.object.userData.type === 'galaxy') {
                body.object.rotation.y += speed * 0.001;
            }
        });
        
        // Pulse the Milky Way to indicate it's our observation point
        if (this.celestialBodies.milkyway) {
            const pulse = Math.sin(time * 0.002) * 0.1 + 1;
            this.celestialBodies.milkyway.object.scale.setScalar(pulse);
        }
    }

    getDescription() {
        return {
            title: "Hubble's Expanding Universe",
            content: `Edwin Hubble's revolutionary 1929 discovery that galaxies are moving away from us with velocities proportional to their distance. This observation proved the universe is expanding uniformly in all directions, with more distant galaxies showing greater redshift (appearing redder) due to the Doppler effect. This discovery laid the foundation for Big Bang cosmology and our modern understanding of cosmic evolution.`
        };
    }
}