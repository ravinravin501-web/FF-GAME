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

  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

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

    if(dist < player.size + 30){
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

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#237a35";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#1b5e20";
  for(let i = 0; i < 30; i++){
    ctx.fillRect(i * 80, 100, 40, canvas.height);
  }

  ctx.fillStyle = "#00d9ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("🧍", player.x - 12, player.y + 8);

  ctx.fillStyle = "#ffcc00";
  bullets.forEach(function(b){
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach(function(e){
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Enemy", e.x - 20, e.y - 30);
  });

  pickups.forEach(function(p){
    ctx.fillStyle = "#111";
    ctx.fillRect(p.x - 30, p.y - 20, 75, 35);

    ctx.fillStyle = "#ffcc00";
    ctx.font = "14px Arial";
    ctx.fillText(p.gun, p.x - 24, p.y + 3);
  });

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
