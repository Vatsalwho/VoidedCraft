(function(){
  const SERVER_HOST = 'play.voidedcraft.club';
  const HERO_IMAGE_CANDIDATES = ['w.png','home-bg.webp','home-bg.png','home-bg.jpg'];
  const statusEl = document.getElementById('status-indicator');
  const playersEl = document.getElementById('players-count');
  const updatedEl = document.getElementById('last-updated');
  const copyBtn = document.getElementById('copy-ip');
  const yearEl = document.getElementById('year');
  const authArea = document.getElementById('auth-area');

  const LS_KEY = 'vc_username';
  function getUsername(){
    try { return localStorage.getItem(LS_KEY) || ''; } catch { return ''; }
  }
  
  // Expose getUsername globally for Tebex checkout
  window.getUsername = getUsername;
  function setUsername(name){
    try { localStorage.setItem(LS_KEY, name); } catch {}
  }
  function clearUsername(){
    try { localStorage.removeItem(LS_KEY); } catch {}
  }
  function sanitizeUsername(raw){
    const trimmed = (raw || '').trim();
    const validRe = /^[A-Za-z0-9_]{3,16}$/;
    return validRe.test(trimmed) ? trimmed : '';
  }
  function renderAuth(){
    if (!authArea) return;
    const current = getUsername();
    if (current){
      authArea.innerHTML = `
        <div class="auth-logged">
          <span class="greet">Hi, <strong>${current}</strong></span>
          <button type="button" class="btn btn-ghost small" id="logout-btn">Logout</button>
        </div>`;
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.addEventListener('click', () => { clearUsername(); renderAuth(); });
    } else {
      authArea.innerHTML = `
        <form id="login-form" class="auth-form" autocomplete="off">
          <input id="username-input" name="username" type="text" inputmode="text" placeholder="Username" aria-label="Username" class="input" required />
          <button type="submit" class="btn btn-secondary small">Log in</button>
        </form>`;
      const form = document.getElementById('login-form');
      if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('username-input');
        const sanitized = sanitizeUsername(input && input.value);
        if (!sanitized){
          alert('Enter a valid username (3-16 letters, numbers, or underscore).');
          if (input) input.focus();
          return;
        }
        setUsername(sanitized);
        renderAuth();
      });
    }
  }

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(SERVER_HOST);
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(()=> copyBtn.textContent = original, 1200);
      } catch (e) {
        alert('Copy failed. IP: ' + SERVER_HOST);
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', renderAuth, { once: true });
  } else {
    renderAuth();
  }

  (async function selectHero(){
    const basePath = './images/';
    const inlineHero = getComputedStyle(document.querySelector('.hero')).getPropertyValue('--hero-image');
    if (inlineHero && inlineHero.trim()) return;
    for (const name of HERO_IMAGE_CANDIDATES){
      try{
        const res = await fetch(`./assets/${basePath}${name}`, { method: 'HEAD' });
        if (res.ok){
          document.documentElement.style.setProperty('--hero-image', `url('./assets/${basePath}${name}')`);
          break;
        }
      }catch(e){ }
    }
  })();

  // --- Store page animations ---
  (function initStoreAnimations(){
    const isStore = document.body && document.body.classList.contains('store-page');
    if (!isStore) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Typing effect for title and subtitle
    const header = document.querySelector('.store-hero-header');
    if (header){
      const titleEl = header.querySelector('.glow-title');
      const subEl = header.querySelector('.subtitle');
      function typeText(el, full, delay = 18, cb){
        if (!el) return cb && cb();
        if (reduceMotion){
          el.textContent = full;
          el.classList.add('typed-in');
          return cb && cb();
        }
        el.textContent = '';
        let i = 0;
        const tick = () => {
          i++;
          el.textContent = full.slice(0, i);
          if (i < full.length){
            setTimeout(tick, delay);
          } else {
            el.classList.add('typed-in');
            cb && cb();
          }
        };
        setTimeout(tick, 180);
      }
      if (titleEl){
        const titleText = titleEl.textContent;
        typeText(titleEl, titleText, 16, () => {
          if (subEl){
            const subText = subEl.textContent;
            typeText(subEl, subText, 12);
          }
        });
      }
    }

    // Reveal cards on load/scroll
    const cards = Array.from(document.querySelectorAll('.tier-card.reveal'));
    if (cards.length){
      if (reduceMotion){
        cards.forEach(c => c.classList.add('show'));
      } else if ('IntersectionObserver' in window){
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting){
              entry.target.classList.add('show');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        cards.forEach(c => io.observe(c));
      } else {
        // Fallback
        cards.forEach(c => c.classList.add('show'));
      }
    }

    // Button click bounce
    const storeButtons = document.querySelectorAll('.store-page .btn');
    storeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (reduceMotion) return;
        btn.classList.remove('is-bouncing');
        // force reflow to restart animation
        // eslint-disable-next-line no-unused-expressions
        void btn.offsetWidth;
        btn.classList.add('is-bouncing');
        setTimeout(() => btn.classList.remove('is-bouncing'), 400);
      });
    });
  })();

  async function fetchStatus(){
    if (!statusEl || !playersEl) return;
    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_HOST}`, { cache: 'no-store' });
      const data = await res.json();
      const online = Boolean(data && data.online);
      statusEl.classList.toggle('online', online);
      statusEl.classList.toggle('offline', !online);
      statusEl.textContent = online ? 'Online' : 'Offline';
      const playersOnline = (data && data.players && data.players.online) || 0;
      const playersMax = (data && data.players && data.players.max) || 0;
      playersEl.textContent = online ? `${playersOnline} / ${playersMax}` : '—';
      const dot = document.querySelector('.status-dot');
      if (dot){
        dot.classList.toggle('online', online);
        dot.classList.toggle('offline', !online);
      }
      const bar = document.getElementById('server-progress');
      const progress = (playersMax > 0) ? Math.min(100, Math.round((playersOnline / playersMax) * 100)) : 0;
      if (bar){
        bar.style.width = `${progress}%`;
        const progressWrap = bar.closest('.progress');
        if (progressWrap){
          progressWrap.setAttribute('aria-valuenow', String(progress));
        }
      }
      if (updatedEl) updatedEl.textContent = new Date().toLocaleTimeString();
    } catch (e) {
      statusEl.classList.remove('online');
      statusEl.classList.add('offline');
      statusEl.textContent = 'Offline';
      playersEl.textContent = '—';
      const dot = document.querySelector('.status-dot');
      if (dot){
        dot.classList.remove('online');
        dot.classList.add('offline');
      }
      const bar = document.getElementById('server-progress');
      if (bar){
        bar.style.width = '0%';
        const progressWrap = bar.closest('.progress');
        if (progressWrap){
          progressWrap.setAttribute('aria-valuenow', '0');
        }
      }
    }
  }

  fetchStatus();
  const intervalId = setInterval(fetchStatus, 30_000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    fetchStatus();
  });

  document.querySelectorAll('[data-item]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.getAttribute('data-item');
      const price = btn.getAttribute('data-price');
      const username = getUsername();
      if (!username){
        alert('Please enter your username to continue.');
        const input = document.getElementById('username-input');
        if (input) input.focus();
        return;
      }
      alert(`This is a static demo. Purchase ${item} for $${price} would proceed for username: ${username}.`);
    });
  });

  document.querySelectorAll('.faq-item .faq-q').forEach((qBtn) => {
    qBtn.addEventListener('click', () => {
      const expanded = qBtn.getAttribute('aria-expanded') === 'true';
      qBtn.setAttribute('aria-expanded', String(!expanded));
      const answer = qBtn.parentElement && qBtn.parentElement.querySelector('.faq-a');
      if (answer){
        if (expanded){
          answer.hidden = true;
        } else {
          answer.hidden = false;
        }
      }
    });
  });

  (function initTilt(){
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const elements = document.querySelectorAll('[data-tilt]');
    const maxTilt = 8;
    const perspective = 800;
    const damp = 18;

    elements.forEach((el) => {
      let rx = 0, ry = 0, rafId = 0;
      const rect = () => el.getBoundingClientRect();

      function animate(){
        el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        rafId = 0;
      }
      function onMove(e){
        const r = rect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = (e.clientX - cx) / (r.width/2);
        const dy = (e.clientY - cy) / (r.height/2);
        ry = Math.max(-1, Math.min(1, dx)) * maxTilt;
        rx = Math.max(-1, Math.min(1, -dy)) * maxTilt;
        if (!rafId) rafId = requestAnimationFrame(animate);
      }
      function onLeave(){
        rx = 0; ry = 0;
        if (!rafId) rafId = requestAnimationFrame(animate);
      }
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('mouseenter', onMove);
    });
  })();

  // (vibe feature removed)
})();