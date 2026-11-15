const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const DBKEY='unimate_v1';
let state=JSON.parse(localStorage.getItem(DBKEY)||'{"subjects":[],"tasks":[],"attendance":{},"files":{}}');
let currentFilter='all', currentSubject=null;
const save=()=>{localStorage.setItem(DBKEY,JSON.stringify(state));renderAll()};
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=d=>d?new Date(d+'T00:00:00').toLocaleDateString('ar-EG',{day:'numeric',month:'short'}):'من غير موعد';
function go(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#pageTitle').textContent=({home:'الرئيسية',subjects:'موادي الدراسية',tasks:'مهامي',attendance:'الحضور والغياب',assistant:'المساعد الذكي'})[page];}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-goto]');if(b)go(b.dataset.goto)});
$('#todayLabel').textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('unimate_dark',document.body.classList.contains('dark'))};
if(localStorage.getItem('unimate_dark')==='true')document.body.classList.add('dark');
$('#langBtn').onclick=()=>alert('واجهة اللغة الإنجليزية هتتضاف في مرحلة الترجمة القادمة.');
function renderSubjects(){
 const list=$('#subjectsList'), home=$('#homeSubjects'), sel=$('#taskSubject');
 list.innerHTML='';sel.innerHTML='<option value="">بدون مادة محددة</option>';
 state.subjects.forEach(s=>{list.insertAdjacentHTML('beforeend',`<article class="subject-card"><div class="subject-icon">▤</div><h3>${safe(s.name)}</h3><p>${safe(s.desc||'مادتك الدراسية')}</p><div class="subject-actions"><button class="small-btn" data-files="${s.id}">📎 الملفات</button><button class="small-btn" data-delete-sub="${s.id}">حذف</button></div></article>`);sel.insertAdjacentHTML('beforeend',`<option value="${s.id}">${safe(s.name)}</option>`)});
 home.innerHTML=state.subjects.length?state.subjects.slice(0,3).map(s=>`<div class="file-item"><b>${safe(s.name)}</b><span>${(state.files[s.id]||[]).length} ملف</span></div>`).join(''):'أضف موادك عشان تبدأ تنظيمها 📚';
 $('#statSubjects').textContent=state.subjects.length;
}
function renderTasks(){
 const tasks=state.tasks.filter(t=>currentFilter==='all'||(currentFilter==='done'?t.done:!t.done)).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 $('#tasksList').innerHTML=tasks.length?tasks.map(t=>`<div class="task-row ${t.done?'completed':''}"><div class="task-main"><input class="task-check" type="checkbox" data-toggle-task="${t.id}" ${t.done?'checked':''}><div><div class="task-title">${safe(t.name)}</div><div class="task-meta">${safe(state.subjects.find(s=>s.id===t.subject)?.name||'بدون مادة')} • ${dateLabel(t.date)}</div></div></div><div class="task-actions"><button class="small-btn" data-delete-task="${t.id}">حذف</button></div></div>`).join(''):'<div class="empty-state">مفيش مهام هنا حاليًا 🌱</div>';
 const open=state.tasks.filter(t=>!t.done);$('#statDone').textContent=state.tasks.filter(t=>t.done).length;$('#statTasksHint').textContent=`من ${state.tasks.length} مهام`;
 $('#homeTasks').innerHTML=open.length?open.slice(0,3).map(t=>`<div class="file-item"><b>${safe(t.name)}</b><span>${dateLabel(t.date)}</span></div>`).join(''):'مفيش مهام لسه. أضف أول مهمة ليك ✍️';
}
function renderAttendance(){
 const box=$('#attendanceList');if(!state.subjects.length){box.innerHTML='<div class="empty-state">أضف مادة دراسية أولًا عشان تسجل الحضور.</div>';$('#statAttendance').textContent='—';return}
 let total=0,present=0;box.innerHTML=state.subjects.map(s=>{const a=state.attendance[s.id]||[];total+=a.length;present+=a.filter(x=>x==='p').length;return `<div class="attendance-row"><div><strong>${safe(s.name)}</strong><div class="task-meta">${a.filter(x=>x==='p').length} حضور • ${a.filter(x=>x==='a').length} غياب • ${a.length} محاضرة</div></div><div class="attendance-controls"><button class="present" data-att="${s.id}:p">＋ حضور</button><button class="absent" data-att="${s.id}:a">＋ غياب</button></div></div>`}).join('');
 $('#statAttendance').textContent=total?Math.round(present/total*100)+'%':'—';
}
function renderAll(){renderSubjects();renderTasks();renderAttendance()}
$('#addSubjectBtn').onclick=()=>$('#subjectDialog').showModal();
$('#subjectForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const name=$('#subjectName').value.trim();if(!name)return;state.subjects.push({id:crypto.randomUUID(),name,desc:$('#subjectDesc').value.trim()});$('#subjectDialog').close();e.target.reset();save()});
$('#addTaskBtn').onclick=()=>$('#taskDialog').showModal();
$('#taskForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const name=$('#taskName').value.trim();if(!name)return;state.tasks.push({id:crypto.randomUUID(),name,subject:$('#taskSubject').value,date:$('#taskDate').value,done:false});$('#taskDialog').close();e.target.reset();save()});
$$('.filter').forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));renderTasks()});
document.addEventListener('click',e=>{
 const f=e.target.closest('[data-files]');if(f){currentSubject=f.dataset.files;const s=state.subjects.find(x=>x.id===currentSubject);$('#filesTitle').textContent='ملفات '+s.name;renderFiles();$('#filesDialog').showModal()}
 const ds=e.target.closest('[data-delete-sub]');if(ds&&confirm('تحذف المادة وملفاتها وسجل حضورها؟')){state.subjects=state.subjects.filter(s=>s.id!==ds.dataset.deleteSub);delete state.files[ds.dataset.deleteSub];delete state.attendance[ds.dataset.deleteSub];save()}
 const dt=e.target.closest('[data-delete-task]');if(dt){state.tasks=state.tasks.filter(t=>t.id!==dt.dataset.deleteTask);save()}
 const att=e.target.closest('[data-att]');if(att){const [id,val]=att.dataset.att.split(':');(state.attendance[id]??=[]).push(val);save()}
});
document.addEventListener('change',e=>{const t=e.target.closest('[data-toggle-task]');if(t){const item=state.tasks.find(x=>x.id===t.dataset.toggleTask);if(item){item.done=t.checked;save()}}});
function renderFiles(){const files=state.files[currentSubject]||[];$('#fileList').innerHTML=files.length?files.map((f,i)=>`<div class="file-item"><span>${f.type==='application/pdf'?'📕':'🖼️'} ${safe(f.name)}</span><span><a href="${f.url}" target="_blank" rel="noopener">فتح</a> <button data-delete-file="${i}">×</button></span></div>`).join(''):'<div class="empty-state">لسه مفيش ملفات للمادة.</div>'}
$('#fileInput').addEventListener('change',async e=>{const chosen=[...e.target.files];state.files[currentSubject]??=[];for(const file of chosen){if(!(file.type==='application/pdf'||file.type.startsWith('image/')))continue;const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});state.files[currentSubject].push({name:file.name,type:file.type,url:data})}save();renderFiles();e.target.value=''});
document.addEventListener('click',e=>{const b=e.target.closest('[data-delete-file]');if(b){state.files[currentSubject].splice(Number(b.dataset.deleteFile),1);save();renderFiles()}});
$('#chatForm').onsubmit=e=>{e.preventDefault();const input=$('#chatInput'),msg=input.value.trim();if(!msg)return;$('#chatMessages').insertAdjacentHTML('beforeend',`<div class="bubble user">${safe(msg)}</div><div class="bubble bot">وصلني سؤالك ❤️ في النسخة دي واجهة المحادثة تجريبية فقط. عشان أجاوبك بإجابات ذكاء اصطناعي فعلية، لازم نوصل خدمة AI آمنة من خلال خادم backend.</div>`);input.value='';$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight};
renderAll();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
