import {validateSmile,smileGeometry} from '../templates/smile.js';
export function buildPass(part,template) {
  if(template.type!=='smile')return {error:'Спочатку виберіть шаблон «Ручка посмішка».',points:[]};
  const result=validateSmile(template,part);
  if(!result.value)return {error:'Виправте параметри ручки, щоб отримати координати.',points:[]};
  const geometry=smileGeometry(result.value,part),p=geometry.points;
  const points=[{x:0,y:part.height,type:'Початок',label:'Верхній лівий кут деталі'}];
  const append=(point,type,label,radius=0,center=null,direction=null)=>{
    const last=points.at(-1);
    if(Math.hypot(last.x-point.x,last.y-point.y)<1e-9)return;
    points.push({...point,type,label,radius,center,direction});
  };
  append(p[0],'ML','Початок вирізу ручки');
  if(geometry.radiusTop)append(p[1],'MAC','Верхнє ліве заокруглення',geometry.radiusTop,{x:p[0].x,y:part.height-geometry.radiusTop},'CW');
  append(p[2],'ML',geometry.radiusBottom?'До нижнього лівого заокруглення':'Лівий початок плоского дна');
  if(geometry.radiusBottom)append(p[3],'MAC','Лівий початок плоского дна',geometry.radiusBottom,{x:p[3].x,y:p[3].y+geometry.radiusBottom},'CCW');
  append(p[4],'ML','Правий кінець плоского дна');
  if(geometry.radiusBottom)append(p[5],'MAC','Нижнє праве заокруглення',geometry.radiusBottom,{x:p[4].x,y:p[4].y+geometry.radiusBottom},'CCW');
  append(p[6],'ML',geometry.radiusTop?'До верхнього правого заокруглення':'Вихід ручки на верхній край');
  if(geometry.radiusTop)append(p[7],'MAC','Вихід ручки на верхній край',geometry.radiusTop,{x:p[7].x,y:part.height-geometry.radiusTop},'CW');
  append({x:part.width,y:part.height},'ML','Верхній правий кут деталі');
  return {error:'',points};
}
