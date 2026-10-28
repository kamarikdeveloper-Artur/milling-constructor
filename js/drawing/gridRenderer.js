import {niceGridStep} from '../core/geometry.js';
import {svgToModel,modelToSvg} from '../core/coordinates.js';
export function renderGrid(layer,view,add) {
  const step=niceGridStep(view.scale);
  const low=svgToModel({x:0,y:view.height},view), high=svgToModel({x:view.width,y:0},view);
  for(let x=Math.ceil(low.x/step)*step;x<=high.x;x+=step) {
    const p=modelToSvg({x,y:0},view);
    add(layer,'line',{x1:p.x,y1:0,x2:p.x,y2:view.height,class:'grid-line'});
  }
  for(let y=Math.ceil(low.y/step)*step;y<=high.y;y+=step) {
    const p=modelToSvg({x:0,y},view);
    add(layer,'line',{x1:0,y1:p.y,x2:view.width,y2:p.y,class:'grid-line'});
  }
  return step;
}