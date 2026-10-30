import {getState,subscribe} from '../core/state.js';
import {createTcn} from '../postprocessor/tcn.js';
import {sideNames} from '../templates/orientation.js';
export function bindTcnExport(){
 const dialog=document.querySelector('#tcn-dialog'),form=document.querySelector('#tcn-options');
 const preview=document.querySelector('#tcn-preview'),message=document.querySelector('#tcn-message'),download=document.querySelector('#tcn-download');
 const button=document.querySelector('#show-tcn');
 function options(){return Object.fromEntries(new FormData(form).entries());}
 function refresh(){
  const state=getState();
  button.hidden=state.workspace.mode!=='milling'||state.template.type!=='smile';
  if(!dialog.open)return;
  try{
   const result=createTcn(state,options());preview.value=result.text;download.disabled=false;
   message.textContent=`${state.part.width} × ${state.part.height} × ${state.part.thickness} мм · ${sideNames[state.template.side||'top']} · фреза ${result.options.tool} (Ø ${result.options.diameter} мм) · Z = −${result.options.depth} мм · ${result.points.length-1} рухів · #40=${result.compensation}${result.reversed?' · прохід розвернуто':''}. ${result.warnings.join(' ')}`;
  }catch(error){preview.value='';download.disabled=true;message.textContent=error.message;}
 }
 button.addEventListener('click',()=>{dialog.showModal();refresh();});
 document.querySelector('#close-tcn').addEventListener('click',()=>dialog.close());
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',refresh);
 document.querySelector('#tcn-tool-preset').addEventListener('change',e=>{
  if(e.target.value==='1011'){form.elements.tool.value=1011;form.elements.diameter.value=18.4;}
  if(e.target.value==='1012'){form.elements.tool.value=1012;form.elements.diameter.value=6;}
  refresh();
 });
 download.addEventListener('click',()=>{
  try{
   const state=getState(),result=createTcn(state,options());
   const blob=new Blob([result.text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download=`smile_${state.part.width}x${state.part.height}_${state.template.side||'top'}_T${result.options.tool}_TEST.TCN`;
   dialog.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   message.textContent='TCN завантажено. Спочатку перевірте відкриття, інструмент, компенсацію, Z та траєкторію у програмі верстата.';
  }catch(error){download.disabled=true;message.textContent=error.message;}
 });
 subscribe(refresh);refresh();
}
