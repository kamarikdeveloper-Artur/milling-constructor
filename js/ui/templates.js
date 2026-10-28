import {chairDefaults,validateChair} from '../templates/chair.js';
import {localPart} from '../templates/orientation.js';
import {getState,updateState} from '../core/state.js';
import {validateSmile,smileDefaults} from '../templates/smile.js';
const keys=['length','depth','bottom','radiusTop','radiusBottom','center'];
export function refreshTemplates() {
  const {template,part}=getState(),active=template.type==='smile';
  document.querySelector('#template-fields').hidden=!active;
  document.querySelector('#milling-parameters').hidden=template.type!=='none';
  const chair=template.type==='chair';
  document.querySelector('#chair-fields').hidden=!chair;
  if(chair){
   const result=validateChair(template,part);
   for(const key of ['seatHeight','seatLength','jointRight','topRight']){
    const input=document.getElementById(`chair-${key}`),error=result.errors[key]||'';
    if(document.activeElement!==input)input.value=template[key];
    input.setAttribute('aria-invalid',String(!!error));document.getElementById(`chair-${key}-error`).textContent=error;
   }
   document.querySelector('#chair-message').textContent=result.value?'Чотири точки · три прямі ML.':'Виправте параметри. Ламану приховано.';
  }
  if(!active)return;
  const side=template.side||'top';
  document.querySelector('#smile-side').value=side;
  document.querySelector('#smile-position-note').textContent=side==='top'?'Центр від лівого краю; прохід зліва направо.':side==='left'?'Центр від нижнього краю; прохід знизу вгору.':side==='right'?'Центр від верхнього краю; прохід зверху вниз.':'Центр від правого краю; прохід справа наліво.';
  const result=validateSmile(template,part);
  for(const key of keys){
    const input=document.getElementById(`smile-${key}`),error=result.errors[key]||'';
    if(document.activeElement!==input)input.value=template[key];
    input.setAttribute('aria-invalid',String(!!error));
    document.getElementById(`smile-${key}-error`).textContent=error;
  }
  const message=document.querySelector('#template-message');
  message.classList.toggle('line-invalid',!result.value);
  message.textContent=result.value?'Шаблон застосовано. Розміри ручки зберігаються при зміні деталі.':'Виправте параметри. Виріз тимчасово приховано.';
}
export function bindTemplates(){
  document.querySelector('#template-type').addEventListener('change',e=>{
    if(e.target.name!=='template-choice')return;
    const state=getState();
    updateState('template',e.target.value==='smile'?{type:'smile',...smileDefaults(state.part)}:e.target.value==='chair'?{type:'chair',...chairDefaults(state.part)}:{type:'none'});
  });
  document.querySelector('#smile-side').addEventListener('change',e=>{
    const {part,template}=getState(),side=e.target.value;
    updateState('template',{side,center:localPart(part,side).width/2});
  });
  const form=document.querySelector('#template-parameters');
  document.querySelector('#chair-sketch').addEventListener('click',()=>{
    updateState('part',{width:700,height:1000});
    document.querySelector('#width').value=700;document.querySelector('#height').value=1000;
    for(const key of ['width','height']){document.getElementById(key).setAttribute('aria-invalid','false');document.getElementById(`${key}-error`).textContent='';}
    updateState('template',{type:'chair',seatHeight:500,seatLength:300,jointRight:200,topRight:100});
  });
  form.addEventListener('input',e=>{if(['seatHeight','seatLength','jointRight','topRight'].includes(e.target.name))updateState('template',{[e.target.name]:e.target.value});});
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',e=>{if(keys.includes(e.target.name))updateState('template',{[e.target.name]:e.target.value});});
  document.querySelector('#template-center').addEventListener('click',()=>updateState('template',{center:localPart(getState().part,getState().template.side).width/2}));
}
