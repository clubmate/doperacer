# 🏎️ DopeRacer

A retro top-down 2D pixel-art car racing game inspired by MicroMachines, built with pure HTML5 Canvas and JavaScript.

## 🎮 Features

- **Procedurally Generated Tracks**: Every race features a unique track layout using Catmull-Rom spline interpolation
- **Smooth Car Physics**: Realistic acceleration, braking, steering, and drift mechanics
- **AI Opponents**: 3 AI-controlled cars with pathfinding and collision avoidance
- **Pixel-Art Style**: Retro graphics with crisp pixel rendering
- **Mini-Map**: Real-time overview of track and racer positions
- **Lap Tracking**: Complete checkpoint system with lap counting and race positions
- **Responsive UI**: Clean interface showing speed, lap, and position information

## 🎯 How to Play

### Controls
- **↑ / W**: Accelerate
- **↓ / S**: Brake / Reverse
- **← / A**: Steer Left
- **→ / D**: Steer Right
- **SPACE**: Drift (for tight corners)

### Objective
Complete 3 laps of the track faster than your AI opponents. Navigate through checkpoints in order and avoid hitting the walls, which will slow you down.

## 🚀 Getting Started

Simply open `index.html` in a modern web browser. No build process or dependencies required!

```bash
# Clone the repository
git clone https://github.com/clubmate/doperacer.git

# Open in browser
open index.html
# or
python -m http.server 8000  # Then visit http://localhost:8000
```

## 🏗️ Architecture

The game is built with clean, modular JavaScript:

- **`index.html`**: Main HTML structure with canvas elements and UI
- **`js/utils.js`**: Vector math and utility functions
- **`js/track.js`**: Procedural track generation and collision detection
- **`js/car.js`**: Car physics and controls
- **`js/ai.js`**: AI opponent logic with pathfinding
- **`js/renderer.js`**: Pixel-art rendering engine
- **`js/game.js`**: Main game loop and state management

## 🎨 Technical Highlights

- **No external libraries**: Pure vanilla JavaScript and HTML5 Canvas
- **60 FPS gameplay**: Optimized rendering and physics calculations
- **Procedural generation**: Catmull-Rom spline-based track generation
- **Pixel-perfect rendering**: `imageSmoothingEnabled = false` for crisp pixel art
- **Camera system**: Smooth following camera centered on player
- **Collision detection**: Line intersection and point-in-polygon algorithms
- **AI pathfinding**: Target-based steering with obstacle avoidance

## 🎲 Game Mechanics

### Track Generation
Tracks are procedurally generated using:
1. Control points arranged in a circular pattern with sine-wave variations
2. Catmull-Rom spline interpolation for smooth curves
3. Perpendicular offset calculation for inner/outer boundaries
4. Automatic checkpoint placement at regular intervals

### Car Physics
- **Acceleration**: Forward/backward with configurable speed limits
- **Friction**: Natural speed decay when not accelerating
- **Steering**: Speed-dependent turn rate for realistic handling
- **Drifting**: Controlled slide mechanic for sharp turns
- **Collision**: Bounce-back effect when hitting walls

### AI System
- **Pathfinding**: Follows track centerline with lookahead
- **Avoidance**: Detects and steers away from other cars
- **Speed control**: Adapts speed based on upcoming turn sharpness
- **Skill variation**: Each AI has randomized skill level (70-100%)

## 🌐 Browser Compatibility

Works best in modern browsers with HTML5 Canvas support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📝 License

MIT License - feel free to use and modify for your own projects!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 🎉 Credits

Created as a demonstration of clean, modular game development with vanilla JavaScript.