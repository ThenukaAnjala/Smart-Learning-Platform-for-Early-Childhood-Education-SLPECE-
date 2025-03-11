// frontend/components/Pen.js

export default class Pen {
  pointsToSvg(points) {
    if (!points || points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  }
}
