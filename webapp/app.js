/* app.js — общий JS: Telegram init, профиль игрока, gold, heroes, shop, nav */
(function(){
  const tg = window.Telegram?.WebApp;
  window.tg = tg;

  // ======= CONFIG =======
  const START_GOLD = 100;
  const STARTER_HERO = { id: genId(), name: '⚔️ Рыцарь', skin: 'default', lvl: 1, atk: 3, def: 2 };
  const UPGRADE_COST = 100;
  const MAX_LEVEL = 5;

  // shop items
  const SHOP_ITEMS = [
    { key: 'mage', name: '🔥 Маг', price: 150, base: { lvl:1, atk:4, def:1 }, sprite: 'mage' },
    { key: 'archer', name: '🏹 Лучник', price: 120, base: { lvl:1, atk:2, def:2 }, sprite: 'archer' },
    { key: 'tank', name: '🛡️ Танк', price: 200, base: { lvl:1, atk:1, def:5 }, sprite: 'tank' }
  ];
  // ======================

  // helper id generator
  function genId(){ return 'h_' + Math.random().toString(36).slice(2,9); }

  // get user identifier (use tg user id if available to separate players)
  function getUserKeySuffix() {
    try {
      const u = tg?.initDataUnsafe?.user;
      if (u?.id) return String(u.id);
    } catch(e){/*ignore*/}
    // fallback to anonymous
    return 'anon';
  }

  const STORAGE_KEY = 'ccg_profile_' + getUserKeySuffix();

  // profile structure: { name, gold, heroes: [ {id,name,skin,lvl,atk,def} ] }
  function createDefaultProfile() {
    const u = tg?.initDataUnsafe?.user;
    const name = u ? (u.username ? '@' + u.username : (u.first_name || 'Игрок')) : 'Игрок (тест)';
    return {
      name,
      gold: START_GOLD,
      heroes: [ Object.assign({}, STARTER_HERO) ],
      createdAt: Date.now()
    };
  }

  function loadProfile() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const profile = createDefaultProfile();
      saveProfile(profile);
      return profile;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      const profile = createDefaultProfile();
      saveProfile(profile);
      return profile;
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    updateUIAll();
  }

  function getGold() { return loadProfile().gold; }
  function setGold(v) { const p = loadProfile(); p.gold = v; saveProfile(p); }
  function changeGold(delta) { const p = loadProfile(); p.gold = Math.max(0, p.gold + delta); saveProfile(p); }

  function addHeroToProfile(hero) {
    const p = loadProfile();
    p.heroes.push(hero);
    saveProfile(p);
  }

  function upgradeHeroById(id) {
    const p = loadProfile();
    const h = p.heroes.find(x=>x.id === id);
    if (!h) return { ok:false, reason:'nohero' };
    if (h.lvl >= MAX_LEVEL) return { ok:false, reason:'max' };
    if (p.gold < UPGRADE_COST) return { ok:false, reason:'money' };
    p.gold -= UPGRADE_COST;
    h.lvl += 1;
    // simple stat scaling
    h.atk = Math.round(h.atk + Math.max(1, h.lvl * 0.6));
    h.def = Math.round(h.def + Math.max(0, h.lvl * 0.5));
    saveProfile(p);
    return { ok:true, hero:h };
  }

  function buyShopItem(itemKey) {
    const item = SHOP_ITEMS.find(i=>i.key === itemKey);
    if (!item) return { ok:false, reason:'noitem' };
    const p = loadProfile();
    if (p.gold < item.price) return { ok:false, reason:'money' };
    p.gold -= item.price;
    const newHero = {
      id: genId(),
      name: item.name,
      skin: item.sprite,
      lvl: item.base.lvl,
      atk: item.base.atk,
      def: item.base.def
    };
    p.heroes.push(newHero);
    saveProfile(p);
    return { ok:true, hero:newHero };
  }

  // ===== UI helpers exposed to pages =====
  window.getProfile = loadProfile;
  window.saveProfile = saveProfile;
  window.buyShopItem = buyShopItem;
  window.upgradeHeroById = upgradeHeroById;
  window.SHOP_ITEMS = SHOP_ITEMS;
  window.UPGRADE_COST = UPGRADE_COST;
  window.MAX_LEVEL = MAX_LEVEL;

  // Update topbar elements across pages
  function updateUIAll() {
    const p = loadProfile();
    // player name
    document.querySelectorAll('#playerName').forEach(el=>{ if(el) el.textContent = p.name; });
    // gold
    document.querySelectorAll('#gold').forEach(el=>{ if(el) el.textContent = p.gold; });
    // heroes render if there's a container
    if (document.getElementById('heroesList')) renderHeroes();
    if (document.getElementById('deckList')) renderMiniDeck();
    if (document.getElementById('shopList')) renderShop();
  }

  // attach nav buttons with data-href
  window.attachNavButtons = function(){
    document.querySelectorAll('[data-href]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const href = btn.getAttribute('data-href');
        if (!href) return;
        window.location.href = href;
      });
    });
  };

  // Render mini deck on index
  function renderMiniDeck() {
    const deckList = document.getElementById('deckList');
    if (!deckList) return;
    const p = loadProfile();
    deckList.innerHTML = '';
    p.heroes.slice(0,4).forEach(h=>{
      const el = document.createElement('div'); el.className='mini-card';
      el.innerHTML = `<div class="card-sprite" data-id="${h.id}"></div>
                      <div class="card-meta"><div class="cname">${h.name}</div><div class="cstats">ур.${h.lvl}</div></div>`;
      deckList.appendChild(el);
    });
  }

  // ====== HEROES page render ======
  window.renderHeroes = function(){
    const container = document.getElementById('heroesList');
    if(!container) return;
    const p = loadProfile();
    container.innerHTML = '';
    if (p.heroes.length === 0) {
      container.innerHTML = '<div class="mini-card">У тебя ещё нет героев. Купи в магазине или получи подарок.</div>';
      return;
    }
    p.heroes.forEach((h, idx)=>{
      const el = document.createElement('div'); el.className='hero-item';
      el.innerHTML = `
        <div style="width:52px;height:52px;background:#000;border:4px solid #03101b;image-rendering:pixelated"></div>
        <div style="flex:1">
          <div style="font-size:11px">${h.name} <span style="font-size:9px;color:#9fb1c8"> (ур. ${h.lvl})</span></div>
          <div style="font-size:9px;color:#9fb1c8">ATK ${h.atk} • DEF ${h.def}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="pixel-btn upgrade-btn" data-id="${h.id}">🔼 Прокачать</button>
        </div>
      `;
      container.appendChild(el);
    });

    // attach upgrade handlers
    container.querySelectorAll('.upgrade-btn').forEach(btn=>{
      btn.addEventListener('click', async (ev)=>{
        const id = btn.getAttribute('data-id');
        const res = upgradeHeroById(id);
        if (!res.ok) {
          if (res.reason === 'money') return alert(`Недостаточно золота. Стоимость прокачки: ${UPGRADE_COST}`);
          if (res.reason === 'max') return alert('Герой уже максимального уровня.');
          return alert('Ошибка апгрейда.');
        }
        // show small success
        alert('Прокачка успешна! Золото списано.');
        updateUIAll();
      });
    });
  };

  // ====== SHOP render ======
  function renderShop() {
    const container = document.getElementById('shopList');
    if(!container) return;
    container.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const card = document.createElement('div'); card.className = 'mini-card';
      card.innerHTML = `
        <div class="card-sprite"></div>
        <div class="card-meta">
          <div class="cname">${item.name}</div>
          <div class="cstats">Цена: ${item.price} зол.</div>
          <div style="margin-top:6px"><button class="pixel-btn buy-btn" data-key="${item.key}">Купить</button></div>
        </div>
      `;
      container.appendChild(card);
    });
    // buy handlers
    container.querySelectorAll('.buy-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.getAttribute('data-key');
        const res = buyShopItem(key);
        if (!res.ok) {
          if (res.reason === 'money') return alert('Недостаточно золота для покупки.');
          return alert('Ошибка покупки.');
        }
        alert(`Куплено: ${res.hero.name}`);
        updateUIAll();
      });
    });
  }
  window.renderShop = renderShop;

  // ====== Arena drawing util for pages ======
  window.drawArenaCanvas = function(canvasId){
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 40, h = 24;
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    const octx = off.getContext('2d');

    // basic pixel layers
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        if (y < 5) octx.fillStyle = '#79b7ff';
        else if (y < 9) octx.fillStyle = '#a6e6b8';
        else if (y < 17) octx.fillStyle = '#4caf50';
        else octx.fillStyle = '#2f6e2f';
        octx.fillRect(x,y,1,1);
      }
    }
    for(let x=12;x<28;x++){
      for(let y=9;y<13;y++){
        octx.fillStyle = '#3aa0ff';
        octx.fillRect(x,y,1,1);
      }
    }
    // towers
    for(let y=5;y<11;y++){
      octx.fillStyle = '#6b4c2b';
      octx.fillRect(3,y,3,1);
      octx.fillRect(w-6,y,3,1);
    }
    octx.fillStyle = '#ffd54f'; octx.fillRect(4,4,1,1); octx.fillRect(w-5,4,1,1);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(off,0,0,canvas.width,canvas.height);
  };

  window.flashCanvas = function(canvasId){
    const c = document.getElementById(canvasId);
    if (!c) return;
    c.classList.add('flash-anim');
    setTimeout(()=> c.classList.remove('flash-anim'), 350);
  };

  // initialization on page load
  document.addEventListener('DOMContentLoaded', () => {
    // ensure profile exists and give starter hero on first visit (createDefaultProfile does that)
    // (loadProfile already creates default if missing)
    loadProfile();
    initUIElements();
    updateUIAll();
  });

  function initUIElements(){
    attachNavButtons();
    // render shop if present
    renderShop();
    // render heroes
    renderHeroes();
    // mini deck
    renderMiniDeck();
  }
})();
