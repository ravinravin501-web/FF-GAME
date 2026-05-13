const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 35,
  speed: 4,
  health: 100
};

let bullets = [];
let enemies = [];
let ammo = 30;

let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;

function startGame() {
  document.getElementById("lobby").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  gameRunning = true;

  spawnEnemies();
  gameLoop();
}

function spawnEnemies() {
  enemies = [];

  for (let i = 0; i < 5; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 30,
      speed: 1.2,
      health: 50
    });
  }
}

function shoot() {
  if (!gameRunning) return;

  if (ammo <= 0) {
    alert("No ammo!");
    return;
  }

  ammo--;
  document.getElementById("ammo").innerText = ammo;

  bullets.push({
    x: player.x + player.size / 2,
    y: player.y,
    size: 8,
    speed: 8
  });
}

function updatePlayer() {
  if (moveUp) player.y -= player.speed;
  if (moveDown) player.y += player.speed;
  if (moveLeft) player.x -= player.speed;
  if (moveRight) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
  if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
}

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;

    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  });
}

function updateEnemies() {
  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

    if (distance < player.size) {
      player.health -= 1;
      document.getElementById("health").innerText = player.health;

      if (player.health <= 0) {
        gameOver();
      }
    }
  });
}

function checkCollision() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      let dx = bullet.x - enemy.x;
      let dy = bullet.y - enemy.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.size) {
        enemy.health -= 25;
        bullets.splice(bIndex, 1);

        if (enemy.health <= 0) {
          enemies.splice(eIndex, 1);
        }
      }
    });
  });

  if (enemies.length === 0) {
    spawnEnemies();
    ammo += 20;
    document.getElementById("ammo").innerText = ammo;
  }
}

function drawPlayer() {
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  ctx.fillStyle = "white";
  ctx.fillText("YOU", player.x, player.y - 8);
}

function drawBullets() {
  ctx.fillStyle = "yellow";

  bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies() {
  ctx.fillStyle = "red";

  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

    ctx.fillStyle = "white";
    ctx.fillText("BOT", enemy.x, enemy.y - 8);
    ctx.fillStyle = "red";
  });
}

function gameOver() {
  gameRunning = false;
  alert("Game Over");
  location.reload();
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateBullets();
  updateEnemies();
  checkCollision();

  drawPlayer();
  drawBullets();
  drawEnemies();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
  if (e.key === "w") moveUp = true;
  if (e.key === "s") moveDown = true;
  if (e.key === "a") moveLeft = true;
  if (e.key === "d") moveRight = true;
  if (e.key === " ") shoot();
});

document.addEventListener("keyup", e => {
  if (e.key === "w") moveUp = false;
  if (e.key === "s") moveDown = false;
  if (e.key === "a") moveLeft = false;
  if (e.key === "d") moveRight = false;
});
