/**
 * Animation System - Handles all celestial body animations and orbital mechanics
 * Single Responsibility: Animation and movement calculations
 */
export class AnimationSystem {
    constructor() {
        this.enabled = true;
        this.speed = 1.0;
        this.currentModel = null;
    }
    
    init() {
        // Initialize animation system
        console.log('Animation system initialized');
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }
    
    getSpeed() {
        return this.speed;
    }
    
    setModel(model) {
        this.currentModel = model;
    }
    
    update(time) {
        if (!this.enabled || !this.currentModel) return;
        
        // Update all celestial bodies in the current model
        this.currentModel.updateAnimations(time, this.speed);
    }
    
    destroy() {
        this.currentModel = null;
    }
}