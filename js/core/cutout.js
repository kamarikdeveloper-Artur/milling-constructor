export function cutoutFits(c,p){return ['width','height','left','bottom'].every(k=>Number.isFinite(c[k]))&&c.width>0&&c.height>0&&c.left>=0&&c.bottom>=0&&c.left+c.width<=p.width+1e-9&&c.bottom+c.height<=p.height+1e-9;}
export function cutoutOffsets(c,p){return {left:c.left,right:p.width-c.width-c.left,top:p.height-c.height-c.bottom,bottom:c.bottom};}
export function moveCutout(c,p,left,bottom){return {...c,left:Math.max(0,Math.min(left,p.width-c.width)),bottom:Math.max(0,Math.min(bottom,p.height-c.height))};}
export function editCutout(c,p,key,value){
 if(String(value).trim()===''||!Number.isFinite(Number(value)))return {error:'Введіть коректне число.'};
 const n=Number(value);if(n<0||(['width','height'].includes(key)&&n===0))return {error:'Розміри мають бути більші за 0, відступи — не менші за 0.'};
 const next={...c};
 if(key==='right')next.left=p.width-c.width-n;
 else if(key==='top')next.bottom=p.height-c.height-n;
 else next[key]=n;
 if(['width','height'].includes(key)){
  if(next.width>p.width||next.height>p.height)return {error:'Виріз більший за деталь.'};
  Object.assign(next,moveCutout(next,p,next.left,next.bottom));
 }
 return cutoutFits(next,p)?{value:next,error:''}:{error:'Відступ виводить виріз за межі деталі.'};
}
