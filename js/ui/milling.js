import {getState,updateState} from '../core/state.js';
import {validateLine} from '../core/validation.js';
import {formatMm} from '../core/geometry.js';
const keys=['x1','y1','x2','y2'];
export function refreshMilling() {
  const {part,milling}=getState(), result=validateLine(milling,part);
  for(const key of keys) {
    const input=document.getElementById(key), error=milling.enabled?(result.errors[key]||''):'';
    input.disabled=!milling.enabled;
    input.max=key.startsWith('x')?part.width:part.height;
    input.setAttribute('aria-invalid',String(!!error));
    document.getElementById(`${key}-error`).textContent=error;
  }
  const message=document.querySelector('#milling-message');
  message.classList.toggle('line-invalid',milling.enabled&&!result.value);
  if(!milling.enabled) message.textContent='Відрізок вимкнено.';
  else if(!result.value) message.textContent=result.error||'Виправте координати. Відрізок приховано.';
  else {
    const v=result.value;
    message.textContent=`Довжина відрізка: ${formatMm(Math.hypot(v.x2-v.x1,v.y2-v.y1))} мм`;
  }
}
export function bindMilling() {
  const form=document.querySelector('#milling-parameters');
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',e=>{
    const input=e.target;
    if(input.id==='milling-enabled') updateState('milling',{enabled:input.checked});
    else if(keys.includes(input.name)) updateState('milling',{[input.name]:input.value});
  });
}
