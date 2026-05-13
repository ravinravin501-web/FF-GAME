const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let up=false, down=false, left=false, right=false;
let running=false;
let ammo=30;

let player={
x:canvas.width/2,
y:canvas.height/2,
size:32,
speed:4,
hp:100
};

let bullets=[];
let enemies=[];

function startDrop(){
document.getElementById("lobby").style.display="none";
document.getElementById("dropScene").style.display="block";

setTimeout(()=>{
document.getElementById("dropText").innerText="Jump now!";
document.getElementById("jumper").style.display="block";
},1800);

setTimeout(()=>{
document.getElementById("dropText").innerText="Parachute opened...";
},3300);

setTimeout(()=>{
document.getElementById("dropScene").style.display="none";
document.getElementById("gameArea").style.display="block";
startGame();
},6500);
}

function startGame(){
running=true;
spawnEnemies();
loop();
}

function spawnEnemies(){
enemies=[];
for(let i=0;i<6;i++){
enemies.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:30,
speed:1.1,
hp:50
});
}
}

function shoot(){
if(!running || ammo<=0)return;
ammo--;
document.getElementById("ammo").innerText=ammo;

bullets.push({
x:player.x+player.size/2,
y:player.y,
size:6,
speed:9
});
}

function update(){
if(up)player.y-=player.speed;
if(down)player.y+=player.speed;
if(left)player.x-=player.speed;
if(right)player.x+=player.speed;

player.x=Math.max(0,Math.min(canvas.width-player.size,player.x));
player.y=Math.max(0,Math.min(canvas.height-player.size,player.y));

bullets.forEach((b,i)=>{
b.y-=b.speed;
if(b.y<0)bullets.splice(i,1);
});

enemies.forEach(e=>{
let dx=player.x-e.x;
let dy=player.y-e.y;
let d=Math.sqrt(dx*dx+dy*dy);

e.x+=(dx/d)*e.speed;
e.y+=(dy/d)*e.speed;

if(d<35){
player.hp-=1;
document.getElementById("health").innerText=player.hp;
if(player.hp<=0){
alert("You were eliminated!");
location.reload();
}
}
});

bullets.forEach((b,bi)=>{
enemies.forEach((e,ei)=>{
let dx=b.x-e.x;
let dy=b.y-e.y;
let d=Math.sqrt(dx*dx+dy*dy);

if(d<30){
e.hp-=25;
bullets.splice(bi,1);

if(e.hp<=0){
enemies.splice(ei,1);
}
}
});
});

if(enemies.length===0){
ammo+=20;
document.getElementById("ammo").innerText=ammo;
spawnEnemies();
}
}

function drawMap(){
ctx.fillStyle="#237a23";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#166116";
for(let i=0;i<30;i++){
ctx.beginPath();
ctx.arc((i*97)%canvas.width,(i*53)%canvas.height,25,0,Math.PI*2);
ctx.fill();
}

ctx.fillStyle="#5c4033";
ctx.fillRect(80,120,90,70);
ctx.fillRect(canvas.width-180,220,100,80);
ctx.fillRect(220,canvas.height-180,120,75);
}

function drawPlayer(){
ctx.fillStyle="#0066ff";
ctx.fillRect(player.x,player.y,player.size,player.size);

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.fillText("YOU",player.x,player.y-8);

ctx.fillStyle="#111";
ctx.fillRect(player.x+25,player.y+10,28,8);
}

function drawEnemies(){
enemies.forEach(e=>{
ctx.fillStyle="red";
ctx.fillRect(e.x,e.y,e.size,e.size);

ctx.fillStyle="white";
ctx.font="12px Arial";
ctx.fillText("BOT",e.x,e.y-6);
});
}

function drawBullets(){
ctx.fillStyle="yellow";
bullets.forEach(b=>{
ctx.beginPath();
ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
ctx.fill();
});
}

function loop(){
if(!running)return;

ctx.clearRect(0,0,canvas.width,canvas.height);

drawMap();
update();
drawPlayer();
drawEnemies();
drawBullets();

requestAnimationFrame(loop);
}

document.addEventListener("keydown",e=>{
if(e.key==="w")up=true;
if(e.key==="s")down=true;
if(e.key==="a")left=true;
if(e.key==="d")right=true;
if(e.key===" ")shoot();
});

document.addEventListener("keyup",e=>{
if(e.key==="w")up=false;
if(e.key==="s")down=false;
if(e.key==="a")left=false;
if(e.key==="d")right=false;
});
