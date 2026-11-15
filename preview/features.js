/* UniMate Phase 3 — AI assistant, reminders, analytics and mobile navigation */
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
  const getData = () => ({subjects: (typeof subjects!=='undefined'?subjects:[]), tasks: (typeof tasks!=='undefined'?tasks:[]), attendance: (typeof attendance!=='undefined'?attendance:[]), files: (typeof files!=='undefined'?files:[])});
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
  const checkDueNotifications = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const owner = typeof user !== 'undefined' && user?.id ? user.id : 'guest';
    const today = new Date(); today.setHours(0,0,0,0);
    getData().tasks.filter(t => !t.is_done && t.due_date).forEach(task => {
      const due = new Date(task.due_date + 'T00:00:00');
      const days = Math.round((due - today) / 86400000);
      if (days > 1) return;
      const key = 'unimate_notice_' + owner + '_' + task.id + '_' + task.due_date;
      if (localStorage.getItem(key)) return;
      const detail = days < 0 ? 'المهمة متأخرة عن موعدها.' : days === 0 ? 'موعد المهمة النهارده.' : 'موعد المهمة بكرة.';
      new Notification('UniMate — تذكير بالمهمة', { body: task.name + ' · ' + detail, tag: key });
      localStorage.setItem(key, '1');
    });
  };
  const refreshPages = () => {
    const a=$('#analyticsCards'), r=$('#remindersList');
    if(a) a.innerHTML=statsHtml();
    if(r) r.innerHTML=remindersHtml();
    fillFiles();
    checkDueNotifications();
  };
  let fillFiles = () => {};
  const run = () => {
    addNav('analytics','الإحصائيات','▥');
    addNav('reminders','التنبيهات','♧');
    addNav('more','المزيد','☰');
    addPage('analytics','<div class="section-head"><div><h2>ملخص تقدمك 📊</h2><p>تابع إنجاز مهامك والتزامك بالحضور.</p></div></div><div id="analyticsCards" class="subject-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px"></div>');
    addPage('reminders','<div class="section-head"><div><h2>تنبيهات المواعيد 🔔</h2><p>المهام المتأخرة والقريبة من موعدها.</p></div><button id="enableUniMateNotifications" class="secondary-btn">تفعيل إشعارات المتصفح</button></div><div id="remindersList" class="task-list"></div><p class="note">تظهر التنبيهات داخل التطبيق، ويمكن للمتصفح عرض إشعار أثناء فتح UniMate. لا توجد إشعارات خلفية عند إغلاق التطبيق.</p>');
    addPage('more',`
      <div class="section-head"><div><h2>كل أدواتك في مكان واحد ✨</h2><p>اختار القسم اللي عايز تفتحه.</p></div></div>
      <div class="unimate-more-grid">
        <button class="unimate-more-card" data-open-page="attendance"><span>◷</span><b>الحضور والغياب</b><small>سجّل حضورك وتابع غيابك</small></button>
        <button class="unimate-more-card" data-open-page="assistant"><span>✦</span><b>المساعد الذكي</b><small>اسأل واستعن بملفات موادك</small></button>
        <button class="unimate-more-card" data-open-page="analytics"><span>▥</span><b>الإحصائيات</b><small>شوف تقدمك وإنجازك</small></button>
        <button class="unimate-more-card" data-open-page="reminders"><span>♧</span><b>التنبيهات</b><small>تابع مواعيد مهامك</small></button>
        <button class="unimate-more-card" data-open-page="calendar"><span>▦</span><b>التقويم الدراسي</b><small>شوف مواعيد مهامك على التقويم</small></button>
      </div>`);
    refreshPages();

    // Keep the mobile "More" tab selected while viewing any secondary section.
    const originalGo = go;
    go = function(pageName) {
      originalGo(pageName);
      const secondary = ['attendance','assistant','analytics','reminders','profile'];
      document.querySelectorAll('.nav-item').forEach(b => {
        if (b.dataset.page === 'more') b.classList.toggle('active', secondary.includes(pageName) || pageName === 'more');
      });
      if(pageName==='more') $('#pageTitle').textContent='المزيد';
      if(pageName==='analytics') $('#pageTitle').textContent='الإحصائيات';
      if(pageName==='reminders') $('#pageTitle').textContent='التنبيهات';
      refreshPages();
    };

    document.addEventListener('click', e => {
      const target=e.target.closest('[data-open-page]');
      if(target){ go(target.dataset.openPage); return; }
      if(e.target.closest('#enableUniMateNotifications')){
        if(!('Notification' in window)){ alert('المتصفح لا يدعم الإشعارات.'); return; }
        Notification.requestPermission().then(p=>{ if(p==='granted'){ new Notification('UniMate',{body:'تم تفعيل تذكيرات المهام أثناء استخدام التطبيق.'}); checkDueNotifications(); } });
      }
    });

    const originalRender=typeof renderAll==='function'?renderAll:null;
    if(typeof originalRender==='function' && !originalRender.__phase3){
      const wrapped=function(){ const v=originalRender.apply(this,arguments); refreshPages(); return v; };
      wrapped.__phase3=true; renderAll=wrapped;
    }
    const form=$('#chatForm'), input=$('#chatInput'), messages=$('#chatMessages');
    if(form && input && messages){
      const history=[];
      const fileLabel=document.createElement('label');
      fileLabel.style.cssText='display:block;margin:10px 0;font-size:.9rem';
      fileLabel.innerHTML='إرفاق ملف من موادك (اختياري) <select id="aiStudyFile" style="display:block;width:100%;margin-top:6px;padding:10px;border-radius:10px"><option value="">بدون ملف</option></select>';
      form.before(fileLabel);
      fillFiles=()=>{
        const sel=$('#aiStudyFile'); if(!sel)return;
        const selected=sel.value; sel.innerHTML='<option value="">بدون ملف</option>';
        getData().files.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.file_name;sel.appendChild(o)});
        sel.value=selected;
      };
      fillFiles();
      form.onsubmit=async e=>{
        e.preventDefault();
        const message=input.value.trim(); if(!message)return;
        const userBubble=document.createElement('div');userBubble.className='bubble user';userBubble.textContent=message;messages.appendChild(userBubble);
        input.value=''; const wait=document.createElement('div');wait.className='bubble bot';wait.textContent='بفكر في سؤالك…';messages.appendChild(wait);messages.scrollTop=messages.scrollHeight;
        try{
          const d=getData(), chosen=d.files.find(f=>f.id===$('#aiStudyFile')?.value);
          const body={message,history};
          if(chosen){
            const {data,error}=await db.storage.from('unimate-files').createSignedUrl(chosen.storage_path,300);
            if(error)throw error;
            body.file={url:data.signedUrl,mime_type:chosen.mime_type,file_name:chosen.file_name};
          }
          const {data,error}=await db.functions.invoke('unimate-ai',{body});
          if(error)throw error;
          if(data?.error)throw new Error(data.error);
          const answer=data?.answer||'لم يصل رد من المساعد.';
          wait.textContent=answer; history.push({role:'user',content:message},{role:'assistant',content:answer});
        }catch(err){wait.textContent='حصلت مشكلة: '+(err.message||'تعذر الاتصال بالمساعد.');}
        messages.scrollTop=messages.scrollHeight;
      };
    }
    if (!window.__unimateReminderTimer) window.__unimateReminderTimer = window.setInterval(checkDueNotifications, 15 * 60 * 1000);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();