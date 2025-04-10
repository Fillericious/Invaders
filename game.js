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
    PLAYER_COLOR: 'rgb(0, 255, 0)',
    ALIEN_COLOR: 'rgb(255, 0, 255)',
    PLAYER_BULLET_COLOR: 'rgb(0, 255, 0)',
    ALIEN_BULLET_COLOR: 'rgb(255, 255, 255)',
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
        fill(COLORS.PLAYER_BULLET_COLOR);
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
        if (this.hit) {
            fill(frameCount % 5 < 5 ? color(255, 0, 0) : color(COLORS.PLAYER_COLOR));
        } else {
            fill(COLORS.PLAYER_COLOR);
        }

        noStroke();
        // draw flames
        fill(random(128, 255), random(20, 128), 0);
        rect(this.x - 12, this.y + 20, 3, 10);
        rect(this.x + 12, this.y + 20, 3, 10);
        fill(random(0, 128), random(0, 128), random(128, 255));
        rect(this.x - 12, this.y + 25, 3, 2);
        rect(this.x + 12, this.y + 25, 3, 2);
        fill(COLORS.PLAYER_COLOR);
        // draw ship
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
    }

    shoot() {
        return new Bullet(this.x, this.y - this.size / 2, 5, -7);
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
        fill(255, 0, 255);
        textSize(this.size);
        text("👾", this.x - 20, this.y - 12); // use an emoji to draw the alien.
    }

    isOffScreen() {
        return this.x >= width - this.size / 2 || this.x <= 0 + this.size / 2;
    }

    shoot() {
        return new Bullet(this.x, this.y + this.size / 2, 6, 4);
    }
    update() {
        this.draw();
    }

}

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

function setup() {
    createCanvas(700, 525);
    ui = new UI();
    const mainElement = document.querySelector('main');
    mainElement.style.borderColor = 'rgb(0, 255, 0)'; // Reset border color
    recoveryTime = RECOVERY_TIME_FRAMES;
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
        ui.drawWin();
        gameWin = true;
        noLoop();
    }
}

function handlePlayerDeath() {
    player.update();
    updateExplosion();
    ui.drawLives();
    const mainElement = document.querySelector('main');
    if (frameCount % 20 < 5) {
        mainElement.style.borderColor = 'rgb(255, 0, 0)'; // Red
    } else {
        mainElement.style.borderColor = 'rgb(255, 255, 255)'; // White
    }
    fill(COLORS.RECOVERY_COLOR);
    stroke(180, 0, 255);
    textSize(90);
    textAlign(CENTER, CENTER);
    text(recoveryTime / 10, width / 2, height / 2);
    if (frameCount % 10 === 0) {
        recoveryTime -= 10;
        if (recoveryTime <= 0) {
            resetPlayer();
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
        fill(COLORS.EXPLOSION_COLOR, alpha);
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
        createAliens();
        return;
    }
    
    if (gameOver && (key === 'r' || key === 'R')) {
        restartGame();
        return;
    }
    if (gameOver || !player.alive) return;

    if (keyCode === 32) {
        playerBullets.push(player.shoot());
    }

    if (gameWin && (key === 'y' || key === 'Y')) {
        restartGame();
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
    if (!player.alive) return;

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
            player.handleDeath();
            createExplosion(player.x, player.y);
            break;
        }
    }
}
let ui; // UI object
class  UI {
    draw() {
        this.drawScore();
        this.drawLives();
        this.drawMainMenu();
    }
    drawScore() {
        stroke(0);
        strokeWeight(2);
        fill(COLORS.SCORE_COLOR);
        textSize(20);
        textAlign(LEFT, TOP);
        text("Score: " + score, 10, 10);
    }
    drawLives() {
        stroke(0);
        strokeWeight(2);
        fill(COLORS.LIVES_COLOR);
        textSize(20);
        textAlign(RIGHT, TOP);
        text("Lives: " + "♥".repeat(lives), width - 10, 10);
    }

    drawMainMenu() {
        if (mainMenu) {
            stroke(0);
            strokeWeight(3);
            fill(COLORS.MAIN_TEXT_COLOR);
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
            fill(COLORS.GAME_OVER_TEXT_COLOR);
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
            fill(COLORS.WIN_TEXT_COLOR);
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
    const mainElement = document.querySelector('main');
    mainElement.style.borderColor = COLORS.BORDER_COLOR;

    explosionParticles = [];
}

function restartGame() {
    resetGame();
    loop();
}
