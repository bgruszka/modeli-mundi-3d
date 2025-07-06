/**
 * Ptolemaic Model with Epicycles
 * Geocentric model with complex epicyclic motions
 */
import { BaseModel } from './BaseModel.js';

export class PtolemaicModel extends BaseModel {
    async createCelestialBodies() {
        // Earth at center
        const earth = this.createCelestialBody('Earth', 3, 0x4a90e2, 0, 0, 0);
        this.celestialBodies.earth = { object: earth };

        // Planets with epicycles
        const planetData = [
            { name: 'Moon', distance: 8, size: 1, color: 0xc0c0c0, epicycleRadius: 0, speed: 2 },
            { name: 'Mercury', distance: 15, size: 1.2, color: 0x8c7853, epicycleRadius: 3, speed: 1.5 },
            { name: 'Venus', distance: 22, size: 1.8, color: 0xffc649, epicycleRadius: 4, speed: 1.2 },
            { name: 'Sun', distance: 30, size: 2.5, color: 0xffd700, epicycleRadius: 0, speed: 0.8 },
            { name: 'Mars', distance: 40, size: 1.5, color: 0xff6347, epicycleRadius: 6, speed: 0.6 },
            { name: 'Jupiter', distance: 55, size: 2, color: 0xdaa520, epicycleRadius: 5, speed: 0.4 },
            { name: 'Saturn', distance: 70, size: 1.8, color: 0xf4a460, epicycleRadius: 4, speed: 0.3 }
        ];

        planetData.forEach(data => {
            this.createPlanetWithEpicycle(data);
        });
    }

    createPlanetWithEpicycle(data) {
        const { name, distance, size, color, epicycleRadius, speed } = data;

        // Main orbit ring
        const orbit = this.createOrbitRing(distance, 0x444444, 0.3);

        // Planet
        const planet = this.createCelestialBody(name, size, color, distance, 0, 0);

        this.celestialBodies[name.toLowerCase()] = {
            object: planet,
            orbit: orbit,
            distance: distance,
            epicycleRadius: epicycleRadius,
            speed: speed,
            epicycleSpeed: speed * 3
        };

        // Epicycle circle for planets that have them
        if (epicycleRadius > 0) {
            const epicycleGeometry = new THREE.RingGeometry(
                epicycleRadius - 0.1, 
                epicycleRadius + 0.1, 
                32
            );
            const epicycleMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const epicycle = new THREE.Mesh(epicycleGeometry, epicycleMaterial);
            epicycle.rotation.x = Math.PI / 2;
            
            this.celestialBodies[name.toLowerCase()].epicycle = epicycle;
        }
    }

    updateAnimations(time, speed) {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name === 'earth') return; // Earth stays fixed
            
            // Add planetary rotation
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed * speed;
            }

            if (body.epicycleRadius && body.epicycleRadius > 0) {
                // Ptolemaic epicycle motion
                const centerAngle = time * body.speed * speed;
                const centerX = Math.cos(centerAngle) * body.distance;
                const centerZ = Math.sin(centerAngle) * body.distance;
                
                const epicycleAngle = time * body.epicycleSpeed * speed;
                const x = centerX + Math.cos(epicycleAngle) * body.epicycleRadius;
                const z = centerZ + Math.sin(epicycleAngle) * body.epicycleRadius;
                
                body.object.position.set(x, 0, z);
                
                // Update epicycle position
                if (body.epicycle) {
                    body.epicycle.position.set(centerX, 0, centerZ);
                }
            } else {
                // Simple circular motion for Sun and Moon
                const angle = time * body.speed * speed;
                const x = Math.cos(angle) * body.distance;
                const z = Math.sin(angle) * body.distance;
                body.object.position.set(x, 0, z);
            }
        });
    }
}