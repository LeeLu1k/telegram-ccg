// /webapp/js/main.js
import { initUser } from './utils.js';
import { cards } from './skins.js';

initUser();

const hero = cards[0]; // первый герой — подарок новичку
document.querySelector("#user-photo").src = hero.image;
document.querySelector("h1").textContent = hero.name;
document.querySelector("p").textContent = `${hero.type} • HP: ${hero.hp} • Атака: ${hero.attack}`;
