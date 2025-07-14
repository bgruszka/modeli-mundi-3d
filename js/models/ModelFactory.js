/**
 * Model Factory - Creates different universe models using Factory Pattern
 * Single Responsibility: Model instantiation and configuration
 * Open/Closed Principle: New models can be added without modifying existing code
 */
import { AristotleModel } from './AristotleModel.js';
import { PtolemaicModel } from './PtolemaicModel.js';
import { CopernicanModel } from './CopernicanModel.js';
import { GalileanModel } from './GalileanModel.js';
import { KeplerModel } from './KeplerModel.js';
import { NewtonianModel } from './NewtonianModel.js';
import { EinsteinStaticModel } from './EinsteinStaticModel.js';

export class ModelFactory {
    constructor() {
        // Model registry - makes it easy to add new models
        this.modelRegistry = {
            aristotle: AristotleModel,
            ptolemaic: PtolemaicModel,
            copernican: CopernicanModel,
            galilean: GalileanModel,
            kepler: KeplerModel,
            newtonian: NewtonianModel,
            einstein: EinsteinStaticModel
        };
    }
    
    /**
     * Create a model instance by name
     * @param {string} modelName - Name of the model to create
     * @param {THREE.Scene} scene - Three.js scene
     * @param {TextureManager} textureManager - Texture manager instance
     * @returns {BaseModel} Model instance
     */
    async createModel(modelName, scene, textureManager) {
        const ModelClass = this.modelRegistry[modelName];
        
        if (!ModelClass) {
            throw new Error(`Unknown model type: ${modelName}`);
        }
        
        try {
            // Create model instance
            const model = new ModelClass(modelName, scene, textureManager);
            
            // Initialize the model
            await model.create();
            
            console.log(`✅ Created ${modelName} model`);
            return model;
            
        } catch (error) {
            console.error(`❌ Failed to create ${modelName} model:`, error);
            throw error;
        }
    }
    
    /**
     * Register a new model type
     * @param {string} name - Model name
     * @param {Class} ModelClass - Model class
     */
    registerModel(name, ModelClass) {
        this.modelRegistry[name] = ModelClass;
        console.log(`📋 Registered new model: ${name}`);
    }
    
    /**
     * Get all available model names
     * @returns {string[]} Array of model names
     */
    getAvailableModels() {
        return Object.keys(this.modelRegistry);
    }
    
    /**
     * Check if a model is available
     * @param {string} modelName - Model name to check
     * @returns {boolean} True if model is available
     */
    hasModel(modelName) {
        return this.modelRegistry.hasOwnProperty(modelName);
    }
}