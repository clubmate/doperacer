// AI opponent logic
class AIController {
    constructor(car, track) {
        this.car = car;
        this.track = track;
        this.targetIndex = 0;
        this.lookaheadDistance = 150;
        this.updateInterval = 5;
        this.updateCounter = 0;
        this.avoidanceAngle = 0;
        this.skill = 0.7 + Math.random() * 0.3; // AI skill varies
    }
    
    update(cars) {
        this.updateCounter++;
        
        if (this.updateCounter % this.updateInterval === 0) {
            this.updateTargetPoint();
            this.checkAvoidance(cars);
        }
        
        this.steerTowardsTarget();
        this.controlSpeed();
    }
    
    updateTargetPoint() {
        // Find current position on track
        const closest = this.track.getClosestPoint(this.car.x, this.car.y);
        
        // Look ahead on the path
        const lookahead = Math.floor(this.lookaheadDistance / 5);
        this.targetIndex = (closest.index + lookahead) % this.track.centerPath.length;
    }
    
    checkAvoidance(cars) {
        // Simple avoidance: check if another car is too close ahead
        this.avoidanceAngle = 0;
        
        for (const otherCar of cars) {
            if (otherCar === this.car) continue;
            
            const dist = Utils.vecDistance(
                { x: this.car.x, y: this.car.y },
                { x: otherCar.x, y: otherCar.y }
            );
            
            if (dist < 60) {
                // Calculate avoidance direction
                const toOther = Math.atan2(
                    otherCar.y - this.car.y,
                    otherCar.x - this.car.x
                );
                const relativeAngle = Utils.angleDifference(this.car.angle, toOther);
                
                // If car is ahead, steer away
                if (Math.abs(relativeAngle) < Math.PI / 2) {
                    this.avoidanceAngle = relativeAngle > 0 ? -0.5 : 0.5;
                }
            }
        }
    }
    
    steerTowardsTarget() {
        const target = this.track.centerPath[this.targetIndex];
        
        // Calculate angle to target
        const targetAngle = Math.atan2(
            target.y - this.car.y,
            target.x - this.car.x
        );
        
        // Calculate angle difference
        let angleDiff = Utils.angleDifference(this.car.angle, targetAngle);
        
        // Add avoidance
        angleDiff += this.avoidanceAngle;
        
        // Apply steering with AI skill factor
        const steerThreshold = 0.1 * this.skill;
        
        if (angleDiff > steerThreshold) {
            this.car.controls.right = true;
            this.car.controls.left = false;
        } else if (angleDiff < -steerThreshold) {
            this.car.controls.left = true;
            this.car.controls.right = false;
        } else {
            this.car.controls.left = false;
            this.car.controls.right = false;
        }
        
        // Use drift on sharp turns
        const turnSharpness = Math.abs(angleDiff);
        if (turnSharpness > 0.3 && this.car.speed > 4) {
            this.car.controls.drift = true;
        } else {
            this.car.controls.drift = false;
        }
    }
    
    controlSpeed() {
        const target = this.track.centerPath[this.targetIndex];
        const distToTarget = Utils.vecDistance(
            { x: this.car.x, y: this.car.y },
            target
        );
        
        // Calculate upcoming turn sharpness
        const lookAhead = 20;
        const currentAngle = this.track.getPathAngle(this.targetIndex);
        const futureIndex = (this.targetIndex + lookAhead) % this.track.centerPath.length;
        const futureAngle = this.track.getPathAngle(futureIndex);
        const turnSharpness = Math.abs(Utils.angleDifference(currentAngle, futureAngle));
        
        // Adjust speed based on upcoming turn
        const targetSpeed = this.maxSpeed * (1 - turnSharpness) * this.skill;
        
        if (this.car.speed < targetSpeed) {
            this.car.controls.forward = true;
            this.car.controls.backward = false;
        } else if (this.car.speed > targetSpeed + 1) {
            this.car.controls.forward = false;
            this.car.controls.backward = true;
        } else {
            this.car.controls.forward = true;
            this.car.controls.backward = false;
        }
    }
    
    get maxSpeed() {
        return this.car.maxSpeed * this.skill;
    }
    
    reset() {
        this.targetIndex = 0;
        this.updateCounter = 0;
        this.avoidanceAngle = 0;
    }
}
