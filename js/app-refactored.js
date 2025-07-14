/**
 * Historical Models of the Universe - 3D Explorer (Refactored)
 * Main entry point using the new SOLID-compliant architecture
 */
import { UniverseExplorer } from './core/UniverseExplorer.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Universe Explorer (Refactored Architecture)');
    
    try {
        window.universeExplorer = new UniverseExplorer();
        console.log('✅ Universe Explorer initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Universe Explorer:', error);
        
        // Show error message to user
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    color: white;
                    text-align: center;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                ">
                    <h2 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Application Error</h2>
                    <p style="max-width: 600px; line-height: 1.6;">
                        Failed to initialize the Universe Explorer. This may be due to:
                    </p>
                    <ul style="text-align: left; margin: 20px 0; line-height: 1.8;">
                        <li>Browser compatibility issues (try a modern browser)</li>
                        <li>WebGL not supported or disabled</li>
                        <li>Network connectivity problems</li>
                        <li>Missing required files</li>
                    </ul>
                    <p style="color: #87ceeb;">
                        Please refresh the page or check the browser console for more details.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        margin-top: 20px;
                        font-size: 16px;
                    ">🔄 Reload Page</button>
                </div>
            `;
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.universeExplorer) {
        console.log('🧹 Cleaning up Universe Explorer');
        window.universeExplorer.destroy();
    }
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('❌ Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

// Export for debugging purposes
export { UniverseExplorer };