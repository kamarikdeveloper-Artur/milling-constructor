import {getState,updateState} from '../core/state.js';
import {cutoutFits,cutoutOffsets,editCutout,moveCutout} from '../core/cutout.js';
import {clientToSvg,svgToModel} from '../core/coordinates.js';
let inputError='';
export function refreshCutout(){
 const s=getState(),active=s.workspace.mode==='cutout';
 document.querySelector('#cutout-parameters').hidden=!active;
 document.querySelector('#template-parameters').hidden=active;
 if(active)document.querySelector('#milling-parameters').hidden=true;
 document.querySelector('#show-pass').hidden=active;
 if(!active)return;
 const values={...s.cutout,...cutoutOffsets(s.cutout,s.part)};
 for(const [key,value] of Object.entries(values)){
  const input=document.getElementById(`cutout-${key}`);
  if(input&&input!==document.activeElement)input.value=Math.round(value);
 }
 document.querySelector('#cutout-message').textContent=inputError||(!cutoutFits(s.cutout,s.part)?'Виріз не поміщається. Зменште його розміри або розташуйте по центру.':'Відступи оновлюються автоматично. Розміри вирізу при переміщенні не змінюються.');
}
export function bindCutout(svg,getView){
 document.querySelectorAll('[name="workspace-mode"]').forEach(el=>el.addEventListener('change',()=>updateState('workspace',{mode:el.value})));
 const form=document.querySelector('#cutout-parameters');
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('input',e=>{
  const input=e.target,s=getState();
  if(!input.name)return;
  const result=editCutout(s.cutout,s.part,input.name,input.value);
  inputError=result.error;input.setAttribute('aria-invalid',String(!!result.error));
  if(result.value)updateState('cutout',result.value);else refreshCutout();
 });
 form.addEventListener('focusout',()=>refreshCutout());
 document.querySelector('#cutout-center').addEventListener('click',()=>{
  const {part,cutout}=getState();
  if(cutout.width>part.width||cutout.height>part.height){inputError='Спочатку зменште розміри вирізу.';refreshCutout();return;}
  inputError='';form.querySelectorAll('[aria-invalid]').forEach(el=>el.setAttribute('aria-invalid','false'));
  updateState('cutout',{...moveCutout(cutout,part,Math.round((part.width-cutout.width)/2),Math.round((part.height-cutout.height)/2))});
 });
 let drag=null;
 svg.addEventListener('pointerdown',e=>{
  if(e.button!==0||!e.target.closest('.position-cutout'))return;
  const s=getState(),view=getView(),point=clientToSvg(svg,e);
  if(s.workspace.mode!=='cutout'||!point||!view)return;
  drag={id:e.pointerId,start:svgToModel(point,view),cutout:s.cutout};
  svg.setPointerCapture(e.pointerId);e.preventDefault();
 });
 svg.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const {part,workspace}=getState(),view=getView(),point=clientToSvg(svg,e);
  if(!view||!point||workspace.mode!=='cutout')return;
  const pos=svgToModel(point,view);inputError='';
  updateState('cutout',moveCutout(drag.cutout,part,Math.round(drag.cutout.left+pos.x-drag.start.x),Math.round(drag.cutout.bottom+pos.y-drag.start.y)));
 });
 const stop=e=>{if(drag&&e.pointerId===drag.id){drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}};
 svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);svg.addEventListener('lostpointercapture',()=>{drag=null;});
}
