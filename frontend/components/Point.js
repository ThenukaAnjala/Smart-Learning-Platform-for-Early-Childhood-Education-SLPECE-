// src/components/Point.js
export default class Point {
    constructor(x, y, time) {
      this.x = x;
      this.y = y;
      this.time = time || new Date().getTime();
    }
  }
  