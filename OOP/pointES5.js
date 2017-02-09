let Point = (function () {
    function constructor(x, y){
        this.x = x
        this.y = y
    }

    constructor.distance = function (a, b) {
        return a.distanceTo(b)
    }

    Object.defineProperty(constructor.prototype, 'distanceTo', {
        value: function distanceTo(point) {
            var x = Math.abs(this._x - point._x);
            var y = Math.abs(this._y - point._y);
            return Math.sqrt(x * x + y * y);
        },
        writable: false,
        enumerable: false
    })

    Object.defineProperty(constructor.prototype, 'x', {
        get: function () {
            return this._x
        },
        set: function (value) {
            if (typeof value !== 'number'){
                throw new Error('Point parameters must be number!!')
            }
            this._x = value
        },
        enumerable: false
    })

    Object.defineProperty(constructor.prototype, 'y', {
        get: function () {
            return this._y
        },
        set: function (value) {
            if (typeof value !== 'number'){
                throw new Error('Point parameters must be number!!')
            }
            this._y = value
        },
        enumerable: false
    })

    Object.defineProperty(constructor.prototype, 'print', {
        value: function () {
            console.log(`(x: ${this._x}, y: ${this._y})`)
        },
        writable: false,
        enumerable: false
    })

    return  constructor
})()

let point = new Point(10, 10)
let point1 = new Point(5, 10)
console.log(point.distanceTo(point1))
console.log(Point.distance(point, point))
for(let element in point){
    console.log(point[element])
}