let player;
let playerBullets = [];
let aliens = [];
let alienBullets = [];

let alienDirection = 1;
let aliensMoveDown = false;
let alienSpeed = 1;
let alienRows = 5;
let alienCols = 10;
let alienSpacing = 45;
let alienSize = 30;
let alienDropDistance = 20;
let alienFireRate = 0.001;

let score = 0;
let lives = 3;
let gameWin = false;
let gameOver = false;
let playerSpeed = 5;
let playerHit = false;
let playerHitTimer = 0;
let mainMenu = true;

function setup() {
    createCanvas(700, 525);
    resetPlayer();
    mainMenu = true;  // Don't create aliens until game starts
}

function resetPlayer() {
    player = {
        x: width / 2,
        y: height - 40,
        size: 30,
        speed: playerSpeed,
        alive: true
    };
    playerHit = false;
    playerHitTimer = 0;
}

function createAliens() {
    aliens = [];
    let startX = (width - (alienCols - 1) * alienSpacing) / 2 - alienSize / 2;
    let startY = 60;
    for (let r = 0; r < alienRows; r++) {
        for (let c = 0; c < alienCols; c++) {
            aliens.push({
                x: startX + c * alienSpacing,
                y: startY + r * alienSpacing,
                size: alienSize,
                alive: true
            });
        }
    }
}

function draw() {
    background(0);
    if (mainMenu) {
        displayMainMenu();
        return;
    }
    if (gameOver) {
        displayGameOver();
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
    drawUI();

    if (aliens.length === 0) {
        displayWin();
        gameWin = true;
        noLoop();
    }
}

function displayMainMenu() {
    fill(0, 255, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("SPACE INVADERS", width / 2, height / 2 - 80);

    textSize(24);
    text("Press SPACE to Start", width / 2, height / 2);
    text("Move: ← →", width / 2, height / 2 + 40);
    text("Shoot: SPACE", width / 2, height / 2 + 70);
}

function handlePlayer() {
    if (playerHit) {
        playerHitTimer--;
        if (playerHitTimer <= 0) {
            playerHit = false;
        }
        fill(frameCount % 5 < 5 ? color(255, 0, 0) : color(0, 255, 0));
    } else {
        fill(0, 255, 0);
    }

    noStroke();
    // draw flames
    fill(random(128, 255), random(20, 128), 0);
    rect(player.x - 12, player.y + 20, 3, 10);
    rect(player.x + 12, player.y + 20, 3, 10);
    fill(random(0, 128), random(0, 128), random(128, 255));
    rect(player.x - 12, player.y + 25, 3, 2);
    rect(player.x + 12, player.y + 25, 3, 2);
    fill(0, 255, 0);
    // draw ship
    triangle(
        player.x, player.y - player.size / 2,
        player.x - player.size / 2, player.y + player.size / 2,
        player.x + player.size / 2, player.y + player.size / 2
    );
    arc(
        player.x, player.y + 16,
        player.size, player.size + 10,
        PI, TWO_PI
    );

    if (keyIsDown(LEFT_ARROW) && player.x > player.size / 2) {
        player.x -= player.speed;
    }
    if (keyIsDown(RIGHT_ARROW) && player.x < width - player.size / 2) {
        player.x += player.speed;
    }
}

function handlePlayerDeath() {
    fill(255, 0, 0);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("PLAYER HIT!", width / 2, height / 2);

    if (frameCount % 60 === 0) {
        if (lives > 0) {
            resetPlayer();
        } else {
            gameOver = true;
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
        playerBullets.push({
            x: player.x,
            y: player.y - player.size / 2,
            size: 5,
            speed: -7
        });
    }

    if (gameWin && (key === 'y' || key === 'Y')) {
        restartGame();
    }
}

function handlePlayerBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        b.y += b.speed;

        fill(0, 255, 0);
        rectMode(CENTER);
        rect(b.x, b.y, b.size, b.size * 2);

        if (b.y < 0) {
            playerBullets.splice(i, 1);
        }
    }
}

function handleAliens() {
    aliensMoveDown = false;

    for (let alien of aliens) {
        if (!alien.alive) continue;
        if (alien.x >= width - alienSize / 2 || alien.x <= 0 + alienSize / 2) {
            alienDirection *= -1;
            aliensMoveDown = true;
            break;
        }
    }

    for (let i = aliens.length - 1; i >= 0; i--) {
        let alien = aliens[i];
        if (!alien.alive) {
            aliens.splice(i, 1);
            continue;
        }

        if (aliensMoveDown) {
            alien.y += alienDropDistance;
            if (alien.y + alien.size / 2 > player.y - player.size / 2 && player.alive) {
                playerHit = true;
                playerHitTimer = 60;
                lives--;
                player.alive = false;
            }
        }
        alien.x += alienSpeed * alienDirection;

        fill(255, 0, 255);
        // circle(alien.x, alien.y, alien.size);
        textSize(alienSize);
        text("👾", alien.x - 20, alien.y - 12);

        if (random(1) < alienFireRate) {
            let frontAlien = true;
            if (frontAlien) {
                alienBullets.push({
                    x: alien.x,
                    y: alien.y + alien.size / 2,
                    size: 6,
                    speed: 4
                });
            }
        }
    }
}

function handleAlienBullets() {
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        let b = alienBullets[i];
        b.y += b.speed;

        fill(255);
        rectMode(CENTER);
        rect(b.x, b.y, b.size, b.size);

        if (b.y > height) {
            alienBullets.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (!player.alive || playerHit) return;

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            let b = playerBullets[i];
            let a = aliens[j];

            if (!a) continue;

            if (a.alive) {
                let distance = dist(b.x, b.y, a.x, a.y);
                if (distance < b.size / 2 + a.size / 2) {
                    a.alive = false;
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

        if (distance < b.size / 2 + player.size / 2) {
            alienBullets.splice(i, 1);
            lives--;
            playerHit = true;
            playerHitTimer = 60;
            player.alive = false;
            break;
        }
    }
}

function drawUI() {
    var vidas = "♥";
    fill(0, 255, 0);
    textSize(20);
    textAlign(LEFT, TOP);
    text("Score: " + score, 10, 10);
    text("Lives: ", width - 125, 10);

    if (lives == 2) {
        fill(255, 255, 0);
    } else if (lives == 1) {
        fill(255, 0, 0);
    } else {
        fill(0, 255, 0);
    }

    if (lives == 3) {
        vidas = "♥♥♥";
    } else if (lives == 2) {
        vidas = "♥♥";
    } else if (lives == 1) {
        vidas = "♥";
    }
    textSize(30);
    text(vidas, width - 65, 7);
    textSize(20);
}

function displayGameOver() {
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 80);
    fill(128, 0, 255);
    textSize(40);
    text("Final Score: " + score, width / 2, height / 2);
    textSize(20);
    fill(0, 255, 0);
    text("Press 'R' to Restart", width / 2, height / 2 + 80);
    noLoop();
}

function displayWin() {
    fill(0, 255, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("YOU WIN!", width / 2, height / 2 - 40);
    textSize(20);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    fill(255, 0, 0);
    text("Press 'Y' to Continue", width / 2, height / 2 + 60);
}

function restartGame() {
    if (gameOver) {
        score = 0;
        lives = 3;
        playerBullets = [];
        alienBullets = [];
        alienDirection = 1;
        alienSpeed = 1;
        gameOver = false;
        mainMenu = true;  // Return to main menu instead of starting right away
        resetPlayer();
        loop();
    }
    if (gameWin) {
        bullets = [];
        alienBullets = [];
        alienDirection = 1;
        gameWin = false;
        alienSpeed++;
        resetPlayer();
        createAliens();
        loop();
    }
}