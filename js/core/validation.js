export const limits = {width:[1,10000],height:[1,10000],thickness:[0.1,1000]};
export function validateDimension(name, raw) {
  const [min,max] = limits[name];
  if (String(raw).trim() === '') return {error:'Введіть значення.'};
  const value = Number(raw);
  if (!Number.isFinite(value)) return {error:'Введіть коректне число.'};
  if (value < min || value > max) return {error:`Допустимо від ${min} до ${max} мм.`};
  return {value,error:''};
}
// A rectangle is convex, so endpoints inside it guarantee the entire segment is inside.
export function validateLine(raw,part) {
  const errors={}, values={};
  for(const key of ['x1','y1','x2','y2']) {
    const max=key.startsWith('x')?part.width:part.height;
    const text=String(raw[key]??'').trim(), value=Number(text);
    if(!text) errors[key]='Введіть координату.';
    else if(!Number.isFinite(value)) errors[key]='Введіть коректне число.';
    else if(value<0 || value>max) errors[key]=`Допустимо від 0 до ${max} мм.`;
    else values[key]=value;
  }
  const coincident=Object.keys(errors).length===0 && values.x1===values.x2 && values.y1===values.y2;
  return {errors, error:coincident?'Початок і кінець мають бути різними точками.':'',
    value:Object.keys(errors).length || coincident ? null:values};
}
