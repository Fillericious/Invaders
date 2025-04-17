const ALIEN_ROWS = 5;
const ALIEN_COLS = 10;
const ALIEN_SPACING = 45;
const ALIEN_SIZE = 30;
const ALIEN_DROP_DISTANCE = 20;
const ALIEN_FIRE_RATE = 0.001;
const PLAYER_SPEED = 5;
const RECOVERY_TIME_FRAMES = 120;
const PLAYER_BULLET_SPEED = -7;
const ALIEN_BULLET_SPEED = 4;
const PLAYER_SIZE = 30;
const COLORS = {
    PLAYER_COLOR: 'rgb(0, 182, 0)',
    ALIEN_COLOR: 'rgb(255, 0, 255)',
    PLAYER_BULLET_COLOR: 'rgb(0, 255, 0)',
    ALIEN_BULLET_COLOR: 'rgb(255, 94, 0)',
    EXPLOSION_COLOR: 'rgb(255, 0, 0)',
    BACKGROUND_COLOR: 'rgb(0,0,0)',
    TEXT_COLOR: 'rgb(0, 255, 0)',
    MAIN_TEXT_COLOR: 'rgb(0, 255, 0)',
    GAME_OVER_TEXT_COLOR: 'rgb(255, 0, 0)',
    WIN_TEXT_COLOR: 'rgb(0, 255, 0)',
    BORDER_COLOR: 'rgb(0, 255, 0)',
    RECOVERY_COLOR: 'rgb(255, 0, 0)',
    SCORE_COLOR: 'rgb(0, 255, 0)',
    LIVES_COLOR: 'rgb(0, 255, 0)'
};

let player; // Player object
let playerBullets = []; // Array to hold player bullets
let aliens = []; // Array to hold aliens
let alienBullets = []; // Array to hold alien bullets
let explosionParticles = [];
let alienDirection = 1;
let alienSpeed = 1;
let aliensMoveDown = false;
let score = 0; // Player's score
let lives = 3; // Player's remaining lives
let mainMenu = true; // Flag to indicate if the game is in the main menu
let gameOver = false;
let gameWin = false; // Player has won the game
let recoveryTime = 0; // Add this line to declare recoveryTime


class Bullet {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        fill(this.speed < 0 ? color(0, 255, 0) : COLORS.ALIEN_BULLET_COLOR);
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size * 2);
    }

    isOffScreen() {
        return this.y < 0 || this.y > height;
    }
}
class Player {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.alive = true;
        this.hit = false;
        this.hitTimer = 0;
    }

    move(direction) {
        this.x += direction * this.speed;
        this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    }

    draw() {
        noStroke();
        if (this.hit) {
            fill(color(255, 0, 0));
        } else {
            fill(color(0, 255, 0));
        }

        // draw flames
        if (!this.hit) {
            fill(color(random(128, 255), random(20, 128), 0));
            rect(this.x - 12, this.y + 20, 3, 10);
            rect(this.x + 12, this.y + 20, 3, 10);
            fill(color(random(0, 128), random(0, 128), random(128, 255)));
            rect(this.x - 12, this.y + 25, 3, 2);
            rect(this.x + 12, this.y + 25, 3, 2);
        }

        // draw ship (no transparency or pulsating)
        fill(color(0, 255, 0));
        triangle(
            this.x, this.y - this.size / 2,
            this.x - this.size / 2, this.y + this.size / 2,
            this.x + this.size / 2, this.y + this.size / 2
        );
        arc(
            this.x, this.y + 16,
            this.size, this.size + 10,
            PI, TWO_PI
        );
    }

    handleDeath() {
        this.alive = false;
        this.hit = true;
        this.hitTimer = 60;
        recoveryTime = RECOVERY_TIME_FRAMES;
    }

    shoot() {
        return new Bullet(this.x, this.y - this.size / 2, 5, PLAYER_BULLET_SPEED);
    }

    update() {
        this.draw();
    }

}
class Alien {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.alive = true;
    }

    move(direction, speed) {
        this.x += direction * speed;
    }

    draw() {
        fill(color(255, 0, 255));
        textSize(this.size);
        text("👾", this.x - 20, this.y - 12);
    }

    isOffScreen() {
        return this.x >= width - this.size / 2 || this.x <= 0 + this.size / 2;
    }

    shoot() {
        return new Bullet(this.x, this.y + this.size / 2, 8, ALIEN_BULLET_SPEED); // Increased size from 6 to 8
    }
    update() {
        this.draw();
    }

}

function setup() {
    createCanvas(700, 525);
    ui = new UI();
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.borderColor = COLORS.BORDER_COLOR;
    recoveryTime = 0;  // Initialize to 0 since we're not in recovery mode at start
    resetPlayer();
}


function createAliens(alienSpeed) {
    aliens = [];
    let startX = (width - (ALIEN_COLS - 1) * ALIEN_SPACING) / 2 - ALIEN_SIZE / 2;
    let startY = 60;
    for (let r = 0; r < ALIEN_ROWS; r++) {
        for (let c = 0; c < ALIEN_COLS; c++) {
            aliens.push(new Alien(startX + c * ALIEN_SPACING, startY + r * ALIEN_SPACING, ALIEN_SIZE));
        }
    }
}


function draw() {
    background(0);
    if (mainMenu) {
        ui.drawMainMenu();
        return;
    }
    if (gameOver) {
        ui.drawGameOver();
        return;
    }
    if (gameWin) {
        ui.drawWin();
        return;
    }
    if (!player.alive) {
        handlePlayerDeath();
        return;
    } 

    handlePlayer();
    handlePlayerBullets();
    handleAliens();
    handleAlienBullets();
    checkCollisions();
    ui.draw();

    if (aliens.length === 0) {
        gameWin = true;
    }
}

function handlePlayerDeath() {
    // Continue game animation
    handleAliens();
    handleAlienBullets();
    handlePlayerBullets();
    
    // Update player and effects
    player.update();
    updateExplosion();
    ui.drawLives();
    
    // Flash border
    const gameContainer = document.querySelector('.game-container');
    if (frameCount % 20 < 5) {
        gameContainer.style.borderColor = 'rgb(255, 0, 0)';
    } else {
        gameContainer.style.borderColor = 'rgb(255, 255, 255)';
    }
    
    // Show recovery countdown
    fill(COLORS.RECOVERY_COLOR);
    stroke(180, 0, 255);
    textSize(90);
    textAlign(CENTER, CENTER);
    text(Math.ceil(recoveryTime / 60), width / 2, height / 2);
    
    // Update recovery timer
    recoveryTime--;
    if (recoveryTime <= 0) {
        if (lives > 0) {
            resetPlayer();
        } else {
            gameOver = true;
        }
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        explosionParticles.push({
             x: x,
            y: y,
            vx: random(-3, 3),
            vy: random(-3, 3),
            life: 60
        });
    }
}

function updateExplosion() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        let alpha = map(p.life, 60, 0, 255, 0);
        fill(color(255, 0, 0, alpha));
        noStroke();
        circle(p.x, p.y, 4);

        if (p.life <= 0) {
            explosionParticles.splice(i, 1);
        }
    }
}

function keyPressed() {
    if (mainMenu && keyCode === 32) {
        mainMenu = false;
        createAliens(alienSpeed);
        return;
    }
    if (gameOver && (key === 'r' || key === 'R')) {
        restartGame();
        return;
    }
    if (keyCode === 32 && !gameOver && !mainMenu && player.alive && recoveryTime <= 0) {
        playerBullets.push(player.shoot());
    }
    if (gameWin && (key === 'y' || key === 'Y')) {
        restartGame(true); // Next round, keep score, increase speed
    }
}

function handlePlayer() {
    player.update();
    if (keyIsDown(LEFT_ARROW)) player.move(-1);
    else if (keyIsDown(RIGHT_ARROW)) player.move(1);
}

function handlePlayerBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let bullet = playerBullets[i];
        bullet.update();
        bullet.draw();

        if (bullet.isOffScreen()) {
            playerBullets.splice(i, 1);
        }
    }
}

function handleAliens() {
    for (let i = aliens.length - 1; i >= 0; i--) {
        let alien = aliens[i];
        if (!alien.alive) {
            aliens.splice(i, 1);
            continue;
        }

        if (alien.isOffScreen()) {
            alienDirection *= -1;
            aliensMoveDown = true;
            break; // Break after changing direction to avoid multiple direction changes
        }
    }

    if (aliensMoveDown) {
        for (let alien of aliens) {
            alien.y += ALIEN_DROP_DISTANCE;
        }
        aliensMoveDown = false;
    }

    for (let alien of aliens) {
        alien.move(alienDirection, alienSpeed);
        alien.update();
        if (random(1) < ALIEN_FIRE_RATE) alienBullets.push(alien.shoot());
    }
}


function handleAlienBullets() {
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        let bullet = alienBullets[i];
        bullet.update();
        bullet.draw();

        if (bullet.isOffScreen()) {
            alienBullets.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (!player.alive || recoveryTime > 0) return;

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            let b = playerBullets[i];
            let a = aliens[j];

            if (!a) continue;

            if (a.alive) {
                let distance = dist(b.x, b.y, a.x, a.y);
                if (distance < b.size / 2 + ALIEN_SIZE / 2) {
                    aliens.splice(j, 1);
                    playerBullets.splice(i, 1);
                    score += 10;
                    break;
                }
            }
        }
    }

    for (let i = alienBullets.length - 1; i >= 0; i--) {
        let b = alienBullets[i];
        let distance = dist(b.x, b.y, player.x, player.y);

        if (distance < b.size / 2 + PLAYER_SIZE / 2) {
            alienBullets.splice(i, 1);
            lives--;
            player.handleDeath();
            createExplosion(player.x, player.y);
            if (lives <= 0) {
                gameOver = true;
            }
            break;
        }
    }
}
let ui; // UI object
class UI {
    draw() {
        if (!mainMenu) {
            this.drawScore();
            this.drawLives();
        }
    }
    
    drawScore() {
        stroke(0);
        strokeWeight(2);
        fill(color(0, 255, 0));
        textSize(20);
        textAlign(LEFT, TOP);
        text("Score: " + score, 10, 10);
    }

    drawLives() {
        stroke(0);
        strokeWeight(2);
        fill(color(0, 255, 0));
        textSize(20);
        textAlign(RIGHT, TOP);
        text("Lives: " + "♥".repeat(lives), width - 10, 10);
    }

    drawMainMenu() {
        if (mainMenu) {
            stroke(0);
            strokeWeight(3);
            fill(color(0, 255, 0));
            textSize(64);
            textAlign(CENTER, CENTER);
            text("SPACE INVADERS", width / 2, height / 2 - 80);

            textSize(24);
            text("Press SPACE to Start", width / 2, height / 2);
            text("Move: ← →", width / 2, height / 2 + 40);
            text("Shoot: SPACE", width / 2, height / 2 + 70);
        }
    }

    drawGameOver() {
        if (gameOver) {
            stroke(0);
            strokeWeight(2);
            fill(color(255, 0, 0));
            textSize(64);
            textAlign(CENTER, CENTER);
            text("GAME OVER", width / 2, height / 2 - 80);
            textSize(40);
            text("Final Score: " + score, width / 2, height / 2);
            textSize(20);
            text("Press 'R' to Restart", width / 2, height / 2 + 80);
        }
    }

    drawWin() {
        if (gameWin) {
            stroke(0);
            strokeWeight(2);
            fill(color(0, 255, 0));
            textSize(64);
            textAlign(CENTER, CENTER);
            text("YOU WIN!", width / 2, height / 2 - 40);
            textSize(20);
            text("Final Score: " + score, width / 2, height / 2 + 20);
            text("Press 'Y' to Continue", width / 2, height / 2 + 60);
        }
    }
}
ui = new UI();

function resetGame() {
    score = 0;
    lives = 3;
    playerBullets = [];
     aliens = [];
    alienBullets = [];
    alienDirection = 1;
    alienSpeed = 1;
    mainMenu = true;
    gameWin = false;
    gameOver = false;
    resetPlayer();
    aliensMoveDown = false;
    recoveryTime = RECOVERY_TIME_FRAMES;
}

function resetPlayer() {
    player = new Player(width / 2, height - 40, PLAYER_SIZE, PLAYER_SPEED);
    player.alive = true;
    player.hit = false;
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.borderColor = COLORS.BORDER_COLOR;
    explosionParticles = [];
    recoveryTime = 0; // Ensure player is not in recovery state
}

function restartGame(nextRound = false) {
    if (nextRound) {
        // Increase alien speed by 10% each round
        alienSpeed *= 1.1;
        playerBullets = [];
        aliens = [];
        alienBullets = [];
        alienDirection = 1;
        mainMenu = false;
        gameWin = false;
        gameOver = false;
        resetPlayer();
        aliensMoveDown = false;
        recoveryTime = 0; // Ensure player is not in recovery state
        createAliens(alienSpeed);
    } else {
        score = 0;
        lives = 3;
        playerBullets = [];
        aliens = [];
        alienBullets = [];
        alienDirection = 1;
        alienSpeed = 1;
        mainMenu = true;
        gameWin = false;
        gameOver = false;
        resetPlayer();
        aliensMoveDown = false;
        recoveryTime = 0; // Ensure player is not in recovery state
    }
    loop();
}
