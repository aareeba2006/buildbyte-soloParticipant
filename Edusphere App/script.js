const root = document.documentElement;
  const authModeClass = 'auth-mode';
  const AUTH_STATE_KEY = 'edusphereAuthState';
  const USERS_STORAGE_KEY = 'edusphereUsers';
  const PLANS_STORAGE_KEY = 'eduspherePlans';
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const settingsThemeSwitch = document.getElementById('settingsThemeSwitch');
  let dark = false;
  function applyTheme(){
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeIcon.innerHTML = dark ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    settingsThemeSwitch.classList.toggle('on', dark);
  }
  function toggleTheme(e){ dark = !dark; applyTheme(); if(e) spawnRipple(e, themeToggle); }
  themeToggle.addEventListener('click', toggleTheme);
  settingsThemeSwitch.addEventListener('click', ()=> toggleTheme(null));
  applyTheme();

  document.querySelectorAll('.toggle-demo').forEach(sw=> sw.addEventListener('click', ()=> sw.classList.toggle('on')));

  let activeUser = null;
  function getStoredUsers(){
    try { return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function saveStoredUsers(users){ localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); }
  function getUserPlansKey(){ return `${PLANS_STORAGE_KEY}:${(activeUser && activeUser.email ? activeUser.email : 'guest').toLowerCase()}`; }
  function getStoredPlans(){
    try { return JSON.parse(localStorage.getItem(getUserPlansKey()) || '[]'); } catch { return []; }
  }
  function saveStoredPlans(plans){ localStorage.setItem(getUserPlansKey(), JSON.stringify(plans)); }
  function renderPlans(){
    const list = document.getElementById('savedPlansList');
    if (!list) return;
    const plans = getStoredPlans();
    list.innerHTML = '';
    if (!activeUser) {
      const empty = document.createElement('div');
      empty.className = 'mini-card';
      empty.style.background = 'transparent';
      empty.innerHTML = '<p>Log in or create an account to save study plans here.</p>';
      list.appendChild(empty);
      return;
    }
    if (!plans.length){
      const empty = document.createElement('div');
      empty.className = 'mini-card';
      empty.style.background = 'transparent';
      empty.innerHTML = '<p>No saved plans yet. Add one and it will stay here after refresh.</p>';
      list.appendChild(empty);
      return;
    }
    plans.forEach((plan, index)=>{
      const row = document.createElement('div');
      row.className = 'list-row';
      row.style.padding = '8px 0';
      const text = document.createElement('div');
      text.innerHTML = '<strong>Plan ' + (index + 1) + '</strong><span class="meta">' + plan.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ' ') + '</span>';
      const removeBtn = document.createElement('button');
      removeBtn.className = 'pill high';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', ()=>{
        const next = plans.filter((_, idx)=> idx !== index);
        saveStoredPlans(next);
        renderPlans();
      });
      row.appendChild(text);
      row.appendChild(removeBtn);
      list.appendChild(row);
    });
  }
  function showAuthScreen(show){
    hydrateUserProfile();
    document.body.classList.toggle(authModeClass, !show);
    document.querySelectorAll('.page').forEach(page=> page.classList.remove('active'));
    const authPage = document.getElementById('page-auth');
    if (!show){
      if (authPage) authPage.classList.add('active');
      const title = document.getElementById('pageTitle');
      const sub = document.getElementById('pageSub');
      if (title) title.textContent = 'Account Access';
      if (sub) sub.textContent = 'Sign in to sync your progress';
      if (document.querySelector('.content')) document.querySelector('.content').scrollTop = 0;
      return;
    }
    const dashboardPage = document.getElementById('page-dashboard');
    if (dashboardPage) dashboardPage.classList.add('active');
    const firstNav = document.querySelector('.nav-item[data-page="dashboard"]');
    if (firstNav) firstNav.click();
    renderPlans();
  }
  function persistAuth(user){
    activeUser = user;
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify({ name: user.name, email: user.email, password: user.password }));
    hydrateUserProfile();
  }
  function restoreAuth(){
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_STATE_KEY) || 'null');
      if (!saved) return null;
      const users = getStoredUsers();
      const match = users.find(u=>u.email.toLowerCase()===saved.email.toLowerCase() && u.password===saved.password);
      if (!match) return null;
      return match;
    } catch { return null; }
  }
  function getDisplayName(name){
    const raw = (name || 'Student').toString().trim();
    return raw || 'Student';
  }
  function getFirstName(name){
    const full = getDisplayName(name);
    return full.split(/\s+/)[0] || 'Student';
  }
  function hydrateUserProfile(){
    const avatar = document.getElementById('sidebarAvatar');
    const nameEl = document.getElementById('sidebarUserName');
    const smallEl = document.getElementById('sidebarUserMeta');
    const welcomeName = document.getElementById('welcomeName');
    const profileName = document.getElementById('profileName');
    const profileMeta = document.getElementById('profileMeta');
    const resumeName = document.getElementById('resumeBuilderName');
    const portfolioName = document.getElementById('portfolioBuilderName');
    const resumeAvatar = document.getElementById('resumeAvatar');
    const assistantGreeting = document.getElementById('assistantGreeting');
    const leaderboardName = document.getElementById('leaderboardYouName');
    const displayName = activeUser ? getDisplayName(activeUser.name) : 'Student';
    const firstName = activeUser ? getFirstName(activeUser.name) : 'Student';
    const portfolioSlug = (displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) || 'student';
    if (activeUser){
      const initials = displayName.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
      if (avatar) avatar.textContent = initials || 'US';
      if (nameEl) nameEl.textContent = displayName;
      if (smallEl) smallEl.textContent = activeUser.email;
      if (welcomeName) welcomeName.textContent = firstName;
      if (profileName) profileName.textContent = displayName;
      if (profileMeta) profileMeta.textContent = 'B.Tech Computer Science · Semester 5 · GPA 8.7';
      if (resumeName) resumeName.textContent = `${displayName} — Frontend Developer`;
      if (portfolioName) portfolioName.textContent = `${portfolioSlug}.edusphere.dev`;
      if (resumeAvatar) resumeAvatar.textContent = initials || 'SU';
      if (assistantGreeting) assistantGreeting.textContent = `Hi ${firstName} 👋 I can build you a study plan, summarize notes, generate a quiz, or suggest internships. What do you need?`;
      if (leaderboardName) leaderboardName.textContent = `${displayName} (You)`;
    } else {
      if (avatar) avatar.textContent = 'Es';
      if (nameEl) nameEl.textContent = 'Student';
      if (smallEl) smallEl.textContent = 'Guest access';
      if (welcomeName) welcomeName.textContent = 'Student';
      if (profileName) profileName.textContent = 'Student';
      if (profileMeta) profileMeta.textContent = 'B.Tech Computer Science · Semester 5 · GPA 8.7';
      if (resumeName) resumeName.textContent = 'Student — Frontend Developer';
      if (portfolioName) portfolioName.textContent = 'student.edusphere.dev';
      if (resumeAvatar) resumeAvatar.textContent = 'SU';
      if (assistantGreeting) assistantGreeting.textContent = 'Hi there 👋 I can build you a study plan, summarize notes, generate a quiz, or suggest internships. What do you need?';
      if (leaderboardName) leaderboardName.textContent = 'Student (You)';
    }
  }

  function spawnRipple(e, el){
    const rect = el.getBoundingClientRect();
    const r = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    r.className = 'ripple';
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    el.style.position = el.style.position || 'relative';
    el.appendChild(r);
    setTimeout(()=> r.remove(), 550);
  }
  document.querySelectorAll('.icon-btn, .btn').forEach(el=> el.addEventListener('click', (e)=> spawnRipple(e, el)));

  /* ---------- Sidebar navigation / router ---------- */
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      navItems.forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-page');
      pages.forEach(p=> p.classList.remove('active'));
      const targetPage = document.getElementById('page-' + target);
      if (targetPage){ targetPage.classList.add('active'); targetPage.classList.add('fade-in'); }
      const [t, s] = btn.getAttribute('data-title').split('|');
      pageTitle.textContent = t; pageSub.textContent = s;
      document.querySelector('.content').scrollTop = 0;
      window.scrollTo(0,0);
    });
  });

  /* ---------- Tabs (career hub / auth) ---------- */
  document.querySelectorAll('.tabs').forEach(tabGroup=>{
    const btns = tabGroup.querySelectorAll('.tab-btn');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        const container = tabGroup.parentElement;
        container.querySelectorAll(':scope > .tab-panel').forEach(p=> p.classList.remove('active'));
        const panel = document.getElementById(btn.getAttribute('data-tab'));
        if (panel) panel.classList.add('active');
      });
    });
  });

  /* ---------- Toast notifications ---------- */
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  function toast(msg){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 300); }, 2600);
  }

  /* ---------- Category chips (Community Impact report form) — exclusive select ---------- */
  document.querySelectorAll('.category-select .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chip.parentElement.querySelectorAll('.chip').forEach(c=> c.classList.remove('active'));
      chip.classList.add('active');
      toast('Category set to "' + chip.textContent + '"');
    });
  });

  /* ---------- Skill chips — mark as learned ---------- */
  document.querySelectorAll('.skill-select .chip').forEach(chip=>{
    if (chip.classList.contains('done')) return;
    chip.addEventListener('click', ()=>{
      chip.classList.add('done');
      chip.textContent = chip.textContent.trim() + ' ✓';
      toast('Marked "' + chip.textContent.replace(' ✓','') + '" as learned! 🎉');
    });
  });

  /* ---------- Quiz answer options ---------- */
  document.querySelectorAll('.quiz-options .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chip.parentElement.querySelectorAll('.chip').forEach(c=>{ c.classList.remove('active'); c.textContent = c.textContent.replace(' ✓','').replace(' ✗',''); });
      const correct = chip.getAttribute('data-correct') === 'true';
      chip.classList.add('active');
      chip.textContent = chip.textContent + (correct ? ' ✓' : ' ✗');
      toast(correct ? 'Correct! 3NF removes transitive dependency.' : 'Not quite — try again. Hint: think transitive dependency.');
    });
  });

  /* ---------- Generic mini-card interactivity (courses, internships, mentors, events, hospitals...) ---------- */
  document.addEventListener('click', (e)=>{
    const card = e.target.closest('.mini-card');
    if (!card) return;
    if (card.dataset.done){ toast('Already opened — check your Career Hub / Community Hub for updates.'); return; }
    const h4 = card.querySelector('h4');
    const p = card.querySelector('p');
    const tagEl = card.querySelector('.tag');
    const title = h4 ? h4.textContent : 'this item';
    const tagText = tagEl ? tagEl.textContent : '';
    const pText = p ? p.textContent : '';
    let msg = 'Opened "' + title + '"';
    if (/Remote|Hybrid|On-site|Full-time/.test(tagText)) msg = 'Application submitted for "' + title + '" ✓';
    else if (/Merit|Need-based/.test(tagText)) msg = 'Scholarship application started for "' + title + '" ✓';
    else if (/48 hrs|Online/.test(tagText)) msg = 'Registered for "' + title + '" ✓';
    else if (/Environment|Health|NGO/.test(tagText)) msg = 'You\'re registered for "' + title + '" ✓';
    else if (/DSA|Web|AI\/ML/.test(tagText)) msg = 'Opening "' + title + '" in the Learning Center...';
    else if (/km ·/.test(pText)) msg = 'Getting directions to ' + title + '...';
    else if (h4 && /SDE|Scientist/.test(h4.textContent)) msg = 'Connection request sent to ' + title;
    else if (/Needs:/.test(pText)) msg = 'Request to join "' + title + '" sent';
    toast(msg);
    card.dataset.done = '1';
    card.style.transition = 'border-color .3s ease';
    card.style.borderColor = 'var(--success)';
  });

  /* ---------- Pills (Join call, status pills) ---------- */
  document.addEventListener('click', (e)=>{
    const pill = e.target.closest('.pill');
    if (!pill) return;
    e.stopPropagation();
    if (/join call/i.test(pill.textContent)){ pill.textContent = 'In call'; pill.className = 'pill info'; toast('Joined the study group call'); }
    else { toast('Status: ' + pill.textContent); }
  });

  /* ---------- List rows (schedule, deadlines, events, forums, notes, lost & found) ---------- */
  document.addEventListener('click', (e)=>{
    const row = e.target.closest('.list-row');
    if (!row || e.target.closest('.pill')) return;
    const strong = row.querySelector('strong');
    if (!strong) return;
    if (row.classList.contains('contact-row')){
      toast('Calling ' + strong.textContent + '...');
      return;
    }
    toast('Opening "' + strong.textContent + '"');
  });

  /* ---------- Dashboard "more" buttons -> navigate to related section ---------- */
  document.querySelectorAll('.card-more[data-nav]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const target = btn.getAttribute('data-nav');
      const navBtn = document.querySelector('.nav-item[data-page="' + target + '"]');
      if (navBtn) navBtn.click();
    });
  });

  /* ---------- Resume download (real file) ---------- */
  const resumeBtn = document.getElementById('resumeDownloadBtn');
  const resumeCard = document.querySelector('.resume-card');
  const resumeState = document.getElementById('resumeActionState');
  const portfolioBtn = document.getElementById('portfolioViewBtn');
  const portfolioCard = document.querySelector('.portfolio-card');
  const portfolioState = document.getElementById('portfolioActionState');

  function flashAction(card, btn, stateEl, successText, stateCopy, defaultText, defaultState){
    card.classList.add('is-success');
    btn.classList.add('is-success');
    btn.textContent = successText;
    if (stateEl){
      stateEl.textContent = stateCopy;
      stateEl.classList.add('success');
    }
    window.clearTimeout(card._feedbackTimer);
    card._feedbackTimer = window.setTimeout(()=>{
      card.classList.remove('is-success');
      btn.classList.remove('is-success');
      btn.textContent = defaultText;
      if (stateEl){
        stateEl.textContent = defaultState;
        stateEl.classList.remove('success');
      }
    }, 2200);
  }

  if (resumeBtn) resumeBtn.addEventListener('click', ()=>{
    const content = `RIYA ARORA\nFrontend Developer — B.Tech Computer Science, Semester 5\n\nSKILLS\nHTML, CSS, JavaScript, Python, Git\n\nPROJECTS\n- Campus Event App (React) — in progress\n- Portfolio Website — published\n\nEXPERIENCE\n- Volunteer, Campus Sustainability Drive\n\nGPA: 8.7 / 10\nGenerated by EduSphere Resume Builder`;
    const blob = new Blob([content], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Riya_Arora_Resume.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    flashAction(resumeCard, resumeBtn, resumeState, 'Downloaded ✓', 'Resume is ready to share', 'Download PDF', 'Ready to export');
    toast('Resume downloaded ✓');
  });

  /* ---------- Portfolio preview (real generated page) ---------- */
  if (portfolioBtn) portfolioBtn.addEventListener('click', ()=>{
    const html = `<!DOCTYPE html><html><head><title>Riya Arora — Portfolio</title><style>body{font-family:sans-serif;max-width:640px;margin:60px auto;padding:0 20px;color:#111827}h1{font-family:serif}.proj{border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin-bottom:12px}</style></head><body><h1>Riya Arora</h1><p>Frontend Developer · B.Tech CS, Semester 5</p><h3>Projects</h3><div class="proj"><b>Campus Event App</b><p>React-based event discovery app for campus.</p></div><div class="proj"><b>Portfolio Website</b><p>This very page — built with EduSphere.</p></div></body></html>`;
    const blob = new Blob([html], {type:'text/html'});
    const previewUrl = URL.createObjectURL(blob);
    window.open(previewUrl, '_blank');
    setTimeout(()=> URL.revokeObjectURL(previewUrl), 1500);
    flashAction(portfolioCard, portfolioBtn, portfolioState, 'Preview open ✓', 'Portfolio preview launched', 'View portfolio', 'Preview ready');
    toast('Portfolio preview opened');
  });

  /* ---------- Interview prep practice buttons ---------- */
  document.querySelectorAll('.practice-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> toast('Starting ' + btn.getAttribute('data-topic') + ' practice set — good luck!'));
  });

  /* ---------- Backup button ---------- */
  const backupBtn = document.getElementById('backupBtn');
  if (backupBtn) backupBtn.addEventListener('click', ()=> toast('Backup complete — your data is safely saved ✓'));

  /* ---------- SOS button ---------- */
  const sosBtn = document.getElementById('sosBtn');
  if (sosBtn) sosBtn.addEventListener('click', ()=>{
    toast('Alerting your emergency contacts...');
    setTimeout(()=> toast('Contacts notified & live location shared 📍'), 1200);
  });

  /* ---------- Blood donor search filter ---------- */
  const donorSearchBtn = document.querySelector('#page-emergency .form-row .btn-primary');
  if (donorSearchBtn) donorSearchBtn.addEventListener('click', ()=>{
    const groupSel = document.querySelector('#page-emergency .form-select');
    const citySel = document.querySelector('#page-emergency .form-input');
    const group = groupSel ? groupSel.value : '';
    const city = citySel ? citySel.value.trim().toLowerCase() : '';
    const rows = document.querySelectorAll('#page-emergency .data-table tbody tr');
    let visible = 0;
    rows.forEach(r=>{
      const cells = r.querySelectorAll('td');
      const rowGroup = cells[1] ? cells[1].textContent : '';
      const rowCity = cells[2] ? cells[2].textContent.toLowerCase() : '';
      const groupOk = !group || group.includes('Any') || rowGroup === group;
      const cityOk = !city || rowCity.includes(city);
      r.style.display = (groupOk && cityOk) ? '' : 'none';
      if (groupOk && cityOk) visible++;
    });
    toast(visible + ' donor' + (visible===1?'':'s') + ' found');
  });

  /* ---------- Auth: login / signup ---------- */
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', ()=>{
    const email = document.getElementById('loginEmailInput').value.trim().toLowerCase();
    const password = document.getElementById('loginPasswordInput').value;
    const users = getStoredUsers();
    const match = users.find(u=> u.email.toLowerCase() === email && u.password === password);
    if (!match){ toast('No matching account found. Try signing up first.'); return; }
    persistAuth(match);
    hydrateUserProfile();
    showAuthScreen(true);
    toast('Welcome back, ' + match.name.split(' ')[0] + '!');
  });
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) signupBtn.addEventListener('click', ()=>{
    const name = document.getElementById('signupNameInput').value.trim();
    const email = document.getElementById('signupEmailInput').value.trim().toLowerCase();
    const password = document.getElementById('signupPasswordInput').value;
    if (!name || !email || !password){ toast('Please complete all fields before creating an account.'); return; }
    const users = getStoredUsers();
    if (users.some(u=> u.email.toLowerCase() === email)){ toast('That email already has an account. Please log in instead.'); return; }
    const user = { id: Date.now().toString(36), name, email, password };
    users.push(user);
    saveStoredUsers(users);
    persistAuth(user);
    hydrateUserProfile();
    showAuthScreen(true);
    toast('Account created — welcome to EduSphere!');
  });

  /* ---------- Plan saving ---------- */
  const savePlanBtn = document.getElementById('savePlanBtn');
  const clearPlansBtn = document.getElementById('clearPlansBtn');
  const planInput = document.getElementById('planInput');
  if (savePlanBtn && planInput){
    savePlanBtn.addEventListener('click', ()=>{
      const value = planInput.value.trim();
      if (!value){ toast('Enter a study plan before saving it.'); return; }
      if (!activeUser){ toast('Log in first to save plans for your account.'); return; }
      const plans = getStoredPlans();
      plans.push(value);
      saveStoredPlans(plans);
      planInput.value = '';
      renderPlans();
      toast('Study plan saved for this account.');
    });
  }
  if (clearPlansBtn){
    clearPlansBtn.addEventListener('click', ()=>{
      if (!activeUser){ toast('No saved plans to clear.'); return; }
      saveStoredPlans([]);
      renderPlans();
      toast('Saved plans cleared.');
    });
  }

  /* ---------- Log out nav item ---------- */
  const logoutNav = document.querySelector('.nav-item[data-page="auth"]');
  if (logoutNav) logoutNav.addEventListener('click', ()=>{
    localStorage.removeItem(AUTH_STATE_KEY);
    activeUser = null;
    hydrateUserProfile();
    showAuthScreen(false);
    toast('Logged out successfully');
  });

  /* ---------- Flashcard flip ---------- */
  document.querySelectorAll('.fc-inner').forEach(card=>{
    card.addEventListener('click', ()=>{
      const front = card.querySelector('.fc-front');
      const back = card.querySelector('.fc-back');
      const showFront = back.style.display === 'none';
      front.style.display = showFront ? 'none' : 'inline';
      back.style.display = showFront ? 'inline' : 'none';
    });
  });

  /* ---------- Accordion (safety tips) ---------- */
  document.querySelectorAll('.accordion-head').forEach(head=>{
    head.addEventListener('click', ()=> head.parentElement.classList.toggle('open'));
  });

  /* ---------- GPA calculator ---------- */
  const addGpaRowBtn = document.getElementById('addGpaRow');
  const calcGpaBtn = document.getElementById('calcGpaBtn');
  const gpaRows = document.getElementById('gpaRows');
  const gpaResult = document.getElementById('gpaResult');
  if (addGpaRowBtn && gpaRows){
    addGpaRowBtn.addEventListener('click', ()=>{
      const row = document.createElement('div');
      row.className = 'form-row';
      row.style.marginBottom = '10px';
      row.innerHTML = '<input class="form-input gpa-subject" placeholder="Subject"><input class="form-input gpa-credits" type="number" placeholder="Credits"><input class="form-input gpa-grade" type="number" placeholder="Grade (0-10)">';
      gpaRows.appendChild(row);
    });
  }
  if (calcGpaBtn && gpaResult){
    calcGpaBtn.addEventListener('click', ()=>{
      const subjects = document.querySelectorAll('.gpa-subject');
      const credits = document.querySelectorAll('.gpa-credits');
      const grades = document.querySelectorAll('.gpa-grade');
      let totalCredits = 0, totalPoints = 0;
      for (let i=0; i<subjects.length; i++){
        const c = parseFloat(credits[i].value) || 0;
        const g = parseFloat(grades[i].value) || 0;
        totalCredits += c; totalPoints += c*g;
      }
      const gpa = totalCredits ? (totalPoints/totalCredits) : 0;
      gpaResult.textContent = gpa.toFixed(2);
    });
  }

  /* ---------- Editable attendance tracker ---------- */
  const attendanceRows = document.querySelectorAll('#attendanceBody tr');
  function updateAttendanceRow(row){
    const inputs = row.querySelectorAll('.attendance-input');
    const attended = parseFloat(inputs[0]?.value) || 0;
    const missed = parseFloat(inputs[1]?.value) || 0;
    const total = attended + missed;
    const percent = total ? Math.round((attended / total) * 100) : 0;
    const percentEl = row.querySelector('.attendance-percent');
    if (percentEl){
      percentEl.textContent = percent + '%';
      percentEl.classList.toggle('warn', percent < 75);
    }
  }
  attendanceRows.forEach(row=>{
    row.querySelectorAll('.attendance-input').forEach(input=> input.addEventListener('input', ()=> updateAttendanceRow(row)));
    const button = row.querySelector('.update-attendance-btn');
    if (button){
      button.addEventListener('click', ()=>{
        updateAttendanceRow(row);
        const subject = row.getAttribute('data-subject') || 'this subject';
        const original = button.textContent;
        button.textContent = 'Updated ✓';
        button.classList.add('is-success');
        setTimeout(()=>{
          button.textContent = original;
          button.classList.remove('is-success');
        }, 1400);
        toast('Attendance updated for ' + subject);
      });
    }
  });
  attendanceRows.forEach(row=> updateAttendanceRow(row));

  /* ---------- Editable timetable ---------- */
  const timetableData = {
    '09:00': { Mon: 'DS', Tue: 'OS Lab', Wed: 'DBMS', Thu: 'DS', Fri: 'CN' },
    '11:00': { Mon: 'OS', Tue: 'DBMS', Wed: 'CN Lab', Thu: 'OS', Fri: 'DBMS' },
    '14:30': { Mon: 'Elective', Tue: '—', Wed: 'Study Group', Thu: 'Elective', Fri: '—' }
  };
  const timetableBody = document.getElementById('timetableBody');
  const timetableDaySelect = document.getElementById('timetableDaySelect');
  const timetableTimeSelect = document.getElementById('timetableTimeSelect');
  const timetableSubjectInput = document.getElementById('timetableSubjectInput');
  const updateTimetableBtn = document.getElementById('updateTimetableBtn');
  const resetTimetableBtn = document.getElementById('resetTimetableBtn');
  function renderTimetable(){
    if (!timetableBody) return;
    timetableBody.querySelectorAll('tr').forEach(row=>{
      const time = row.getAttribute('data-time');
      Object.keys(timetableData[time] || {}).forEach(day=>{
        const cell = row.querySelector('.timetable-cell[data-day="' + day + '"]');
        if (cell) cell.textContent = timetableData[time][day];
      });
    });
  }
  function selectTimetableCell(day, time){
    if (timetableDaySelect) timetableDaySelect.value = day;
    if (timetableTimeSelect) timetableTimeSelect.value = time;
    if (timetableSubjectInput) timetableSubjectInput.value = timetableData[time][day] === '—' ? '' : timetableData[time][day];
    timetableBody.querySelectorAll('.timetable-cell.active').forEach(cell=> cell.classList.remove('active'));
    const cell = timetableBody.querySelector('tr[data-time="' + time + '"] .timetable-cell[data-day="' + day + '"]');
    if (cell) cell.classList.add('active');
  }
  timetableBody?.querySelectorAll('.timetable-cell').forEach(cell=>{
    cell.addEventListener('click', ()=>{
      const day = cell.getAttribute('data-day');
      const time = cell.closest('tr').getAttribute('data-time');
      selectTimetableCell(day, time);
    });
  });
  if (updateTimetableBtn){
    updateTimetableBtn.addEventListener('click', ()=>{
      const day = timetableDaySelect.value;
      const time = timetableTimeSelect.value;
      const subject = timetableSubjectInput.value.trim() || '—';
      if (!timetableData[time]) return;
      timetableData[time][day] = subject;
      renderTimetable();
      selectTimetableCell(day, time);
      toast('Timetable updated for ' + day + ' at ' + time);
    });
  }
  if (resetTimetableBtn){
    resetTimetableBtn.addEventListener('click', ()=>{
      Object.assign(timetableData, {
        '09:00': { Mon: 'DS', Tue: 'OS Lab', Wed: 'DBMS', Thu: 'DS', Fri: 'CN' },
        '11:00': { Mon: 'OS', Tue: 'DBMS', Wed: 'CN Lab', Thu: 'OS', Fri: 'DBMS' },
        '14:30': { Mon: 'Elective', Tue: '—', Wed: 'Study Group', Thu: 'Elective', Fri: '—' }
      });
      renderTimetable();
      selectTimetableCell('Mon', '09:00');
      toast('Timetable reset to the original weekly plan');
    });
  }
  renderTimetable();
  selectTimetableCell('Mon', '09:00');

  /* ---------- Exam countdowns ---------- */
  function startCountdown(id, dateStr){
    const el = document.getElementById(id);
    if (!el) return;
    function update(){
      const diff = Date.parse(dateStr) - Date.now();
      if (diff <= 0){ el.textContent = 'Started'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      el.textContent = d + 'd ' + h + 'h';
    }
    update();
    setInterval(update, 60000);
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      startCountdown('cd1','2026-07-28T10:00:00');
      startCountdown('cd2','2026-08-02T09:00:00');
      startCountdown('cd3','2026-08-05T13:00:00');
    });
  } else {
    startCountdown('cd1','2026-07-28T10:00:00');
    startCountdown('cd2','2026-08-02T09:00:00');
    startCountdown('cd3','2026-08-05T13:00:00');
  }

  /* ---------- AI assistant (scripted demo replies) ---------- */
  const chatBox = document.getElementById('chatBox');
  function addMsg(text, who){
    if (!chatBox) return;
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    chatBox.appendChild(m);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  function botReplyFor(text){
    const t = text.toLowerCase();
    if (t.includes('study plan')) return "Here's a 5-day plan for DBMS: Day 1-2 Normalization & ER models, Day 3 Transactions & concurrency, Day 4 SQL practice set, Day 5 full revision + mock quiz.";
    if (t.includes('summar')) return "Thermodynamics Unit 3, in short: the Second Law introduces entropy — energy disperses over time, and no process is 100% efficient. Key terms: entropy, reversible vs irreversible process, Carnot engine.";
    if (t.includes('quiz')) return "Quiz ready — 8 MCQs on process scheduling, memory management and deadlocks. Head to Learning Center → AI Quiz Generator to take it.";
    if (t.includes('internship')) return "Based on your skills (JavaScript, Python, Git), you're a strong match for the Frontend Intern role at Nimbus Labs (92%) and the Data Analyst Intern at Civica (85%). Check Career Hub for both.";
    return "Got it — I'll pull that together from your notes and progress. (This is a demo reply; connect a live AI backend to make this fully dynamic.)";
  }
  function sendChat(text){
    if (!text.trim()) return;
    addMsg(text, 'user');
    document.getElementById('chatInput').value = '';
    const typing = document.createElement('div');
    typing.className = 'msg bot typing-dots';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
    setTimeout(()=>{
      typing.remove();
      addMsg(botReplyFor(text), 'bot');
    }, 850);
  }
  const chatSend = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');
  if (chatSend && chatInput){
    chatSend.addEventListener('click', ()=> sendChat(chatInput.value));
    chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendChat(e.target.value); });
  }
  document.querySelectorAll('.chip-prompt').forEach(chip=> chip.addEventListener('click', ()=> sendChat(chip.getAttribute('data-prompt'))));

  /* ---------- AI Quiz generator demo ---------- */
  const quizSourceSelect = document.getElementById('quizSourceSelect');
  const quizTypeSelect = document.getElementById('quizTypeSelect');
  const quizQuestionBody = document.getElementById('quizQuestionBody');
  const quizPreview = document.getElementById('quizPreview');
  const quizTemplates = {
    dbms: {
      mcq: { question: 'Which normal form removes transitive dependency?', options: ['1NF','2NF','3NF','BCNF'], answer: '3NF' },
      truefalse: { question: 'A primary key uniquely identifies each row in a table.', options: ['True','False'], answer: 'True' },
      fillblank: { question: 'The SQL command to remove a table is <span class="quiz-blank">_______</span>.', answer: 'DROP TABLE' },
      short: { question: 'What does ER model stand for?', answer: 'Entity Relationship model' }
    },
    thermo: {
      mcq: { question: 'What does entropy measure in thermodynamics?', options: ['Pressure','Temperature','Disorder','Volume'], answer: 'Disorder' },
      truefalse: { question: 'Heat always flows from cooler to hotter objects.', options: ['True','False'], answer: 'False' },
      fillblank: { question: 'The second law of thermodynamics states that entropy of an isolated system tends to <span class="quiz-blank">_______</span>.', answer: 'increase' },
      short: { question: 'Name one renewable energy source.', answer: 'Solar energy' }
    },
    custom: {
      mcq: { question: 'Which skill is most useful for modern web apps?', options: ['JavaScript','Calligraphy','Skiing','Cooking'], answer: 'JavaScript' },
      truefalse: { question: 'Responsive design improves mobile usability.', options: ['True','False'], answer: 'True' },
      fillblank: { question: 'A good study habit is to review notes <span class="quiz-blank">_______</span> after class.', answer: 'same day' },
      short: { question: 'What is one benefit of active recall?', answer: 'Stronger memory retention' }
    }
  };
  function renderQuizPreview(){
    if (!quizQuestionBody || !quizSourceSelect || !quizTypeSelect) return;
    const source = quizSourceSelect.value;
    const type = quizTypeSelect.value;
    const template = quizTemplates[source] && quizTemplates[source][type] ? quizTemplates[source][type] : quizTemplates.dbms.mcq;
    let html = '';
    if (type === 'mcq') {
      html = '<p style="font-size:13.5px;font-weight:600;margin-bottom:12px">' + template.question + '</p><div class="chip-row quiz-options">' + template.options.map((opt, index)=> '<span class="chip" data-correct="' + (opt===template.answer) + '">' + opt + '</span>').join('') + '</div>';
    } else if (type === 'truefalse') {
      html = '<p style="font-size:13.5px;font-weight:600;margin-bottom:12px">' + template.question + '</p><div class="chip-row quiz-options">' + template.options.map((opt)=> '<span class="chip" data-correct="' + (opt===template.answer) + '">' + opt + '</span>').join('') + '</div>';
    } else if (type === 'fillblank') {
      html = '<p style="font-size:13.5px;font-weight:600;margin-bottom:12px">' + template.question + '</p><div class="quiz-answer-row"><span class="quiz-answer-pill">Answer: ' + template.answer + '</span></div>';
    } else {
      html = '<p style="font-size:13.5px;font-weight:600;margin-bottom:12px">' + template.question + '</p><div class="quiz-answer-row"><span class="quiz-answer-pill">Short response</span></div>';
    }
    quizQuestionBody.innerHTML = html;
    quizQuestionBody.querySelectorAll('.quiz-options .chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        chip.parentElement.querySelectorAll('.chip').forEach(c=> c.classList.remove('active'));
        chip.classList.add('active');
        const correct = chip.getAttribute('data-correct') === 'true';
        toast(correct ? 'Correct! Nice work.' : 'Not quite — try again.');
      });
    });
  }
  if (quizSourceSelect && quizTypeSelect){
    [quizSourceSelect, quizTypeSelect].forEach(el=> el.addEventListener('change', renderQuizPreview));
    renderQuizPreview();
  }
  document.getElementById('genQuizBtn').addEventListener('click', ()=>{
    if (quizPreview) {
      quizPreview.style.transition = 'opacity .2s ease';
      quizPreview.style.opacity = '0.5';
      setTimeout(()=>{
        renderQuizPreview();
        quizPreview.style.opacity = '1';
      }, 220);
    }
  });

  /* ---------- Community impact "submit report" toast-ish feedback ---------- */
  const reportBtn = document.getElementById('reportBtn');
  if (reportBtn){
    reportBtn.addEventListener('click', ()=>{
      const btn = document.getElementById('reportBtn');
      const locationInput = document.querySelector('#page-impact .form-input');
      const descInput = document.querySelector('#page-impact textarea.form-input');
      const activeCategory = document.querySelector('#page-impact .category-select .chip.active');
      const locationText = locationInput ? locationInput.value.trim() : '';
      if (!locationText){ toast('Please add a location before submitting.'); locationInput && locationInput.focus(); return; }
      const list = document.getElementById('recentReportsList');
      if (list){
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = '<div><strong>' + (activeCategory ? activeCategory.textContent : 'Issue') + ' — ' + locationText + '</strong><span class="meta">Reported just now</span></div><span class="pill high">New</span>';
        list.insertBefore(row, list.firstChild);
      }
      const original = btn.textContent;
      btn.textContent = 'Report submitted ✓';
      if (locationInput) locationInput.value = '';
      if (descInput) descInput.value = '';
      toast('Thanks — your report has been logged for review.');
      setTimeout(()=> btn.textContent = original, 2200);
    });
  }

  /* ---------- Count-up numbers ---------- */
  function animateCount(el, target, opts={}){
    const decimals = opts.decimals || 0;
    const suffix = opts.suffix || '';
    const dur = 1200;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (target * eased).toFixed(decimals);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function initDashboard(){
    animateCount(document.getElementById('wsHours'), 3.4, {decimals:1});
    animateCount(document.getElementById('wsGoal'), 76, {suffix:'%'});

    const growthTarget = 91, circumference = 326.7;
    const ring = document.getElementById('growthRing');
    const numEl = document.getElementById('growthNum');
    setTimeout(()=>{ ring.style.strokeDashoffset = circumference - (circumference * growthTarget/100); }, 150);
    animateCount({ set textContent(v){ numEl.innerHTML = v + '<small>/100</small>'; } }, growthTarget, {decimals:0});

    document.querySelectorAll('[data-count]').forEach(el=>{
      const target = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0');
      const suffix = el.getAttribute('data-suffix') || '';
      const span = el.querySelector('span') || el;
      animateCount(span, target, {decimals, suffix});
    });

    document.querySelectorAll('.bar-fill').forEach(el=>{
      const fill = el.getAttribute('data-fill');
      setTimeout(()=>{ el.style.width = fill + '%'; }, 200);
    });

    document.querySelectorAll('.mini-ring-fg').forEach(el=>{
      const pct = parseFloat(el.getAttribute('data-ring'));
      const circ = 219.9;
      setTimeout(()=>{ el.style.strokeDashoffset = circ - (circ * pct/100); }, 200);
    });

    document.querySelectorAll('.bar-col .stick').forEach(el=>{
      const h = el.getAttribute('data-h');
      setTimeout(()=>{ el.style.height = h + '%'; }, 250);
    });
  }

  /* ---------- Skeleton loading simulation (dashboard only) ---------- */
  window.addEventListener('DOMContentLoaded', ()=>{
    activeUser = restoreAuth();
    hydrateUserProfile();
    if (activeUser) {
      showAuthScreen(true);
    } else {
      showAuthScreen(false);
    }
    const grid = document.getElementById('mainGrid');
    const realCards = Array.from(grid.children);
    const skeletons = realCards.map(c=>{
      const sk = document.createElement('div');
      sk.className = 'card ' + (c.classList.contains('c3') ? 'c3' : c.classList.contains('c2') ? 'c2' : 'c3');
      sk.innerHTML = '<div class="skeleton sk-line" style="width:40%"></div><div class="skeleton sk-block"></div>';
      return sk;
    });
    realCards.forEach(c=> c.style.display='none');
    skeletons.forEach(s=> grid.appendChild(s));
    setTimeout(()=>{
      skeletons.forEach(s=> s.remove());
      realCards.forEach((c,i)=>{
        c.style.display = '';
        c.classList.add('fade-in');
        c.style.animationDelay = (i*0.03)+'s';
      });
      initDashboard();
    }, 650);
  });

  /* ---------- Confetti ---------- */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);
  function burstConfetti(x, y){
    const colors = ['#4F46E5','#06B6D4','#FBBF24','#10B981'];
    const particles = Array.from({length: 60}, ()=>({
      x, y, vx:(Math.random()-0.5)*8, vy:(Math.random()*-8)-2, g:0.28,
      size: Math.random()*6+3, color: colors[Math.floor(Math.random()*colors.length)],
      life: 60 + Math.random()*20, rot: Math.random()*Math.PI
    }));
    let frame = 0;
    function loop(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      frame++; let alive = false;
      particles.forEach(p=>{
        if (p.life <= 0) return; alive = true;
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + frame*0.05);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(p.life/80, 0);
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
      });
      if (alive) requestAnimationFrame(loop); else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    loop();
  }
  document.getElementById('goalRingBtn').addEventListener('click', (e)=>{
    burstConfetti(e.clientX, e.clientY);
    toast('4 of 5 goals complete — one more to go! 🎯');
  });
  document.querySelectorAll('.badge:not(.locked)').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const rect = b.getBoundingClientRect();
      burstConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
      const label = b.querySelector('span') ? b.querySelector('span').textContent : 'Badge';
      toast('"' + label + '" — unlocked! Nice work. 🏆');
    });
  });
  document.querySelectorAll('.badge.locked').forEach(b=>{
    b.style.cursor = 'pointer';
    b.addEventListener('click', ()=>{
      const label = b.querySelector('span') ? b.querySelector('span').textContent : 'This badge';
      toast('"' + label + '" is still locked — keep going to unlock it!');
    });
  });