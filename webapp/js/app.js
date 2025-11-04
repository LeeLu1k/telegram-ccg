import { getUser, saveUser } from './user.js';
import { skins } from './skins.js';

const tg = window.Telegram.WebApp;
tg.expand();

// === ЗАГРУЗОЧНЫЙ ЭКРАН ===
function showLoadingScreen() {
  const loader = document.createElement('div');
  loader.id = 'loading-screen';
  loader.className = 'fixed inset-0 flex flex-col items-center justify-center bg-[#0f2027] text-white z-50 transition-opacity';
  loader.innerHTML = `
    <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p class="text-cyan-300 text-lg font-semibold animate-pulse">🔄 Синхронизация профиля...</p>
  `;
  document.body.appendChild(loader);
}
function hideLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.classList.add('opacity-0');
    setTimeout(() => loader.remove(), 500);
  }
}

// === UI элементы ===
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const balance = document.getElementById('balance');
const homeScreen = document.getElementById('screen-home');

// === ПОЛЬЗОВАТЕЛЬ ===
const user = getUser();
userName.textContent = tg.initDataUnsafe?.user?.first_name || "Игрок";
userPhoto.src = tg.initDataUnsafe?.user?.photo_url || skins[0].image;
balance.textContent = user.balance ?? 0;

// === Ранг ===
function getRankImage(level) {
  if (level <= 10) return "img/ranks/bronze.png";
  if (level <= 20) return "img/ranks/silver.png";
  if (level <= 30) return "img/ranks/gold.png";
  if (level <= 40) return "img/ranks/platinum.png";
  if (level <= 50) return "img/ranks/diamond.png";
  return "img/ranks/master.png";
}

// === Главный экран ===
function refreshHomeScreen() {
  const rankImg = getRankImage(user.level);
  const selectedSkin = skins.find(s => s.id === user.selectedSkin) || skins[0];

  homeScreen.innerHTML = `
    <div class="flex flex-col items-center text-center mt-6">
      <img src="${selectedSkin.image}" class="w-28 h-28 rounded-full border-2 border-cyan-400 shadow-lg animate-fadeIn" />
      <h2 class="text-xl font-bold mt-3 text-cyan-300">${selectedSkin.name}</h2>
      <p class="text-gray-300 text-sm mt-1">HP: ${selectedSkin.hp} ⚔️ ${selectedSkin.attack}</p>

      <div class="flex flex-col items-center mt-2">
        <p class="text-gray-400 text-sm">Уровень: ${user.level}</p>
        <img src="${rankImg}" alt="Ранг" class="w-14 h-14 mt-1 rounded-full border border-white/30 shadow-lg" />
      </div>

      <button id="startBattle" class="mt-5 bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 rounded-xl text-white font-semibold hover:scale-105 transition">
        🎮 В бой
      </button>
    </div>
  `;
  balance.textContent = user.balance;
  userPhoto.src = tg.initDataUnsafe?.user?.photo_url || selectedSkin.image;

  document.getElementById('startBattle').addEventListener('click', startBattle);
}

// === Функция боя ===
async function startBattle() {
  homeScreen.innerHTML = `
    <div class="relative flex flex-col items-center justify-center text-center h-full overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-sky-300 via-blue-300 to-blue-500 animate-skyMove"></div>
      <div class="cloud w-32 h-20 top-10 left-[-150px]" style="animation-delay:0s"></div>
      <div class="cloud w-40 h-24 top-40 left-[-200px]" style="animation-delay:10s"></div>
      <div class="cloud w-28 h-18 top-60 left-[-250px]" style="animation-delay:20s"></div>

      <h2 class="text-2xl font-bold text-white drop-shadow-lg mt-4 mb-4">☁️ Небесная Арена</h2>
      <div id="countdown" class="text-4xl font-bold text-white mb-4"></div>

      <div id="arena" class="relative flex justify-between w-full max-w-sm px-6">
        <div id="player" class="relative w-28 text-center z-10">
          <img src="${skins.find(s => s.id === user.selectedSkin)?.image || skins[0].image}" class="w-24 h-24 rounded-full border-2 border-cyan-400 mx-auto transition-transform duration-300" />
          <p id="playerHP" class="text-white text-sm mt-1">❤️ ${skins.find(s => s.id === user.selectedSkin)?.hp || 1000}</p>
        </div>
        <div id="bot" class="relative w-28 text-center z-10">
          <img src="img/skins/bullit.png" class="w-24 h-24 rounded-full border-2 border-rose-400 mx-auto transition-transform duration-300" />
          <p id="botHP" class="text-white text-sm mt-1">❤️ 1000</p>
        </div>
      </div>

      <p id="battleLog" class="text-white text-sm mt-8 h-6"></p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes skyMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-skyMove { background-size: 400% 400%; animation: skyMove 20s ease infinite; }
    .cloud { position: absolute; background: rgba(255,255,255,0.7); border-radius: 50%; filter: blur(10px); animation: floatCloud 40s linear infinite; }
    @keyframes floatCloud { from { transform: translateX(-200px); } to { transform: translateX(120vw); } }
    @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -40px); } }
    .animate-float { animation: floatUp 0.9s ease forwards; }
  `;
  document.head.appendChild(style);

  const playerEl = document.querySelector('#player img');
  const botEl = document.querySelector('#bot img');
  const playerHPEl = document.getElementById('playerHP');
  const botHPEl = document.getElementById('botHP');
  const log = document.getElementById('battleLog');
  const countdownEl = document.getElementById('countdown');

  let player = { hp: skins.find(s => s.id === user.selectedSkin)?.hp || 1000, atk: skins.find(s => s.id === user.selectedSkin)?.attack || 150, def: 80 };
  let bot = { hp: 500, atk: 150, def: 60 };

  // ===== ОТСЧЁТ =====
  for (let i = 3; i > 0; i--) {
    countdownEl.textContent = i;
    await new Promise(r => setTimeout(r, 1000));
  }
  countdownEl.textContent = '⚡ Старт!';
  await new Promise(r => setTimeout(r, 800));
  countdownEl.textContent = '';

  function updateHP() {
    playerHPEl.textContent = `❤️ ${Math.max(0, Math.floor(player.hp))}`;
    botHPEl.textContent = `❤️ ${Math.max(0, Math.floor(bot.hp))}`;
  }
  function showDamage(target, dmg) {
    const dmgEl = document.createElement('div');
    dmgEl.textContent = `-${dmg}`;
    dmgEl.className = "absolute text-red-400 font-bold text-sm opacity-0 animate-float";
    target.parentElement.appendChild(dmgEl);
    dmgEl.style.left = '50%';
    dmgEl.style.transform = 'translateX(-50%)';
    dmgEl.style.top = '0';
    setTimeout(() => dmgEl.remove(), 900);
  }

  async function doAttack(attacker, defender, atkEl, defEl, name) {
    atkEl.style.transform = 'translateX(' + (atkEl === playerEl ? '50px' : '-50px') + ')';
    await new Promise(r => setTimeout(r, 250));
    const dmg = Math.max(1, Math.round(attacker.atk - defender.def / 3));
    defender.hp -= dmg;
    showDamage(defEl, dmg);
    updateHP();
    log.textContent = `${name} нанёс ${dmg} урона`;
    await new Promise(r => setTimeout(r, 400));
    atkEl.style.transform = 'translateX(0)';
    await new Promise(r => setTimeout(r, 300));
  }

  let turn = 0;
  while (player.hp > 0 && bot.hp > 0) {
    if (turn % 2 === 0) await doAttack(player, bot, playerEl, botEl, "Ты");
    else await doAttack(bot, player, botEl, playerEl, "Бот");
    turn++;
  }

  const victory = player.hp > 0;
  log.textContent = victory ? "🏆 Победа!" : "💀 Поражение!";
  updateHP();

  if (victory) {
    const bonusCoins = Math.floor(Math.random() * 10) + 1;
    const bonusLevel = Math.floor(Math.random() * 10) + 1;
    user.balance += bonusCoins;
    user.level += bonusLevel;
    saveUser(user);
    log.innerHTML += `<br>💰 +${bonusCoins} • ⬆️ +${bonusLevel} ур.`;
  }

  setTimeout(() => {
    const btn = document.createElement('button');
    btn.textContent = '⬅️ На главную';
    btn.className = 'mt-6 bg-cyan-500 px-6 py-2 rounded-xl text-white font-semibold shadow-lg';
    btn.onclick = refreshHomeScreen;
    homeScreen.appendChild(btn);
  }, 2500);
}

// === CSS для загрузки ===
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
  @keyframes fadeIn { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }
  .animate-fadeIn { animation: fadeIn .5s ease; }
`;
document.head.appendChild(style);

// === ЗАПУСК ===
showLoadingScreen();
setTimeout(() => {
  hideLoadingScreen();
  refreshHomeScreen();
}, 1500);
