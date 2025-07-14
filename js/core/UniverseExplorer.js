/**
 * Main Universe Explorer Application Controller
 * Orchestrates all components following SOLID principles
 */
import { SceneRenderer } from './SceneRenderer.js';
import { UIController } from './UIController.js';
import { AnimationSystem } from './AnimationSystem.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { ModelFactory } from '../models/ModelFactory.js';
import { TextureManager } from './TextureManager.js';

export class UniverseExplorer {
    constructor() {
        this.currentModel = 'aristotle';
        this.time = 0;
        this.animationFrame = null;
        
        // Initialize all components
        this.textureManager = new TextureManager();
        this.renderer = new SceneRenderer();
        this.uiController = new UIController();
        this.animationSystem = new AnimationSystem();
        this.physicsEngine = new PhysicsEngine();
        this.modelFactory = new ModelFactory();
        
        // Model info for UI
        this.modelInfo = {
            aristotle: {
                title: "Aristotle's Geocentric Model",
                description: "The earliest systematic model where Earth sits at the center of the universe, surrounded by concentric crystalline spheres carrying the celestial bodies. The outermost sphere contains the fixed stars."
            },
            ptolemaic: {
                title: "Ptolemaic Model with Epicycles",
                description: "Refined geocentric model using epicycles (small circles) to explain the complex motions of planets, particularly retrograde motion. This model dominated for over 1,000 years."
            },
            copernican: {
                title: "Copernican Heliocentric Model",
                description: "Revolutionary model placing the Sun at the center with planets orbiting in circular paths. This challenged the Earth-centered worldview and laid the foundation for modern astronomy."
            },
            galilean: {
                title: "Galilean Model with Moons",
                description: "Enhanced heliocentric model incorporating Galileo's telescopic discoveries, including Jupiter's four largest moons, which provided strong evidence against the geocentric model."
            },
            kepler: {
                title: "Kepler's Elliptical Orbits",
                description: "Refined heliocentric model with elliptical rather than circular orbits, based on careful observations of Mars. This model accurately predicted planetary positions."
            },
            newtonian: {
                title: "Newtonian Gravitational Model",
                description: "Advanced heliocentric model incorporating Newton's law of universal gravitation with comprehensive physics simulation and interactive features."
            },
            einstein: {
                title: "Einstein's Static Universe Model",
                description: "Einstein's original 1917 cosmological model featuring a finite, static universe with uniform matter distribution and cosmological constant. This model represents a closed, spherical universe that neither expands nor contracts."
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize texture manager first
            await this.textureManager.init();
            
            // Initialize renderer
            this.renderer.init();
            
            // Initialize UI controller
            this.uiController.init();
            
            // Initialize animation system
            this.animationSystem.init();
            
            // Initialize physics engine
            this.physicsEngine.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial model
            await this.loadModel(this.currentModel);
            
            // Start animation loop
            this.animate();
            
            // Hide loading screen
            document.getElementById('loading').style.display = 'none';
            
        } catch (error) {
            console.error('Failed to initialize Universe Explorer:', error);
        }
    }
    
    setupEventListeners() {
        // Model switching
        this.uiController.onModelChange = (modelName) => {
            this.switchModel(modelName);
        };
        
        // UI controls
        this.uiController.onSettingsChange = (settings) => {
            this.handleSettingsChange(settings);
        };
        
        // Physics controls
        this.uiController.onPhysicsToggle = (enabled) => {
            this.physicsEngine.setGravityEnabled(enabled);
        };
        
        // Animation controls
        this.uiController.onAnimationToggle = (enabled) => {
            this.animationSystem.setEnabled(enabled);
        };
        
        this.uiController.onSpeedChange = (speed) => {
            this.animationSystem.setSpeed(speed);
        };
        
        // Visual element toggles
        this.uiController.onVisualToggle = (type, enabled) => {
            this.renderer.setVisualElementVisible(type, enabled);
        };
        
        // Window resize
        window.addEventListener('resize', () => {
            this.renderer.handleResize();
        });
    }
    
    async switchModel(modelName) {
        try {
            // Clear current model
            this.renderer.clearScene();
            
            // Create new model
            const model = await this.modelFactory.createModel(
                modelName, 
                this.renderer.getScene(), 
                this.textureManager
            );
            
            // Set model in renderer
            this.renderer.setModel(model);
            
            // Update animation system
            this.animationSystem.setModel(model);
            
            // Update physics engine
            this.physicsEngine.setModel(model);
            
            // Update UI
            this.uiController.setActiveModel(modelName);
            this.uiController.updateModelInfo(this.modelInfo[modelName]);
            
            this.currentModel = modelName;
            
        } catch (error) {
            console.error(`Failed to switch to model ${modelName}:`, error);
        }
    }
    
    async loadModel(modelName) {
        await this.switchModel(modelName);
    }
    
    handleSettingsChange(settings) {
        if (settings.lighting) {
            this.renderer.updateLighting(settings.lighting);
        }
        
        if (settings.visual) {
            this.renderer.updateVisualSettings(settings.visual);
        }
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        
        // Update time
        this.time += 0.01 * this.animationSystem.getSpeed();
        
        // Update animation system
        this.animationSystem.update(this.time);
        
        // Update physics
        this.physicsEngine.update(this.time);
        
        // Update renderer
        this.renderer.update();
        
        // Render frame
        this.renderer.render();
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.renderer.destroy();
        this.uiController.destroy();
        this.animationSystem.destroy();
        this.physicsEngine.destroy();
        this.textureManager.destroy();
    }
}