/**
 * Newtonian Gravitational Model
 * Advanced heliocentric model with gravitational physics simulation
 */
import { BaseModel } from './BaseModel.js';

export class NewtonianModel extends BaseModel {
    constructor(name, scene, textureManager) {
        super(name, scene, textureManager);
        this.gravityEnabled = true;
        this.gravitationalForces = [];
        this.planetVelocities = {};
        this.currentTime = 0;
    }

    async createCelestialBodies() {
        // Sun at center with gravitational field
        const sun = this.createCelestialBody('Sun', 3, 0xffd700, 0, 0, 0);
        this.celestialBodies.sun = { 
            object: sun,
            mass: 1000,
            gravitationalInfluence: true
        };

        this.createGravitationalField();

        // Planets with realistic parameters
        const planetData = [
            { name: 'Mercury', a: 8, e: 0.21, size: 1, color: 0x8c7853, speed: 2.4, mass: 0.33 },
            { name: 'Venus', a: 12, e: 0.007, size: 1.5, color: 0xffc649, speed: 1.8, mass: 4.9 },
            { name: 'Earth', a: 18, e: 0.017, size: 2, color: 0x4a90e2, speed: 1.2, mass: 5.97 },
            { name: 'Mars', a: 25, e: 0.093, size: 1.3, color: 0xff6347, speed: 0.8, mass: 0.64 },
            { name: 'Jupiter', a: 45, e: 0.048, size: 2.5, color: 0xdaa520, speed: 0.4, mass: 190 },
            { name: 'Saturn', a: 65, e: 0.054, size: 2.2, color: 0xf4a460, speed: 0.3, mass: 57 }
        ];

        planetData.forEach(data => {
            this.createPlanetWithPhysics(data);
        });

        // Earth's Moon
        this.createMoon();

        // Asteroid belt
        this.createAsteroidBelt();

        // Add gravitational interactions
        this.createInterplanetaryForces();
    }

    createGravitationalField() {
        const fieldGeometry = new THREE.SphereGeometry(5, 32, 32);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        const gravitationalField = new THREE.Mesh(fieldGeometry, fieldMaterial);
        
        this.celestialBodies.sun.gravitationalField = gravitationalField;
    }

    createPlanetWithPhysics(data) {
        const { name, a, e, size, color, speed, mass } = data;
        
        // Calculate focus offset
        const c = a * e;
        
        // Create elliptical orbit
        const orbit = this.createEllipticalOrbit(a, e, color, c);
        
        // Create planet
        const planet = this.createCelestialBody(name, size, color, a - c, 0, 0);
        
        // Store planet data
        this.celestialBodies[name.toLowerCase()] = {
            object: planet,
            orbit: orbit,
            semiMajorAxis: a,
            eccentricity: e,
            speed: speed,
            mass: mass,
            angle: Math.random() * Math.PI * 2,
            focusOffset: c,
            gravitationalForces: true
        };

        // Create gravitational force visualization
        if (mass > 1) {
            this.createGravitationalForceVisualization(name.toLowerCase(), color);
            this.createInfluenceSphere(name.toLowerCase(), size, color);
        }

        // Add focus points and velocity vectors for eccentric orbits
        if (e > 0.05) {
            this.createFocusPoints(a, e, c, color);
            this.createVelocityVectors(a, e, c, color);
        }
    }

    createGravitationalForceVisualization(planetName, color) {
        const forceGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0)
        ]);
        const forceMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3
        });
        const forceLine = new THREE.Line(forceGeometry, forceMaterial);

        this.gravitationalForces.push({
            line: forceLine,
            planet: planetName,
            type: 'solar'
        });
    }

    createInfluenceSphere(planetName, size, color) {
        const influenceGeometry = new THREE.SphereGeometry(size * 2, 16, 16);
        const influenceMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        const influenceSphere = new THREE.Mesh(influenceGeometry, influenceMaterial);

        this.gravitationalForces.push({
            influence: influenceSphere,
            planet: planetName,
            type: 'influence'
        });
    }

    createFocusPoints(a, e, c, color) {
        const focus2 = new THREE.Vector3(c, 0, 0);
        
        const focusGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const focusMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const focusPoint = new THREE.Mesh(focusGeometry, focusMaterial);
        focusPoint.position.copy(focus2);

        // Cross markers
        const crossGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.8, 0, 0),
            new THREE.Vector3(0.8, 0, 0)
        ]);
        const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -0.8),
            new THREE.Vector3(0, 0, 0.8)
        ]);
        const crossMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const cross1 = new THREE.Line(crossGeometry1, crossMaterial);
        const cross2 = new THREE.Line(crossGeometry2, crossMaterial);
        cross1.position.copy(focus2);
        cross2.position.copy(focus2);

        // Store focus elements
        this.temporaryObjects.push(focusPoint, cross1, cross2);
    }

    createVelocityVectors(a, e, c, color) {
        const perihelionDistance = a * (1 - e);
        const aphelionDistance = a * (1 + e);
        
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

        this.temporaryObjects.push(perihelionVel, aphelionVel);
    }

    createMoon() {
        const moon = this.createCelestialBody('Moon', 0.5, 0xc0c0c0, 18 + 3, 0, 0);
        this.celestialBodies.moon = {
            object: moon,
            distance: 3,
            speed: 4,
            parent: 'earth',
            mass: 0.73,
            tidalForce: true
        };
    }

    createAsteroidBelt() {
        const asteroidCount = 30;
        const asteroidBeltRadius = 35;
        
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
            
            this.celestialBodies[`asteroid${i}`] = {
                object: asteroid,
                distance: radius,
                speed: 0.5 + Math.random() * 0.3,
                angle: angle,
                type: 'asteroid',
                perturbation: Math.random() * 0.1
            };
        }
    }

    createInterplanetaryForces() {
        const majorPlanets = ['jupiter', 'saturn', 'earth', 'mars'];
        
        majorPlanets.forEach((planet1, i) => {
            majorPlanets.forEach((planet2, j) => {
                if (i < j) {
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
                    
                    this.gravitationalForces.push({
                        line: forceLine,
                        planet1: planet1,
                        planet2: planet2,
                        type: 'interplanetary'
                    });
                }
            });
        });
    }

    updateAnimations(time, speed) {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (name === 'sun') return; // Sun stays fixed
            
            // Add planetary rotation
            if (body.object && body.object.userData.rotationSpeed) {
                body.object.rotation.y += body.object.userData.rotationSpeed * speed;
            }

            // Handle straight-line motion when gravity is disabled
            if (!this.gravityEnabled && this.planetVelocities[name]) {
                const velocity = this.planetVelocities[name];
                const deltaTime = time - velocity.timeWhenGravityDisabled;
                const x = velocity.initialPosition.x + velocity.x * deltaTime;
                const z = velocity.initialPosition.z + velocity.z * deltaTime;
                body.object.position.set(x, 0, z);
                return;
            }

            // Normal gravitational animations
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
            } else if (body.type === 'asteroid' && this.gravityEnabled) {
                // Asteroid with Jupiter perturbation
                const jupiter = this.celestialBodies.jupiter;
                if (jupiter && jupiter.object) {
                    const distanceToJupiter = body.object.position.distanceTo(jupiter.object.position);
                    const perturbation = (body.perturbation || 0) * Math.sin(time * 0.5) * (50 / distanceToJupiter);
                    
                    body.angle += (body.speed * 0.01 * speed) + perturbation * 0.01;
                    const x = Math.cos(body.angle) * body.distance;
                    const z = Math.sin(body.angle) * body.distance;
                    body.object.position.set(x, 0, z);
                }
            }
        });
    }

    updateGravitationalForces() {
        this.gravitationalForces.forEach(force => {
            if (force.type === 'interplanetary') {
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
                    
                    const distance = planet1.object.position.distanceTo(planet2.object.position);
                    const opacity = Math.max(0.05, 0.3 / (distance * 0.1));
                    force.line.material.opacity = opacity;
                }
            } else if (force.type === 'solar' && force.line) {
                const planet = this.celestialBodies[force.planet];
                if (planet && planet.object) {
                    const positions = force.line.geometry.attributes.position.array;
                    positions[3] = planet.object.position.x;
                    positions[4] = planet.object.position.y;
                    positions[5] = planet.object.position.z;
                    force.line.geometry.attributes.position.needsUpdate = true;
                }
            } else if (force.type === 'influence' && force.influence) {
                const planet = this.celestialBodies[force.planet];
                if (planet && planet.object) {
                    force.influence.position.copy(planet.object.position);
                }
            }
        });
    }

    setCurrentTime(time) {
        this.currentTime = time;
    }

    setGravityEnabled(enabled) {
        this.gravityEnabled = enabled;
        
        // Show/hide gravitational force visualizations
        this.gravitationalForces.forEach(force => {
            if (force.line) {
                force.line.visible = enabled;
            }
            if (force.influence) {
                force.influence.visible = enabled;
            }
        });

        // Calculate initial velocities for straight-line motion when gravity is turned off
        if (!enabled) {
            this.calculateStraightLineVelocities();
        } else {
            // Clear velocities when gravity is re-enabled
            this.planetVelocities = {};
        }
    }

    calculateStraightLineVelocities() {
        Object.entries(this.celestialBodies).forEach(([name, body]) => {
            if (body.object && name !== 'sun') {
                let velocityX = 0;
                let velocityZ = 0;
                
                if (body.semiMajorAxis) {
                    const currentAngle = body.angle || 0;
                    const a = body.semiMajorAxis;
                    const e = body.eccentricity || 0;
                    const speed = body.speed;
                    
                    const r = a * (1 - e * e) / (1 + e * Math.cos(currentAngle));
                    const angularVel = speed * 0.01;
                    const velocityMagnitude = r * angularVel * 20;
                    const velocityAngle = currentAngle + Math.PI / 2;
                    
                    velocityX = Math.cos(velocityAngle) * velocityMagnitude;
                    velocityZ = Math.sin(velocityAngle) * velocityMagnitude;
                } else if (body.distance !== undefined) {
                    // Handle circular orbits (moon, asteroids)
                    const currentAngle = body.angle || (this.currentTime * body.speed);
                    const speed = body.speed;
                    const distance = body.distance;
                    
                    const angularVel = speed * 0.01;
                    const velocityMagnitude = distance * angularVel * 20;
                    const velocityAngle = currentAngle + Math.PI / 2;
                    
                    velocityX = Math.cos(velocityAngle) * velocityMagnitude;
                    velocityZ = Math.sin(velocityAngle) * velocityMagnitude;
                    
                    // Add parent's velocity for moons
                    if (body.parent && this.planetVelocities[body.parent]) {
                        const parentVel = this.planetVelocities[body.parent];
                        velocityX += parentVel.x;
                        velocityZ += parentVel.z;
                    }
                }
                
                this.planetVelocities[name] = {
                    x: velocityX,
                    z: velocityZ,
                    initialPosition: {
                        x: body.object.position.x,
                        z: body.object.position.z
                    },
                    timeWhenGravityDisabled: this.currentTime
                };
            }
        });
    }

    // Physics integration methods
    mergePlanets(name1, name2, newName, newSize, newColor, position, velocity) {
        // Remove old bodies
        delete this.celestialBodies[name1];
        delete this.celestialBodies[name2];
        
        // Remove old velocities
        delete this.planetVelocities[name1];
        delete this.planetVelocities[name2];
        
        // Create new merged body
        const mergedBody = this.createCelestialBody(newName.replace(/_/g, ' '), newSize, newColor, position.x, position.y, position.z);
        
        this.celestialBodies[newName] = {
            object: mergedBody,
            mass: velocity.mass,
            type: 'merged'
        };
        
        // Set velocity for straight-line motion
        if (!this.gravityEnabled) {
            this.planetVelocities[newName] = {
                x: velocity.x,
                z: velocity.z,
                initialPosition: {
                    x: position.x,
                    z: position.z
                },
                timeWhenGravityDisabled: velocity.timeWhenGravityDisabled || this.currentTime
            };
        }
    }

    explodePlanets(name1, name2, debrisCount, position, velocities) {
        // Remove original bodies
        delete this.celestialBodies[name1];
        delete this.celestialBodies[name2];
        
        // Remove old velocities
        delete this.planetVelocities[name1];
        delete this.planetVelocities[name2];
        
        // Create debris fragments
        for (let i = 0; i < debrisCount; i++) {
            const debrisName = `debris_${name1}_${name2}_${i}`;
            const debrisSize = 0.3 + Math.random() * 0.8;
            const debrisColor = Math.random() > 0.5 ? 0x8B4513 : 0x696969;
            
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
            if (!this.gravityEnabled) {
                const scatterSpeed = 5 + Math.random() * 10;
                const scatterAngle = angle + (Math.random() - 0.5) * Math.PI;
                const baseVelX = (velocities.vel1.x + velocities.vel2.x) * 0.5;
                const baseVelZ = (velocities.vel1.z + velocities.vel2.z) * 0.5;
                
                this.planetVelocities[debrisName] = {
                    x: baseVelX + Math.cos(scatterAngle) * scatterSpeed,
                    z: baseVelZ + Math.sin(scatterAngle) * scatterSpeed,
                    initialPosition: {x: debrisX, z: debrisZ},
                    timeWhenGravityDisabled: this.currentTime
                };
            }
        }
    }

    addToScene(scene) {
        super.addToScene(scene);
        
        // Add gravitational force visualizations
        this.gravitationalForces.forEach(force => {
            if (force.line) scene.add(force.line);
            if (force.influence) scene.add(force.influence);
        });

        // Add gravitational field
        if (this.celestialBodies.sun.gravitationalField) {
            scene.add(this.celestialBodies.sun.gravitationalField);
        }
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);
        
        // Remove gravitational force visualizations
        this.gravitationalForces.forEach(force => {
            if (force.line) scene.remove(force.line);
            if (force.influence) scene.remove(force.influence);
        });
        
        this.gravitationalForces = [];
        this.planetVelocities = {};
    }
}