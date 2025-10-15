// Procedural track generation
class Track {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.centerPath = [];
        this.innerBoundary = [];
        this.outerBoundary = [];
        this.trackWidth = 120;
        this.checkpoints = [];
        this.startLine = null;
        
        this.generate();
    }
    
    generate() {
        // Generate center path using Catmull-Rom splines
        const numPoints = 16;
        const radius = 400;
        const centerX = 640;
        const centerY = 360;
        
        // Create control points for a varied track
        const controlPoints = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const variation = Math.sin(angle * 3 + this.seed * 10) * 0.3 + 1;
            const r = radius * variation;
            
            controlPoints.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // Generate smooth path using Catmull-Rom spline
        const resolution = 100;
        this.centerPath = [];
        
        for (let i = 0; i < controlPoints.length; i++) {
            const p0 = controlPoints[(i - 1 + controlPoints.length) % controlPoints.length];
            const p1 = controlPoints[i];
            const p2 = controlPoints[(i + 1) % controlPoints.length];
            const p3 = controlPoints[(i + 2) % controlPoints.length];
            
            const steps = Math.floor(resolution / controlPoints.length);
            for (let t = 0; t < steps; t++) {
                const tt = t / steps;
                const point = this.catmullRom(p0, p1, p2, p3, tt);
                this.centerPath.push(point);
            }
        }
        
        // Generate boundaries
        this.generateBoundaries();
        
        // Generate checkpoints
        this.generateCheckpoints();
        
        // Set start line
        this.startLine = {
            center: this.centerPath[0],
            angle: this.getPathAngle(0)
        };
    }
    
    catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        return {
            x: 0.5 * (
                (2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
            ),
            y: 0.5 * (
                (2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
            )
        };
    }
    
    generateBoundaries() {
        this.innerBoundary = [];
        this.outerBoundary = [];
        
        for (let i = 0; i < this.centerPath.length; i++) {
            const point = this.centerPath[i];
            const angle = this.getPathAngle(i);
            
            const perpAngle = angle + Math.PI / 2;
            const offsetX = Math.cos(perpAngle);
            const offsetY = Math.sin(perpAngle);
            
            this.innerBoundary.push({
                x: point.x + offsetX * (this.trackWidth / 2),
                y: point.y + offsetY * (this.trackWidth / 2)
            });
            
            this.outerBoundary.push({
                x: point.x - offsetX * (this.trackWidth / 2),
                y: point.y - offsetY * (this.trackWidth / 2)
            });
        }
    }
    
    generateCheckpoints() {
        const numCheckpoints = 10;
        const step = Math.floor(this.centerPath.length / numCheckpoints);
        
        for (let i = 0; i < numCheckpoints; i++) {
            const index = (i * step) % this.centerPath.length;
            const point = this.centerPath[index];
            const angle = this.getPathAngle(index);
            
            const perpAngle = angle + Math.PI / 2;
            const offsetX = Math.cos(perpAngle);
            const offsetY = Math.sin(perpAngle);
            
            this.checkpoints.push({
                index: i,
                center: point,
                angle: angle,
                p1: {
                    x: point.x + offsetX * (this.trackWidth / 2 + 10),
                    y: point.y + offsetY * (this.trackWidth / 2 + 10)
                },
                p2: {
                    x: point.x - offsetX * (this.trackWidth / 2 + 10),
                    y: point.y - offsetY * (this.trackWidth / 2 + 10)
                }
            });
        }
    }
    
    getPathAngle(index) {
        const current = this.centerPath[index];
        const next = this.centerPath[(index + 1) % this.centerPath.length];
        return Math.atan2(next.y - current.y, next.x - current.x);
    }
    
    isOnTrack(x, y) {
        const point = { x, y };
        const onInner = Utils.pointInPolygon(point, this.innerBoundary);
        const onOuter = Utils.pointInPolygon(point, this.outerBoundary);
        
        // On track if inside outer boundary but outside inner boundary
        return onOuter && !onInner;
    }
    
    getClosestPoint(x, y) {
        let closest = null;
        let minDist = Infinity;
        let closestIndex = 0;
        
        for (let i = 0; i < this.centerPath.length; i++) {
            const point = this.centerPath[i];
            const dist = Utils.vecDistance({ x, y }, point);
            
            if (dist < minDist) {
                minDist = dist;
                closest = point;
                closestIndex = i;
            }
        }
        
        return { point: closest, index: closestIndex, distance: minDist };
    }
    
    getNearestWallPoint(x, y) {
        const point = { x, y };
        let minDist = Infinity;
        let closestPoint = null;
        
        // Check inner boundary
        for (let i = 0; i < this.innerBoundary.length; i++) {
            const p1 = this.innerBoundary[i];
            const p2 = this.innerBoundary[(i + 1) % this.innerBoundary.length];
            const dist = Utils.distanceToSegment(point, p1, p2);
            
            if (dist < minDist) {
                minDist = dist;
                closestPoint = { x: p1.x, y: p1.y };
            }
        }
        
        // Check outer boundary
        for (let i = 0; i < this.outerBoundary.length; i++) {
            const p1 = this.outerBoundary[i];
            const p2 = this.outerBoundary[(i + 1) % this.outerBoundary.length];
            const dist = Utils.distanceToSegment(point, p1, p2);
            
            if (dist < minDist) {
                minDist = dist;
                closestPoint = { x: p1.x, y: p1.y };
            }
        }
        
        return { point: closestPoint, distance: minDist };
    }
}
