// Model: millimetres, bottom-left origin, Y upward. SVG: Y downward.
export function modelToSvg({x,y},view) {
  return {x:view.origin.x+x*view.scale,y:view.origin.y-y*view.scale};
}
export function svgToModel({x,y},view) {
  return {x:(x-view.origin.x)/view.scale,y:(view.origin.y-y)/view.scale};
}
export function clientToSvg(svg,event) {
  const matrix=svg.getScreenCTM();
  return matrix ? new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()) : null;
}