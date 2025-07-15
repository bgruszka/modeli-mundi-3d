/**
 * Kepler's Elliptical Orbits Model
 * Heliocentric model with elliptical planetary orbits
 */
import { BaseModel } from './BaseModel.js';

export class KeplerModel extends BaseModel {
    async createCelestialBodies() {
        // Sun at center
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { object: sun };

        // Planets with elliptical parameters
        const planetData = [
            { name: 'Mercury', a: 8, e: 0.2, size: 1, color: 0x8c7853, speed: 2.4 },
            { name: 'Venus', a: 12, e: 0.01, size: 1.5, color: 0xffc649, speed: 1.8 },
            { name: 'Earth', a: 18, e: 0.02, size: 2, color: 0x4a90e2, speed: 1.2 },
            { name: 'Mars', a: 25, e: 0.09, size: 1.3, color: 0xff6347, speed: 0.8 },
            { name: 'Jupiter', a: 45, e: 0.05, size: 2.5, color: 0xdaa520, speed: 0.4 },
            { name: 'Saturn', a: 65, e: 0.06, size: 2.2, color: 0xf4a460, speed: 0.3 }
        ];

        planetData.forEach(data => {
            this.createPlanetWithEllipse(data);
        });

        // Add Earth's Moon
        this.createMoon();
    }

    createPlanetWithEllipse(data) {
        const { name, a, e, size, color, speed } = data;
        
        // Calculate focus offset
        const c = a * e;
        
        // Create elliptical orbit
        const orbit = this.createEllipticalOrbit(a, e, color, c);
        
        // Create planet
        const planet = this.createCelestialBody(name, size, color, a - c, 0, 0);
        
        this.celestialBodies[name.toLowerCase()] = {
            object: planet,
            orbit: orbit,
            semiMajorAxis: a,
            eccentricity: e,
            speed: speed,
            angle: Math.random() * Math.PI * 2,
            focusOffset: c
        };

        // Add focus points for eccentric orbits
        if (e > 0.05) {
            this.createFocusPoints(a, e, c, color);
        }

        // Add major/minor axis lines for very eccentric orbits
        if (e > 0.08) {
            this.createAxisLines(a, e, c, color);
        }
    }

    createFocusPoints(a, e, c, color) {
        const focus2 = new THREE.Vector3(c, 0, 0);
        
        // Empty focus point
        const focusGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const focusMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7
        });
        const focusPoint = new THREE.Mesh(focusGeometry, focusMaterial);
        focusPoint.position.copy(focus2);

        // Cross markers
        const crossGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(0.5, 0, 0)
        ]);
        const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -0.5),
            new THREE.Vector3(0, 0, 0.5)
        ]);
        const crossMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const cross1 = new THREE.Line(crossGeometry1, crossMaterial);
        const cross2 = new THREE.Line(crossGeometry2, crossMaterial);
        cross1.position.copy(focus2);
        cross2.position.copy(focus2);

        this.temporaryObjects.push(focusPoint, cross1, cross2);
    }

    createAxisLines(a, e, c, color) {
        // Major axis
        const majorAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-a - c, 0, 0),
            new THREE.Vector3(a - c, 0, 0)
        ]);
        const axisMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2
        });
        const majorAxis = new THREE.Line(majorAxisGeometry, axisMaterial);

        // Minor axis
        const b = a * Math.sqrt(1 - e * e);
        const minorAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-c, 0, -b),
            new THREE.Vector3(-c, 0, b)
        ]);
        const minorAxis = new THREE.Line(minorAxisGeometry, axisMaterial);

        this.temporaryObjects.push(majorAxis, minorAxis);
    }

    createMoon() {
        const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, 18 + 3, 0, 0);
        this.celestialBodies.moon = {
            object: moon,
            distance: 3,
            speed: 4,
            parent: 'earth'
        };
    }

    updateAnimations(time, speed) {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name === 'sun') return; // Sun stays fixed
            
            // Add planetary rotation
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed * speed;
            }

            if (body.parent) {
                // Moon orbiting Earth
                const parent = this.celestialBodies[body.parent];
                if (parent && parent.object) {
                    const angle = time * body.speed * speed;
                    const x = parent.object.position.x + Math.cos(angle) * body.distance;
                    const z = parent.object.position.z + Math.sin(angle) * body.distance;
                    body.object.position.set(x, 0, z);
                }
            } else if (body.semiMajorAxis && body.eccentricity !== undefined) {
                // Elliptical orbit
                body.angle += body.speed * 0.01 * speed;
                const r = body.semiMajorAxis * (1 - body.eccentricity * body.eccentricity) / 
                         (1 + body.eccentricity * Math.cos(body.angle));
                const c = body.focusOffset || 0;
                const x = r * Math.cos(body.angle) - c;
                const z = r * Math.sin(body.angle);
                body.object.position.set(x, 0, z);
            }
        });
    }
}