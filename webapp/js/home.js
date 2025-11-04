function refreshHomeScreen() {
  const rankImg = getRankImage(user.level);
  const selectedSkin = skins.find(s => s.id === user.selectedSkin) || skins[0];
  const xpProgress = Math.min(100, (user.xp / (user.level * 200)) * 100);

  homeScreen.innerHTML = `
    <div class="relative min-h-screen bg-gradient-to-b from-[#7B5FFF] to-[#00C9FF] flex flex-col items-center justify-between text-white font-sans overflow-hidden">

      <!-- Верхняя панель -->
      <div class="flex justify-between items-center w-full px-6 pt-4">
        <div class="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <img src="img/icons/coin.png" class="w-5 h-5" />
          <span>${user.balance}</span>
        </div>
        <div class="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <img src="img/icons/gem.png" class="w-5 h-5" />
          <span>${user.gems ?? 0}</span>
        </div>
      </div>

      <!-- Полоса уровня -->
      <div class="flex flex-col items-center mt-2">
        <div class="text-sm text-white/90">Уровень ${user.level}</div>
        <div class="w-40 bg-white/30 rounded-full h-3 mt-1">
          <div class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width:${xpProgress}%"></div>
        </div>
        <p class="text-xs text-white/80 mt-1">${user.xp} / ${user.level * 200} XP</p>
      </div>

      <!-- Центральный персонаж -->
      <div class="flex flex-col items-center mt-6 animate-fadeIn">
        <img src="${selectedSkin.image}" class="w-44 h-44 drop-shadow-lg" />
        <h2 class="text-xl font-bold mt-2">${selectedSkin.name}</h2>
        <p class="text-white/80 text-sm">❤️ ${selectedSkin.hp} • ⚔️ ${selectedSkin.attack}</p>
      </div>

      <!-- Кнопка В бой -->
      <div class="mb-8 flex flex-col items-center gap-4">
        <button id="startBattle" class="bg-yellow-400 text-black font-bold text-xl px-16 py-4 rounded-2xl shadow-lg hover:scale-105 transition">🎮 В бой!</button>

        <div class="flex gap-4 text-sm">
          <button class="bg-blue-600/40 px-4 py-2 rounded-xl">🏠 Дом</button>
          <button class="bg-blue-600/40 px-4 py-2 rounded-xl">🧍 Герои</button>
          <button class="bg-blue-600/40 px-4 py-2 rounded-xl">🛒 Магазин</button>
          <button class="bg-blue-600/40 px-4 py-2 rounded-xl">🎯 Миссии</button>
        </div>
      </div>
    </div>
  `;

  // Кнопка "В бой"
  document.getElementById("startBattle").addEventListener("click", startBattle);
}
