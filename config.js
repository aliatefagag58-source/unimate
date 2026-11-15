// UniMate Phase 2 — account settings, password recovery, bilingual UI and per-user preferences
(() => {
  const $ = (s) => document.querySelector(s);
  const translations = {
    "الرئيسية":"Home","موادي":"Subjects","مهامي":"Tasks","الحضور والغياب":"Attendance","المساعد الذكي":"AI Assistant","حسابي والإعدادات":"My Account & Settings",
    "رفيقك الدراسي":"Your study companion","مساحتك الدراسية":"Your study space","أهلاً بيك!":"Welcome!","أهلاً بيك":"Welcome","خروج":"Log out","تغيير المظهر":"Toggle theme",
    "خلّي يومك الدراسي":"Make your study day","أكثر ترتيبًا وهدوءًا.":"more organized and calm.","كل اللي يخص مذاكرتك في مكان واحد.":"Everything for your studies in one place.",
    "رتّب مهامك":"Organize tasks","نظرة سريعة":"At a glance","ملخص مساحتك الدراسية":"Your study overview","المواد الدراسية":"Subjects","مادة مضافة":"subjects added",
    "المهام المكتملة":"Completed tasks","نسبة الحضور":"Attendance rate","لجميع المواد":"Across all subjects","مهامك القادمة":"Upcoming tasks",
    "خليك سابق بخطوة":"Stay one step ahead","عرض الكل":"View all","مفيش مهام لسه.":"No tasks yet.","موادك الدراسية":"Your subjects",
    "ملفاتك وملاحظاتك في مكان واحد":"Files and notes in one place","أضف موادك عشان تبدأ 📚":"Add subjects to get started 📚",
    "موادي الدراسية":"My subjects","أنشئ مادة واجمع ملفاتها":"Create a subject and collect its files","＋ إضافة مادة":"＋ Add subject",
    "قائمة المهام":"Task list","تابع واجباتك ومواعيد مذاكرتك":"Track assignments and study deadlines","＋ مهمة جديدة":"＋ New task",
    "الكل":"All","غير مكتملة":"Pending","مكتملة":"Completed","سجّل حضورك وتابع التزامك بكل مادة":"Record attendance for each subject",
    "اسأل عن تنظيم المذاكرة أو اطلب شرح فكرة دراسية.":"Ask about study planning or request an explanation.",
    "اكتب سؤالك هنا...":"Type your question...","إرسال ↑":"Send ↑",
    "حسابي والإعدادات":"My Account & Settings","إدارة بيانات حسابك وتفضيلات التطبيق":"Manage your account details and app preferences",
    "البيانات الشخصية":"Personal details","عدّل الاسم الذي يظهر في التطبيق":"Edit the name shown in the app","الاسم الظاهر":"Display name",
    "البريد الإلكتروني":"Email address","حفظ التغييرات":"Save changes","تغيير كلمة المرور":"Change password",
    "استخدم كلمة مرور قوية لا تقل عن 8 أحرف":"Use a strong password with at least 8 characters",
    "كلمة المرور الجديدة":"New password","تأكيد كلمة المرور":"Confirm password","تحديث كلمة المرور":"Update password",
    "تفضيلات التطبيق":"App preferences","اختار اللغة والمظهر المناسبين ليك":"Choose your preferred language and appearance",
    "لغة التطبيق":"App language","المظهر الليلي":"Dark appearance","تبديل المظهر":"Toggle appearance",
    "مساحتك، بطريقتك.":"Your space, your way.","أهلاً بيك في UniMate":"Welcome to UniMate",
    "سجّل دخولك عشان تفتح مساحتك الدراسية من أي جهاز.":"Sign in to access your study space from any device.",
    "إنشاء حساب جديد":"Create account","ليس لديك حساب؟ إنشاء حساب جديد":"No account? Create one",
    "عندك حساب بالفعل؟ تسجيل الدخول":"Already have an account? Sign in","تسجيل الدخول":"Sign in","إنشاء الحساب":"Create account",
    "اسمك":"Your name","6 أحرف على الأقل":"At least 6 characters","نسيت كلمة المرور؟":"Forgot password?",
    "تم حفظ التغييرات":"Changes saved","تم تحديث كلمة المرور":"Password updated",
    "اكتب بريدك الإلكتروني أولًا.":"Enter your email address first.",
    "كلمة المرور وتأكيدها مش متطابقين.":"Passwords do not match.",
    "تم إرسال رابط استعادة كلمة المرور إلى بريدك.":"Password reset link sent to your email.",
    "مفيش مهام هنا حاليًا 🌱":"No tasks here yet 🌱","من غير موعد":"No due date","بدون مادة":"No subject",
    "＋ حضور":"＋ Present","＋ غياب":"＋ Absent","أضف مادة دراسية أولًا عشان تسجل الحضور.":"Add a subject first to record attendance.",
    "لسه مفيش ملفات للمادة.":"No files for this subject yet.","＋ اختر ملفات PDF أو صور":"＋ Choose PDF files or images",
    "الملفات تحفظ في مساحة خاصة بحسابك.":"Files are stored in your private account space.",
    "مادة جديدة":"New subject","أضف مادة دراسية":"Add a subject","اسم المادة":"Subject name","وصف مختصر":"Short description",
    "اختياري":"Optional","إلغاء":"Cancel","حفظ المادة":"Save subject","مهمة جديدة":"New task",
    "إيه اللي محتاج تعمله؟":"What do you need to do?","عنوان المهمة":"Task title","المادة":"Subject",
    "تاريخ التسليم":"Due date","إضافة المهمة":"Add task","ملفات المادة":"Subject files","تم":"Done",
    "فتح":"Open","حذف":"Delete","مساعد UniMate الذكي":"UniMate AI Assistant"
  };
  const pairs = Object.entries(translations).sort((a,b)=>b[0].length-a[0].length);
  let lang = "ar";
  function convert(value) {
    let out = value;
    for (const [ar,en] of pairs) out = out.split(lang === "en" ? ar : en).join(lang === "en" ? en : ar);
    return out;
  }
  function paintLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) if (node.nodeValue.trim()) node.nodeValue = convert(node.nodeValue);
    document.querySelectorAll("input,button,a").forEach(el => {
      ["placeholder","title","aria-label"].forEach(attr => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, convert(el.getAttribute(attr)));
      });
    });
    const langBtn = $("#langBtn");
    if (langBtn) langBtn.textContent = lang === "ar" ? "EN" : "عربي";
    const profileLangBtn = $("#unimateProfileLang");
    if (profileLangBtn) profileLangBtn.textContent = lang === "ar" ? "Switch to English" : "التبديل للعربية";
  }
  function setLanguage(next) {
    lang = next;
    if (typeof user !== "undefined" && user?.id) localStorage.setItem("unimate_lang_" + user.id, lang);
    paintLanguage();
  }
  function setTheme(next) {
    document.body.classList.toggle("dark", next === "dark");
    if (typeof user !== "undefined" && user?.id) localStorage.setItem("unimate_theme_" + user.id, next);
    const b = $("#themeBtn");
    if (b) b.textContent = next === "dark" ? "☀" : "☾";
  }
  function hydrate() {
    if (typeof user === "undefined" || !user) return;
    const name = user.user_metadata?.display_name || "";
    const nameInput = $("#unimateDisplayName");
    const emailInput = $("#unimateEmail");
    if (nameInput) nameInput.value = name;
    if (emailInput) emailInput.value = user.email || "";
    if ($("#profileName")) $("#profileName").textContent = name || "أهلاً بيك!";
    setLanguage(localStorage.getItem("unimate_lang_" + user.id) || "ar");
    setTheme(localStorage.getItem("unimate_theme_" + user.id) || (localStorage.getItem("unimate_dark") === "true" ? "dark" : "light"));
  }
  function addSettingsUI() {
    const nav = $("#nav");
    const main = $(".main");
    if (!nav || !main || $("#page-profile")) return;
    const navButton = document.createElement("button");
    navButton.className = "nav-item";
    navButton.dataset.page = "profile";
    navButton.innerHTML = "<span>⚙</span> حسابي والإعدادات";
    nav.appendChild(navButton);

    const page = document.createElement("section");
    page.className = "page";
    page.id = "page-profile";
    page.innerHTML = `
      <div class="section-head"><div><h2>حسابي والإعدادات</h2><p>إدارة بيانات حسابك وتفضيلات التطبيق</p></div></div>
      <div class="unimate-settings-grid">
        <section class="panel unimate-settings-panel"><h3>البيانات الشخصية</h3><p>عدّل الاسم الذي يظهر في التطبيق</p>
          <form id="unimateProfileForm">
            <label>الاسم الظاهر<input id="unimateDisplayName" maxlength="60" required></label>
            <label>البريد الإلكتروني<input id="unimateEmail" type="email" readonly></label>
            <button class="primary-btn" type="submit">حفظ التغييرات</button>
          </form>
        </section>
        <section class="panel unimate-settings-panel"><h3>تغيير كلمة المرور</h3><p>استخدم كلمة مرور قوية لا تقل عن 8 أحرف</p>
          <form id="unimatePasswordForm">
            <label>كلمة المرور الجديدة<input id="unimateNewPassword" type="password" minlength="8" autocomplete="new-password" required></label>
            <label>تأكيد كلمة المرور<input id="unimateConfirmPassword" type="password" minlength="8" autocomplete="new-password" required></label>
            <button class="primary-btn" type="submit">تحديث كلمة المرور</button>
          </form>
        </section>
        <section class="panel unimate-settings-panel"><h3>تفضيلات التطبيق</h3><p>اختار اللغة والمظهر المناسبين ليك</p>
          <div class="unimate-setting-row"><span>لغة التطبيق</span><button id="unimateProfileLang" class="secondary-btn" type="button">العربية / English</button></div>
          <div class="unimate-setting-row"><span>المظهر الليلي</span><button id="unimateProfileTheme" class="secondary-btn" type="button">تبديل المظهر</button></div>
        </section>
      </div>`;
    const footer = main.querySelector("footer");
    main.insertBefore(page, footer || null);

    const style = document.createElement("style");
    style.textContent = `
      .unimate-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
      .unimate-settings-panel h3{font-size:16px;margin:0 0 4px}
      .unimate-settings-panel>p{font-size:12px;color:var(--muted);margin:0 0 14px}
      .unimate-settings-panel label{display:block;font-size:12px;font-weight:700;margin:12px 0}
      .unimate-settings-panel input{display:block;width:100%;margin-top:7px;border:1px solid var(--line);background:var(--bg);padding:11px 13px;border-radius:10px;color:var(--text)}
      .unimate-settings-panel input[readonly]{opacity:.7}
      .unimate-setting-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid var(--line);font-size:13px}
      @media(max-width:680px){.unimate-settings-grid{grid-template-columns:1fr}.nav-item{width:16.66%}}
    `;
    document.head.appendChild(style);

    const authSwitch = $("#authSwitch");
    if (authSwitch && !$("#unimateResetPassword")) {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.id = "unimateResetPassword";
      reset.className = "link-btn";
      reset.textContent = "نسيت كلمة المرور؟";
      authSwitch.insertAdjacentElement("afterend", reset);
      reset.addEventListener("click", async () => {
        const email = $("#authEmail")?.value.trim();
        if (!email) {
          $("#authMessage").textContent = "اكتب بريدك الإلكتروني أولًا.";
          $("#authEmail")?.focus();
          return;
        }
        try {
          const { error } = await db.auth.resetPasswordForEmail(email, {
            redirectTo: location.origin + location.pathname
          });
          if (error) throw error;
          $("#authMessage").textContent = "تم إرسال رابط استعادة كلمة المرور إلى بريدك.";
        } catch (e) {
          $("#authMessage").textContent = e.message || "تعذر إرسال رابط الاستعادة.";
        }
      });
    }

    $("#unimateProfileForm").addEventListener("submit", async e => {
      e.preventDefault();
      const display_name = $("#unimateDisplayName").value.trim();
      if (!display_name) return;
      try {
        const { data, error } = await db.auth.updateUser({ data: { display_name } });
        if (error) throw error;
        user = data.user;
        $("#profileName").textContent = display_name;
        toast("تم حفظ التغييرات");
      } catch (e) { err(e); }
    });
    $("#unimatePasswordForm").addEventListener("submit", async e => {
      e.preventDefault();
      const password = $("#unimateNewPassword").value;
      const confirm = $("#unimateConfirmPassword").value;
      if (password !== confirm) { toast("كلمة المرور وتأكيدها مش متطابقين."); return; }
      if (password.length < 8) { toast("استخدم كلمة مرور من 8 أحرف على الأقل."); return; }
      try {
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        e.target.reset();
        toast("تم تحديث كلمة المرور");
      } catch (e) { err(e); }
    });
    $("#unimateProfileLang").addEventListener("click", () => setLanguage(lang === "ar" ? "en" : "ar"));
    $("#unimateProfileTheme").addEventListener("click", () => setTheme(document.body.classList.contains("dark") ? "light" : "dark"));

    const originalGo = go;
    go = function(pageName) {
      originalGo(pageName);
      if (pageName === "profile") {
        $("#pageTitle").textContent = "حسابي والإعدادات";
        hydrate();
      }
    };
    $("#themeBtn").onclick = () => setTheme(document.body.classList.contains("dark") ? "light" : "dark");
    $("#langBtn").onclick = () => setLanguage(lang === "ar" ? "en" : "ar");
    hydrate();
  }

  document.addEventListener("DOMContentLoaded", () => {
    addSettingsUI();
    if (typeof user !== "undefined" && user) hydrate();
    db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) { user = session.user; hydrate(); }
      if (event === "PASSWORD_RECOVERY") {
        user = session?.user || user;
        if (typeof go === "function") go("profile");
        toast("غيّر كلمة المرور من صفحة حسابي");
      }
    });
    const observer = new MutationObserver(records => {
      if (lang !== "en") return;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) node.nodeValue = convert(node.nodeValue);
          else if (node.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let textNode;
            while ((textNode = walker.nextNode())) textNode.nodeValue = convert(textNode.nodeValue);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();