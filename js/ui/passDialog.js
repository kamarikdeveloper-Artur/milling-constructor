import {coordinateText,copyText} from './clipboard.js';
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
    document.querySelector('#pass-copy-status').textContent='Натисніть на число, щоб скопіювати. Десятковий роздільник при копіюванні — крапка.';
    pass.points.forEach((point,index)=>{
      const row=document.createElement('tr');
      if(point.type==='MAC')row.className='arc-row';
      const values=[index+1,formatMm(point.x),formatMm(point.y),point.type,point.center?formatMm(point.center.x):'—',point.center?formatMm(point.center.y):'—',point.radius?formatMm(point.radius):'—',point.direction==='CW'?'За годинниковою':point.direction==='CCW'?'Проти годинникової':'—',point.label];
      const numeric={1:point.x,2:point.y,...(point.center?{4:point.center.x,5:point.center.y}:{}),...(point.radius?{6:point.radius}:{})};
      const names={1:'X1',2:'Y1',4:'CX1',5:'CY1',6:'R1'};
      values.forEach((text,column)=>{
        const cell=document.createElement('td');
        if(Object.hasOwn(numeric,column)){
          const button=document.createElement('button');button.type='button';button.className='copy-coordinate';
          button.textContent=text;button.dataset.copy=coordinateText(numeric[column]);button.dataset.coordinate=names[column];
          button.title=`Скопіювати ${names[column]}: ${button.dataset.copy}`;
          button.setAttribute('aria-label',button.title);cell.append(button);
        }else cell.textContent=text;
        row.append(cell);
      });
      body.append(row);
    });
  }
  body.addEventListener('click',async event=>{
    const button=event.target.closest('.copy-coordinate');if(!button)return;
    const status=document.querySelector('#pass-copy-status');
    try{
      await copyText(button.dataset.copy,dialog);
      body.querySelectorAll('.copied').forEach(el=>el.classList.remove('copied'));
      button.classList.add('copied');
      status.textContent=`Скопійовано ${button.dataset.coordinate}: ${button.dataset.copy}`;
    }catch{status.textContent='Не вдалося скопіювати автоматично. Спробуйте виділити число й натиснути Ctrl+C.';}
  });
  document.querySelector('#show-pass').addEventListener('click',()=>{refresh();dialog.showModal();});
  document.querySelector('#close-pass').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  subscribe(()=>{if(dialog.open)refresh();});
}
