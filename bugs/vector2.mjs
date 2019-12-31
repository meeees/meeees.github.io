class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v2) {
        return new Vector2(this.x + v2.x, this.y + v2.y);
    }

    sub(v2) {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    scale(amt) {
        return new Vector2(this.x * amt, this.y * amt);
    }

    normalize() {
        var mag = this.magnitude();
        return new Vector2(this.x / mag, this.y / mag);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    asInts() {
        return [Math.round(this.x), Math.round(this.y)];
    }

    normalTo() {
        return new Vector2(-this.y, this.x).normalize();
    }

    static distance(v1, v2) {
        return Math.sqrt(Math.pow((v1.x - v2.x), 2) + Math.pow(v1.y - v2.y, 2));
    }
}

export {Vector2}