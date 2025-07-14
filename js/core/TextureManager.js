/**
 * Texture Manager - Handles texture loading and procedural texture generation
 * Single Responsibility: Texture management and creation
 */
export class TextureManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        this.texturesLoaded = 0;
        this.totalTextures = 0;
    }
    
    async init() {
        return new Promise((resolve) => {
            this.loadTextures().then(() => {
                resolve();
            });
        });
    }
    
    async loadTextures() {
        // Define texture URLs (all null for procedural generation)
        const textureUrls = {
            sun: null,
            mercury: null,
            venus: null,
            earth: null,
            mars: null,
            jupiter: null,
            saturn: null,
            moon: null,
            io: null,
            europa: null,
            ganymede: null,
            callisto: null
        };
        
        this.totalTextures = Object.keys(textureUrls).length;
        
        // Load or create textures
        const loadPromises = Object.entries(textureUrls).map(([name, url]) => {
            return this.loadTexture(name, url);
        });
        
        await Promise.all(loadPromises);
        console.log('All textures loaded successfully');
    }
    
    async loadTexture(name, url) {
        return new Promise((resolve) => {
            if (url) {
                this.textureLoader.load(
                    url,
                    (texture) => {
                        this.configureTexture(texture);
                        this.textures[name] = texture;
                        this.texturesLoaded++;
                        console.log(`✅ Loaded texture for ${name}`);
                        resolve();
                    },
                    (progress) => {
                        // Loading progress
                    },
                    (error) => {
                        console.warn(`⚠️ Failed to load texture for ${name}, using fallback`);
                        this.textures[name] = this.createProceduralTexture(name);
                        this.texturesLoaded++;
                        resolve();
                    }
                );
            } else {
                // Use procedural texture
                this.textures[name] = this.createProceduralTexture(name);
                this.texturesLoaded++;
                console.log(`🎨 Created procedural texture for ${name}`);
                resolve();
            }
        });
    }
    
    configureTexture(texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = false;
    }
    
    createProceduralTexture(bodyName) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        const colorSchemes = {
            sun: { primary: '#FDB813', secondary: '#FF8C00', pattern: 'solar' },
            mercury: { primary: '#8C7853', secondary: '#A68B5B', pattern: 'rocky' },
            venus: { primary: '#FFC649', secondary: '#FFB347', pattern: 'cloudy' },
            earth: { primary: '#4A90E2', secondary: '#228B22', pattern: 'earth' },
            mars: { primary: '#CD5C5C', secondary: '#8B4513', pattern: 'rocky' },
            jupiter: { primary: '#D2691E', secondary: '#F4A460', pattern: 'gas' },
            saturn: { primary: '#FAD5A5', secondary: '#DEB887', pattern: 'gas' },
            moon: { primary: '#C0C0C0', secondary: '#808080', pattern: 'rocky' },
            io: { primary: '#FFFF99', secondary: '#FFA500', pattern: 'volcanic' },
            europa: { primary: '#87CEEB', secondary: '#4682B4', pattern: 'icy' },
            ganymede: { primary: '#8B7D6B', secondary: '#696969', pattern: 'rocky' },
            callisto: { primary: '#696969', secondary: '#2F4F4F', pattern: 'rocky' }
        };
        
        const scheme = colorSchemes[bodyName] || colorSchemes.mercury;
        
        // Create gradient background
        const gradient = context.createRadialGradient(512, 256, 0, 512, 256, 512);
        gradient.addColorStop(0, scheme.primary);
        gradient.addColorStop(1, scheme.secondary);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1024, 512);
        
        // Add pattern based on body type
        this.addTexturePattern(context, scheme.pattern, scheme);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.configureTexture(texture);
        return texture;
    }
    
    addTexturePattern(context, pattern, scheme) {
        context.globalAlpha = 0.3;
        
        switch (pattern) {
            case 'solar':
                this.addSolarPattern(context, scheme);
                break;
            case 'earth':
                this.addEarthPattern(context, scheme);
                break;
            case 'gas':
                this.addGasPattern(context, scheme);
                break;
            case 'rocky':
                this.addRockyPattern(context, scheme);
                break;
            case 'cloudy':
                this.addCloudyPattern(context, scheme);
                break;
            case 'volcanic':
                this.addVolcanicPattern(context, scheme);
                break;
            case 'icy':
                this.addIcyPattern(context, scheme);
                break;
        }
        
        context.globalAlpha = 1.0;
    }
    
    addSolarPattern(context, scheme) {
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 30 + 10;
            const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, 'transparent');
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    addEarthPattern(context, scheme) {
        context.fillStyle = '#228B22';
        for (let i = 0; i < 15; i++) {
            context.beginPath();
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const width = Math.random() * 100 + 50;
            const height = Math.random() * 60 + 30;
            context.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    addGasPattern(context, scheme) {
        context.strokeStyle = scheme.secondary;
        context.lineWidth = 8;
        for (let y = 0; y < 512; y += 40) {
            context.beginPath();
            context.moveTo(0, y + Math.sin(y * 0.1) * 10);
            for (let x = 0; x <= 1024; x += 10) {
                context.lineTo(x, y + Math.sin((x + y) * 0.05) * 15);
            }
            context.stroke();
        }
    }
    
    addRockyPattern(context, scheme) {
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 20 + 5;
            context.fillStyle = scheme.secondary;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = scheme.primary;
            context.beginPath();
            context.arc(x - 2, y - 2, radius * 0.8, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    addCloudyPattern(context, scheme) {
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 40 + 20;
            context.fillStyle = '#FFFFFF';
            context.globalAlpha = 0.2;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    addVolcanicPattern(context, scheme) {
        context.fillStyle = '#FF4500';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 15 + 5;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    addIcyPattern(context, scheme) {
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        for (let i = 0; i < 40; i++) {
            context.beginPath();
            const startX = Math.random() * 1024;
            const startY = Math.random() * 512;
            context.moveTo(startX, startY);
            context.lineTo(startX + (Math.random() - 0.5) * 100, startY + (Math.random() - 0.5) * 100);
            context.stroke();
        }
    }
    
    getTexture(name) {
        return this.textures[name];
    }
    
    hasTexture(name) {
        return this.textures[name] !== undefined;
    }
    
    getLoadingProgress() {
        return this.totalTextures > 0 ? (this.texturesLoaded / this.totalTextures) * 100 : 100;
    }
    
    destroy() {
        Object.values(this.textures).forEach(texture => {
            texture.dispose();
        });
        this.textures = {};
    }
}