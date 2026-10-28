import {sideNames,sideDirections} from '../templates/orientation.js';
import {getState,subscribe} from '../core/state.js';
import {buildPass} from '../core/passCoordinates.js';
import {formatMm} from '../core/geometry.js';
export function bindPassDialog(){
  const dialog=document.querySelector('#pass-dialog'),body=document.querySelector('#pass-rows');
  function refresh(){
    const {part,template}=getState(),pass=buildPass(part,template);
    document.querySelector('#pass-size').textContent=`Деталь ${formatMm(part.width)} × ${formatMm(part.height)} мм · ${template.type==='chair'?'Стілець · від низу до верху':sideNames[template.side||'top']+' · '+sideDirections[template.side||'top']}`;
    document.querySelector('#pass-error').textContent=pass.error;
    document.querySelector('#pass-table').hidden=!!pass.error;
    body.replaceChildren();
    pass.points.forEach((point,index)=>{
      const row=document.createElement('tr');
      if(point.type==='MAC')row.className='arc-row';
      for(const text of [index+1,formatMm(point.x),formatMm(point.y),point.type,point.center?formatMm(point.center.x):'—',point.center?formatMm(point.center.y):'—',point.radius?formatMm(point.radius):'—',point.direction==='CW'?'За годинниковою':point.direction==='CCW'?'Проти годинникової':'—',point.label]){
        const cell=document.createElement('td');cell.textContent=text;row.append(cell);
      }
      body.append(row);
    });
  }
  document.querySelector('#show-pass').addEventListener('click',()=>{refresh();dialog.showModal();});
  document.querySelector('#close-pass').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  subscribe(()=>{if(dialog.open)refresh();});
}
