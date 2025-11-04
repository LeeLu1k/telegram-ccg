import { skins } from './skins.js';
import { getUser, saveUser } from './user.js';

const screens = {
  home: document.getElementById('screen-home'),
  skins: document.getElementById('screen-skins'),
  shop: document.getElementById('screen-shop'),
  battle: document.getElementById('screen-battle')
};

let player = getUser();

// переключение экранов
function showScreen(name) {
  for (const key in screens) {
    screens[key].classList.toggle('hidden', key !== name);
  }
}

// обновление баланса
function updateBalance() {
  document.querySelector('#balance').textContent = `💰 ${player.balance}`;
}

// обновление героя
function updateHero() {
  const hero = skins.find(s => s.id === player.selectedSkin);
  document.querySelector('#hero-img').src = hero.image;
  document.querySelector('#hero-info').textContent = `${hero.name} • HP: ${hero.hp} • Урон: ${hero.attack}`;
}

// построить список скинов
function renderSkins() {
  const container = document.getElementById('skins-list');
  container.innerHTML = '';
  skins.forEach(skin => {
    const owned = player.ownedSkins.includes(skin.id);
    const selected = player.selectedSkin === skin.id;
    const div = document.createElement('div');
    div.className = `glass p-2 rounded-xl ${selected ? 'ring-2 ring-cyan-400' : ''}`;
    div.innerHTML = `
      <img src="${skin.image}" class="w-20 h-20 mx-auto" />
      <p class="text-sm font-semibold">${skin.name}</p>
      <p class="text-xs text-gray-400">${owned ? '✅ Куплен' : `💰 ${skin.price}`}</p>
      <button class="bg-cyan-500 text-white px-2 py-1 rounded mt-1">${owned ? (selected ? 'Выбран' : 'Выбрать') : 'Купить'}</button>
    `;
    div.querySelector('button').onclick = () => {
      if (owned) {
        player.selectedSkin = skin.id;
        saveUser(player);
        renderSkins();
        updateHero();
      } else {
        if (player.balance >= skin.price) {
          player.balance -= skin.price;
          player.ownedSkins.push(skin.id);
          saveUser(player);
          renderSkins();
          updateBalance();
        } else {
          alert('Недостаточно средств 💸');
        }
      }
    };
    container.appendChild(div);
  });
}

// построить магазин (можно потом объединить)
function renderShop() {
  const container = document.getElementById('shop-list');
  container.innerHTML = '';
  skins.forEach(skin => {
    if (player.ownedSkins.includes(skin.id)) return;
    const div = document.createElement('div');
    div.className = 'glass p-2 rounded-xl';
    div.innerHTML = `
      <img src="${skin.image}" class="w-20 h-20 mx-auto" />
      <p class="font-semibold">${skin.name}</p>
      <p class="text-sm text-gray-400">${skin.price} 💰</p>
      <button class="bg-green-500 text-white px-3 py-1 rounded mt-1">Купить</button>
    `;
    div.querySelector('button').onclick = () => {
      if (player.balance >= skin.price) {
        player.balance -= skin.price;
        player.ownedSkins.push(skin.id);
        saveUser(player);
        renderShop();
        updateBalance();
      } else {
        alert('Недостаточно 💰');
      }
    };
    container.appendChild(div);
  });
}

// навигация
document.getElementById('btn-skins').onclick = () => { showScreen('skins'); renderSkins(); };
document.getElementById('btn-shop').onclick = () => { showScreen('shop'); renderShop(); };
document.getElementById('btn-home').onclick = () => { showScreen('home'); updateHero(); };

// init
updateHero();
updateBalance();
showScreen('home');
