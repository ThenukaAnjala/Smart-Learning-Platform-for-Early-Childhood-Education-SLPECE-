// A simple Pen class to convert an array of points into an SVG path.
class Pen {
  pointsToSvg(points) {
    if (!points || points.length === 0) return '';
    // Start the path at the first point.
    const [first, ...rest] = points;
    let d = `M ${first.x} ${first.y}`;
    // For each subsequent point, draw a line.
    rest.forEach(pt => {
      d += ` L ${pt.x} ${pt.y}`;
    });
    return d;
  }
}

export default Pen;
