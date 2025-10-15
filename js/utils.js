// Utility functions for the game
const Utils = {
    // Vector math
    vec2: (x, y) => ({ x, y }),
    
    vecAdd: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    
    vecSub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    
    vecScale: (v, s) => ({ x: v.x * s, y: v.y * s }),
    
    vecLength: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    
    vecNormalize: (v) => {
        const len = Utils.vecLength(v);
        return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
    },
    
    vecDot: (a, b) => a.x * b.x + a.y * b.y,
    
    vecDistance: (a, b) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    vecRotate: (v, angle) => ({
        x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
        y: v.x * Math.sin(angle) + v.y * Math.cos(angle)
    }),
    
    // Angle utilities
    normalizeAngle: (angle) => {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },
    
    angleDifference: (a, b) => {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    },
    
    // Line intersection for collision detection
    lineIntersection: (p1, p2, p3, p4) => {
        const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
        
        if (Math.abs(denominator) < 0.0001) return null;
        
        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
        
        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: p1.x + ua * (p2.x - p1.x),
                y: p1.y + ua * (p2.y - p1.y)
            };
        }
        
        return null;
    },
    
    // Point in polygon test (for track boundaries)
    pointInPolygon: (point, polygon) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },
    
    // Clamp value between min and max
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // Linear interpolation
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Random utilities
    random: (min, max) => Math.random() * (max - min) + min,
    
    randomInt: (min, max) => Math.floor(Utils.random(min, max + 1)),
    
    // Distance to line segment
    distanceToSegment: (point, p1, p2) => {
        const A = point.x - p1.x;
        const B = point.y - p1.y;
        const C = p2.x - p1.x;
        const D = p2.y - p1.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = p1.x;
            yy = p1.y;
        } else if (param > 1) {
            xx = p2.x;
            yy = p2.y;
        } else {
            xx = p1.x + param * C;
            yy = p1.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
};
