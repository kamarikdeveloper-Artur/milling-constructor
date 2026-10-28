export function chairDefaults(part){return {seatHeight:Math.round(part.height*.5),seatLength:Math.round(part.width*3/7),jointRight:Math.round(part.width*2/7),topRight:Math.round(part.width/7)};}
export function validateChair(raw,part){
 const v={},errors={};
 for(const key of ['seatHeight','seatLength','jointRight','topRight']){
  const text=String(raw[key]??'').trim(),n=Number(text);
  if(!text||!Number.isFinite(n))errors[key]='Введіть коректне число.';
  else if(n<0)errors[key]='Значення не може бути від’ємним.';else v[key]=n;
 }
 if(Object.keys(errors).length)return {errors,value:null};
 if(v.seatHeight<=0||v.seatHeight>=part.height)errors.seatHeight='Висота сидіння має бути між 0 та висотою деталі.';
 if(v.seatLength<=0)errors.seatLength='Довжина сидіння має бути більшою за 0.';
 if(v.jointRight>=part.width||v.seatLength+v.jointRight>part.width)errors.seatLength='Горизонтальна ділянка виходить за лівий край.';
 if(v.topRight>=v.jointRight)errors.topRight='Верхній відступ справа має бути меншим за відступ біля сидіння.';
 return {errors,value:Object.keys(errors).length?null:v};
}
export function chairPoints(v,part){
 const joint=part.width-v.jointRight,left=joint-v.seatLength;
 return [{x:left,y:0},{x:left,y:v.seatHeight},{x:joint,y:v.seatHeight},{x:part.width-v.topRight,y:part.height}];
}
export function chairPass(part,template){
 const result=validateChair(template,part);
 if(!result.value)return {error:'Виправте параметри шаблону «Стілець».',points:[]};
 const labels=['Початок на нижньому краї','Підйом до сидіння','Кінець горизонтальної ділянки','Похила ділянка до верхнього краю'];
 return {error:'',points:chairPoints(result.value,part).map((point,index)=>({...point,type:index?'ML':'Початок',label:labels[index],radius:0,center:null,direction:null}))};
}
