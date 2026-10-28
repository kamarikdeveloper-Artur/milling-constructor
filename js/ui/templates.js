import {getState,updateState} from '../core/state.js';
import {validateSmile,smileDefaults} from '../templates/smile.js';
const keys=['length','depth','bottom','radiusTop','radiusBottom','center'];
export function refreshTemplates() {
  const {template,part}=getState(),active=template.type==='smile';
  document.querySelector('#template-fields').hidden=!active;
  document.querySelector('#milling-parameters').hidden=active;
  if(!active)return;
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
    updateState('template',e.target.value==='smile'?{type:'smile',...smileDefaults(state.part)}:{type:'none'});
  });
  const form=document.querySelector('#template-parameters');
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',e=>{if(keys.includes(e.target.name))updateState('template',{[e.target.name]:e.target.value});});
  document.querySelector('#template-center').addEventListener('click',()=>updateState('template',{center:getState().part.width/2}));
}
