/**
 * Aristotle's Geocentric Model
 * Earth at center with crystalline spheres carrying celestial bodies
 */
import { BaseModel } from './BaseModel.js';

export class AristotleModel extends BaseModel {
    async createCelestialBodies() {
        // Earth at center - larger and more prominent
        const earth = this.createCelestialBody('Earth', 3, 0x4a90e2, 0, 0, 0);
        this.celestialBodies.earth = { object: earth };

        // Crystalline spheres data
        const sphereData = [
            { name: 'Moon', radius: 8, color: 0xc0c0c0, size: 1 },
            { name: 'Mercury', radius: 12, color: 0x8c7853, size: 1.2 },
            { name: 'Venus', radius: 18, color: 0xffc649, size: 1.8 },
            { name: 'Sun', radius: 25, color: 0xffd700, size: 2.5 },
            { name: 'Mars', radius: 35, color: 0xff6347, size: 1.5 },
            { name: 'Jupiter', radius: 45, color: 0xdaa520, size: 2 },
            { name: 'Saturn', radius: 60, color: 0xf4a460, size: 1.8 }
        ];

        sphereData.forEach((data, i) => {
            this.createCrystallineSphere(data, i);
        });

        // Fixed stars sphere
        this.createFixedStarsSphere();
    }

    createCrystallineSphere(data, index) {
        const { name, radius, color, size } = data;

        // Create crystalline sphere (wireframe)
        const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Add subtle glow effect
        const glowGeometry = new THREE.SphereGeometry(radius * 1.02, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);

        // Create celestial body on sphere
        const body = this.createCelestialBody(name, size, color, radius, 0, 0);
        
        this.celestialBodies[name.toLowerCase()] = {
            object: body,
            sphere: sphere,
            glow: glow,
            radius: radius,
            speed: 0.5 / (index + 1) // Outer spheres move slower
        };
    }

    createFixedStarsSphere() {
        const starsRadius = 80;
        
        // Wireframe sphere
        const starsGeometry = new THREE.SphereGeometry(starsRadius, 32, 32);
        const starsMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        const starsSphere = new THREE.Mesh(starsGeometry, starsMaterial);

        // Individual star points
        const starPoints = [];
        for (let i = 0; i < 200; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = 79;
            starPoints.push(new THREE.Vector3(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.cos(theta),
                radius * Math.sin(theta) * Math.sin(phi)
            ));
        }
        
        const starPointsGeometry = new THREE.BufferGeometry().setFromPoints(starPoints);
        const starPointsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const starPointsCloud = new THREE.Points(starPointsGeometry, starPointsMaterial);

        this.celestialBodies.stars = {
            sphere: starsSphere,
            points: starPointsCloud
        };
    }

    updateAnimations(time, speed) {
        // Update celestial bodies orbiting on their spheres
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name === 'earth' || name === 'stars') return;

            if (body.object && body.radius) {
                // Rotate bodies around their crystalline spheres
                const angle = time * body.speed * speed;
                const x = Math.cos(angle) * body.radius;
                const z = Math.sin(angle) * body.radius;
                body.object.position.set(x, 0, z);
            }

            // Add planetary rotation
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed * speed;
            }
        });
    }

    addToScene(scene) {
        // Add celestial bodies
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object) scene.add(body.object);
            if (body.sphere) scene.add(body.sphere);
            if (body.glow) scene.add(body.glow);
            if (body.points) scene.add(body.points);
        });
    }

    removeFromScene(scene) {
        Object.values(this.celestialBodies).forEach(body => {
            if (body.object) scene.remove(body.object);
            if (body.sphere) scene.remove(body.sphere);
            if (body.glow) scene.remove(body.glow);
            if (body.points) scene.remove(body.points);
        });
        
        this.celestialBodies = {};
    }
}