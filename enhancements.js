/* UniMate Phase 4 — notes, richer tasks, calendar */
(() => {
  const $ = s => document.querySelector(s);
  let editingTaskId = null, notesSubjectId = null, calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const safeText = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const addStyle = () => {
    const s=document.createElement('style');
    s.textContent=`
      .task-priority{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:800;margin-inline-start:7px}
      .task-priority.high{background:#fff0ef;color:#d65d57}.task-priority.medium{background:#fff6e7;color:#b57a21}.task-priority.low{background:#eaf7f1;color:#27966d}
      .task-detail{font-size:11px;color:var(--muted);margin-top:4px;max-width:560px;white-space:normal}
      .calendar-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:20px 0}
      .calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}
      .calendar-dayname{text-align:center;color:var(--muted);font-size:11px;font-weight:800;padding:8px 2px}
      .calendar-cell{min-height:100px;background:var(--surface);border:1px solid var(--line);border-radius:13px;padding:8px;overflow:hidden}
      .calendar-cell.muted{opacity:.42}.calendar-cell.today{border:2px solid var(--primary);background:var(--soft)}
      .calendar-date{font-size:12px;font-weight:800}.calendar-event{display:block;margin-top:5px;padding:4px 6px;border-radius:7px;background:var(--soft);color:var(--primary);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .note-list{display:grid;gap:9px;max-height:38vh;overflow:auto;margin:12px 0}
      .note-card{border:1px solid var(--line);border-radius:13px;padding:12px;background:var(--bg)}
      .note-card p{white-space:pre-wrap;font-size:12px;color:var(--muted);margin:7px 0}
      .enhanced-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .enhanced-form-grid label{display:block;font-size:12px;font-weight:700;margin:10px 0}
      .enhanced-form-grid input,.enhanced-form-grid select,.enhanced-form-grid textarea,.notes-editor input,.notes-editor textarea{display:block;width:100%;margin-top:6px;border:1px solid var(--line);background:var(--bg);padding:11px;border-radius:11px;color:var(--text);font:inherit}
      .enhanced-form-grid textarea,.notes-editor textarea{min-height:85px;resize:vertical}
      .notes-editor{display:grid;gap:8px}
      @media(max-width:680px){.calendar-cell{min-height:76px;padding:5px}.calendar-event{font-size:9px;padding:3px}.enhanced-form-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  };
  const addCalendar = () => {
    const nav=$('#nav');
    if(!nav || $('[data-page="calendar"]')) return;
    const b=document.createElement('button');b.className='nav-item';b.dataset.page='calendar';b.innerHTML='<span>▦</span> التقويم الدراسي';nav.appendChild(b);
    const page=document.createElement('section');page.className='page';page.id='page-calendar';
    page.innerHTML='<div class="section-head"><div><h2>التقويم الدراسي</h2><p>كل مواعيد مهامك في نظرة واحدة</p></div></div><div class="calendar-toolbar"><button class="secondary-btn" id="calendarPrev">‹ السابق</button><h3 id="calendarMonthLabel"></h3><button class="secondary-btn" id="calendarNext">التالي ›</button></div><div class="calendar-grid" id="calendarGrid"></div>';
    $('.main footer')?.before(page);
    $('#calendarPrev').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar()};
    $('#calendarNext').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar()};
  };
  const renderCalendar = () => {
    const grid=$('#calendarGrid');if(!grid)return;
    const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7;
    $('#calendarMonthLabel').textContent=calendarMonth.toLocaleDateString('ar-EG',{month:'long',year:'numeric'});
    const names=['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'];
    let html=names.map(n=>'<div class="calendar-dayname">'+n+'</div>').join('');
    const start=new Date(y,m,1-offset),today=new Date();today.setHours(0,0,0,0);
    for(let i=0;i<42;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);
      const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
      const events=(typeof tasks!=='undefined'?tasks:[]).filter(t=>t.due_date===key);
      html+='<div class="calendar-cell '+(d.getMonth()!==m?'muted ':'')+(d.getTime()===today.getTime()?'today':'')+'"><span class="calendar-date">'+d.getDate()+'</span>'+events.map(t=>'<span class="calendar-event" title="'+safeText(t.name)+'">'+safeText(t.name)+'</span>').join('')+'</div>';
    }
    grid.innerHTML=html;
  };
  const setupTaskEnhancements = () => {
    const form=$('#taskForm');if(!form || form.dataset.phase4)return;form.dataset.phase4='1';
    const dateLabel=$('#taskDate').closest('label');
    dateLabel.insertAdjacentHTML('afterend','<div class="enhanced-form-grid"><label>الأولوية<select id="taskPriority"><option value="medium">متوسطة</option><option value="high">عالية</option><option value="low">منخفضة</option></select></label><label style="grid-column:1/-1">تفاصيل المهمة<textarea id="taskDetails" maxlength="2000" placeholder="اكتب تفاصيل أو خطوات المهمة..."></textarea></label></div>');
    const originalRender=renderTasks;
    renderTasks=function(){originalRender();document.querySelectorAll('#tasksList .task-row').forEach(row=>{const checkbox=row.querySelector('[data-toggle-task]');if(!checkbox)return;const t=tasks.find(x=>x.id===checkbox.dataset.toggleTask);if(!t)return;const meta=row.querySelector('.task-meta');if(meta){meta.insertAdjacentHTML('beforeend',' <span class="task-priority '+(t.priority||'medium')+'">'+({high:'أولوية عالية',medium:'أولوية متوسطة',low:'أولوية منخفضة'}[t.priority||'medium'])+'</span>');if(t.details)meta.insertAdjacentHTML('afterend','<div class="task-detail">'+safeText(t.details)+'</div>')}const actions=row.querySelector('.task-actions');if(actions&&!actions.querySelector('[data-edit-task]'))actions.insertAdjacentHTML('afterbegin','<button class="small-btn" data-edit-task="'+t.id+'">تعديل</button>')});};
    form.onsubmit=async e=>{
      e.preventDefault();
      const name=$('#taskName').value.trim();if(!name)return;
      const payload={name,subject_id:$('#taskSubject').value||null,due_date:$('#taskDate').value||null,priority:$('#taskPriority').value,details:$('#taskDetails').value.trim()};
      try{
        let result;
        if(editingTaskId) result=await db.from('tasks').update(payload).eq('id',editingTaskId).eq('user_id',user.id);
        else result=await db.from('tasks').insert({...payload,user_id:user.id});
        if(result.error)throw result.error;
        $('#taskDialog').close();form.reset();editingTaskId=null;$('#saveTask').textContent='إضافة المهمة';
        await refresh();toast(editingTaskId?'تم تحديث المهمة':'تم حفظ المهمة');
      }catch(ex){err(ex)}
    };
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-edit-task]');if(!b)return;
      const t=tasks.find(x=>x.id===b.dataset.editTask);if(!t)return;
      editingTaskId=t.id;$('#taskName').value=t.name;$('#taskSubject').value=t.subject_id||'';$('#taskDate').value=t.due_date||'';$('#taskPriority').value=t.priority||'medium';$('#taskDetails').value=t.details||'';
      $('#saveTask').textContent='حفظ التعديلات';$('#taskDialog').showModal();
    });
    $('#addTaskBtn')?.addEventListener('click',()=>{editingTaskId=null;$('#taskForm').reset();$('#saveTask').textContent='إضافة المهمة'});
  };
  const setupNotes = () => {
    const dialog=document.createElement('dialog');dialog.id='notesDialog';
    dialog.innerHTML='<form method="dialog" class="dialog-form"><button class="close-btn" value="cancel">×</button><span class="eyebrow">مساحة المادة</span><h2 id="notesHeading">ملاحظات المادة</h2><div id="notesList" class="note-list"></div><div class="notes-editor"><input id="noteTitle" maxlength="100" placeholder="عنوان الملاحظة"><textarea id="noteContent" maxlength="10000" placeholder="اكتب ملاحظاتك هنا..."></textarea><button class="primary-btn" id="saveNote" type="button">حفظ الملاحظة</button></div><div class="dialog-actions"><button class="secondary-btn" value="cancel">إغلاق</button></div></form>';
    document.body.appendChild(dialog);
    const loadNotes=async()=>{
      const {data,error}=await db.from('subject_notes').select('*').eq('subject_id',notesSubjectId).order('updated_at',{ascending:false});
      if(error)throw error;
      $('#notesList').innerHTML=(data||[]).length?(data||[]).map(n=>'<article class="note-card"><b>'+safeText(n.title)+'</b><p>'+safeText(n.content)+'</p><div class="subject-actions"><button class="small-btn" data-edit-note="'+n.id+'">تعديل</button><button class="small-btn" data-delete-note="'+n.id+'">حذف</button></div></article>').join(''):'<div class="empty-state">لسه مفيش ملاحظات للمادة.</div>';
    };
    const original=renderSubjects;
    renderSubjects=function(){original();document.querySelectorAll('.subject-card').forEach(card=>{const h=card.querySelector('h3');const subject=subjects.find(s=>s.name===h?.textContent);if(!subject)return;const actions=card.querySelector('.subject-actions');if(actions&&!actions.querySelector('[data-notes]'))actions.insertAdjacentHTML('afterbegin','<button class="small-btn" data-notes="'+subject.id+'">📝 الملاحظات</button>')});};
    document.addEventListener('click',async e=>{
      const open=e.target.closest('[data-notes]');
      if(open){notesSubjectId=open.dataset.notes;$('#notesHeading').textContent='ملاحظات '+(subjects.find(s=>s.id===notesSubjectId)?.name||'المادة');$('#noteTitle').value='';$('#noteContent').value='';$('#saveNote').dataset.edit='';try{await loadNotes();dialog.showModal()}catch(ex){err(ex)}}
      const edit=e.target.closest('[data-edit-note]');
      if(edit){const {data,error}=await db.from('subject_notes').select('*').eq('id',edit.dataset.editNote).single();if(error){err(error);return}$('#noteTitle').value=data.title;$('#noteContent').value=data.content;$('#saveNote').dataset.edit=data.id}
      const del=e.target.closest('[data-delete-note]');
      if(del&&confirm('تحذف الملاحظة دي؟')){const {error}=await db.from('subject_notes').delete().eq('id',del.dataset.deleteNote).eq('user_id',user.id);if(error)err(error);else await loadNotes()}
    });
    $('#saveNote').onclick=async()=>{
      const title=$('#noteTitle').value.trim()||'ملاحظة',content=$('#noteContent').value.trim();if(!content){toast('اكتب محتوى الملاحظة الأول');return}
      const id=$('#saveNote').dataset.edit;
      const payload={title,content,updated_at:new Date().toISOString()};
      try{const r=id?await db.from('subject_notes').update(payload).eq('id',id).eq('user_id',user.id):await db.from('subject_notes').insert({...payload,subject_id:notesSubjectId,user_id:user.id});if(r.error)throw r.error;$('#noteTitle').value='';$('#noteContent').value='';$('#saveNote').dataset.edit='';await loadNotes();toast('اتحفظت الملاحظة')}catch(ex){err(ex)}
    };
  };
  const boot=()=>{
    addStyle();addCalendar();setupTaskEnhancements();setupNotes();
    const oldGo=go;go=function(page){oldGo(page);if(page==='calendar')renderCalendar()};
    const oldRefresh=refresh;refresh=async function(){await oldRefresh();renderCalendar()};
    const originalAdd=$('#addTaskBtn');originalAdd?.addEventListener('click',()=>{editingTaskId=null;$('#taskForm').reset();$('#saveTask').textContent='إضافة المهمة'});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();