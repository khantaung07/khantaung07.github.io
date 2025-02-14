const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 750;
canvas.height = 300;

let kane = {
    x: 50,
    y: canvas.height - 120, // Start on the ground
    width: 60,
    height: 120,
    velocityY: 0,
    gravity: 0.5,
    isDucking: false
};

let kane_img = new Image();
kane_img.src = "./game_imgs/kane.png";

let kane_ducking_img = new Image();
kane_ducking_img.src = "./game_imgs/kane_duck.png";


let obstacleImages = [
    "./game_imgs/epl.png",
    "./game_imgs/ucl.png",
    "./game_imgs/ballon.png"
].map(src => {
    let img = new Image();
    img.src = src;
    img.onload = () => {
        console.log(`${src} loaded`);
    };
    return img;
});


let obstacles = [];
let gameOver = false;
let score = 0;
let speed = 7;

// Listen for jump and duck
document.addEventListener("keydown", (e) => {
    if (gameOver) {
        resetGame();
    } else if (e.code === "ArrowUp" || e.code === "Space") {
        if (kane.y === canvas.height - kane.height) {
            kane.velocityY = -10.5 ; // Jump
        }
    } else if (e.code === "ArrowDown" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        kane.isDucking = true;
        kane.height = 60; // Shrink to duck
        kane.width = 120;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowDown" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        kane.isDucking = false;
        kane.height = 120; // Restore height and width
        kane.width = 60; 
    }
});

// Create obstacles
function createObstacle() {
    let type = Math.random();
    let obstacle;

    if (type < 0.4) {
        // EPL (ground-level)
        obstacle = { 
            x: canvas.width, 
            y: canvas.height - 67, 
            width: 43, 
            height: 67, 
            image: obstacleImages[0],
            type: "ground"  // Ground-level obstacle
        };
    }
    else if (type < 0.8) {
        // UCL (medium obstacle)
        obstacle = { 
            x: canvas.width, 
            y: canvas.height - 75, 
            width: 50, 
            height: 75, 
            image: obstacleImages[1],
            type: "ground"
        };
    }
    else {
        // Ballon d'Or (flying)
        obstacle = { 
            x: canvas.width, 
            y: canvas.height - 120, // Flying at a height
            width: 40, 
            height: 50, 
            image: obstacleImages[2],
            type: "flying"
        };
    }

    obstacles.push(obstacle);
}

// Update game logic
function update() {
    if (gameOver) return;

    kane.velocityY += kane.gravity;
    kane.y += kane.velocityY;

    // Prevent falling below ground
    if (kane.y > canvas.height - kane.height) {
        kane.y = canvas.height - kane.height;
        kane.velocityY = 0;
    }

    // Move obstacles
    obstacles.forEach((obs, i) => {
        obs.x -= speed;
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
        }

        // Collision detection for ground and flying obstacles
        if (
            kane.x < obs.x + obs.width &&
            kane.x + kane.width > obs.x &&
            ((kane.y + kane.height > obs.y && obs.type === "ground") || // Ground-level collision
            (kane.y < obs.y + obs.height && kane.y + kane.height > obs.y && obs.type === "flying")) // Flying obstacle collision
        ) {
            gameOver = true;
        }
    });

    // Spawn obstacles every 100 frames
    if (frames % 100 === 0) createObstacle();

    // Increase speed every 1000 frames
    if (frames % 1000 === 0) speed += 1;
}

function drawGrass() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}



// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrass();

    // Kane (Player)
    if (kane.isDucking) {
        ctx.drawImage(kane_ducking_img, kane.x, kane.y, kane.width, kane.height); 
    } else {
        ctx.drawImage(kane_img, kane.x, kane.y, kane.width, kane.height);
    }


    // Obstacles (Trophies)
    obstacles.forEach(obs => {
        ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);
    });

    // Score display
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${score}`, 10, 20);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.fillText("Game Over! Press any key to restart.", 50, canvas.height / 2);
    }
}

let frames = 0;
function gameLoop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(gameLoop);
}

// Reset game state
function resetGame() {
    gameOver = false;
    score = 0;
    speed = 7;
    obstacles = [];
    kane.y = canvas.height - kane.height;
    kane.velocityY = 0;
    frames = 0;  // Reset frames for obstacle spawning
}

// Start game
gameLoop();
