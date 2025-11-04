import { initUser } from './utils.js';
initUser();

const startBtn = document.getElementById("startBattle");
const loadingText = document.getElementById("loadingText");
const fightArea = document.getElementById("fight");
const attackBtn = document.getElementById("attack");
const log = document.getElementById("log");

let player = { hp: 120, dmg: 25, def: 10 };
let bot = { hp: 100, dmg: 20, def: 5 };

startBtn.onclick = async () => {
  startBtn.disabled = true;
  loadingText.textContent = "🔄 Синхронизация...";
  await new Promise(r => setTimeout(r, 1000));

  for (let i = 5; i >= 0; i--) {
    loadingText.textContent = `Старт через ${i}...`;
    await new Promise(r => setTimeout(r, 1000));
  }

  loadingText.textContent = "";
  fightArea.classList.remove("hidden");
  startBtn.remove();
};

attackBtn.onclick = () => {
  const dmgToBot = Math.max(1, player.dmg - bot.def);
  bot.hp -= dmgToBot;
  document.getElementById("bot-hp").textContent = `❤️ ${bot.hp}`;
  if (bot.hp <= 0) return endBattle(true);

  const dmgToPlayer = Math.max(1, bot.dmg - player.def);
  player.hp -= dmgToPlayer;
  document.getElementById("player-hp").textContent = `❤️ ${player.hp}`;
  if (player.hp <= 0) return endBattle(false);

  log.textContent = `Ты нанёс ${dmgToBot}, бот ответил ${dmgToPlayer}`;
};

function endBattle(win) {
  if (win) {
    log.textContent = "🏆 Победа!";
  } else {
    log.textContent = "💀 Поражение!";
  }
  attackBtn.disabled = true;
}
