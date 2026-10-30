import {buildPass} from '../core/passCoordinates.js';
const fixed=n=>{if(!Number.isFinite(n))throw new Error('Некоректне число в траєкторії.');return (Math.abs(n)<0.0005?0:n).toFixed(3);};
export function reversePass(points){
 return [...points].reverse().map((point,i)=>{
  if(i===0)return {...point,type:'Початок',center:null,direction:null,radius:0};
  const edge=points[points.length-i];
  return {...point,type:edge.type,center:edge.center?{...edge.center}:null,radius:edge.radius||0,direction:edge.direction==='CW'?'CCW':edge.direction==='CCW'?'CW':null};
 });
}
export function createTcn(state,raw){
 if(state.workspace.mode!=='milling'||state.template.type!=='smile')throw new Error('Перший профіль експорту підтримує лише «Ручку посмішку» в режимі фрезерування.');
 const options={};
 for(const key of ['tool','diameter','depth','leadIn','leadOut']){
  if(String(raw[key]??'').trim()===''||!Number.isFinite(Number(raw[key])))throw new Error('Заповніть усі числові параметри експорту.');
  options[key]=Number(raw[key]);
 }
 if(!Number.isSafeInteger(options.tool)||options.tool<=0)throw new Error('Код фрези має бути додатним цілим числом.');
 if(options.diameter<=0||options.depth<=0||options.leadIn<0||options.leadOut<0)throw new Error('Діаметр і глибина мають бути додатними, захід/вихід — не меншими за 0.');
 if(!['left','center','right'].includes(raw.compensation))throw new Error('Виберіть компенсацію.');
 for(const n of ['width','height','thickness'])if(!Number.isFinite(state.part[n])||state.part[n]<=0)throw new Error('Перевірте габарити деталі.');
 const pass=buildPass(state.part,state.template);
 if(pass.error)throw new Error(pass.error);
 let points=pass.points.map(point=>({...point,center:point.center?{...point.center}:null}));
 const reversed=raw.compensation==='right';
 if(reversed)points=reversePass(points);
 const tangents={top:{x:1,y:0},bottom:{x:-1,y:0},left:{x:0,y:1},right:{x:0,y:-1}};
 const t=tangents[state.template.side||'top'];if(!t)throw new Error('Невідома сторона ручки.');
 const sign=reversed?-1:1,dx=t.x*sign,dy=t.y*sign;
 const first=points[0],last=points.at(-1);
 // Extend along the chosen edge, keeping corner endpoints when needed for arcs.
 if(options.leadIn>0)points.unshift({...first,x:first.x-dx*options.leadIn,y:first.y-dy*options.leadIn});
 if(points.length>1)points[1]={...points[1],type:options.leadIn>0?'ML':points[1].type};
 if(options.leadOut>0)points.push({...last,x:last.x+dx*options.leadOut,y:last.y+dy*options.leadOut,type:'ML',center:null,direction:null,radius:0});
 // Remove only redundant straight intermediate points, never an arc endpoint.
 for(let i=1;i<points.length-1;){
  const a=points[i-1],b=points[i],c=points[i+1];
  const cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
  const dot=(b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y);
  if(b.type==='ML'&&c.type==='ML'&&Math.abs(cross)<1e-9&&dot>=0)points.splice(i,1);else i++;
 }
 const {width,height,thickness}=state.part,z=-options.depth;
 const header=['TPA\\ALBATROS\\EDICAD\\02.00',`$=0No: 1 | name: milling-constructor | ${width}/${width} * ${height}/${height} * ${thickness} | 1 pcs`,
 '::SIDE=1;',`::UNm DL=${width.toFixed(3)} DH=${height.toFixed(3)} DS=${thickness.toFixed(3)}`,'OFFS{',...Array.from({length:8},(_,i)=>`#${i}=0|0`),'}OFFS',
 ...['VARV','VAR','SPEC','OPTI','LINK','PREV'].flatMap(name=>[name+'{','}'+name]),'SIDE#1{'];
 const lines=[...header];
 points.forEach((point,i)=>{
  lines.push(i===0?'W#89{ ::WTs':point.type==='MAC'?'W#2101{ ::WTa':'W#2201{ ::WTl',`#1=${fixed(point.x)}`,`#2=${fixed(point.y)}`,`#3=${fixed(z)}`);
  if(i===0)lines.push('#201=1','#203=1',`#205=${options.tool}`,`#40=${raw.compensation==='center'?0:1}`);
  else if(point.type==='MAC'){
   const start=points[i-1],center=point.center;
   for(const q of [start,point])if(Math.abs(Math.hypot(q.x-center.x,q.y-center.y)-point.radius)>1e-6)throw new Error('Дуга не проходить перевірку радіуса.');
   lines.push(`#31=${fixed(center.x-start.x)}`,`#32=${fixed(center.y-start.y)}`,`#34=${point.direction==='CW'?0:1}`);
  }
  lines.push('#8015=0','}W');
 });
 lines.push('}SIDE',...Array.from({length:5},(_,i)=>[`SIDE#${i+2}{`,'}SIDE']).flat());
 const warnings=[];
 if(raw.compensation!=='center'&&Number(state.template.radiusBottom)<options.diameter/2)warnings.push('Внутрішній радіус менший за радіус фрези: можливе недофрезерування або помилка компенсації.');
 if(options.leadIn<options.diameter/2||options.leadOut<options.diameter/2)warnings.push('Захід або вихід коротший за радіус фрези. Перевірте достатність підходу у програмі верстата.');
 return {text:lines.join('\r\n')+'\r\n',points,options,warnings,reversed,compensation:raw.compensation==='center'?0:1};
}
