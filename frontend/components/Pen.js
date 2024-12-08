// src/components/Pen.js
export default class Pen {
    constructor(strokes = []) {
      this.strokes = strokes;
    }
  
    addStroke(points) {
      this.strokes.push(points);
    }
  
    pointsToSvg(points) {
      if (points.length === 0) return '';
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
      return path;
    }
  
    clear() {
      this.strokes = [];
    }
  }
  