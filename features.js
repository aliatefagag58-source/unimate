/* UniMate Phase 3 — AI assistant, reminders and analytics */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const addNav = (page, label, icon) => {
    if (document.querySelector('[data-page="'+page+'"]')) return;
    const b = document.createElement('button');
    b.className = 'nav-item'; b.dataset.page = page;
    b.innerHTML = '<span>'+icon+'</span> '+label;
    $('#nav')?.appendChild(b);
  };
  const addPage = (id, html) => {
    if ($('#page-'+id)) return;
    const section = document.createElement('section');
    section.className = 'page'; section.id = 'page-'+id; section.innerHTML = html;
    document.querySelector('.main footer')?.before(section);
  };
  const getData = () => ({subjects: window.subjects || [], tasks: window.tasks || [], attendance: window.attendance || [], files: window.files || []});
  const statsHtml = () => {
    const d=getData(), total=d.tasks.length, done=d.tasks.filter(x=>x.is_done).length;
    const present=d.attendance.filter(x=>x.status==='present').length;
    const attendance=d.attendance.length ? Math.round(present/d.attendance.length*100) : 0;
    const cards=[
      ['إنجاز المهام', total ? Math.round(done/total*100)+'%' : '—', done+' من '+total+' مهام'],
      ['نسبة الحضور', d.attendance.length ? attendance+'%' : '—', d.attendance.length+' سجل حضور وغياب'],
      ['المهام المفتوحة', d.tasks.filter(x=>!x.is_done).length, 'مهام لم تكتمل بعد'],
      ['المواد والملفات', d.subjects.length+' / '+d.files.length, 'مادة / ملف']
    ];
    return cards.map(c=>'<article class="subject-card"><h3>'+c[0]+'</h3><div style="font-size:1.8rem;font-weight:800;margin:12px 0">'+c[1]+'</div><p>'+c[2]+'</p></article>').join('');
  };
  const remindersHtml = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tasks=getData().tasks.filter(t=>!t.is_done && t.due_date).map(t=>({...t, days:Math.round((new Date(t.due_date+'T00:00:00')-today)/86400000)})).filter(t=>t.days<=3).sort((a,b)=>a.days-b.days);
    if(!tasks.length) return '<div class="empty-state">مفيش مهام مستحقة خلال الأيام القريبة. ممتاز! 🌱</div>';
    return tasks.map(t=>'<article class="task-row"><div><b>'+esc(t.name)+'</b><div class="task-meta">'+(t.days<0?'متأخرة '+Math.abs(t.days)+' يوم':t.days===0?'موعدها النهارده':t.days===1?'موعدها بكرة':'بعد '+t.days+' أيام')+'</div></div></article>').join('');
  };
  const refreshPages = () => {
    const a=$('#analyticsCards'), r=$('#remindersList');
    if(a) a.innerHTML=statsHtml();
    if(r) r.innerHTML=remindersHtml();
  };
  const run = () => {
    addNav('analytics','الإحصائيات','▥');
    addNav('reminders','التنبيهات','♧');
    addPage('analytics','<div class="section-head"><div><h2>ملخص تقدمك 📊</h2><p>تابع إنجاز مهامك والتزامك بالحضور.</p></div></div><div id="analyticsCards" class="subject-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px"></div>');
    addPage('reminders','<div class="section-head"><div><h2>تنبيهات المواعيد 🔔</h2><p>المهام المتأخرة والقريبة من موعدها.</p></div><button id="enableUniMateNotifications" class="secondary-btn">تفعيل إشعارات المتصفح</button></div><div id="remindersList" class="task-list"></div><p class="note">تظهر التنبيهات داخل التطبيق، ويمكن للمتصفح عرض إشعار أثناء فتح UniMate. لا توجد إشعارات خلفية عند إغلاق التطبيق.</p>');
    refreshPages();
    document.addEventListener('click', e => {
      const nav=e.target.closest('[data-page]');
      if(nav && ['analytics','reminders'].includes(nav.dataset.page)){
        if(typeof window.go==='function') window.go(nav.dataset.page);
        else {
          document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+nav.dataset.page));
          document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b===nav));
        }
        $('#pageTitle').textContent=nav.dataset.page==='analytics'?'الإحصائيات':'التنبيهات';
        refreshPages();
      }
      if(e.target.closest('#enableUniMateNotifications')){
        if(!('Notification' in window)){ alert('المتصفح لا يدعم الإشعارات.'); return; }
        Notification.requestPermission().then(p=>{ if(p==='granted') new Notification('UniMate',{body:'تم تفعيل إشعارات التذكير أثناء استخدام التطبيق.'}); });
      }
    });
    const originalRender=window.renderAll;
    if(typeof originalRender==='function' && !originalRender.__phase3){
      const wrapped=function(){ const v=originalRender.apply(this,arguments); refreshPages(); return v; };
      wrapped.__phase3=true; window.renderAll=wrapped;
    }
    const form=$('#chatForm'), input=$('#chatInput'), messages=$('#chatMessages');
    if(form && input && messages){
      const history=[];
      const fileLabel=document.createElement('label');
      fileLabel.style.cssText='display:block;margin:10px 0;font-size:.9rem';
      fileLabel.innerHTML='إرفاق ملف من موادك (اختياري) <select id="aiStudyFile" style="display:block;width:100%;margin-top:6px;padding:10px;border-radius:10px"><option value="">بدون ملف</option></select>';
      form.before(fileLabel);
      const fillFiles=()=>{
        const sel=$('#aiStudyFile'); if(!sel)return;
        const selected=sel.value; sel.innerHTML='<option value="">بدون ملف</option>';
        getData().files.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.file_name;sel.appendChild(o)});
        sel.value=selected;
      };
      fillFiles();
      const originalSubmit=form.onsubmit;
      form.onsubmit=async e=>{
        e.preventDefault();
        const message=input.value.trim(); if(!message)return;
        const userBubble=document.createElement('div');userBubble.className='bubble user';userBubble.textContent=message;messages.appendChild(userBubble);
        input.value=''; const wait=document.createElement('div');wait.className='bubble bot';wait.textContent='بفكر في سؤالك…';messages.appendChild(wait);messages.scrollTop=messages.scrollHeight;
        try{
          const d=getData(), chosen=d.files.find(f=>f.id===$('#aiStudyFile')?.value);
          const body={message,history};
          if(chosen){
            const {data,error}=await window.db.storage.from('unimate-files').createSignedUrl(chosen.storage_path,300);
            if(error)throw error;
            body.file={url:data.signedUrl,mime_type:chosen.mime_type,file_name:chosen.file_name};
          }
          const {data,error}=await window.db.functions.invoke('unimate-ai',{body});
          if(error)throw error;
          if(data?.error)throw new Error(data.error);
          const answer=data?.answer||'لم يصل رد من المساعد.';
          wait.textContent=answer; history.push({role:'user',content:message},{role:'assistant',content:answer});
        }catch(err){wait.textContent='حصلت مشكلة: '+(err.message||'تعذر الاتصال بالمساعد.');}
        messages.scrollTop=messages.scrollHeight;
      };
      if(typeof originalSubmit==='function') form.dataset.previousHandler='replaced';
    }
    setInterval(refreshPages,5000);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();