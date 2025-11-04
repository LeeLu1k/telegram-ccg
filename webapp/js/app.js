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
  // показать процесс боя
  homeScreen.innerHTML = `
    <div class="flex flex-col items-center justify-center text-center h-full">
      <p class="text-2xl font-bold text-cyan-400 animate-pulse">⚔️ Идёт бой...</p>
    </div>
  `;
  
  // имитация боя (рандом победа/поражение)
  await new Promise(r => setTimeout(r, 3000));
  const victory = Math.random() > 0.4; // 60% шанс победить

  if (victory) {
    const bonusCoins = Math.floor(Math.random() * 10) + 1;
    const bonusLevel = Math.floor(Math.random() * 10) + 1;
    user.balance = (user.balance ?? 0) + bonusCoins;
    user.level = (user.level ?? 1) + bonusLevel;
    saveUser(user);

    // экран победы
    homeScreen.innerHTML = `
      <div class="flex flex-col items-center text-center mt-10">
        <p class="text-3xl font-bold text-green-400 mb-2">🏆 Победа!</p>
        <p class="text-gray-300 mb-4">Ты получил <b>+${bonusCoins}</b> 💰 и <b>+${bonusLevel}</b> уровня!</p>
        <button id="backHome" class="bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-xl text-white font-semibold">
          ⬅️ На главную
        </button>
      </div>
    `;
  } else {
    // экран поражения
    homeScreen.innerHTML = `
      <div class="flex flex-col items-center text-center mt-10">
        <p class="text-3xl font-bold text-rose-500 mb-2">💀 Поражение</p>
        <p class="text-gray-400 mb-4">Ты не получил награду.</p>
        <button id="backHome" class="bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-xl text-white font-semibold">
          ⬅️ На главную
        </button>
      </div>
    `;
  }

  // вернуть обратно на главную
  document.getElementById('backHome').addEventListener('click', () => {
    location.reload();
  });
});
