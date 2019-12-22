import {WIDTH, HEIGHT, bugCountMax} from './canvas.mjs';
import {Vector2} from './vector2.mjs';

const maxAge = 16;

class Bug {
    
    radius = 7;
    trailLength = 7;
    waggleScale = 0.5;
    speed = 0.8;
    trail = [];
    pathDelta = 50;
    remToPath = this.pathDelta;
    lifetime = 0;

    constructor(x, y, size) {
        this.pos = new Vector2(x, y);
        // randomize the waggles
        this.lifetime = Math.floor(Math.random() * 200);
        this.radius -= Math.floor(Math.random() * 4);
        this.trailLength = this.radius;
        this.ageEvery = Math.floor(Math.random() * 3000) + 0;
        this.ageTimer = this.ageEvery;
        this.maxAge = 16 + Math.floor(Math.random() * 3);
        this.dead = false;
        this.color = 'rgb(' + Math.floor(Math.random() * 100) + ',' + Math.floor(Math.random() * 100) + ','
         + Math.floor(Math.random() * 100) + ')';
        this.chooseGoal();
        
    }

    pathOffset(delta, offset)
    {
        return delta.normalTo().scale(Math.sin(offset) * this.waggleScale)
 
    }

    drawCircle(cxt, pos, rad) 
    {
        var hr = rad / 2;
        cxt.beginPath();
        cxt.arc(pos.x - hr, pos.y - hr, rad, 0, 2 * Math.PI);
        cxt.stroke();
    }

    draw(cxt) {
        cxt.strokeStyle = this.color;
        if (this.dead) {
            return;
        }
        for (var i = 0; i < this.trail.length; i++)
        {
            var from = this.trail[i];
            this.drawCircle(cxt, from, this.radius * (i / this.trailLength))
        }
        var pos = this.pos;
        cxt.beginPath();
        cxt.arc(pos.x - this.radius / 2, pos.y - this.radius / 2, this.radius, 0, 2 * Math.PI);
        cxt.stroke();
    }

    ageTick() {
        this.radius += 1;
        this.trailLength += 1;
        if (this.radius > this.maxAge) {
            this.dead = true;
        }
    }

    tick(dt) {
        if(this.dead) {
            return;
        }
        if (this.atGoal()) {
            this.chooseGoal();
        }
        //console.log(dt);
        var dif = this.goal.sub(this.pos).normalize();
        var deltas = dif.scale(this.speed);
        this.remToPath -= dt;
        this.lifetime += dt;
        this.ageTimer -= dt;
        if(this.remToPath <= 0) {
            this.remToPath = this.pathDelta; 
            this.trail.push(this.pos);
        }
        if(this.ageTimer <= 0) {
            this.ageTick();
            this.ageTimer = this.ageEvery;
        }
        this.move(deltas);
        if(this.trail.length > this.trailLength) {
            this.trail.shift();
        }
    }

    chooseGoal() {
        var hr = Math.round(this.radius / 2);
        this.goal = new Vector2(hr + Math.floor(Math.random() * (WIDTH - this.radius)),
         hr + Math.floor(Math.random() * (HEIGHT - this.radius)));
    }

    atGoal() {
        return Vector2.distance(this.pos, this.goal) < 2;
    }

    move(deltas) {
        var start = this.pos
        this.pos = this.pos.add(deltas);
        this.boundsCheck();
        if(deltas.magnitude() == 0)
        {
            return;
        }
        // waggle 1
        this.pos = this.pos.add(this.pathOffset(deltas, this.lifetime / 200));
   }

    boundsCheck() {
        var hr = this.radius / 2;
        if(this.pos.x < hr) {
            this.pos.x = hr;
        }
        if (this.pos.x >= WIDTH - hr) {
            this.pos.x = WIDTH - hr -1;
        }
        if (this.pos.y < hr) {
            this.pos.y = hr;
        }
        if (this.pos.y >= HEIGHT - hr) {
            this.pos.y = HEIGHT - hr - 1;
        }
    }
}

export { Bug }