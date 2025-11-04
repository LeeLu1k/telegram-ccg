import { getUser, saveUser } from './user.js';
import { skins } from './skins.js';

const user = getUser();

// элементы DOM
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const balance = document.getElementById('balance');
const homeScreen = document.getElementById('screen-home');

// инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// показать имя
userName.textContent = tg.initDataUnsafe?.user?.first_name || "Гость";
userPhoto.src = tg.initDataUnsafe?.user?.photo_url || skins[0].image;
balance.textContent = user.balance;

// контент главной страницы
const selectedSkin = skins.find(s => s.id === user.selectedSkin);
homeScreen.innerHTML = `
  <div class="text-center">
    <img src="${selectedSkin.image}" class="w-32 h-32 mx-auto rounded-full shadow-lg border-4 border-cyan-400" />
    <h2 class="text-xl font-bold mt-3">${selectedSkin.name}</h2>
    <p class="text-gray-300 text-sm mt-1">HP: ${selectedSkin.hp} ⚔️ ${selectedSkin.attack}</p>
    <button id="startBattle" class="mt-5 bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-xl text-white font-semibold">
      ⚔️ В бой
    </button>
  </div>
`;

// обработчик кнопки боя
document.getElementById('startBattle').addEventListener('click', () => {
  alert('Пока функция боя в разработке!');
});
