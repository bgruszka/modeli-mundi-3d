/**
 * Physics Engine - Handles physics simulation, collision detection, and gravitational forces
 * Single Responsibility: Physics calculations and collision detection
 */
export class PhysicsEngine {
    constructor() {
        this.gravityEnabled = true;
        this.collisionEnabled = true;
        this.currentModel = null;
        this.explosionParticles = [];
    }
    
    init() {
        console.log('Physics engine initialized');
    }
    
    setGravityEnabled(enabled) {
        this.gravityEnabled = enabled;
        
        if (this.currentModel && this.currentModel.name === 'newtonian') {
            this.currentModel.setGravityEnabled(enabled);
        }
    }
    
    setModel(model) {
        this.currentModel = model;
        
        // Reset physics state when switching models
        this.explosionParticles = [];
    }
    
    update(time) {
        if (!this.currentModel) return;
        
        // Update physics for specific models
        if (this.currentModel.name === 'newtonian') {
            this.updateNewtonianPhysics(time);
        }
        
        // Update explosion particles
        this.updateExplosionParticles();
    }
    
    updateNewtonianPhysics(time) {
        // Update gravitational force visualizations
        this.currentModel.updateGravitationalForces();
        
        // Handle collision detection when gravity is disabled
        if (!this.gravityEnabled && this.collisionEnabled) {
            this.detectCollisions();
        }
        
        // Let the model handle its own velocity calculations and pass time
        this.currentModel.setCurrentTime(time);
    }
    
    detectCollisions() {
        if (!this.currentModel) return;
        
        const celestialBodies = this.currentModel.getCelestialBodies();
        const bodies = Object.entries(celestialBodies);
        
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const [name1, body1] = bodies[i];
                const [name2, body2] = bodies[j];
                
                // Skip if either body doesn't exist or is the sun
                if (!body1.object || !body2.object || name1 === 'sun' || name2 === 'sun') continue;
                
                // Skip asteroids colliding with each other
                if (name1.startsWith('asteroid') && name2.startsWith('asteroid')) continue;
                
                // Skip parent-child relationships
                if (this.isParentChildRelationship(name1, body1, name2, body2)) continue;
                
                const distance = body1.object.position.distanceTo(body2.object.position);
                const body1Size = this.getCelestialBodySize(body1.object);
                const body2Size = this.getCelestialBodySize(body2.object);
                const collisionDistance = body1Size + body2Size + 0.5;
                
                if (distance < collisionDistance) {
                    this.handleCollision(name1, body1, name2, body2);
                    return; // Handle one collision per frame
                }
            }
        }
    }
    
    isParentChildRelationship(name1, body1, name2, body2) {
        // Check if one body is the parent of the other
        if (body1.parent === name2 || body2.parent === name1) {
            return true;
        }
        
        // Check for specific known relationships
        const relationships = [
            ['earth', 'moon'],
            ['jupiter', 'io'],
            ['jupiter', 'europa'],
            ['jupiter', 'ganymede'],
            ['jupiter', 'callisto']
        ];
        
        for (const [parent, child] of relationships) {
            if ((name1 === parent && name2 === child) || (name1 === child && name2 === parent)) {
                return true;
            }
        }
        
        return false;
    }
    
    handleCollision(name1, body1, name2, body2) {
        if (!this.currentModel) return;
        
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const mass1 = body1.mass || size1 * size1;
        const mass2 = body2.mass || size2 * size2;
        
        // Collision position
        const collisionPos = new THREE.Vector3()
            .addVectors(body1.object.position, body2.object.position)
            .multiplyScalar(0.5);
        
        // Determine collision type based on relative masses
        const massRatio = Math.min(mass1, mass2) / Math.max(mass1, mass2);
        
        if (massRatio > 0.3 && Math.random() > 0.3) {
            this.mergePlanets(name1, body1, name2, body2, collisionPos);
        } else {
            this.explodePlanets(name1, body1, name2, body2, collisionPos);
        }
    }
    
    mergePlanets(name1, body1, name2, body2, position) {
        if (!this.currentModel) return;
        
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const mass1 = body1.mass || size1 * size1;
        const mass2 = body2.mass || size2 * size2;
        
        const totalMass = mass1 + mass2;
        const newSize = Math.pow(totalMass, 1/3) * 0.8;
        
        // Get velocities from the model
        const modelVelocities = this.currentModel.planetVelocities || {};
        const vel1 = modelVelocities[name1] || {x: 0, z: 0};
        const vel2 = modelVelocities[name2] || {x: 0, z: 0};
        
        const newVelX = (vel1.x * mass1 + vel2.x * mass2) / totalMass;
        const newVelZ = (vel1.z * mass1 + vel2.z * mass2) / totalMass;
        
        // Create new merged planet
        const newName = `merged_${name1}_${name2}`;
        const newColor = this.blendColors(body1.object.material.color.getHex(), body2.object.material.color.getHex());
        
        // Let the model handle the actual merging
        this.currentModel.mergePlanets(name1, name2, newName, newSize, newColor, position, {
            x: newVelX,
            z: newVelZ,
            mass: totalMass,
            timeWhenGravityDisabled: this.currentModel.currentTime
        });
        
        // Create merge effect
        this.createMergeEffect(position);
    }
    
    explodePlanets(name1, body1, name2, body2, position) {
        if (!this.currentModel) return;
        
        const size1 = this.getCelestialBodySize(body1.object);
        const size2 = this.getCelestialBodySize(body2.object);
        const debrisCount = Math.min(15, Math.floor((size1 + size2) * 2));
        
        // Get velocities from the model
        const modelVelocities = this.currentModel.planetVelocities || {};
        const vel1 = modelVelocities[name1] || {x: 0, z: 0};
        const vel2 = modelVelocities[name2] || {x: 0, z: 0};
        
        // Let the model handle the actual explosion
        this.currentModel.explodePlanets(name1, name2, debrisCount, position, {
            vel1: vel1,
            vel2: vel2
        });
        
        // Create explosion effect
        this.createExplosionEffect(position);
    }
    

    
    createMergeEffect(position) {
        // Create bright flash
        const flashGeometry = new THREE.SphereGeometry(5, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        
        // Add to scene and animate
        if (this.currentModel) {
            this.currentModel.addTemporaryObject(flash);
        }
        
        const fadeOut = () => {
            flash.material.opacity -= 0.05;
            flash.scale.multiplyScalar(1.1);
            if (flash.material.opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                if (this.currentModel) {
                    this.currentModel.removeTemporaryObject(flash);
                }
            }
        };
        fadeOut();
    }
    
    createExplosionEffect(position) {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5),
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(position);
            
            // Random velocity
            const speed = 5 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * Math.cos(elevation) * speed,
                    Math.sin(elevation) * speed,
                    Math.sin(angle) * Math.cos(elevation) * speed
                ),
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03
            };
            
            this.explosionParticles.push(particle);
            
            if (this.currentModel) {
                this.currentModel.addTemporaryObject(particle);
            }
        }
    }
    
    updateExplosionParticles() {
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const particle = this.explosionParticles[i];
            
            // Update position
            particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
            
            // Apply gravity to particles
            particle.userData.velocity.y -= 0.2;
            
            // Update life
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            
            // Remove dead particles
            if (particle.userData.life <= 0) {
                if (this.currentModel) {
                    this.currentModel.removeTemporaryObject(particle);
                }
                this.explosionParticles.splice(i, 1);
            }
        }
    }
    
    getCelestialBodySize(object) {
        return object.geometry.parameters.radius || 1;
    }
    
    blendColors(color1, color2) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, 0.5).getHex();
    }
    
    destroy() {
        this.currentModel = null;
        this.explosionParticles = [];
    }
}