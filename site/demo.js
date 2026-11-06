// A small adaptation of TypeStage's one-letter switches with actual source profiles.
// No chat, persistence, graph request or full React component is embedded.
const data=JSON.parse(document.querySelector('#profile-data').textContent);
const buttons=[...document.querySelectorAll('[data-dimension]')];
const pairs=['EI','SN','TF','JP'];let code='INFP';
function render(){
 const p=data.profiles.find(p=>p.type===code);
 document.querySelector('#type-code').textContent=p.type;
 document.querySelector('#type-title').textContent=p.title;
 const img=document.querySelector('#type-art');img.src=data.prefix+p.image;img.alt=p.type+' '+p.title;
 document.querySelector('#type-stack').textContent=p.cognitiveFunctions.split(' ').join(' → ');
 const colors={purple:'#6b3fa0',green:'#2f7d52',blue:'#2b56a8',yellow:'#b58121'};
 document.querySelector('.stage').style.setProperty('--group',colors[p.color]||'#111');
 buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(code[i]===pairs[i][1]));b.dataset.side=code[i]===pairs[i][1]?'right':'left';});
}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{code=code.slice(0,i)+pairs[i][code[i]===pairs[i][0]?1:0]+code.slice(i+1);render();}));render();
