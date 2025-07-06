/**
 * Galilean Model with Jupiter's Moons
 * Heliocentric model featuring Galileo's telescopic discoveries
 */
import { CopernicanModel } from './CopernicanModel.js';

export class GalileanModel extends CopernicanModel {
    async createCelestialBodies() {
        // Start with Copernican model
        await super.createCelestialBodies();

        // Add Jupiter's four largest moons (Galilean moons)
        this.createJupiterMoons();
    }

    createJupiterMoons() {
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
            const orbit = this.createOrbitRing(moon.distance, moon.color, 0.2);

            this.celestialBodies[moon.name.toLowerCase()] = {
                object: moonBody,
                orbit: orbit,
                distance: moon.distance,
                speed: moon.speed,
                parent: 'jupiter'
            };
        });
    }
}