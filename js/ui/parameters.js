import {validateDimension} from '../core/validation.js';
import {getState,updateState} from '../core/state.js';
import {formatMm} from '../core/geometry.js';
export function showStatus() {
  const el=document.querySelector('#status'),invalid=!!document.querySelector('#parameters [aria-invalid="true"]'),p=getState().part;
  el.classList.toggle('invalid',invalid);
  el.textContent=invalid?'Виправте виділені поля. Показано останні коректні значення.':`Деталь готова · ${formatMm(p.width)} × ${formatMm(p.height)} × ${formatMm(p.thickness)} мм`;
}
export function bindParameters(form) {
  document.querySelectorAll('.options input[type="checkbox"]').forEach(input=>{
    input.addEventListener('change',()=>updateState('display',{[input.name]:input.checked}));
  });
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',e=>{
    const input=e.target;
    if(!['width','height','thickness'].includes(input.name)) return;
    const result=validateDimension(input.name,input.value);
    input.setAttribute('aria-invalid',String(!!result.error));
    document.getElementById(`${input.name}-error`).textContent=result.error;
    if(!result.error) updateState('part',{[input.name]:result.value});
    showStatus();
  });
  showStatus();
}