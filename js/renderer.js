// Rendering engine with pixel-art style
class Renderer {
    constructor(canvas, minimapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // Colors
        this.colors = {
            track: '#2d4a3e',
            trackLines: '#3a5f4e',
            grass: '#1a3a2a',
            startLine: '#ffffff',
            checkpoint: '#ffff0033',
            innerWall: '#8b4513',
            outerWall: '#654321'
        };
        
        // Disable image smoothing for pixel-art look
        this.ctx.imageSmoothingEnabled = false;
        this.minimapCtx.imageSmoothingEnabled = false;
    }
    
    render(track, cars, player) {
        // Clear canvas
        this.ctx.fillStyle = this.colors.grass;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update camera to follow player
        this.updateCamera(player);
        
        // Save context state
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw track
        this.drawTrack(track);
        
        // Draw checkpoints (for debugging, can be removed)
        // this.drawCheckpoints(track);
        
        // Draw start line
        this.drawStartLine(track);
        
        // Draw cars (sort by y position for proper layering)
        const sortedCars = [...cars].sort((a, b) => a.y - b.y);
        for (const car of sortedCars) {
            this.drawCar(car);
        }
        
        // Restore context
        this.ctx.restore();
        
        // Draw minimap
        this.drawMinimap(track, cars, player);
    }
    
    updateCamera(player) {
        // Smooth camera follow
        const targetX = player.x;
        const targetY = player.y;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }
    
    drawTrack(track) {
        // Draw outer boundary (grass area)
        this.ctx.fillStyle = this.colors.grass;
        this.ctx.beginPath();
        for (let i = 0; i < track.outerBoundary.length; i++) {
            const point = track.outerBoundary[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw track surface
        this.ctx.fillStyle = this.colors.track;
        this.ctx.beginPath();
        for (let i = 0; i < track.outerBoundary.length; i++) {
            const point = track.outerBoundary[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Cut out inner boundary
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        for (let i = 0; i < track.innerBoundary.length; i++) {
            const point = track.innerBoundary[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Draw track center line (dashed)
        this.ctx.strokeStyle = this.colors.trackLines;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        for (let i = 0; i < track.centerPath.length; i++) {
            const point = track.centerPath[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw walls
        this.ctx.strokeStyle = this.colors.innerWall;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        for (let i = 0; i < track.innerBoundary.length; i++) {
            const point = track.innerBoundary[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.strokeStyle = this.colors.outerWall;
        this.ctx.beginPath();
        for (let i = 0; i < track.outerBoundary.length; i++) {
            const point = track.outerBoundary[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawStartLine(track) {
        if (!track.startLine) return;
        
        const checkpoint = track.checkpoints[0];
        this.ctx.strokeStyle = this.colors.startLine;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(checkpoint.p1.x, checkpoint.p1.y);
        this.ctx.lineTo(checkpoint.p2.x, checkpoint.p2.y);
        this.ctx.stroke();
        
        // Draw checkered pattern
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;
            
            if (i % 2 === 0) {
                this.ctx.strokeStyle = '#000000';
            } else {
                this.ctx.strokeStyle = '#ffffff';
            }
            
            this.ctx.lineWidth = 6;
            this.ctx.beginPath();
            this.ctx.moveTo(
                checkpoint.p1.x + (checkpoint.p2.x - checkpoint.p1.x) * t1,
                checkpoint.p1.y + (checkpoint.p2.y - checkpoint.p1.y) * t1
            );
            this.ctx.lineTo(
                checkpoint.p1.x + (checkpoint.p2.x - checkpoint.p1.x) * t2,
                checkpoint.p1.y + (checkpoint.p2.y - checkpoint.p1.y) * t2
            );
            this.ctx.stroke();
        }
    }
    
    drawCheckpoints(track) {
        for (const checkpoint of track.checkpoints) {
            this.ctx.strokeStyle = this.colors.checkpoint;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(checkpoint.p1.x, checkpoint.p1.y);
            this.ctx.lineTo(checkpoint.p2.x, checkpoint.p2.y);
            this.ctx.stroke();
        }
    }
    
    drawCar(car) {
        this.ctx.save();
        this.ctx.translate(car.x, car.y);
        this.ctx.rotate(car.angle);
        
        // Draw car body (pixel-art style)
        this.ctx.fillStyle = car.color;
        this.ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
        
        // Draw car details
        this.ctx.fillStyle = '#000000';
        // Windshield
        this.ctx.fillRect(-car.width / 2 + 2, -car.height / 2 + 4, car.width - 4, 6);
        
        // Wheels
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(-car.width / 2 - 2, -car.height / 2 + 4, 2, 6);
        this.ctx.fillRect(car.width / 2, -car.height / 2 + 4, 2, 6);
        this.ctx.fillRect(-car.width / 2 - 2, car.height / 2 - 10, 2, 6);
        this.ctx.fillRect(car.width / 2, car.height / 2 - 10, 2, 6);
        
        // Headlights
        if (car.speed > 0) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillRect(-car.width / 2 + 2, -car.height / 2, 4, 2);
            this.ctx.fillRect(car.width / 2 - 6, -car.height / 2, 4, 2);
        }
        
        // Drift effect
        if (car.isDrifting) {
            this.ctx.strokeStyle = '#88888844';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, car.height / 2);
            this.ctx.lineTo(0, car.height / 2 + 10);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        // Draw player indicator
        if (car.isPlayer) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(car.x, car.y - car.height, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawMinimap(track, cars, player) {
        const ctx = this.minimapCtx;
        const width = this.minimapCanvas.width;
        const height = this.minimapCanvas.height;
        
        // Clear minimap
        ctx.fillStyle = 'rgba(15, 52, 96, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate scale to fit track
        const trackBounds = this.getTrackBounds(track);
        const scaleX = (width - 20) / (trackBounds.maxX - trackBounds.minX);
        const scaleY = (height - 20) / (trackBounds.maxY - trackBounds.minY);
        const scale = Math.min(scaleX, scaleY);
        
        const offsetX = width / 2 - (trackBounds.minX + trackBounds.maxX) / 2 * scale;
        const offsetY = height / 2 - (trackBounds.minY + trackBounds.maxY) / 2 * scale;
        
        // Draw track
        ctx.strokeStyle = this.colors.track;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < track.centerPath.length; i++) {
            const point = track.centerPath[i];
            const x = point.x * scale + offsetX;
            const y = point.y * scale + offsetY;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw cars
        for (const car of cars) {
            const x = car.x * scale + offsetX;
            const y = car.y * scale + offsetY;
            
            ctx.fillStyle = car.isPlayer ? '#00ff00' : car.color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    getTrackBounds(track) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const point of track.outerBoundary) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        
        return { minX, minY, maxX, maxY };
    }
}
