// iOS-optimized lightning effects
class LightningEffect {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            color: options.color || '#00ffff',
            intensity: options.intensity || 0.5,
            frequency: options.frequency || 0.01,
            maxBranches: options.maxBranches || 3,
            ...options
        };
        
        // iOS-specific optimizations
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // Target 60fps
        
        // Initialize WebGL context for better performance on iOS
        this.initWebGL();
    }
    
    initWebGL() {
        if (this.isIOS) {
            // Create a smaller canvas for lightning effects
            this.effectCanvas = document.createElement('canvas');
            this.effectCanvas.width = this.canvas.width;
            this.effectCanvas.height = this.canvas.height;
            this.effectCtx = this.effectCanvas.getContext('2d');
            
            // Enable hardware acceleration
            this.effectCanvas.style.transform = 'translateZ(0)';
            this.effectCanvas.style.backfaceVisibility = 'hidden';
            this.effectCanvas.style.perspective = '1000';
        }
    }
    
    drawLightning(x, y, length, angle, branches = 0) {
        const ctx = this.isIOS ? this.effectCtx : this.ctx;
        
        // Optimize for iOS by reducing complexity
        const maxSegments = this.isIOS ? 5 : 10;
        const segmentLength = length / maxSegments;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        let currentX = x;
        let currentY = y;
        let currentAngle = angle;
        
        for (let i = 0; i < maxSegments; i++) {
            // Reduce randomness for better performance on iOS
            const angleVariation = this.isIOS ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5);
            currentAngle += angleVariation;
            
            const nextX = currentX + Math.cos(currentAngle) * segmentLength;
            const nextY = currentY + Math.sin(currentAngle) * segmentLength;
            
            ctx.lineTo(nextX, nextY);
            
            currentX = nextX;
            currentY = nextY;
            
            // Create branches with reduced frequency on iOS
            if (branches < this.options.maxBranches && 
                (this.isIOS ? Math.random() < 0.1 : Math.random() < 0.2)) {
                this.drawLightning(
                    currentX, 
                    currentY, 
                    length * 0.5, 
                    currentAngle + (Math.random() - 0.5) * Math.PI,
                    branches + 1
                );
            }
        }
        
        // Optimize stroke style for iOS
        if (this.isIOS) {
            ctx.strokeStyle = this.options.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = this.options.color;
            ctx.shadowBlur = 10;
        } else {
            const gradient = ctx.createLinearGradient(x, y, currentX, currentY);
            gradient.addColorStop(0, this.options.color);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.shadowColor = this.options.color;
            ctx.shadowBlur = 20;
        }
        
        ctx.stroke();
    }
    
    update(timestamp) {
        // Throttle updates on iOS for better performance
        if (this.isIOS && timestamp - this.lastFrameTime < this.frameInterval) {
            return;
        }
        this.lastFrameTime = timestamp;
        
        // Clear the effect canvas on iOS
        if (this.isIOS) {
            this.effectCtx.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);
        }
        
        // Draw lightning with reduced frequency on iOS
        if (Math.random() < (this.isIOS ? this.options.frequency * 0.5 : this.options.frequency)) {
            const startX = Math.random() * this.canvas.width;
            const startY = 0;
            const length = this.canvas.height * 0.8;
            const angle = Math.PI / 2;
            
            this.drawLightning(startX, startY, length, angle);
            
            // Add flash effect with reduced intensity on iOS
            if (this.isIOS) {
                this.effectCtx.fillStyle = `rgba(255, 255, 255, ${this.options.intensity * 0.5})`;
                this.effectCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${this.options.intensity})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        
        // On iOS, composite the effect canvas onto the main canvas
        if (this.isIOS) {
            this.ctx.drawImage(this.effectCanvas, 0, 0);
        }
    }
}

// Export the LightningEffect class
window.LightningEffect = LightningEffect; 