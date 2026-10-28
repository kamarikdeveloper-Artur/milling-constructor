import {getState} from '../core/state.js';
import {clientToSvg,svgToModel} from '../core/coordinates.js';
import {formatMm} from '../core/geometry.js';
export function bindEvents(svg,getView,redraw) {
  document.querySelector('#fit').addEventListener('click',redraw);
  const observer=new ResizeObserver(redraw);
  observer.observe(svg.parentElement);
  svg.addEventListener('pointermove',e=>{
    const point=clientToSvg(svg,e),view=getView();
    if(!point||!view) return;
    const p=svgToModel(point,view);
    if(getState().workspace.mode==='cutout'){p.x=Math.round(p.x);p.y=Math.round(p.y);}
    document.querySelector('#cursor').textContent=`X: ${formatMm(p.x)} · Y: ${formatMm(p.y)} мм`;
  });
  svg.addEventListener('pointerleave',()=>{document.querySelector('#cursor').textContent='X: — · Y: — мм';});
}