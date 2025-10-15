// Car physics and controls
class Car {
    constructor(x, y, angle, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 0;
        this.color = color;
        this.isPlayer = isPlayer;
        
        // Physics properties
        this.acceleration = 0.5;
        this.braking = 0.8;
        this.friction = 0.96;
        this.turnSpeed = 0.04;
        this.maxSpeed = 8;
        this.maxReverseSpeed = 3;
        this.driftFactor = 0.92;
        
        // Dimensions
        this.width = 16;
        this.height = 24;
        
        // State
        this.isDrifting = false;
        this.currentLap = 0;
        this.lastCheckpoint = -1;
        this.checkpointsPassed = 0;
        this.raceFinished = false;
        this.finishTime = 0;
        
        // Controls
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            drift: false
        };
    }
    
    update(track) {
        // Apply acceleration
        if (this.controls.forward) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (this.controls.backward) {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.braking);
            } else {
                this.speed = Math.max(this.speed - this.acceleration, -this.maxReverseSpeed);
            }
        }
        
        // Apply friction
        this.speed *= this.friction;
        
        // Steering (only works when moving)
        if (Math.abs(this.speed) > 0.1) {
            const turnAmount = this.turnSpeed * (this.speed / this.maxSpeed);
            
            if (this.controls.left) {
                this.angle -= turnAmount;
            }
            if (this.controls.right) {
                this.angle += turnAmount;
            }
        }
        
        // Apply drift
        if (this.controls.drift && Math.abs(this.speed) > 2) {
            this.isDrifting = true;
            this.speed *= this.driftFactor;
        } else {
            this.isDrifting = false;
        }
        
        // Move car
        const oldX = this.x;
        const oldY = this.y;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        // Check collision with track boundaries
        if (!track.isOnTrack(this.x, this.y)) {
            // Bounce back
            this.x = oldX;
            this.y = oldY;
            this.speed *= -0.5;
        }
        
        // Check checkpoint crossings
        this.checkCheckpoints(track);
    }
    
    checkCheckpoints(track) {
        if (this.raceFinished) return;
        
        const carPos = { x: this.x, y: this.y };
        const carPrev = {
            x: this.x - Math.cos(this.angle) * this.speed,
            y: this.y - Math.sin(this.angle) * this.speed
        };
        
        for (const checkpoint of track.checkpoints) {
            const intersection = Utils.lineIntersection(
                carPrev, carPos,
                checkpoint.p1, checkpoint.p2
            );
            
            if (intersection) {
                // Check if this is the next expected checkpoint
                const expectedCheckpoint = (this.lastCheckpoint + 1) % track.checkpoints.length;
                
                if (checkpoint.index === expectedCheckpoint) {
                    this.lastCheckpoint = checkpoint.index;
                    this.checkpointsPassed++;
                    
                    // Check if we crossed the start line (checkpoint 0)
                    if (checkpoint.index === 0 && this.checkpointsPassed > 1) {
                        this.currentLap++;
                    }
                }
            }
        }
    }
    
    getCorners() {
        const corners = [];
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const offsets = [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: -halfHeight },
            { x: halfWidth, y: halfHeight },
            { x: -halfWidth, y: halfHeight }
        ];
        
        for (const offset of offsets) {
            const rotated = Utils.vecRotate(offset, this.angle);
            corners.push({
                x: this.x + rotated.x,
                y: this.y + rotated.y
            });
        }
        
        return corners;
    }
    
    getSpeed() {
        return Math.abs(this.speed);
    }
    
    getSpeedKmh() {
        return Math.round(this.getSpeed() * 20);
    }
    
    reset(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 0;
        this.currentLap = 0;
        this.lastCheckpoint = -1;
        this.checkpointsPassed = 0;
        this.raceFinished = false;
        this.finishTime = 0;
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            drift: false
        };
    }
}
