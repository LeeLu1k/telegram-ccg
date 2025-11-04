// app.js — общий скрипт (Telegram WebApp aware). Place in webapp/.
(() => {
  // --- CONFIG ---
  const START_GOLD = 100;
  const STARTER_HERO = { id: genId(), name: '⚔️ Рыцарь', skin: 'default', lvl:1, atk:3, def:2 };
  const SHOP_ITEMS = [
    { key:'mage', name:'🔥 Маг', price:150, base:{lvl:1,atk:4,def:1} },
    { key:'archer', name:'🏹 Лучник', price:120, base:{lvl:1,atk:2,def:2} },
    { key:'tank', name:'🛡️ Танк', price:200, base:{lvl:1,atk:1,def:5} }
  ];
  const UPGRADE_COST = 100;
  const MAX_LEVEL = 5;

  // Telegram
  const tg = window.Telegram?.WebApp;
  window.tg = tg;

  // helpers
  function genId(){ return 'h_' + Math.random().toString(36).slice(2,9); }
  function getUserSuffix(){
    try { const u = tg?.initDataUnsafe?.user; if (u?.id) return String(u.id); } catch(e){}
    return 'anon';
  }
  const STORAGE_KEY = 'ccg_profile_' + getUserSuffix();

  // profile helpers
  function createDefaultProfile(){
    const u = tg?.initDataUnsafe?.user;
    const name = u ? (u.username ? '@' + u.username : (u.first_name || 'Игрок')) : 'Игрок (тест)';
    return { name, gold: START_GOLD, heroes: [Object.assign({}, STARTER_HERO)], createdAt: Date.now() };
  }

  function loadProfile(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { const p = createDefaultProfile(); saveProfile(p); return p; }
    try { return JSON.parse(raw); } catch(e){ const p = createDefaultProfile(); saveProfile(p); return p; }
  }
  function saveProfile(p){ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); updateUIAll(); }

  // public API used by pages
  window.getProfile = loadProfile;
  window.saveProfile = saveProfile;
  window.SHOP_ITEMS = SHOP_ITEMS;
  window.UPGRADE_COST = UPGRADE_COST;
  window.MAX_LEVEL = MAX_LEVEL;
  window.genId = genId;

  function changeGold(delta){
    const p = loadProfile(); p.gold = Math.max(0, (p.gold||0) + delta); saveProfile(p); return p.gold;
  }

  function addHero(hero){
    const p = loadProfile(); p.heroes.push(hero); saveProfile(p);
  }

  function upgradeHeroById(id){
    const p = loadProfile();
    const h = p.heroes.find(x=>x.id === id);
    if (!h) return { ok:false, reason:'nohero' };
    if (h.lvl >= MAX_LEVEL) return { ok:false, reason:'max' };
    if (p.gold < UPGRADE_COST) return { ok:false, reason:'money' };
    p.gold -= UPGRADE_COST;
    h.lvl += 1;
    // stat growth formula (simple)
    h.atk = Math.round(h.atk + 1 + h.lvl * 0.4);
    h.def = Math.round(h.def + 0.5 + h.lvl * 0.35);
    saveProfile(p);
    return { ok:true, hero:h };
  }

  function buyItem(key){
    const item = SHOP_ITEMS.find(i=>i.key===key);
    if (!item) return { ok:false, reason:'noitem' };
    const p = loadProfile();
    if (p.gold < item.price) return { ok:false, reason:'money' };
    p.gold -= item.price;
    const newHero = { id: genId(), name: item.name, skin: item.key, lvl:item.base.lvl, atk:item.base.atk, def:item.base.def };
    p.heroes.push(newHero);
    saveProfile(p);
    return { ok:true, hero:newHero };
  }

  // expose
  window.buyItem = buyItem;
  window.upgradeHeroById = upgradeHeroById;
  window.addHero = addHero;
  window.changeGold = changeGold;

  // UI functions
  function updateUIAll(){
    const p = loadProfile();
    document.querySelectorAll('#playerName').forEach(e=> e.textContent = p.name);
    document.querySelectorAll('#gold').forEach(e=> e.textContent = p.gold);
    // render heroes and shop where present
    if (document.getElementById('heroesList')) renderHeroes();
    if (document.getElementById('shopList')) renderShop();
    if (document.getElementById('deckList')) renderMiniDeck();
  }
  window.updateUIAll = updateUIAll;

  // navigation
  function attachNavButtons(){
    document.querySelectorAll('[data-href]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const href = btn.getAttribute('data-href');
        if (!href) return;
        window.location.href = href;
      });
    });
  }
  window.attachNavButtons = attachNavButtons;

  // canvas utilities
  window.drawArenaCanvas = function(canvasId){
    const id = canvasId || null;
    if (!id) return;
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // draw stylized arena (not pixel)
    const W = canvas.width, H = canvas.height;
    // sky
    const sky = ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#9fd8ff'); sky.addColorStop(1,'#5fb6ff');
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
    // field
    ctx.fillStyle = '#2ea24a'; ctx.fillRect(0,H*0.35,W,H*0.65);
    // river
    ctx.fillStyle = '#39a6ff'; ctx.fillRect(W*0.36,H*0.45,W*0.28,H*0.14);
    // towers
    ctx.fillStyle = '#6b4c2b'; ctx.fillRect(20,H*0.28,50,60); ctx.fillRect(W-70,H*0.28,50,60);
    // flags
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(38,H*0.22,8,8); ctx.fillRect(W-54,H*0.22,8,8);
  };

  window.flashCanvas = function(canvasId){
    const c = document.getElementById(canvasId);
    if (!c) return;
    c.classList.add('flash-anim');
    setTimeout(()=> c.classList.remove('flash-anim'), 350);
  };

  // render mini deck on index
  function renderMiniDeck(){
    const el = document.getElementById('deckList'); if (!el) return;
    const p = loadProfile(); el.innerHTML = '';
    p.heroes.slice(0,4).forEach(h=>{
      const node = document.createElement('div'); node.className = 'mini-card';
      node.innerHTML = `<div class="card-sprite"></div><div class="card-meta"><div class="cname">${h.name}</div><div class="cstats">ур.${h.lvl}</div></div>`;
      el.appendChild(node);
    });
  }

  // render heroes page
  function renderHeroes(){
    const el = document.getElementById('heroesList'); if (!el) return;
    const p = loadProfile();
    el.innerHTML = '';
    if (!p.heroes || p.heroes.length === 0) { el.innerHTML = '<div class="muted">У тебя ещё нет героев.</div>'; return; }
    p.heroes.forEach(h=>{
      const item = document.createElement('div'); item.className = 'hero-item';
      item.innerHTML = `
        <div class="left">
          <div class="card-sprite" style="width:52px;height:52px;border-radius:8px;background:linear-gradient(135deg,#334;#56f)"></div>
          <div>
            <div style="font-weight:700">${h.name} <small style="color:${h.lvl>=MAX_LEVEL? '#ffd54f':'#98bcd8'}">ур. ${h.lvl}</small></div>
            <div class="muted">ATK ${h.atk} • DEF ${h.def}</div>
          </div>
        </div>
        <div>
          <button class="btn small upgrade" data-id="${h.id}">🔼 ${UPGRADE_COST}</button>
        </div>
      `;
      el.appendChild(item);
    });

    // attach upgrades
    el.querySelectorAll('.upgrade').forEach(btn=>{
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const res = upgradeHeroById(id);
        if (!res.ok) {
          if (res.reason === 'money') return alert(`Недостаточно золота. Стоимость: ${UPGRADE_COST}`);
          if (res.reason === 'max') return alert('Герой уже максимального уровня.');
          return alert('Ошибка прокачки.');
        }
        alert('Прокачка успешна!');
        updateUIAll();
      });
    });
  }
  window.renderHeroes = renderHeroes;

  // render shop
  function renderShop(){
    const el = document.getElementById('shopList'); if (!el) return;
    el.innerHTML = '';
    SHOP_ITEMS.forEach(item=>{
      const card = document.createElement('div'); card.className = 'shop-card';
      card.innerHTML = `
        <div class="card-sprite" style="width:72px;height:72px;border-radius:10px;background:linear-gradient(135deg,#223a6b,#2b8fb0)"></div>
        <div style="text-align:center">
          <div style="font-weight:800;margin-top:6px">${item.name}</div>
          <div class="price">${item.price} зол.</div>
          <div style="margin-top:8px"><button class="btn buy" data-key="${item.key}">Купить</button></div>
        </div>
      `;
      el.appendChild(card);
    });

    el.querySelectorAll('.buy').forEach(btn=>{
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const res = buyItem(key);
        if (!res.ok) {
          if (res.reason === 'money') return alert('Недостаточно золота.');
          return alert('Ошибка покупки.');
        }
        alert(`Куплено: ${res.hero.name}`);
        updateUIAll();
      });
    });
  }
  window.renderShop = renderShop;

  // init on load
  document.addEventListener('DOMContentLoaded', () => {
    // ensure profile exists -> gives starter hero on first visit
    loadProfile();
    // populate UI elements if present
    attachNavButtons();
    updateUIAll();
    // render shop and heroes if pages present
    renderShop();
    renderHeroes();
  });

})();
