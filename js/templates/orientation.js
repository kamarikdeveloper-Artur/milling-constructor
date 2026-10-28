export const sideNames={top:'Зверху',bottom:'Знизу',left:'Зліва',right:'Справа'};
export function localPart(part,side='top') {return side==='left'||side==='right'?{...part,width:part.height,height:part.width}:{...part};}
// Pure rotations preserve circular radii and CW/CCW directions.
export function orientPoint(point,part,side='top'){
 const {x,y}=point;
 if(side==='left')return {x:part.width-y,y:x};
 if(side==='right')return {x:y,y:part.height-x};
 if(side==='bottom')return {x:part.width-x,y:part.height-y};
 return {x,y};
}
export const sideDirections={top:'зліва направо',left:'знизу вгору',right:'зверху вниз',bottom:'справа наліво'};
