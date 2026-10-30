// Plain numeric text for pasting into coordinate fields: no units or grouping.
export function coordinateText(value){return String(Number(value.toFixed(2)));}
export async function copyText(text,container){
  if(globalThis.navigator?.clipboard?.writeText){
    try{await navigator.clipboard.writeText(text);return;}catch{/* Try local selection copy. */}
  }
  const previous=document.activeElement,field=document.createElement('textarea');
  field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;opacity:0;pointer-events:none;';
  container.append(field);field.focus();field.select();
  try{if(!document.execCommand('copy'))throw new Error('Copy unavailable');}
  finally{field.remove();previous?.focus({preventScroll:true});}
}
