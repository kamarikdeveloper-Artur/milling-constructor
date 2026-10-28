export function fitViewport(width,height,part) {
  const margin=Math.min(80,width*.22,height*.22);
  const scale=Math.min((width-2*margin)/part.width,(height-2*margin)/part.height);
  return {width,height,scale,origin:{x:(width-part.width*scale)/2,y:(height+part.height*scale)/2}};
}