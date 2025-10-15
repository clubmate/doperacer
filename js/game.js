// Main game logic and state management
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.minimapCanvas = document.getElementById('minimap');
        this.renderer = new Renderer(this.canvas, this.minimapCanvas);
        
        // Game state
        this.state = 'menu'; // menu, racing, finished
        this.track = null;
        this.cars = [];
        this.player = null;
        this.aiControllers = [];
        this.totalLaps = 3;
        this.raceStartTime = 0;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Input handling
        this.keys = {};
        
        // UI elements
        this.menuElement = document.getElementById('menu');
        this.finishScreen = document.getElementById('finishScreen');
        
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Show menu
        this.showMenu();
    }
    
    setupEventListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Prevent arrow keys from scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button listeners
        document.getElementById('startButton').addEventListener('click', () => {
            this.startRace();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startRace();
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
    }
    
    showMenu() {
        this.state = 'menu';
        this.menuElement.classList.remove('hidden');
        this.finishScreen.classList.add('hidden');
    }
    
    startRace() {
        this.state = 'racing';
        this.menuElement.classList.add('hidden');
        this.finishScreen.classList.add('hidden');
        
        // Generate new track
        this.track = new Track();
        
        // Create cars
        this.createCars();
        
        // Reset race time
        this.raceStartTime = Date.now();
        this.lastFrameTime = 0;
        
        // Start game loop
        this.gameLoop();
    }
    
    createCars() {
        this.cars = [];
        this.aiControllers = [];
        
        const startPos = this.track.startLine.center;
        const startAngle = this.track.startLine.angle;
        
        const colors = ['#ff3333', '#3333ff', '#33ff33', '#ffff33'];
        const spacing = 40;
        
        for (let i = 0; i < 4; i++) {
            const offset = (i - 1.5) * spacing;
            const perpAngle = startAngle + Math.PI / 2;
            
            const x = startPos.x + Math.cos(perpAngle) * offset;
            const y = startPos.y + Math.sin(perpAngle) * offset;
            
            const car = new Car(x, y, startAngle, colors[i], i === 0);
            this.cars.push(car);
            
            if (i === 0) {
                this.player = car;
            } else {
                const ai = new AIController(car, this.track);
                this.aiControllers.push(ai);
            }
        }
    }
    
    gameLoop() {
        if (this.state !== 'racing') return;
        
        // Calculate delta time for frame rate independence
        const currentTime = performance.now();
        this.deltaTime = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 16.67 : 1;
        this.deltaTime = Math.min(this.deltaTime, 3); // Clamp to prevent huge jumps
        this.lastFrameTime = currentTime;
        
        this.update();
        this.render();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update player controls
        this.updatePlayerControls();
        
        // Update AI
        for (const ai of this.aiControllers) {
            ai.update(this.cars);
        }
        
        // Update all cars with delta time for frame rate independence
        for (const car of this.cars) {
            car.update(this.track, this.deltaTime);
        }
        
        // Check race completion
        this.checkRaceCompletion();
    }
    
    updatePlayerControls() {
        if (!this.player) return;
        
        this.player.controls.forward = this.keys['ArrowUp'] || this.keys['KeyW'];
        this.player.controls.backward = this.keys['ArrowDown'] || this.keys['KeyS'];
        this.player.controls.left = this.keys['ArrowLeft'] || this.keys['KeyA'];
        this.player.controls.right = this.keys['ArrowRight'] || this.keys['KeyD'];
        this.player.controls.drift = this.keys['Space'];
    }
    
    checkRaceCompletion() {
        for (const car of this.cars) {
            if (car.currentLap >= this.totalLaps && !car.raceFinished) {
                car.raceFinished = true;
                car.finishTime = Date.now() - this.raceStartTime;
            }
        }
        
        // Check if all cars finished
        const allFinished = this.cars.every(car => car.raceFinished);
        
        if (allFinished || (this.player.raceFinished && Date.now() - this.raceStartTime > 10000)) {
            this.finishRace();
        }
    }
    
    finishRace() {
        this.state = 'finished';
        this.showFinishScreen();
    }
    
    showFinishScreen() {
        this.finishScreen.classList.remove('hidden');
        
        // Sort cars by finish time
        const sortedCars = [...this.cars]
            .filter(car => car.raceFinished)
            .sort((a, b) => a.finishTime - b.finishTime);
        
        // Create leaderboard
        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '<h3>Final Results:</h3>';
        
        for (let i = 0; i < sortedCars.length; i++) {
            const car = sortedCars[i];
            const time = this.formatTime(car.finishTime);
            const entry = document.createElement('div');
            entry.className = 'leader-entry' + (car.isPlayer ? ' player' : '');
            entry.innerHTML = `${i + 1}. ${car.isPlayer ? 'YOU' : 'AI ' + (this.cars.indexOf(car))} - ${time}`;
            leaderboard.appendChild(entry);
        }
        
        // Add DNF for cars that didn't finish
        const unfinished = this.cars.filter(car => !car.raceFinished);
        for (const car of unfinished) {
            const entry = document.createElement('div');
            entry.className = 'leader-entry' + (car.isPlayer ? ' player' : '');
            entry.innerHTML = `DNF. ${car.isPlayer ? 'YOU' : 'AI ' + (this.cars.indexOf(car))} - Did Not Finish`;
            leaderboard.appendChild(entry);
        }
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const remainingMs = Math.floor((ms % 1000) / 10);
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
    }
    
    render() {
        if (this.state !== 'racing') return;
        this.renderer.render(this.track, this.cars, this.player);
    }
    
    updateUI() {
        if (this.state !== 'racing' || !this.player) return;
        
        // Update lap counter
        document.getElementById('currentLap').textContent = Math.min(this.player.currentLap + 1, this.totalLaps);
        document.getElementById('totalLaps').textContent = this.totalLaps;
        
        // Update position
        const position = this.calculatePosition(this.player);
        document.getElementById('currentPosition').textContent = position;
        document.getElementById('totalRacers').textContent = this.cars.length;
        
        // Update speed
        document.getElementById('currentSpeed').textContent = this.player.getSpeedKmh();
    }
    
    calculatePosition(car) {
        // Sort cars by progress (lap * track length + checkpoint progress)
        const sortedCars = [...this.cars].sort((a, b) => {
            const progressA = a.currentLap * 1000 + a.checkpointsPassed;
            const progressB = b.currentLap * 1000 + b.checkpointsPassed;
            return progressB - progressA;
        });
        
        return sortedCars.indexOf(car) + 1;
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
