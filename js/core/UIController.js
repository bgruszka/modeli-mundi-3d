/**
 * UI Controller - Handles all user interface interactions and controls
 * Single Responsibility: User interface management and event handling
 */
export class UIController {
    constructor() {
        this.activeModel = null;
        this.isMobile = this.detectMobile();
        
        // Callback functions (will be set by main controller)
        this.onModelChange = null;
        this.onSettingsChange = null;
        this.onPhysicsToggle = null;
        this.onAnimationToggle = null;
        this.onSpeedChange = null;
        this.onVisualToggle = null;
        
        // Settings state
        this.settings = {
            lighting: {
                ambient: 0.15,
                sun: 2.5,
                rim: 0.2
            },
            animation: {
                enabled: true,
                speed: 1.0
            },
            visual: {
                orbits: true,
                wireframes: true,
                stars: true
            },
            physics: {
                gravity: true
            }
        };
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileInterface();
        this.setupCollapsiblePanels();
        this.updateButtonStates();
        
        if (this.isMobile) {
            this.checkMobileAndCollapsePanels();
        }
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768 || 
               ('ontouchstart' in window);
    }
    
    setupEventListeners() {
        // Model selection buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modelName = e.target.dataset.model;
                this.handleModelChange(modelName);
            });
        });
        
        // Lighting controls
        this.setupLightingControls();
        
        // Animation controls
        this.setupAnimationControls();
        
        // Visual element controls
        this.setupVisualControls();
        
        // Physics controls
        this.setupPhysicsControls();
        
        // Preset buttons
        this.setupPresetButtons();
    }
    
    setupLightingControls() {
        const ambientSlider = document.getElementById('ambient-slider');
        const ambientValue = document.getElementById('ambient-value');
        
        if (ambientSlider) {
            ambientSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) / 100;
                this.settings.lighting.ambient = value;
                ambientValue.textContent = `${Math.round(value * 100)}%`;
                this.notifySettingsChange();
            });
        }
        
        const sunSlider = document.getElementById('sun-slider');
        const sunValue = document.getElementById('sun-value');
        
        if (sunSlider) {
            sunSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) / 100;
                this.settings.lighting.sun = value;
                sunValue.textContent = `${Math.round(value * 100)}%`;
                this.notifySettingsChange();
            });
        }
        
        const rimSlider = document.getElementById('rim-slider');
        const rimValue = document.getElementById('rim-value');
        
        if (rimSlider) {
            rimSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) / 100;
                this.settings.lighting.rim = value;
                rimValue.textContent = `${Math.round(value * 100)}%`;
                this.notifySettingsChange();
            });
        }
    }
    
    setupAnimationControls() {
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) / 100;
                this.settings.animation.speed = value;
                speedValue.textContent = `${Math.round(value * 100)}%`;
                this.notifySpeedChange(value);
            });
        }
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.settings.animation.enabled = !this.settings.animation.enabled;
                pauseBtn.textContent = this.settings.animation.enabled ? '⏸️ Pause' : '▶️ Play';
                pauseBtn.classList.toggle('active', !this.settings.animation.enabled);
                this.notifyAnimationToggle(this.settings.animation.enabled);
            });
        }
        
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAllSettings();
            });
        }
    }
    
    setupVisualControls() {
        const orbitsBtn = document.getElementById('orbits-btn');
        if (orbitsBtn) {
            orbitsBtn.addEventListener('click', () => {
                this.settings.visual.orbits = !this.settings.visual.orbits;
                orbitsBtn.classList.toggle('active', !this.settings.visual.orbits);
                this.notifyVisualToggle('orbits', this.settings.visual.orbits);
                this.showFeedback(`Orbits ${this.settings.visual.orbits ? 'shown' : 'hidden'}`);
            });
        }
        
        const wireframesBtn = document.getElementById('wireframes-btn');
        if (wireframesBtn) {
            wireframesBtn.addEventListener('click', () => {
                this.settings.visual.wireframes = !this.settings.visual.wireframes;
                wireframesBtn.classList.toggle('active', !this.settings.visual.wireframes);
                this.notifyVisualToggle('wireframes', this.settings.visual.wireframes);
                this.showFeedback(`Geometry ${this.settings.visual.wireframes ? 'shown' : 'hidden'}`);
            });
        }
        
        const starsBtn = document.getElementById('stars-btn');
        if (starsBtn) {
            starsBtn.addEventListener('click', () => {
                this.settings.visual.stars = !this.settings.visual.stars;
                starsBtn.classList.toggle('active', !this.settings.visual.stars);
                this.notifyVisualToggle('stars', this.settings.visual.stars);
                this.showFeedback(`Stars ${this.settings.visual.stars ? 'shown' : 'hidden'}`);
            });
        }
    }
    
    setupPhysicsControls() {
        const gravityBtn = document.getElementById('gravity-btn');
        if (gravityBtn) {
            gravityBtn.addEventListener('click', () => {
                this.settings.physics.gravity = !this.settings.physics.gravity;
                gravityBtn.classList.toggle('active', this.settings.physics.gravity);
                gravityBtn.textContent = this.settings.physics.gravity ? '🌍 Gravity' : '🚀 No Gravity';
                this.notifyPhysicsToggle(this.settings.physics.gravity);
                this.showFeedback(
                    this.settings.physics.gravity ? 
                    '🌍 Gravity enabled - Planets follow elliptical orbits' : 
                    '🚀 Gravity disabled - Planets move in straight lines'
                );
            });
        }
    }
    
    setupPresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                const speed = e.target.dataset.speed;
                
                if (preset) {
                    this.applyLightingPreset(preset);
                    this.showFeedback(`${this.getPresetName(preset)} lighting applied`);
                }
                
                if (speed !== undefined) {
                    this.applySpeedPreset(parseInt(speed));
                    this.showFeedback(`Speed set to ${speed}%`);
                }
            });
        });
    }
    
    setupMobileInterface() {
        if (this.isMobile) {
            // Remove title attributes to prevent browser tooltips
            document.querySelectorAll('[title]').forEach(element => {
                element.removeAttribute('title');
            });
            
            this.addMobileHelpButton();
        }
    }
    
    addMobileHelpButton() {
        const controlsInfo = document.getElementById('controls-info');
        if (controlsInfo) {
            const helpBtn = document.createElement('button');
            helpBtn.innerHTML = '❓';
            helpBtn.className = 'help-btn';
            helpBtn.style.cssText = `
                position: absolute;
                top: -15px;
                right: -15px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 24px;
                box-shadow: 0 3px 12px rgba(0,0,0,0.4);
                cursor: pointer;
                z-index: 1600;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            `;
            
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMobileHelp();
            });
            
            controlsInfo.appendChild(helpBtn);
        }
    }
    
    showMobileHelp() {
        let helpOverlay = document.getElementById('mobile-help-overlay');
        
        if (!helpOverlay) {
            helpOverlay = document.createElement('div');
            helpOverlay.id = 'mobile-help-overlay';
            helpOverlay.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
                backdrop-filter: blur(20px);
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px 20px 0 0;
                padding: 20px;
                z-index: 2500;
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                max-height: 70vh;
                overflow-y: auto;
                box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
            `;
            
            helpOverlay.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #ffd700; margin: 0; font-size: 1.1em;">📱 Controls & Help</h3>
                    <button id="close-help" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 20px; padding: 5px 12px; font-size: 0.9em; cursor: pointer;">Close</button>
                </div>
                
                <div style="color: #cccccc; font-size: 0.9em; line-height: 1.4;">
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">🌌 Navigation:</strong><br>
                        • Drag to rotate view around models<br>
                        • Pinch to zoom in/out<br>
                        • Two-finger pan to move view
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">🎛️ Panel Controls:</strong><br>
                        • 🌌 Universe Models - Select historical cosmic models<br>
                        • ✨ Scene Controls - Adjust lighting, speed, visibility
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">💡 Lighting Presets:</strong><br>
                        • ☀️ Bright - High visibility for study<br>
                        • 🌙 Dark - Dramatic cosmic atmosphere<br>
                        • 🌍 Realistic - Natural space lighting<br>
                        • 🎭 Dramatic - High contrast shadows
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #87ceeb;">⚡ Speed Presets:</strong><br>
                        • 🐌 Slow (25%) - Study complex motions<br>
                        • ⚡ Normal (100%) - Standard speed<br>
                        • 🚀 Fast (200%) - Quick pattern viewing<br>
                        • 🚀💨 Ultra (500%) - Very fast motion
                    </div>
                    
                    <div>
                        <strong style="color: #87ceeb;">👁️ Visual Elements:</strong><br>
                        • 🛸 Orbits - Show/hide orbital paths<br>
                        • 📐 Geometry - Show/hide wireframes<br>
                        • ⭐ Stars - Toggle background stars
                    </div>
                </div>
            `;
            
            document.body.appendChild(helpOverlay);
            
            document.getElementById('close-help').addEventListener('click', () => {
                this.hideMobileHelp();
            });
            
            helpOverlay.addEventListener('click', (e) => {
                if (e.target === helpOverlay) {
                    this.hideMobileHelp();
                }
            });
        }
        
        setTimeout(() => {
            helpOverlay.style.transform = 'translateY(0)';
        }, 10);
    }
    
    hideMobileHelp() {
        const helpOverlay = document.getElementById('mobile-help-overlay');
        if (helpOverlay) {
            helpOverlay.style.transform = 'translateY(100%)';
        }
    }
    
    setupCollapsiblePanels() {
        const toggleUiBtn = document.getElementById('toggle-ui-panel');
        const uiContent = document.getElementById('ui-content');
        const uiPanel = document.getElementById('ui-panel');
        
        if (toggleUiBtn && uiContent) {
            toggleUiBtn.addEventListener('click', () => {
                const isCollapsed = uiContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    uiContent.classList.remove('collapsed');
                    uiPanel.classList.remove('collapsed');
                    toggleUiBtn.classList.remove('active');
                    toggleUiBtn.textContent = '📋';
                } else {
                    uiContent.classList.add('collapsed');
                    uiPanel.classList.add('collapsed');
                    toggleUiBtn.classList.add('active');
                    toggleUiBtn.textContent = '🌌';
                }
            });
        }
        
        const toggleControlsBtn = document.getElementById('toggle-controls-panel');
        const controlsContent = document.getElementById('controls-content');
        const controlsPanel = document.getElementById('lighting-controls');
        
        if (toggleControlsBtn && controlsContent) {
            toggleControlsBtn.addEventListener('click', () => {
                const isCollapsed = controlsContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    controlsContent.classList.remove('collapsed');
                    controlsPanel.classList.remove('collapsed');
                    toggleControlsBtn.classList.remove('active');
                    toggleControlsBtn.textContent = '🎛️';
                } else {
                    controlsContent.classList.add('collapsed');
                    controlsPanel.classList.add('collapsed');
                    toggleControlsBtn.classList.add('active');
                    toggleControlsBtn.textContent = '✨';
                }
            });
        }
    }
    
    checkMobileAndCollapsePanels() {
        if (this.isMobile) {
            // Auto-collapse panels for mobile
            const uiContent = document.getElementById('ui-content');
            const uiPanel = document.getElementById('ui-panel');
            const toggleUiBtn = document.getElementById('toggle-ui-panel');
            
            if (uiContent && uiPanel && toggleUiBtn) {
                uiContent.classList.add('collapsed');
                uiPanel.classList.add('collapsed');
                toggleUiBtn.classList.add('active');
                toggleUiBtn.textContent = '🌌';
            }
            
            const controlsContent = document.getElementById('controls-content');
            const controlsPanel = document.getElementById('lighting-controls');
            const toggleControlsBtn = document.getElementById('toggle-controls-panel');
            
            if (controlsContent && controlsPanel && toggleControlsBtn) {
                controlsContent.classList.add('collapsed');
                controlsPanel.classList.add('collapsed');
                toggleControlsBtn.classList.add('active');
                toggleControlsBtn.textContent = '✨';
            }
        }
    }
    
    // Public methods for external control
    setActiveModel(modelName) {
        this.activeModel = modelName;
        
        // Update UI buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-model="${modelName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Show/hide gravity button for Newtonian model
        const gravityBtn = document.getElementById('gravity-btn');
        if (gravityBtn) {
            if (modelName === 'newtonian') {
                gravityBtn.style.display = 'inline-block';
            } else {
                gravityBtn.style.display = 'none';
            }
        }
        
        // Show mobile feedback
        if (this.isMobile) {
            const modelNames = {
                aristotle: "Aristotle's Model",
                ptolemaic: "Ptolemaic Model", 
                copernican: "Copernican Model",
                galilean: "Galilean Model",
                kepler: "Kepler's Model",
                newtonian: "Newtonian Model"
            };
            this.showFeedback(`${modelNames[modelName]} loaded`);
        }
    }
    
    updateModelInfo(info) {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <h4>${info.title}</h4>
                <p>${info.description}</p>
            `;
        }
    }
    
    // Event notification methods
    handleModelChange(modelName) {
        if (this.onModelChange) {
            this.onModelChange(modelName);
        }
    }
    
    notifySettingsChange() {
        if (this.onSettingsChange) {
            this.onSettingsChange(this.settings);
        }
    }
    
    notifyPhysicsToggle(enabled) {
        if (this.onPhysicsToggle) {
            this.onPhysicsToggle(enabled);
        }
    }
    
    notifyAnimationToggle(enabled) {
        if (this.onAnimationToggle) {
            this.onAnimationToggle(enabled);
        }
    }
    
    notifySpeedChange(speed) {
        if (this.onSpeedChange) {
            this.onSpeedChange(speed);
        }
    }
    
    notifyVisualToggle(type, enabled) {
        if (this.onVisualToggle) {
            this.onVisualToggle(type, enabled);
        }
    }
    
    // Utility methods
    applyLightingPreset(preset) {
        const presets = {
            bright: { ambient: 0.6, sun: 3.0, rim: 0.4 },
            dark: { ambient: 0.05, sun: 1.5, rim: 0.05 },
            realistic: { ambient: 0.15, sun: 2.5, rim: 0.2 },
            dramatic: { ambient: 0.05, sun: 4.0, rim: 0.5 }
        };
        
        const settings = presets[preset];
        if (settings) {
            this.settings.lighting = { ...settings };
            this.updateLightingUI();
            this.notifySettingsChange();
        }
    }
    
    applySpeedPreset(speedPercent) {
        const speed = speedPercent / 100;
        this.settings.animation.speed = speed;
        this.updateSpeedUI();
        this.notifySpeedChange(speed);
    }
    
    resetAllSettings() {
        this.settings.lighting = { ambient: 0.15, sun: 2.5, rim: 0.2 };
        this.settings.animation.speed = 1.0;
        
        this.updateLightingUI();
        this.updateSpeedUI();
        this.notifySettingsChange();
        this.notifySpeedChange(1.0);
    }
    
    updateLightingUI() {
        const { ambient, sun, rim } = this.settings.lighting;
        
        const ambientSlider = document.getElementById('ambient-slider');
        const ambientValue = document.getElementById('ambient-value');
        if (ambientSlider) {
            ambientSlider.value = Math.round(ambient * 100);
            ambientValue.textContent = `${Math.round(ambient * 100)}%`;
        }
        
        const sunSlider = document.getElementById('sun-slider');
        const sunValue = document.getElementById('sun-value');
        if (sunSlider) {
            sunSlider.value = Math.round(sun * 100);
            sunValue.textContent = `${Math.round(sun * 100)}%`;
        }
        
        const rimSlider = document.getElementById('rim-slider');
        const rimValue = document.getElementById('rim-value');
        if (rimSlider) {
            rimSlider.value = Math.round(rim * 100);
            rimValue.textContent = `${Math.round(rim * 100)}%`;
        }
    }
    
    updateSpeedUI() {
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        if (speedSlider) {
            speedSlider.value = Math.round(this.settings.animation.speed * 100);
            speedValue.textContent = `${Math.round(this.settings.animation.speed * 100)}%`;
        }
    }
    
    updateButtonStates() {
        const orbitsBtn = document.getElementById('orbits-btn');
        const wireframesBtn = document.getElementById('wireframes-btn');
        const starsBtn = document.getElementById('stars-btn');
        
        if (orbitsBtn) {
            orbitsBtn.classList.toggle('active', !this.settings.visual.orbits);
        }
        
        if (wireframesBtn) {
            wireframesBtn.classList.toggle('active', !this.settings.visual.wireframes);
        }
        
        if (starsBtn) {
            starsBtn.classList.toggle('active', !this.settings.visual.stars);
        }
    }
    
    getPresetName(preset) {
        const names = {
            bright: 'Bright',
            dark: 'Dark',
            realistic: 'Realistic',
            dramatic: 'Dramatic'
        };
        return names[preset] || preset;
    }
    
    showFeedback(message, duration = 2000) {
        if (!this.isMobile) return;
        
        const existingToast = document.getElementById('toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9em;
            z-index: 3000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
    
    destroy() {
        // Clean up event listeners and UI elements
        const helpOverlay = document.getElementById('mobile-help-overlay');
        if (helpOverlay) {
            helpOverlay.remove();
        }
        
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.remove();
        }
    }
}