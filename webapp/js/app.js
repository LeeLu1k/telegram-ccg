import { getUser, saveUser } from './user.js';
import { skins } from './skins.js';

const tg = window.Telegram.WebApp;
tg.expand();

// ====== ЭЛЕМЕНТЫ ======
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const balance = document.getElementById('balance');
const homeScreen = document.getElementById('screen-home');

// ====== ПОЛЬЗОВАТЕЛЬ ======
const user = getUser();
userName.textContent = tg.initDataUnsafe?.user?.first_name || "Игрок";
userPhoto.src = tg.initDataUnsafe?.user?.photo_url || skins[0].image;
balance.textContent = user.balance ?? 0;

// ====== СКИН ======
const selectedSkin = skins.find(s => s.id === user.selectedSkin) || skins[0];

// ====== ГЛАВНЫЙ ЭКРАН ======
homeScreen.innerHTML = `
  <div class="flex flex-col items-center text-center mt-6">
    <img src="${selectedSkin.image}" class="w-28 h-28 rounded-full border-2 border-cyan-400 shadow-lg" />
    <h2 class="text-xl font-bold mt-3 text-cyan-300">${selectedSkin.name}</h2>
    <p class="text-gray-300 text-sm mt-1">HP: ${selectedSkin.hp} ⚔️ ${selectedSkin.attack}</p>
    <p class="text-gray-400 text-sm mt-1">Уровень: ${user.level}</p>
    <button id="startBattle" class="mt-5 bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 rounded-xl text-white font-semibold hover:scale-105 transition">
      🎮 В бой
    </button>
  </div>
`;

// ====== КНОПКА "В БОЙ" ======
document.getElementById('startBattle').addEventListener('click', async () => {
  // экран боя
  homeScreen.innerHTML = `
    <div class="flex flex-col items-center justify-center text-center mt-4">
      <h2 class="text-2xl font-bold text-cyan-300 mb-2">⚔️ 1 на 1 Битва!</h2>
      <div id="arena" class="relative flex justify-between w-full max-w-sm px-6 mt-6">
        <div id="player" class="relative w-28 text-center">
          <img src="${selectedSkin.image}" class="w-24 h-24 rounded-full border-2 border-cyan-400 mx-auto transition-transform duration-300" />
          <p id="playerHP" class="text-gray-200 text-sm mt-1">❤️ ${selectedSkin.hp}</p>
        </div>
        <div id="bot" class="relative w-28 text-center">
          <img src="img/skins/bullit.png" class="w-24 h-24 rounded-full border-2 border-rose-400 mx-auto transition-transform duration-300" />
          <p id="botHP" class="text-gray-200 text-sm mt-1">❤️ 1000</p>
        </div>
      </div>
      <p id="battleLog" class="text-gray-300 text-sm mt-6 h-5"></p>
    </div>
  `;

  const playerEl = document.querySelector('#player img');
  const botEl = document.querySelector('#bot img');
  const playerHPEl = document.getElementById('playerHP');
  const botHPEl = document.getElementById('botHP');
  const log = document.getElementById('battleLog');

  // начальные характеристики
  let player = { hp: selectedSkin.hp, atk: selectedSkin.attack, def: 80 };
  let bot = { hp: 1000, atk: 150, def: 60 };
  let turn = 0;

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

  // добавить CSS анимацию
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% { opacity:1; transform:translate(-50%, 0); }
      100% { opacity:0; transform:translate(-50%, -40px); }
    }
    .animate-float { animation: floatUp 0.9s ease forwards; }
  `;
  document.head.appendChild(style);

  async function doAttack(attacker, defender, atkEl, defEl, name) {
    // движение вперёд
    atkEl.style.transform = 'translateX(' + (atkEl === playerEl ? '50px' : '-50px') + ')';
    await new Promise(r => setTimeout(r, 200));
    // урон
    const dmg = Math.max(1, Math.round(attacker.atk - defender.def / 3));
    defender.hp -= dmg;
    showDamage(defEl, dmg);
    updateHP();
    log.textContent = `${name} нанёс ${dmg} урона`;
    await new Promise(r => setTimeout(r, 300));
    // назад
    atkEl.style.transform = 'translateX(0)';
    await new Promise(r => setTimeout(r, 300));
  }

  // бой по очереди
  while (player.hp > 0 && bot.hp > 0) {
    if (turn % 2 === 0) {
      await doAttack(player, bot, playerEl, botEl, "Ты");
    } else {
      await doAttack(bot, player, botEl, playerEl, "Бот");
    }
    turn++;
  }

  const victory = player.hp > 0;
  log.textContent = victory ? "🏆 Победа!" : "💀 Поражение!";
  updateHP();

  // если победа — награда
  if (victory) {
    const bonusCoins = Math.floor(Math.random() * 10) + 1;
    const bonusLevel = Math.floor(Math.random() * 10) + 1;
    user.balance += bonusCoins;
    user.level += bonusLevel;
    saveUser(user);

    log.innerHTML += `<br>💰 +${bonusCoins} • ⬆️ +${bonusLevel} ур.`;
  }

  // вернуться домой
  setTimeout(() => {
    const btn = document.createElement('button');
    btn.textContent = '⬅️ На главную';
    btn.className = 'mt-6 bg-cyan-500 px-6 py-2 rounded-xl text-white font-semibold';
    btn.onclick = () => location.reload();
    homeScreen.appendChild(btn);
  }, 2000);
});

