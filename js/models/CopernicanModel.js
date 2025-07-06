/**
 * Copernican Heliocentric Model
 * Sun at center with planets orbiting in circular paths
 */
import { BaseModel } from './BaseModel.js';

export class CopernicanModel extends BaseModel {
    async createCelestialBodies() {
        // Sun at center
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { object: sun };

        // Add sun glow
        this.createSunGlow();

        // Planet data
        const planetData = [
            { name: 'Mercury', distance: 8, size: 1, color: 0x8c7853, speed: 2.4 },
            { name: 'Venus', distance: 12, size: 1.5, color: 0xffc649, speed: 1.8 },
            { name: 'Earth', distance: 18, size: 2, color: 0x4a90e2, speed: 1.2 },
            { name: 'Mars', distance: 25, size: 1.3, color: 0xff6347, speed: 0.8 },
            { name: 'Jupiter', distance: 45, size: 2.5, color: 0xdaa520, speed: 0.4 },
            { name: 'Saturn', distance: 65, size: 2.2, color: 0xf4a460, speed: 0.3 }
        ];

        planetData.forEach(data => {
            this.createPlanet(data);
        });

        // Earth's Moon
        this.createMoon();
    }

    createSunGlow() {
        const sunGlowGeometry = new THREE.SphereGeometry(4, 16, 16);
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        this.celestialBodies.sun.glow = sunGlow;
    }

    createPlanet(data) {
        const { name, distance, size, color, speed } = data;

        // Create orbit ring
        const orbit = this.createOrbitRing(distance, color, 0.25);

        // Create planet
        const planet = this.createCelestialBody(name, size, color, distance, 0, 0);

        this.celestialBodies[name.toLowerCase()] = {
            object: planet,
            orbit: orbit,
            distance: distance,
            speed: speed
        };
    }

    createMoon() {
        // Moon's orbit ring
        const moonOrbitGeometry = new THREE.RingGeometry(2.8, 3.2, 32);
        const moonOrbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xc0c0c0,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
        moonOrbit.rotation.x = Math.PI / 2;

        const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, 18 + 3, 0, 0);
        this.celestialBodies.moon = {
            object: moon,
            orbit: moonOrbit,
            distance: 3,
            speed: 4,
            parent: 'earth'
        };
    }

    addToScene(scene) {
        super.addToScene(scene);
        
        if (this.celestialBodies.sun.glow) {
            scene.add(this.celestialBodies.sun.glow);
        }
    }

    removeFromScene(scene) {
        if (this.celestialBodies.sun && this.celestialBodies.sun.glow) {
            scene.remove(this.celestialBodies.sun.glow);
        }
        
        super.removeFromScene(scene);
    }
}