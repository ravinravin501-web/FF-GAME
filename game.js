const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let bullets = [];
let enemies = [];
let pickups = [];
let score = 0;
let gameRunning = false;
let lastShot = 0;

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 25,
  speed: 5,
  health: 100,
  gun: "Pistol"
};

let guns = {
  Pistol:  { damage: 25, speed: 9, ammo: 12, maxAmmo: 12, fireRate: 350 },
  SMG:     { damage: 15, speed: 11, ammo: 30, maxAmmo: 30, fireRate: 120 },
  Shotgun: { damage: 45, speed: 8, ammo: 6, maxAmmo: 6, fireRate: 700 },
  Sniper:  { damage: 90, speed: 16, ammo: 5, maxAmmo: 5, fireRate: 1000 }
};

function startGame(){
  document.getElementById("startScreen").style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  spawnEnemies();
  spawnPickups();
  gameLoop();
}

document.addEventListener("keydown", function(e){
  keys[e.key] = true;

  if(e.key === "1") player.gun = "Pistol";
  if(e.key === "2") player.gun = "SMG";
  if(e.key === "3") player.gun = "Shotgun";
  if(e.key === "4") player.gun = "Sniper";

  if(e.key.toLowerCase() === "r"){
    guns[player.gun].ammo = guns[player.gun].maxAmmo;
  }
});

document.addEventListener("keyup", function(e){
  keys[e.key] = false;
});

document.addEventListener("click", shoot);

document.addEventListener("touchstart", function(e){
  let touch = e.touches[0];
  shoot({clientX: touch.clientX, clientY: touch.clientY});
});

function shoot(e){
  if(!gameRunning) return;

  let gun = guns[player.gun];
  let now = Date.now();

  if(now - lastShot < gun.fireRate) return;
  if(gun.ammo <= 0) return;

  gun.ammo--;
  lastShot = now;

  let angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);

  if(player.gun === "Shotgun"){
    for(let i = -2; i <= 2; i++){
      bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(angle + i * 0.15) * gun.speed,
        dy: Math.sin(angle + i * 0.15) * gun.speed,
        size: 6,
        damage: gun.damage
      });
    }
  }else{
    bullets.push({
      x: player.x,
      y: player.y,
      dx: Math.cos(angle) * gun.speed,
      dy: Math.sin(angle) * gun.speed,
      size: 6,
      damage: gun.damage
    });
  }
}

function spawnEnemies(){
  setInterval(function(){
    if(!gameRunning) return;

    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 25,
      speed: 1.5 + Math.random(),
      health: 60
    });
  }, 1200);
}

function spawnPickups(){
  setInterval(function(){
    if(!gameRunning) return;

    let gunNames = ["Pistol", "SMG", "Shotgun", "Sniper"];

    pickups.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      gun: gunNames[Math.floor(Math.random() * gunNames.length)]
    });
  }, 6000);
}

function update(){
  if(keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if(keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if(keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if(keys["d"] || keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(40, Math.min(canvas.width - 40, player.x));
  player.y = Math.max(60, Math.min(canvas.height - 50, player.y));

  bullets.forEach(function(b){
    b.x += b.dx;
    b.y += b.dy;
  });

  enemies.forEach(function(enemy){
    let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if(dist < player.size + enemy.size){
      player.health -= 0.5;
    }
  });

  bullets.forEach(function(bullet, bi){
    enemies.forEach(function(enemy, ei){
      let dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

      if(dist < bullet.size + enemy.size){
        enemy.health -= bullet.damage;
        bullets.splice(bi, 1);

        if(enemy.health <= 0){
          enemies.splice(ei, 1);
          score += 10;
        }
      }
    });
  });

  pickups.forEach(function(p, i){
    let dist = Math.hypot(player.x - p.x, player.y - p.y);

    if(dist < 45){
      player.gun = p.gun;
      guns[p.gun].ammo = guns[p.gun].maxAmmo;
      pickups.splice(i, 1);
    }
  });

  if(player.health <= 0){
    gameRunning = false;
    alert("Game Over! Score: " + score);
    location.reload();
  }
}

function drawPlayer(){
  let px = player.x;
  let py = player.y;

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(px, py + 35, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(px - 14, py + 12, 10, 28);
  ctx.fillRect(px + 4, py + 12, 10, 28);

  ctx.fillStyle = "#000";
  ctx.fillRect(px - 17, py + 38, 14, 7);
  ctx.fillRect(px + 3, py + 38, 14, 7);

  ctx.fillStyle = "#003cff";
  ctx.fillRect(px - 18, py - 18, 36, 35);

  ctx.fillStyle = "#111";
  ctx.fillRect(px - 13, py - 12, 26, 27);

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px - 12, py - 8);
  ctx.lineTo(px + 12, py + 12);
  ctx.moveTo(px + 12, py - 8);
  ctx.lineTo(px - 12, py + 12);
  ctx.stroke();

  ctx.fillStyle = "#003cff";
  ctx.fillRect(px - 28, py - 10, 10, 28);
  ctx.fillRect(px + 18, py - 10, 10, 28);

  ctx.fillStyle = "#000";
  ctx.fillRect(px - 30, py + 14, 12, 8);
  ctx.fillRect(px + 18, py + 14, 12, 8);

  ctx.fillStyle = "#f2c09b";
  ctx.beginPath();
  ctx.arc(px, py - 32, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(px, py - 39, 15, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.fillRect(px - 10, py - 31, 20, 8);

  ctx.fillStyle = "#00eaff";
  ctx.fillRect(px - 8, py - 33, 5, 3);
  ctx.fillRect(px + 3, py - 33, 5, 3);

  ctx.fillStyle = "#222";
  ctx.fillRect(px + 20, py - 5, 28, 6);

  ctx.fillStyle = "#555";
  ctx.fillRect(px + 44, py - 7, 8, 10);
}

function drawEnemy(enemy){
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(enemy.x, enemy.y + 24, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7a0000";
  ctx.fillRect(enemy.x - 15, enemy.y - 10, 30, 30);

  ctx.fillStyle = "#220000";
  ctx.fillRect(enemy.x - 10, enemy.y - 5, 20, 20);

  ctx.fillStyle = "#111";
  ctx.fillRect(enemy.x - 18, enemy.y + 18, 10, 20);
  ctx.fillRect(enemy.x + 8, enemy.y + 18, 10, 20);

  ctx.fillStyle = "#ffcc99";
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y - 25, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.fillRect(enemy.x - 10, enemy.y - 29, 20, 7);

  ctx.fillStyle = "white";
  ctx.font = "13px Arial";
  ctx.fillText("Enemy", enemy.x - 20, enemy.y - 42);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#237a35";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#1b5e20";
  for(let i = 0; i < 30; i++){
    ctx.fillRect(i * 80, 100, 40, canvas.height);
  }

  ctx.fillStyle = "#6b4f2a";
  ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

  pickups.forEach(function(p){
    ctx.fillStyle = "#111";
    ctx.fillRect(p.x - 35, p.y - 22, 80, 40);

    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 35, p.y - 22, 80, 40);

    ctx.fillStyle = "#ffcc00";
    ctx.font = "14px Arial";
    ctx.fillText(p.gun, p.x - 25, p.y + 3);
  });

  bullets.forEach(function(b){
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach(function(e){
    drawEnemy(e);
  });

  drawPlayer();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("❤️ Health: " + Math.floor(player.health), 20, 35);
  ctx.fillText("⭐ Score: " + score, 20, 65);
  ctx.fillText("🔫 Gun: " + player.gun, 20, 95);
  ctx.fillText("Ammo: " + guns[player.gun].ammo + "/" + guns[player.gun].maxAmmo, 20, 125);
  ctx.fillText("1 Pistol | 2 SMG | 3 Shotgun | 4 Sniper | R Reload", 20, 155);
}

function gameLoop(){
  if(!gameRunning) return;

  update();
  draw();

  requestAnimationFrame(gameLoop);
                   }
