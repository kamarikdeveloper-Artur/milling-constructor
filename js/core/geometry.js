export function rectangleCorners({width,height}) {
  return [{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
}
export function niceGridStep(scale) {
  const target=48/scale, power=10**Math.floor(Math.log10(target));
  return [1,2,5,10].map(n=>n*power).find(n=>n>=target);
}
export const formatMm=value=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:2}).format(value);