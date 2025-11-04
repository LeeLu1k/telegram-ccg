/* app.js — общий JS: Telegram init, gold, heroes, helpers, nav */
(function(){
  // Telegram WebApp
  const tg = window.Telegram?.WebApp;
  window.tg = tg;

  // username
  function initPlayerName() {
    const el = document.getElementById('playerName');
    let name = 'Игрок';
    if (tg) {
      tg.expand();
      const u = tg.initDataUnsafe?.user;
      if (u) name = u.username ? '@' + u.username : (u.first_name || 'Игрок');
    } else {
      name = 'Игрок (тест)';
    }
    if (el) el.textContent = name;
  }

  // gold logic
  function getGold() {
    return parseInt(localStorage.getItem('gold') || '100', 10);
  }
  function setGold(v) {
    localStorage.setItem('gold', String(v));
    updateGoldUI();
  }
  function updateGold(delta) {
    let g = getGold();
    g = Math.max(0, g + delta);
    setGold(g);
    flashGold();
  }
  function updateGoldUI() {
    const els = document.querySelectorAll('#gold');
    els.forEach(e => e.textContent = getGold());
  }
  function flashGold(){
    const el = document.querySelector('#gold');
    if (!el) return;
    el.classList.add('flash');
    setTimeout(()=>el.classList.remove('flash'), 450);
  }

  // heroes storage
  function getHeroes(){
    try {
      return JSON.parse(localStorage.getItem('heroes') || '[]');
    } catch(e){ return [];}
  }
  function addHero(h){
    const arr = getHeroes();
    arr.push(h);
    localStorage.setItem('heroes', JSON.stringify(arr));
  }

  // render heroes (used on heroes page)
  window.renderHeroes = function(){
    const container = document.getElementById('heroesList');
    if(!container) return;
    const heroes = getHeroes();
    container.innerHTML = '';
    if (heroes.length === 0) {
      container.innerHTML = '<div class="mini-card">У тебя ещё нет героев. Добавь.</div>';
      return;
    }
    heroes.forEach((h, idx) => {
      const el = document.createElement('div');
      el.className = 'hero-item';
      el.innerHTML = `<div style="width:44px;height:44px;background:#000;border:4px solid #03101b;image-rendering:pixelated"></div>
                      <div style="flex:1"><div style="font-size:11px">${h.name} (ур. ${h.lvl})</div><div style="font-size:9px;color:#9fb1c8">ATK ${h.atk} • DEF ${h.def}</div></div>
                      <div><button class="pixel-btn" data-idx="${idx}">Прокачать</button></div>`;
      container.appendChild(el);
    });
    // attach upgrade handlers
    container.querySelectorAll('button[data-idx]').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        const i = Number(btn.getAttribute('data-idx'));
        const heroes = getHeroes();
        if (!heroes[i]) return;
        // cost
        const cost = 50;
        if (getGold() < cost) {
          alert('Недостаточно золота для прокачки (50).');
          return;
        }
        heroes[i].lvl = (heroes[i].lvl || 1) + 1;
        heroes[i].atk = (heroes[i].atk || 1) + Math.ceil(Math.random()*2);
        heroes[i].def = (heroes[i].def || 1) + Math.ceil(Math.random()*2);
        localStorage.setItem('heroes', JSON.stringify(heroes));
        updateGold(-cost);
        renderHeroes();
      });
    });
  };

  // navigation helper: buttons with data-href
  window.attachNavButtons = function(){
    document.querySelectorAll('[data-href]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const href = btn.getAttribute('data-href');
        if (!href) return;
        window.location.href = href;
      });
    });
  };

  // draw arena canvas pixel-art
  window.drawArenaCanvas = function(canvasId){
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 40, h = 24;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const octx = off.getContext('2d');

    // background
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        if (y < 5) octx.fillStyle = '#79b7ff';
        else if (y < 9) octx.fillStyle = '#a6e6b8';
        else if (y < 17) octx.fillStyle = '#4caf50';
        else octx.fillStyle = '#2f6e2f';
        octx.fillRect(x,y,1,1);
      }
    }
    // river
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
    // flags
    octx.fillStyle = '#ffd54f'; octx.fillRect(4,4,1,1); octx.fillRect(w-5,4,1,1);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(off,0,0,canvas.width,canvas.height);
  };

  // canvas flash
  window.flashCanvas = function(canvasId){
    const c = document.getElementById(canvasId);
    if (!c) return;
    c.classList.add('flash-anim');
    setTimeout(()=> c.classList.remove('flash-anim'), 350);
  };

  // expose some methods globally
  window.initPlayerName = initPlayerName;
  window.getGold = getGold;
  window.updateGold = updateGold;
  window.updateGoldUI = updateGoldUI;
  window.addHero = addHero;
  window.attachNavButtons = attachNavButtons;

  // initialize UI elements present on page
  document.addEventListener('DOMContentLoaded', () => {
    initPlayerName();
    updateGoldUI();
  });
})();
