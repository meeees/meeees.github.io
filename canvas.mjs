
import { Bug } from './bug.mjs';

var canvas; 
var dContext;
var bugs;
var curTime;
export const WIDTH = 400;
export const HEIGHT = 400;
const bugCountMin = 8;
export const bugCountMax = 16;

function tick(dt) {
    var trySpawnKids = 0;
    for(var i = 0; i < bugs.length; i++)
    {
        var b = bugs[i];
        b.tick(dt);
        if(b.dead) {
            bugs.splice(i, 1);
            trySpawnKids++;
        }
    }
    for(var i = 0; i < trySpawnKids; i++)
    {
        if(Math.random() > 0.5 && bugs.length < bugCountMax)
        {
            var b = new Bug(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT))
            bugs.push(b);
            console.log("Dead bug had first kid");
            if(Math.random() > 0.5 && bugs.length < bugCountMax)
            {
                var b = new Bug(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT))
                bugs.push(b);
                console.log("Dead bug had second kid");
            }
        }
        else {
            console.log("Dead bug had no kids");
        }
    }
    if(bugs.length < bugCountMin) {
        var b = new Bug(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT))
        bugs.push(b);
        console.log("Adding bug to keep min");
    }
}

function draw() {
    dContext.clearRect(0, 0, WIDTH, HEIGHT);
    for(var i = 0; i < bugs.length; i++)
    {
        var b = bugs[i];
        b.draw(dContext);
    }
}

function loop() {
    var newTime = Date.now();
    var passedTime = newTime - curTime;
    curTime = newTime;
    tick(passedTime);
    draw();
    window.requestAnimationFrame(loop);
}

function init() {
    bugs = [];
    for (var i = 0; i < (bugCountMin + bugCountMax) / 2; i++)
    {
        var b = new Bug(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT))
        bugs.push(b);
    }
}

function run() {
    canvas = document.getElementById("myCanvas");
    dContext = canvas.getContext("2d");
    dContext.moveTo(0, 0);
    dContext.lineTo(200, 100);
    dContext.stroke();
    init();
    curTime = Date.now();
    window.requestAnimationFrame(loop);
}

export { run };